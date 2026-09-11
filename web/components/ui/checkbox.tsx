"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { HugeIcon } from "@/components/ui/hugeicon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";

export interface CheckboxProps
  extends React.ComponentProps<typeof BaseCheckbox.Root> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    const checkboxControl = (
      <BaseCheckbox.Root
        ref={ref}
        id={checkboxId}
        className={`flex size-4.5 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-raised transition-colors outline-none focus-visible:ring-1 focus-visible:ring-primary data-[checked]:bg-primary data-[checked]:border-primary cursor-pointer ${className}`}
        {...props}
      >
        <BaseCheckbox.Indicator className="flex items-center justify-center text-white">
          <HugeIcon icon={Tick02Icon} size={12} color="#ffffff" className="text-white" strokeWidth={2.5} />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    );

    if (!label) {
      return checkboxControl;
    }

    return (
      <div className="flex items-start gap-2.5 cursor-pointer select-none">
        {checkboxControl}
        <div className="flex flex-col">
          <label htmlFor={checkboxId} className="text-xs font-medium text-primary cursor-pointer leading-tight">
            {label}
          </label>
          {description && (
            <span className="text-[11px] text-secondary leading-snug mt-0.5">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
