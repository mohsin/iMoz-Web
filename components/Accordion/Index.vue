<script setup lang="ts">
import { PropType } from 'vue'

const MAX_SUMMARY_LENGTH = 300
type AccordionItem = {
    company: string,
    duration: string,
    location: string,
    position: string,
    summary: string,
}

const props = defineProps({
  data: {
    type: Array as PropType<AccordionItem[]>,
    required: true
  }
})

// Add isClosed so we can handle open/close of accordion elements.
const data = reactive(props.data.map((work: any) => ({ ...work, isClosed: true })))

const truncate = (string: string) => {
  return (string.length > MAX_SUMMARY_LENGTH) ? string.substring(0, MAX_SUMMARY_LENGTH) + '…' : string
}
</script>

<template>
  <div @click="entry.isClosed = !entry.isClosed" v-for="entry in data" v-bind:key="entry.company" class="block p-6 mx-2 rounded-lg shadow-lg bg-white dark:bg-slate-700 w-full mt-6">
    <div class="flex justify-between">
      <div class="text-left w-[95%]">
        <h5 id="company" class="text-gray-900 dark:text-white text-xl leading-tight font-medium">
          <span>{{ entry.position }} @ {{ entry.company }}</span>
        </h5>
        <span class="text-gray-600 dark:text-slate-300 text-sm leading-tight font-medium mt-2">{{ entry.duration }}</span>
        <span class="text-gray-600 dark:text-slate-300 text-sm leading-tight font-medium mb-2"> ({{ entry.location }})</span>
      </div>
      <span v-show="entry.summary.length > MAX_SUMMARY_LENGTH" :class="entry.isClosed ? 'rotate-180' : 'mt-2'" class="h-full cursor-pointer">^</span>
    </div>
    <p v-if="entry.isClosed" class="text-gray-900  dark:text-slate-300 text-base my-4">
      {{ truncate(entry.summary) }}
    </p>
    <p v-else class="text-gray-900 dark:text-slate-300 text-base my-4">
      {{ entry.summary }}
    </p>
  </div>
</template>
