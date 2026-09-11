"use client";

import { HugeIcon } from "@/components/ui/hugeicon";
import Asterisk02Icon from "@hugeicons/core-free-icons/Asterisk02Icon";
import Layers01Icon from "@hugeicons/core-free-icons/Layers01Icon";
import SparklesIcon from "@hugeicons/core-free-icons/SparklesIcon";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-card border border-border shadow-xs">
          <HugeIcon icon={Asterisk02Icon} size={28} className="text-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Articulate Tour Guide
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            shadcn/ui has been installed and configured with the Articulate UI research-desk design system. No dark mode, pure crisp typography, and 100% Hugeicons.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left pt-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <HugeIcon icon={Layers01Icon} size={15} className="text-muted-foreground" />
              <span>Design System</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Crisp ink on parchment desk palette with custom CVA variants.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <HugeIcon icon={SparklesIcon} size={15} className="text-muted-foreground" />
              <span>14 Primitives Ready</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Buttons, dialogs, popovers, tabs, selects, cards, and inputs.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
