### Sửa một vài thứ như sau:

- bổ xung cache cho toàn bộ site để tối ưu performance cho toàn bộ website chuẩn google Lighthouse bao gồm điểm của mobile, cache của tất cả các pages và posts, đảm bảo responsive full site và 100 điểm toàn bộ
- thay font @fontsource-variable/inter thành font @fontsource/fira-mono vì nó phù hợp với sveltekit
- đọc file check.json để fix điểm performance của mobile vì điểm hiệu xuất của máy tính đã tốt rồi
- Tối ưu tài nguyên, nén ảnh, v.v... để website load nhanh tối đa hiệu xuất và sử dụng thư viện, packages phiên bản mới nhất để tương thích với sveltekit và tailwindcss mới nhất
- Không sử dụng socket vì đây không phải là một ứng dụng theo thời gian thực mà là một website cá nhân dạng static site
- sử dụng pnpm lint, pnpm format, pnpm check, pnpm test để kiểm tra lại xem có lỗi gì không
- đảm bảo không có packages và library thừa không import trong code để đảm bảo nó build đỡ nặng web và chỉ được làm trong khuôn khổ của dự án và những thu mục ngoài không được động tới kẻo xóa nhầm
- MỌi packages và library phải update mới nhất 2026 hoàn toàn không được sửa gì cả
- Error
  manifest.json:1 Request unavailable in the network panel, try reloading the inspected page Failed to load resource: the server responded with a status of 404 (Not Found)
- Nút like phải giống nút like của facebook
- bỏ cấu hình liên quan tới dev environment để chuyển sang productions environment
- Html, css, js phải viết tối ưu performance cho static site
- Cần sửa nút like như sau: mỗi một khách truy cập vào website thì chỉ được phép like một lần và không được like nhiều hơn một like để tránh bị nhầm, thu thập địa chỉ IP và giữ liệu trình duyệt để đảm bảo mọi thứ logic với nút like và lưu nó ở Local Storage với lấy Cookie của người dùng để xác định lượt like
- Thêm lượt đọc của từng bài viết cụ thể
- tương thích với @sveltejs/adapter-static
- đảm bảo website tối ưu với @sveltejs/adapter-static và responsive, load nhanh như tên lửa
- toàn bộ script phải có cache và setTimeout để nó load sau khi tải xong dom
- cache cho toàn bộ website và các pages, comment code toàn bộ là tiếng anh
- chỉ được sử dụng js và không được dùng ts để build cho nhanh
- optimization điểm google Lighthouse trong file check.json, tối ưu Responsive, security, logic, syntax, refactor code, Clean Code 
