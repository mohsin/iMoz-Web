<script setup lang="ts">
const route = useRoute()
const isEventsPage = computed(() => route.path.startsWith('/events'))

const bannerDismissed = ref(false)
onMounted(() => {
  bannerDismissed.value = localStorage.getItem('workshop-banner-dismissed') === 'true'
})
function dismissBanner() {
  bannerDismissed.value = true
  localStorage.setItem('workshop-banner-dismissed', 'true')
}
</script>

<template>
  <div class="flex flex-col min-h-screen w-full">
    <header>
        <PageNavbar />
    </header>
    <Transition
      enter-active-class="transition-all duration-300 ease-out overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-24 opacity-100"
      leave-active-class="transition-all duration-200 ease-in overflow-hidden"
      leave-from-class="max-h-24 opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="isEventsPage && !bannerDismissed" class="w-full bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-3 flex items-center justify-center relative">
        <p class="text-sm text-gray-600 dark:text-slate-300 text-center pr-8 sm:pr-0">
          Want to host a workshop or talk at your university, college, or workplace?
          <NuxtLink to="/contact" class="ml-1 font-semibold text-gray-900 dark:text-white underline underline-offset-2 hover:no-underline">Get in touch →</NuxtLink>
        </p>
        <button @click="dismissBanner" aria-label="Dismiss banner" class="absolute right-4 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white transition-colors text-lg leading-none">
          ✕
        </button>
      </div>
    </Transition>
    <div class="dark:text-white flex flex-col grow shrink-0 basis-auto items-center">
      <div class="w-full lg:w-2/3 p-3 lg:px-6">
        <slot />
      </div>
    </div>
    <PageFooter />
  </div>
</template>