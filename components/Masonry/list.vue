<script setup lang="ts">
import { PropType, watch, nextTick, onUnmounted } from 'vue'
import type { MasonryItem } from './types'

const props = defineProps({
  id: {
    type: String
  },
  data: {
    type: Array as PropType<MasonryItem[]>
  },
  progressive: {
    type: Boolean,
    default: false
  }
})

const uniqId = 'masonry-' + props.id
const initialLoaded = ref(false);

// Add isProcessed to check if item has been resized.
// isVisible controls fade-in animation for progressive loading
const projects = props.data ? reactive(props.data.map((project: any, index: number) => ({
  ...project,
  isProcessed: false,
  isVisible: true, // Start with visible, we'll animate if progressive
  loadDelay: props.progressive ? index * 200 : 0 // Stagger animation by 200ms
}))) : []

function resizeGridItem(item: any) {
  return new Promise<void>((resolve, reject) => {
    var grid = document.getElementById(uniqId);
    if (!grid) {
      reject()
      return
    }
    const slug = item.id;

    var rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    if (!projects.find(item => item.slug == slug)?.isProcessed) {
      grid.style.gridAutoRows = '1px';
    }

    var rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    if (!item.querySelector('.content'))
      return;
    var rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height+rowGap)/(rowHeight+rowGap));
    const currentGridRowEndSpan = parseInt(window.getComputedStyle(item).gridRowEnd.replace('span ', ''))

    var raf = typeof window !== 'undefined' && 'requestAnimationFrame' in window ? window.requestAnimationFrame : function(func: Function) { setTimeout(func, 16) };
    const ease = (options: any) => { var startValue = 'startValue' in options ? options.startValue : 0; var endValue = 'endValue' in options ? options.endValue : 1; var durationMs = 'durationMs' in options ? options.durationMs : 200; var onComplete = options.onComplete || function() {}; var stepCount = durationMs / 16; var valueIncrement = (endValue - startValue) / stepCount; var sinValueIncrement = Math.PI / stepCount; var currentValue = startValue; var currentSinValue = 0; function step() { currentSinValue += sinValueIncrement; currentValue += valueIncrement * Math.pow(Math.sin(currentSinValue), 2) * 2; if (currentSinValue < Math.PI) { options.onStep(currentValue); raf(step); } else { options.onStep(endValue); onComplete(); } } raf(step); }

    if (currentGridRowEndSpan != rowSpan) {
      projects.find(item => item.slug == slug).isProcessed = true
      // Set the final size immediately without animation to prevent rearrangement
      item.style.gridRowEnd = 'span ' + rowSpan
    }
    resolve();
  })
}

async function resizeAllGridItems(): Promise<void> {
  var allItems = document.getElementById(uniqId)?.getElementsByClassName('item');
  if (allItems) {
    // Process items in order to prevent rearrangement
    for(var x=0; x < allItems.length; x++){
      await resizeGridItem(allItems[x]);
    }

    // Only run a second time if not yet loaded and items need adjustment
    if (!initialLoaded.value) {
      // Small delay to let DOM settle
      await new Promise(resolve => setTimeout(resolve, 50));
      return resizeAllGridItems();
    }
    initialLoaded.value = true;
  }
}


// Intersection Observer for lazy loading
const observer = ref<IntersectionObserver | null>(null)

// Progressive visibility animation
const showProjectsSequentially = async () => {
  if (!props.progressive) return

  // First make all invisible
  projects.forEach(project => {
    project.isVisible = false
  })

  // Then show them one by one with delay
  for (let i = 0; i < projects.length; i++) {
    setTimeout(() => {
      if (projects[i]) {
        projects[i].isVisible = true
      }
    }, i * 200)
  }
}

// Setup intersection observer for lazy loading images
const setupLazyLoading = () => {
  if (typeof window === 'undefined') return

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const projectSlug = img.closest('.item')?.id
          if (projectSlug) {
            const project = projects.find(p => p.slug === projectSlug)
            if (project && !project.isVisible && props.progressive) {
              project.isVisible = true
            }
          }
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1
    }
  )

  // Observe all project items
  nextTick(() => {
    const items = document.querySelectorAll(`#${uniqId} .item`)
    items.forEach(item => {
      if (observer.value) {
        observer.value.observe(item)
      }
    })
  })
}

// Resize all grid items. This calls itself and runs until all elements are properly sized.
onMounted(async () => {
  // Wait a frame to ensure DOM is fully rendered
  await nextTick()

  // Initialize grid sizing immediately
  await resizeAllGridItems()

  // Setup lazy loading if progressive is enabled
  if (props.progressive) {
    setupLazyLoading()
    // Delay the progressive animation to ensure grid is stable
    setTimeout(() => {
      showProjectsSequentially()
    }, 200)
  }
})

// Cleanup observer on unmount
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

// Watch for data changes and recreate the projects array
watch(() => props.data, (newData) => {
  if (newData) {
    // Recreate the entire projects array to avoid sync issues
    projects.length = 0
    projects.push(...newData.map((project: any, index: number) => ({
      ...project,
      isProcessed: false,
      isVisible: true,
      loadDelay: props.progressive ? index * 200 : 0
    })))

    nextTick(async () => {
      // Recalculate grid layout for all items
      await resizeAllGridItems()

      if (props.progressive) {
        // Restart progressive animation for new items only if needed
        showProjectsSequentially()
      }
    })
  }
}, { deep: true })

</script>

<template>
  <div :id="uniqId" class="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
    <div
      @click="$emit('onDetailClick', project)"
      :id="project.slug"
      v-for="project in projects"
      v-bind:key="project.slug"
      :class="[
        {'dark:border dark:border-white': project.isProcessed },
        project.type,
        'transition-all duration-500 ease-out',
        {
          'opacity-0 translate-y-4': !project.isVisible,
          'opacity-100 translate-y-0': project.isVisible
        }
      ]"
      class="item bg-white dark:bg-slate-700"
    >
      <div class="content flow-root">
        <div class="p-5 bg-slate-700 dark:bg-white">
          <h3 class="text-lg text-white dark:text-slate-700 uppercase">{{ project.title }}</h3>
          <span class="text-slate-100 dark:text-slate-900 opacity-70 text-xs">{{ project.duration }}</span>
        </div>
        <nuxt-img
          format="webp"
          v-if="project.isThumb"
          loading="lazy"
          sizes="xs:512 sm:100"
          width="512"
          height="512"
          class="w-full"
          :src="project.src"
        />
        <div class="p-2.5 pb-1">
          <nuxt-img
            format="webp"
            class="w-full sm:w-[100px] py-1 px-8 sm:p-0 mt-2 mr-2.5 ml-0 float-none sm:float-left"
            width="512"
            height="512"
            v-if="project.src && !project.isThumb"
            sizes="xs:512 sm:100"
            :src="project.src"
          />
          <p class="pb-2.5">{{ project.summary || project.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
