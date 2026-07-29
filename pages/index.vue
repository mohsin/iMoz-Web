<template>
    <article class="m-2 lg:m-3 p-2 lg:p-8">
        <Gravatar :class="{ 'animate-fadein' : shouldAnimate }" class="h-32 w-32 rounded-full" :email="email" :size="512" /><br>
        <header class="mb-4">
            <h1 :class="{ 'animate-fadein' : shouldAnimate }" class="text-4xl">Hi <span class="hidden dark:inline">👋🏻</span><span class="inline dark:hidden">👋🏽</span></h1>
        </header>
        <div class="pt-0 text-justify text-lg text-black dark:text-whitesmoke">
            <ContentDoc id="index-content" />
        </div>
    </article>
</template>

<script lang="ts" setup>
const { isDark } = useMode()

var shouldAnimate = useState('animate', () => false)

const runtimeConfig = useRuntimeConfig()
const email = runtimeConfig.emailId;

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Saifur Rahman Mohsin',
        jobTitle: 'Full Stack Engineer',
        url: 'https://imoz.in',
        email: 'mohsin92@me.com',
        sameAs: [
          'https://github.com/mohsin',
          'https://www.linkedin.com/in/saifurrahmanmohsin'
        ],
        description: 'Full Stack Engineer with 10+ years building production web, mobile, and AI-powered applications. Founder of Tempestronics with 50+ delivered projects spanning Vue 3/Nuxt, React/Next.js, Laravel, WordPress, and Android.',
        knowsAbout: [
          'Vue 3 / Nuxt', 'React / Next.js', 'Laravel', 'Android', 'iOS',
          'AI / LLM Integration', 'LangGraph', 'AWS', 'Terraform', 'Docker', 'Kubernetes'
        ],
        worksFor: {
          '@type': 'Organization',
          name: 'Tempestronics'
        }
      })
    }
  ]
})

// Animate element based on color mode toggle
const animate = () => {
    if(shouldAnimate.value) {
        shouldAnimate.value = false
        window.setTimeout(animate, 100)
    } else {
        shouldAnimate.value = true
        setTimeout(() => { shouldAnimate.value = false }, 2000)
    }
}
watch(isDark, animate);
</script>

<style>
#index-content > p {
    margin-top: 42px;
}
#index-content > p:last-of-type {
    margin-bottom: 30px;
}
</style>

<script lang="ts">
export {} // Fix for Vetur check: Cannot redeclare blocked scoped variable.
</script>
