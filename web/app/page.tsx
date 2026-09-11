"use client";

import { useState } from "react";
import { Tabs, TabsList, Tab } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  SuggestionCard,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverPortal,
  PopoverPositioner,
  PopoverPopup,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuPositioner,
  MenuPopup,
  MenuItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectPositioner,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { HugeIcon } from "@/components/ui/hugeicon";

import AsteriskIcon from "@hugeicons/core-free-icons/AsteriskIcon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import SidebarLeftIcon from "@hugeicons/core-free-icons/SidebarLeftIcon";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import ComputerIcon from "@hugeicons/core-free-icons/ComputerIcon";
import GeometricShapes01Icon from "@hugeicons/core-free-icons/GeometricShapes01Icon";
import Settings01Icon from "@hugeicons/core-free-icons/Settings01Icon";
import FilterIcon from "@hugeicons/core-free-icons/FilterIcon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import ArrowUp01Icon from "@hugeicons/core-free-icons/ArrowUp01Icon";
import MoreHorizontalIcon from "@hugeicons/core-free-icons/MoreHorizontalIcon";
import BellIcon from "@hugeicons/core-free-icons/BellIcon";
import IncognitoIcon from "@hugeicons/core-free-icons/IncognitoIcon";
import Grid2X2Icon from "@hugeicons/core-free-icons/Grid2X2Icon";
import Mic01Icon from "@hugeicons/core-free-icons/Mic01Icon";
import AudioWave01Icon from "@hugeicons/core-free-icons/AudioWave01Icon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";



export default function PerplexityLayout() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("search");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSession, setActiveSession] = useState("pre-mortem");
  const [isMicActive, setIsMicActive] = useState(false);
  const [isProjectsCollapsed, setIsProjectsCollapsed] = useState(false);
  const [isSessionsCollapsed, setIsSessionsCollapsed] = useState(false);
  const [switchActive, setSwitchActive] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [selectedModel, setSelectedModel] = useState("sonar");

  return (
    <div className="bg-base text-primary font-sans h-screen w-screen overflow-hidden flex selection:bg-soft selection:text-primary">
      
      {/* ── 240px SIDEBAR (Direct from Perplexity DOM) ── */}
      {isSidebarOpen && (
        <nav
          className="group/sidebar hidden relative z-10 min-h-0 flex-none h-full md:flex flex-col justify-between border-r border-border-subtlest bg-subtle"
          style={{ width: 240 }}
          aria-label="Main"
        >
          <div className="relative flex min-h-0 h-full flex-col overflow-hidden">
            
            {/* Top Bar: Logo + Search + Collapse */}
            <div className="flex items-center justify-between p-2 h-12 relative shrink-0">
              <a
                href="/"
                className="flex size-10 items-center justify-center rounded-xl hover:bg-soft shrink-0 transition-colors"
                aria-label="Perplexity"
              >
                <div className="text-primary size-5 flex items-center justify-center">
                  <HugeIcon icon={AsteriskIcon} size={20} className="text-primary" />
                </div>
              </a>
              
              <div className="flex items-center gap-1 pr-1 text-secondary">
                <button
                  type="button"
                  aria-label="Search sessions"
                  className="flex size-8 items-center justify-center rounded-xl p-1 hover:bg-soft transition-colors cursor-pointer"
                >
                  <HugeIcon icon={Search01Icon} size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Collapse sidebar"
                  className="flex size-8 items-center justify-center rounded-xl p-1 hover:bg-soft transition-colors cursor-pointer"
                >
                  <HugeIcon icon={SidebarLeftIcon} size={18} />
                </button>
              </div>
            </div>

            {/* "New" Primary Button */}
            <div className="px-2 w-full py-[0.5px] shrink-0">
              <div className="group/sidebar-sub-menu relative block rounded-md select-none w-full">
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="flex rounded-xl group-hover/sidebar-sub-menu:bg-soft h-10 w-full items-center pl-2 pr-3 gap-2 transition-colors cursor-pointer text-left"
                >
                  <div className="relative size-6 grid place-items-center shrink-0 pointer-events-none text-primary">
                    <div className="flex size-6 items-center justify-center rounded-full bg-soft">
                      <HugeIcon icon={Add01Icon} size={16} />
                    </div>
                  </div>
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="flex-1 truncate font-sans text-primary text-sm font-medium">New</span>
                    <span className="shrink-0 opacity-0 group-hover/sidebar-sub-menu:opacity-100 font-sans text-tertiary text-xs select-none transition-opacity">⌃I</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Scrollable Nav Items & Sessions */}
            <div className="flex-1 overflow-y-auto px-2 space-y-[1px] scrollbar-none">
              
              {/* Computer Item */}
              <div className="group/sidebar-sub-menu relative block select-none w-full">
                <a
                  href="#computer"
                  className="flex rounded-xl group-hover/sidebar-sub-menu:bg-soft h-10 w-full items-center pl-2 pr-3 gap-2 transition-colors"
                >
                  <div className="relative size-6 grid place-items-center shrink-0 text-primary">
                    <HugeIcon icon={ComputerIcon} size={18} />
                  </div>
                  <span className="flex-1 truncate font-sans text-primary text-sm">Computer</span>
                </a>
              </div>

              {/* Artifacts Item */}
              <div className="group/sidebar-sub-menu relative block select-none w-full">
                <a
                  href="#artifacts"
                  className="flex rounded-xl group-hover/sidebar-sub-menu:bg-soft h-10 w-full items-center pl-2 pr-3 gap-2 transition-colors"
                >
                  <div className="relative size-6 grid place-items-center text-primary">
                    <HugeIcon icon={GeometricShapes01Icon} size={18} />
                  </div>
                  <span className="flex-1 truncate font-sans text-primary text-sm">Artifacts</span>
                </a>
              </div>

              {/* Customize Item */}
              <div className="group/sidebar-sub-menu relative block select-none w-full">
                <a
                  href="#customize"
                  className="flex rounded-xl group-hover/sidebar-sub-menu:bg-soft h-10 w-full items-center pl-2 pr-3 gap-2 transition-colors"
                >
                  <div className="relative size-6 grid place-items-center text-primary">
                    <HugeIcon icon={Settings01Icon} size={18} />
                  </div>
                  <span className="flex-1 truncate font-sans text-primary text-sm">Customize</span>
                </a>
              </div>

              {/* Projects Section */}
              <div className="mt-2 pt-1 pb-2 w-full">
                <div className="flex h-8 rounded-lg group/sidebar-list-row items-center justify-between px-2">
                  <span className="font-sans text-tertiary font-normal text-sm truncate">Projects</span>
                  <div className="inline-flex items-center gap-0.5">
                    <button type="button" aria-label="Create project" className="size-6 grid place-items-center rounded-md text-tertiary hover:bg-soft hover:text-primary transition-colors cursor-pointer">
                      <HugeIcon icon={Add01Icon} size={15} />
                    </button>
                    <button type="button" aria-label="Filter projects" className="size-6 grid place-items-center rounded-md text-tertiary hover:bg-soft hover:text-primary transition-colors cursor-pointer">
                      <HugeIcon icon={FilterIcon} size={15} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsProjectsCollapsed(!isProjectsCollapsed)}
                      className="size-6 grid place-items-center rounded-md text-tertiary hover:bg-soft hover:text-primary transition-colors cursor-pointer"
                    >
                      <HugeIcon icon={ArrowRight01Icon} size={15} className={`transition-transform ${isProjectsCollapsed ? "" : "rotate-90"}`} />
                    </button>
                  </div>
                </div>

                {!isProjectsCollapsed && (
                  <div className="pt-px pb-2">
                    <div className="ring-border-subtlest bg-base gap-2 flex flex-col rounded-xl p-2.5 ring-1 shadow-xs">
                      <div className="flex flex-col">
                        <div className="font-sans text-sm font-medium text-primary">Organize and share your work</div>
                        <div className="font-sans text-secondary text-xs mt-0.5">Keep files, memory, and context together across sessions.</div>
                      </div>
                      <button
                        type="button"
                        className="font-sans font-medium text-sm h-8 cursor-pointer flex w-full items-center justify-center bg-soft text-primary hover:bg-subtle px-3 rounded-lg transition-colors"
                      >
                        Create project
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sessions Section */}
              <div className="w-full">
                <div className="flex h-8 rounded-lg group/sidebar-list-row items-center justify-between px-2">
                  <span className="font-sans text-tertiary font-normal text-sm truncate">Sessions</span>
                  <button 
                    type="button" 
                    onClick={() => setIsSessionsCollapsed(!isSessionsCollapsed)}
                    className="size-6 grid place-items-center rounded-md text-tertiary hover:bg-soft hover:text-primary transition-colors cursor-pointer"
                  >
                    <HugeIcon icon={ArrowRight01Icon} size={15} className={`transition-transform ${isSessionsCollapsed ? "" : "rotate-90"}`} />
                  </button>
                </div>

                {!isSessionsCollapsed && (
                  <div className="space-y-[1px] pt-0.5">
                    {[
                      { id: "strategy", title: "# Deep Research Task: Commercial Strategy, Unit Economics..." },
                      { id: "pre-mortem", title: "# Deep Research Task: Pre-Mortem Vulnerability Audit..." },
                      { id: "specs", title: "# Deep Research Task: Engineering & UX Specifications..." },
                    ].map((s) => (
                      <div key={s.id} className="group/session relative flex rounded-lg h-8 items-center">
                        <button
                          type="button"
                          onClick={() => setActiveSession(s.id)}
                          className={`flex rounded-lg h-8 w-full items-center px-2 text-left transition-colors cursor-pointer ${
                            activeSession === s.id ? "bg-soft text-primary" : "group-hover/session:bg-soft text-primary"
                          }`}
                        >
                          <span className="truncate font-sans text-sm pr-6">{s.title}</span>
                        </button>
                        <button
                          type="button"
                          aria-label="Session actions"
                          className="absolute right-1 size-6 grid place-items-center rounded-md text-secondary hover:bg-soft group-hover/session:opacity-100 opacity-0 transition-opacity cursor-pointer"
                        >
                          <HugeIcon icon={MoreHorizontalIcon} size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Profile / Plan Footer */}
            <div className="border-t border-border-subtlest p-2 flex flex-col gap-2 shrink-0">
              
              {/* Upgrade plan button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  className="h-6 text-xs cursor-pointer inline-flex items-center rounded-full text-primary border border-border-subtle hover:bg-subtle px-2 font-medium transition-colors"
                >
                  <HugeIcon icon={ArrowUp01Icon} size={13} className="-ms-0.5 mr-1" />
                  <span>Upgrade plan</span>
                </button>
              </div>

              {/* User Profile Bar */}
              <div className="flex h-10 cursor-pointer items-center justify-between rounded-xl px-2 hover:bg-soft transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative size-6 shrink-0 rounded-full bg-primary text-inverse flex items-center justify-center text-[11px] font-medium">
                    D
                  </div>
                  <div className="flex flex-col min-w-0 select-none">
                    <div className="font-sans text-sm text-secondary font-medium leading-tight truncate">Dagmawi Bedane</div>
                    <div className="!text-[11px] font-sans font-normal text-secondary leading-none truncate">Free plan</div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Notifications"
                  className="size-8 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-soft transition-colors"
                >
                  <HugeIcon icon={BellIcon} size={16} />
                </button>
              </div>

            </div>

          </div>
        </nav>
      )}

      {/* ── MAIN VIEWPORT AREA ── */}
      <main className="isolate flex h-auto max-h-screen min-w-0 grow flex-col overflow-hidden bg-base">
        
        {/* Floating Header */}
        <header className="flex h-12 w-full shrink-0 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
                className="flex size-8 items-center justify-center rounded-xl hover:bg-soft transition-colors cursor-pointer"
              >
                <HugeIcon icon={SidebarLeftIcon} size={18} />
              </button>
            )}

            <button
              type="button"
              className="border border-transparent h-8 text-sm cursor-pointer inline-flex items-center rounded-full bg-soft text-primary hover:bg-subtle px-3 font-medium transition-colors"
            >
              <span className="flex items-center gap-1">
                <span>Free plan</span>
                <span className="text-tertiary text-xs leading-none">·</span>
                <span>Upgrade</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Use incognito"
              className="size-8 text-sm cursor-pointer inline-flex items-center justify-center text-primary border border-border-subtle hover:bg-subtle rounded-lg transition-colors"
            >
              <HugeIcon icon={IncognitoIcon} size={16} />
            </button>
            <button
              type="button"
              aria-label="Apps and more"
              className="size-8 text-sm cursor-pointer inline-flex items-center justify-center text-primary border border-border-subtle hover:bg-subtle rounded-lg transition-colors"
            >
              <HugeIcon icon={Grid2X2Icon} size={16} />
            </button>
          </div>
        </header>

        {/* Scrollable Center Container */}
        <div className="scrollable-container flex flex-1 basis-0 overflow-auto scrollbar-none">
          <div className="mx-auto size-full max-w-screen-md px-4 md:px-8">
            <div className="relative flex h-full flex-col">
              
              {/* ── BASE UI ATOMIC BUILDING BLOCKS SHOWCASE ── */}
              <div className="px-4 py-8 relative flex size-full flex-col md:px-0">
                
                {/* Hero Header */}
                <div className="mb-8 flex w-full flex-col items-start gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-subtle px-2.5 py-0.5 text-xs font-medium text-secondary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Atomic Base UI Primitives · 100% Hugeicons
                  </div>
                  <h1 className="font-sans text-2xl md:text-3xl font-normal text-primary">
                    Base UI Building Blocks
                  </h1>
                  <p className="text-sm text-secondary max-w-xl">
                    Our customized, unstyled Base UI primitives styled strictly to the Perplexity research-desk design system. Modular, atomic, accessible, and composition-first.
                  </p>
                </div>

                <div className="space-y-10 pb-16">
                  
                  {/* 1. INPUTS & TEXTAREAS */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtlest pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        1. Text Inputs &amp; Textareas
                      </span>
                      <div className="flex gap-2">
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Input /&gt;
                        </code>
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Textarea /&gt;
                        </code>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-secondary">Input with Search Icon</label>
                        <Input
                          placeholder="Search exhibits or artifacts..."
                          startIcon={<HugeIcon icon={Search01Icon} size={15} />}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-secondary">Small Filter Input</label>
                        <Input
                          sizeVariant="sm"
                          placeholder="Filter session tags..."
                          startIcon={<HugeIcon icon={FilterIcon} size={14} />}
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-secondary">Outline Textarea</label>
                        <Textarea
                          rows={2}
                          placeholder="Enter a research note or synthesis prompt..."
                          variant="outline"
                        />
                      </div>
                    </div>
                  </section>

                  {/* 2. BUTTONS & ICON BUTTONS */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtlest pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        2. Button Variants &amp; Icon Overrides
                      </span>
                      <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                        &lt;Button variant=&quot;...&quot; /&gt;
                      </code>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Primary Black Button (White Icon Guarantee) */}
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-raised flex flex-col justify-between gap-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-secondary">variant=&quot;primary&quot;</span>
                          <span className="text-[10px] text-primary font-medium bg-soft px-1.5 py-0.5 rounded">
                            Pure White Icon (#ffffff)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="primary" aria-label="Voice mode">
                            <HugeIcon icon={AudioWave01Icon} size={16} color="#ffffff" className="text-white" />
                          </Button>
                          <span className="text-xs text-primary font-medium">Voice Mode Button</span>
                        </div>
                        <p className="text-[11px] text-tertiary">
                          Black background (<code className="font-mono">#1f1e1b</code>) with pure white waveform icon.
                        </p>
                      </div>

                      {/* Soft Pill */}
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-raised flex flex-col justify-between gap-3 shadow-xs">
                        <span className="text-xs font-medium text-secondary">variant=&quot;soft-pill&quot;</span>
                        <div className="flex items-center gap-2">
                          <Button variant="soft-pill">
                            <span className="flex items-center gap-1">
                              <span>Free plan</span>
                              <span className="text-tertiary text-xs leading-none">·</span>
                              <span>Upgrade</span>
                            </span>
                          </Button>
                        </div>
                        <p className="text-[11px] text-tertiary">
                          Warm off-white badge button for account tier callouts.
                        </p>
                      </div>

                      {/* Outline Pill */}
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-raised flex flex-col justify-between gap-3 shadow-xs">
                        <span className="text-xs font-medium text-secondary">variant=&quot;outline-pill&quot;</span>
                        <div className="flex items-center gap-2">
                          <Button variant="outline-pill">
                            Upgrade plan
                          </Button>
                        </div>
                        <p className="text-[11px] text-tertiary">
                          Bordered pill with subtle hover state for secondary actions.
                        </p>
                      </div>

                      {/* Ghost Icon Buttons */}
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-raised flex flex-col justify-between gap-3 shadow-xs">
                        <span className="text-xs font-medium text-secondary">variant=&quot;ghost-icon&quot;</span>
                        <div className="flex items-center gap-3">
                          <Button variant="ghost-icon" aria-label="Dictation idle">
                            <HugeIcon icon={Mic01Icon} size={16} />
                          </Button>
                          <Button variant="ghost-icon" isActive={true} aria-label="Dictation active">
                            <HugeIcon icon={Mic01Icon} size={16} />
                          </Button>
                          <span className="text-xs text-secondary">Idle &amp; Active (Red indicator)</span>
                        </div>
                        <p className="text-[11px] text-tertiary">
                          Circular interactive controls with active recording feedback.
                        </p>
                      </div>

                      {/* Square Icon Buttons */}
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-raised flex flex-col justify-between gap-3 shadow-xs">
                        <span className="text-xs font-medium text-secondary">variant=&quot;square-icon&quot;</span>
                        <div className="flex items-center gap-2">
                          <Button variant="square-icon" size="sm" aria-label="Incognito">
                            <HugeIcon icon={IncognitoIcon} size={16} />
                          </Button>
                          <Button variant="square-icon" size="sm" aria-label="Grid apps">
                            <HugeIcon icon={Grid2X2Icon} size={16} />
                          </Button>
                        </div>
                        <p className="text-[11px] text-tertiary">
                          Header navigation utilities with aspect-[9/8] geometry.
                        </p>
                      </div>

                      {/* Sidebar Row Item */}
                      <div className="p-3.5 rounded-xl border border-border-subtle bg-raised flex flex-col justify-between gap-3 shadow-xs">
                        <span className="text-xs font-medium text-secondary">variant=&quot;sidebar-row&quot;</span>
                        <div className="w-full space-y-1">
                          <Button variant="sidebar-row" isActive={true}>
                            <HugeIcon icon={AsteriskIcon} size={16} />
                            <span>Active Thread Row</span>
                          </Button>
                        </div>
                        <p className="text-[11px] text-tertiary">
                          Full-width sidebar navigation item with soft background.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 3. TABS (SLIDING CAPSULE TRACK) */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtlest pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        3. Tabs with Animated Sliding Pill
                      </span>
                      <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                        &lt;Tabs /&gt; &lt;TabsList /&gt; &lt;Tab /&gt;
                      </code>
                    </div>

                    <div className="p-4 rounded-2xl border border-border-subtle bg-raised shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-primary">Dynamic Mode Selector</h4>
                        <p className="text-xs text-secondary mt-0.5">
                          Sliding pill indicator (<code className="font-mono">bg-raised</code>) with 18px chevron disclosure.
                        </p>
                      </div>

                      <div className="shrink-0">
                        <Tabs value={mode} onValueChange={(val) => setMode(val as string)}>
                          <TabsList
                            activeValue={mode}
                            tabs={[
                              { value: "search", width: 107 },
                              { value: "computer", width: 109 },
                            ]}
                          >
                            <Tab
                              value="search"
                              label="Search"
                              icon={Search01Icon}
                              isSelected={mode === "search"}
                              width={107}
                            />
                            <Tab
                              value="computer"
                              label="Computer"
                              icon={ComputerIcon}
                              isSelected={mode === "computer"}
                              width={109}
                            />
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </section>

                  {/* 4. OVERLAYS (DIALOG, POPOVER, TOOLTIP, MENU) */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtlest pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        4. Overlays: Dialog, Popover, Tooltip &amp; Menu
                      </span>
                      <div className="flex gap-1.5">
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Dialog /&gt;
                        </code>
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Popover /&gt;
                        </code>
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Menu /&gt;
                        </code>
                      </div>
                    </div>

                    <TooltipProvider>
                      <div className="p-4 rounded-2xl border border-border-subtle bg-raised shadow-xs flex flex-wrap items-center gap-3">
                        
                        {/* Dialog Trigger & Modal */}
                        <Dialog>
                          <DialogTrigger render={<Button variant="outline-pill" />}>
                            Open Dialog
                          </DialogTrigger>
                          <DialogPortal>
                            <DialogBackdrop />
                            <DialogPopup>
                              <DialogTitle>Artifact Investigation</DialogTitle>
                              <DialogDescription>
                                Underdrawing analysis shows deliberate anatomical revision toward neo-Platonic harmony.
                              </DialogDescription>
                              <div className="mt-5 flex justify-end gap-2">
                                <Button variant="outline-pill" onClick={() => {}}>Dismiss</Button>
                                <Button variant="primary" onClick={() => {}}>Confirm</Button>
                              </div>
                              <DialogCloseButton />
                            </DialogPopup>
                          </DialogPortal>
                        </Dialog>

                        {/* Popover Trigger & Popup */}
                        <Popover>
                          <PopoverTrigger render={<Button variant="outline-pill" />}>
                            Open Popover
                          </PopoverTrigger>
                          <PopoverPortal>
                            <PopoverPositioner>
                              <PopoverPopup>
                                <h4 className="text-xs font-medium text-primary">Medici Villa Archive</h4>
                                <p className="text-[11px] text-secondary mt-1 leading-relaxed">
                                  Protected deep in Villa di Castello away from the 1497 Dominican purge.
                                </p>
                              </PopoverPopup>
                            </PopoverPositioner>
                          </PopoverPortal>
                        </Popover>

                        {/* Menu Dropdown */}
                        <Menu>
                          <MenuTrigger render={<Button variant="outline-pill" />}>
                            <span>Thread Actions</span>
                            <HugeIcon icon={MoreHorizontalIcon} size={14} className="ml-1" />
                          </MenuTrigger>
                          <MenuPortal>
                            <MenuPositioner>
                              <MenuPopup>
                                <MenuGroup>
                                  <MenuGroupLabel>Options</MenuGroupLabel>
                                  <MenuItem>
                                    <HugeIcon icon={AsteriskIcon} size={14} />
                                    <span>Duplicate Thread</span>
                                  </MenuItem>
                                  <MenuItem>
                                    <HugeIcon icon={Settings01Icon} size={14} />
                                    <span>Thread Settings</span>
                                  </MenuItem>
                                </MenuGroup>
                                <MenuSeparator />
                                <MenuItem destructive>
                                  <HugeIcon icon={FilterIcon} size={14} />
                                  <span>Clear Filters</span>
                                </MenuItem>
                              </MenuPopup>
                            </MenuPositioner>
                          </MenuPortal>
                        </Menu>

                        {/* Tooltip Demonstration */}
                        <Tooltip>
                          <TooltipTrigger render={<Button variant="square-icon" size="sm" aria-label="Notifications" />}>
                            <HugeIcon icon={BellIcon} size={16} />
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipPositioner>
                              <TooltipPopup>
                                Notifications &amp; Alerts
                              </TooltipPopup>
                            </TooltipPositioner>
                          </TooltipPortal>
                        </Tooltip>

                      </div>
                    </TooltipProvider>
                  </section>

                  {/* 5. SELECTIONS & TOGGLES (SELECT, SWITCH, CHECKBOX) */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtlest pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        5. Form Controls: Select, Switch &amp; Checkbox
                      </span>
                      <div className="flex gap-1.5">
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Select /&gt;
                        </code>
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Switch /&gt;
                        </code>
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Checkbox /&gt;
                        </code>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Select Dropdown */}
                      <div className="p-4 rounded-2xl border border-border-subtle bg-raised shadow-xs flex flex-col justify-between gap-3">
                        <div>
                          <span className="text-xs font-medium text-secondary block">Select Component</span>
                          <span className="text-xs text-primary font-medium mt-1 block">Model Selector</span>
                        </div>
                        <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as string)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model..." />
                          </SelectTrigger>
                          <SelectPortal>
                            <SelectPositioner>
                              <SelectPopup>
                                <SelectItem value="sonar">Sonar Deep Research</SelectItem>
                                <SelectItem value="claude">Claude 3.5 Sonnet</SelectItem>
                                <SelectItem value="gpt4o">GPT-4o Omnimodal</SelectItem>
                              </SelectPopup>
                            </SelectPositioner>
                          </SelectPortal>
                        </Select>
                      </div>

                      {/* Switch Toggle */}
                      <div className="p-4 rounded-2xl border border-border-subtle bg-raised shadow-xs flex flex-col justify-between gap-3">
                        <div>
                          <span className="text-xs font-medium text-secondary block">Switch Component</span>
                          <span className="text-xs text-primary font-medium mt-1 block">Live Docent Voice</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-secondary">{switchActive ? "Streaming STT On" : "Muted"}</span>
                          <Switch checked={switchActive} onCheckedChange={setSwitchActive} />
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="p-4 rounded-2xl border border-border-subtle bg-raised shadow-xs flex flex-col justify-between gap-3">
                        <div>
                          <span className="text-xs font-medium text-secondary block">Checkbox Component</span>
                          <span className="text-xs text-primary font-medium mt-1 block">Auto Citations</span>
                        </div>
                        <Checkbox
                          checked={checkboxChecked}
                          onCheckedChange={setCheckboxChecked}
                          label="Include primary sources"
                          description="Attaches museum archive notes"
                        />
                      </div>
                    </div>
                  </section>

                  {/* 6. CARDS, BADGES & SEPARATORS */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border-subtlest pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        6. Cards, Badges &amp; Dividers
                      </span>
                      <div className="flex gap-1.5">
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Card /&gt;
                        </code>
                        <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                          &lt;Badge /&gt;
                        </code>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="soft">badge=&quot;soft&quot;</Badge>
                        <Badge variant="outline">badge=&quot;outline&quot;</Badge>
                        <Badge variant="raised">badge=&quot;raised&quot;</Badge>
                        <Badge variant="dark">badge=&quot;dark&quot; (white text)</Badge>
                        <Badge variant="error">badge=&quot;error&quot;</Badge>
                      </div>

                      <Separator />

                      {/* Card with atomic parts */}
                      <Card className="p-1">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Atomic Card Container</CardTitle>
                            <Badge variant="soft">Composed</Badge>
                          </div>
                          <CardDescription>
                            Engineered with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-secondary leading-relaxed">
                            This modular structure allows full composition flexibility across research artifacts, exhibit descriptions, and sidebar panels.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <span className="text-[11px] text-tertiary">Design token: bg-raised · border-border-subtle</span>
                        </CardFooter>
                      </Card>

                      {/* Suggestion Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <SuggestionCard
                          title="Why did Botticelli shift Venus's neck 1.8 cm in the underdrawing?"
                          description="Infrared reflectography reveals a deliberate revision away from anatomical accuracy toward weightless neo-Platonic harmony."
                          onClick={() => setQuery("Why did Botticelli shift Venus's neck 1.8 cm in the underdrawing?")}
                        />

                        <SuggestionCard
                          title="How did this painting survive Savonarola's Bonfire?"
                          description="Protected deep in the Medici Villa di Castello, it escaped the Dominican friar's purge of secular mythological masterworks."
                          onClick={() => setQuery("How did the Medici commission survive Savonarola's Bonfire?")}
                        />
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            </div>
          </div>
        </div>

       </main>
     </div>
   );
 }
