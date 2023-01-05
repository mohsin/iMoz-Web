export default defineNuxtConfig({
    app: {
      head: {
        charset: 'utf-8',
        viewport: 'width=device-width, initial-scale=1',
        title: 'iMoz',
        link: [
          { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
          { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
          { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
          { rel: 'manifest', href: '/site.webmanifest' },
          { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#000000' }
        ],
        meta: [
          { name: 'description', content: 'Saifur Rahman Mohsin\'s Portfolio' },
          { name: 'msapplication-TileColor', content: '#ffffff' },
          { name: 'theme-color', content: '#ffffff' }
        ]
      },
    },
    modules: [
      '@nuxtjs/tailwindcss',
      '@nuxt/image-edge',
      '@nuxt/content',
      'nuxt-gravatar',
      'nuxt-icon'
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
    }
})
