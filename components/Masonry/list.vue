<script setup lang="ts">
import { PropType } from 'vue'
import type { MasonryItem } from './types'

const props = defineProps({
  id: {
    type: String
  },
  data: {
    type: Array as PropType<MasonryItem[]>,
    required: true
  },
  method: {
    type: Function,
    required: true
  },
})

const uniqId = 'masonry-' + props.id
const openDetailPage = props.method

// Add isLoaded so we can run resize on all the image elements.
// isProcessed is used to check if item has been resized.
const projects = reactive(props.data.map((project: any) => (
  (project.src) ? { ...project, isLoaded: false, isProcessed: false } : { ...project, isLoaded: true, isProcessed: false }
)))

function resizeGridItem(item: any) {
  var grid = document.getElementById(uniqId);
  const slug = item.id;

  var rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  if (!projects.find(item => item.slug == slug)?.isProcessed) {
    grid.style.gridAutoRows = '1px';
    item.style.gridRowEnd = 'span ' + rowHeight;
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
    ease({
      startValue: currentGridRowEndSpan,
      endValue: rowSpan,
      durationMs: 1000,
      onStep: (value: number) => {
        item.style.gridRowEnd = 'span ' + Math.round(value)
      },
      onComplete: () => {
        item.style.gridRowEnd = 'span ' + rowSpan
      },
    });
  }
}

function resizeAllGridItems() {
  if (!projects.every(project => project.isProcessed)) {
    window.setTimeout(resizeAllGridItems, 2000)
  }
  var allItems = document.getElementById(uniqId)?.getElementsByClassName('item');
  for(var x=0; x < allItems.length; x++){
      resizeGridItem(allItems[x]);
  }
}

function load(event: Event) {
  const parent = event?.currentTarget?.parentNode?.parentNode
  if (process.client) {
    resizeGridItem(parent)
  }
}

// Run once on window load, and once again after 1,3,7,10 seconds as fallback to ensure it loaded.
if (process.client) {
  resizeAllGridItems()
}
</script>

<template>
  <div :id="uniqId" @load="resizeAllGridItems" class="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] auto-rows-[58px]">
    <div @click="openDetailPage(project)" :id="project.slug" v-for="project in projects" v-bind:key="project.slug" :class="[{'dark:border dark:border-white': project.isProcessed }, project.type]" class="item bg-white dark:bg-slate-700">
      <div class="content">
        <div class="p-5 bg-slate-700 dark:bg-white">
          <h3 class="text-lg text-white dark:text-slate-700 uppercase">{{ project.title }}</h3>
        </div>
        <img @load="load" v-if="project.isThumb" loading="lazy" class="w-full" :src="project.src" />
        <div class="p-2.5 pb-1">
          <img class="w-1/2 mt-0 mr-2.5 mb-2.5 ml-0 float-left" @load="load" v-if="project.src && !project.isThumb" :src="project.src">
          <p class="pb-2.5">{{ project.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
