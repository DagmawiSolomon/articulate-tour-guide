"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { HugeIcon } from "@/components/ui/hugeicon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogPortal = BaseDialog.Portal;
export const DialogClose = BaseDialog.Close;

export function DialogBackdrop({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-all duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 ${className}`}
      {...props}
    />
  );
}

export function DialogPopup({
  className = "",
  children,
  ...props
}: React.ComponentProps<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Popup
      className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border border-border-subtle bg-raised p-6 shadow-xl ring-1 ring-border-subtlest transition-all duration-200 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 ${className}`}
      {...props}
    >
      {children}
    </BaseDialog.Popup>
  );
}

export function DialogTitle({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={`text-lg font-medium text-primary font-sans leading-tight ${className}`}
      {...props}
    />
  );
}

export function DialogDescription({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={`mt-1.5 text-sm text-secondary font-sans leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function DialogCloseButton({
  className = "",
  ...props
}: React.ComponentProps<typeof BaseDialog.Close>) {
  return (
    <BaseDialog.Close
      aria-label="Close dialog"
      className={`absolute right-4 top-4 flex size-7 items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-soft transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <HugeIcon icon={Cancel01Icon} size={15} />
    </BaseDialog.Close>
  );
}
