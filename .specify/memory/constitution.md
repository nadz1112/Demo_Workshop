<!--
Sync Impact Report
Version change: 1.0.0 to 2.0.0
Changed: Governance scope and technology stack from a vanilla JavaScript web app to a React Native/Expo cross-platform application.
Added: Expo SDK compatibility, Expo Go constraints, shared Android/iOS/Web architecture, separation of presentation/business/storage/type layers, AsyncStorage integrity, and Vietnamese project documentation.
Dependent artifacts: specs/001-task-manager/spec.md is the existing feature specification and remains applicable after adapting persistence from localStorage to AsyncStorage.
Follow-up: Review and update feature plans/tasks against the Expo-specific constitution before implementation.
-->
# Hiến pháp Dự án Task Manager Expo

Tài liệu này chi phối phát triển "Task Manager Expo", một ứng dụng quản lý công việc cá nhân chạy trên Android, iOS và Web từ cùng một mã nguồn Expo.

## Nguyên tắc Cốt lõi

### I. Chất lượng Mã nguồn

- Mã nguồn PHẢI dễ đọc, nhất quán và dễ bảo trì; tên file, thư mục, component, hàm, biến và kiểu dữ liệu phải mô tả rõ trách nhiệm.
- Component và hàm PHẢI tập trung vào một trách nhiệm rõ ràng và chỉ được trích xuất khi làm giảm trùng lặp hoặc tăng khả năng kiểm thử.
- Component dùng chung PHẢI được đặt ở các vị trí tái sử dụng rõ ràng, tránh sao chép logic và tránh abstraction chưa có nhu cầu thực tế.
- Công việc triển khai PHẢI giữ MVP đơn giản, đầy đủ và dễ chạy; không được thêm tính năng ngoài phạm vi để đổi lấy sự phức tạp.

### II. Nền tảng Công nghệ

- Ứng dụng BẮT BUỘC sử dụng React Native, Expo và TypeScript.
- Android, iOS và Web PHẢI được hỗ trợ từ một mã nguồn dùng chung; sai khác nền tảng chỉ được giới hạn trong các adapter cần thiết.
- MVP BẮT BUỘC chạy trong Expo Go mà không yêu cầu custom native build hoặc thư viện native không có trong Expo Go.
- Giao diện BẮT BUỘC sử dụng component React Native và `StyleSheet`; không được thay thế bằng HTML hoặc CSS cho bề mặt React Native.
- Phiên bản Expo và các package cài đặt PHẢI tương thích với Expo SDK hiện được cài đặt của dự án. Mọi thay đổi SDK/package đều phải được kiểm tra bằng `expo-doctor` hoặc quy trình tương đương trước khi hoàn tất.
- Thư viện bổ sung PHẢI chỉ được dùng khi giải quyết rõ ràng nhu cầu của MVP. Backend, cơ sở dữ liệu và dịch vụ đồng bộ là ngoài phạm vi và không được triển khai.

### III. Kiến trúc và Phân tách Trách nhiệm

- Presentation, business logic, types và storage PHẢI được tổ chức trong các lớp hoặc module riêng có trách nhiệm rõ ràng.
- Component màn hình BẮT BUỘC chỉ điều phối giao diện và tương tác; quy tắc nghiệp vụ không được lặp lại trong nhiều component.
- Các kiểu dữ liệu BẮT BUỘC được định nghĩa bằng TypeScript và được dùng nhất quán trong toàn bộ luồng dữ liệu.
- Logic quản lý công việc PHẢI độc lập với implementation cụ thể của UI và storage càng nhiều càng tốt.
- Truy cập AsyncStorage BẮT BUỘC được tập trung trong module persistence, không được đọc hoặc ghi key dữ liệu trực tiếp rải rác trong component.

### IV. Trải nghiệm Người dùng

- Giao diện BẮT BUỘC có bố cục responsive cho kích thước điện thoại, máy tính bảng, cửa sổ Web và tỷ lệ màn hình khác nhau.
- Mọi hành động cốt lõi PHẢI có thể truy cập bằng phím và các control PHẢI có tên truy cập rõ ràng, trạng thái focus nhìn thấy và hướng dẫn phù hợp.
- Nội dung người dùng PHẢI được hiển thị theo đúng ngữ nghĩa văn bản, không thực thi markup hoặc script.
- Tất cả văn bản do ứng dụng hiển thị BẮT BUỘC bằng tiếng Việt, gồm nhãn, placeholder, lỗi, thông báo thành công/thất bại, trạng thái rỗng và hộp xác nhận.
- Validation PHẢI chỉ ra trường bị lỗi, không xóa dữ liệu đã nhập và giữ người dùng trong trạng thái có thể sửa hoặc thử lại.

### V. Dữ liệu, Lưu trữ và Xử lý Lỗi

- Dữ liệu công việc BẮT BUỘC được lưu bằng AsyncStorage sau mỗi thay đổi thành công.
- Dữ liệu đọc từ AsyncStorage PHẢI được coi là không tin cậy và phải qua parsing cùng validation cấu trúc trước khi hiển thị.
- Dữ liệu lỗi, không hợp lệ hoặc không đọc được PHẢI không làm ứng dụng crash. Ứng dụng phải cung cấp trạng thái phục hồi khả dụng và hiển thị lỗi bằng tiếng Việt.
- Dữ liệu lưu trữ đã hỏng hoặc không hợp lệ KHÔNG được tự ghi đè nếu chưa có xác nhận rõ ràng để bắt đầu danh sách mới.
- Khi ghi dữ liệu thất bại, ứng dụng PHẢI báo lỗi, giữ giao diện ở trạng thái lưu gần nhất và giữ nguyên dữ liệu người dùng đang nhập để thử lại.

### VI. Kiểm thử và Độ tin cậy

- Mỗi feature BẮT BUỘC có acceptance criteria có thể đo lường và các bước kiểm thử tương ứng.
- Kiểm thử MVP PHẢI bao phủ tạo, xem, sửa, xóa, hoàn thành, mở lại, lọc, thống kê và lưu/khôi phục dữ liệu.
- Kiểm thử BẮT BUỘC bao gồm danh sách rỗng, filter không có kết quả, dữ liệu nhập không hợp lệ, AsyncStorage hỏng hoặc không truy cập được, và thao tác hủy xác nhận.
- Luồng chính PHẢI được kiểm tra trên Expo Go với Android, iOS và Web; mức độ kiểm tra tự động và thủ công phải được ghi rõ trong tài liệu testing.
- Thay đổi chức năng PHẢI có regression check cho luồng hiện có trước khi xem là hoàn tất.

### VII. Phạm vi và Tài liệu Dự án

- MVP BẮT BUỘC ưu tiên CRUD công việc, bộ lọc, thống kê, trạng thái hoàn thành và lưu trữ cục bộ.
- Xác thực, backend, cơ sở dữ liệu, thông báo đẩy, đồng bộ đa thiết bị và cộng tác là ngoài phạm vi trừ khi được phê duyệt bằng amendment.
- Tài liệu dự án, spec, implementation plan, task list và hướng dẫn kiểm thử PHẢI bằng tiếng Việt.
- Tài liệu setup PHẢI nêu Expo SDK, các prerequisite, cách chạy Expo Go trên Android/iOS/Web và cách xác minh compatibility.
- Spec, plan, task và implementation BẮT BUỘC truy vết về nguyên tắc constitution cùng acceptance criteria liên quan.

## Quản trị

- Hiến pháp này chi phối spec, implementation plan, task list và review. Mọi plan BẮT BUỘC có Constitution Check và xác nhận nguyên tắc liên quan với acceptance criteria.
- Mọi amendment PHẢI ghi lý do, được maintainer phê duyệt, cập nhật ngày amendment và điều chỉnh artifacts bị ảnh hưởng.
- Dùng semantic versioning: tăng MAJOR cho thay đổi không tương thích hoặc loại bỏ nguyên tắc, MINOR cho nguyên tắc mới hoặc bổ sung thực chất, PATCH cho làm rõ không thay đổi quy tắc.

**Phiên bản**: 2.0.0 | **Ngày ratify**: 2026-11-21 | **Lần sửa gần nhất**: 2026-11-21
