// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    css: ["@/assets/css/styles.css"],
    nitro: {
        preset: 'netlify-edge'
    },
    build: {
      postcss: {
        postcssOptions: require("./postcss.config.js"),
      },
    },
})
