"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings02Icon,
  Key01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import {
  isSoundEnabled,
  setSoundEnabled,
  playTactileTap,
  playSuccess,
  playSettingsOpen,
  playSettingsClose,
  playToggle,
} from "@/lib/sounds";

export function Header({ showSettings = true }: { showSettings?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [isAutoSpeak, setIsAutoSpeak] = React.useState(true);
  const [isSoundEffects, setIsSoundEffects] = React.useState(true);
  const [personality, setPersonality] = React.useState<"interactive" | "academic" | "concise">("interactive");
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("assemblyai_api_key") || "";
      setApiKey(storedKey);
      setIsSoundEffects(isSoundEnabled());
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      playSettingsOpen();
    } else {
      playSettingsClose();
    }
    setIsOpen(open);
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("assemblyai_api_key", apiKey);
      setSoundEnabled(isSoundEffects);
    }
    playSuccess();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsOpen(false);
    }, 600);
  };

  return (
    <header className="w-full max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between z-30 select-none">
      {/* Logo on the Left: articulate tour guide. at 16pt in Afacad Flux font with -3% letter spacing */}
      <span
        className="font-medium text-foreground select-none leading-none"
        style={{
          fontFamily: "var(--font-logo)",
          fontSize: "16pt",
          letterSpacing: "-0.03em",
        }}
      >
        articulate tour guide.
      </span>

      {/* Settings Dialog on the Right (conditionally rendered) */}
      {showSettings && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-border bg-background hover:bg-muted text-black cursor-pointer shadow-none"
            />
          }
        >
          <HugeiconsIcon icon={Settings02Icon} size={16} className="text-black" />
          <span className="sr-only">Settings</span>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tour Guide Settings</DialogTitle>
            <DialogDescription>
              Configure speech recognition, guide personality, and audio playback.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* AssemblyAI Section */}
            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-subtle/70 border border-border-subtle">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                  <HugeiconsIcon icon={Key01Icon} size={12} className="text-secondary-text" />
                  <span>AssemblyAI API Key</span>
                </label>
                <Input
                  type="password"
                  placeholder="Enter your AssemblyAI API key (e.g. aai-...)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-card border-border text-xs h-8"
                />
                <div className="flex items-center justify-between text-[10px] text-tertiary-text mt-0.5">
                  <span>Header auth: <code className="font-mono">Authorization: YOUR_KEY</code></span>
                  <a
                    href="https://www.assemblyai.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-600 hover:text-black underline underline-offset-2 decoration-current/80 transition-colors"
                  >
                    Get API Key →
                  </a>
                </div>
              </div>
            </div>

            {/* Guide Personality */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground">
                Guide Personality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "interactive", label: "Interactive", desc: "Friendly & expressive" },
                  { id: "academic", label: "Academic", desc: "Detailed & scholarly" },
                  { id: "concise", label: "Concise", desc: "Fast & focused" },
                ].map((mode) => {
                  const isSelected = personality === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        playToggle();
                        setPersonality(mode.id as typeof personality);
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-card border-foreground text-foreground shadow-xs"
                          : "bg-subtle/50 border-border-subtle text-secondary-text hover:bg-subtle hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs font-medium">{mode.label}</span>
                      <span className="text-[10px] text-tertiary-text mt-0.5">{mode.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Toggles */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">Auto-Narrate Responses</span>
                  <span className="text-[11px] text-secondary-text">
                    Speak responses automatically using TTS when listening completes.
                  </span>
                </div>
                <Switch
                  checked={isAutoSpeak}
                  onCheckedChange={(checked) => {
                    playToggle();
                    setIsAutoSpeak(checked);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">Sound Effects</span>
                  <span className="text-[11px] text-secondary-text">
                    Subtle acoustic cues when entering listening or thinking states.
                  </span>
                </div>
                <Switch
                  checked={isSoundEffects}
                  onCheckedChange={(checked) => {
                    setIsSoundEffects(checked);
                    setSoundEnabled(checked);
                    if (checked) playToggle();
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                playSettingsClose();
                setIsOpen(false);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="text-xs gap-1.5"
            >
              {isSaved ? (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </header>
  );
}
