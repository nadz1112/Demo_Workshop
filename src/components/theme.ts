import { StyleSheet } from 'react-native';

export const colors = {
  background: '#f3f5f1',
  surface: '#ffffff',
  ink: '#172a24',
  muted: '#496057',
  accent: '#145943',
  soft: '#e3efe8',
  border: '#82978b',
  danger: '#9d3028',
  dangerSoft: '#fff0ed',
};

export const ui = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 12 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.ink },
  text: { fontSize: 15, color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
  error: { fontSize: 14, color: colors.danger },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
});
