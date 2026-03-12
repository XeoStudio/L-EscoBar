"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastIcon,
} from "@/components/ui/toast"

type ToastVariant = "default" | "success" | "destructive" | "warning" | "info"

const SYMBOL_ONLY_TITLES = new Set(["✅", "❌", "⚠️", "⚠", "🚫", "ℹ️", "ℹ"])

const LABELS = {
  en: {
    defaultTitle: "Notification",
    successTitle: "Success",
    errorTitle: "Error",
    warningTitle: "Warning",
    infoTitle: "Info",
    defaultDescription: "You have a new update.",
    successDescription: "Action completed successfully.",
    errorDescription: "Something went wrong. Please try again.",
    warningDescription: "Please review this action before continuing.",
    infoDescription: "Here is an update for you.",
  },
  fr: {
    defaultTitle: "Notification",
    successTitle: "Succes",
    errorTitle: "Erreur",
    warningTitle: "Attention",
    infoTitle: "Info",
    defaultDescription: "Vous avez une nouvelle mise a jour.",
    successDescription: "Action terminee avec succes.",
    errorDescription: "Une erreur est survenue. Veuillez reessayer.",
    warningDescription: "Veuillez verifier cette action avant de continuer.",
    infoDescription: "Voici une mise a jour.",
  },
} as const

const detectLocale = () => {
  if (typeof document === "undefined") return "en" as const
  return document.documentElement.lang.startsWith("fr") ? "fr" as const : "en" as const
}

const cleanTitle = (title?: React.ReactNode) => {
  if (typeof title !== "string") return title
  return title.replace(/^[\u2700-\u27BF\u{1F300}-\u{1FAFF}\s]+/gu, "").trim()
}

const normalizeToastContent = (title: React.ReactNode, description: React.ReactNode, variant: ToastVariant) => {
  const locale = detectLocale()
  const labels = LABELS[locale]
  const cleanedTitle = cleanTitle(title)
  const isSymbolTitle = typeof title === "string" && SYMBOL_ONLY_TITLES.has(title.trim())

  const fallbackTitleByVariant: Record<ToastVariant, string> = {
    default: labels.defaultTitle,
    success: labels.successTitle,
    destructive: labels.errorTitle,
    warning: labels.warningTitle,
    info: labels.infoTitle,
  }

  const fallbackDescriptionByVariant: Record<ToastVariant, string> = {
    default: labels.defaultDescription,
    success: labels.successDescription,
    destructive: labels.errorDescription,
    warning: labels.warningDescription,
    info: labels.infoDescription,
  }

  const normalizedTitle = !cleanedTitle || isSymbolTitle ? fallbackTitleByVariant[variant] : cleanedTitle
  const normalizedDescription = description || fallbackDescriptionByVariant[variant]

  return { normalizedTitle, normalizedDescription }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider swipeDirection="right" duration={3200}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const resolvedVariant = (variant || "default") as ToastVariant
        const { normalizedTitle, normalizedDescription } = normalizeToastContent(
          title,
          description,
          resolvedVariant
        )

        return (
          <Toast key={id} variant={resolvedVariant} {...props}>
            <div className="flex w-full items-start gap-3 pr-8">
              <ToastIcon variant={resolvedVariant} />
              <div className="grid flex-1 gap-1.5">
                <ToastTitle>{normalizedTitle}</ToastTitle>
                <ToastDescription>{normalizedDescription}</ToastDescription>
                {action ? <div className="pt-1">{action}</div> : null}
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
