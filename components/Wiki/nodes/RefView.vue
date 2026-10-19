<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

// Number references in document order, like Wikipedia's [1], [2]...
const number = computed(() => {
  props.editor.state // re-evaluate as the document changes
  const pos = typeof props.getPos === 'function' ? props.getPos() : 0
  let n = 0
  props.editor.state.doc.descendants((node, p) => {
    if (node.type.name === 'wikiRef' && p <= pos) n++
  })
  return n
})

function edit(e: MouseEvent) {
  if (!props.editor.isEditable) return
  e.preventDefault()
  const editRef = (props.editor.storage as any).mediaStaging.editRef
  editRef?.(props.node.attrs.text, (text: string) => props.updateAttributes({ text }))
}
</script>

<template>
  <NodeViewWrapper as="sup" class="reference" :title="node.attrs.text">
    <a :href="`#cite-note-${number}`" @click="edit">[{{ number }}]</a>
  </NodeViewWrapper>
</template>
