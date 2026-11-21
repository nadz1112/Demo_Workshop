# Mô hình dữ liệu

## Task

```ts
export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};
```

### Trường

| Trường | Kiểu | Validation | Ghi chú |
| --- | --- | --- | --- |
| `id` | string | không rỗng, duy nhất trong collection | tạo bằng UUID hoặc API runtime ổn định; không đổi |
| `title` | string | trim, 1–100 Unicode code point | bắt buộc |
| `description` | string | trim, 0–300 Unicode code point | rỗng khi không nhập |
| `priority` | enum | `"low" \| "medium" \| "high"` | mặc định `"medium"` |
| `dueDate` | string hoặc null | `YYYY-MM-DD` hợp lệ hoặc `null` | không giới hạn quá khứ/tương lai |
| `completed` | boolean | true/false | false lúc tạo |
| `createdAt` | ISO string | ISO timestamp hợp lệ | không đổi khi sửa hoặc đổi trạng thái |

## TaskInput

```ts
export type TaskInput = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
};

export type TaskFieldErrors = Partial<
  Record<"title" | "description" | "priority" | "dueDate", string>
>;
```

## TaskFilter

```ts
export type TaskFilter = "all" | "pending" | "completed";
```

## TaskStats

```ts
export type TaskStats = {
  total: number;
  completed: number;
  pending: number;
};
```

## Persistence envelope

AsyncStorage lưu JSON array của `Task` trực tiếp để đơn giản:

```json
[
  {
    "id": "stable-task-id",
    "title": "Viết báo cáo",
    "description": "Hoàn tất phần tổng kết",
    "priority": "high",
    "dueDate": "2026-12-01",
    "completed": false,
    "createdAt": "2026-11-21T10:00:00.000Z"
  }
]
```

Storage key đề xuất: `@task-manager/tasks`.

## Uniqueness và sorting

- Không so sánh task theo title.
- ID phải duy nhất.
- Tạo mới có `completed=false`, `createdAt` mới, `id` mới.
- Sửa chỉ cập nhật `title`, `description`, `priority`, `dueDate`.
- Toggle chỉ đảo `completed`.
- Sort newest-first bằng `createdAt` giảm dần.
- Với timestamp trùng, duy trì thứ tự lưu ban đầu.
