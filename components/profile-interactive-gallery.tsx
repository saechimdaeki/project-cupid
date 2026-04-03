"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ProfileInteractiveGalleryProps = {
  images: string[];
  sizes: string;
};

export function ProfileInteractiveGallery({ images, sizes }: ProfileInteractiveGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeIndex = images.length ? Math.min(currentImageIndex, images.length - 1) : 0;
  const currentSrc = images.length ? images[safeIndex] : null;

  useEffect(() => {
    if (currentImageIndex >= images.length && images.length > 0) {
      setCurrentImageIndex(images.length - 1);
    }
  }, [currentImageIndex, images.length]);

  const goPrev = useCallback(() => {
    setCurrentImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

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

  if (!images.length) {
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

  const showNav = images.length > 1;

  const lightbox =
    mounted && isLightboxOpen && currentSrc ? (
      <div
        className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center overflow-hidden bg-black/90 backdrop-blur-md"
        onClick={() => setIsLightboxOpen(false)}
        role="presentation"
      >
        <button
          type="button"
          aria-label="닫기"
          className="absolute right-6 top-6 z-[100000] cursor-pointer text-5xl text-white hover:text-rose-500"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(false);
          }}
        >
          ×
        </button>

        {showNav ? (
          <>
            <button
              type="button"
              aria-label="이전 사진"
              className="absolute left-4 top-1/2 z-[99998] -translate-y-1/2 rounded-full bg-white/20 p-4 text-2xl font-light text-white transition hover:bg-white/40 sm:left-8"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              className="absolute right-4 top-1/2 z-[99998] -translate-y-1/2 rounded-full bg-white/20 p-4 text-2xl font-light text-white transition hover:bg-white/40 sm:right-8"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              ›
            </button>
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
            {safeIndex + 1} / {images.length}
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
            <Image
              src={currentSrc!}
              alt=""
              fill
              sizes={sizes}
              priority={safeIndex === 0}
              className="object-cover object-center transition duration-300 group-hover:opacity-95"
            />
          </div>
        </button>

        {showNav ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  index === safeIndex
                    ? "border-rose-500 ring-2 ring-rose-200/60"
                    : "cursor-pointer border-transparent hover:border-rose-400"
                }`}
                aria-label={`사진 ${index + 1} 선택`}
                aria-current={index === safeIndex}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover object-center" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
