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
