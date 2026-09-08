"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { HugeIcon, HugeIconData } from "@/components/ui/hugeicon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";

export const Tabs = BaseTabs.Root;

interface TabsListProps extends React.ComponentProps<typeof BaseTabs.List> {
  activeValue?: string;
  tabs?: Array<{ value: string; width?: number }>;
}

export function TabsList({
  activeValue,
  tabs = [
    { value: "search", width: 107 },
    { value: "computer", width: 109 },
  ],
  className = "",
  children,
  ...props
}: TabsListProps) {
  const activeIndex = tabs.findIndex((t) => t.value === activeValue);
  const activeTab = tabs[activeIndex] ?? tabs[0];
  
  // Calculate offset
  const offset = tabs
    .slice(0, Math.max(0, activeIndex))
    .reduce((acc, t) => acc + (t.width ?? 107), 0);

  return (
    <BaseTabs.List
      className={`relative flex items-center shrink-0 gap-0 rounded-full transition-colors duration-quick bg-subtle ${className}`}
      {...props}
    >
      {/* Sliding White Indicator Pill */}
      <div
        aria-hidden="true"
        data-testid="ask-input-mode-toggle-indicator"
        className="pointer-events-none absolute top-0 z-0 h-full rounded-full border border-border-subtle bg-raised shadow-xs transition-all duration-200"
        style={{
          insetInlineStart: `${offset}px`,
          width: `${activeTab?.width ?? 107}px`,
          opacity: 1,
        }}
      />
      {children}
    </BaseTabs.List>
  );
}

interface TabProps extends React.ComponentProps<typeof BaseTabs.Tab> {
  icon?: HugeIconData;
  label: string;
  isSelected?: boolean;
  width?: number;
  hasChevron?: boolean;
}

export function Tab({
  value,
  icon,
  label,
  isSelected,
  width = 107,
  hasChevron = true,
  className = "",
  ...props
}: TabProps) {
  return (
    <span
      data-testid="ask-input-mode-toggle-width-wrapper"
      className="relative z-[1] inline-flex flex-none overflow-hidden rounded-full"
      style={{ width: `${width}px` }}
    >
      <span className="inline-flex w-max">
        <BaseTabs.Tab
          value={value}
          className={`reset interactable-alt inline-flex select-none max-w-full items-center border transition-colors duration-150 cursor-pointer rounded-full h-8 text-sm pl-2 pr-2 relative gap-0 overflow-visible !border-solid !border-transparent !bg-transparent hover:!bg-transparent ${
            isSelected ? "text-primary font-medium" : "text-secondary hover:text-primary"
          } ${className}`}
          style={{ minWidth: "36px" }}
          {...props}
        >
          {icon && (
            <span className="inline-flex items-center px-1">
              <HugeIcon icon={icon} size={14} />
            </span>
          )}
          <span className="inline-flex items-center whitespace-nowrap">
            {label}
            {hasChevron && (
              <span
                aria-hidden="true"
                data-testid="ask-input-mode-toggle-chevron-slot"
                className="inline-flex items-center justify-end overflow-hidden transition-all duration-150"
                style={{ width: isSelected ? "18px" : "0px" }}
              >
                <span
                  className="ml-1 inline-flex origin-right transition-opacity duration-150"
                  style={{ opacity: isSelected ? 1 : 0 }}
                >
                  <HugeIcon icon={ArrowDown01Icon} size={14} />
                </span>
              </span>
            )}
          </span>
        </BaseTabs.Tab>
      </span>
    </span>
  );
}
