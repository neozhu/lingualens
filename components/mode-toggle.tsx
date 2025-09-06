"use client"

import * as React from "react"

import { useTheme } from "next-themes"
import { ThemeToggleButton, useThemeTransition  } from "./theme-toggle-button";


export function ModeToggle() {
  const { setTheme,resolvedTheme  } = useTheme();
  const { startTransition } = useThemeTransition()

  const handleThemeToggle = React.useCallback(() => {
    startTransition(() => {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    })
  }, [resolvedTheme, setTheme, startTransition])

  return (
    <ThemeToggleButton 
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          onClick={handleThemeToggle}
          variant="circle"
          start="center"
        />
  )
}
