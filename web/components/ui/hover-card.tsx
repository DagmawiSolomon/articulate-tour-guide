"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

type HoverCardContextValue = {
  open: (delay?: number) => void
  closeLater: (delay?: number) => void
  cancelClose: () => void
  defaultCloseDelay: number
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null)

function useHoverCardContext() {
  const context = React.useContext(HoverCardContext)
  if (!context) throw new Error("HoverCard components must be used inside HoverCard")
  return context
}

interface HoverCardProps {
  children: React.ReactNode
  defaultOpen?: boolean
  delay?: number
  closeDelay?: number
  onOpenChange?: (open: boolean) => void
}

function HoverCard({ children, defaultOpen = false, delay = 160, closeDelay = 260, onOpenChange }: HoverCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const timers = React.useRef<{ open?: ReturnType<typeof setTimeout>; close?: ReturnType<typeof setTimeout> }>({})

  const cancelClose = React.useCallback(() => {
    if (timers.current.close) clearTimeout(timers.current.close)
    timers.current.close = undefined
  }, [])

  const openCard = React.useCallback((wait = delay) => {
    cancelClose()
    if (timers.current.open) clearTimeout(timers.current.open)
    timers.current.open = setTimeout(() => {
      setOpen(true)
      onOpenChange?.(true)
    }, wait)
  }, [cancelClose, delay, onOpenChange])

  const closeLater = React.useCallback((wait = closeDelay) => {
    if (timers.current.open) clearTimeout(timers.current.open)
    cancelClose()
    timers.current.close = setTimeout(() => {
      setOpen(false)
      onOpenChange?.(false)
    }, wait)
  }, [cancelClose, closeDelay, onOpenChange])

  React.useEffect(() => () => {
    if (timers.current.open) clearTimeout(timers.current.open)
    if (timers.current.close) clearTimeout(timers.current.close)
  }, [])

  return (
    <HoverCardContext.Provider value={{ open: openCard, closeLater, cancelClose, defaultCloseDelay: closeDelay }}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </PopoverPrimitive.Root>
    </HoverCardContext.Provider>
  )
}

type HoverCardTriggerProps = Omit<PopoverPrimitive.Trigger.Props, "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur" | "onClick"> & {
  delay?: number
  closeDelay?: number
}

function HoverCardTrigger({ delay, closeDelay, ...props }: HoverCardTriggerProps) {
  const context = useHoverCardContext()
  return (
    <PopoverPrimitive.Trigger
      data-slot="hover-card-trigger"
      {...props}
      onMouseEnter={() => context.open(delay)}
      onMouseLeave={() => context.closeLater(closeDelay ?? context.defaultCloseDelay)}
      onFocus={() => context.open(0)}
      onBlur={() => context.closeLater(closeDelay ?? context.defaultCloseDelay)}
      onClick={(event) => event.preventDefault()}
    />
  )
}

function HoverCardContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "right",
  sideOffset = 8,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  const context = useHoverCardContext()
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-[60]">
        <PopoverPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-[60] w-fit origin-(--transform-origin) bg-transparent p-0 text-sm text-popover-foreground shadow-none outline-hidden duration-150 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          onMouseEnter={context.cancelClose}
          onMouseLeave={() => context.closeLater()}
          onFocus={context.cancelClose}
          onBlur={() => context.closeLater()}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
