<template>
  <Html :class="`${isDark ? 'dark' : ''}`">
    <Body>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<script lang="ts" setup>
import { usePersistedState } from './utils/app';

const isDark = usePersistedState('is-dark', false);
</script>