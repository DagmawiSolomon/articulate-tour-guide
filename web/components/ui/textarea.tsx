"use client";

import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "ghost" | "outline" | "raised";
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = "outline", error = false, className = "", disabled, ...props }, ref) => {
    const baseClasses =
      "w-full font-sans text-primary placeholder:text-tertiary outline-none transition-colors resize-none";

    const variantClasses = {
      ghost: "bg-transparent border-none p-0 focus:outline-none focus:ring-0",
      outline: `rounded-xl p-3 border bg-raised ${
        error
          ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
          : "border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary hover:border-secondary/40"
      }`,
      raised:
        "rounded-2xl p-3.5 border border-border-subtle bg-raised shadow-xs focus:ring-1 focus:ring-primary",
    };

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${
          disabled ? "opacity-50 cursor-not-allowed bg-subtle" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
