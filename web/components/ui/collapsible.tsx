"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";

export const Collapsible = BaseCollapsible.Root;
export const CollapsibleTrigger = BaseCollapsible.Trigger;

export function CollapsiblePanel({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BaseCollapsible.Panel>) {
  return (
    <BaseCollapsible.Panel
      className={`overflow-hidden transition-all duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0 ${className}`}
      {...props}
    >
      {children}
    </BaseCollapsible.Panel>
  );
}
