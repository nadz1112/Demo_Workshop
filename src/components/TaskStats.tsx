import { StyleSheet, Text, View } from 'react-native';
import type { TaskStats as Stats } from '../types/task';
import { colors, ui } from './theme';

export function TaskStats({ stats }: { stats: Stats }) {
  const entries = [
    ['Tổng số', stats.total], ['Đã hoàn thành', stats.completed], ['Chờ xử lý', stats.pending],
  ] as const;
  return (
    <View style={ui.row}>
      {entries.map(([label, count]) => (
        <View key={label} style={styles.stat}>
          <Text style={ui.muted}>{label}</Text>
          <Text style={styles.count}>{count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { flexGrow: 1, flexBasis: 95, padding: 12, borderRadius: 14, backgroundColor: colors.soft, gap: 4 },
  count: { fontSize: 26, fontWeight: '700', color: colors.accent },
});
