<script setup lang="ts">
import { MasonryItem } from "../Masonry/types"

var projects = (await queryContent('/data/projects').findOne())

const emit = defineEmits(['openDetail'])
var openDetail = (item: MasonryItem) => {
  emit('openDetail', item)
}
</script>


<template>
  <div class="mt-3 sm:mt-12">
    <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Client Projects</h2>
      <MasonryList id="client" :data="projects.client" :method="openDetail" />
  </div>
  <div class="mt-3 sm:mt-12">
    <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Open Source Projects</h2>
      <MasonryList id="opensource" :data="projects.opensource" :method="openDetail" />
  </div>
</template>