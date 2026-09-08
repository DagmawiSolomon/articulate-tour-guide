"use client";

import { useState } from "react";
import { Tabs, TabsList, Tab } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, SuggestionCard } from "@/components/ui/card";
import { AskInput } from "@/components/ui/ask-input";
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
              
              {/* ── INTERACTIVE COMPONENT SHOWCASE HERO SECTION ── */}
              <div className="px-4 py-8 relative flex size-full flex-col md:px-0">
                
                {/* Hero Header */}
                <div className="mb-8 flex w-full flex-col items-start gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-subtle px-2.5 py-0.5 text-xs font-medium text-secondary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Base UI Primitives · 100% Hugeicons
                  </div>
                  <h1 className="font-sans text-2xl md:text-3xl font-normal text-primary">
                    Interactive Component Showcase
                  </h1>
                  <p className="text-sm text-secondary max-w-xl">
                    All reusable components engineered for the Perplexity research-desk aesthetic. Pure white icons on dark buttons, sliding capsule tabs, and modular primitives.
                  </p>
                </div>

                <div className="space-y-8 pb-16">
                  
                  {/* 1. REUSABLE ASK INPUT COMPONENT */}
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        1. Reusable AskInput Component
                      </span>
                      <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                        &lt;AskInput /&gt;
                      </code>
                    </div>
                    <AskInput
                      query={query}
                      onQueryChange={setQuery}
                      mode={mode}
                      onModeChange={setMode}
                      isMicActive={isMicActive}
                      onMicToggle={() => setIsMicActive(!isMicActive)}
                      placeholder="Type a research question or / for search modes..."
                    />
                  </section>

                  {/* 2. BUTTON VARIANTS CATALOGUE */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        2. Button Variants &amp; States
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

                  {/* 3. BASE UI TABS (SLIDING CAPSULE TRACK) */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        3. Base UI Tabs with Animated Sliding Pill
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

                  {/* 4. CARDS & SUGGESTION CARDS */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        4. Base Card &amp; Suggestion Cards
                      </span>
                      <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                        &lt;Card /&gt; &lt;SuggestionCard /&gt;
                      </code>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </section>

                  {/* 5. DESIGN SYSTEM TOKENS REFERENCE */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        5. Design System Tokens Reference
                      </span>
                      <code className="text-xs text-tertiary bg-subtle px-1.5 py-0.5 rounded font-mono">
                        globals.css
                      </code>
                    </div>

                    <Card className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="size-6 rounded-md border border-border-subtle bg-base shadow-xs" />
                          <span className="font-medium text-primary block">bg-base</span>
                          <span className="text-tertiary block font-mono text-[11px]">#fdfbfa</span>
                        </div>
                        <div className="space-y-1">
                          <div className="size-6 rounded-md border border-border-subtle bg-subtle shadow-xs" />
                          <span className="font-medium text-primary block">bg-subtle</span>
                          <span className="text-tertiary block font-mono text-[11px]">#f5f3ee</span>
                        </div>
                        <div className="space-y-1">
                          <div className="size-6 rounded-md border border-border-subtle bg-raised shadow-xs" />
                          <span className="font-medium text-primary block">bg-raised</span>
                          <span className="text-tertiary block font-mono text-[11px]">#ffffff</span>
                        </div>
                        <div className="space-y-1">
                          <div className="size-6 rounded-md bg-button-bg shadow-xs" />
                          <span className="font-medium text-primary block">bg-button-bg</span>
                          <span className="text-tertiary block font-mono text-[11px]">#1f1e1b</span>
                        </div>
                      </div>
                    </Card>
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
