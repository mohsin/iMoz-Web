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
    modules: [
      '@nuxtjs/tailwindcss',
      '@nuxt/image-edge',
      '@nuxt/content',
      'nuxt-gravatar'
    ],
    image: {
      provider: 'netlify',
      screens: {
        xs: 639,
        sm: 767,
        md: 1023,
        lg: 1279,
        xl: 1535
      },
    },
    runtimeConfig: {
      public: {
        emailId: ''
      }
    },
})
