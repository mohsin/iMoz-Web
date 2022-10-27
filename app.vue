<template>
  <Html :class="`${isDark ? 'dark' : ''}`">
    <Body class="bg-whitesmoke dark:bg-blacksmoke transition-bg ease-in-out duration-1000">
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