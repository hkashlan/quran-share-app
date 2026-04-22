import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ThemeProvider as RneuiThemeProvider, useTheme as useRneuiTheme } from '@rneui/themed'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { typography } from './typography'
import { spacing } from './spacing'
import { shadows } from './shadows'
import { themeMap, ThemeName } from './rneui'

// ─── Constants ───────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'khatmah:theme'
const VALID_THEMES: ThemeName[] = ['default', 'dark', 'quran']

function isValidTheme(value: unknown): value is ThemeName {
  return VALID_THEMES.includes(value as ThemeName)
}

// ─── ThemeSwitcher context ────────────────────────────────────────────────────

interface ThemeSwitcherContextValue {
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
}

const ThemeSwitcherContext = createContext<ThemeSwitcherContextValue>({
  themeName: 'default',
  setTheme: () => {},
})

export const useThemeSwitcher = () => useContext(ThemeSwitcherContext)

// ─── useTheme — identical public signature to the old hook ───────────────────

export function useTheme() {
  const { theme } = useRneuiTheme()
  const colors = {
    primary:    theme.colors.primary,
    background: theme.colors.background,
    surface:    theme.colors.white,
    text:       theme.colors.black,
    textMuted:  theme.colors.textMuted,
    border:     theme.colors.border,
    error:      theme.colors.error,
    success:    theme.colors.success,
  }
  return {
    colors,
    typography: theme.typography ?? typography,
    spacing:    theme.appSpacing  ?? spacing,
    shadows:    theme.shadows    ?? shadows,
  }
}

// ─── ThemeProvider ────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeState] = useState<ThemeName>('default')
  const [resolved, setResolved] = useState(false)

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (isValidTheme(stored)) setThemeState(stored)
      })
      .catch(() => {
        // Fall back to default silently
      })
      .finally(() => setResolved(true))
  }, [])

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name)
    AsyncStorage.setItem(THEME_STORAGE_KEY, name).catch(() => {
      console.warn('[ThemeProvider] Failed to persist theme:', name)
    })
  }, [])

  // Don't render until we've attempted to load the persisted theme
  if (!resolved) return null

  return (
    <ThemeSwitcherContext.Provider value={{ themeName, setTheme }}>
      <RneuiThemeProvider theme={themeMap[themeName]}>
        {children}
      </RneuiThemeProvider>
    </ThemeSwitcherContext.Provider>
  )
}
