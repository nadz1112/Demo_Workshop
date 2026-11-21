# Hợp đồng nội bộ và hành vi UI

Tính năng không gọi API. Tài liệu này xác định hợp đồng TypeScript giữa UI, state và storage.

## Storage API

```ts
export type LoadResult =
  | { kind: "missing" }
  | { kind: "loaded"; tasks: Task[] }
  | { kind: "recovery"; message: string };

export async function loadTasks(): Promise<LoadResult>;
export async function saveTasks(tasks: Task[]): Promise<void>;
export async function resetTasksAfterConfirmation(): Promise<void>;
```

### `loadTasks`

- Không ném lỗi ra UI; chuyển mọi đọc/parsing/validation thành `LoadResult`.
- `missing`: collection hợp lệ rỗng.
- `loaded`: array đã validate.
- `recovery`: dữ liệu gốc hỏng hoặc AsyncStorage không đọc được.

### `saveTasks`

- Chỉ gọi `AsyncStorage.setItem`.
- Reject khi ghi thất bại.
- Caller phải giữ state cũ cho đến khi Promise resolve.

### `resetTasksAfterConfirmation`

- Chỉ được gọi sau xác nhận rõ ràng của người dùng.
- Ghi một JSON array rỗng.
- Không xóa storage key tự động trước khi ghi.

## Mutation contract

Mọi mutation thành công phải tuân theo:

```text
validate input
build nextTasks
await saveTasks(nextTasks)
setTasks(nextTasks)
show success feedback
```

Nếu persistence reject:

```text
keep current tasks
keep form/edit input
show Vietnamese error
do not show success
```

## Component props

### `TaskForm`

```ts
export type TaskFormProps = {
  initialValue: TaskInput;
  mode: "create" | "edit";
  onSave: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
};
```

- `onSave` không được làm mất field data nếu reject.
- `onCancel` trong edit không thay đổi task trong state.

### `TaskItem`

```ts
export type TaskItemProps = {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleCompleted: (taskId: string) => void;
};
```

Hành động luôn resolve task theo `id`, không theo title hoặc index.

### `TaskStats`

```ts
export type TaskStatsProps = {
  stats: TaskStats;
};
```

Stats được App tạo từ toàn bộ `tasks`, không lọc theo filter.

### `TaskFilters`

```ts
export type TaskFiltersProps = {
  activeFilter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
};
```

## UI states

- Loading: ẩn mutation cho đến initial load kết thúc.
- Normal: form + stats + filters + list.
- Empty collection: không có task nào.
- No matches: collection không rỗng nhưng filter không trả task.
- Recovery: tasks rỗng tạm thời và dữ liệu gốc giữ nguyên.
- Storage error: thông báo lỗi, state đã lưu gần nhất giữ nguyên.
