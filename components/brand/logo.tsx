import Link from "next/link";

/** The rainbow-arc "L" mark from the brand board, drawn as pure SVG. */
export function LogoMark({
  size = 44,
  className = "",
  onNight = false,
}: {
  size?: number;
  className?: string;
  onNight?: boolean;
}) {
  const ink = onNight ? "#ffffff" : "var(--color-navy)";
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* rainbow "C" arcs — gap faces right */}
      {[
        { r: 42, w: 7, c: "var(--color-coral)", dash: "70 30" },
        { r: 33.5, w: 6.5, c: "var(--color-sunshine)", dash: "68 32" },
        { r: 25.5, w: 6, c: "var(--color-grass)", dash: "66 34" },
        { r: 18, w: 5.5, c: "var(--color-sky)", dash: "63 37" },
      ].map((a, i) => (
        <circle
          key={i}
          cx="46"
          cy="54"
          r={a.r}
          fill="none"
          stroke={a.c}
          strokeWidth={a.w}
          pathLength={100}
          strokeDasharray={a.dash}
          strokeLinecap="round"
          transform="rotate(118 46 54)"
        />
      ))}
      {/* lilac cap on the outer arc's tail */}
      <circle
        cx="46"
        cy="54"
        r={42}
        fill="none"
        stroke="var(--color-lilac)"
        strokeWidth={7}
        pathLength={100}
        strokeDasharray="14 86"
        strokeLinecap="round"
        transform="rotate(50 46 54)"
      />
      {/* the L */}
      <path
        d="M40 34 V72 H62"
        fill="none"
        stroke={ink}
        strokeWidth={13}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* sparkles */}
      <path
        d="M82 10 L85 20 L95 23 L85 26 L82 36 L79 26 L69 23 L79 20 Z"
        fill="var(--color-sunshine)"
      />
      <path
        d="M90 44 L92 50 L98 52 L92 54 L90 60 L88 54 L82 52 L88 50 Z"
        fill="var(--color-sky)"
      />
    </svg>
  );
}

const LEWIS_COLORS = [
  "var(--color-coral)",
  "var(--color-coral)",
  "var(--color-sunshine)",
  "var(--color-grass)",
  "var(--color-lilac)",
];

/** Full logo lockup: mark + rainbow "Lewis" + navy "TUTORING". */
export function Logo({
  size = "md",
  onNight = false,
  href = "/",
}: {
  size?: "sm" | "md" | "lg";
  onNight?: boolean;
  href?: string | null;
}) {
  const dims = { sm: 34, md: 44, lg: 58 }[size];
  const text = { sm: "text-xl", md: "text-2xl", lg: "text-4xl" }[size];
  const sub = { sm: "text-[8px]", md: "text-[10px]", lg: "text-xs" }[size];
  const body = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={dims} onNight={onNight} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-bold ${text} leading-none`}>
          {"Lewis".split("").map((ch, i) => (
            <span key={i} style={{ color: LEWIS_COLORS[i] }}>
              {ch}
            </span>
          ))}
        </span>
        <span
          className={`font-display font-semibold tracking-[0.32em] ${sub} ${
            onNight ? "text-white/90" : "text-navy"
          }`}
        >
          TUTORING
        </span>
      </span>
    </span>
  );
  if (!href) return body;
  return (
    <Link href={href} className="squash inline-flex" aria-label="Lewis Tutoring home">
      {body}
    </Link>
  );
}
