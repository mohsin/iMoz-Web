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

const statusColors: Record<string, string> = {
  Live:      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Active:    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Inactive:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Archived:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  Expired:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}

const getBadgeGroups = (doc: any) => [
  { label: 'Languages',  value: doc?.languages,  bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { label: 'Frameworks', value: doc?.frameworks, bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { label: 'Tools',      value: doc?.tools,      bgColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  { label: 'Platforms',  value: doc?.platforms,  bgColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
]

const hasBadges = (doc: any) => getBadgeGroups(doc).some(g => parseTags(g.value).length > 0)
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

    <ContentDoc :path="'/data/projects/' + item.slug">
      <template #default="{ doc }">
        <img v-if="item.isThumb" loading="lazy" class="w-full" :src="item.src" />
        <div class="flex flex-col md:flex-row">

          <!-- Sidebar: logo + metadata -->
          <div class="flex-shrink-0 p-4 md:w-1/3 md:border-r border-slate-100 dark:border-slate-600 space-y-4">
            <img v-if="item.src && !item.isThumb" loading="lazy" class="w-full" :src="item.src" />

            <!-- Meta fields -->
            <div class="space-y-3 text-sm">
              <div v-if="item.status">
                <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Status</p>
                <span :class="statusColors[item.status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'" class="inline-block text-xs font-medium px-2 py-0.5 rounded-full">{{ item.status }}</span>
              </div>
              <div v-if="item.duration">
                <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Duration</p>
                <p class="text-gray-700 dark:text-slate-300">{{ item.duration }}</p>
              </div>
              <div v-if="item.type">
                <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Type</p>
                <p class="text-gray-700 dark:text-slate-300">{{ item.type }}</p>
              </div>
              <div v-if="doc.location">
                <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Location</p>
                <p class="text-gray-700 dark:text-slate-300">{{ doc.location }}</p>
              </div>
              <div v-if="doc.designation">
                <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Role</p>
                <p class="text-gray-700 dark:text-slate-300">{{ doc.designation }}</p>
              </div>
              <div v-if="doc.website">
                <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Website</p>
                <a :href="'https://' + doc.website" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline break-all">{{ doc.website }}</a>
              </div>
            </div>

            <!-- Tech stack badges -->
            <div v-if="hasBadges(doc)" class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-600">
              <div v-for="group in getBadgeGroups(doc)" :key="group.label" v-show="parseTags(group.value).length > 0">
                <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">{{ group.label }}</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in parseTags(group.value)" :key="tag" :class="group.bgColor" class="inline-block text-xs font-medium px-2 py-0.5 rounded-full">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main content -->
          <ContentRenderer class="p-4 min-w-0 project-content" :value="doc" />
        </div>
      </template>
      <template #not-found>
        <img v-if="item.isThumb" loading="lazy" class="w-full" :src="item.src" />
        <div class="p-2.5 pb-1">
          <img class="w-1/2 sm:w-1/3 sm:px-12 mt-0 mr-2.5 mb-2.5 ml-0 float-left" v-if="item.src && !item.isThumb" :src="item.src">
          <p class="pb-2.5 text-gray-900 dark:text-slate-300">{{ item.description }}</p>
        </div>
      </template>
    </ContentDoc>
  </div>
</template>

<style scoped>
:deep(.project-content p) { margin-bottom: 1rem; }
:deep(.project-content h2) { font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
:deep(.project-content h3) { font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
:deep(.project-content ul),
:deep(.project-content ol) { padding-left: 1.25rem; margin-bottom: 1rem; }
:deep(.project-content li) { margin-bottom: 0.25rem; }
:deep(.project-content ul) { list-style-type: disc; }
:deep(.project-content ol) { list-style-type: decimal; }
</style>
