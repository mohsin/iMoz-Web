import VueGtag from 'vue-gtag-next'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const analyticsId = runtimeConfig.gtagAnalyticsId;

  nuxtApp.vueApp.use(VueGtag, {
    property: {
      id: analyticsId
    }
  })
})
