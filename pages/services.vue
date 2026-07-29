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

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: 'Tempestronics by Saifur Rahman Mohsin',
        url: 'https://imoz.in/services',
        description: 'Full Stack Engineering services covering web applications, mobile apps, AI/LLM integration, and cloud infrastructure.',
        provider: {
          '@type': 'Person',
          name: 'Saifur Rahman Mohsin',
          url: 'https://imoz.in'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Engineering Services',
          itemListElement: (servicesData?.offerings ?? []).map((offering: any, idx: number) => ({
            '@type': 'Offer',
            position: idx + 1,
            itemOffered: {
              '@type': 'Service',
              name: offering.title,
              description: offering.tagline
            }
          }))
        }
      })
    }
  ]
})

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
