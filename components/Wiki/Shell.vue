<script setup lang="ts">
import { useWiki } from '~/composables/useWiki'
import { titleToPath } from '~/utils/wiki/document'

export interface TocItem { id: string, text: string, level: number }

const props = defineProps<{ toc?: TocItem[], unlocked: boolean }>()

const router = useRouter()
const { state, lock, search, flushOutbox, brand, mediaUrl } = useWiki()
const logoUrl = ref<string | null>(null)
watch(() => brand.value.logoMediaId, async id => { logoUrl.value = id ? await mediaUrl(id).catch(() => null) : null }, { immediate: true })
const { isDark, setDarkMode } = useMode()
const toggleMode = () => setDarkMode(!isDark.value)

const menuOpen = ref(false)
const tocHidden = ref(false)
const query = ref('')
const suggestions = ref<{ title: string, snippet: string }[]>([])
const activeId = ref('')
const flushing = ref(false)
const flushError = ref('')

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(query, q => {
  clearTimeout(searchTimer)
  if (!q.trim() || !props.unlocked) { suggestions.value = []; return }
  searchTimer = setTimeout(async () => {
    const results = await search(q)
    suggestions.value = results.slice(0, 6).map(r => ({ title: r.entry.title, snippet: r.snippet }))
  }, 150)
})

function submitSearch() {
  const q = query.value.trim()
  if (!q) return
  suggestions.value = []
  router.push({ path: '/wiki/Special:Search', query: { search: q } })
}

function go(title: string) {
  query.value = ''
  suggestions.value = []
  router.push(titleToPath(title))
}

async function retryPending() {
  flushing.value = true
  flushError.value = ''
  try { await flushOutbox() } catch (e: any) { flushError.value = e.message } finally { flushing.value = false }
}

async function doLock() {
  menuOpen.value = false
  await lock()
}

// Highlight the section currently in view, like Vector's sticky contents.
let observer: IntersectionObserver | undefined
watch(() => props.toc, (items) => {
  observer?.disconnect()
  if (!items?.length || typeof IntersectionObserver === 'undefined') return
  nextTick(() => {
    observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) activeId.value = visible[0].target.id
    }, { rootMargin: '0px 0px -70% 0px' })
    items.forEach(i => { const el = document.getElementById(i.id); if (el) observer!.observe(el) })
  })
}, { immediate: true })
onBeforeUnmount(() => observer?.disconnect())

const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <div class="mozpedia">
    <header class="wp-header">
      <div class="wp-header-start">
        <div style="position: relative">
          <button class="wp-icon-button" type="button" aria-label="Main menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
            <svg viewBox="0 0 20 20"><path d="M1 3h18v2H1zm0 6h18v2H1zm0 6h18v2H1z" /></svg>
          </button>
          <nav v-if="menuOpen && unlocked" class="wp-dropdown" style="top: 2.4rem; left: 0">
            <h3>Main menu</h3>
            <ul>
              <li><NuxtLink to="/wiki/Main_Page">Main page</NuxtLink></li>
              <li><NuxtLink to="/wiki/Special:AllPages">All pages</NuxtLink></li>
              <li><NuxtLink to="/wiki/Special:Categories">Categories</NuxtLink></li>
              <li><NuxtLink to="/wiki/Special:Random">Random page</NuxtLink></li>
            </ul>
            <h3>Contribute</h3>
            <ul>
              <li><NuxtLink to="/wiki/Special:CreatePage">Create a page</NuxtLink></li>
              <li><NuxtLink to="/wiki/Special:Export">Export to MediaWiki</NuxtLink></li>
              <li><NuxtLink to="/wiki/Special:Preferences">Preferences</NuxtLink></li>
            </ul>
          </nav>
        </div>
        <NuxtLink class="wp-logo" to="/wiki/Main_Page">
          <img v-if="logoUrl" :src="logoUrl" alt="" class="wp-logo-image">
          <svg v-else viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="1.5" />
            <ellipse cx="20" cy="20" rx="8" ry="18" fill="none" stroke="currentColor" stroke-width="1" />
            <path d="M3 14h34M2 20h36M3 26h34" fill="none" stroke="currentColor" stroke-width="0.8" />
            <text x="20" y="25.5" text-anchor="middle" font-family="Georgia, serif" font-size="15" fill="currentColor">M</text>
          </svg>
          <span class="wp-wordmark">
            <span class="wp-wordmark-name">{{ brand.siteName }}</span>
            <span class="wp-wordmark-tag">{{ brand.tagline }}</span>
          </span>
        </NuxtLink>
      </div>

      <form v-if="unlocked" class="wp-search" role="search" @submit.prevent="submitSearch">
        <svg class="wp-search-icon" viewBox="0 0 20 20"><path d="M12.2 13.6a7 7 0 1 1 1.4-1.4l5.4 5.4-1.4 1.4zM3 8a5 5 0 1 0 10 0A5 5 0 0 0 3 8" /></svg>
        <input v-model="query" type="search" :placeholder="`Search ${brand.siteName}`" :aria-label="`Search ${brand.siteName}`" autocomplete="off" @keydown.esc="suggestions = []">
        <button type="submit">Search</button>
        <div v-if="suggestions.length" class="wp-suggestions">
          <a v-for="s in suggestions" :key="s.title" href="#" @click.prevent="go(s.title)">
            {{ s.title }}<small>{{ s.snippet }}</small>
          </a>
          <a href="#" @click.prevent="submitSearch">Search for pages containing <strong>{{ query }}</strong></a>
        </div>
      </form>

      <div class="wp-header-end">
        <button type="button" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleMode">{{ isDark ? 'Light' : 'Dark' }}</button>
        <button v-if="unlocked" type="button" @click="doLock">Lock</button>
        <NuxtLink to="/">imoz.in</NuxtLink>
      </div>
    </header>

    <div :class="['wp-page', { 'no-toc': !toc?.length || tocHidden }]">
      <nav v-if="toc?.length && !tocHidden" class="wp-toc" aria-label="Contents">
        <div class="wp-toc-head">
          <strong>Contents</strong>
          <button type="button" @click="tocHidden = true">hide</button>
        </div>
        <ul>
          <li><a href="#top" :class="{ active: !activeId }">(Top)</a></li>
          <li v-for="item in toc" :key="item.id" :class="`level-${item.level}`">
            <a :href="`#${item.id}`" :class="{ active: activeId === item.id }">{{ item.text }}</a>
          </li>
        </ul>
      </nav>

      <main id="top" class="wp-main">
        <div v-if="state.offline" class="wp-notice warning">
          Showing the copy saved on this device: the wiki service or GitHub can't be reached right now. Reading works; new edits will wait on this device until it's back.
        </div>
        <div v-if="state.pending.length" class="wp-notice error">
          {{ state.pending.length }} edit{{ state.pending.length > 1 ? 's' : '' }} not saved to GitHub yet
          ({{ state.pending.map(p => p.title).join(', ') }}). They are kept on this device.
          <button class="wp-button" type="button" :disabled="flushing" @click="retryPending">{{ flushing ? 'Retrying…' : 'Retry now' }}</button>
          <div v-if="flushError" style="margin-top: 0.4rem">{{ flushError }}</div>
        </div>
        <button v-if="toc?.length && tocHidden" class="wp-button quiet" type="button" style="margin-top: 0.5rem" @click="tocHidden = false">Show contents</button>
        <slot />
        <footer class="wp-footer">
          <slot name="footer" />
          <ul>
            <li>{{ brand.siteName }} is private: pages are encrypted in your browser before they are stored.</li>
            <li><NuxtLink to="/">Back to imoz.in</NuxtLink></li>
          </ul>
        </footer>
      </main>
    </div>
  </div>
</template>
