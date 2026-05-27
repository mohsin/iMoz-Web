<script setup lang="ts">
defineProps<{ data: any }>()
defineEmits(['return'])
</script>

<template>
  <div class="flow-root bg-white dark:bg-slate-700">
    <!-- Header — matches MasonryDetail style -->
    <div class="p-2 py-5 sm:p-5 bg-slate-700 dark:bg-slate-600">
      <h3 class="flex items-center justify-between text-lg text-white uppercase">
        <button class="cursor-pointer text-white" aria-label="Back to services" @click="$emit('return')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="24" width="24" fill="currentColor">
            <path d="M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z"/>
          </svg>
        </button>
        <span class="px-2">{{ data.title }}</span>
        <span></span>
      </h3>
    </div>

    <!-- Body -->
    <div class="p-4 sm:p-6">
      <!-- Tagline -->
      <p class="text-gray-500 dark:text-slate-400 text-base mb-8">{{ data.tagline }}</p>

      <!-- Capability categories -->
      <div v-for="category in data.categories" :key="category.name" class="mb-7">
        <h4 class="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 pb-2 border-b border-slate-100 dark:border-slate-600">
          {{ category.name }}
        </h4>
        <ul class="space-y-3">
          <li v-for="cap in category.capabilities" :key="cap.name" class="flex gap-3">
            <span class="flex-shrink-0 mt-2 w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-500"></span>
            <p class="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
              <span class="font-semibold text-gray-900 dark:text-white">{{ cap.name }}</span>
              <span class="text-gray-400 dark:text-slate-500"> — </span>
              {{ cap.value }}
            </p>
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="mt-8 pt-5 border-t border-slate-100 dark:border-slate-600 flex flex-col sm:flex-row sm:items-center gap-3">
        <p class="text-sm text-gray-500 dark:text-slate-400 flex-1">Interested in this service? Get in touch and I'll put together a proposal.</p>
        <NuxtLink
          to="/contact"
          class="inline-flex items-center gap-2 bg-slate-700 dark:bg-slate-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors flex-shrink-0"
        >
          Get in touch
          <Icon name="heroicons-outline:arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
