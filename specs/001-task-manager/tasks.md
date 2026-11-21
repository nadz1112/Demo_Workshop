# Công việc triển khai Task Manager Expo

**Tính năng** `001-task-manager`  
**Nguồn** [Đặc tả](spec.md), [kế hoạch](plan.md), [mô hình dữ liệu](data-model.md), [hợp đồng](contracts.md), [nghiên cứu](research.md), [hướng dẫn kiểm thử](quickstart.md) và [hiến pháp](../../.specify/memory/constitution.md).

Các đường dẫn mã nguồn tính từ gốc dự án Expo. Khi triển khai, hoàn thành các công việc phụ thuộc trước khi tích hợp. Ưu tiên một luồng chạy được từ mở ứng dụng đến tạo, hiển thị và khôi phục công việc đã lưu, sau đó hoàn thiện sửa, xóa, đổi trạng thái, bộ lọc và thống kê. Các cột **Đạt khi** là điều kiện để đánh dấu hoàn thành.

## Giai đoạn 1 – Chuẩn bị dự án

| Công việc và đường dẫn | Phụ thuộc | Đạt khi |
| --- | --- | --- |
| **T001** [x] Xác minh cấu hình Expo và TypeScript tại `package.json`, `app.json` hoặc `app.config.*`, `tsconfig.json` và entry point. | — | Xác định được thư mục Expo, SDK, entry point và cấu hình TypeScript. Workspace hiện chỉ có tài liệu. Nếu vẫn thiếu dự án Expo, cần có dự án hiện hữu hoặc phê duyệt riêng để khởi tạo trước khi tiếp tục. |
| **T002** [x] Xác minh dependency trong `package.json` và lockfile. | T001 | Xác minh Expo, React, React Native, TypeScript, hỗ trợ Expo Web và `@react-native-async-storage/async-storage` tương thích SDK và Expo Go. Chạy `npx expo-doctor` để kiểm tra. Nếu thiếu package cần thiết, xác định phiên bản tương thích theo SDK thực tế và xác minh lại sau khi bổ sung theo phạm vi đã duyệt. |
| **T003** [x] Tạo `src/components/`, `src/types/`, `src/storage/` và `src/domain/`. | T001 | Cấu trúc hỗ trợ entry point của dự án và phân chia rõ giao diện, kiểu dữ liệu, logic thuần và lưu trữ. |

## Giai đoạn 2 – Lớp dữ liệu

| Công việc và đường dẫn | Phụ thuộc | Đạt khi |
| --- | --- | --- |
| **T004** [x] Định nghĩa interface `Task` và các kiểu `Priority`, `TaskInput`, `TaskFieldErrors`, `TaskFilter`, `TaskStats` tại `src/types/task.ts`. | T003 | Đủ `id`, `title`, `description`, `priority`, `dueDate`, `completed`, `createdAt`. Dùng enum chữ thường theo mô hình dữ liệu, ngày lưu là `YYYY-MM-DD` hoặc `null`, ngày trong form là chuỗi. |
| **T005** [x] Viết quy tắc dữ liệu dùng chung tại `src/domain/tasks.ts`. | T004 | Chuẩn hóa tiêu đề và mô tả bằng trim, đếm Unicode code point, giới hạn 1–100 và 0–300, kiểm tra ưu tiên và ngày lịch thực kể cả năm nhuận. Ngày trống thành `null`, ngày hợp lệ quá khứ và tương lai được chấp nhận. Lỗi form có thông báo tiếng Việt theo trường. AC-02–05, AC-14, AC-17. |
| **T006** [x] Triển khai `loadTasks`, `saveTasks`, `resetTasksAfterConfirmation` tại `src/storage/taskStorage.ts`. | T002, T004, T005 | Dùng một key `@task-manager/tasks` và lưu mảng JSON. Trả `missing`, `loaded` hoặc `recovery` theo hợp đồng. Kiểm tra toàn bộ mảng trước khi trả dữ liệu, gồm kiểu và trường bắt buộc, ID rỗng/trùng, enum, ngày, boolean và timestamp ISO. Lỗi đọc/parse được chuyển thành kết quả phục hồi. Lỗi ghi được trả cho caller. Reset ghi mảng rỗng sau xác nhận và không xóa key trước. AC-38–44. |
| **T007** [x] Điều phối tải an toàn, phục hồi và ghi tại `App.tsx`. | T006 | Chặn thao tác ghi trong lúc tải, dùng snapshot đã lưu và tuần tự hóa ghi để tránh ghi đè từ thao tác liên tiếp. Chỉ cập nhật danh sách và báo thành công sau khi ghi xong. Khi lỗi đọc hoặc dữ liệu hỏng, hiển thị danh sách phục hồi tạm thời và thông báo tiếng Việt, vẫn dùng được bộ lọc, giữ dữ liệu gốc cho đến khi xác nhận bắt đầu danh sách mới. Hủy hoặc reset thất bại giữ trạng thái phục hồi. Lỗi ghi thường giữ danh sách, thống kê và dữ liệu form để thử lại. AC-18, AC-23, AC-28, AC-38–44. |

## Giai đoạn 3 – Giao diện người dùng

| Công việc và đường dẫn | Phụ thuộc | Đạt khi |
| --- | --- | --- |
| **T008** [x] Dựng màn hình chính tại `App.tsx`. | T007 | Có bố cục một màn hình với form, bộ lọc, thống kê, danh sách `FlatList` cuộn được và thông báo trạng thái tải, phục hồi, thành công hoặc lỗi bằng tiếng Việt. Danh sách dùng ID làm key. AC-08, AC-41–44. |
| **T009** [x] Dựng form dùng chung tại `src/components/TaskForm.tsx`. | T004, T005 | Có tiêu đề, mô tả tùy chọn, ba lựa chọn ưu tiên và ngày tùy chọn với định dạng hiển thị. Mặc định Trung bình. Chế độ sửa hiển thị giá trị hiện tại và nút Lưu, Hủy. Hiển thị lỗi cạnh trường và giữ bản nhập khi gửi thất bại. AC-01, AC-04–05, AC-13–17. |
| **T010** [x] Dựng thẻ công việc tại `src/components/TaskItem.tsx`. | T004 | Hiển thị tiêu đề, mô tả khi có, ưu tiên, ngày hoặc nhãn không có ngày, trạng thái và nút thao tác theo ID. Hiển thị nội dung người dùng bằng React Native `Text`. Dấu hiệu hoàn thành có thể nhận biết qua văn bản ngoài màu sắc. AC-08, AC-10, AC-25. |
| **T011** [x] Dựng điều khiển lọc và thống kê tại `src/components/TaskFilters.tsx`, `src/components/TaskStats.tsx`. | T004 | Có ba bộ lọc tiếng Việt với trạng thái đang chọn và ba chỉ số Tổng, Đã hoàn thành, Chờ xử lý nhận qua props. AC-29, AC-34. |
| **T012** [x] Hoàn thiện responsive và khả năng truy cập tại `App.tsx` và các component trong `src/components/`. | T008–T011 | Dùng `StyleSheet` và bố cục mobile-first. Danh sách, form và các nút không tràn ngang ở điện thoại, tablet và Web. Xoay màn hình hoặc đổi kích thước giữ dữ liệu đang nhập. Có vùng chạm đủ lớn, tên truy cập, focus nhìn thấy trên Web và thông báo có thể được công nghệ hỗ trợ nhận biết. AC-12, AC-45–48, EC-12. |

## Giai đoạn 4 – Chức năng cốt lõi

| Công việc và đường dẫn | Phụ thuộc | Đạt khi |
| --- | --- | --- |
| **T013** [x] Tích hợp validation vào tạo và sửa tại `src/components/TaskForm.tsx`, `App.tsx` và `src/domain/tasks.ts`. | T005, T007, T009 | Dữ liệu đúng biên 100/300 được chấp nhận. Tiêu đề rỗng sau trim, 101/301 ký tự, ưu tiên ngoài tập hợp và ngày sai được báo lỗi đúng trường. Giữ bản nhập và không ghi khi validation thất bại. AC-03–05, AC-14, AC-17. |
| **T014** [x] Tích hợp tạo công việc tại `App.tsx`, `src/domain/tasks.ts` và `src/components/TaskForm.tsx`. | T007–T010, T013 | Công việc có ID duy nhất, timestamp ISO, trạng thái Chờ xử lý và mặc định Trung bình. Cho phép trùng tiêu đề. Sau khi ghi thành công, công việc xuất hiện trên đầu khi khớp bộ lọc, form được xóa và đặt lại mặc định, có thông báo tiếng Việt. AC-02, AC-06–07, AC-09, AC-24, AC-38, AC-43. |
| **T015** [x] Tích hợp sửa tại `App.tsx`, `src/domain/tasks.ts` và `src/components/TaskForm.tsx`. | T014 | Sửa theo ID bằng form hiện có. Lưu cập nhật bốn trường cho phép, hỗ trợ xóa mô tả và ngày, giữ ID, trạng thái và thứ tự. Hủy không ghi. Lỗi lưu giữ nguyên bản đã lưu và dữ liệu sửa. AC-07, AC-13–18, AC-38, AC-43. |
| **T016** [x] Tích hợp xóa tại `App.tsx` và `src/components/TaskItem.tsx`. | T012, T014 | Hộp thoại React Native `Modal` hiển thị tên công việc dưới dạng văn bản và có Hủy/Xác nhận bằng tiếng Việt. Hủy không ghi, xác nhận chỉ xóa ID đã chọn. Hỗ trợ bàn phím, focus nhìn thấy và thử lại khi ghi lỗi. AC-19–23, AC-38, AC-46–47. |
| **T017** [x] Tích hợp Hoàn thành/Mở lại tại `App.tsx`, `src/domain/tasks.ts` và `src/components/TaskItem.tsx`. | T014 | Chỉ đảo `completed` của ID đã chọn, giữ các trường và thứ tự. Giao diện đổi sau khi ghi thành công. Khi lỗi ghi, giữ trạng thái gần nhất và báo lỗi bằng tiếng Việt. AC-24–28, AC-38. |

## Giai đoạn 5 – Hoàn thiện MVP

| Công việc và đường dẫn | Phụ thuộc | Đạt khi |
| --- | --- | --- |
| **T018** [x] Tích hợp lọc và sắp xếp tại `App.tsx`, `src/domain/tasks.ts` và `src/components/TaskFilters.tsx`. | T011, T014, T017 | Mở ứng dụng ở Tất cả. Chuyển bộ lọc tức thời và giữ mới nhất trước theo `createdAt`, với timestamp bằng nhau giữ thứ tự lưu. Tạo trong Đã hoàn thành giữ nguyên bộ lọc. Hoàn thành mục Chờ xử lý cuối cùng loại mục khỏi danh sách sau khi ghi thành công. AC-09, AC-29–33, EC-06–07. |
| **T019** [x] Tính thống kê tại `src/domain/tasks.ts`, `App.tsx` và `src/components/TaskStats.tsx`. | T011, T014–T017 | Tính tổng, hoàn thành, chờ xử lý từ toàn bộ snapshot đã lưu. Mọi thao tác thành công phản ánh đúng kết quả, bộ lọc và lỗi ghi không làm sai số liệu, danh sách rỗng có ba số 0. AC-22, AC-33–37, AC-43. |
| **T020** [x] Tích hợp và xác minh khôi phục tại `App.tsx` và `src/storage/taskStorage.ts`. | T007, T014–T018 | Mở lại cùng thiết bị và môi trường lưu trữ khôi phục đủ trường, trạng thái và thứ tự gần nhất đã lưu. Lần đầu không có key mở danh sách rỗng. JSON hỏng, cấu trúc sai hoặc lỗi đọc kích hoạt phục hồi mà không tự ghi lại. AC-38–44. |
| **T021** [x] Hoàn thiện trạng thái rỗng tại `App.tsx`. | T018–T020 | Danh sách rỗng hiển thị “Chưa có công việc nào” và hướng dẫn tạo. Bộ lọc không khớp hiển thị “Không có công việc phù hợp”. Trạng thái tải và phục hồi có thông báo riêng. Xóa mục cuối cùng đặt cả ba số liệu về 0 sau khi lưu. AC-11, AC-22, AC-31–32, AC-37, AC-40–44. |

## Giai đoạn 6 – Kiểm thử

| Công việc và đường dẫn | Phụ thuộc | Đạt khi |
| --- | --- | --- |
| **T022** [x] Chạy kiểm tra TypeScript, SDK và logic tại `tsconfig.json`, `package.json`, `src/domain/tasks.ts`, `src/storage/taskStorage.ts`. | T012, T015–T017, T021 | `npx tsc --noEmit` và `npx expo-doctor` đạt. Kiểm tra trim/Unicode, ngày nhuận và ngày sai, ID, sắp xếp khi trùng timestamp, lọc, thống kê, dữ liệu thiếu/hỏng và lỗi ghi. Dùng bộ kiểm thử tương thích SDK nếu đã có, nếu không ghi lại các bước kiểm tra thủ công và kết quả. SC-02–03. |
| **T023** [ ] Chạy Android Expo Go từ `App.tsx` theo `specs/001-task-manager/quickstart.md`. | T022 | Xác minh tạo, xem, sửa/hủy, xóa/hủy, hoàn thành/mở lại, lọc, thống kê và đóng/mở lại để khôi phục. Kiểm tra bố cục điện thoại, vùng chạm và ghi thiết bị, SDK, kết quả. SC-01, SC-04–05. |
| **T024** [ ] Chạy iOS Expo Go từ `App.tsx` theo `specs/001-task-manager/quickstart.md`. | T022 | Chạy đủ luồng như T023 trên iOS. Kiểm tra bố cục và khả năng thao tác bằng VoiceOver, ghi thiết bị, SDK, kết quả. SC-01, SC-04–05. |
| **T025** [ ] Chạy Expo Web từ `App.tsx` theo `specs/001-task-manager/quickstart.md`. | T022 | Chạy đủ luồng như T023, kiểm tra bàn phím và focus của form, bộ lọc, danh sách và modal. Kiểm tra thông báo với trình đọc màn hình, resize ở kích thước điện thoại, tablet và desktop, khôi phục trên cùng origin. Ghi trình duyệt và kết quả. SC-01, SC-04–05. |
| **T026** [ ] Đối chiếu toàn bộ tiêu chí trong `specs/001-task-manager/spec.md` và ghi kết quả tại `specs/001-task-manager/quickstart.md`. | T023–T025 | Mỗi AC-01–48 có kết quả và môi trường kiểm tra. Bao phủ EC-01–12 và SC-01–05, gồm tiêu đề trùng, văn bản HTML-like, ngày và Unicode biên, lỗi đọc/ghi, dữ liệu hỏng và xác nhận reset. Dùng dữ liệu kiểm thử để xác minh lỗi. Chạy lại luồng bị ảnh hưởng sau sửa lỗi. Đánh dấu chưa xác minh nếu thiếu thiết bị hoặc môi trường tương ứng. |

## Giai đoạn 7 – Tài liệu

| Công việc và đường dẫn | Phụ thuộc | Đạt khi |
| --- | --- | --- |
| **T027** [x] Viết `README.md` bằng tiếng Việt. | T022 | Giới thiệu MVP, các chức năng, cấu trúc mã nguồn, lưu cục bộ theo thiết bị hoặc trình duyệt và liên kết đến tài liệu tính năng. |
| **T028** [ ] Hoàn thiện hướng dẫn cài đặt, chạy và kiểm thử tại `README.md`, `specs/001-task-manager/quickstart.md`. | T026, T027 | Nêu SDK thực tế, prerequisite Node.js/npm, Expo Go và trình duyệt, lệnh cài theo lockfile, `npx expo start`, cách mở Android/iOS Expo Go và `npx expo start --web`. Có lệnh TypeScript/Expo Doctor, bước kiểm thử và phân biệt kết quả tự động với thủ công. Đối chiếu hướng dẫn với môi trường đã chạy. |

## Truy vết hiến pháp

| Nguyên tắc | Công việc |
| --- | --- |
| I–III · Chất lượng, nền tảng và kiến trúc | T001–T011, T013–T020, T022 |
| IV · Trải nghiệm tiếng Việt, responsive và truy cập | T008–T013, T016, T021, T023–T026 |
| V · Toàn vẹn dữ liệu và xử lý lỗi | T004–T007, T013–T021, T026 |
| VI–VII · Kiểm thử, phạm vi và tài liệu | T022–T028 |

Quy ước triển khai theo mô hình dữ liệu và hợp đồng chi tiết hiện có. Dùng giá trị runtime chữ thường cho priority/filter và dùng `LoadResult` cùng `resetTasksAfterConfirmation` tại ranh giới lưu trữ.

## Trạng thái xác minh

T023 và T024 chờ thiết bị có Expo Go tương thích. T025 đã qua các luồng Chromium và kiểm tra bàn phím, còn kiểm tra bằng trình đọc màn hình. T026 chờ đối chiếu toàn bộ tiêu chí trên các môi trường mục tiêu. T028 đã có hướng dẫn cài đặt và chạy, còn đối chiếu hướng dẫn trên thiết bị. Xem [kết quả kiểm thử](quickstart.md#kết-quả-xác-minh-bản-triển-khai).

## Phase 8: Convergence

- [ ] T029 **CRITICAL · F1** Hoàn tất T023–T024 trên Android và iOS với Expo Go tương thích SDK 54. Chạy CRUD, xác nhận/hủy, hoàn thành/mở lại, lọc, thống kê và khôi phục sau khi đóng/mở ứng dụng. Xác minh lệnh và bước mở ứng dụng trong `README.md` theo T028. Ghi thiết bị, phiên bản Expo Go và kết quả vào `quickstart.md` theo FR-13, SC-01, SC-05 và Hiến pháp II, VI–VII (partial).
- [ ] T030 **CRITICAL · F2** Hoàn tất T025–T026 bằng bảng AC-01–48 trong `quickstart.md`, có thiết lập, thao tác, kết quả mong đợi, môi trường và trạng thái. Kiểm tra thông báo và liên kết lỗi theo trường với trình đọc màn hình Web, TalkBack và VoiceOver. Ghi riêng các bài kiểm tra lỗi đọc/ghi, hủy hoặc lỗi reset và giữ dữ liệu gốc. Sửa lỗi phát hiện và chạy lại bài kiểm tra bị ảnh hưởng theo AC-38–48, SC-03–04 và Hiến pháp IV–VI (partial).
- [ ] T031 **HIGH · F3** Tách key của form tạo và form sửa trong `App.tsx` để ID lưu hợp lệ không trùng key của chế độ tạo. Nạp fixture có `id: "create"` và xác minh Sửa nạp đủ các trường đã lưu, Hủy giữ bản đã lưu, Lưu cập nhật đúng ID theo FR-06, AC-13–16 và T015 (contradicts).
- [ ] T032 **MEDIUM · F4** Đồng bộ phần persistence trong `plan.md` với `contracts.md` và `src/storage/taskStorage.ts`. Ghi rõ `loadTasks(): Promise<LoadResult>`, `resetTasksAfterConfirmation()` và thời điểm thao tác ghi được tiếp tục sau phục hồi theo quyết định lưu trữ của plan, FR-11, AC-41–43 và T006–T007 (contradicts).
