# Demo_Workshop

Ứng dụng quản lý công việc cá nhân bằng React Native, TypeScript và Expo SDK 58. Giao diện tiếng Việt hỗ trợ tạo, sửa, xóa có xác nhận, hoàn thành, mở lại, lọc và xem thống kê. Công việc được lưu cục bộ bằng AsyncStorage trên thiết bị hoặc theo nguồn gốc trang Web.

## Cài đặt và chạy

Cần Node.js 22.13 trở lên, npm, trình duyệt cho Web và bản Expo Go tương thích SDK 58 cho thiết bị di động. Expo SDK 58 yêu cầu iOS 16.4 trở lên.

```sh
npm ci
npx expo start
```

- Android mở Expo Go và quét mã QR. Nếu bản từ cửa hàng không khớp SDK, chọn bản SDK 58 từ [Expo Go](https://expo.dev/go).
- iOS mở mã QR bằng Camera hoặc Expo Go. Xem [hướng dẫn về phiên bản Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/) nếu thiết bị báo lệch SDK.
- Web nhấn `w` trong Expo CLI hoặc chạy `npx expo start --web`.

## Kiểm tra

```sh
npx tsc --noEmit
npx expo-doctor
npx expo export --platform all
```

`App.tsx` điều phối giao diện và lưu dữ liệu. `src/components/` chứa thành phần dùng chung, `src/domain/` chứa quy tắc công việc, `src/types/` định nghĩa kiểu, và `src/storage/` quản lý AsyncStorage.

Xem [đặc tả](specs/001-task-manager/spec.md), [các bước kiểm thử](specs/001-task-manager/quickstart.md) và [trạng thái triển khai](specs/001-task-manager/tasks.md).
