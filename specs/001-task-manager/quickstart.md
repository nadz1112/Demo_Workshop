# Hướng dẫn triển khai và kiểm thử

## Điều kiện

1. Node.js và npm tương thích với Expo SDK hiện có.
2. Android hoặc iOS có Expo Go.
3. Trình duyệt để chạy Expo Web.
4. Expo CLI khả dụng qua `npx expo`.

## Trước khi implementation

Từ thư mục dự án, kiểm tra:

```powershell
Get-ChildItem -Force
Get-Content package.json
npx expo-doctor
npx tsc --noEmit
```

Không tạo dự án mới, không xóa hoặc thay thế `app.json`, `app.config.*`, `package.json` hoặc lockfile trừ khi có yêu cầu implementation riêng đã được duyệt.

## Chạy ứng dụng

Sau khi implementation được thực hiện trong dự án Expo hiện có:

```powershell
npm install
npx expo start
```

- Android: quét QR bằng Expo Go.
- iOS: quét QR bằng Camera hoặc Expo Go.
- Web: chọn Web hoặc chạy `npx expo start --web`.

Không dùng custom native module hoặc EAS build để đáp ứng MVP.

## Kiểm tra TypeScript

```powershell
npx tsc --noEmit
```

Mọi data boundary AsyncStorage phải được validate trước khi cast sang `Task[]`.

## Smoke test thủ công

1. Mở lần đầu: hiển thị form mặc định medium và empty state.
2. Tạo công việc title-only: pending, description rỗng, dueDate null.
3. Tạo công việc trùng title: hai công việc độc lập.
4. Thử title rỗng, 101 ký tự, description 301 ký tự và dueDate sai.
5. Sửa và hủy sửa: chỉ lưu khi chọn Lưu.
6. Xóa: hủy không đổi, xác nhận xóa đúng task.
7. Hoàn thành/mở lại: trạng thái đổi, createdAt không đổi.
8. Lọc All/Pending/Completed; thống kê không đổi theo filter.
9. Đóng/mở app: dữ liệu AsyncStorage được khôi phục.
10. Ghi dữ liệu hỏng trong AsyncStorage: app hiện recovery và không ghi đè.

## Test 3 nền tảng

- Android Expo Go: tạo/sửa/xóa/toggle/filter/persist.
- iOS Expo Go: tạo/sửa/xóa/toggle/filter/persist.
- Expo Web: thêm navigation bàn phím, visible focus và resize.
- Chạy viewport điện thoại, tablet và desktop; không tràn ngang.
