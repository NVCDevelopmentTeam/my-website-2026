---
title: Hướng dẫn sử dụng Trình đọc màn hình Zepp OS
categories:
  - 'lập trình'
  - 'blog'
  - 'hướng dẫn'
date: 2023-03-02
updated: 2024-01-03
author: Coding Nguyễn
tags:
  - 'Mã nguồn'
  - 'lập trình'
  - 'khiếm thị'
---

# Giới thiệu

Trình đọc màn hình Zepp OS là một công cụ đọc màn hình được phát triển dành riêng cho các thiết bị chạy Zepp OS. Nó cho phép người dùng khiếm thị và người có thị lực kém sử dụng thiết bị của họ mà không cần dựa vào các chỉ dẫn hình ảnh. Trình đọc màn hình cung cấp một số tính năng, bao gồm:

- Đầu ra văn bản thành giọng nói (TTS)
- Hỗ trợ chữ Braille
- Các lệnh điều hướng
- Tương tác với ứng dụng và cài đặt

## Cách chạy thử (Preview)

Để bắt đầu, bạn cần sao chép kho lưu trữ vào máy cục bộ và điều hướng đến thư mục gốc của dự án. Sau đó, bạn có thể bắt đầu xem trước bản biên dịch bằng cách chạy lệnh sau:
`zeus dev`  
Sau khi bắt đầu xem trước, bạn có thể tương tác với trình đọc màn hình bằng các phím tắt sau:

- Dấu cách (Space) - Đọc mục hiện tại
- Phím Tab - Di chuyển đến mục tiếp theo
- Shift + Tab - Di chuyển về mục trước đó
- Phím Enter - Chọn mục hiện tại

## Cách xây dựng (Build)

Để xây dựng ứng dụng, bạn có thể chạy lệnh sau:  
 `zeus build`  
Lệnh này sẽ tạo một tệp `.zab` trong thư mục `dist`. Sau đó, bạn có thể cài đặt tệp này trên thiết bị Zepp OS của mình.

## Cách cài đặt

Để cài đặt ứng dụng trên thiết bị, bạn cần kết nối đồng hồ với điện thoại và mở ứng dụng Zepp. Sau đó, đi tới Hồ sơ > Amazfit GTS 4 Mini > Cửa hàng ứng dụng và chọn ứng dụng Zepp OS Screen Reader. Nhấp vào nút "Cài đặt" để cài đặt ứng dụng trên thiết bị của bạn.

## Cách bật trình đọc màn hình

Sau khi ứng dụng được cài đặt, bạn có thể bật trình đọc màn hình bằng cách vào Cài đặt > Khả năng tiếp cận > Zepp OS Screen Reader và chuyển công tắc sang vị trí Bật (On).

## Kết luận

Trình đọc màn hình Zepp OS là một công cụ mạnh mẽ có thể giúp người dùng khiếm thị sử dụng các thiết bị Zepp OS của họ một cách độc lập. Trình đọc màn hình dễ sử dụng và cung cấp một số tính năng khiến nó trở thành tài nguyên quý giá cho người dùng bị suy giảm thị lực.
