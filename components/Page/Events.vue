<script setup lang="ts">
import { PropType } from 'vue'

type EventItem = {
    title: string,
    slug: string,
    image: string,
    designation: string,
    type: string,
    date: string | string[],
    location: string | string[],
    status: string,
    description: string,
    link: string | string[],
    photos?: string[]
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
  <div class="relative mb-20">
    <!-- Timeline line -->
    <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 dark:bg-slate-600 transform -translate-x-1/2"></div>

    <!-- Events -->
    <div class="space-y-8 sm:space-y-12 mt-12">
      <div v-for="(entry, index) in data" :key="entry.slug" class="relative pt-8 sm:pt-0 flex flex-col sm:grid sm:grid-cols-2">
        <!-- Timeline dot -->
        <div class="absolute left-1/2 top-0 sm:top-6 w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full transform -translate-x-1.5 border-4 border-white dark:border-slate-900"></div>

        <!-- Event card (mobile: first; desktop: col 1 for even, col 2 for odd) -->
        <div :class="[
          'relative bg-white dark:bg-slate-700 rounded-lg shadow-lg text-gray-900 dark:text-slate-300 sm:row-start-1',
          index % 2 === 0 ? 'sm:col-start-1' : 'sm:col-start-2'
        ]">

          <!-- Image header (full bleed) -->
          <div v-if="entry.image" class="w-full bg-gray-200 dark:bg-slate-600 rounded-t-lg overflow-hidden flex items-center justify-center">
            <img :src="entry.image" :alt="entry.title" class="w-full max-h-96 object-contain" />
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Mobile: Date above card -->
            <div class="sm:hidden flex items-center mb-3 gap-2">
              <span class="text-sm font-semibold text-gray-600 dark:text-slate-400">{{ duration(entry.date) }}</span>
              <span class="inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ entry.type }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ ucfirst(entry.designation) }} @ {{ entry.title }}</h3>

            <!-- Location -->
            <div v-if="entry.location" class="text-sm text-gray-600 dark:text-slate-400 mb-3 flex items-start">
              <Icon name="heroicons-outline:map-pin" class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div v-for="loc in (Array.isArray(entry.location) ? entry.location : [entry.location])" :key="loc">
                  {{ loc }}
                </div>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm mb-4 text-gray-700 dark:text-slate-300 leading-relaxed">
              {{ entry.description }}
            </p>

            <!-- Links -->
            <div class="flex flex-wrap gap-3">
              <a v-for="link in entry.link" :key="link.site" :href="link.url" target="_blank" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center">
                {{ link.site }}
                <Icon class="ml-1 w-4 h-4" name="heroicons-outline:chevron-right" />
              </a>
            </div>
          </div>
        </div>

        <!-- Opposite side column: date/type label + carousel (desktop only) -->
        <div :class="[
          'hidden sm:flex sm:flex-col sm:items-center sm:justify-center sm:row-start-1',
          index % 2 === 0 ? 'sm:col-start-2' : 'sm:col-start-1'
        ]">
          <span class="text-xs font-semibold text-gray-600 dark:text-slate-400 whitespace-nowrap">{{ duration(entry.date) }}</span>
          <span class="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
            {{ entry.type }}
          </span>
          <EventPhotoCarousel
            v-if="entry.photos?.length"
            :photos="entry.photos"
            :title="entry.title"
            class="mt-3 w-full"
          />
        </div>

        <!-- Mobile-only carousel (below card) -->
        <EventPhotoCarousel
          v-if="entry.photos?.length"
          :photos="entry.photos"
          :title="entry.title"
          class="sm:hidden mt-3"
        />
      </div>
    </div>
  </div>
</template>
