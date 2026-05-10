<script setup lang="ts">
const { isDark } = useMode()

const props = defineProps({
  error: Object
})

const is404 = computed(() => props.error?.statusCode === 404)

function handleGoHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <Html :class="`${isDark ? 'dark' : ''}`">
    <Body class="bg-whitesmoke dark:bg-blacksmoke transition-bg ease-in-out duration-1000">
      <div class="flex flex-col min-h-screen w-full">
        <header>
          <PageNavbar />
        </header>
        <div class="dark:text-white flex flex-col grow shrink-0 basis-auto items-center justify-center">
          <div class="w-full lg:w-2/3 p-3 lg:px-6 flex flex-col items-center justify-center text-center py-24">
            <p class="text-[9rem] font-black leading-none text-gray-100 dark:text-slate-800 select-none tabular-nums">
              {{ error?.statusCode ?? 404 }}
            </p>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {{ is404 ? 'Page not found' : 'Something went wrong' }}
            </h1>
            <p class="mt-3 text-sm text-gray-500 dark:text-slate-400 max-w-xs leading-relaxed">
              {{ is404
                ? "The page you're looking for doesn't exist or may have been moved."
                : "An unexpected error occurred. Please try again later." }}
            </p>
            <button
              @click="handleGoHome"
              class="mt-8 bg-gray-700 dark:bg-slate-300 text-white dark:text-gray-700 text-sm py-2 px-6 hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors duration-200"
            >
              Go home
            </button>
          </div>
        </div>
        <PageFooter />
      </div>
    </Body>
  </Html>
</template>
