// =====================================================================
// CarGuard AI — Visual capture guides (inline SVG, no external assets)
// Shows the buyer HOW to frame each exterior photo (top-down car with the
// area to capture highlighted + where to stand) and each engine/mechanical
// check (dipstick, oil cap, coolant tank, leaks, smoke, dashboard…).
// =====================================================================

import type { ReactElement, ReactNode } from "react";

const RED = "#E50914";
const INK = "#111827";
const GREY = "#9AA3AF";
const LINE = "#CBD2DA";

type Hl = "top" | "bottom" | "left" | "right" | "tl" | "tr" | "bl" | "br";

const PHOTO_LAYOUT: Record<string, { cam: [number, number]; hl: Hl }> = {
  front_view: { cam: [100, 12], hl: "top" },
  rear_view: { cam: [100, 138], hl: "bottom" },
  left_side_view: { cam: [16, 75], hl: "left" },
  right_side_view: { cam: [184, 75], hl: "right" },
  front_left_diagonal: { cam: [34, 28], hl: "tl" },
  front_right_diagonal: { cam: [166, 28], hl: "tr" },
  rear_left_diagonal: { cam: [34, 122], hl: "bl" },
  rear_right_diagonal: { cam: [166, 122], hl: "br" },
};

function CameraDot({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={100} y2={75} stroke={RED} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
      <circle cx={x} cy={y} r={11} fill={RED} />
      <rect x={x - 5} y={y - 3.5} width={10} height={7} rx={1.5} fill="#fff" />
      <circle cx={x} cy={y} r={2.2} fill={RED} />
      <rect x={x - 1.5} y={y - 5} width={3} height={2} rx={0.6} fill="#fff" />
    </g>
  );
}

function PhotoGuide({ code }: { code: string }) {
  const l = PHOTO_LAYOUT[code] ?? PHOTO_LAYOUT.front_view;
  // Car body seen from above (front at the top).
  const hl = (h: Hl) => {
    const p: Record<Hl, string> = {
      top: "M72 32 L128 32",
      bottom: "M72 118 L128 118",
      left: "M72 36 L72 114",
      right: "M128 36 L128 114",
      tl: "M104 32 L72 32 L72 60",
      tr: "M96 32 L128 32 L128 60",
      bl: "M104 118 L72 118 L72 90",
      br: "M96 118 L128 118 L128 90",
    };
    return p[h];
  };
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      {/* wheels */}
      {[
        [62, 46],
        [130, 46],
        [62, 92],
        [130, 92],
      ].map(([wx, wy], i) => (
        <rect key={i} x={wx} y={wy} width={8} height={16} rx={3} fill={LINE} />
      ))}
      {/* body */}
      <rect x={70} y={30} width={60} height={90} rx={16} fill="#fff" stroke={LINE} strokeWidth={2} />
      {/* windshield + rear window */}
      <path d="M78 48 Q100 40 122 48 L118 60 Q100 55 82 60 Z" fill={LINE} opacity={0.5} />
      <path d="M82 104 Q100 109 118 104 L116 94 Q100 98 84 94 Z" fill={LINE} opacity={0.5} />
      {/* roof */}
      <rect x={84} y={64} width={32} height={26} rx={5} fill={LINE} opacity={0.35} />
      {/* highlighted area to capture */}
      <path d={hl(l.hl)} fill="none" stroke={RED} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {/* where to stand */}
      <CameraDot x={l.cam[0]} y={l.cam[1]} />
    </svg>
  );
}

// ---- Mechanical part schematics -------------------------------------
function Dipstick() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <circle cx={64} cy={40} r={12} fill="none" stroke={INK} strokeWidth={3} />
      <rect x={61} y={50} width={6} height={78} rx={3} fill={INK} />
      {/* min/max marks */}
      <rect x={52} y={92} width={24} height={26} rx={4} fill="#FFF1F2" stroke={RED} strokeWidth={2} />
      <line x1={56} y1={100} x2={72} y2={100} stroke={RED} strokeWidth={2} />
      <line x1={56} y1={110} x2={72} y2={110} stroke={RED} strokeWidth={2} />
      <text x={96} y={104} fontSize={11} fill={INK} fontFamily="Helvetica, Arial">MIN / MAX</text>
      <text x={96} y={120} fontSize={9} fill={GREY} fontFamily="Helvetica, Arial">oil between marks</text>
    </svg>
  );
}

function OilCap() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <ellipse cx={100} cy={86} rx={44} ry={16} fill="#FFF1F2" stroke={LINE} strokeWidth={2} />
      <rect x={70} y={50} width={60} height={36} rx={8} fill="#fff" stroke={INK} strokeWidth={3} />
      <line x1={82} y1={58} x2={118} y2={58} stroke={INK} strokeWidth={2} />
      <line x1={82} y1={66} x2={118} y2={66} stroke={INK} strokeWidth={2} />
      <line x1={82} y1={74} x2={118} y2={74} stroke={INK} strokeWidth={2} />
      {/* twist arrows */}
      <path d="M60 44 A20 20 0 0 1 96 38" fill="none" stroke={RED} strokeWidth={2.5} markerEnd="" />
      <path d="M96 38 l-6 -3 l1 7 z" fill={RED} />
      <text x={100} y={120} fontSize={10} fill={GREY} textAnchor="middle" fontFamily="Helvetica, Arial">engine oil filler cap</text>
    </svg>
  );
}

function Coolant() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <rect x={74} y={36} width={52} height={84} rx={10} fill="#fff" stroke={INK} strokeWidth={3} />
      <rect x={86} y={24} width={28} height={16} rx={4} fill={INK} />
      {/* fluid */}
      <rect x={78} y={84} width={44} height={32} rx={6} fill={RED} opacity={0.18} />
      <line x1={74} y1={70} x2={92} y2={70} stroke={RED} strokeWidth={2} />
      <text x={130} y={74} fontSize={9} fill={RED} fontFamily="Helvetica, Arial">MAX</text>
      <line x1={74} y1={104} x2={92} y2={104} stroke={RED} strokeWidth={2} />
      <text x={130} y={108} fontSize={9} fill={RED} fontFamily="Helvetica, Arial">MIN</text>
    </svg>
  );
}

function Leaks() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      {/* car underside */}
      <rect x={50} y={40} width={100} height={34} rx={12} fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx={72} cy={78} r={9} fill={INK} />
      <circle cx={128} cy={78} r={9} fill={INK} />
      {/* ground */}
      <line x1={36} y1={120} x2={164} y2={120} stroke={LINE} strokeWidth={3} />
      {/* drops */}
      {[90, 100, 110].map((x, i) => (
        <path key={i} d={`M${x} 92 q5 8 0 12 q-5 -4 0 -12`} fill={RED} opacity={0.8} />
      ))}
      <ellipse cx={100} cy={118} rx={18} ry={3.5} fill={RED} opacity={0.25} />
    </svg>
  );
}

function ExhaustSmoke() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <rect x={44} y={66} width={70} height={26} rx={8} fill="#fff" stroke={INK} strokeWidth={3} />
      <rect x={114} y={74} width={20} height={9} rx={4} fill={INK} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={142 + i * 12} cy={72 - i * 6} r={6 + i * 2} fill={GREY} opacity={0.5 - i * 0.12} />
      ))}
      <text x={100} y={120} fontSize={10} fill={GREY} textAnchor="middle" fontFamily="Helvetica, Arial">film the exhaust at start-up</text>
    </svg>
  );
}

function Dashboard() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <rect x={40} y={44} width={120} height={62} rx={12} fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx={74} cy={75} r={18} fill="none" stroke={LINE} strokeWidth={3} />
      <circle cx={126} cy={75} r={18} fill="none" stroke={LINE} strokeWidth={3} />
      {/* warning lights */}
      <circle cx={96} cy={62} r={4} fill={RED} />
      <circle cx={104} cy={62} r={4} fill="#F59E0B" />
      <path d="M100 86 l4 7 h-8 z" fill={RED} />
      <text x={100} y={122} fontSize={10} fill={GREY} textAnchor="middle" fontFamily="Helvetica, Arial">capture the lit dashboard</text>
    </svg>
  );
}

function TempGauge() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <path d="M58 96 A44 44 0 0 1 142 96" fill="none" stroke={LINE} strokeWidth={6} strokeLinecap="round" />
      <path d="M58 96 A44 44 0 0 1 86 58" fill="none" stroke="#16A34A" strokeWidth={6} strokeLinecap="round" />
      <path d="M120 60 A44 44 0 0 1 142 96" fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" />
      <line x1={100} y1={96} x2={100} y2={62} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={100} cy={96} r={5} fill={INK} />
      <text x={100} y={120} fontSize={10} fill={GREY} textAnchor="middle" fontFamily="Helvetica, Arial">temperature gauge</text>
    </svg>
  );
}

function Drop() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <path d="M100 40 q22 34 0 52 q-22 -18 0 -52" fill={RED} opacity={0.8} />
      <ellipse cx={100} cy={118} rx={26} ry={5} fill={RED} opacity={0.2} />
    </svg>
  );
}

function Docs() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      <rect x={64} y={36} width={62} height={80} rx={6} fill="#fff" stroke={INK} strokeWidth={3} transform="rotate(-6 95 76)" />
      <rect x={74} y={44} width={62} height={80} rx={6} fill="#fff" stroke={INK} strokeWidth={3} />
      {[60, 72, 84, 96].map((yy) => (
        <line key={yy} x1={84} y1={yy} x2={126} y2={yy} stroke={LINE} strokeWidth={3} strokeLinecap="round" />
      ))}
      <circle cx={120} cy={108} r={12} fill="#16A34A" />
      <path d="M114 108 l4 4 l7 -8" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VideoGuide() {
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" role="img" aria-hidden>
      {/* engine block */}
      <rect x={56} y={52} width={88} height={50} rx={8} fill="#fff" stroke={INK} strokeWidth={3} />
      <rect x={66} y={42} width={26} height={12} rx={3} fill={INK} />
      <rect x={108} y={42} width={26} height={12} rx={3} fill={INK} />
      {/* play badge */}
      <circle cx={100} cy={77} r={16} fill={RED} />
      <path d="M95 69 l12 8 l-12 8 z" fill="#fff" />
      <text x={100} y={122} fontSize={10} fill={GREY} textAnchor="middle" fontFamily="Helvetica, Arial">record a short video + sound</text>
    </svg>
  );
}

const MECH: Record<string, () => ReactElement> = {
  oil_dipstick: Dipstick,
  oil_cap: OilCap,
  coolant: Coolant,
  leaks_under_engine: Leaks,
  exhaust_smoke: ExhaustSmoke,
  dashboard_lights: Dashboard,
  engine_temperature: TempGauge,
  fluid_after_test: Drop,
  maintenance_records: Docs,
  cold_start: VideoGuide,
  idle_noise: VideoGuide,
  acceleration: VideoGuide,
  road_test: VideoGuide,
  turbo: VideoGuide,
};

export function CaptureGuide({ code, className }: { code: string; className?: string }) {
  let svg: ReactNode = null;
  if (code in PHOTO_LAYOUT) svg = <PhotoGuide code={code} />;
  else if (code in MECH) svg = MECH[code]();
  if (!svg) return null;
  return (
    <div
      className={className}
      style={{ aspectRatio: "4 / 3", width: "100%" }}
      aria-hidden
    >
      {svg}
    </div>
  );
}

export function hasCaptureGuide(code: string): boolean {
  return code in PHOTO_LAYOUT || code in MECH;
}
