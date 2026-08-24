import type { ButtonHTMLAttributes } from "react";

type Variant = "digit" | "operator" | "equals" | "memory" | "action";

interface KeyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Shown on hover — used for the memory buttons' current-value tooltip. */
  tooltip?: string;
}

export function Key({ variant = "digit", tooltip, className, children, ...rest }: KeyProps) {
  return (
    <button
      type="button"
      className={["key", `key--${variant}`, className].filter(Boolean).join(" ")}
      title={tooltip}
      {...rest}
    >
      {children}
    </button>
  );
}
