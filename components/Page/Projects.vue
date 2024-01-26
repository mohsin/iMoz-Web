<script setup lang="ts">
import { MasonryItem } from '../Masonry/types';

// Function to standardize dates for parsing.
const standardizeDate = (input: string) => {
    let parts = input.split(' ');
    if (parts.length == 2)
      return `01 ${parts[0]} ${parts[1]}`
    else if (parts.length == 1)
      return `01 Jan ${parts[0]}`
    else
      return input
}

// Function that sorts projects based on the closing date of the project, latest first.
const sortByDate = (projects: MasonryItem[]) => {
  return projects.sort(function(a: MasonryItem, b: MasonryItem) {
    const aDurationStr = a.duration.split('-').map(s => s.trim()).pop()?.toString() ?? ''
    const aDuration = Date.parse(standardizeDate(aDurationStr))
    const bDurationStr = b.duration.split('-').map(s => s.trim()).pop()?.toString() ?? ''
    const bDuration = Date.parse(standardizeDate(bDurationStr))
    return bDuration - aDuration;
  });
}

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
        <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="client" :data="sortByDate(projects.client)" />
    </div>
    <div class="mt-3 sm:mt-12">
      <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Open Source Projects</h2>
        <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="opensource" :data="sortByDate(projects.opensource)" />
    </div>
    <div class="mt-3 sm:mt-12">
      <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Others</h2>
        <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="others" :data="sortByDate(projects.others)" />
    </div>
  </div>
</template>