<template>
    <article class="m-2 lg:m-6 p-2 lg:p-8">
        <Gravatar :class="{ 'animate-fadein' : shouldAnimate }" class="h-32 w-32 rounded-full" :email="email" /><br>
        <header class="mb-4">
            <h1  :class="{ 'animate-fadein' : shouldAnimate }" class="text-4xl">Hi <span class="hidden dark:inline">👋🏼</span><span class="inline dark:hidden">👋🏾</span></h1>
        </header>
        <div>
            <p class="text-md text-slate-500 dark:text-whitesmoke opacity-70">I'm Mohsin, a freelance fullstack engineer based out of Bangalore, India who builds web, mobile, voice and watch apps.</p>
        </div>
    </article>
</template>

<script lang="ts" setup>
const { isDark } = useMode()

var shouldAnimate = useState('animate', () => false)

const runtimeConfig = useRuntimeConfig()
const email = runtimeConfig.emailId;

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
