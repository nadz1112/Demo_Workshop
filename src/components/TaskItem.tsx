import { StyleSheet, Text, View } from 'react-native';
import { priorityLabels } from '../domain/tasks';
import type { Task } from '../types/task';
import { Control } from './Control';
import { ui } from './theme';

type Props = {
  task: Task;
  disabled: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCompleted: (id: string) => void;
};

export function TaskItem({ task, disabled, onEdit, onDelete, onToggleCompleted }: Props) {
  return (
    <View style={ui.panel}>
      <Text style={[ui.heading, task.completed && styles.completed]}>{task.title}</Text>
      <Text style={ui.muted}>{task.completed ? '✓ Đã hoàn thành' : 'Chờ xử lý'}</Text>
      <Text style={ui.muted}>Ưu tiên {priorityLabels[task.priority]} · {task.dueDate ?? 'Không có ngày đến hạn'}</Text>
      {task.description !== '' && <Text style={ui.text}>{task.description}</Text>}
      <View style={ui.row}>
        <Control label={task.completed ? 'Mở lại' : 'Hoàn thành'} disabled={disabled} onPress={() => onToggleCompleted(task.id)} />
        <Control label="Sửa" disabled={disabled} onPress={() => onEdit(task.id)} />
        <Control label="Xóa" tone="danger" disabled={disabled} onPress={() => onDelete(task.id)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ completed: { textDecorationLine: 'line-through' } });
