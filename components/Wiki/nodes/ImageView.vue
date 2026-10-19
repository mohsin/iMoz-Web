<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { useWiki } from '~/composables/useWiki'

const props = defineProps(nodeViewProps)
const { mediaUrl } = useWiki()
const src = ref<string | null>(null)
const editable = computed(() => props.editor.isEditable)

watch(() => props.node.attrs.mediaId, async id => { src.value = id ? await mediaUrl(id).catch(() => null) : null }, { immediate: true })
</script>

<template>
  <NodeViewWrapper as="figure" :class="['thumb', `t${node.attrs.align}`, { selected }]" :style="{ width: node.attrs.align === 'center' ? undefined : `${node.attrs.width + 8}px` }">
    <div class="thumbinner">
      <img v-if="src" :src="src" :alt="node.attrs.caption" :style="{ width: `${node.attrs.width}px` }" draggable="false">
      <div v-else class="thumb-missing" :style="{ width: `${node.attrs.width}px` }">Image unavailable</div>
      <figcaption v-if="!editable">{{ node.attrs.caption }}</figcaption>
      <template v-else>
        <input class="thumb-caption-input" :value="node.attrs.caption" placeholder="Caption" @input="updateAttributes({ caption: ($event.target as HTMLInputElement).value })">
        <div class="node-controls" contenteditable="false">
          <select :value="node.attrs.align" @change="updateAttributes({ align: ($event.target as HTMLSelectElement).value })">
            <option value="right">Right</option>
            <option value="left">Left</option>
            <option value="center">Centre</option>
          </select>
          <select :value="node.attrs.width" @change="updateAttributes({ width: Number(($event.target as HTMLSelectElement).value) })">
            <option :value="180">Small</option>
            <option :value="220">Medium</option>
            <option :value="320">Large</option>
            <option :value="480">Extra large</option>
          </select>
          <button type="button" @click="deleteNode">Remove</button>
        </div>
      </template>
    </div>
  </NodeViewWrapper>
</template>
