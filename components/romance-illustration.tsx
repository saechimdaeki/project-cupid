type RomanceIllustrationProps = {
  variant: "seal" | "letter" | "spark";
};

export function RomanceIllustration({ variant }: RomanceIllustrationProps) {
  if (variant === "seal") {
    return (
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <defs>
          <linearGradient id="seal-bg" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fff7f2" />
            <stop offset="100%" stopColor="#ffe2d8" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="34" fill="url(#seal-bg)" stroke="#efcbb8" strokeWidth="2" />
        <circle cx="48" cy="48" r="22" fill="none" stroke="#efcbb8" strokeDasharray="3 5" />
        <path
          d="M48 62c-8-5-13-10-13-17 0-5 3-9 8-9 3 0 5 1 5 4 0-3 2-4 5-4 5 0 8 4 8 9 0 7-5 12-13 17Z"
          fill="#eb8fa0"
        />
      </svg>
    );
  }

  if (variant === "letter") {
    return (
      <svg viewBox="0 0 120 96" aria-hidden="true">
        <defs>
          <linearGradient id="letter-bg" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fffdfa" />
            <stop offset="100%" stopColor="#ffeadd" />
          </linearGradient>
        </defs>
        <rect
          x="14"
          y="18"
          width="92"
          height="60"
          rx="18"
          fill="url(#letter-bg)"
          stroke="#efcfbb"
        />
        <path
          d="M20 28 60 58 100 28"
          fill="none"
          stroke="#e4b79c"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M20 70 48 46M100 70 72 46"
          fill="none"
          stroke="#f0cdb8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="60" cy="46" r="10" fill="#fff3ec" stroke="#efcbb8" />
        <path
          d="M60 52c-4-3-6-5-6-9 0-3 2-5 4-5 1 0 2 1 2 2 0-1 1-2 2-2 2 0 4 2 4 5 0 4-2 6-6 9Z"
          fill="#eb8fa0"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 88 88" aria-hidden="true">
      <defs>
        <radialGradient id="spark-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8ef" />
          <stop offset="100%" stopColor="#ffe7c8" />
        </radialGradient>
      </defs>
      <circle cx="44" cy="44" r="28" fill="url(#spark-bg)" stroke="#f0d1a5" />
      <path d="M44 24 49 39 64 44 49 49 44 64 39 49 24 44 39 39Z" fill="#e7b96e" />
    </svg>
  );
}
