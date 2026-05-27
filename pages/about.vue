<script setup lang="ts">
var about = (await queryContent('/data/about').findOne())
</script>

<template>
    <Head>
      <Title>iMoz - About</Title>
    </Head>
    <section>
      <div class="mt-4 pt-0 sm:pt-4 text-justify text-lg text-black dark:text-whitesmoke">
        <div class="flex flex-col justify-center mx-3 sm:mx-0">

          <!-- Resume download -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-slate-600">
            <div>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ about.personal.firstname }} {{ about.personal.lastname }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{{ about.personal.designation }}</p>
            </div>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2.5 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-sm font-medium transition-colors duration-150 self-start sm:self-auto flex-shrink-0"
            >
              <Icon name="heroicons-outline:download" class="w-4 h-4" />
              Download Resume
            </a>
          </div>

          <h2 id="work" class="text-black dark:text-white text-3xl font-extrabold mt-6 w-full text-center sm:text-left">Work</h2>
          <Accordion :data="about.work" />
        </div>
      </div>
    </section>
    <section>
      <div class="mt-4 pt-0 sm:pt-4 text-justify text-lg text-black dark:text-whitesmoke">
        <div class="flex flex-col justify-center mx-3 sm:mx-0">
          <h2 id="work" class="text-black dark:text-white text-3xl font-extrabold mt-6 w-full text-center sm:text-left">Education</h2>
          <Accordion :data="about.education" />
        </div>
      </div>
    </section>
</template>

<script lang="ts">
export { } // Fix for Vetur check
</script>
