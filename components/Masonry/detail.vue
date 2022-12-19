<script setup lang="ts">
import { PropType } from 'vue'
import type { MasonryItem } from './types'

const props = defineProps({
  data: {
    type: Object as PropType<MasonryItem>,
    required: true
  },
  method: {
    type: Function,
    required: true
  }
})
const item = props.data
const returnToList = props.method
</script>

<template>
  <div class="item bg-white dark:bg-slate-700">
    <div class="content">
      <div class="p-5 bg-slate-700 dark:bg-white">
        <h3 class="flex justify-between text-lg text-white dark:text-slate-700 uppercase">
          <a class="cursor-pointer" @click="returnToList()">&lt;</a>
          <span>{{ item.title }}</span>
          <span></span>
        </h3>
      </div>
      <img v-if="item.isThumb" loading="lazy" class="w-full" :src="item.src" />
      <div class="p-2.5 pb-1">
        <img class="w-1/2 mt-0 mr-2.5 mb-2.5 ml-0 float-left" v-if="item.src && !item.isThumb" :src="item.src">
        <p class="pb-2.5">{{ item.text }}</p>
      </div>
    </div>
  </div>
</template>