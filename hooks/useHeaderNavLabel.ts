"use client"

import { useMessages } from "next-intl"
import type { HeaderNavLink } from "@/data/headerNavLinks"

export function useHeaderNavLabel() {
  const messages = useMessages()
  const home = (messages?.HomePage ?? {}) as Record<string, string>

  return (link: HeaderNavLink) => home[link.title] ?? link.label
}
