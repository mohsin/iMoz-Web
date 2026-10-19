<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProjectDecrypt, decryptJSONBlock } from '~/composables/useProjectDecrypt'
import type { DecryptedMarkdown } from '~/composables/useProjectDecrypt'

// Marker written by scripts/encrypt-md.js in place of a `::private` block.
// Renders nothing until the slug's key is unlocked, then renders the
// pre-parsed MDC tree with the same components as the public content.
const props = defineProps<{
  slug: string
  salt: string
  iv: string
  data: string
}>()

const { keys, getKey } = useProjectDecrypt()
const content = ref<{ body: { type: 'root'; children: unknown[] } } | null>(null)

async function attempt() {
  const pw = getKey(props.slug)
  if (!pw) { content.value = null; return }
  const decrypted = await decryptJSONBlock<DecryptedMarkdown>(props, pw)
  content.value = decrypted ? { body: { type: 'root', children: decrypted.body } } : null
}

onMounted(attempt)
watch(() => keys.value[props.slug], attempt)
</script>

<template>
  <Private v-if="content">
    <Suspense>
      <ContentRendererMarkdown :value="content" />
    </Suspense>
  </Private>
</template>
