<script setup lang="ts">
const projectListing = resolveComponent('PageProjects')
</script>

<template>
  <Head>
    <Title>iMoz - Projects</Title>
  </Head>
  <Masonry :listComponent="projectListing" />
</template>
