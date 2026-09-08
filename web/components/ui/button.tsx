"use client";

import * as React from "react";

export type ButtonVariant =
  | "primary"       // Black background with pure white text/icon (e.g. Voice mode)
  | "soft-pill"     // Warm pill (e.g. "Free plan · Upgrade")
  | "outline-pill"  // Subtle border pill (e.g. "Upgrade plan" footer)
  | "ghost-icon"    // Circular icon button (e.g. mic, add files, notifications)
  | "square-icon"   // Rounded-lg button with border (e.g. incognito, apps grid)
  | "sidebar-row";  // Sidebar navigation row item

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "xs" | "sm" | "md";
  isActive?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "soft-pill", size = "sm", isActive, className = "", children, ...props }, ref) => {
    const base = "reset interactable select-none outline-hidden font-medium transition-[background-color,border-color,color,opacity] duration-200 ease-out font-sans text-center inline-flex items-center justify-center cursor-pointer";

    const variantStyles: Record<ButtonVariant, string> = {
      primary: "bg-button-bg text-white [&_svg]:text-white [&_svg]:stroke-white hover:opacity-85 rounded-full aspect-square p-0 aspect-[9/8]",
      "soft-pill": "bg-soft text-primary hover:bg-subtle rounded-full border border-transparent px-3",
      "outline-pill": "border border-border-subtle text-primary hover:border-border-subtle hover:bg-subtle rounded-full px-2.5",
      "ghost-icon": `rounded-full aspect-square p-0 aspect-[9/8] transition-colors ${
        isActive ? "bg-red-700 text-white [&_svg]:text-white [&_svg]:stroke-white" : "text-secondary hover:text-primary hover:bg-soft"
      }`,
      "square-icon": "border border-solid border-border-subtle text-primary hover:bg-subtle rounded-lg aspect-[9/8] p-0",
      "sidebar-row": `rounded-xl h-10 w-full pl-2 pr-3 gap-2 transition-colors text-left justify-start ${
        isActive ? "bg-soft text-primary" : "hover:bg-soft text-primary"
      }`,
    };

    const sizeStyles: Record<string, string> = {
      xs: "h-6 text-xs",
      sm: "h-8 text-sm",
      md: "h-10 text-sm",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
