import * as React from "react";
import { HugeIcon } from "@/components/ui/hugeicon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "raised" | "subtle" | "ghost";
}

export function Card({
  children,
  variant = "raised",
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    raised: "bg-raised border border-border-subtle shadow-xs ring-1 ring-border-subtlest",
    subtle: "bg-subtle border border-border-subtle",
    ghost: "bg-transparent border border-border-subtlest",
  };

  return (
    <div
      className={`rounded-2xl ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-5 pb-2 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-medium text-primary font-sans leading-none tracking-tight ${className}`}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-xs text-secondary font-sans leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 pt-2 ${className}`} {...props} />;
}

export function CardFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center p-5 pt-0 border-t border-border-subtlest mt-3 pt-3 ${className}`}
      {...props}
    />
  );
}

export interface SuggestionCardProps {
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
