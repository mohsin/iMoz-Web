<script setup lang="ts">
import { useWiki, type RevisionInfo } from '~/composables/useWiki'
import { titleToPath } from '~/utils/wiki/document'

const props = defineProps<{ title: string }>()
const { history } = useWiki()

const revisions = ref<RevisionInfo[]>([])
const loading = ref(true)
const error = ref('')
const oldSel = ref('')
const newSel = ref('')

onMounted(async () => {
  try {
    revisions.value = await history(props.title)
    newSel.value = revisions.value[0]?.sha ?? ''
    oldSel.value = revisions.value[1]?.sha ?? ''
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const path = computed(() => titleToPath(props.title))
const fmt = (d: string) => new Date(d).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <div>
    <p class="wp-sitesub">For any version listed below, click its date to view it. To compare two versions, pick them and choose Compare selected revisions.</p>
    <p v-if="loading">Loading history…</p>
    <div v-else-if="error" class="wp-notice error">History needs the wiki service and GitHub: {{ error }}</div>
    <template v-else>
      <NuxtLink v-if="revisions.length > 1" class="wp-button" :to="{ path, query: { diff: newSel, oldid: oldSel } }">Compare selected revisions</NuxtLink>
      <ul class="wp-history">
        <li v-for="(r, i) in revisions" :key="r.sha">
          <span>
            (<NuxtLink v-if="i > 0" :to="{ path, query: { diff: revisions[0].sha, oldid: r.sha } }">cur</NuxtLink><span v-else>cur</span>
            |
            <NuxtLink v-if="i < revisions.length - 1" :to="{ path, query: { diff: r.sha, oldid: revisions[i + 1].sha } }">prev</NuxtLink><span v-else>prev</span>)
          </span>
          <input v-model="oldSel" type="radio" name="oldid" :value="r.sha" :disabled="i === 0" :aria-label="`Compare from ${fmt(r.date)}`">
          <input v-model="newSel" type="radio" name="diff" :value="r.sha" :disabled="i === revisions.length - 1" :aria-label="`Compare to ${fmt(r.date)}`">
          <NuxtLink :to="{ path, query: { oldid: r.sha } }">{{ fmt(r.date) }}</NuxtLink>
          <span>Mohsin</span>
          <span class="summary">({{ r.summary }})</span>
        </li>
      </ul>
    </template>
  </div>
</template>
