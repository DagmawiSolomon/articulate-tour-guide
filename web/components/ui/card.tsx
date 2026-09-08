import * as React from "react";
import { HugeIcon } from "@/components/ui/hugeicon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-raised shadow-xs shadow-black/5 ring-1 ring-border-subtlest ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SuggestionCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export function SuggestionCard({
  title,
  description,
  onClick,
  className = "",
}: SuggestionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-raised p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2 border border-border-subtlest/60 ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-normal text-primary leading-snug">
          {title}
        </span>
        <HugeIcon
          icon={ArrowUpRight01Icon}
          size={15}
          className="text-tertiary shrink-0 ml-2 mt-0.5"
        />
      </div>
      <p className="text-xs text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
