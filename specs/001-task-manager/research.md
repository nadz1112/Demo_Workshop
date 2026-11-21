# Nghiên cứu kỹ thuật

## Quyết định đã chọn

### 1. State management

**Quyết định**: dùng `useState` trong `App.tsx`; không dùng Redux, Zustand hoặc context.

**Lý do**: MVP một màn hình, ít state cross-component và không cần state machine hoặc library bổ sung.

**Thay thế**: custom hook/useReducer bị loại vì chỉ tăng boilerplate trong phạm vi này.

### 2. Persistence

**Quyết định**: dùng AsyncStorage qua module riêng.

**Lý do**: được constitution yêu cầu; có trong expo ecosystems và hoạt động Android/iOS/Web khi dependency tương thích SDK.

**Phòng tránh**: không ghi state trước khi initial load hoàn tất; mọi mutation gọi read hoặc state snapshot đã tải xong trước khi setItem.

### 3. UI cross-platform

**Quyết định**: React Native `View`, `Text`, `TextInput`, `Pressable`, `FlatList`, `Modal` và `StyleSheet`.

**Lý do**: Expo Go và React Native Web hỗ trợ bộ component này mà không cần native build.

**Thay thế**: không dùng HTML DOM, CSS browser hoặc Alert-only APIs trong business logic.

### 4. Date input

**Quyết định**: text input `YYYY-MM-DD` kèm validation thủ công.

**Lý do**: tránh dependency/native date picker và giữ hành vi nhất quán trên 3 nền tảng.

**Validation**: regex và kiểm tra ngày/tháng/năm thực; không dùng `Date.parse` làm validation duy nhất vì có thể normalize ngày không hợp lệ.

### 5. Confirmation

**Quyết định**: `Modal` React Native cross-platform.

**Lý do**: có thể giao diện nhất quán hơn native Alert; hỗ trợ visible focus và cancel/confirm trên Web.

**Thay thế**: không dùng `window.confirm` hay API browser-specific.

### 6. Sắp xếp

**Quyết định**: sort theo `createdAt` ISO giảm dần. Duplicate timestamp được giữ theo thứ tự bộ sưu tập đã tải.

**Lý do**: model yêu cầu `createdAt`; không thay đổi timestamp khi edit/status đổi.

**Chú ý**: dữ liệu storage cũ có thể không có `createdAt`; model validation coi đó là corrupted thay vì cố đoán thứ tự.

### 7. Unicode

**Quyết định**: trim bằng `trim()` và đếm code point bằng `Array.from`.

**Lý do**: spec yêu cầu giới hạn theo ký tự Unicode, không theo UTF-16 code unit.

## Compatibility

Không có cấu hình Expo hiện tại trong workspace để xác định SDK chính xác. Do đó:

- Không thay đổi/expose exact SDK version trong plan.
- Implementation bắt đầu bằng đọc `package.json` và `app.json`/`app.config.*`.
- Chỉ dùng API/package có trong hoặc tương thích Expo SDK đã cài.
- Chạy `npx expo-doctor` trước và sau thay đổi manifest/package.
