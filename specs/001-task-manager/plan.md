# Kế hoạch triển khai kỹ thuật: Task Manager Expo

**Mã tính năng**: `001-task-manager`
**Ngày tạo**: 2026-11-21
**Trạng thái**: Draft

## 1. Tổng quan

Triển khai MVP một màn hình bằng React Native, Expo và TypeScript. Mã nguồn dùng chung cho Android Expo Go, iOS Expo Go và Expo Web; không thêm navigation library, backend hoặc native module tùy chỉnh.

Hiện workspace chỉ chứa specification và constitution, chưa có `package.json`, `app.json`, `app.config.*` hoặc source Expo. Kế hoạch này không tạo lại dự án và không thay thế cấu hình. Khi implementation bắt đầu, agent phải phát hiện SDK/package đang cài từ dự án thực tế; không được nâng SDK hoặc thêm dependency nếu không cần thiết.

## 2. Kiểm tra Constitution

- React Native + Expo + TypeScript: đạt.
- Android, iOS và Web: dùng component React Native và React Native Web có sẵn trong Expo: đạt.
- Expo Go: không dùng native dependency ngoài bộ Expo Go: đạt.
- UI bằng component React Native và `StyleSheet`: đạt.
- Component reusable và phân tách types/storage/business logic/presentation: đạt.
- AsyncStorage: đạt.
- Responsive, accessible và văn bản tiếng Việt: đạt.
- MVP đơn giản: đạt; không backend, navigation hoặc service ngoài phạm vi.
- Compatibility SDK: cần xác minh khi có manifest/package, nhưng kế hoạch không đổi SDK hiện tại.
- Testing: phải có TypeScript check và quy trình kiểm thử Android/iOS/Web: đạt theo thiết kế.

## 3. Cấu trúc mã nguồn

```text
App.tsx
src/
  components/
    TaskForm.tsx
    TaskItem.tsx
    TaskStats.tsx
    TaskFilters.tsx
  types/
    task.ts
  storage/
    taskStorage.ts
```

### Trách nhiệm

- `App.tsx`: tải dữ liệu, giữ trạng thái công việc, filter, form đang sửa, loading/recovery state và điều phối persistence.
- `src/types/task.ts`: khai báo `Task`, priority, filter và dữ liệu form.
- `src/storage/taskStorage.ts`: đọc/ghi AsyncStorage, parse và validate dữ liệu; không import React.
- `TaskForm.tsx`: form tạo/sửa, validation giao diện và giữ dữ liệu nhập khi lưu thất bại.
- `TaskItem.tsx`: hiển thị một công việc, mở form sửa, đổi trạng thái và yêu cầu xóa.
- `TaskStats.tsx`: hiển thị 3 số liệu từ toàn bộ state đã lưu.
- `TaskFilters.tsx`: điều khiển bộ lọc All/Pending/Completed.

## 4. Luồng trạng thái

State chính trong `App.tsx`:

- `tasks: Task[]`
- `activeFilter: TaskFilter`
- `editingTaskId: string | null`
- `isLoading: boolean`
- `storageError: string | null`
- `recoveryRequired: boolean`
- `feedback: { type: "success" | "error"; message: string } | null`

### Khởi động

1. `isLoading` bắt đầu `true`.
2. `useEffect` gọi `loadTasks()` một lần.
3. AsyncStorage không có dữ liệu: `tasks=[]`, không recovery.
4. AsyncStorage chứa dữ liệu hợp lệ: parse, validate và đặt `tasks`.
5. Lỗi đọc hoặc dữ liệu hỏng: `tasks=[]`, `recoveryRequired=true`, hiển thị thông báo tiếng Việt, không ghi đè dữ liệu gốc.
6. Chỉ đặt `isLoading=false` sau khi load kết thúc.

### Ghi dữ liệu

- Không chạy effect ghi state cho đến khi load ban đầu hoàn tất.
- Mỗi mutation nhận state hiện tại đã lưu, tạo state kế tiếp, gọi `saveTasks(nextTasks)`, rồi mới `setTasks(nextTasks)`.
- Trạng thái list và statistics không đổi khi `saveTasks` reject.
- Thao tác sửa/create giữ dữ liệu form để người dùng retry; xóa giữ modal mở hoặc cho phép retry.
- Không có optimistic update trước khi persistence thành công.

## 5. Data model

Chi tiết tại `data-model.md`.

Model runtime dùng:

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

Danh sách mới nhất trước được tính bằng `Date.parse(createdAt)` giảm dần. Khi có createdAt trùng hoặc không thể sắp xếp do dữ liệu, duy trì thứ tự an toàn bằng sequence đã parse ban đầu hoặc thứ tự lưu tương ứng. Sửa, hoàn thành, mở lại và đổi filter không thay đổi `createdAt`.

## 6. Validation

`validateTaskFields(input)` dùng cùng rules cho tạo và sửa:

- Trim `title` và `description`.
- Tiêu đề: 1–100 ký tự Unicode. Với input runtime dùng `Array.from(value).length` để đếm Unicode code point.
- Mô tả: tối đa 300 ký tự Unicode.
- Priority: `low`, `medium`, `high`; mặc định `medium`.
- Due date: chuỗi rỗng được đổi thành `null`; nếu có thì khớp `^\d{4}-\d{2}-\d{2}$` và parse từng thành phần để tránh rollover ngày không hợp lệ.
- Validate dữ liệu đọc AsyncStorage thêm:
  - root phải là JSON array;
  - mọi trường bắt buộc đúng kiểu;
  - `id` không rỗng và duy nhất;
  - title/description tuân limit sau trim;
  - priority thuộc tập hợp;
  - dueDate hợp lệ hoặc null;
  - completed là boolean;
  - createdAt là ISO string hợp lệ.

Dữ liệu hỏng không được render từng phần. Toàn bộ collection được coi không hợp lệ nếu một phần tử sai.

## 7. Persistence

`src/storage/taskStorage.ts` chỉ dùng AsyncStorage và TypeScript.

API nội bộ đề xuất:

```ts
loadTasks(): Promise<Task[]>
saveTasks(tasks: Task[]): Promise<void>
clearRecoveredTasks(): Promise<void>
```

- Storage key không đổi trong suốt vòng đời app, ví dụ `@task-manager/tasks`.
- `loadTasks()` trả về trạng thái phân biệt missing vs corrupted:
  - missing: collection rỗng hợp lệ;
  - valid: tasks;
  - invalid/read-error: recovery result kèm thông báo.
- `saveTasks()` serialize JSON và gọi `AsyncStorage.setItem`.
- Không ghi dữ liệu recovery trước khi người dùng xác nhận reset.
- Reset recovery gọi `saveTasks([])`; nếu thành công mới xóa state recovery và hiển thị empty state.

## 8. UI và responsive

- `TaskForm.tsx`: `TextInput` cho title, description và due date. Due date là text `YYYY-MM-DD`, không thêm thư viện native.
- Priority dùng `Pressable` dạng segmented control hoặc 3 nút accessible.
- `TaskFilters.tsx`: 3 `Pressable` và `accessibilityState`.
- `TaskItem.tsx`: card với Text, completed indication và action buttons.
- Danh sách dùng `FlatList` để hỗ trợ số lượng công việc lớn; `App.tsx` hoặc container dùng `ScrollView` fallback cho form/profile.
- `StyleSheet` với `maxWidth`, padding responsive và media width từ `useWindowDimensions`.
- Không dùng `window`, `document`, DOM, localStorage hoặc browser APIs trong shared logic.
- Trên Web, press/focus semantics React Native Web phải giữ visible focus.
- Confirm delete dùng `Modal` React Native hoặc Alert cross-platform wrapper. Modal hiện là component duy nhất và phải hỗ trợ Cancel/Confirm.

## 9. Xử lý lỗi và empty state

- Validation lỗi: `Text` tiếng Việt gắn bằng `accessibilityLabel`/`accessibilityHint`, giữ form.
- Storage load error: banner tiếng Việt, tasks=[], no fake success, filter vẫn hoạt động.
- Corrupt data: recovery banner/modal với xác nhận bắt đầu danh sách mới.
- Write error: banner toàn ứng dụng, không thay đổi state đã lưu, form/retry action được giữ.
- Empty collection: “Chưa có công việc nào”.
- Collection có task nhưng active filter không có kết quả: “Không có công việc phù hợp”.

## 10. Kiến trúc testing

Không thay source để mock framework không có sẵn. Khi implementation có package testing phù hợp SDK, ưu tiên test logic thuần trước:

- Unit: Unicode trimming/count; title/description validation; due date; unique ID; newest sort; filter; statistics.
- Storage: missing key, valid JSON, malformed JSON, invalid shape, save success/failure.
- Component/manual: form, edit cancel/save, delete confirm/cancel, status toggle, empty states.
- TypeScript: `npx tsc --noEmit` nếu workspace cài TypeScript.
- Expo: `npx expo-doctor`, `npx expo start` và launch Android/iOS/Web theo SDK hiện tại.

## 11. Kế hoạch implementation theo pha

1. Xác minh và giữ nguyên Expo manifest/package/SDK hiện có.
2. Tạo types, validation và storage module.
3. Tạo reusable form, item, filters và stats.
4. Tích hợp state/load/mutation trong `App.tsx`.
5. Thêm recovery, write error và confirmation flows.
6. Responsive và accessibility pass.
7. Chạy TypeScript, Expo Doctor và smoke test 3 nền tảng.
8. Chạy regression CRUD/persistence/filter/scenario corruption.

## 12. Complexity tracking

Không có constitution violation dự kiến. Không có navigation, backend, native dependency hay abstraction không cần.
