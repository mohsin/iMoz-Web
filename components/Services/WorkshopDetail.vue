<script setup lang="ts">
const props = defineProps<{ data: any }>()
defineEmits(['return'])

const activeLabel = ref(props.data.tabs[0].label)
const currentTab = computed(() => props.data.tabs.find((t: any) => t.label === activeLabel.value))
const topics = computed(() => currentTab.value?.topics ?? [])
const showHighlight = computed(() => currentTab.value?.highlight === true && !!props.data.highlight)
</script>

<template>
  <div class="flow-root bg-white dark:bg-slate-700">
    <!-- Header -->
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
      <!-- Description -->
      <p class="text-gray-600 dark:text-slate-300 text-base leading-relaxed mb-5">{{ data.description }}</p>

      <!-- Meta badges -->
      <div class="flex flex-wrap gap-2 mb-6">
        <span class="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1">
          <Icon name="heroicons-outline:clock" class="w-3.5 h-3.5" />
          {{ data.duration }}
        </span>
        <span class="inline-flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1">
          <Icon name="heroicons-outline:user-group" class="w-3.5 h-3.5" />
          {{ data.audience }}
        </span>
      </div>

      <!-- Highlight box — only on tabs where highlight: true -->
      <div v-if="showHighlight" class="flex items-center gap-3 bg-amber-50 dark:bg-slate-600 border border-amber-100 dark:border-slate-500 px-4 py-3 mb-6">
        <Icon :name="data.highlight_icon" class="w-5 h-5 text-amber-500 flex-shrink-0" />
        <span class="text-sm font-medium text-gray-800 dark:text-white">{{ data.highlight }}</span>
      </div>

      <!-- Topics tabs -->
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Topics Covered</h4>
        <div class="flex overflow-hidden border border-slate-200 dark:border-slate-600 text-xs font-medium">
          <button
            v-for="(tab, i) in data.tabs"
            :key="tab.label"
            :class="[
              activeLabel === tab.label ? 'bg-slate-700 text-white' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600',
              i > 0 ? 'border-l border-slate-200 dark:border-slate-600' : ''
            ]"
            class="px-3 py-1.5 transition-colors"
            @click="activeLabel = tab.label"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="border border-slate-100 dark:border-slate-600 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-700 dark:bg-slate-600">
              <th class="text-left text-white font-medium p-3 w-10 tabular-nums">#</th>
              <th class="text-left text-white font-medium p-3">Topic</th>
              <th class="text-right text-white font-medium p-3 whitespace-nowrap">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(topic, i) in topics"
              :key="topic.name"
              :class="i % 2 === 0 ? 'bg-white dark:bg-slate-700' : 'bg-slate-50 dark:bg-slate-800'"
            >
              <td class="p-3 text-slate-400 dark:text-slate-500 tabular-nums">{{ i + 1 }}</td>
              <td class="p-3 text-gray-800 dark:text-slate-200">{{ topic.name }}</td>
              <td class="p-3 text-slate-500 dark:text-slate-400 text-right tabular-nums whitespace-nowrap">{{ topic.duration }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CTA -->
      <div class="mt-8 pt-5 border-t border-slate-100 dark:border-slate-600 flex flex-col sm:flex-row sm:items-center gap-3">
        <p class="text-sm text-gray-500 dark:text-slate-400 flex-1">Interested in running this workshop at your institution or company?</p>
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
