<!-- src/routes/+page.svelte -->
<script>
  import { formatDate } from '$lib/utils.js';

  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>Trang chủ | GÓc thư dãn</title>
  <meta name="description" content="Chào mừng đến với blog cá nhân của tôi. Nơi chia sẻ kiến thức và kinh nghiệm về lập trình, công nghệ và cuộc sống." />
</svelte:head>

<section class="space-y-8">
  <header class="text-center">
    <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
      Bài viết mới nhất
    </h1>
    <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
      Khám phá các bài viết mới nhất về công nghệ, lập trình và cuộc sống.
    </p>
  </header>

  {#if data.posts && data.posts.length > 0}
    <ul class="space-y-10">
      {#each data.posts as post (post.slug)}
        <li class="group relative flex flex-col items-start">
          <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            <a href={`/blog/${post.slug}`}>
              <span class="absolute inset-0" aria-hidden="true"></span>
              {post.title}
            </a>
          </h2>

          <div class="mt-2 flex items-center gap-x-4 text-sm text-gray-500 dark:text-gray-400">
            <time datetime={post.date}>{formatDate(post.date)}</time>
            {#if post.readingTime}
              <span>&middot; {post.readingTime} phút đọc</span>
            {/if}
          </div>

          <p class="mt-4 text-base text-gray-600 dark:text-gray-300">
            {post.description}
          </p>

          <div class="mt-4">
            <a href={`/blog/${post.slug}`} class="text-primary-600 dark:text-primary-400 font-semibold group-hover:underline">
              Đọc thêm <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="text-center text-gray-500 dark:text-gray-400">
      Chưa có bài viết nào.
    </p>
  {/if}

  <div class="text-center mt-10">
    <a href="/blog" class="inline-block bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors">
      Xem tất cả bài viết
    </a>
  </div>
</section>
