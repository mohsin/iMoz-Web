import VueGtag from 'vue-gtag-next'

export default defineNuxtPlugin((nuxtApp) => {
  const { isDark } = useMode()
  const runtimeConfig = useRuntimeConfig()
  const analyticsId = runtimeConfig.gtagAnalyticsId;

  nuxtApp.vueApp.use(VueGtag, {
    property: {
      id: analyticsId,
      params: {
        dark_mode: isDark
      }
    }
  })
})
