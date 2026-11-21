import type { Task, TaskFieldErrors, TaskFilter, TaskInput, TaskStats } from '../types/task';

export const emptyInput: TaskInput = { title: '', description: '', priority: 'medium', dueDate: '' };
export const priorityLabels = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' } as const;

type Fields = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>;

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateTaskFields(input: TaskInput): { fields: Fields; errors: TaskFieldErrors } {
  const title = input.title.trim();
  const description = input.description.trim();
  const dueDate = input.dueDate.trim() || null;
  const errors: TaskFieldErrors = {};
  if (!title) errors.title = 'Vui lòng nhập tiêu đề.';
  else if ([...title].length > 100) errors.title = 'Tiêu đề tối đa 100 ký tự.';
  if ([...description].length > 300) errors.description = 'Mô tả tối đa 300 ký tự.';
  if (!Object.hasOwn(priorityLabels, input.priority)) errors.priority = 'Vui lòng chọn mức ưu tiên hợp lệ.';
  if (dueDate && !isCalendarDate(dueDate)) errors.dueDate = 'Nhập ngày hợp lệ theo định dạng YYYY-MM-DD.';
  return { fields: { title, description, dueDate, priority: input.priority }, errors };
}

export function isStoredTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<Task>;
  return (
    typeof task.id === 'string' && task.id.trim().length > 0 &&
    typeof task.title === 'string' && task.title === task.title.trim() &&
    [...task.title].length >= 1 && [...task.title].length <= 100 &&
    typeof task.description === 'string' && task.description === task.description.trim() &&
    [...task.description].length <= 300 &&
    typeof task.priority === 'string' && Object.hasOwn(priorityLabels, task.priority) &&
    (task.dueDate === null || (typeof task.dueDate === 'string' && isCalendarDate(task.dueDate))) &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(task.createdAt) &&
    isCalendarDate(task.createdAt.slice(0, 10)) &&
    Number.isFinite(Date.parse(task.createdAt))
  );
}

export function createTask(fields: Fields, tasks: Task[]): Task {
  const createdAt = new Date().toISOString();
  const ids = new Set(tasks.map(task => task.id));
  let sequence = 0;
  while (ids.has(`${createdAt}-${sequence}`)) sequence++;
  return { ...fields, createdAt, id: `${createdAt}-${sequence}`, completed: false };
}

export function visibleTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return tasks.filter(task => filter === 'all' || task.completed === (filter === 'completed'))
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}

export function taskStats(tasks: Task[]): TaskStats {
  const completed = tasks.filter(task => task.completed).length;
  return { total: tasks.length, completed, pending: tasks.length - completed };
}
