<script setup lang="ts">
import { PropType } from 'vue'

type EventItem = {
    title: string,
    slug: string,
    designation: string,
    type: string,
    date: string | string[],
    location: string | string[],
    status: string,
    description: string,
    link: string | string[]
}

const props = defineProps({
  upcoming: {
    type: Boolean,
    required: false,
    default: false
  },
  data: {
    type: Array as PropType<EventItem[]>,
    required: true
  }
})

const data = reactive(props.data.map((item: any) => ({ ...item })))

const duration = (date: any) => {
  if (Array.isArray(date) && date.length == 2) {
    return date[0] + ' - ' + date[1]
  } else {
    return date
  }
}

const ucfirst = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
</script>

<template>
  <div v-for="entry in data" :key="entry.slug" class="block py-8 p-6 text-white">
    <div class="flex">
      <div class="flex-1 mx-6 -skew-x-12 self-center">
        <div class="max-w-3xl mx-auto my-0 dark:bg-white bg-transparent p-2">
          <img :src="entry.image" />
        </div>
      </div>
      <div :class="[{'text-black dark:text-white' : !upcoming}]" class="flex flex-col flex-1 mx-6 self-center text-left">
        <h1 class="text-2xl">{{ ucfirst(entry.designation) }} @ {{ entry.title }}</h1>
        <span class="text-sm">{{ duration(entry.date) }}</span>
        <p class="my-2 text-justify">{{ entry.description }}</p>
        <div class="flex mt-2">
          <a class="hover:text-slate-400" :key="link.site" v-for="link in entry.link" :href="link.url" target="_new"><span class="text-sm flex items-center">{{ link.site }}<Icon class="mx-2" name="heroicons-outline:chevron-right" /></span></a>
        </div>
      </div>
    </div>
  </div>
</template>
