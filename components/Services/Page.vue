<script setup lang="ts">
defineProps<{ data: any }>()
defineEmits<{
  'show-offering': [offering: any]
  'show-workshop': [workshop: any]
}>()
</script>

<template>
  <div class="mt-4 pt-0 sm:pt-4">
    <!-- What I Build -->
    <section class="mb-10">
      <h2 class="text-black dark:text-white text-2xl font-bold mb-1">What I Build</h2>
      <p class="text-gray-500 dark:text-slate-400 text-sm mb-5">From web and mobile to AI-powered experiences — end-to-end delivery across every platform.</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="area in data.build_areas"
          :key="area.title"
          class="p-4 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 flex flex-col gap-2 shadow-sm"
        >
          <Icon :name="area.icon" class="w-6 h-6 text-slate-500 dark:text-slate-400" />
          <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{{ area.title }}</h3>
          <p class="text-gray-400 dark:text-slate-500 text-xs leading-relaxed">{{ area.description }}</p>
        </div>
      </div>
    </section>

    <!-- Professional Services -->
    <section class="mb-10">
      <h2 class="text-black dark:text-white text-2xl font-bold mb-1">Professional Services</h2>
      <p class="text-gray-500 dark:text-slate-400 text-sm mb-5">Specialist capabilities across web, SEO, accessibility, email, and content — taken individually or as a full engagement.</p>
      <div class="flex flex-col gap-2">
        <button
          v-for="offering in data.offerings"
          :key="offering.slug"
          class="w-full text-left p-4 bg-white dark:bg-slate-700 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-600 hover:border-gray-200 dark:hover:border-slate-500 transition-all duration-200 flex items-center gap-4 group"
          @click="$emit('show-offering', offering)"
        >
          <div class="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-600 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-500 transition-colors">
            <Icon :name="offering.icon" class="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 dark:text-white text-base">{{ offering.title }}</h3>
            <p class="text-gray-400 dark:text-slate-500 text-sm mt-0.5 truncate">{{ offering.tagline }}</p>
          </div>
          <Icon name="heroicons-outline:chevron-right" class="flex-shrink-0 w-5 h-5 text-gray-300 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 transition-colors" />
        </button>
      </div>
    </section>

    <!-- Workshops -->
    <section>
      <h2 class="text-black dark:text-white text-2xl font-bold mb-1">Workshops & Training</h2>
      <p class="text-gray-500 dark:text-slate-400 text-sm mb-5">Hands-on full-day sessions for universities, colleges, and corporate teams — live demos throughout, competitive hackathon at the finish.</p>
      <div class="flex flex-col gap-2">
        <button
          v-for="workshop in data.workshops"
          :key="workshop.slug"
          class="w-full text-left p-4 bg-white dark:bg-slate-700 shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-600 hover:border-gray-200 dark:hover:border-slate-500 transition-all duration-200 flex items-center gap-4 group"
          @click="$emit('show-workshop', workshop)"
        >
          <div class="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-600 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-500 transition-colors">
            <Icon :name="workshop.icon" class="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-gray-900 dark:text-white text-base">{{ workshop.title }}</h3>
              <span class="text-xs bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-2 py-0.5 flex-shrink-0">{{ workshop.duration }}</span>
            </div>
            <p class="text-gray-400 dark:text-slate-500 text-sm mt-0.5 line-clamp-1">{{ workshop.description }}</p>
          </div>
          <Icon name="heroicons-outline:chevron-right" class="flex-shrink-0 w-5 h-5 text-gray-300 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 transition-colors" />
        </button>
      </div>
    </section>
  </div>
</template>
