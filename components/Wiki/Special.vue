<script setup lang="ts">
import { useWiki } from '~/composables/useWiki'
import { titleToPath, toMediaWikiXml, toWikitext, type IndexEntry } from '~/utils/wiki/document'

const props = defineProps<{ name: string, category?: string }>()
const route = useRoute()
const router = useRouter()
const { state, allPages, categories, search, randomTitle, allPageRecords, getPage, brand, saveSettings, prepareImage } = useWiki()

// Preferences: site name, tagline and logo live in the encrypted index.
const prefName = ref(state.index.settings?.siteName ?? '')
const prefTagline = ref(state.index.settings?.tagline ?? '')
const prefLogo = ref<Awaited<ReturnType<typeof prepareImage>> | null>(null)
const prefSaving = ref(false)
const prefMessage = ref('')

async function pickLogo(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) prefLogo.value = await prepareImage(file)
}

async function savePreferences() {
  prefSaving.value = true
  prefMessage.value = ''
  try {
    await saveSettings({ ...state.index.settings, siteName: prefName.value.trim() || undefined, tagline: prefTagline.value.trim() || undefined }, prefLogo.value ?? undefined)
    prefLogo.value = null
    prefMessage.value = 'Saved.'
  } catch (e: any) {
    prefMessage.value = e.message
  } finally {
    prefSaving.value = false
  }
}

async function removeLogo() {
  const { logoMediaId: _drop, ...rest } = state.index.settings ?? {}
  await saveSettings(rest)
}

const results = ref<{ entry: IndexEntry, snippet: string }[]>([])
const searching = ref(false)
const newTitle = ref('')
const exporting = ref(false)
const exportError = ref('')

const query = computed(() => String(route.query.search ?? ''))
watch([() => props.name, query], async () => {
  if (props.name !== 'Search' || !query.value) return
  searching.value = true
  results.value = await search(query.value)
  searching.value = false
  // Like Wikipedia's "Go": an exact title match opens the page directly.
  const exact = results.value.find(r => r.entry.title.toLowerCase() === query.value.toLowerCase())
  if (exact && route.query.fulltext !== '1') router.replace(titleToPath(exact.entry.title))
}, { immediate: true })

watch(() => props.name, n => { if (n === 'Random') router.replace(titleToPath(randomTitle())) }, { immediate: true })

const byLetter = computed(() => {
  const groups: Record<string, IndexEntry[]> = {}
  for (const p of allPages()) (groups[p.title[0].toUpperCase()] ||= []).push(p)
  return groups
})
const categoryList = computed(() => Object.entries(categories()).sort(([a], [b]) => a.localeCompare(b)))
const categoryPages = computed(() => (props.category ? categories()[props.category] ?? [] : []).sort((a, b) => a.title.localeCompare(b.title)))

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function exportXml() {
  exporting.value = true
  exportError.value = ''
  try {
    const pages = await allPageRecords()
    download(`mozpedia-${new Date().toISOString().slice(0, 10)}.xml`, toMediaWikiXml(pages, state.index.media), 'application/xml')
  } catch (e: any) {
    exportError.value = e.message
  } finally {
    exporting.value = false
  }
}

async function exportOne(title: string) {
  const page = await getPage(title)
  if (page) download(`${title.replace(/[^\w-]+/g, '_')}.wiki`, toWikitext(page, state.index.media), 'text/plain')
}

const heading = computed(() => ({
  Search: 'Search results',
  AllPages: 'All pages',
  Categories: 'Categories',
  CreatePage: 'Create a page',
  Export: 'Export to MediaWiki',
  Preferences: 'Preferences',
  Random: 'Random page',
  Category: `Category: ${props.category}`,
} as Record<string, string>)[props.name] ?? 'No such special page')

defineExpose({ heading })
</script>

<template>
  <div>
    <div class="wp-title-bar"><h1 class="wp-title">{{ heading }}</h1></div>
    <div class="wp-content" style="margin-top: 1rem">
      <template v-if="name === 'Search'">
        <p v-if="searching">Searching…</p>
        <template v-else>
          <p v-if="query && !results.some(r => r.entry.title.toLowerCase() === query.toLowerCase())">
            Create the page "<NuxtLink class="new" :to="{ path: titleToPath(query), query: { action: 'edit' } }">{{ query }}</NuxtLink>" on this wiki!
          </p>
          <p v-if="!results.length">There were no results matching the query.</p>
          <ul class="wp-results">
            <li v-for="r in results" :key="r.entry.title">
              <div class="title"><NuxtLink :to="titleToPath(r.entry.title)">{{ r.entry.title }}</NuxtLink></div>
              <div class="snippet">{{ r.snippet }}</div>
              <div class="meta">Last edited {{ new Date(r.entry.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}</div>
            </li>
          </ul>
        </template>
      </template>

      <template v-else-if="name === 'AllPages'">
        <div v-for="(pages, letter) in byLetter" :key="letter">
          <h3>{{ letter }}</h3>
          <ul class="wp-columns"><li v-for="p in pages" :key="p.title"><NuxtLink :to="titleToPath(p.title)">{{ p.title }}</NuxtLink></li></ul>
        </div>
      </template>

      <template v-else-if="name === 'Categories'">
        <p v-if="!categoryList.length">No categories yet. Add one at the bottom of the editor.</p>
        <ul class="wp-columns">
          <li v-for="[c, pages] in categoryList" :key="c">
            <NuxtLink :to="titleToPath(`Category:${c}`)">{{ c }}</NuxtLink> ({{ pages.length }} {{ pages.length === 1 ? 'member' : 'members' }})
          </li>
        </ul>
      </template>

      <template v-else-if="name === 'Category'">
        <h2>Pages in category "{{ category }}"</h2>
        <p>The following {{ categoryPages.length }} {{ categoryPages.length === 1 ? 'page is' : 'pages are' }} in this category.</p>
        <ul class="wp-columns"><li v-for="p in categoryPages" :key="p.title"><NuxtLink :to="titleToPath(p.title)">{{ p.title }}</NuxtLink></li></ul>
      </template>

      <template v-else-if="name === 'CreatePage'">
        <form style="max-width: 32rem" @submit.prevent="newTitle && router.push({ path: titleToPath(newTitle), query: { action: 'edit' } })">
          <div class="wp-field">
            <label for="wp-create">Title of the new page</label>
            <input id="wp-create" v-model="newTitle" class="wp-input">
          </div>
          <button class="wp-button primary" type="submit">Create</button>
        </form>
      </template>

      <template v-else-if="name === 'Export'">
        <p>Download every page as a MediaWiki XML dump. Any MediaWiki site can import it through <em>Special:Import</em>. Images are referenced by file name; upload them separately on the target wiki.</p>
        <p><strong>The export is not encrypted.</strong> Keep the file somewhere private.</p>
        <div v-if="exportError" class="wp-notice error">{{ exportError }}</div>
        <button class="wp-button primary" type="button" :disabled="exporting" @click="exportXml">{{ exporting ? 'Preparing…' : `Export all ${allPages().length} pages` }}</button>
        <h2>Single pages</h2>
        <ul class="wp-columns"><li v-for="p in allPages()" :key="p.title"><a href="#" @click.prevent="exportOne(p.title)">{{ p.title }}</a> (wikitext)</li></ul>
      </template>

      <template v-else-if="name === 'Preferences'">
        <form style="max-width: 32rem" @submit.prevent="savePreferences">
          <p>These are stored encrypted with your pages, so they only appear after you unlock. The login page always shows the default name.</p>
          <div class="wp-field">
            <label for="wp-pref-name">Site name</label>
            <input id="wp-pref-name" v-model="prefName" class="wp-input" placeholder="Mozpedia">
          </div>
          <div class="wp-field">
            <label for="wp-pref-tag">Tagline</label>
            <input id="wp-pref-tag" v-model="prefTagline" class="wp-input" placeholder="The Private Encyclopedia">
          </div>
          <div class="wp-field">
            <label>Logo</label>
            <input type="file" accept="image/*" @change="pickLogo">
            <small>Shown in the header next to the site name. A transparent PNG works best.</small>
            <div v-if="brand.logoMediaId" style="margin-top: 0.5rem"><button class="wp-button" type="button" @click="removeLogo">Remove the current logo</button></div>
          </div>
          <div v-if="prefMessage" class="wp-notice info">{{ prefMessage }}</div>
          <button class="wp-button primary" type="submit" :disabled="prefSaving">{{ prefSaving ? 'Saving…' : 'Save' }}</button>
        </form>
      </template>

      <p v-else-if="name !== 'Random'">There is no special page by this name. <NuxtLink to="/wiki/Main_Page">Return to the Main Page</NuxtLink>.</p>
    </div>
  </div>
</template>
