<script>
  import { siteConfig } from '$lib/config'
  let status = $state('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!siteConfig.author.accessKey) {
      status = 'Lỗi cấu hình: Chưa có Access Key (Web3Forms).'
      console.error('Missing Web3Forms Access Key in siteConfig')
      return
    }

    status = 'Đang gửi...'

    const formData = new FormData(event.currentTarget)
    const object = Object.fromEntries(formData)
    const json = JSON.stringify(object)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: json
      })

      if (!response.ok) {
        console.error(`Web3Forms API error: ${response.status} ${response.statusText}`)
        status = 'Máy chủ phản hồi lỗi, vui lòng thử lại sau.'
        return
      }

      const result = await response.json()

      if (result.success) {
        status = 'Gửi thành công! Cảm ơn bạn đã liên hệ.'
        event.target.reset()
      } else {
        status = 'Có lỗi xảy ra, vui lòng thử lại.'
      }
    } catch (err) {
      console.error(err)
      status = 'Không thể kết nối đến máy chủ.'
    }
  }
</script>

<form
  onsubmit={handleSubmit}
  class="mx-auto flex w-full max-w-lg flex-col space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl transition-colors sm:p-8 dark:border-gray-800 dark:bg-gray-900"
>
  <div class="space-y-2">
    <h2 class="text-2xl font-bold text-gray-950 dark:text-white">Gửi lời nhắn cho mình</h2>
    <p class="text-sm font-bold text-gray-950 dark:text-gray-50">
      Mình sẽ cố gắng phản hồi bạn sớm nhất có thể.
    </p>
  </div>

  <input type="hidden" name="access_key" value={siteConfig.author.accessKey} />

  <!-- Honeypot: hidden from real users via .visually-hidden, but bots that
       auto-fill every field will trip it. Web3Forms silently rejects the
       submission when this field is non-empty. -->
  <input
    type="checkbox"
    name="botcheck"
    class="sr-only"
    tabindex="-1"
    autocomplete="off"
    aria-hidden="true"
  />

  <div class="space-y-2">
    <label for="name" class="text-sm font-bold text-gray-950 dark:text-gray-50">
      Họ và tên <span class="text-red-700 dark:text-red-400" aria-hidden="true">*</span>
    </label>
    <input
      class="w-full rounded-xl border border-gray-400 px-4 py-3 text-gray-950 transition-all focus:ring-2 focus:ring-sky-800 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-sky-400"
      type="text"
      id="name"
      name="name"
      placeholder="Nguyễn Văn A"
      required
    />
  </div>

  <div class="space-y-2">
    <label for="email" class="text-sm font-bold text-gray-950 dark:text-gray-50">
      Địa chỉ email <span class="text-red-700 dark:text-red-400" aria-hidden="true">*</span>
    </label>
    <input
      class="w-full rounded-xl border border-gray-400 px-4 py-3 text-gray-950 transition-all focus:ring-2 focus:ring-sky-800 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-sky-400"
      type="email"
      id="email"
      name="email"
      placeholder="email@vidu.com"
      required
    />
  </div>

  <div class="space-y-2">
    <label for="title" class="text-sm font-bold text-gray-950 dark:text-gray-50">
      Tiêu đề <span class="text-red-700 dark:text-red-400" aria-hidden="true">*</span>
    </label>
    <input
      class="w-full rounded-xl border border-gray-400 px-4 py-3 text-gray-950 transition-all focus:ring-2 focus:ring-sky-800 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-sky-400"
      type="text"
      id="title"
      name="title"
      placeholder="Bạn muốn bàn về chuyện gì?"
      required
    />
  </div>

  <div class="space-y-2">
    <label for="message" class="text-sm font-bold text-gray-950 dark:text-gray-50">
      Nội dung <span class="text-red-700 dark:text-red-400" aria-hidden="true">*</span>
    </label>
    <textarea
      class="w-full rounded-xl border border-gray-400 px-4 py-3 text-gray-950 transition-all focus:ring-2 focus:ring-sky-800 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-sky-400"
      id="message"
      name="message"
      placeholder="Nhập nội dung tin nhắn của bạn ở đây..."
      required
      rows="4"></textarea>
  </div>

  <button
    type="submit"
    class="w-full rounded-xl bg-sky-800 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:bg-sky-900 focus:ring-4 focus:ring-sky-500/50 active:scale-[0.98] dark:bg-sky-400 dark:text-gray-950 dark:hover:bg-sky-300"
  >
    {status === 'Đang gửi...' ? 'Đang gửi tín hiệu...' : 'Gửi lời nhắn'}
  </button>

  {#if status}
    <div
      aria-live="polite"
      class="animate-fade-in mt-6 rounded-xl p-4 text-center font-bold {status.includes(
        'thành công'
      )
        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
        : 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300'}"
    >
      {status}
    </div>
  {/if}
</form>
