// https://v3.nuxtjs.org/api/configuration/nuxt.config
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
    css: ["@/assets/css/styles.css"],
    nitro: {
        preset: 'netlify-edge'
    },
    build: {
      postcss: {
        postcssOptions: require("./postcss.config.js"),
      }
    },
    runtimeConfig: {
      public: {
        emailId: ''
      }
    },
})
