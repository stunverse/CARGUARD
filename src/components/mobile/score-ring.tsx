// Circular score gauge with a configurable ring color (no dependencies).
export function ScoreRing({
  score,
  size = 128,
  stroke = 12,
  color = "#E50914",
  track = "#F2F3F5",
  unit = "/100",
}: {
  score: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  unit?: string | null;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;
  const numberSize = Math.round(size * 0.28);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold leading-none text-[#111827]" style={{ fontSize: numberSize }}>
          {score}
        </span>
        {unit && <span className="mt-0.5 text-xs text-[#6B7280]">{unit}</span>}
      </div>
    </div>
  );
}
