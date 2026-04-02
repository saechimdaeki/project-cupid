"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CANDIDATE_PHOTOS_BUCKET = "sogaeting";
const MAX_TOTAL_UPLOAD_BYTES = 45 * 1024 * 1024;
const MAX_SINGLE_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1800;
const MIN_COMPRESSION_TARGET_BYTES = 1.5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type UploadedPreviewItem = {
  id: string;
  path: string;
  url: string;
  name: string;
  size: number;
  sizeText: string;
  helperText: string;
};

type ProcessedFile = {
  file: File;
  helperText: string;
};

type PhotoUploadFieldProps = {
  storageFolderId: string;
  inputName?: string;
};

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function safeFileName(fileName: string) {
  const trimmed = fileName.trim().toLowerCase();
  const dotIndex = trimmed.lastIndexOf(".");
  const base = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed;
  const ext = dotIndex >= 0 ? trimmed.slice(dotIndex) : "";

  const normalizedBase =
    base
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "photo";

  const normalizedExt = ext.replace(/[^.a-z0-9]/g, "");

  return `${normalizedBase}${normalizedExt || ".jpg"}`;
}

async function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 읽지 못했습니다."));
    };

    image.src = objectUrl;
  });
}

async function optimizeImageFile(file: File) {
  const canOptimize =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp";

  if (!canOptimize || file.size <= MIN_COMPRESSION_TARGET_BYTES) {
    return {
      file,
      helperText: `${formatBytes(file.size)} · 원본 유지`,
    };
  }

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return {
        file,
        helperText: `${formatBytes(file.size)} · 원본 유지`,
      };
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const optimizedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.82);
    });

    if (!optimizedBlob || optimizedBlob.size >= file.size) {
      return {
        file,
        helperText: `${formatBytes(file.size)} · 원본 유지`,
      };
    }

    const optimizedName = file.name.replace(/\.[^.]+$/, "") || "photo";
    const optimizedFile = new File([optimizedBlob], `${optimizedName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });

    return {
      file: optimizedFile,
      helperText: `${formatBytes(file.size)} -> ${formatBytes(optimizedFile.size)}`,
    };
  } catch {
    return {
      file,
      helperText: `${formatBytes(file.size)} · 원본 유지`,
    };
  }
}

function isMobileUploadFallback() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export function PhotoUploadField({
  storageFolderId,
  inputName = "uploadedPhotoPaths",
}: PhotoUploadFieldProps) {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<UploadedPreviewItem[]>([]);
  const [message, setMessage] = useState(
    "여러 장을 첨부하면 첫 사진이 대표 사진이 됩니다.",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [nativeMode, setNativeMode] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  async function removeUploadedPhoto(indexToRemove: number) {
    const item = previews[indexToRemove];

    if (!item) {
      return;
    }

    setIsUploading(true);

    try {
      await supabase.storage.from(CANDIDATE_PHOTOS_BUCKET).remove([item.path]);
      setPreviews((current) => {
        const next = current.filter((_, index) => index !== indexToRemove);
        URL.revokeObjectURL(item.url);
        return next;
      });
      setMessage(
        previews.length - 1
          ? "사진 구성을 업데이트했습니다."
          : "여러 장을 첨부하면 첫 사진이 대표 사진이 됩니다.",
      );
    } catch {
      setMessage("사진 제거에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (!selectedFiles.length) {
      return;
    }

    setIsUploading(true);

    try {
      const useNativeMode = nativeMode || isMobileUploadFallback();

      if (useNativeMode && !nativeMode) {
        setNativeMode(true);
      }

      for (const file of selectedFiles) {
        if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
          throw new Error("JPG, PNG, WEBP, HEIC, HEIF 형식만 업로드할 수 있습니다.");
        }

        if (file.size > MAX_SINGLE_UPLOAD_BYTES) {
          throw new Error("사진 한 장은 10MB 이하만 업로드할 수 있습니다.");
        }
      }

      const processedFiles: ProcessedFile[] = useNativeMode
        ? selectedFiles.map((file) => ({
            file,
            helperText: `${formatBytes(file.size)} · 원본 유지`,
          }))
        : await Promise.all(selectedFiles.map(optimizeImageFile));

      const totalBytes = previews.reduce((sum, item) => sum + item.size, 0) +
        processedFiles.reduce((sum, item) => sum + item.file.size, 0);

      if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
        throw new Error("사진 총 용량은 45MB 이하로 맞춰주세요.");
      }

      const uploadedItems: UploadedPreviewItem[] = [];

      try {
        for (const [index, item] of processedFiles.entries()) {
          const path = `${storageFolderId}/${Date.now()}-${previews.length + index}-${safeFileName(item.file.name)}`;
          const { error } = await supabase.storage
            .from(CANDIDATE_PHOTOS_BUCKET)
            .upload(path, item.file, {
              contentType: item.file.type || "application/octet-stream",
              upsert: false,
            });

          if (error) {
            throw new Error(error.message);
          }

          uploadedItems.push({
            id: path,
            path,
            url: URL.createObjectURL(item.file),
            name: item.file.name,
            size: item.file.size,
            sizeText: formatBytes(item.file.size),
            helperText:
              previews.length + index === 0
                ? `${item.helperText} · 대표 사진`
                : item.helperText,
          });
        }
      } catch (error) {
        if (uploadedItems.length) {
          await supabase.storage
            .from(CANDIDATE_PHOTOS_BUCKET)
            .remove(uploadedItems.map((item) => item.path));
          uploadedItems.forEach((item) => URL.revokeObjectURL(item.url));
        }
        throw error;
      }

      setPreviews((current) => [...current, ...uploadedItems]);

      if (nativeMode || useNativeMode) {
        setMessage(`모바일 원본 업로드 완료 · 총 ${previews.length + uploadedItems.length}장`);
      } else if (processedFiles.some((item) => item.file.type === "image/webp")) {
        setMessage(`자동 최적화 후 업로드 완료 · 총 ${previews.length + uploadedItems.length}장`);
      } else {
        setMessage(`업로드 완료 · 총 ${previews.length + uploadedItems.length}장`);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "사진 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <label className="grid cursor-pointer gap-2 rounded-[26px] border border-dashed border-[#dcb79e] bg-gradient-to-br from-[#fffaf7] to-[#fff3eb] p-5 transition hover:border-[#c98a6b]">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#7b626a]">
          <span>사진 첨부</span>
          <span className="inline-flex items-center rounded-full bg-[#f7f0eb] px-2 py-0.5 text-[11px] font-semibold text-[#8b6a63]">
            [선택]
          </span>
        </span>
        <span className="text-sm leading-7 text-[#8b6a63]">
          선택 사항입니다. 사진은 브라우저에서 바로 안전하게 업로드됩니다. 모바일에서는 원본 업로드를 우선 사용합니다.
        </span>
        <span className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-white px-4 text-sm font-semibold text-[#7b6049] sm:w-fit">
          사진 선택하기
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      <input type="hidden" name="photoUploadState" value={isUploading ? "uploading" : "ready"} />
      {previews.map((preview) => (
        <input key={preview.id} type="hidden" name={inputName} value={preview.path} />
      ))}

      <div className="flex flex-col gap-2 rounded-[22px] border border-[#ead8cf] bg-white/88 px-4 py-3 text-sm text-[#6d5961] sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        {isUploading ? <span className="font-semibold text-[#b46d59]">사진 업로드 중...</span> : null}
      </div>

      {previews.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {previews.map((preview, index) => (
            <article
              key={preview.id}
              className="overflow-hidden rounded-[24px] border border-[#ead8cf] bg-white shadow-[0_14px_32px_rgba(143,95,89,0.08)]"
            >
              <div
                className="aspect-[4/5] bg-[#fff5ef] bg-cover bg-center"
                style={{ backgroundImage: `url(${preview.url})` }}
              />
              <div className="grid gap-3 p-4">
                <div>
                  <strong className="block break-all text-sm font-semibold text-[#24161c]">
                    {preview.name}
                  </strong>
                  <span className="mt-2 block text-xs leading-6 text-[#8b6a63]">
                    {index === 0 ? `${preview.helperText} · 대표 사진` : preview.helperText}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#b46d59]">{preview.sizeText}</span>
                  <button
                    className="inline-flex min-h-9 items-center rounded-full border border-[#ead8cf] bg-white px-3 text-xs font-semibold text-[#5e4850] disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      void removeUploadedPhoto(index);
                    }}
                  >
                    제거
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
