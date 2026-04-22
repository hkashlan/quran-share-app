import { createTheme } from '@rneui/themed'
import type { Theme } from '@rneui/themed'

import { typography } from './typography'
import { spacing } from './spacing'
import { shadows } from './shadows'

// Task 1.2 — RNEUI module augmentation
declare module '@rneui/themed' {
  export interface Colors {
    textMuted: string
    border: string
  }
  export interface Theme {
    typography?: typeof typography
    appSpacing?: typeof spacing
    shadows?: typeof shadows
  }
}

// Task 1.1 — ThemeName type
export type ThemeName = 'default' | 'dark' | 'quran'

const sharedExtensions = { typography, appSpacing: spacing, shadows }

export const defaultTheme = createTheme({
  ...sharedExtensions,
  lightColors: {
    primary:    '#4CAF50',
    background: '#FAFAFA',
    white:      '#FFFFFF', // surface
    black:      '#1A1A1A', // text
    textMuted:  '#757575',
    border:     '#E0E0E0',
    error:      '#D32F2F',
    success:    '#388E3C',
  },
})

export const darkTheme = createTheme({
  ...sharedExtensions,
  mode: 'dark',
  darkColors: {
    primary:    '#66BB6A',
    background: '#121212',
    white:      '#1E1E1E', // surface
    black:      '#E0E0E0', // text
    textMuted:  '#9E9E9E',
    border:     '#333333',
    error:      '#EF5350',
    success:    '#43A047',
  },
})

export const quranTheme = createTheme({
  ...sharedExtensions,
  lightColors: {
    primary:    '#8B6914',
    background: '#F5E6C8',
    white:      '#FDF3DC', // surface
    black:      '#2C1810', // text
    textMuted:  '#7A5C3A',
    border:     '#D4B896',
    error:      '#C62828',
    success:    '#5D4037',
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const themeMap: Record<ThemeName, any> = {
  default: defaultTheme,
  dark:    darkTheme,
  quran:   quranTheme,
}
