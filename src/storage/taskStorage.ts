import AsyncStorage from '@react-native-async-storage/async-storage';
import { isStoredTask } from '../domain/tasks';
import type { Task } from '../types/task';

const storageKey = '@task-manager/tasks';

export type LoadResult =
  | { kind: 'missing' }
  | { kind: 'loaded'; tasks: Task[] }
  | { kind: 'recovery'; message: string };

export async function loadTasks(): Promise<LoadResult> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(storageKey);
  } catch {
    return { kind: 'recovery', message: 'Không thể tải danh sách công việc.' };
  }
  if (raw === null) return { kind: 'missing' };

  try {
    const data: unknown = JSON.parse(raw);
    if (Array.isArray(data) && data.every(isStoredTask) &&
      new Set(data.map(task => task.id)).size === data.length) {
      return { kind: 'loaded', tasks: data };
    }
  } catch {
    // Dữ liệu gốc được giữ lại để người dùng quyết định cách phục hồi.
  }
  return { kind: 'recovery', message: 'Dữ liệu công việc đã lưu không hợp lệ.' };
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
}

export async function resetTasksAfterConfirmation(): Promise<void> {
  await saveTasks([]);
}
