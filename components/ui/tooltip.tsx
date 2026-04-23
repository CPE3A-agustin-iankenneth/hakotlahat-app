"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const FallbackProvider = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
const FallbackRoot = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
const FallbackTrigger = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{children}</span>
);
const FallbackContent = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{children}</span>
);
const FallbackPortal = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);
const FallbackArrow = () => null;

const ProviderPrimitive =
  TooltipPrimitive.Provider ?? FallbackProvider;
const RootPrimitive =
  TooltipPrimitive.Root ?? TooltipPrimitive.Tooltip ?? FallbackRoot;
const TriggerPrimitive =
  TooltipPrimitive.Trigger ?? FallbackTrigger;
const ContentPrimitive =
  TooltipPrimitive.Content ?? FallbackContent;
const PortalPrimitive =
  TooltipPrimitive.Portal ?? FallbackPortal;
const ArrowPrimitive =
  TooltipPrimitive.Arrow ?? FallbackArrow;

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <ProviderPrimitive
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <RootPrimitive data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TriggerPrimitive data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <PortalPrimitive>
      <ContentPrimitive
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <ArrowPrimitive className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </ContentPrimitive>
    </PortalPrimitive>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
