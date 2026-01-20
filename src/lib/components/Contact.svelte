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

<form onsubmit={handleSubmit} class="flex flex-col w-full max-w-lg mx-auto space-y-6 bg-white dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl transition-colors">
  <div class="space-y-2">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Gửi lời nhắn cho mình</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">Mình sẽ cố gắng phản hồi bạn sớm nhất có thể.</p>
  </div>

  <input type="hidden" name="access_key" value={siteConfig.author.accessKey} />

  <div class="space-y-2">
    <label for="name" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Họ và tên <span class="text-red-500" aria-hidden="true">*</span>
    </label>
    <input
      class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
      type="text"
      id="name"
      name="name"
      placeholder="Nguyễn Văn A"
      required
    />
  </div>

  <div class="space-y-2">
    <label for="email" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Địa chỉ email <span class="text-red-500" aria-hidden="true">*</span>
    </label>
    <input
      class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
      type="email"
      id="email"
      name="email"
      placeholder="email@vidu.com"
      required
    />
  </div>

  <div class="space-y-2">
    <label for="title" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Tiêu đề <span class="text-red-500" aria-hidden="true">*</span>
    </label>
    <input
      class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
      type="text"
      id="title"
      name="title"
      placeholder="Bạn muốn bàn về chuyện gì?"
      required
    />
  </div>

  <div class="space-y-2">
    <label for="message" class="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Nội dung <span class="text-red-500" aria-hidden="true">*</span>
    </label>
    <textarea
      class="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
      id="message"
      name="message"
      placeholder="Nhập nội dung tin nhắn của bạn ở đây..."
      required
      rows="4"
    ></textarea>
  </div>

  <button
    type="submit"
    class="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold rounded-xl py-4 shadow-lg hover:shadow-sky-500/20 hover:from-sky-700 hover:to-blue-800 transition-all duration-300 focus:ring-4 focus:ring-sky-300 active:scale-[0.98]"
  >
    {status === 'Đang gửi...' ? 'Đang gửi tín hiệu...' : 'Gửi lời nhắn'}
  </button>
</form>

{#if status}
  <div class="text-center mt-6 p-4 rounded-xl font-medium animate-fade-in {status.includes('thành công') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'}">
    {status}
  </div>
{/if}
