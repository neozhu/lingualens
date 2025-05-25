"use client"

import { THEMES } from "@/lib/themes"
import { useThemeConfig } from "./active-theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Paintbrush } from "lucide-react"
import { useTranslations } from "next-intl"

export function ThemeSelector() {
  const { setActiveTheme } = useThemeConfig()
  const t = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t('tooltip.selectTheme')}>
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('tooltip.selectTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setActiveTheme(theme.value)}
          >
            {t(`themes.${theme.value}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}