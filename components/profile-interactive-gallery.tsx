"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ProfileInteractiveGalleryProps = {
  images: string[];
  sizes: string;
};

export function ProfileInteractiveGallery({ images, sizes }: ProfileInteractiveGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages = useMemo(() => {
    const seen = new Set<string>();
    return images.filter((src) => {
      if (!src || seen.has(src)) return false;
      seen.add(src);
      return true;
    });
  }, [images]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeIndex = displayImages.length ? Math.min(currentImageIndex, displayImages.length - 1) : 0;
  const currentSrc = displayImages.length ? displayImages[safeIndex] : null;

  useEffect(() => {
    if (currentImageIndex >= displayImages.length && displayImages.length > 0) {
      setCurrentImageIndex(displayImages.length - 1);
    }
  }, [currentImageIndex, displayImages.length]);

  const goPrev = useCallback(() => {
    setCurrentImageIndex((i) => (i <= 0 ? displayImages.length - 1 : i - 1));
  }, [displayImages.length]);

  const goNext = useCallback(() => {
    setCurrentImageIndex((i) => (i >= displayImages.length - 1 ? 0 : i + 1));
  }, [displayImages.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen, goPrev, goNext]);

  if (!displayImages.length) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/35 p-3 shadow-[0_28px_70px_rgba(244,114,182,0.22)] backdrop-blur-md sm:p-4">
        <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-b from-rose-100 via-rose-50 to-pink-50">
          <div className="text-center">
            <span className="text-4xl" aria-hidden>
              💌
            </span>
            <p className="mt-3 text-sm font-medium text-rose-400">등록된 사진이 없어요</p>
          </div>
        </div>
      </div>
    );
  }

  const showNav = displayImages.length > 1;

  const lightbox =
    mounted && isLightboxOpen && currentSrc ? (
      <div
        className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center overflow-hidden bg-black/90 backdrop-blur-md"
        onClick={() => setIsLightboxOpen(false)}
        role="presentation"
      >
        <Button
          variant="ghost"
          type="button"
          aria-label="닫기"
          className="absolute right-6 top-6 z-[100000] cursor-pointer text-5xl text-white hover:text-rose-500"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(false);
          }}
        >
          ×
        </Button>

        {showNav ? (
          <>
            <Button
              variant="ghost"
              type="button"
              aria-label="이전 사진"
              className="absolute left-4 top-1/2 z-[99998] -translate-y-1/2 rounded-full bg-white/20 p-4 text-2xl font-light text-white hover:bg-white/40 sm:left-8"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              ‹
            </Button>
            <Button
              variant="ghost"
              type="button"
              aria-label="다음 사진"
              className="absolute right-4 top-1/2 z-[99998] -translate-y-1/2 rounded-full bg-white/20 p-4 text-2xl font-light text-white hover:bg-white/40 sm:right-8"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              ›
            </Button>
          </>
        ) : null}

        <div
          className="flex max-h-full max-w-full items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <img
            src={currentSrc}
            alt=""
            className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain select-none"
          />
        </div>

        {showNav ? (
          <p className="pointer-events-none absolute bottom-8 left-0 right-0 z-[99998] text-center text-sm text-white/70">
            {safeIndex + 1} / {displayImages.length}
          </p>
        ) : null}
      </div>
    ) : null;

  return (
    <>
      <div className="rounded-3xl border border-white/70 bg-white/35 p-3 shadow-[0_28px_70px_rgba(244,114,182,0.22)] backdrop-blur-md sm:p-4">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-3xl border border-white/60 bg-white/25 shadow-inner shadow-white/20 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
          aria-label="전체 화면으로 사진 보기"
        >
          <div className="relative aspect-[4/5] w-full">
            <img
              src={currentSrc!}
              alt=""
              loading={safeIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={safeIndex === 0 ? "high" : "auto"}
              sizes={sizes}
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:opacity-95"
            />
          </div>
        </button>

        {showNav ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayImages.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "relative h-16 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2",
                  index === safeIndex
                    ? "border-rose-500 ring-2 ring-rose-200/60"
                    : "border-transparent hover:border-rose-400",
                )}
                aria-label={`사진 ${index + 1} 선택`}
                aria-current={index === safeIndex}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  sizes="64px"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
