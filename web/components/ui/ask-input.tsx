"use client";

import * as React from "react";
import { Tabs, TabsList, Tab } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/hugeicon";
import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import ComputerIcon from "@hugeicons/core-free-icons/ComputerIcon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import Mic01Icon from "@hugeicons/core-free-icons/Mic01Icon";
import AudioWave01Icon from "@hugeicons/core-free-icons/AudioWave01Icon";

export interface AskInputProps {
  query?: string;
  onQueryChange?: (value: string) => void;
  mode?: string;
  onModeChange?: (mode: string) => void;
  onSubmit?: () => void;
  onVoiceClick?: () => void;
  isMicActive?: boolean;
  onMicToggle?: () => void;
  placeholder?: string;
  className?: string;
}

export function AskInput({
  query = "",
  onQueryChange,
  mode = "search",
  onModeChange,
  onSubmit,
  onVoiceClick,
  isMicActive = false,
  onMicToggle,
  placeholder = "Type / for search modes",
  className = "",
}: AskInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className={`w-full relative z-30 ${className}`}>
      <div className="relative">
        <div className="bg-base rounded-2xl" data-ask-input-container="true">
          <div className="relative rounded-2xl border-border-subtlest ring-border-subtlest bg-base">
            <div className="relative isolate rounded-2xl">
              <div className="w-full outline-none flex items-center border duration-75 transition-all rounded-2xl border-border-subtle bg-subtle shadow-xs shadow-black/5 relative z-[1] grid items-center overflow-hidden">
                <div className="relative z-[1] grid bg-raised ring-1 ring-border-subtlest pt-3 gap-4 rounded-b-2xl w-full">
                  
                  {/* Query Textarea & Controls Grid */}
                  <div className="min-w-0 px-3 grid grid-cols-[1fr_auto] grid-rows-[1fr_auto] pb-3">
                    
                    {/* Textarea Row */}
                    <div className="overflow-hidden relative flex h-full min-w-0 col-start-1 col-end-3 pb-2 ml-2 mt-1">
                      <div className="relative min-w-0 w-full" style={{ minHeight: "3em" }}>
                        <textarea
                          id="ask-input"
                          rows={2}
                          value={query}
                          onChange={(e) => onQueryChange?.(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={placeholder}
                          className="overflow-auto min-h-[3em] max-h-[15em] outline-none font-sans resize-none text-primary bg-transparent placeholder:text-tertiary w-full text-base leading-relaxed focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Bottom Controls Row: Left Group */}
                    <div className="gap-2 flex overflow-hidden min-w-0 col-start-1 row-start-2 items-center">
                      <div className="gap-2 flex items-center min-w-0">
                        {/* Attach/Add Button */}
                        <button
                          type="button"
                          aria-label="Add sources or files"
                          className="reset interactable select-none outline-hidden font-medium transition-[background-color,border-color,color,opacity] duration-300 ease-out font-sans text-center items-center justify-center leading-loose whitespace-nowrap text-secondary hover:text-primary hover:bg-soft h-8 text-sm cursor-pointer inline-flex rounded-full aspect-square p-0 aspect-[9/8]"
                        >
                          <div className="relative flex items-center justify-center">
                            <div className="inline-flex">
                              <HugeIcon icon={Add01Icon} size={16} />
                            </div>
                          </div>
                        </button>

                        {/* Mode Toggle with Base UI Tabs */}
                        <Tabs value={mode} onValueChange={(val) => onModeChange?.(val as string)}>
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

                    {/* Bottom Controls Row: Right Group */}
                    <div className="flex items-center justify-self-end gap-2 col-start-2 row-start-2">
                      {/* Model Dropdown */}
                      <div className="inline-flex -mr-2">
                        <button
                          type="button"
                          aria-label="Model"
                          className="reset interactable select-none outline-hidden font-medium transition-[background-color,border-color,color,opacity] duration-300 ease-out font-sans text-center items-center justify-center leading-loose whitespace-nowrap h-8 text-sm cursor-pointer inline-flex rounded-full text-secondary hover:text-primary hover:bg-soft px-3 relative"
                        >
                          <span className="text-box-trim-both pe-1 text-sm font-medium">Model</span>
                          <div className="flex shrink-0 items-center -me-0.5">
                            <HugeIcon icon={ArrowDown01Icon} size={16} />
                          </div>
                        </button>
                      </div>

                      {/* Dictation Mic Button */}
                      <div className="relative">
                        <Button
                          type="button"
                          variant="ghost-icon"
                          isActive={isMicActive}
                          onClick={onMicToggle}
                          aria-label="Dictation"
                        >
                          <HugeIcon icon={Mic01Icon} size={16} />
                        </Button>
                      </div>

                      {/* Voice Mode Button (Pure Black Button with Pure White Icon) */}
                      <Button
                        type="button"
                        variant="primary"
                        aria-label="Use voice mode"
                        onClick={onVoiceClick}
                      >
                        <HugeIcon icon={AudioWave01Icon} size={16} color="#ffffff" className="text-white" />
                      </Button>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
