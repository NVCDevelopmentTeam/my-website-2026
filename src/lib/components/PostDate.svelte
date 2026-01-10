<script>
  const { post } = $props();
  const d = $derived.by(() => new Date(post.metadata.date));
  const day = $derived.by(() => d.getDate());
  const month = $derived.by(() => d.getMonth() + 1);
  const year = $derived.by(() => d.getFullYear());
</script>

<p class="text-sm text-gray-600 px-4">
  Ngày tạo: <span>ngày {day} tháng {month} năm {year}</span>
</p>
