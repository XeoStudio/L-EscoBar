"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 left-1/2 z-[100] flex w-full max-w-[calc(100vw-1.25rem)] -translate-x-1/2 flex-col-reverse gap-2 p-0 sm:bottom-6 sm:max-w-md",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-all duration-300 data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-50 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4",
  {
    variants: {
      variant: {
        default: "border-slate-200/80 bg-white/95 text-slate-900 dark:border-slate-700/70 dark:bg-slate-900/95 dark:text-slate-100",
        success: "border-emerald-200/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-100",
        destructive: "border-red-200/80 bg-red-50/95 text-red-900 dark:border-red-800/80 dark:bg-red-950/80 dark:text-red-100",
        warning: "border-amber-200/80 bg-amber-50/95 text-amber-900 dark:border-amber-800/80 dark:bg-amber-950/80 dark:text-amber-100",
        info: "border-sky-200/80 bg-sky-50/95 text-sky-900 dark:border-sky-800/80 dark:bg-sky-950/80 dark:text-sky-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-current/10 px-3 text-xs font-semibold transition-colors hover:bg-current/15 focus:outline-none focus:ring-2 focus:ring-current/30",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-1.5 text-current/60 transition-colors hover:bg-black/5 hover:text-current dark:hover:bg-white/10",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-[13px] font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-[13px] leading-snug opacity-80", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

// Icon helper based on variant
const ToastIcon = ({ variant }: { variant?: "default" | "success" | "destructive" | "warning" | "info" }) => {
  const iconClass = "h-4 w-4"
  const iconWrapClass = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-200",
    destructive: "bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-200",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-200",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-900/80 dark:text-sky-200",
  };
  const selectedVariant = variant || "default";
  let icon: React.ReactNode = <CheckCircle className={iconClass} />;

  switch (variant) {
    case "success":
      icon = <CheckCircle className={iconClass} />;
      break;
    case "destructive":
      icon = <AlertCircle className={iconClass} />;
      break;
    case "warning":
      icon = <AlertTriangle className={iconClass} />;
      break;
    case "info":
      icon = <Info className={iconClass} />;
      break;
    default:
      icon = <CheckCircle className={iconClass} />;
      break;
  }

  return (
    <span className={cn("mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconWrapClass[selectedVariant])}>
      {icon}
    </span>
  );
}

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
