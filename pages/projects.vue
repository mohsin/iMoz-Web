<script setup lang="ts">
const projectListing = resolveComponent('PageProjects')
</script>

<template>
  <Head>
    <Title>iMoz - Projects</Title>
  </Head>
  <div class="mt-4 pt-0 sm:pt-4">
    <Masonry :listComponent="projectListing" />
  </div>
</template>
