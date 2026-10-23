export default defineNuxtConfig({
    app: {
      head: {
        charset: 'utf-8',
        viewport: 'width=device-width, initial-scale=1',
        title: 'iMoz - Saifur Rahman Mohsin | Full Stack Engineer',
        link: [
          { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
          { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
          { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
          { rel: 'manifest', href: '/site.webmanifest' },
          { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#000000' }
        ],
        meta: [
          { name: 'description', content: 'Saifur Rahman Mohsin: full-stack engineer in Bangalore building web, mobile, and AI applications for startups and businesses worldwide. Founder of Tempestronics, 50+ projects delivered.' },
          { name: 'msapplication-TileColor', content: '#ffffff' },
          { name: 'theme-color', content: '#ffffff' },
          { name: 'google-adsense-account', content: 'ca-pub-5137799284836201' },
          // Link previews (WhatsApp, iMessage, Instagram, Slack, LinkedIn, X)
          { property: 'og:type', content: 'website' },
          { property: 'og:site_name', content: 'iMoz' },
          { property: 'og:url', content: 'https://imoz.in/' },
          { property: 'og:title', content: 'Saifur Rahman Mohsin | Full Stack Engineer' },
          { property: 'og:description', content: 'Full-stack engineer in Bengaluru and founder of Tempestronics, building web, mobile and AI products for startups and businesses worldwide.' },
          { property: 'og:image', content: 'https://imoz.in/og-image.jpg' },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          { property: 'og:image:alt', content: 'Saifur Rahman Mohsin speaking at AWS Community Day Bengaluru' },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: 'Saifur Rahman Mohsin | Full Stack Engineer' },
          { name: 'twitter:description', content: 'Full-stack engineer in Bengaluru and founder of Tempestronics, building web, mobile and AI products for startups and businesses worldwide.' },
          { name: 'twitter:image', content: 'https://imoz.in/og-image.jpg' }
        ]
      },
    },
    nitro: {
      prerender: {
        routes: ['/sitemap.xml']
      }
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
      zohoEmail:        process.env.ZOHO_EMAIL        ?? '',
      zohoAppPassword:  process.env.ZOHO_APP_PASSWORD ?? '',
      zohoSmtpHost:     process.env.ZOHO_SMTP_HOST   ?? 'smtp.zoho.com',
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      proposerName:     process.env.PROPOSER_NAME    ?? '',
      proposerEmail:    process.env.PROPOSER_EMAIL   ?? '',
      proposerPhone:    process.env.PROPOSER_PHONE   ?? '',
      proposerWebsite:  process.env.PROPOSER_WEBSITE ?? '',
      public: {
        emailId: '',
        gtagAnalyticsId: ''
      }
    }
})
