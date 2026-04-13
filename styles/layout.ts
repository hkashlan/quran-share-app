import { StyleSheet } from 'react-native'
import { spacing } from '@/theme'

export const layout = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center' },
  center:    { alignItems: 'center', justifyContent: 'center' },
  flex1:     { flex: 1 },
  screenPad: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  card:      { borderRadius: 12, padding: spacing.md },
})
