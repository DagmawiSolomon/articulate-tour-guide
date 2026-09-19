"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smoothScroll?: boolean;
}

export const ChatMessageList = React.forwardRef<
  HTMLDivElement,
  ChatMessageListProps
>(({ className, children, smoothScroll = true, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col w-full h-full overflow-y-auto p-4 gap-4",
        smoothScroll && "scroll-smooth",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ChatMessageList.displayName = "ChatMessageList";
