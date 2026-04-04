import { cn } from "@/lib/cn";

type CupidLogoProps = {
  className?: string;
  size?: number;
};

export function CupidLogo({ className, size = 28 }: CupidLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Project Cupid"
    >
      {/* 하트 */}
      <path
        d="M50 85C50 85 14 60 14 37c0-13 9-22 20-22 7 0 12 3 16 9 4-6 9-9 16-9 11 0 20 9 20 22 0 23-36 48-36 48Z"
        fill="currentColor"
      />
      {/* 화살 몸통 */}
      <line
        x1="10"
        y1="76"
        x2="90"
        y2="16"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* 화살촉 */}
      <polygon
        points="90,16 76,14 84,28"
        fill="currentColor"
      />
      {/* 화살 깃 */}
      <line x1="10" y1="76" x2="20" y2="82" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="76" x2="4" y2="66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
