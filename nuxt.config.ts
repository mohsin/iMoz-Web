export default defineNuxtConfig({
    app: {
      head: {
        charset: 'utf-8',
        viewport: 'width=device-width, initial-scale=1',
        title: 'iMoz',
        meta: [
          { name: 'description', content: 'Saifur Rahman Mohsin\'s Portfolio' }
        ]
      },
    },
    nitro: {
        preset: 'netlify-edge'
    },
    modules: [
      '@nuxtjs/tailwindcss',
      '@nuxt/content',
      'nuxt-gravatar'
    ],
    runtimeConfig: {
      public: {
        emailId: ''
      }
    },
})
