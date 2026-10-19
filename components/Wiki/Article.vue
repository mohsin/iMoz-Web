<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { wikiExtensions } from '~/utils/wiki/extensions'
import { titleToPath, walk, type PMNode } from '~/utils/wiki/document'
import { useWiki } from '~/composables/useWiki'
import type { TocItem } from './Shell.vue'

const props = defineProps<{ doc: PMNode, categories: string[] }>()
const emit = defineEmits<{ (e: 'toc', items: TocItem[]): void }>()

const router = useRouter()
const { exists } = useWiki()
const root = ref<HTMLElement>()

const editor = useEditor({
  editable: false,
  content: props.doc,
  extensions: wikiExtensions(exists),
})

watch(() => props.doc, doc => editor.value?.commands.setContent(doc, false))

const references = computed(() => {
  const refs: string[] = []
  walk(props.doc, n => { if (n.type === 'wikiRef') refs.push(n.attrs?.text ?? '') })
  return refs
})

// Give headings Wikipedia-style anchors and report them for the contents sidebar.
function buildToc() {
  if (!root.value) return
  const used = new Set<string>()
  const items: TocItem[] = []
  root.value.querySelectorAll<HTMLElement>('.ProseMirror > h2, .ProseMirror > h3, .ProseMirror > h4').forEach(h => {
    let id = (h.textContent ?? '').trim().replace(/\s+/g, '_').replace(/[^\p{L}\p{N}_-]/gu, '') || 'section'
    while (used.has(id)) id += '_'
    used.add(id)
    h.id = id
    items.push({ id, text: h.textContent ?? '', level: Number(h.tagName[1]) })
  })
  if (references.value.length) items.push({ id: 'References', text: 'References', level: 2 })
  emit('toc', items)
}

watch(editor, () => nextTick(buildToc))
watch(() => props.doc, () => nextTick(buildToc))
onMounted(() => nextTick(buildToc))

// Internal links navigate inside the app instead of reloading the page.
function onClick(e: MouseEvent) {
  const a = (e.target as HTMLElement).closest('a[data-target]') as HTMLAnchorElement | null
  if (!a || e.metaKey || e.ctrlKey) return
  e.preventDefault()
  router.push(titleToPath(a.dataset.target!))
}

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div ref="root" class="wp-content" @click="onClick">
    <EditorContent :editor="editor" />
    <template v-if="references.length">
      <h2 id="References">References</h2>
      <ol class="wp-references">
        <li v-for="(text, i) in references" :id="`cite-note-${i + 1}`" :key="i">{{ text }}</li>
      </ol>
    </template>
    <div v-if="categories.length" class="wp-catlinks">
      <NuxtLink to="/wiki/Special:Categories">Categories</NuxtLink>:
      <ul>
        <li v-for="c in categories" :key="c">
          <NuxtLink :to="titleToPath(`Category:${c}`)">{{ c }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
