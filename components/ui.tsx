import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from "react";

/* ------------------------------ Button ------------------------------ */

const buttonVariants = {
  primary:
    "bg-coral text-white hover:bg-coral-deep shadow-[0_6px_0_0_var(--color-coral-deep)] active:shadow-[0_2px_0_0_var(--color-coral-deep)]",
  sunshine:
    "bg-sunshine text-navy hover:bg-sunshine-deep shadow-[0_6px_0_0_var(--color-sunshine-deep)] active:shadow-[0_2px_0_0_var(--color-sunshine-deep)]",
  navy: "bg-navy text-white hover:bg-night shadow-[0_6px_0_0_var(--color-night-deep)] active:shadow-[0_2px_0_0_var(--color-night-deep)]",
  outline:
    "bg-paper text-navy border-2 border-navy hover:bg-pastel-yellow shadow-[0_5px_0_0_var(--color-navy)] active:shadow-[0_2px_0_0_var(--color-navy)]",
  ghost: "bg-transparent text-navy hover:bg-navy/8",
} as const;

const buttonSizes = {
  sm: "px-4 py-1.5 text-sm gap-1.5",
  md: "px-6 py-2.5 text-base gap-2",
  lg: "px-8 py-3.5 text-lg gap-2.5",
} as const;

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-full font-display font-bold squash cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    />
  );
});

/** Same look as Button but renders an anchor (for links / PayFast redirects). */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"a"> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <a
      className={`inline-flex items-center justify-center rounded-full font-display font-bold squash cursor-pointer select-none ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    />
  );
}

/* ------------------------------ Chip ------------------------------ */

const chipTones = {
  coral: "bg-pastel-pink text-coral-deep",
  sunshine: "bg-pastel-yellow text-sunshine-deep",
  grass: "bg-pastel-green text-grass-deep",
  sky: "bg-pastel-blue text-sky-deep",
  lilac: "bg-pastel-purple text-lilac-deep",
  navy: "bg-navy/8 text-navy",
} as const;

export function Chip({
  tone = "sky",
  className = "",
  children,
}: {
  tone?: keyof typeof chipTones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold tracking-wide ${chipTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Card ------------------------------ */

export function Card({
  className = "",
  sticker = false,
  children,
}: {
  className?: string;
  sticker?: boolean;
  children: ReactNode;
}) {
  return <div className={`${sticker ? "card-sticker" : "card-pop"} ${className}`}>{children}</div>;
}

/* ------------------------------ Form bits ------------------------------ */

export function Field({
  label,
  hint,
  optional = false,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-display font-bold text-sm text-navy">
        {label}
        {optional && (
          <span className="ml-2 text-xs font-sans font-semibold text-ink-soft">(optional)</span>
        )}
      </span>
      {children}
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border-2 border-line bg-paper px-4 py-2.5 text-navy placeholder:text-ink-soft/60 outline-none transition focus:border-sky focus:ring-4 focus:ring-sky/20";

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${inputClass} ${className}`} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(
  function Textarea({ className = "", ...props }, ref) {
    return <textarea ref={ref} className={`${inputClass} min-h-24 ${className}`} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(
  function Select({ className = "", ...props }, ref) {
    return <select ref={ref} className={`${inputClass} ${className}`} {...props} />;
  },
);

export function Checkbox({
  label,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"input"> & { label: ReactNode }) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 accent-[var(--color-grass)] cursor-pointer"
        {...props}
      />
      <span className="text-sm text-navy/90">{label}</span>
    </label>
  );
}

/* ------------------------------ Rainbow progress ------------------------------ */

export function RainbowProgress({
  value,
  className = "",
  label,
}: {
  value: number; // 0..100
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`h-3.5 w-full rounded-full bg-navy/10 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "progress"}
    >
      <div
        className="h-full bg-rainbow rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ------------------------------ Section heading ------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  sub,
  center = true,
  onNight = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
  onNight?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""} mb-10`}>
      {eyebrow && (
        <p
          className={`font-display font-bold tracking-[0.25em] text-xs uppercase mb-3 ${
            onNight ? "text-sunshine" : "text-coral"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display font-bold text-3xl sm:text-4xl leading-tight ${
          onNight ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-3 text-base sm:text-lg ${onNight ? "text-white/75" : "text-ink-soft"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
