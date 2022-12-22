<script setup lang="ts">
import { PropType } from 'vue'
import type { MasonryItem } from './types'
import type { ConcreteComponent } from 'vue';

const props = defineProps({
  id: {
    type: String
  },
  data: {
    type: Array as PropType<MasonryItem[]>
  },
  listComponent: {
    type: Object as PropType<ConcreteComponent>
  }
})

const listComponent = props.listComponent ?? resolveComponent('MasonryList')
const detailComponent = resolveComponent('MasonryDetail')
var currentComponent = shallowRef(listComponent)

var keepAliveInclude = listComponent.__name

var data: MasonryItem|MasonryItem[] = props.data

const returnToList = () => {
  currentComponent.value = listComponent
  data = props.data
}

const switchToDetail = (item: MasonryItem) => {
  currentComponent.value = detailComponent
  data = item
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
      <keep-alive :include="keepAliveInclude">
        <component :class="{'mt-12' : props.listComponent && currentComponent === detailComponent }" @onDetailClick="switchToDetail" @onReturnToList="returnToList" :id="props.id" :is="currentComponent" :data="data" />
      </keep-alive>
  </transition>
</template>
