<script setup type="ts">
var pageCodeComponent = resolveComponent('PageCode')
</script>

<template>
  <Head>
    <Title>iMoz - Code</Title>
  </Head>
  <Masonry :data="[]" :list-component="pageCodeComponent" />
</template>
