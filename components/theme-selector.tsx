"use client"

import { DEFAULT_THEMES, COLOR_THEMES } from "@/lib/themes"
import { useThemeConfig } from "./active-theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Paintbrush } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils" // Import cn utility for conditionally merging classnames

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()  // Get the activeTheme
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
        <DropdownMenuGroup>
          {DEFAULT_THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => setActiveTheme(theme.value)}
              className={cn(
                activeTheme === theme.value && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {t(`themes.${theme.value}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-sm text-muted-foreground">{t('themes.colors') || 'Colors'}</DropdownMenuLabel>
          {COLOR_THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => setActiveTheme(theme.value)}
              className={cn(
                activeTheme === theme.value && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {t(`themes.${theme.value}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}