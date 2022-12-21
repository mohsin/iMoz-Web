<script setup lang="ts">
import { MasonryItem } from '../Masonry/types';

var projects = (await queryContent('/data/projects').findOne())
const emit = defineEmits(['onDetailClick', 'onReturnToList'])

const switchToDetail = (item: MasonryItem) => {
  emit('onDetailClick', item)
}

const returnToList = () => {
  emit('onReturnToList')
}
</script>

<template>
  <div>
    <div class="mt-3 sm:mt-12">
      <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Client Projects</h2>
        <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="client" :data="projects.client" />
    </div>
    <div class="mt-3 sm:mt-12">
      <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Open Source Projects</h2>
        <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="opensource" :data="projects.opensource" />
    </div>
  </div>
</template>