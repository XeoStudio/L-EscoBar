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
      "fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[120] flex w-[min(92vw,28rem)] -translate-x-1/2 flex-col gap-3 p-0 sm:left-auto sm:right-5 sm:top-5 sm:w-[24rem] sm:translate-x-0",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-[0_24px_55px_-30px_rgba(15,23,42,0.65)] backdrop-blur-md ring-1 ring-black/5 transition-all duration-300 before:absolute before:inset-y-0 before:left-0 before:w-1 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-40 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-3",
  {
    variants: {
      variant: {
        default: "border-slate-200/90 bg-white/98 text-slate-900 before:bg-slate-400 dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100 dark:before:bg-slate-500",
        success: "border-emerald-200/90 bg-white/98 text-slate-900 before:bg-emerald-500 dark:border-emerald-800/80 dark:bg-slate-900/95 dark:text-slate-100 dark:before:bg-emerald-400",
        destructive: "border-red-200/90 bg-white/98 text-slate-900 before:bg-red-500 dark:border-red-800/80 dark:bg-slate-900/95 dark:text-slate-100 dark:before:bg-red-400",
        warning: "border-amber-200/90 bg-white/98 text-slate-900 before:bg-amber-500 dark:border-amber-800/80 dark:bg-slate-900/95 dark:text-slate-100 dark:before:bg-amber-400",
        info: "border-sky-200/90 bg-white/98 text-slate-900 before:bg-sky-500 dark:border-sky-800/80 dark:bg-slate-900/95 dark:text-slate-100 dark:before:bg-sky-400",
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
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
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
      "absolute right-2.5 top-2.5 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
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
    className={cn("text-[13px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100", className)}
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
    className={cn("text-[12.5px] leading-snug text-slate-600 dark:text-slate-300", className)}
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
    default: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
    success: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:ring-emerald-800",
    destructive: "bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-900/50 dark:text-red-200 dark:ring-red-800",
    warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:ring-amber-800",
    info: "bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/50 dark:text-sky-200 dark:ring-sky-800",
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
