export const colors = {
  primary:    '#4CAF50',
  background: '#FAFAFA',
  surface:    '#FFFFFF',
  text:       '#1A1A1A',
  textMuted:  '#757575',
  border:     '#E0E0E0',
  error:      '#D32F2F',
  success:    '#388E3C',
} as const

export type ColorToken = keyof typeof colors
