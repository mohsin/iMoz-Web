<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { useWiki } from '~/composables/useWiki'

const props = defineProps(nodeViewProps)
const { mediaUrl, prepareImage } = useWiki()
const src = ref<string | null>(null)
const editable = computed(() => props.editor.isEditable)
const rows = computed<{ label: string, value: string }[]>(() => props.node.attrs.rows ?? [])

watch(() => props.node.attrs.mediaId, async id => { src.value = id ? await mediaUrl(id).catch(() => null) : null }, { immediate: true })

function setRow(i: number, field: 'label' | 'value', value: string) {
  const next = rows.value.map((r, j) => (j === i ? { ...r, [field]: value } : r))
  props.updateAttributes({ rows: next })
}
const addRow = () => props.updateAttributes({ rows: [...rows.value, { label: '', value: '' }] })
const removeRow = (i: number) => props.updateAttributes({ rows: rows.value.filter((_, j) => j !== i) })

// New images are staged on the editor until the page is published.
async function pickImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const media = await prepareImage(file)
  ;(props.editor.storage as any).mediaStaging.pendingMedia.push(media)
  props.updateAttributes({ mediaId: media.id })
}
</script>

<template>
  <NodeViewWrapper as="aside" :class="['infobox', { selected }]">
    <table>
      <caption v-if="!editable" class="infobox-title">{{ node.attrs.title }}</caption>
      <caption v-else class="infobox-title"><input :value="node.attrs.title" placeholder="Infobox title" @input="updateAttributes({ title: ($event.target as HTMLInputElement).value })"></caption>
      <tbody>
        <tr v-if="src || editable">
          <td colspan="2" class="infobox-image">
            <img v-if="src" :src="src" :alt="node.attrs.caption">
            <label v-if="editable" class="infobox-upload" contenteditable="false">
              {{ src ? 'Replace image' : 'Add image' }}
              <input type="file" accept="image/*" hidden @change="pickImage">
            </label>
            <div v-if="!editable && node.attrs.caption" class="infobox-caption">{{ node.attrs.caption }}</div>
            <input v-else-if="editable && src" class="infobox-caption-input" :value="node.attrs.caption" placeholder="Caption" @input="updateAttributes({ caption: ($event.target as HTMLInputElement).value })">
          </td>
        </tr>
        <tr v-for="(row, i) in rows" :key="i">
          <template v-if="!editable">
            <th scope="row">{{ row.label }}</th>
            <td>{{ row.value }}</td>
          </template>
          <template v-else>
            <th><input :value="row.label" placeholder="Label" @input="setRow(i, 'label', ($event.target as HTMLInputElement).value)"></th>
            <td class="infobox-row-edit">
              <input :value="row.value" placeholder="Value" @input="setRow(i, 'value', ($event.target as HTMLInputElement).value)">
              <button type="button" title="Remove row" @click="removeRow(i)">×</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
    <div v-if="editable" class="node-controls" contenteditable="false">
      <button type="button" @click="addRow">Add row</button>
      <button type="button" @click="deleteNode">Remove infobox</button>
    </div>
  </NodeViewWrapper>
</template>
