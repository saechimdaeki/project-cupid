export function SceneBackdrop() {
  return (
    <svg className="sceneBackdrop" viewBox="0 0 920 820" aria-hidden="true">
      <defs>
        <radialGradient id="scene-glow-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffdcb7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffdcb7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="scene-glow-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffc9d5" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#ffc9d5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="scene-ribbon-a" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f4d0b5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f0aeb9" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="scene-ribbon-b" x1="0%" x2="100%" y1="100%" y2="0%">
          <stop offset="0%" stopColor="#f8e2bd" stopOpacity="0.74" />
          <stop offset="100%" stopColor="#efc7a9" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="scene-silhouette" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f6d6d3" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#f0caa5" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <g opacity="0.9">
        <path
          d="M402 120C350 120 314 164 314 214C314 246 328 272 350 292C304 326 280 378 280 438V612C280 640 302 662 330 662H590C618 662 640 640 640 612V438C640 378 616 326 570 292C592 272 606 246 606 214C606 164 570 120 518 120C488 120 470 132 460 142C450 132 432 120 402 120Z"
          fill="url(#scene-silhouette)"
        />
      </g>

      <circle cx="430" cy="360" r="170" fill="url(#scene-glow-a)" />
      <circle cx="220" cy="180" r="120" fill="url(#scene-glow-b)" />
      <circle cx="760" cy="170" r="120" fill="url(#scene-glow-b)" />

      <path
        d="M160 236C244 170 338 160 452 232C548 292 650 300 774 242"
        fill="none"
        stroke="url(#scene-ribbon-a)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M136 446C264 392 382 394 476 454C584 522 682 528 810 462"
        fill="none"
        stroke="url(#scene-ribbon-b)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle cx="458" cy="456" r="7" fill="#fff8f2" stroke="#efc8a3" />
      <circle cx="280" cy="446" r="5.5" fill="#fff8f2" stroke="#efc8a3" />
      <circle cx="642" cy="448" r="5.5" fill="#fff8f2" stroke="#efc8a3" />

      <g opacity="0.7">
        <path d="M570 136 580 162 606 172 580 182 570 208 560 182 534 172 560 162Z" fill="#f0c37a" />
        <path d="M676 626 684 648 706 656 684 664 676 686 668 664 646 656 668 648Z" fill="#efb2bf" />
        <path d="M268 612 276 632 296 640 276 648 268 668 260 648 240 640 260 632Z" fill="#efb2bf" />
      </g>
    </svg>
  );
}
