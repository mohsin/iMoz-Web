<script setup lang="ts">
// `::private` block in a Markdown content file. Only ever seen with plaintext
// content (local preview before the pre-commit hook encrypts it); committed
// files carry a `::private-block` marker instead, rendered by PrivateBlock.
</script>

<template>
  <div class="private-content border-t-2 border-slate-200 dark:border-slate-600 mt-4 pt-5">
    <div class="flex items-center gap-2 mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 text-amber-500" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
      </svg>
      <p class="text-xs font-semibold uppercase tracking-widest text-amber-500">Private</p>
    </div>
    <slot />
  </div>
</template>
