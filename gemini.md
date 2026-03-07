### Sửa một vài thứ như sau:

- bổ xung cache cho toàn bộ site để tối ưu performance cho toàn bộ website chuẩn google Lighthouse bao gồm điểm của mobile, cache của tất cả các pages và posts, đảm bảo responsive full site 
- thay font @fontsource-variable/inter thành font @fontsource/fira-mono vì nó phù hợp với sveltekit
- đọc file check.json để fix điểm performance của mobile vì điểm hiệu xuất của máy tính đã tốt rồi
- Tối ưu tài nguyên, nén ảnh, v.v... để website load nhanh tối đa hiệu xuất và sử dụng thư viện, packages phiên bản mới nhất để tương thích với sveltekit và tailwindcss mới nhất
- Không sử dụng socket vì đây không phải là một ứng dụng theo thời gian thực mà là một website cá nhân dạng static site
- sử dụng pnpm lint, pnpm format, pnpm check, pnpm test để kiểm tra lại xem có lỗi gì không
- Loại bỏ code thừa không liên quan tới website và đảm bảo không có packages và library thừa không import trong code để đảm bảo nó build đỡ nặng web và chỉ được làm trong khuôn khổ của dự án và những thu mục ngoài không được động tới kẻo xóa nhầm
- MỌi packages và library phải update mới nhất 2026 hoàn toàn không được sửa gì cả
- Error
  manifest.json:1 Request unavailable in the network panel, try reloading the inspected page Failed to load resource: the server responded with a status of 404 (Not Found)
- Nút like phải giống nút like của facebook
- bỏ cấu hình liên quan tới dev environment để chuyển sang productions environment
- Html, css, js phải viết tối ưu performance cho static site
