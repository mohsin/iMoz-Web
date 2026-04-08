<script setup lang="ts">
import { PropType } from 'vue'
import type { MasonryItem } from './types'

const { getRandomColor } = useColor()
const props = defineProps({
  data: {
    type: Object as PropType<MasonryItem>,
    required: true
  }
})
const item = props.data

const parseTags = (str?: string): string[] => {
  if (!str) return []
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0)
}

const badgeGroups = [
  { label: 'Languages', value: item.languages, bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { label: 'Frameworks', value: item.frameworks, bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { label: 'Tools', value: item.tools, bgColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  { label: 'Platforms', value: item.platforms, bgColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' }
]
</script>

<template>
  <div class="flow-root bg-white dark:bg-slate-700">
    <div class="p-2 py-5 sm:p-5 bg-slate-700 dark:bg-slate-600">
      <h3 class="mr-4 flex items-center justify-between text-lg text-white dark:text-white uppercase">
        <a class="cursor-pointer text-white dark:text-white" @click="$emit('onReturnToList')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="24" width="24" fill="currentColor"><path d="M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z"/></svg></a>
        <span class="px-2">{{ item.title }}</span>
        <span></span>
      </h3>
    </div>

    <div>
      <ContentDoc class="p-3" :path="'/data/projects/' + item.slug">
        <template #not-found>
          <img v-if="item.isThumb" loading="lazy" class="w-full" :src="item.src" />
          <div class="p-2.5 pb-1">
            <img class="w-1/2 sm:w-1/3 sm:px-12 mt-0 mr-2.5 mb-2.5 ml-0 float-left" v-if="item.src && !item.isThumb" :src="item.src">
            <p class="pb-2.5 text-gray-900 dark:text-slate-300">{{ item.description }}</p>
          </div>
        </template>
      </ContentDoc>
    </div>

    <!-- Tech Stack Badges -->
    <div v-if="badgeGroups.some(g => parseTags(g.value).length > 0)" class="px-3 pt-3 pb-3 border-t border-slate-100 dark:border-slate-600">
      <div v-for="group in badgeGroups" :key="group.label" v-show="parseTags(group.value).length > 0" class="flex flex-wrap items-center gap-y-2 mb-2">
        <span class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mr-2 font-medium">{{ group.label }}</span>
        <div class="flex flex-wrap gap-1">
          <span v-for="tag in parseTags(group.value)" :key="tag" :class="group.bgColor" class="inline-block text-xs font-medium px-2 py-0.5 rounded-full">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>