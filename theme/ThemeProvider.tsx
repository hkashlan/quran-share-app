import React, { createContext, useContext } from 'react'
import { theme, Theme } from './index'

const ThemeContext = createContext<Theme>(theme)

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
