<script setup lang="ts">
import '~/assets/css/wiki.css'
import { useWiki } from '~/composables/useWiki'
import { MAIN_PAGE, normalizeTitle, titleToPath, toWikitext, type PageRecord } from '~/utils/wiki/document'
import type { TocItem } from '~/components/Wiki/Shell.vue'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const wiki = useWiki()
const { state } = wiki

const title = computed(() => {
  const slug = route.params.slug
  const raw = Array.isArray(slug) ? slug.join('/') : String(slug ?? '')
  return raw ? normalizeTitle(raw) : MAIN_PAGE
})
const special = computed(() => (title.value.startsWith('Special:') ? title.value.slice(8) : null))
const category = computed(() => (title.value.startsWith('Category:') ? normalizeTitle(title.value.slice(9)) : null))
const action = computed(() => String(route.query.action ?? 'view'))
const oldid = computed(() => (route.query.oldid ? String(route.query.oldid) : null))
const diffId = computed(() => (route.query.diff ? String(route.query.diff) : null))
const isMain = computed(() => title.value === MAIN_PAGE)

useHead({
  title: computed(() => `${title.value} - ${wiki.brand.value.siteName}`),
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const page = ref<PageRecord | null>(null)
const older = ref<PageRecord | null>(null)
const shown = ref<PageRecord | null>(null)
const loading = ref(false)
const error = ref('')
const notice = ref('')
const toc = ref<TocItem[]>([])
const toolsOpen = ref(false)
const confirmDelete = ref(false)

async function load() {
  toc.value = []
  error.value = ''
  page.value = older.value = shown.value = null
  if (state.status !== 'ready' || special.value || category.value) return
  loading.value = true
  try {
    page.value = await wiki.getPage(title.value)
    if (diffId.value && oldid.value) {
      ;[shown.value, older.value] = await Promise.all([wiki.revision(title.value, diffId.value), wiki.revision(title.value, oldid.value)])
    } else if (oldid.value) {
      shown.value = await wiki.revision(title.value, oldid.value)
    } else {
      shown.value = page.value
    }
  } catch (e: any) {
    error.value = e.message || 'This page could not be loaded.'
  } finally {
    loading.value = false
  }
}

onMounted(() => wiki.init())
watch(() => [route.fullPath, state.status], load, { immediate: true })

function onSaved(saved: string, queued: boolean) {
  notice.value = queued
    ? 'Saved on this device only: GitHub could not be reached. It will be published when you retry from the banner above.'
    : 'Your edit was published.'
  setTimeout(() => (notice.value = ''), 6000)
  router.push(titleToPath(saved))
}

async function restore() {
  if (!shown.value) return
  const when = new Date(shown.value.updated).toLocaleString('en-GB')
  await wiki.savePage({ id: page.value?.id, title: title.value, doc: shown.value.doc, categories: shown.value.categories, summary: `Restored the revision of ${when}`, media: [] })
  router.push(titleToPath(title.value))
}

async function remove() {
  confirmDelete.value = false
  await wiki.deletePage(title.value)
  router.push('/wiki/Main_Page')
}

function exportPage() {
  toolsOpen.value = false
  if (!page.value) return
  const blob = new Blob([toWikitext(page.value, state.index.media)], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${title.value.replace(/[^\w-]+/g, '_')}.wiki`
  a.click()
}

const backlinks = computed(() => (state.status === 'ready' ? wiki.backlinks(title.value) : []))
const showBacklinks = ref(false)
const lastEdited = computed(() => {
  if (!page.value) return ''
  const d = new Date(page.value.updated)
  return `This page was last edited on ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, at ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`
})
const articleCount = computed(() => Object.keys(state.index.pages).length)
</script>

<template>
  <ClientOnly>
    <WikiShell :toc="action === 'view' && !oldid && !diffId ? toc : []" :unlocked="state.status === 'ready'">
      <WikiUnlock v-if="state.status !== 'ready'" />

      <WikiSpecial v-else-if="special" :name="special" />
      <WikiSpecial v-else-if="category" name="Category" :category="category" />

      <template v-else>
        <div v-if="isMain && action === 'view' && !oldid" class="mp-welcome" style="margin-top: 1rem; padding: 0.6rem 1rem; border: 1px solid var(--wp-border-subtle); background: var(--wp-bg-subtle); text-align: center">
          <div style="font-family: var(--wp-serif); font-size: 1.6rem">Welcome to {{ wiki.brand.value.siteName }},</div>
          <div style="font-size: 0.9rem">{{ wiki.brand.value.tagline.toLowerCase() }}. {{ articleCount.toLocaleString('en-GB') }} {{ articleCount === 1 ? 'article' : 'articles' }} so far.</div>
        </div>
        <div v-else class="wp-title-bar">
          <h1 class="wp-title">{{ action === 'edit' ? (page ? `Editing ${title}` : `Creating ${title}`) : action === 'history' ? `${title}: Revision history` : title }}</h1>
        </div>

        <div class="wp-toolbar">
          <nav class="wp-tabs" aria-label="Namespaces">
            <NuxtLink :to="titleToPath(title)" :class="{ selected: true, new: !page }">{{ isMain ? 'Main Page' : 'Article' }}</NuxtLink>
          </nav>
          <nav class="wp-tabs" aria-label="Views">
            <NuxtLink :to="titleToPath(title)" :class="{ selected: action === 'view' && !oldid && !diffId }">Read</NuxtLink>
            <NuxtLink :to="{ path: titleToPath(title), query: { action: 'edit' } }" :class="{ selected: action === 'edit' }">{{ page ? 'Edit' : 'Create' }}</NuxtLink>
            <NuxtLink v-if="page" :to="{ path: titleToPath(title), query: { action: 'history' } }" :class="{ selected: action === 'history' || !!diffId || !!oldid }">View history</NuxtLink>
            <div v-if="page" class="wp-tools">
              <button type="button" :aria-expanded="toolsOpen" @click="toolsOpen = !toolsOpen">Tools ▾</button>
              <div v-if="toolsOpen" class="wp-dropdown">
                <h3>Actions</h3>
                <ul>
                  <li><button type="button" @click="toolsOpen = false; showBacklinks = !showBacklinks">What links here</button></li>
                  <li><button type="button" @click="exportPage">Export as wikitext</button></li>
                  <li v-if="!isMain"><button type="button" class="destructive" @click="toolsOpen = false; confirmDelete = true">Delete page</button></li>
                </ul>
              </div>
            </div>
          </nav>
        </div>

        <div v-if="notice" class="wp-notice info">{{ notice }}</div>
        <div v-if="error" class="wp-notice error">{{ error }}</div>
        <div v-if="confirmDelete" class="wp-notice warning">
          Delete "{{ title }}"? Its history stays in the data repository, so it can be restored later.
          <button class="wp-button destructive" type="button" @click="remove">Delete</button>
          <button class="wp-button" type="button" @click="confirmDelete = false">Cancel</button>
        </div>
        <div v-if="showBacklinks" class="wp-notice info">
          <strong>Pages that link to "{{ title }}":</strong>
          <span v-if="!backlinks.length"> none yet.</span>
          <ul v-else><li v-for="b in backlinks" :key="b.title"><NuxtLink :to="titleToPath(b.title)">{{ b.title }}</NuxtLink></li></ul>
        </div>

        <p v-if="loading">Loading…</p>

        <WikiEditor v-else-if="action === 'edit'" :key="title" :page="page" :title="title" @saved="onSaved" @cancel="router.push(titleToPath(title))" />

        <WikiHistory v-else-if="action === 'history'" :key="title" :title="title" />

        <template v-else-if="diffId && oldid && shown && older">
          <WikiDiff :older="older" :newer="shown" />
          <WikiArticle :doc="shown.doc" :categories="shown.categories" />
        </template>

        <template v-else-if="shown">
          <div v-if="oldid" class="wp-notice warning">
            This is an old revision of this page, as edited at {{ new Date(shown.updated).toLocaleString('en-GB') }}. It may differ significantly from the
            <NuxtLink :to="titleToPath(title)">current revision</NuxtLink>.
            <button class="wp-button" type="button" @click="restore">Restore this version</button>
          </div>
          <p v-if="!isMain" class="wp-sitesub">From {{ wiki.brand.value.siteName }}, {{ wiki.brand.value.tagline.toLowerCase() }}</p>
          <WikiArticle :doc="shown.doc" :categories="shown.categories" @toc="toc = $event" />
        </template>

        <div v-else-if="!error" class="wp-content">
          <p><strong>{{ wiki.brand.value.siteName }} does not have an article with this exact name.</strong></p>
          <ul>
            <li><NuxtLink :to="{ path: titleToPath(title), query: { action: 'edit' } }">Start the {{ title }} article</NuxtLink>.</li>
            <li><NuxtLink :to="{ path: '/wiki/Special:Search', query: { search: title, fulltext: '1' } }">Search for "{{ title }}"</NuxtLink> in existing articles.</li>
          </ul>
        </div>
      </template>

      <template #footer>
        <p v-if="page && action === 'view' && !oldid">{{ lastEdited }}</p>
      </template>
    </WikiShell>
  </ClientOnly>
</template>
