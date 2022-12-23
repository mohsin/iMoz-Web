<script setup lang="ts">
import { PropType } from 'vue'
import type { MasonryItem } from './types'

const props = defineProps({
  data: {
    type: Object as PropType<MasonryItem>,
    required: true
  }
})
const item = props.data
</script>

<template>
  <div class="flow-root bg-white dark:bg-slate-700">
    <div class="p-2 py-5 sm:p-5 bg-slate-700 dark:bg-white dark:border">
      <h3 class="mr-4 flex items-center justify-between text-lg text-white dark:text-slate-700 uppercase">
        <a class="cursor-pointer text-white dark:text-black" @click="$emit('onReturnToList')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" height="24" width="24" fill="currentColor"><path d="M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z"/></svg></a>
        <span class="px-2">{{ item.title }}</span>
        <span></span>
      </h3>
    </div>
    <img v-if="item.isThumb" loading="lazy" class="w-full" :src="item.src" />
    <div class="p-2.5 pb-1">
      <img class="w-1/2 mt-0 mr-2.5 mb-2.5 ml-0 float-left" v-if="item.src && !item.isThumb" :src="item.src">
      <p class="pb-2.5">{{ item.text }}</p>
    </div>
  </div>
</template>