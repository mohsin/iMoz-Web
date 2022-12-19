<script setup lang="ts">
import { PropType } from 'vue'
import type { MasonryItem } from './types'

const listComponent = resolveComponent('MasonryList')
const detailComponent = resolveComponent('MasonryDetail')
var currentComponent = shallowRef(listComponent)

const props = defineProps({
  data: {
    type: Array as PropType<MasonryItem[]>,
    required: true
  }
})
var data: MasonryItem|MasonryItem[] = props.data
var method: Function = () => {}

const returnToList = () => {
  currentComponent.value = listComponent
  data = props.data
  method = switchToDetail
}

const switchToDetail = (item: MasonryItem) => {
  currentComponent.value = detailComponent
  data = item
  method = returnToList
}

returnToList()

</script>

<template>
  <transition name="component-fade" mode="out-in">
    <component :is="currentComponent" :data="data" :method="method" />
  </transition>
</template>

<style scoped>
.component-fade-enter-active, .component-fade-leave-active {
  transition: transform 1s;
}
.component-fade-enter, .component-fade-leave-to {
  transform: scaleX(3);
}
</style>