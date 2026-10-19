<script setup lang="ts">
const data = await queryContent('/data/resources').findOne().catch(() => null)
const prd = data?.prd_samples ?? null
</script>

<template>
  <Head>
    <Title>iMoz - Resources</Title>
    <Meta name="description" content="PRD sample documents to help you prepare a Product Requirement Document before starting a development project with Saifur Rahman Mohsin." />
  </Head>

  <div v-if="!prd" class="mt-4 text-gray-500 dark:text-slate-400 text-sm">Loading resources…</div>

  <div v-else class="mt-4 pt-0 sm:pt-4">

    <!-- Page header -->
    <div class="mb-10">
      <h1 class="text-black dark:text-white text-3xl font-extrabold mb-3">PRD Samples</h1>
      <p class="text-gray-600 dark:text-slate-300 text-base leading-relaxed max-w-2xl">{{ prd.intro }}</p>
    </div>

    <!-- What to include -->
    <section class="mb-12 p-6 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 shadow-sm">
      <h2 class="text-black dark:text-white text-xl font-bold mb-5">What a good PRD includes</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="item in prd.what_to_include"
          :key="item.label"
          class="flex gap-3"
        >
          <div class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
            <Icon name="heroicons-outline:check" class="w-3 h-3 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ item.label }}</p>
            <p class="text-gray-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sample sections -->
    <section
      v-for="section in prd.sections"
      :key="section.title"
      class="mb-12"
    >
      <div class="flex items-center gap-2 mb-2">
        <Icon :name="section.icon" class="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
        <h2 class="text-black dark:text-white text-2xl font-bold">{{ section.title }}</h2>
      </div>
      <p class="text-gray-500 dark:text-slate-400 text-sm mb-6">{{ section.description }}</p>

      <div class="flex flex-col gap-4">
        <div
          v-for="sample in section.samples"
          :key="sample.file"
          class="p-5 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 shadow-sm flex flex-col sm:flex-row sm:items-start gap-5"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
            <Icon name="heroicons-outline:document-text" class="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-baseline gap-2 mb-0.5">
              <h3 class="font-bold text-gray-900 dark:text-white text-base">{{ sample.title }}</h3>
              <span class="text-xs text-gray-400 dark:text-slate-500">{{ sample.subtitle }}</span>
            </div>
            <p class="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-3">{{ sample.description }}</p>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-slate-500 mb-3">
              <span class="flex items-center gap-1">
                <Icon name="heroicons-outline:document" class="w-3.5 h-3.5" />
                {{ sample.pages }} pages
              </span>
              <span class="flex items-center gap-1">
                <Icon name="heroicons-outline:tag" class="w-3.5 h-3.5" />
                {{ sample.format }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in sample.tags"
                :key="tag"
                class="text-xs bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-2 py-0.5"
              >{{ tag }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex-shrink-0 self-start sm:self-center flex flex-col gap-2">
            <a
              :href="sample.file"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-sm font-medium transition-colors duration-150 whitespace-nowrap"
            >
              <Icon name="heroicons-outline:eye" class="w-4 h-4" />
              Preview
            </a>
            <a
              :href="sample.file"
              download
              class="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
            >
              <Icon name="heroicons-outline:download" class="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mb-10 p-6 bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
      <h2 class="text-black dark:text-white text-lg font-bold mb-2">Ready to start?</h2>
      <p class="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
        Use one of these samples as a starting point, fill it in for your product, and send it over.
        The more detail you provide, the more accurate the estimate and the smoother the project.
      </p>
      <NuxtLink
        to="/contact"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-sm font-medium transition-colors duration-150"
      >
        Get in touch
        <Icon name="heroicons-outline:arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </section>

  </div>
</template>

<script lang="ts">
export {}
</script>
