"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

const MAX_TOTAL_UPLOAD_BYTES = 45 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1800;
const MIN_COMPRESSION_TARGET_BYTES = 1.5 * 1024 * 1024;

type PreviewItem = {
  id: string;
  url: string;
  name: string;
  sizeText: string;
  helperText: string;
};

type ProcessedFile = {
  file: File;
  helperText: string;
};

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
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

function buildNativeProcessedFiles(files: File[]): ProcessedFile[] {
  return files.map((file) => ({
    file,
    helperText: `${formatBytes(file.size)} · 원본 유지`,
  }));
}

function isMobileUploadFallback() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

function buildPreviewItems(items: ProcessedFile[]) {
  return items.map((item, index) => ({
    id: `${item.file.name}-${item.file.size}-${index}`,
    url: URL.createObjectURL(item.file),
    name: item.file.name,
    sizeText: formatBytes(item.file.size),
    helperText: index === 0 ? `${item.helperText} · 대표 사진` : item.helperText,
  }));
}

function canAssignFilesToInput(input: HTMLInputElement | null, files: File[]) {
  if (!input || typeof DataTransfer === "undefined") {
    return false;
  }

  try {
    const nextDataTransfer = new DataTransfer();

    files.forEach((file) => nextDataTransfer.items.add(file));
    input.files = nextDataTransfer.files;

    return input.files?.length === files.length;
  } catch {
    return false;
  }
}

export function PhotoUploadField() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [message, setMessage] = useState(
    "여러 장을 첨부하면 첫 사진이 대표 사진이 됩니다.",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [nativeMode, setNativeMode] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function updatePreviewState(processed: ProcessedFile[]) {
    setPreviews((current) => {
      current.forEach((preview) => URL.revokeObjectURL(preview.url));

      return buildPreviewItems(processed);
    });
  }

  function updateMessage(processed: ProcessedFile[], usedNativeMode: boolean) {
    const totalBytes = processed.reduce((sum, item) => sum + item.file.size, 0);

    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      setMessage(
        `압축 후에도 총 용량이 ${formatBytes(totalBytes)}입니다. 45MB 이하로 줄이려면 사진 수를 조금 줄여주세요.`,
      );
    } else if (usedNativeMode) {
      setMessage(`모바일에서는 원본 그대로 업로드됩니다 · 총 ${formatBytes(totalBytes)} 예정`);
    } else if (processed.some((item) => item.file.type === "image/webp")) {
      setMessage(`자동 최적화 완료 · 총 ${formatBytes(totalBytes)} 업로드 예정`);
    } else {
      setMessage(`총 ${formatBytes(totalBytes)} 업로드 예정`);
    }
  }

  async function syncFiles(files: File[]) {
    const useNativeMode = nativeMode || isMobileUploadFallback();

    if (useNativeMode && !nativeMode) {
      setNativeMode(true);
    }

    let processed = useNativeMode
      ? buildNativeProcessedFiles(files)
      : await Promise.all(files.map(optimizeImageFile));
    let usedNativeMode = useNativeMode;

    if (!usedNativeMode) {
      const assigned = canAssignFilesToInput(
        inputRef.current,
        processed.map((item) => item.file),
      );

      if (!assigned) {
        setNativeMode(true);
        processed = buildNativeProcessedFiles(files);
        usedNativeMode = true;
      }
    }

    updateMessage(processed, usedNativeMode);
    updatePreviewState(processed);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    setIsProcessing(true);

    try {
      await syncFiles(selectedFiles);
    } finally {
      setIsProcessing(false);
    }
  }

  async function removeFile(indexToRemove: number) {
    if (nativeMode) {
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setPreviews((current) => {
        current.forEach((preview) => URL.revokeObjectURL(preview.url));
        return [];
      });
      setMessage("모바일에서는 개별 제거 대신 사진을 다시 선택해 주세요.");
      return;
    }

    const nextFiles = Array.from(inputRef.current?.files ?? []).filter(
      (_, index) => index !== indexToRemove,
    );

    setIsProcessing(true);

    try {
      await syncFiles(nextFiles);

      if (!nextFiles.length) {
        setMessage("여러 장을 첨부하면 첫 사진이 대표 사진이 됩니다.");
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid gap-4">
      <label className="grid cursor-pointer gap-2 rounded-[26px] border border-dashed border-[#dcb79e] bg-gradient-to-br from-[#fffaf7] to-[#fff3eb] p-5 transition hover:border-[#c98a6b]">
        <span className="text-sm font-semibold text-[#7b626a]">사진 첨부</span>
        <span className="text-sm leading-7 text-[#8b6a63]">
          JPG, PNG, WEBP는 브라우저에서 자동 압축됩니다. 모바일에서는 더 안정적으로 원본 업로드를 우선 사용합니다.
        </span>
        <span className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-white px-4 text-sm font-semibold text-[#7b6049] sm:w-fit">
          사진 선택하기
        </span>
        <input
          ref={inputRef}
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      <div className="flex flex-col gap-2 rounded-[22px] border border-[#ead8cf] bg-white/88 px-4 py-3 text-sm text-[#6d5961] sm:flex-row sm:items-center sm:justify-between">
        <span>{message}</span>
        {isProcessing ? <span className="font-semibold text-[#b46d59]">사진 최적화 중...</span> : null}
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
                    {preview.helperText}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#b46d59]">{preview.sizeText}</span>
                  <button
                    className="inline-flex min-h-9 items-center rounded-full border border-[#ead8cf] bg-white px-3 text-xs font-semibold text-[#5e4850] disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      void removeFile(index);
                    }}
                  >
                    {nativeMode ? "다시 선택" : "제거"}
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
