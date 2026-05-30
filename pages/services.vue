<script setup lang="ts">
const [servicesData, pricingData] = await Promise.all([
  queryContent('/data/services').findOne(),
  queryContent('/data/pricing').findOne(),
])

type View = 'page' | 'offering' | 'workshop'
const currentView = ref<View>('page')
const currentItem = ref<any>(null)
const brochureWorkshop = ref<any>(null)

const allWorkshops = computed(() =>
  (servicesData?.workshops ?? []).map((w: any) => ({ slug: w.slug, title: w.title }))
)

const showOffering = (offering: any) => {
  currentItem.value = offering
  currentView.value = 'offering'
}

const showWorkshop = (workshop: any) => {
  currentItem.value = workshop
  currentView.value = 'workshop'
}

const returnToPage = () => {
  currentView.value = 'page'
  currentItem.value = null
}

const openBrochureModal = (workshop: any) => {
  brochureWorkshop.value = workshop
}

const closeBrochureModal = () => {
  brochureWorkshop.value = null
}
</script>

<template>
  <Head>
    <Title>iMoz - Services</Title>
  </Head>
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
    mode="out-in"
  >
    <ServicesOfferingDetail
      v-if="currentView === 'offering'"
      key="offering"
      class="mt-12"
      :data="currentItem"
      @return="returnToPage"
    />
    <ServicesWorkshopDetail
      v-else-if="currentView === 'workshop'"
      key="workshop"
      class="mt-12"
      :data="currentItem"
      @return="returnToPage"
      @request-brochure="openBrochureModal"
    />
    <ServicesPage
      v-else
      key="page"
      :data="servicesData"
      @show-offering="showOffering"
      @show-workshop="showWorkshop"
    />
  </Transition>

  <ServicesBrochureModal
    v-if="brochureWorkshop"
    :workshop="brochureWorkshop"
    :all-workshops="allWorkshops"
    :pricing="pricingData"
    @close="closeBrochureModal"
  />
</template>

<script lang="ts">
export {}
</script>
