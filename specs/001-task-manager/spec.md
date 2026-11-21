# Đặc tả Tính năng: Task Manager Expo

**Mã tính năng**: `001-task-manager`
**Ngày tạo**: 2026-11-21
**Trạng thái**: Draft
**Tên trường implementation**: `completed` thay cho trạng thái riêng và `createdAt` thay cho thứ tự tạo riêng trong model runtime.

## Mục tiêu và phạm vi

Task Manager Expo là ứng dụng quản lý công việc cá nhân chạy trên Android, iOS và Web bằng Expo. Ứng dụng cho phép người dùng tạo, xem, sửa, xóa, hoàn thành, lọc công việc và xem thống kê tiến độ. Dữ liệu được lưu cục bộ trên từng thiết bị bằng AsyncStorage.

Ngoài phạm vi: xác thực người dùng, backend/API, đồng bộ đám mây, push notification, cộng tác nhóm và cơ sở dữ liệu máy chủ.

## Nguyên tắc đã xác nhận

- Tiêu đề công việc trùng nhau được phép.
- Mỗi công việc có một ID duy nhất và ổn định.
- Tiêu đề và mô tả được cắt khoảng trắng ở đầu và cuối trước khi validation và lưu.
- Tiêu đề sau khi cắt phải có độ dài 1–100 ký tự Unicode.
- Mô tả sau khi cắt được phép có tối đa 300 ký tự Unicode.
- Ưu tiên mặc định là Trung bình.
- Ngày đến hạn là tùy chọn và không giới hạn quá khứ hoặc tương lai.
- Chỉ ngày lịch hợp lệ theo định dạng `YYYY-MM-DD` mới được lưu.
- Sửa công việc dùng form hiện tại, có nút Lưu và Hủy.
- Xóa công việc yêu cầu xác nhận.
- Mở lại/hoàn thành thay đổi trạng thái mà không thay đổi dữ liệu hoặc thứ tự tạo.
- Thống kê luôn tính trên toàn bộ công việc đã lưu, không phụ thuộc bộ lọc đang chọn.
- Danh sách công việc hiển thị mới nhất trước.
- Chỉ lưu sau khi thao tác thành công; lưu tức thời sau thay đổi thành công.
- Dữ liệu AsyncStorage hỏng hoặc không hợp lệ không được làm ứng dụng crash và dữ liệu gốc không được ghi đè trước khi người dùng xác nhận.
- Toàn bộ văn bản do ứng dụng hiển thị phải bằng tiếng Việt.

## Câu chuyện người dùng và tiêu chí chấp nhận

### US-01: Tạo công việc — P1

**Vai trò**: Người dùng cá nhân  
**Mong muốn**: Nhập công việc cần làm  
**Lợi ích**: Theo dõi công việc mới trong danh sách

#### Tiêu chí chấp nhận

- **AC-01**: Khi người dùng mở ứng dụng lần đầu, form tạo công việc hiển thị với Ưu tiên Trung bình được chọn.
- **AC-02**: Người dùng chỉ nhập tiêu đề hợp lệ; hệ thống tạo công việc ở trạng thái Chờ xử lý, ưu tiên Trung bình, mô tả rỗng và không có ngày đến hạn.
- **AC-03**: Tiêu đề chứa 100 ký tự và mô tả chứa 300 ký tự được lưu thành công khi các dữ liệu còn lại hợp lệ.
- **AC-04**: Tiêu đề rỗng hoặc chỉ chứa khoảng trắng bị từ chối bằng thông báo tiếng Việt gắn với trường tiêu đề.
- **AC-05**: Tiêu đề 101 ký tự, mô tả 301 ký tự hoặc ngày không hợp lệ bị từ chối; dữ liệu đã nhập được giữ lại để người dùng sửa.
- **AC-06**: Sau tạo thành công, form được xóa, ưu tiên được đặt lại Trung bình, công việc mới xuất hiện trên cùng và có thông báo thành công bằng tiếng Việt.
- **AC-07**: Hai công việc có cùng tiêu đề đều được phép tạo. Hành động sửa hoặc xóa chỉ ảnh hưởng công việc được chọn theo ID.

### US-02: Xem công việc — P1

**Vai trò**: Người dùng cá nhân  
**Mong muốn**: Xem danh sách công việc cuộn được  
**Lợi ích**: Nhanh chóng xem công việc cần làm

#### Tiêu chí chấp nhận

- **AC-08**: Danh sách hiển thị cuộn được tiêu đề, mức ưu tiên, ngày đến hạn hoặc trạng thái không có ngày, trạng thái hoàn thành và mô tả khi có.
- **AC-09**: Công việc mới được thêm vào vị trí đầu danh sách trong cùng bộ lọc phù hợp.
- **AC-10**: Công việc được hiển thị nguyên văn; ký tự giống HTML không được render thành markup hoặc thực thi.
- **AC-11**: Khi không có công việc nào, ứng dụng hiển thị trạng thái rỗng tiếng Việt và hướng dẫn tạo công việc.
- **AC-12**: Danh sách thay đổi bố cục rõ ràng khi sang màn hình rộng hoặc hẹp mà không làm mất thao tác, thông tin hoặc nút.

### US-03: Sửa công việc — P1

**Vai trò**: Người dùng đang thay đổi kế hoạch  
**Mong muốn**: Cập nhật thông tin công việc  
**Lợi ích**: Danh sách luôn phản ánh kế hoạch hiện tại

#### Tiêu chí chấp nhận

- **AC-13**: Chọn Sửa trên một công việc mở form với tiêu đề, mô tả, ưu tiên và ngày đến hạn đã lưu.
- **AC-14**: Người dùng có thể thay đổi tiêu đề; tiêu đề vẫn bắt buộc. Mô tả và ngày đến hạn có thể được xóa.
- **AC-15**: Lưu áp dụng thay đổi cho tiêu đề, mô tả, ưu tiên và ngày đến hạn; trạng thái hoàn thành và vị trí mới nhất của công việc được giữ nguyên.
- **AC-16**: Hủy đóng form hoặc chế độ sửa và không thay đổi công việc đã lưu.
- **AC-17**: Dữ liệu sửa không hợp lệ bị giữ trong form với thông báo lỗi gắn với từng trường; công việc đã lưu không thay đổi.
- **AC-18**: Mỗi thao tác sửa thành công được lưu AsyncStorage ngay; lỗi lưu không làm danh sách hiển thị giả định đã đổi.

### US-04: Xóa công việc — P1

**Vai trò**: Người dùng muốn dọn danh sách  
**Mong muốn**: Xóa công việc không còn cần thiết  
**Lợi ích**: Chỉ giữ công việc đang theo dõi

#### Tiêu chí chấp nhận

- **AC-19**: Chọn Xóa mở xác nhận tiếng Việt và hiển thị thông tin công việc được chọn dưới dạng văn bản an toàn.
- **AC-20**: Chọn Hủy xác nhận không thay đổi công việc hoặc danh sách.
- **AC-21**: Chọn Xác nhận xóa chỉ công việc đã chọn bằng ID.
- **AC-22**: Xóa công việc cuối cùng hiển thị trạng thái rỗng và cập nhật thống kê về 0.
- **AC-23**: Lỗi lưu khi xóa không thay đổi danh sách đã lưu và hiển thị thông báo thất bại bằng tiếng Việt.

### US-05: Hoàn thành công việc — P1

**Vai trò**: Người dùng đang thực hiện công việc  
**Mong muốn**: Chuyển trạng thái công việc  
**Lợi ích**: Theo dõi tiến độ

#### Tiêu chí chấp nhận

- **AC-24**: Công việc mới luôn ở trạng thái Chờ xử lý.
- **AC-25**: Chọn Hoàn thành chuyển công việc sang Đã hoàn thành và áp dụng kiểu hiển thị riêng không phụ thuộc màu sắc.
- **AC-26**: Chọn Mở lại chuyển công việc Đã hoàn thành về Chờ xử lý.
- **AC-27**: Chuyển trạng thái không thay đổi tiêu đề, mô tả, ưu tiên, ngày đến hạn hoặc thứ tự tạo.
- **AC-28**: Lỗi lưu trạng thái không thay đổi trạng thái hiển thị gần nhất đã lưu và hiển thị lỗi bằng tiếng Việt.

### US-06: Lọc công việc — P2

**Vai trò**: Người dùng muốn tập trung vào một nhóm công việc  
**Mong muốn**: Chuyển giữa Tất cả, Chờ xử lý và Đã hoàn thành  
**Lợi ích**: Tìm công việc cần xem nhanh hơn

#### Tiêu chí chấp nhận

- **AC-29**: Bộ lọc Tất cả, Chờ xử lý và Đã hoàn thành hoạt động ngay trong ứng dụng, không reload.
- **AC-30**: Danh sách lọc luôn giữ thứ tự mới nhất trước.
- **AC-31**: Khi hoàn thành công việc cuối cùng trong bộ lọc Chờ xử lý, công việc rời danh sách ngay sau khi lưu thành công và hiển thị trạng thái không có kết quả phù hợp.
- **AC-32**: Khi không có công việc trong toàn bộ dữ liệu thì hiển thị trạng thái danh sách rỗng; khi có dữ liệu nhưng bộ lọc không khớp thì hiển thị trạng thái không có kết quả.
- **AC-33**: Mở ứng dụng luôn bắt đầu ở bộ lọc Tất cả; bộ lọc có thể thay đổi trong phiên chạy và không ảnh hưởng thống kê.

### US-07: Dashboard thống kê — P3

**Vai trò**: Người dùng theo dõi khối lượng công việc  
**Mong muốn**: Xem tổng số, số đã hoàn thành và số chờ xử lý  
**Lợi ích**: Hiểu tiến độ nhanh

#### Tiêu chí chấp nhận

- **AC-34**: Dashboard hiển thị tổng, đã hoàn thành và chờ xử lý.
- **AC-35**: Các số liệu luôn tính trên toàn bộ công việc đã lưu dù bộ lọc đang là Tất cả, Chờ xử lý hoặc Đã hoàn thành.
- **AC-36**: Thêm, sửa, xóa, hoàn thành và mở lại cập nhật thống kê ngay sau khi lưu thành công.
- **AC-37**: Danh sách rỗng hiển thị cả ba số liệu là 0.

### US-08: Lưu trữ và khôi phục — P1

**Vai trò**: Người dùng quay lại ứng dụng  
**Mong muốn**: Tiếp tục công việc đã lưu  
**Lợi ích**: Không mất dữ liệu khi đóng hoặc mở lại ứng dụng

#### Tiêu chí chấp nhận

- **AC-38**: Sau tạo, sửa, xóa, hoàn thành hoặc mở lại thành công, dữ liệu công việc được lưu ngay vào AsyncStorage.
- **AC-39**: Khi mở lại ứng dụng trên cùng thiết bị, công việc giữ trường dữ liệu, trạng thái và thứ tự tạo gần nhất đã lưu.
- **AC-40**: Không có dữ liệu lưu là lần mở đầu tiên hợp lệ và hiển thị trạng thái rỗng.
- **AC-41**: Dữ liệu JSON hoặc cấu trúc không hợp lệ không làm ứng dụng crash; hiển thị trạng thái rỗng phục hồi và thông báo bằng tiếng Việt.
- **AC-42**: Dữ liệu AsyncStorage gốc được giữ nguyên sau lỗi đọc hoặc dữ liệu hỏng cho đến khi người dùng xác nhận bắt đầu danh sách mới.
- **AC-43**: Khi ghi AsyncStorage thất bại, thao tác không được hiển thị như thành công, dữ liệu hiển thị giữ trạng thái gần nhất đã lưu và dữ liệu form được giữ lại để thử lại.
- **AC-44**: Không truy cập được AsyncStorage khi mở ứng dụng hiển thị thông báo tải thất bại; giao diện và bộ lọc vẫn điều hướng được.

### US-09: Responsive và truy cập — P2

**Vai trò**: Người dùng trên nhiều nền tảng và thiết bị hỗ trợ  
**Mong muốn**: Sử dụng ứng dụng rõ ràng và dễ truy cập  
**Lợi ích**: Thao tác được trên Android, iOS và Web

#### Tiêu chí chấp nhận

- **AC-45**: Luồng tạo, xem, sửa, xóa, hoàn thành, mở lại, lọc và xem thống kê hoạt động ở kích thước điện thoại, máy tính bảng và cửa sổ Web mà không tràn ngang.
- **AC-46**: Form, nút, bộ lọc, danh sách và hộp xác nhận hỗ trợ điều hướng bàn phím trên Web và trạng thái focus nhìn thấy.
- **AC-47**: Control có tên truy cập; lỗi gắn với trường tương ứng; thông báo thành công/lỗi có thể được công nghệ hỗ trợ phát hiện.
- **AC-48**: Giao diện mobile-first có vùng chạm đủ lớn, nội dung dễ đọc và thứ tự thị giác nhất quán.

## Yêu cầu chức năng

| ID | Yêu cầu | Tiêu chí liên quan |
| --- | --- | --- |
| FR-01 | Cung cấp form tạo công việc gồm tiêu đề, mô tả tùy chọn, ưu tiên và ngày đến hạn tùy chọn. | AC-01–AC-07 |
| FR-02 | Tiêu đề bắt buộc có độ dài 1–100 ký tự Unicode sau khi cắt khoảng trắng. Mô tả tùy chọn tối đa 300 ký tự Unicode sau khi cắt. | AC-04, AC-05, AC-14, AC-17 |
| FR-03 | Ưu tiên chỉ nhận Thấp, Trung bình hoặc Cao. Mặc định Trung bình. | AC-01, AC-02 |
| FR-04 | Ngày đến hạn để trống hoặc là ngày lịch hợp lệ `YYYY-MM-DD`; cho phép ngày quá khứ và tương lai. | AC-03, AC-05, AC-14 |
| FR-05 | Danh sách hiển thị cuộn, hiển thị đủ trường và sắp xếp công việc mới nhất trước. | AC-08–AC-12 |
| FR-06 | Sửa dùng form hiện tại, áp dụng Lưu và Hủy, giữ dữ liệu đã lưu khi hủy. | AC-13–AC-18 |
| FR-07 | Xóa từng công việc sau xác nhận rõ ràng và chỉ ảnh hưởng công việc được chọn. | AC-19–AC-23 |
| FR-08 | Chuyển trạng thái Chờ xử lý và Đã hoàn thành; công việc hoàn thành có dấu hiệu hiển thị không phụ thuộc màu. | AC-24–AC-28 |
| FR-09 | Cung cấp bộ lọc Tất cả, Chờ xử lý và Đã hoàn thành; mặc định Tất cả khi khởi động. | AC-29–AC-33 |
| FR-10 | Dashboard hiển thị tổng, đã hoàn thành và chờ xử lý trên toàn bộ dữ liệu đã lưu bất kể filter. | AC-34–AC-37 |
| FR-11 | Lưu AsyncStorage ngay sau mỗi thay đổi thành công và khôi phục khi mở lại trên cùng thiết bị. | AC-38–AC-44 |
| FR-12 | Validation dữ liệu người dùng và dữ liệu AsyncStorage; hiển thị text/plain và không thực thi HTML-like text. | AC-10, AC-17, AC-41 |
| FR-13 | Giao diện tiếng Việt, responsive và truy cập được trên Android/iOS/Web và Expo Go. | AC-45–AC-48 |

## Thực thể dữ liệu

### Task

- `id`: chuỗi ID duy nhất, ổn định.
- `title`: chuỗi bắt buộc đã cắt, 1–100 ký tự Unicode.
- `description`: chuỗi tùy chọn đã cắt, tối đa 300 ký tự Unicode; có thể rỗng.
- `priority`: `Low`, `Medium` hoặc `High`.
- `dueDate`: chuỗi `YYYY-MM-DD` hoặc `null`.
- `completed`: boolean; `false` là Chờ xử lý và `true` là Đã hoàn thành.
- `createdAt`: chuỗi thời gian ISO, không đổi và dùng để xác định thứ tự mới nhất.

### Bộ sưu tập công việc

- Danh sách công việc lưu cho thiết bị hiện tại.
- ID trong bộ sưu tập phải duy nhất.
- Thống kê được tính từ toàn bộ bộ sưu tập.

### Bộ lọc đang chọn

- Giá trị: `All`, `Pending` hoặc `Completed`.
- Mặc định `All` khi mở ứng dụng.
- Không thay đổi dữ liệu hoặc thống kê.

## Edge cases

| ID | Trường hợp | Kết quả mong đợi |
| --- | --- | --- |
| EC-01 | Tiêu đề rỗng, toàn khoảng trắng hoặc có khoảng trắng đầu/cuối | Từ chối tiêu đề rỗng sau cắt; lưu tiêu đề hợp lệ đã cắt. |
| EC-02 | Tiêu đề 101 ký tự; mô tả 301 ký tự | Từ chối và chỉ ra giới hạn bằng tiếng Việt; đúng giới hạn được lưu. |
| EC-03 | Ngày trống, ngày quá khứ, ngày tương lai hoặc ngày không hợp lệ | Ngày trống hợp lệ; ngày hợp lệ quá khứ/tương lai được lưu; ngày không hợp lệ bị từ chối. |
| EC-04 | Tiêu đề trùng nhau | Cho phép cả hai; sửa/xóa bằng ID không nhầm công việc. |
| EC-05 | Cùng ID hoặc thiếu ID trong dữ liệu lưu | Bị coi là dữ liệu hỏng và đưa về recovery state; không render dữ liệu không hợp lệ. |
| EC-06 | Tạo công việc trong bộ lọc Đã hoàn thành | Giữ filter hiện tại, lưu thành công, thống kê cập nhật và công việc xuất hiện khi chuyển sang Tất cả hoặc Chờ xử lý. |
| EC-07 | Hoàn thành công việc cuối cùng trong filter Chờ xử lý | Hiển thị trạng thái không có kết quả sau lưu thành công. |
| EC-08 | AsyncStorage JSON hỏng, thiếu trường, sai kiểu hoặc có giá trị ưu tiên/trạng thái không hỗ trợ | Không crash, hiển thị lỗi và danh sách rỗng phục hồi, giữ dữ liệu gốc cho đến xác nhận reset. |
| EC-09 | AsyncStorage không truy cập được | Mở ứng dụng hiển thị lỗi tải bằng tiếng Việt; vẫn điều hướng; thao tác lưu báo lỗi và giữ form. |
| EC-10 | Ghi AsyncStorage thất bại | Không đổi danh sách/statistics gần nhất đã lưu, không hiển thị thông báo thành công và giữ dữ liệu nhập để retry. |
| EC-11 | Văn bản chứa HTML-like characters | Hiển thị nguyên văn, không tạo markup hoặc script. |
| EC-12 | Chuyển đổi orientation hoặc thay đổi kích thước cửa sổ | Layout cập nhật responsive, không làm mất dữ liệu đang nhập hoặc trạng thái lưu. |

## Tiêu chí thành công

- **SC-01**: Tất cả user story P1 và luồng tạo-sửa-xóa-hoàn thành-mở lại-lưu trữ hoạt động trên Android Expo Go, iOS Expo Go và Expo Web.
- **SC-02**: Tất cả bộ lọc và thống kê đúng sau thao tác thành công; mỗi công việc chỉ thuộc đúng một trạng thái.
- **SC-03**: Validation, dữ liệu hỏng, lỗi AsyncStorage và xử lý văn bản HTML-like đều pass.
- **SC-04**: Màn hình điện thoại, máy tính bảng và Web không có tràn ngang; control và thông báo dùng được bằng bàn phím và công nghệ hỗ trợ.
- **SC-05**: Mọi văn bản do ứng dụng hiển thị đều bằng tiếng Việt và MVP không yêu cầu custom native build.
