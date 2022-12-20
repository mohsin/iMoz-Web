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
  <transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="transform opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-75"
      mode="out-in">
      <keep-alive>
        <component :is="currentComponent" :data="data" :method="method" />
      </keep-alive>
  </transition>
</template>
