<script setup lang="ts">
import { PropType } from 'vue'

const MAX_SUMMARY_LENGTH = 300
type CommonItem = {
    duration: string,
    location: string,
    summary: string,
}

type WorkItem = {
    company: string,
    position: string,
} & CommonItem

type EducationItem = {
    institution: string,
    degree: string | string[],
    activities: string[],
    description: string[],
} & CommonItem

type AccordionItem = WorkItem | EducationItem

const props = defineProps({
  data: {
    type: Array as PropType<AccordionItem[]>,
    required: true
  }
})

// Add isClosed so we can handle open/close of accordion elements.
const data = reactive(props.data.map((item: any) => ({ ...item, isClosed: true })))
const truncate = (string: string) => {
  return (string.length > MAX_SUMMARY_LENGTH) ? string.substring(0, MAX_SUMMARY_LENGTH) + '…' : string
}
</script>

<template>
  <div @click="entry.isClosed = !entry.isClosed" v-for="entry in data" :key="entry.institution || entry.company" class="block p-6 sm:mx-2 shadow-lg bg-white dark:bg-slate-700 w-full mt-6">
    <div class="flex justify-between">
      <div class="text-left w-[95%]">
        <h5 id="company" class="text-gray-900 dark:text-white text-xl leading-tight font-medium">
          <span>{{ entry.position || (Array.isArray(entry.degree) ? entry.degree[entry.degree.length - 1] : entry.degree) }} @ {{ entry.company || entry.institution }}</span>
        </h5>
        <span class="text-gray-600 dark:text-slate-300 text-sm leading-tight font-medium mt-2">{{ entry.duration }}</span>
        <span class="text-gray-600 dark:text-slate-300 text-sm leading-tight font-medium mb-2"> ({{ entry.location }})</span>
      </div>
      <span v-show="entry.summary && entry.summary.length > MAX_SUMMARY_LENGTH" :class="entry.isClosed ? 'rotate-180' : 'mt-2'" class="h-full cursor-pointer">^</span>
    </div>
    <div v-if="entry.isClosed" class="text-gray-900 dark:text-slate-300 text-base my-4">
      <div v-if="Array.isArray(entry.summary)">
        <ul v-for="summary in entry.summary" v-bind:key="summary">
          <li>{{ summary ? truncate(summary) : '' }}</li>
        </ul>
      </div>
      <div v-else>
        {{ entry.summary ? truncate(entry.summary) : '' }}
      </div>
    </div>
    <div v-else class="text-gray-900 dark:text-slate-300 text-base my-4">
      <div v-if="Array.isArray(entry.summary)">
        <ul v-for="summary in entry.summary" v-bind:key="summary">
          <li>{{ summary ? truncate(summary) : '' }}</li>
        </ul>
      </div>
      <div v-else>
        {{ entry.summary || '' }}
      </div>
    </div>
  </div>
</template>
