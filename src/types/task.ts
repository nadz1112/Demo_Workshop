export type Priority = 'low' | 'medium' | 'high';
export type TaskFilter = 'all' | 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export type TaskInput = Pick<Task, 'title' | 'description' | 'priority'> & { dueDate: string };
export type TaskFieldErrors = Partial<Record<keyof TaskInput, string>>;
export type TaskStats = { total: number; completed: number; pending: number };
