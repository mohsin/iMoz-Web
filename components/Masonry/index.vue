<script setup lang="ts">
import { PropType } from 'vue'
import type { MasonryItem } from './types'
import type { ConcreteComponent } from '@vue/runtime-core'

var listComponent = resolveComponent('MasonryList')
const detailComponent = resolveComponent('MasonryDetail')
var currentComponent = shallowRef(listComponent)

const props = defineProps({
  id: {
    type: String
  },
  data: {
    type: Array as PropType<MasonryItem[]>,
    required: true
  },
  listComponent: {
    type: Object as PropType<ConcreteComponent>
  }
})

if (props.listComponent) {
  listComponent = props.listComponent;
}

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
    <keep-alive :include="['list']">
      <component @openDetail="switchToDetail" @returnToList="returnToList" :id="props.id" :is="currentComponent" :data="data" :method="method" />
    </keep-alive>
</template>
