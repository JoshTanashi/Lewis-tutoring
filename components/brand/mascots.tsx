/* Cute blob mascots — one friend per portal, plus decorative bits.
   All pure SVG so they stay crisp and recolorable. */

type MascotProps = {
  size?: number;
  className?: string;
  mood?: "happy" | "excited" | "sleepy";
};

/** Shared face: dot eyes, smile, blush. Positioned around (50, 55) in a 100-box. */
function Face({
  cx = 50,
  cy = 55,
  mood = "happy",
  scale = 1,
}: {
  cx?: number;
  cy?: number;
  mood?: "happy" | "excited" | "sleepy";
  scale?: number;
}) {
  const s = scale;
  return (
    <g>
      {mood === "sleepy" ? (
        <>
          <path
            d={`M${cx - 12 * s} ${cy} q4 ${3 * s} 8 0`}
            stroke="#1F3A5F"
            strokeWidth={2.6 * s}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M${cx + 4 * s} ${cy} q4 ${3 * s} 8 0`}
            stroke="#1F3A5F"
            strokeWidth={2.6 * s}
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <circle cx={cx - 9 * s} cy={cy} r={3.4 * s} fill="#1F3A5F" />
          <circle cx={cx + 9 * s} cy={cy} r={3.4 * s} fill="#1F3A5F" />
          <circle cx={cx - 10 * s} cy={cy - 1.2 * s} r={1.1 * s} fill="#fff" />
          <circle cx={cx + 8 * s} cy={cy - 1.2 * s} r={1.1 * s} fill="#fff" />
        </>
      )}
      {mood === "excited" ? (
        <path
          d={`M${cx - 6 * s} ${cy + 7 * s} q6 ${7 * s} 12 0 q-6 ${4 * s} -12 0`}
          fill="#1F3A5F"
        />
      ) : (
        <path
          d={`M${cx - 6 * s} ${cy + 7 * s} q6 ${6 * s} 12 0`}
          stroke="#1F3A5F"
          strokeWidth={2.6 * s}
          strokeLinecap="round"
          fill="none"
        />
      )}
      <circle cx={cx - 16 * s} cy={cy + 6 * s} r={3.6 * s} fill="#FF6F7D" opacity={0.4} />
      <circle cx={cx + 16 * s} cy={cy + 6 * s} r={3.6 * s} fill="#FF6F7D" opacity={0.4} />
    </g>
  );
}

/** Twinkle — the students' star buddy. */
export function StarPal({ size = 80, className = "", mood = "happy" }: MascotProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M50 6 L61 36 L94 38 L68 58 L77 90 L50 71 L23 90 L32 58 L6 38 L39 36 Z"
        fill="var(--color-sunshine)"
        stroke="var(--color-sunshine)"
        strokeWidth={11}
        strokeLinejoin="round"
      />
      <Face cy={53} mood={mood} scale={0.92} />
    </svg>
  );
}

/** Bubbles — the parents' heart buddy. */
export function HeartPal({ size = 80, className = "", mood = "happy" }: MascotProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M50 88 C20 66 8 48 8 33 C8 20 18 11 30 11 C39 11 46 16 50 23 C54 16 61 11 70 11 C82 11 92 20 92 33 C92 48 80 66 50 88 Z"
        fill="var(--color-coral)"
      />
      <Face cy={42} mood={mood} scale={0.92} />
    </svg>
  );
}

/** Scribbles — the tutor's pencil buddy. */
export function PencilPal({ size = 80, className = "", mood = "happy" }: MascotProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <rect x="30" y="8" width="40" height="14" rx="7" fill="var(--color-coral)" />
      <rect x="30" y="20" width="40" height="52" rx="6" fill="var(--color-sunshine)" />
      <path d="M30 72 H70 L50 96 Z" fill="#F6D7B0" />
      <path d="M44 79 L50 96 L56 79 Q50 83 44 79 Z" fill="var(--color-navy)" />
      <Face cy={42} mood={mood} scale={0.8} />
    </svg>
  );
}

/** Reggie — the royal admin crown. */
export function CrownPal({ size = 80, className = "", mood = "happy" }: MascotProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M14 34 L30 48 L50 22 L70 48 L86 34 L80 78 Q50 86 20 78 Z"
        fill="var(--color-lilac)"
        stroke="var(--color-lilac)"
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <circle cx="14" cy="32" r="6" fill="var(--color-sunshine)" />
      <circle cx="50" cy="20" r="6" fill="var(--color-coral)" />
      <circle cx="86" cy="32" r="6" fill="var(--color-grass)" />
      <Face cy={60} mood={mood} scale={0.88} />
    </svg>
  );
}

/** Soft round blob, any brand color. */
export function BlobPal({
  size = 80,
  className = "",
  mood = "happy",
  color = "var(--color-sky)",
}: MascotProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M50 8 C74 8 92 24 92 48 C92 74 76 92 50 92 C24 92 8 74 8 48 C8 24 26 8 50 8 Z"
        fill={color}
      />
      <Face mood={mood} cy={50} />
    </svg>
  );
}

/** Puff — a happy cloud. */
export function CloudPal({ size = 80, className = "", mood = "happy" }: MascotProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M26 74 C14 74 6 66 6 56 C6 47 12 40 21 38 C22 26 32 17 45 17 C56 17 65 23 68 33 C82 33 94 42 94 55 C94 66 85 74 73 74 Z"
        fill="var(--color-sky)"
        opacity={0.9}
      />
      <Face cy={50} mood={mood} scale={0.85} />
    </svg>
  );
}

/** 4-point sparkle. */
export function Sparkle({
  size = 24,
  className = "",
  color = "var(--color-sunshine)",
  style,
}: {
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M50 2 L60 40 L98 50 L60 60 L50 98 L40 60 L2 50 L40 40 Z"
        fill={color}
      />
    </svg>
  );
}

/** Rainbow arc (half rainbow). */
export function RainbowArc({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const bands = [
    "var(--color-coral)",
    "var(--color-sunshine)",
    "var(--color-grass)",
    "var(--color-sky)",
    "var(--color-lilac)",
  ];
  return (
    <svg
      viewBox="0 0 100 55"
      width={size}
      height={size * 0.55}
      className={className}
      aria-hidden="true"
    >
      {bands.map((c, i) => (
        <path
          key={i}
          d={`M ${6 + i * 8} 52 A ${44 - i * 8} ${44 - i * 8} 0 0 1 ${94 - i * 8} 52`}
          fill="none"
          stroke={c}
          strokeWidth={7}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/** Hand-drawn squiggle arrow for "look here!" moments. */
export function SquiggleArrow({
  size = 70,
  className = "",
  color = "var(--color-navy)",
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M20 10 C55 18 30 42 48 52 C66 62 78 50 74 74"
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="1 9"
      />
      <path
        d="M62 70 L74 86 L84 68"
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
