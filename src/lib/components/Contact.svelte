<script>
  import { siteConfig } from '$lib/config';
  let status = $state('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    status = 'Đang gửi...';

    const formData = new FormData(event.currentTarget);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      });

      const result = await response.json();

      if (result.success) {
        status = 'Gửi thành công! Cảm ơn bạn đã liên hệ.';
        event.target.reset();
      } else {
        status = 'Có lỗi xảy ra, vui lòng thử lại.';
      }
    } catch (err) {
      console.error(err);
      status = 'Không thể kết nối đến máy chủ.';
    }
  };
</script>

<form onsubmit={handleSubmit} class="flex flex-col w-72 mx-auto space-y-4">
  <input type="hidden" name="access_key" value={siteConfig.accessKey} />

  <label for="name" class="text-gray-700 font-medium">
    Họ và tên <span class="text-red-500">*</span>
  </label>
  <input
    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
    type="text"
    id="name"
    name="name"
    placeholder="Nhập họ và tên"
    required
  />

  <label for="email" class="text-gray-700 font-medium">
    Địa chỉ email <span class="text-red-500">*</span>
  </label>
  <input
    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
    type="email"
    id="email"
    name="email"
    placeholder="Nhập địa chỉ email"
    required
  />

  <label for="title" class="text-gray-700 font-medium">
    Tiêu đề <span class="text-red-500">*</span>
  </label>
  <input
    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
    type="text"
    id="title"
    name="title"
    placeholder="Nhập tiêu đề liên hệ"
    required
  />

  <label for="message" class="text-gray-700 font-medium">
    Nội dung <span class="text-red-500">*</span>
  </label>
  <textarea
    class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
    id="message"
    name="message"
    placeholder="Nhập nội dung tin nhắn..."
    required
    rows="3"
  ></textarea>

  <input
    type="submit"
    value="Gửi"
    id="Send"
    class="bg-blue-700 text-white font-medium rounded py-2 cursor-pointer hover:bg-blue-800 transition"
  />
</form>

<div class="text-center mt-4 text-gray-600">{status}</div>
