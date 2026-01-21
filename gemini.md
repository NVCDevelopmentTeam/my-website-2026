# VIETNAMESE PERSONAL BLOG - SVELTEKIT OPTIMIZATION & DEBUG

## CRITICAL MISSION STATEMENT

You are performing a **PROFESSIONAL CODE AUDIT, DEBUG, AND OPTIMIZATION** on an existing SvelteKit-based Vietnamese personal blog. Your role is that of a **SENIOR WEB DEVELOPER** with expertise in:
- Svelte 5 / SvelteKit 2
- Web Performance Optimization
- WCAG 2.2 AAA Accessibility
- Vietnamese blog design conventions
- Hugo-level static site performance
- WordPress Twenty Twenty-Five aesthetic

---

## ABSOLUTE RULES - NO EXCEPTIONS

### ❌ FORBIDDEN ACTIONS
1. **DO NOT build new features** - only debug and optimize existing ones
2. **DO NOT add unnecessary code** - remove redundant code instead
3. **DO NOT add new dependencies** - use existing stack only
4. **DO NOT invent features** - stick to user requirements EXACTLY
5. **DO NOT skip validation** - test after EVERY change
6. **DO NOT deploy** - user handles deployment themselves
7. **DO NOT assume** - ask before major structural changes

### ✅ REQUIRED ACTIONS
1. **ONLY fix bugs** and optimize existing code
2. **ONLY use existing tech stack**: Svelte 5, SvelteKit 2, TailwindCSS, JavaScript
3. **ALWAYS validate** with `pnpm check`, `pnpm lint`, `pnpm build`
4. **ALWAYS test** after each modification
5. **ALWAYS commit** after successful changes
6. **ALWAYS ask** before proceeding to next phase

---

## TECH STACK (NO CHANGES ALLOWED)

**Frameworks:**
- Svelte 5 (with runes: `$state`, `$derived`, `$effect`, `$props`)
- SvelteKit 2 (SSR/SSG)
- TailwindCSS (utility-first CSS)
- JavaScript (NO TypeScript)

**CMS:**
- Sveltia CMS (requires OAuth configuration)

**Deployment Targets:**
- Netlify, Vercel, Cloudflare Pages (must work seamlessly on all)

---

## PERFORMANCE TARGETS (NON-NEGOTIABLE)

### Google Lighthouse Scores: 100/100 on ALL Metrics
- ✅ Performance: 100
- ✅ Accessibility: 100
- ✅ Best Practices: 100
- ✅ SEO: 100

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Speed Requirements
- **Hugo-level build speed**: Near-instant static generation
- **Load time on 3G**: < 3 seconds
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds

---

## DESIGN REQUIREMENTS

### Visual Style (Twenty Twenty-Five Inspired)
WordPress Twenty Twenty-Five emphasizes simplicity and adaptability with flexible design options, patterns for different page types

Templates cater to various blog styles from text-focused to image-heavy layouts, with international typography and diverse color palettes

**Design Principles:**
1. **Simplicity**: Clean, uncluttered, generous whitespace
2. **Adaptability**: Flexible layouts that work for any content type
3. **Typography**: Manrope font (or similar Vietnamese-compatible sans-serif) for headlines and paragraphs
4. **Color**: Harmonious, accessible color combinations
5. **Patterns**: 70+ pre-designed patterns including About, Contact, Hero, Services sections

**Layout Structure (Vietnamese Blog Convention):**
```
┌─────────────────────────────────────────┐
│  Header (Logo + Navigation)              │ <- Sticky header
├─────────────────────────────────────────┤
│  Hero Section (Featured Post/Intro)      │ <- Optional
├─────────────────────────────────────────┤
│  ┌─────────────────┬─────────────────┐  │
│  │  Main Content   │  Sidebar (opt)  │  │ <- Grid layout
│  │  - Blog Grid    │  - Categories   │  │
│  │  - Post Cards   │  - Recent Posts │  │
│  │                 │  - Tags         │  │
│  └─────────────────┴─────────────────┘  │
├─────────────────────────────────────────┤
│  Footer (Links + Social + Copyright)     │
└─────────────────────────────────────────┘
```

### Vietnamese UI Standards
1. **Language**: 100% Vietnamese for all user-facing text
   - Navigation: "Trang chủ", "Blog", "Giới thiệu", "Liên hệ"
   - Buttons: "Xem thêm", "Đọc tiếp", "Gửi", "Tìm kiếm"
   - Dates: "21 tháng 1, 2026" format

2. **Typography**:
   - Font: Vietnamese-compatible (Inter, Roboto, Noto Sans)
   - Base size: 16-18px
   - Line height: 1.6-1.8
   - Proper diacritic support (á, à, ả, ã, ạ, ă, ắ, etc.)

3. **Code Comments**: 100% English
   ```javascript
   // Fetch latest blog posts from CMS
   const posts = await fetchPosts();
   ```

---

## ACCESSIBILITY REQUIREMENTS (WCAG 2.2 AAA)

### New WCAG 2.2 Success Criteria (MANDATORY)
WCAG 2.2 adds 9 new success criteria focusing on accessibility for users with low vision, cognitive disabilities, and motor disabilities

**Level AA Requirements:**
1. **2.4.11 Focus Not Obscured (Minimum)**: Focus indicator must remain at least partially visible
2. **2.4.13 Focus Appearance**: Focus indicators need sufficient color contrast and size
3. **2.5.7 Dragging Movements**: Provide click-to-select alternatives
4. **2.5.8 Target Size**: Interactive elements minimum 24×24 CSS pixels (AAA requires 44×44px)
5. **3.2.6 Consistent Help**: Help available consistently across pages
6. **3.3.7 Redundant Entry**: Allow autocomplete or saved preferences
7. **3.3.8 Accessible Authentication**: Avoid cognitive function tests in authentication

**Level AAA Requirements:**
1. **Color Contrast**: 7:1 for normal text, 4.5:1 for large text
2. **Touch Targets**: 44×44px minimum
3. **Focus Visibility**: Fully visible focus indicators
4. **No Cognitive Tests**: For any user interaction

### Implementation Checklist
```javascript
// ✅ Semantic HTML with proper ARIA
<nav aria-label="Điều hướng chính">
  <ul role="list">
    <li>
      <a 
        href="/" 
        aria-current={$page.url.pathname === '/' ? 'page' : undefined}
      >
        Trang chủ
      </a>
    </li>
  </ul>
</nav>

// ✅ Accessible buttons (44x44px touch target)
<button 
  class="min-w-[44px] min-h-[44px]"
  aria-label="Mở menu"
>
  Menu
</button>

// ✅ Proper heading hierarchy
<h1>Tiêu đề chính</h1>
<h2>Mục con</h2>
<h3>Chi tiết</h3>
```

---

## PERFORMANCE OPTIMIZATION STRATEGIES

### 1. Image Optimization (CRITICAL)
Use @sveltejs/enhanced-img package for automatic optimization - processes static images at build time and provides optimized .avif and .webp formats

```javascript
// Use enhanced-img for automatic optimization
import { Image } from '@sveltejs/enhanced-img';

<Image 
  src="/images/hero.jpg" 
  alt="Mô tả hình ảnh chi tiết" 
  loading="lazy"
  width={800}
  height={600}
/>
```

**Additional optimizations:**
- Compress images before deployment (TinyPNG, Squoosh)
- Use modern formats: AVIF > WebP > JPEG
- Lazy load below-the-fold images
- Set explicit width/height to prevent CLS

### 2. CSS Optimization
Inline CSS by setting inlineStyleThreshold to Infinity eliminates extra requests for external CSS files

```javascript
// svelte.config.js
const config = {
  kit: {
    inlineStyleThreshold: Infinity, // Inline all CSS
  }
};
```

**TailwindCSS optimization:**
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. Font Optimization
Self-host fonts and preload them in the handle hook for better performance

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
  return resolve(event, {
    preload: ({ type }) => {
      return type === 'font' || type === 'js' || type === 'css';
    }
  });
}
```

### 4. Caching Strategy
Appropriate caching headers can significantly improve response times

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  // Cache static assets aggressively (1 year)
  if (event.url.pathname.startsWith('/images/') || 
      event.url.pathname.startsWith('/fonts/')) {
    response.headers.set(
      'Cache-Control', 
      'public, max-age=31536000, immutable'
    );
  }
  
  // Cache pages with revalidation (1 hour local, 24 hours CDN)
  if (!event.url.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control', 
      'public, max-age=3600, s-maxage=86400'
    );
  }
  
  return response;
}
```

### 5. Code Splitting & Dynamic Imports
```javascript
// Lazy load heavy components
let HeavyComponent;

function toggleExpand() {
  if (!HeavyComponent) {
    HeavyComponent = import('./HeavyComponent.svelte');
  }
}
```

### 6. Streaming Promises (Advanced)
Remove data-waiting bottlenecks by initializing promises in load function and streaming results

```javascript
// +page.server.js
export async function load() {
  return {
    // Stream this promise (don't await)
    posts: fetchPosts(),
    categories: fetchCategories(),
  };
}
```

---

## HUGO-LEVEL PERFORMANCE

### Why Hugo is Fast
Hugo is written in Go, optimized for speed with advanced templating and fast asset pipelines, rendering large sites in seconds

Hugo builds thousands of pages in under a second thanks to its Go-based engine, outputting pure static HTML with no server-side rendering delays

Hugo builds at <1 ms per page, with average site building in less than a second

### Achieving Hugo-Level Speed in SvelteKit

1. **Static Site Generation (SSG):**
```javascript
// svelte.config.js
export default {
  kit: {
    adapter: adapter({
      runtime: 'edge',
      regions: ['all']
    }),
    prerender: {
      entries: ['*'], // Prerender all pages
      handleHttpError: ({ path, message }) => {
        console.warn(`Prerender: ${path} - ${message}`);
      }
    }
  }
};
```

2. **Minimal JavaScript:**
- Use Svelte 5's compiled output (no runtime overhead)
- Avoid unnecessary client-side hydration
- Static pages where possible

3. **Optimized Build:**
```bash
# Production build optimizations
pnpm build
# Output should be pure static HTML + minimal JS
```

---

## SVELTE 5 MODERN PATTERNS (MANDATORY)

### ✅ USE (Modern Svelte 5 Runes)
```javascript
<script>
  // Reactive state
  let count = $state(0);
  
  // Derived state
  let doubled = $derived(count * 2);
  
  // Props with destructuring
  let { title, content, date } = $props();
  
  // Side effects (use sparingly)
  $effect(() => {
    // Only for true side effects (DOM, logging, external APIs)
    console.log('Count changed:', count);
  });
  
  // Functions
  function increment() {
    count++;
  }
</script>

<article>
  <h2>{title}</h2>
  <time>{date}</time>
  <div>{@html content}</div>
  <button onclick={increment}>Count: {count}</button>
</article>
```

### ❌ AVOID (Legacy Svelte 4 Syntax)
```javascript
// ❌ DO NOT USE
let count = 0;
$: doubled = count * 2;
export let title;
```

---

## CLEAN CODE STANDARDS

### Component Structure
```javascript
<script>
  // 1. Imports
  import { formatDate } from '$lib/utils/formatDate';
  import PostCard from '$lib/components/PostCard.svelte';
  
  // 2. Props
  let { posts = [] } = $props();
  
  // 3. Local state
  let filter = $state('all');
  
  // 4. Derived state
  let filteredPosts = $derived(
    posts.filter(p => filter === 'all' || p.category === filter)
  );
  
  // 5. Functions (alphabetically)
  function handleFilter(newFilter) {
    filter = newFilter;
  }
</script>

<!-- 6. Template (semantic HTML) -->
<section aria-labelledby="posts-heading">
  <h2 id="posts-heading">Bài viết mới nhất</h2>
  
  <div role="group" aria-label="Lọc bài viết">
    <button 
      onclick={() => handleFilter('all')}
      aria-pressed={filter === 'all'}
      class="min-w-[44px] min-h-[44px]"
    >
      Tất cả
    </button>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each filteredPosts as post (post.id)}
      <PostCard {post} />
    {/each}
  </div>
</section>

<!-- 7. Scoped styles -->
<style>
  /* Minimal CSS, prefer TailwindCSS utilities */
  section {
    padding: 2rem 1rem;
  }
</style>
```

---

## MARKDOWN CONTENT STANDARDS

### Blog Post Structure
```markdown
---
title: "Tiêu đề bài viết"
date: "2026-01-21"
author: "Tên tác giả"
excerpt: "Mô tả ngắn gọn nội dung bài viết"
image: "/images/featured.webp"
tags: ["công nghệ", "lập trình", "web"]
category: "tech"
---

# Tiêu đề chính (H1)

Đoạn mở đầu với **từ khóa quan trọng** được in đậm.

## Mục 1 (H2)

Nội dung chi tiết với hình ảnh minh họa.

![Mô tả hình ảnh](/images/content-image.webp)

### Mục con 1.1 (H3)

- Điểm 1
- Điểm 2
- Điểm 3

## Mục 2 (H2)

Tiếp tục nội dung...

```

---

## SVELTIA CMS CONFIGURATION

### OAuth Setup (Multi-Platform)
```yaml
# static/admin/config.yml
backend:
  name: git-gateway
  branch: main
  # OAuth providers
  auth_type: oauth2

media_folder: static/images
public_folder: /images

locale: 'vi'

collections:
  - name: 'blog'
    label: 'Bài viết'
    label_singular: 'Bài viết'
    folder: 'src/content/blog'
    create: true
    slug: '{{year}}-{{month}}-{{day}}-{{slug}}'
    fields:
      - { label: 'Tiêu đề', name: 'title', widget: 'string', required: true }
      - { label: 'Ngày đăng', name: 'date', widget: 'datetime', required: true }
      - { label: 'Tác giả', name: 'author', widget: 'string', required: true }
      - { label: 'Mô tả', name: 'excerpt', widget: 'text', required: true }
      - { label: 'Hình ảnh', name: 'image', widget: 'image', required: true }
      - { label: 'Danh mục', name: 'category', widget: 'select', options: ['tech', 'lifestyle'], required: true }
      - { label: 'Thẻ', name: 'tags', widget: 'list', required: false }
      - { label: 'Nội dung', name: 'body', widget: 'markdown', required: true }
```

---

## QUALITY ASSURANCE WORKFLOW

### Phase 1: Initial Audit
```bash
# 1. Run all validation commands
pnpm check       # Svelte syntax check
pnpm lint        # ESLint validation
pnpm build       # Production build test

# 2. Document ALL errors/warnings found
# Create a prioritized fix list

# 3. Run Lighthouse audit
# Document current scores
```

**STOP HERE - Ask for approval on fix priority**

### Phase 2: Fix Critical Bugs
1. Fix console errors (one at a time)
2. Fix build errors
3. Fix broken functionality
4. Test after each fix
5. Commit with clear message

**STOP - Confirm fixes work before proceeding**

### Phase 3: Optimize Performance
1. Optimize images (WebP/AVIF, compression, lazy loading)
2. Remove unused CSS (TailwindCSS purge)
3. Implement caching headers
4. Optimize fonts (self-host, preload)
5. Run Lighthouse - target 90+ all metrics

**STOP - Verify performance improvements**

### Phase 4: Accessibility Audit
1. Fix semantic HTML issues
2. Add missing ARIA labels
3. Improve color contrast (7:1 for AAA)
4. Ensure keyboard navigation
5. Add focus indicators (2.4.13)
6. Fix touch target sizes (44×44px)
7. Run accessibility audit - target 100/100

**STOP - Verify accessibility compliance**

### Phase 5: Code Cleanup
1. Remove redundant code
2. Update to Svelte 5 runes (if needed)
3. Simplify complex logic
4. Add/improve English comments
5. Modularize large components

**STOP - Code review checkpoint**

### Phase 6: SEO Optimization
1. Verify meta tags (title, description, OG)
2. Generate/update sitemap
3. Add structured data (JSON-LD)
4. Run SEO audit - target 100/100

**STOP - SEO verification**

### Phase 7: Final Testing
```bash
# Run full validation suite
pnpm check && pnpm lint && pnpm build

# Test on multiple browsers
# - Chrome
# - Firefox
# - Safari
# - Edge

# Test on multiple devices
# - Desktop (1920x1080)
# - Tablet (768x1024)
# - Mobile (375x667)

# Test with screen readers
# - NVDA (Windows)
# - VoiceOver (Mac/iOS)

# Test on slow network (3G simulation)
```

**STOP - Final approval before completion**

---

## DEPLOYMENT CONFIGURATION

### Multi-Platform Adapter
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto'; // Auto-detects platform
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const config = {
  extensions: ['.svelte', '.md'],
  
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      layout: './src/lib/components/PostLayout.svelte'
    })
  ],
  
  kit: {
    adapter: adapter({
      runtime: 'edge',
      regions: ['all']
    }),
    
    // Inline CSS for performance
    inlineStyleThreshold: Infinity,
    
    // Prerender all routes
    prerender: {
      entries: ['*'],
      handleHttpError: 'warn'
    }
  }
};

export default config;
```

---

## SUCCESS CRITERIA

### Required Deliverables
1. ✅ **Zero errors**: No console, lint, or build errors
2. ✅ **Perfect Lighthouse**: 100/100 on all 4 metrics
3. ✅ **WCAG 2.2 AAA**: Full compliance verified
4. ✅ **Hugo-level speed**: <3s load on 3G
5. ✅ **Cross-platform**: Works on Netlify, Vercel, Cloudflare
6. ✅ **Vietnamese UI**: 100% Vietnamese text, English comments
7. ✅ **Clean code**: Svelte 5 runes, modular, documented
8. ✅ **Responsive**: Perfect on all devices
9. ✅ **SEO-optimized**: Meta tags, sitemap, structured data
10. ✅ **Production-ready**: Deployable with confidence

---

## EXECUTION INSTRUCTIONS

When you start:

1. **Audit Phase**:
   - Run `pnpm check`, `pnpm lint`, `pnpm build`
   - Document ALL issues found
   - Create prioritized fix list
   - **ASK**: "Found X issues. Here's the priority list. Proceed?"

2. **Fix Phase** (iterative):
   - Fix ONE issue at a time
   - Test after each fix
   - Run validation commands
   - Commit with clear message
   - **REPORT**: "Fixed [issue]. Tests pass. Continue?"

3. **Optimize Phase**:
   - Implement optimizations one by one
   - Measure impact with Lighthouse
   - Document improvements
   - **REPORT**: "Score improved from X to Y. Next?"

4. **Final Phase**:
   - Run full test suite
   - Cross-browser testing
   - Accessibility audit
   - **REPORT**: "All tests pass. Ready for review."

---

## REMEMBER

- **Quality > Speed**: Take time to do it right
- **User Experience First**: Fast, accessible, beautiful
- **No Assumptions**: Ask before major changes
- **Test Everything**: After every single modification
- **Document Changes**: Clear commit messages
- **Vietnamese Users**: Culturally appropriate design
- **Professional Standards**: This is production code

---

**Are you ready to begin? Start with the Initial Audit phase and wait for approval before proceeding with fixes.**