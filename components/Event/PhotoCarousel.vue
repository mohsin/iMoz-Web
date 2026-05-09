<script setup lang="ts">
const props = defineProps<{
  photos: string[]
  title: string
}>()

const VISIBLE = 4

const offset = ref(0)
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const slideshowActive = ref(false)
let slideshowTimer: ReturnType<typeof setInterval> | null = null

const canPrev = computed(() => offset.value > 0)
const canNext = computed(() => offset.value + VISIBLE < props.photos.length)
const visiblePhotos = computed(() => props.photos.slice(offset.value, offset.value + VISIBLE))

const prevThumb = () => { if (canPrev.value) offset.value-- }
const nextThumb = () => { if (canNext.value) offset.value++ }

const openLightbox = (visibleIdx: number) => {
  lightboxIndex.value = offset.value + visibleIdx
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
  stopSlideshow()
}

const prevPhoto = () => {
  lightboxIndex.value = (lightboxIndex.value - 1 + props.photos.length) % props.photos.length
}

const nextPhoto = () => {
  lightboxIndex.value = (lightboxIndex.value + 1) % props.photos.length
}

const stopSlideshow = () => {
  slideshowActive.value = false
  if (slideshowTimer) { clearInterval(slideshowTimer); slideshowTimer = null }
}

const startSlideshow = () => {
  slideshowActive.value = true
  slideshowTimer = setInterval(nextPhoto, 3000)
}

const toggleSlideshow = () => slideshowActive.value ? stopSlideshow() : startSlideshow()

const onKey = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (e.key === 'ArrowLeft') prevPhoto()
  else if (e.key === 'ArrowRight') nextPhoto()
  else if (e.key === 'Escape') closeLightbox()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => { window.removeEventListener('keydown', onKey); stopSlideshow() })
</script>

<template>
  <div>
    <!-- Thumbnail strip -->
    <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
      <button
        @click="prevThumb"
        :disabled="!canPrev"
        class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm text-gray-600 dark:text-slate-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
        aria-label="Previous photos"
      >
        <Icon name="heroicons-outline:chevron-left" class="w-4 h-4" />
      </button>

      <div class="flex gap-1.5 flex-1">
        <button
          v-for="(photo, i) in visiblePhotos"
          :key="offset + i"
          class="flex-1 aspect-square rounded overflow-hidden group"
          :aria-label="`View photo ${offset + i + 1}`"
          @click="openLightbox(i)"
        >
          <img
            :src="photo"
            :alt="`${title} — photo ${offset + i + 1}`"
            class="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
          />
        </button>
      </div>

      <button
        @click="nextThumb"
        :disabled="!canNext"
        class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm text-gray-600 dark:text-slate-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
        aria-label="Next photos"
      >
        <Icon name="heroicons-outline:chevron-right" class="w-4 h-4" />
      </button>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lb-fade">
        <div
          v-if="lightboxOpen"
          class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          @click.self="closeLightbox"
        >
          <!-- Top bar -->
          <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
            <button
              @click="toggleSlideshow"
              class="text-white/80 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
              :aria-label="slideshowActive ? 'Pause slideshow' : 'Start slideshow'"
            >
              <Icon :name="slideshowActive ? 'heroicons-outline:pause' : 'heroicons-outline:play'" class="w-5 h-5" />
              <span>{{ slideshowActive ? 'Pause' : 'Slideshow' }}</span>
            </button>
            <span class="text-white/70 text-sm tabular-nums">{{ lightboxIndex + 1 }} / {{ photos.length }}</span>
            <button
              @click="closeLightbox"
              class="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <Icon name="heroicons-outline:x-mark" class="w-6 h-6" />
            </button>
          </div>

          <!-- Prev -->
          <button
            @click="prevPhoto"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/60 rounded-full p-2 transition-colors"
            aria-label="Previous photo"
          >
            <Icon name="heroicons-outline:chevron-left" class="w-7 h-7" />
          </button>

          <!-- Image -->
          <img
            :src="photos[lightboxIndex]"
            :alt="`${title} — photo ${lightboxIndex + 1}`"
            class="max-w-[calc(100%-6rem)] max-h-[calc(100vh-5rem)] object-contain"
          />

          <!-- Next -->
          <button
            @click="nextPhoto"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/60 rounded-full p-2 transition-colors"
            aria-label="Next photo"
          >
            <Icon name="heroicons-outline:chevron-right" class="w-7 h-7" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.lb-fade-enter-active,
.lb-fade-leave-active {
  transition: opacity 0.2s ease;
}
.lb-fade-enter-from,
.lb-fade-leave-to {
  opacity: 0;
}
</style>
