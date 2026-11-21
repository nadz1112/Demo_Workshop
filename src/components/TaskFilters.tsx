import { View } from 'react-native';
import type { TaskFilter } from '../types/task';
import { Control } from './Control';
import { ui } from './theme';

const filters = { all: 'Tất cả', pending: 'Chờ xử lý', completed: 'Đã hoàn thành' } as const;

export function TaskFilters({ activeFilter, onChange }: {
  activeFilter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}) {
  return (
    <View style={ui.row}>
      {(Object.keys(filters) as TaskFilter[]).map(filter => (
        <Control key={filter} label={filters[filter]} selected={activeFilter === filter}
          onPress={() => onChange(filter)} />
      ))}
    </View>
  );
}
