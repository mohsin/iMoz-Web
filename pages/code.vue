<script setup lang="ts">
const projectListing = resolveComponent('PageCode')
</script>

<template>
  <Head>
    <Title>iMoz - Code</Title>
  </Head>
  <Masonry :listComponent="projectListing" />
</template>
