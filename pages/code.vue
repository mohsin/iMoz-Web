<script setup lang="ts">
var projects = (await queryContent('/data/projects').findOne())
</script>

<template>
  <Head>
    <Title>iMoz - Code</Title>
  </Head>
  <div class="mt-3 sm:mt-12">
    <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Client Projects</h2>
      <Masonry id="client" :data="projects.client" />
  </div>
  <div class="mt-3 sm:mt-12">
    <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Open Source Projects</h2>
      <Masonry id="opensource" :data="projects.opensource" />
  </div>
</template>
