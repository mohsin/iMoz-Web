<script setup lang="ts">
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)
const editable = computed(() => props.editor.isEditable)
</script>

<template>
  <NodeViewWrapper as="section" :class="['mp-box', `mp-${node.attrs.tone}`, `mp-${node.attrs.width}`]">
    <h2 class="mp-h2">
      <template v-if="!editable">{{ node.attrs.title }}</template>
      <input v-else :value="node.attrs.title" placeholder="Box title" @input="updateAttributes({ title: ($event.target as HTMLInputElement).value })">
    </h2>
    <div v-if="editable" class="node-controls" contenteditable="false">
      <select :value="node.attrs.tone" @change="updateAttributes({ tone: ($event.target as HTMLSelectElement).value })">
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="purple">Purple</option>
        <option value="orange">Orange</option>
        <option value="grey">Grey</option>
      </select>
      <select :value="node.attrs.width" @change="updateAttributes({ width: ($event.target as HTMLSelectElement).value })">
        <option value="half">Half width</option>
        <option value="full">Full width</option>
      </select>
      <button type="button" @click="deleteNode">Remove box</button>
    </div>
    <NodeViewContent class="mp-body" />
  </NodeViewWrapper>
</template>
