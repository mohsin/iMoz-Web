<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { wikiExtensions } from '~/utils/wiki/extensions'
import { normalizeTitle, type PageRecord, type PMNode } from '~/utils/wiki/document'
import { useWiki, type NewMedia } from '~/composables/useWiki'

const props = defineProps<{ page: PageRecord | null, title: string }>()
const emit = defineEmits<{ (e: 'saved', title: string, queued: boolean): void, (e: 'cancel'): void }>()

const { savePage, exists, allPages, prepareImage, emptyDoc } = useWiki()

const draftKey = `mozpedia-draft:${normalizeTitle(props.title)}`
const categories = ref<string[]>([...(props.page?.categories ?? [])])
const newCategory = ref('')
const pageTitle = ref(props.page?.title ?? normalizeTitle(props.title))
const dirty = ref(false)

function initialDoc(): PMNode {
  try {
    const draft = localStorage.getItem(draftKey)
    if (draft) return JSON.parse(draft)
  } catch {}
  return props.page?.doc ?? emptyDoc()
}

const editor = useEditor({
  content: initialDoc(),
  extensions: wikiExtensions(exists, 'Start writing, or type [[ to link another page…'),
  autofocus: 'start',
  onUpdate: ({ editor }) => {
    dirty.value = true
    // Keep an unsent draft on this device in case the tab closes before publishing.
    try { localStorage.setItem(draftKey, JSON.stringify(editor.getJSON())) } catch {}
  },
})

const block = computed(() => {
  const e = editor.value
  if (!e) return 'paragraph'
  for (const level of [2, 3, 4]) if (e.isActive('heading', { level })) return `h${level}`
  return 'paragraph'
})

function setBlock(value: string) {
  const chain = editor.value!.chain().focus()
  if (value === 'paragraph') chain.setParagraph().run()
  else chain.toggleHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run()
}

// ── Links ───────────────────────────────────────────────────────────────────

const linkDialog = ref(false)
const linkTarget = ref('')
const linkExternal = ref(false)
const linkInput = ref<HTMLInputElement>()
watch(linkDialog, open => { if (open) nextTick(() => linkInput.value?.focus()) })
const linkSuggestions = computed(() => {
  const q = linkTarget.value.trim().toLowerCase()
  if (!q || linkExternal.value) return []
  return allPages().map(p => p.title).filter(t => t.toLowerCase().includes(q)).slice(0, 6)
})

function openLink() {
  const e = editor.value!
  linkExternal.value = e.isActive('link')
  linkTarget.value = e.getAttributes('wikiLink').target ?? e.getAttributes('link').href ?? ''
  if (!linkTarget.value) {
    const { from, to } = e.state.selection
    linkTarget.value = e.state.doc.textBetween(from, to, ' ')
  }
  linkDialog.value = true
}

function applyLink(target = linkTarget.value) {
  const e = editor.value!
  const value = target.trim()
  linkDialog.value = false
  if (!value) { e.chain().focus().unsetWikiLink().unsetLink().run(); return }
  const isExternal = linkExternal.value || /^https?:\/\//i.test(value)
  const { empty } = e.state.selection
  if (empty) {
    // No selection: insert the target as the link text.
    const mark = isExternal ? { type: 'link', attrs: { href: value } } : { type: 'wikiLink', attrs: { target: normalizeTitle(value) } }
    e.chain().focus().insertContent({ type: 'text', text: isExternal ? value : normalizeTitle(value), marks: [mark] }).run()
  } else if (isExternal) {
    e.chain().focus().unsetWikiLink().setLink({ href: value }).run()
  } else {
    e.chain().focus().unsetLink().setWikiLink(value).run()
  }
}

// ── Media ───────────────────────────────────────────────────────────────────

const fileInput = ref<HTMLInputElement>()
const uploadError = ref('')

async function onImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  ;(event.target as HTMLInputElement).value = ''
  if (!file) return
  uploadError.value = ''
  try {
    const media = await prepareImage(file)
    ;(editor.value!.storage as any).mediaStaging.pendingMedia.push(media)
    editor.value!.chain().focus().insertWikiImage({ mediaId: media.id, caption: '' }).run()
  } catch {
    uploadError.value = 'That image could not be read. Try a JPEG, PNG or WebP file.'
  }
}

// One dialog both adds citations and edits existing ones (RefView calls editRef).
const citeDialog = ref(false)
const citeText = ref('')
const citeInput = ref<HTMLInputElement>()
watch(citeDialog, open => { if (open) nextTick(() => citeInput.value?.focus()) })
let citeApply: ((text: string) => void) | null = null

function openCite(text = '', apply?: (text: string) => void) {
  citeText.value = text
  citeApply = apply ?? (t => editor.value!.chain().focus().insertRef(t).run())
  citeDialog.value = true
}

function applyCite() {
  if (citeText.value.trim()) citeApply?.(citeText.value.trim())
  citeDialog.value = false
}

watch(editor, e => { if (e) (e.storage as any).mediaStaging.editRef = openCite }, { immediate: true })

// ── Categories ──────────────────────────────────────────────────────────────

function addCategory() {
  const c = normalizeTitle(newCategory.value.replace(/^category:/i, ''))
  if (c && !categories.value.includes(c)) categories.value.push(c)
  newCategory.value = ''
  dirty.value = true
}

// ── Publish ─────────────────────────────────────────────────────────────────

const publishDialog = ref(false)
const summaryInput = ref<HTMLInputElement>()
watch(publishDialog, open => { if (open) nextTick(() => summaryInput.value?.focus()) })
const summary = ref('')
const saving = ref(false)
const saveError = ref('')

async function publish() {
  saving.value = true
  saveError.value = ''
  try {
    const doc = editor.value!.getJSON() as PMNode
    // Only upload staged images the document still uses.
    const used = new Set<string>()
    editor.value!.state.doc.descendants(n => { if (n.attrs?.mediaId) used.add(n.attrs.mediaId) })
    const media = ((editor.value!.storage as any).mediaStaging.pendingMedia as NewMedia[]).filter(m => used.has(m.id))
    const title = normalizeTitle(pageTitle.value)
    const { queued } = await savePage({ id: props.page?.id, title, doc, categories: categories.value, summary: summary.value, media })
    try { localStorage.removeItem(draftKey) } catch {}
    publishDialog.value = false
    dirty.value = false
    emit('saved', title, queued)
  } catch (e: any) {
    saveError.value = e.message || 'Saving failed.'
  } finally {
    saving.value = false
  }
}

const confirmDiscard = ref(false)

function cancel(force = false) {
  if (dirty.value && !force) { confirmDiscard.value = true; return }
  try { localStorage.removeItem(draftKey) } catch {}
  emit('cancel')
}

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div>
    <div v-if="!page" class="wp-field" style="max-width: 32rem">
      <label for="wp-new-title">Page title</label>
      <input id="wp-new-title" v-model="pageTitle" class="wp-input">
    </div>

    <div v-if="editor" class="wp-editor-toolbar" role="toolbar" aria-label="Editing tools">
      <button type="button" title="Undo" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">↶</button>
      <button type="button" title="Redo" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">↷</button>
      <span class="sep" />
      <select :value="block" aria-label="Paragraph style" @change="setBlock(($event.target as HTMLSelectElement).value)">
        <option value="paragraph">Paragraph</option>
        <option value="h2">Heading</option>
        <option value="h3">Sub-heading 1</option>
        <option value="h4">Sub-heading 2</option>
      </select>
      <span class="sep" />
      <button type="button" title="Bold" :class="{ active: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()"><strong>B</strong></button>
      <button type="button" title="Italic" :class="{ active: editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()"><em>I</em></button>
      <button type="button" title="Strikethrough" :class="{ active: editor.isActive('strike') }" @click="editor.chain().focus().toggleStrike().run()"><s>S</s></button>
      <button type="button" title="Link" :class="{ active: editor.isActive('wikiLink') || editor.isActive('link') }" @click="openLink">Link</button>
      <button type="button" title="Cite a source" @click="openCite()">Cite</button>
      <span class="sep" />
      <button type="button" title="Bullet list" :class="{ active: editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()">• List</button>
      <button type="button" title="Numbered list" :class="{ active: editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()">1. List</button>
      <button type="button" title="Quote" :class="{ active: editor.isActive('blockquote') }" @click="editor.chain().focus().toggleBlockquote().run()">Quote</button>
      <span class="sep" />
      <button type="button" title="Insert image" @click="fileInput?.click()">Image</button>
      <button type="button" title="Insert infobox" @click="editor.chain().focus().insertInfobox().run()">Infobox</button>
      <button type="button" title="Insert table" @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">Table</button>
      <button type="button" title="Insert a Main Page style box" @click="editor.chain().focus().insertPortalBox().run()">Box</button>
      <template v-if="editor.isActive('table')">
        <span class="sep" />
        <button type="button" @click="editor.chain().focus().addRowAfter().run()">+ Row</button>
        <button type="button" @click="editor.chain().focus().addColumnAfter().run()">+ Column</button>
        <button type="button" @click="editor.chain().focus().deleteRow().run()">− Row</button>
        <button type="button" @click="editor.chain().focus().deleteColumn().run()">− Column</button>
        <button type="button" @click="editor.chain().focus().deleteTable().run()">Delete table</button>
      </template>
      <span class="spacer" />
      <button type="button" @click="cancel()">Cancel</button>
      <button type="button" class="wp-button primary" @click="publishDialog = true">Publish changes…</button>
      <input ref="fileInput" type="file" accept="image/*" hidden @change="onImage">
    </div>

    <div v-if="uploadError" class="wp-notice error">{{ uploadError }}</div>
    <div v-if="confirmDiscard" class="wp-notice warning">
      Discard your unpublished changes?
      <button class="wp-button destructive" type="button" @click="cancel(true)">Discard</button>
      <button class="wp-button" type="button" @click="confirmDiscard = false">Keep editing</button>
    </div>

    <div class="wp-content wp-editor-surface">
      <EditorContent :editor="editor" />
    </div>

    <div class="wp-catlinks">
      <strong>Categories:</strong>
      <span class="wp-chips" style="display: inline-flex; margin-left: 0.5rem">
        <span v-for="c in categories" :key="c" class="wp-chip">
          {{ c }}
          <button type="button" :aria-label="`Remove ${c}`" @click="categories = categories.filter(x => x !== c); dirty = true">×</button>
        </span>
        <input v-model="newCategory" class="wp-input" style="width: 12rem; min-height: 1.6rem" placeholder="Add a category" @keydown.enter.prevent="addCategory">
      </span>
    </div>

    <div v-if="linkDialog" class="wp-dialog-backdrop" @click.self="linkDialog = false">
      <div class="wp-dialog" role="dialog" aria-label="Link">
        <header>Link <button class="wp-button quiet" type="button" @click="linkDialog = false">×</button></header>
        <div class="body">
          <div class="wp-field">
            <label><input v-model="linkExternal" type="checkbox"> External website</label>
          </div>
          <div class="wp-field">
            <label for="wp-link-target">{{ linkExternal ? 'Web address' : 'Page title' }}</label>
            <input id="wp-link-target" ref="linkInput" v-model="linkTarget" class="wp-input" :placeholder="linkExternal ? 'https://' : 'e.g. Goals for 2027'" @keydown.enter.prevent="applyLink()">
            <small v-if="!linkExternal && linkTarget && !exists(linkTarget)">No page with this title yet: the link will show in red until you create it.</small>
          </div>
          <ul v-if="linkSuggestions.length" class="wp-results">
            <li v-for="t in linkSuggestions" :key="t"><a href="#" @click.prevent="applyLink(t)">{{ t }}</a></li>
          </ul>
        </div>
        <footer>
          <button class="wp-button" type="button" @click="applyLink('')">Remove link</button>
          <button class="wp-button primary" type="button" @click="applyLink()">Done</button>
        </footer>
      </div>
    </div>

    <div v-if="citeDialog" class="wp-dialog-backdrop" @click.self="citeDialog = false">
      <div class="wp-dialog" role="dialog" aria-label="Cite">
        <header>Cite <button class="wp-button quiet" type="button" @click="citeDialog = false">×</button></header>
        <div class="body">
          <div class="wp-field">
            <label for="wp-cite">Reference</label>
            <input id="wp-cite" ref="citeInput" v-model="citeText" class="wp-input" placeholder="Source, link or note" @keydown.enter.prevent="applyCite">
          </div>
        </div>
        <footer>
          <button class="wp-button" type="button" @click="citeDialog = false">Cancel</button>
          <button class="wp-button primary" type="button" @click="applyCite">Insert</button>
        </footer>
      </div>
    </div>

    <div v-if="publishDialog" class="wp-dialog-backdrop" @click.self="publishDialog = false">
      <div class="wp-dialog" role="dialog" aria-label="Save your changes">
        <header>Save your changes</header>
        <div class="body">
          <div class="wp-field">
            <label for="wp-summary">Summary</label>
            <input id="wp-summary" ref="summaryInput" v-model="summary" class="wp-input" placeholder="Describe what you changed" @keydown.enter.prevent="publish">
            <small>Shown in the page history. Encrypted like everything else.</small>
          </div>
          <div v-if="saveError" class="wp-notice error">{{ saveError }}</div>
        </div>
        <footer>
          <button class="wp-button" type="button" @click="publishDialog = false">Resume editing</button>
          <button class="wp-button primary" type="button" :disabled="saving" @click="publish">{{ saving ? 'Publishing…' : 'Publish changes' }}</button>
        </footer>
      </div>
    </div>
  </div>
</template>
