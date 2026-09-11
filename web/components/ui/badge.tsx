import * as React from "react";

export type BadgeVariant = "soft" | "outline" | "raised" | "dark" | "error";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "xs" | "sm";
  children: React.ReactNode;
}

export function Badge({
  variant = "soft",
  size = "sm",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center gap-1.5 font-medium rounded-full font-sans transition-colors";

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[11px] leading-tight",
    sm: "px-2.5 py-1 text-xs leading-none",
  };

  const variantClasses: Record<BadgeVariant, string> = {
    soft: "bg-soft text-primary border border-transparent",
    outline: "bg-transparent text-secondary border border-border-subtle hover:border-secondary/50",
    raised: "bg-raised text-primary border border-border-subtle shadow-xs",
    dark: "bg-button-bg text-white border border-transparent [&_svg]:stroke-white",
    error: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
