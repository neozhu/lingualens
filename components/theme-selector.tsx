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
import { Check, Paintbrush } from "lucide-react"

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  // 找到当前主题的名称，用于显示在按钮上
  const currentThemeName = THEMES.find(theme => theme.value === activeTheme)?.name || "主题"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 justify-between">
          <Paintbrush className="h-4 w-4" />
          <span className="truncate">{currentThemeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setActiveTheme(theme.value)}
            className="flex items-center justify-between"
          >
            {theme.name}
            {activeTheme === theme.value && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}