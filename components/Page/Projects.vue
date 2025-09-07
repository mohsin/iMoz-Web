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

// Load projects progressively
const allProjects = (await queryContent('/data/projects').findOne())
const sortedClientProjects = sortByDate(allProjects.client || [])
const sortedOpensourceProjects = sortByDate(allProjects.opensource || [])
const sortedOthersProjects = sortByDate(allProjects.others || [])

// Progressive loading state
const displayedClientProjects = ref<MasonryItem[]>(sortedClientProjects.slice(0, 6))
const opensourceProjects = ref<MasonryItem[]>([])
const othersProjects = ref<MasonryItem[]>([])
const showLoadMore = ref(sortedClientProjects.length > 6)
const isLoadingMore = ref(false)

const emit = defineEmits(['onDetailClick', 'onReturnToList'])

const switchToDetail = (item: MasonryItem) => {
  emit('onDetailClick', item)
}

const returnToList = () => {
  emit('onReturnToList')
}

// Load remaining content after initial render
const loadRemainingContent = async () => {
  isLoadingMore.value = true

  // Simulate a brief delay for better UX
  await new Promise(resolve => setTimeout(resolve, 300))

  // Add remaining client projects to the same grid
  displayedClientProjects.value = [...displayedClientProjects.value, ...sortedClientProjects.slice(6)]

  // Load other sections
  opensourceProjects.value = sortedOpensourceProjects
  othersProjects.value = sortedOthersProjects

  showLoadMore.value = false
  isLoadingMore.value = false
}

// Auto-load remaining content after a delay or on user interaction
onMounted(() => {
  // Auto-load after 2 seconds to ensure above-the-fold content is ready
  setTimeout(() => {
    if (showLoadMore.value) {
      loadRemainingContent()
    }
  }, 2000)
})
</script>

<template>
  <div>
    <!-- Client Projects (Progressive Loading) -->
    <div class="mt-3 sm:mt-12">
      <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Client Projects</h2>
      <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="client-projects" :data="displayedClientProjects" :progressive="true" />

      <!-- Load More Button -->
      <div v-if="showLoadMore" class="text-center mt-6">
        <button
          @click="loadRemainingContent"
          :disabled="isLoadingMore"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <span v-if="!isLoadingMore">Load More Projects</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        </button>
      </div>
    </div>

    <!-- Open Source Projects (Loaded progressively) -->
    <div v-if="opensourceProjects.length > 0" class="mt-3 sm:mt-12">
      <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Open Source Projects</h2>
      <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="opensource" :data="opensourceProjects" :progressive="true" />
    </div>

    <!-- Others (Loaded progressively) -->
    <div v-if="othersProjects.length > 0" class="mt-3 sm:mt-12">
      <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Others</h2>
      <MasonryList @onDetailClick="switchToDetail" @onReturnToList="returnToList" id="others" :data="othersProjects" :progressive="true" />
    </div>
  </div>
</template>
