"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";

export interface InputProps extends React.ComponentProps<typeof BaseInput> {
  sizeVariant?: "sm" | "md" | "lg";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      sizeVariant = "md",
      startIcon,
      endIcon,
      error = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 text-xs px-2.5 rounded-lg",
      md: "h-9 text-sm px-3 rounded-xl",
      lg: "h-11 text-base px-4 rounded-2xl",
    };

    const hasIcons = Boolean(startIcon || endIcon);

    const baseInputClasses = `w-full bg-raised text-primary placeholder:text-tertiary border transition-colors outline-none font-sans font-normal ${
      error
        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
        : "border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary hover:border-secondary/40"
    } ${disabled ? "opacity-50 cursor-not-allowed bg-subtle" : ""}`;

    if (!hasIcons) {
      return (
        <BaseInput
          ref={ref}
          disabled={disabled}
          className={`${baseInputClasses} ${sizeClasses[sizeVariant]} ${className}`}
          {...props}
        />
      );
    }

    return (
      <div className={`relative flex items-center w-full ${disabled ? "opacity-50" : ""}`}>
        {startIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-secondary">
            {startIcon}
          </div>
        )}
        <BaseInput
          ref={ref}
          disabled={disabled}
          className={`${baseInputClasses} ${sizeClasses[sizeVariant]} ${
            startIcon ? "pl-9" : ""
          } ${endIcon ? "pr-9" : ""} ${className}`}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3 flex items-center pointer-events-none text-secondary">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
