"use client";

import * as React from "react";
import { HugeIcon } from "@/components/ui/hugeicon";
import { SidebarLeft01Icon } from "@hugeicons/core-free-icons";

export interface VisitorProfile {
  name: string;
  email: string;
  initials?: string;
  avatar?: string;
}

export interface TourStop {
  id: string;
  number: number;
  time?: string;
  title: string;
  room: string;
  era: string;
  primaryArtwork: string;
  status: "completed" | "current" | "upcoming";
  duration: string;
}

export interface TourDiscovery {
  id: string;
  title: string;
  artwork: string;
  type: "scan" | "detail" | "floorplan";
}

const DEFAULT_VISITOR: VisitorProfile = {
  name: "Dagmawi Solomon",
  email: "dagmawi@articulate.ai",
  initials: "DS",
};

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  visitor?: VisitorProfile;
  activeStopId?: string;
  onSelectStop?: (stop: TourStop) => void;
  onSelectDiscovery?: (discovery: TourDiscovery) => void;
  stops?: TourStop[];
  discoveries?: TourDiscovery[];
}

const SIDEBAR_MOTION = {
  expandedWidth: 248,
  collapsedWidth: 52,
  duration: 260,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

export function Sidebar({
  isOpen,
  onToggle,
  visitor = DEFAULT_VISITOR,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);
  const collapsed = isOpen !== undefined ? !isOpen : internalCollapsed;

  const toggleCollapsed = () => {
    const next = !collapsed;
    setInternalCollapsed(next);
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <aside
      data-sidebar-collapsed={collapsed}
      aria-label="Sidebar navigation"
      className="relative flex shrink-0 overflow-hidden bg-subtle border-r border-line transition-[width] select-none h-full"
      style={{
        width: collapsed ? SIDEBAR_MOTION.collapsedWidth : SIDEBAR_MOTION.expandedWidth,
        transitionDuration: `${SIDEBAR_MOTION.duration}ms`,
        transitionTimingFunction: SIDEBAR_MOTION.easing,
      }}
    >
      <div className="flex h-full w-full min-h-0 flex-col justify-between py-3">
        {/* Top: Collapser / Uncollapser Control */}
        <div
          className={`flex h-10 shrink-0 items-center px-2.5 transition-all ${
            collapsed ? "justify-center" : "justify-end"
          }`}
        >
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
            className="flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <HugeIcon
              icon={SidebarLeft01Icon}
              size={18}
              className={`transition-transform duration-200 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Middle: Clean Empty Space */}
        <div className="flex-1 min-h-0" />

        {/* Bottom: Visitor Profile ("The User Thing") */}
        <div className="border-t border-line px-2.5 pt-2.5 shrink-0">
          <div
            className={`flex h-10 w-full items-center rounded-[8px] transition-all select-none ${
              collapsed ? "justify-center" : "px-1"
            }`}
          >
            {/* Avatar / Profile Initials */}
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-soft border border-line text-[11px] font-semibold text-ink overflow-hidden shadow-xs cursor-default"
              title={visitor.name}
            >
              {visitor.avatar ? (
                <img
                  src={visitor.avatar}
                  alt={visitor.name}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                visitor.initials ?? visitor.name.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Visitor Identity (Cleanly hides when collapsed to 52px rail) */}
            {!collapsed && (
              <div className="ml-2.5 min-w-0 flex-1 overflow-hidden animate-in fade-in duration-150">
                <div className="truncate text-[12.5px] font-medium text-ink leading-tight tracking-[-0.1px]">
                  {visitor.name}
                </div>
                <div className="truncate text-[10.5px] text-ink-3 leading-tight tracking-[-0.1px] mt-0.5 font-mono">
                  {visitor.email}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar as SidebarNav };
