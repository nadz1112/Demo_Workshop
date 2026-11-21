import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, FlatList, Modal, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Control } from './src/components/Control';
import { TaskFilters } from './src/components/TaskFilters';
import { TaskForm } from './src/components/TaskForm';
import { TaskItem } from './src/components/TaskItem';
import { TaskStats } from './src/components/TaskStats';
import { colors, ui } from './src/components/theme';
import { createTask, emptyInput, taskStats, validateTaskFields, visibleTasks } from './src/domain/tasks';
import { loadTasks, resetTasksAfterConfirmation, saveTasks } from './src/storage/taskStorage';
import type { Task, TaskFilter, TaskInput } from './src/types/task';

type Confirmation = { kind: 'reset' } | { kind: 'delete'; task: Task };
type Feedback = { message: string; error?: boolean };

function TaskManager() {
  const { width } = useWindowDimensions();
  const wide = width >= 720;
  const list = useRef<FlatList<Task>>(null);
  const writing = useRef(false);
  const saved = useRef<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [editingId, setEditingId] = useState<string>();
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const editing = tasks.find(task => task.id === editingId);
  const displayed = visibleTasks(tasks, filter);

  useEffect(() => {
    let active = true;
    void loadTasks().then(result => {
      if (!active) return;
      if (result.kind === 'loaded') {
        saved.current = result.tasks;
        setTasks(result.tasks);
      } else if (result.kind === 'recovery') {
        setRecovery(result.message);
        if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(result.message);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  function report(message: string, error = false) {
    setFeedback({ message, error });
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  }

  async function persist(
    change: (current: Task[]) => Task[],
    message: string,
    reset = false,
  ): Promise<boolean> {
    if (writing.current || loading || (reset ? !recovery : Boolean(recovery))) return false;
    writing.current = true;
    setBusy(true);
    setFeedback(undefined);
    try {
      const next = change(saved.current);
      if (reset) await resetTasksAfterConfirmation();
      else await saveTasks(next);
      saved.current = next;
      setTasks(next);
      if (reset) setRecovery(undefined);
      report(message);
      return true;
    } catch {
      report('Không thể lưu thay đổi. Vui lòng thử lại.', true);
      return false;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  async function submit(input: TaskInput) {
    const { fields, errors } = validateTaskFields(input);
    if (Object.keys(errors).length) return false;
    if (!editing) {
      return persist(current => [createTask(fields, current), ...current], 'Đã tạo công việc.');
    }
    const success = await persist(current => current.map(task => task.id === editing.id
      ? { ...task, ...fields }
      : task), 'Đã lưu thay đổi.');
    if (success) setEditingId(undefined);
    return success;
  }

  function edit(id: string) {
    setEditingId(id);
    list.current?.scrollToOffset({ offset: 0, animated: true });
  }

  function requestDelete(id: string) {
    const task = saved.current.find(item => item.id === id);
    if (task) {
      setFeedback(undefined);
      setConfirmation({ kind: 'delete', task });
    }
  }

  function toggle(id: string) {
    void persist(current => current.map(task => task.id === id
      ? { ...task, completed: !task.completed }
      : task), 'Đã cập nhật trạng thái công việc.');
  }

  async function confirm() {
    if (!confirmation) return;
    if (confirmation.kind === 'reset') {
      if (await persist(() => [], 'Đã bắt đầu danh sách mới.', true)) setConfirmation(undefined);
      return;
    }
    const id = confirmation.task.id;
    if (await persist(current => current.filter(task => task.id !== id), 'Đã xóa công việc.')) {
      if (editingId === id) setEditingId(undefined);
      setConfirmation(undefined);
    }
  }

  const disabled = busy || loading || Boolean(recovery);
  const header = (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.title, wide && styles.titleWide]}>Quản lý công việc</Text>
      {!confirmation && feedback && (
        <Text accessibilityRole={feedback.error ? 'alert' : undefined}
          accessibilityLiveRegion="polite" style={[styles.notice, feedback.error && styles.errorNotice]}>
          {feedback.message}
        </Text>
      )}
      {loading && <Text accessibilityLiveRegion="polite" style={ui.muted}>Đang tải công việc…</Text>}
      {recovery && (
        <View style={ui.panel}>
          <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={ui.error}>{recovery}</Text>
          <Control label="Bắt đầu danh sách mới" disabled={busy} onPress={() => {
            setFeedback(undefined);
            setConfirmation({ kind: 'reset' });
          }} />
        </View>
      )}
      {!loading && !recovery && (
        <TaskForm key={editing?.id ?? 'create'} mode={editing ? 'edit' : 'create'}
          initialValue={editing ? { ...editing, dueDate: editing.dueDate ?? '' } : emptyInput}
          disabled={disabled} onSave={submit} onCancel={() => setEditingId(undefined)} />
      )}
      <TaskStats stats={taskStats(tasks)} />
      <Text accessibilityRole="header" style={ui.heading}>Danh sách công việc</Text>
      <TaskFilters activeFilter={filter} onChange={setFilter} />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList ref={list} data={displayed} keyExtractor={task => task.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        contentContainerStyle={[styles.content, wide && styles.contentWide]}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={loading || recovery ? undefined : (
          <View style={ui.panel}>
            <Text style={ui.heading}>{tasks.length ? 'Không có công việc phù hợp' : 'Chưa có công việc nào'}</Text>
            <Text style={ui.muted}>{tasks.length ? 'Chọn bộ lọc khác để xem công việc.' : 'Dùng biểu mẫu ở trên để tạo công việc đầu tiên.'}</Text>
          </View>
        )}
        renderItem={({ item }) => <TaskItem task={item} disabled={disabled}
          onEdit={edit} onDelete={requestDelete} onToggleCompleted={toggle} />}
      />
      <Modal visible={Boolean(confirmation)} transparent animationType={Platform.OS === 'web' ? 'none' : 'fade'}
        onRequestClose={() => { if (!busy) setConfirmation(undefined); }}>
        <View style={styles.overlay}>
          <View accessibilityViewIsModal style={[ui.panel, styles.dialog]}>
            <Text accessibilityRole="header" style={ui.heading}>
              {confirmation?.kind === 'reset' ? 'Bắt đầu danh sách mới?' : 'Xóa công việc?'}
            </Text>
            <Text style={ui.text}>
              {confirmation?.kind === 'delete' ? confirmation.task.title : 'Dữ liệu đã lưu sẽ được thay bằng một danh sách trống.'}
            </Text>
            {feedback?.error && (
              <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={ui.error}>{feedback.message}</Text>
            )}
            <View style={ui.row}>
              <Control label="Hủy" disabled={busy} onPress={() => setConfirmation(undefined)} />
              <Control label={confirmation?.kind === 'reset' ? 'Xác nhận bắt đầu lại' : 'Xác nhận xóa'}
                tone="primary" disabled={busy} onPress={() => void confirm()} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function App() {
  return <SafeAreaProvider><TaskManager /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 840, alignSelf: 'center', padding: 16, paddingBottom: 32 },
  contentWide: { paddingHorizontal: 32, paddingTop: 32 },
  header: { gap: 14, paddingBottom: 14 },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink },
  titleWide: { fontSize: 44 },
  notice: { padding: 12, borderRadius: 12, color: colors.accent, backgroundColor: colors.soft },
  errorNotice: { color: colors.danger, backgroundColor: colors.dangerSoft },
  separator: { height: 10 },
  overlay: { flex: 1, padding: 18, backgroundColor: '#172a2480', alignItems: 'center', justifyContent: 'center' },
  dialog: { width: '100%', maxWidth: 440 },
});
