type WorkspaceDecorationsProps = {
  density?: "full" | "soft";
  className?: string;
};

export function WorkspaceDecorations({
  density = "full",
  className = "",
}: WorkspaceDecorationsProps) {
  const showExtended = density === "full";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      <span className="pageGlow glowLeft" />
      <span className="pageGlow glowRight" />
      <span className="blossomPetal petal1" />
      <span className="blossomPetal petal3" />
      {showExtended ? <span className="blossomPetal petal2" /> : null}
      {showExtended ? <span className="blossomPetal petal4" /> : null}
      {showExtended ? <span className="blossomPetal petal5" /> : null}
      <span className="floatingHeart heartOne">♥</span>
      <span className="floatingHeart heartTwo">♥</span>
      {showExtended ? <span className="floatingHeart heartThree">♥</span> : null}
      {showExtended ? <span className="floatingHeart heartFour">♥</span> : null}
    </div>
  );
}
