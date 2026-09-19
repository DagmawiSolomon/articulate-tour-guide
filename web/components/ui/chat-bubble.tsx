"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── ChatBubble Root ──────────────────────────────────────────────────────────

const chatBubbleVariant = cva("flex gap-2.5 items-start max-w-full w-full", {
  variants: {
    variant: {
      sent: "flex-row-reverse justify-start",
      received: "flex-row justify-start",
    },
  },
  defaultVariants: {
    variant: "received",
  },
});

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariant> {}

export const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chatBubbleVariant({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChatBubble.displayName = "ChatBubble";

// ─── ChatBubbleAvatar ────────────────────────────────────────────────────────

interface ChatBubbleAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback?: React.ReactNode;
}

export const ChatBubbleAvatar = React.forwardRef<
  HTMLDivElement,
  ChatBubbleAvatarProps
>(({ className, fallback, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex size-7 shrink-0 select-none items-center justify-center rounded-full bg-muted border border-border text-foreground overflow-hidden text-xs font-medium shadow-xs mt-0.5",
        className
      )}
      {...props}
    >
      {children || fallback}
    </div>
  );
});
ChatBubbleAvatar.displayName = "ChatBubbleAvatar";

// ─── ChatBubbleMessage ────────────────────────────────────────────────────────

const chatBubbleMessageVariants = cva(
  "rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed max-w-[85%] sm:max-w-[78%] break-words",
  {
    variants: {
      variant: {
        sent: "bg-foreground text-background rounded-br-xs shadow-xs font-normal",
        received: "bg-card text-foreground border border-border rounded-bl-xs shadow-xs",
      },
      isLoading: {
        true: "flex items-center gap-1.5 py-3",
        false: "",
      },
    },
    defaultVariants: {
      variant: "received",
      isLoading: false,
    },
  }
);

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
}

export const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(({ className, variant, isLoading, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        chatBubbleMessageVariants({ variant, isLoading }),
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-1.5 px-1 py-0.5" aria-label="Loading response">
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
        </div>
      ) : (
        children
      )}
    </div>
  );
});
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ─── ChatBubbleTimestamp ──────────────────────────────────────────────────────

export const ChatBubbleTimestamp = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "text-[10px] text-muted-foreground font-mono select-none px-1",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
ChatBubbleTimestamp.displayName = "ChatBubbleTimestamp";

// ─── ChatBubbleActionWrapper ──────────────────────────────────────────────────

export const ChatBubbleActionWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-1 mt-1.5 select-none", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";

// ─── ChatBubbleAction ─────────────────────────────────────────────────────────

interface ChatBubbleActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const ChatBubbleAction = React.forwardRef<
  HTMLButtonElement,
  ChatBubbleActionProps
>(({ className, icon, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        className
      )}
      {...props}
    >
      {icon || children}
    </button>
  );
});
ChatBubbleAction.displayName = "ChatBubbleAction";
