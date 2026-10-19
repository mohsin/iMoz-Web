<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
onMounted(() => navigateTo('/wiki/Main_Page', { replace: true }))
</script>

<template>
  <div />
</template>
