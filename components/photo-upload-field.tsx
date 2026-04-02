"use client";

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
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.width, image.height),
    );
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

export function PhotoUploadField() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [message, setMessage] = useState(
    "여러 장을 첨부하면 첫 사진이 대표 사진이 됩니다.",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  async function syncFiles(files: File[]) {
    const processed = await Promise.all(files.map(optimizeImageFile));
    const totalBytes = processed.reduce((sum, item) => sum + item.file.size, 0);

    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      setMessage(
        `압축 후에도 총 용량이 ${formatBytes(totalBytes)}입니다. 45MB 이하로 줄이려면 사진 수를 조금 줄여주세요.`,
      );
    } else if (processed.some((item) => item.file.type === "image/webp")) {
      setMessage(
        `자동 최적화 완료 · 총 ${formatBytes(totalBytes)} 업로드 예정`,
      );
    } else {
      setMessage(`총 ${formatBytes(totalBytes)} 업로드 예정`);
    }

    const nextDataTransfer = new DataTransfer();

    processed.forEach((item) => nextDataTransfer.items.add(item.file));

    if (inputRef.current) {
      inputRef.current.files = nextDataTransfer.files;
    }

    setPreviews((current) => {
      current.forEach((preview) => URL.revokeObjectURL(preview.url));

      return processed.map((item, index) => ({
        id: `${item.file.name}-${item.file.size}-${index}`,
        url: URL.createObjectURL(item.file),
        name: item.file.name,
        sizeText: formatBytes(item.file.size),
        helperText:
          index === 0
            ? `${item.helperText} · 대표 사진`
            : item.helperText,
      }));
    });
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    setIsProcessing(true);

    try {
      await syncFiles(selectedFiles);
    } finally {
      setIsProcessing(false);
    }
  }

  async function removeFile(indexToRemove: number) {
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
    <div className="uploadField">
      <label className="uploadDropzone">
        <span className="uploadLabel">사진 첨부</span>
        <span className="uploadSubtext">
          JPG, PNG, WEBP는 브라우저에서 자동 압축됩니다. HEIC/HEIF는 원본으로 업로드됩니다.
        </span>
        <input
          ref={inputRef}
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={handleChange}
          className="uploadInput"
        />
      </label>

      <div className="uploadMessageRow">
        <span className="uploadMessage">{message}</span>
        {isProcessing ? <span className="uploadStatus">사진 최적화 중...</span> : null}
      </div>

      {previews.length ? (
        <div className="uploadPreviewGrid">
          {previews.map((preview, index) => (
            <article key={preview.id} className="uploadPreviewCard">
              <div
                className="uploadPreviewImage"
                style={{ backgroundImage: `url(${preview.url})` }}
              />
              <div className="uploadPreviewMeta">
                <div>
                  <strong>{preview.name}</strong>
                  <span>{preview.helperText}</span>
                </div>
                <div className="uploadPreviewActions">
                  <span className="uploadPreviewSize">{preview.sizeText}</span>
                  <button
                    className="ghostButton uploadRemoveButton"
                    type="button"
                    onClick={() => {
                      void removeFile(index);
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
