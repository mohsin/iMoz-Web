<template>
    <article class="m-2 lg:m-6 p-2 lg:p-8">
        <Gravatar :class="{ 'animate-fadein' : shouldAnimateGravatar }" class="h-32 w-32 rounded-full" :email="email" /><br>
        <header class="mb-4">
            <h1 class="text-4xl">Hi 👋</h1>
        </header>
        <div>
            <p class="text-md text-slate-500 dark:text-whitesmoke opacity-70">I'm Mohsin, a freelance fullstack engineer based out of Bangalore, India who builds web, mobile, voice and watch apps.</p>
        </div>
    </article>
</template>

<script lang="ts" setup>
const { isDark } = useMode()

var shouldAnimateGravatar = useState('animate', () => false)

const runtimeConfig = useRuntimeConfig()
const email = runtimeConfig.emailId;

// Animate gravatar on color mode toggle
const animateGravatar = () => {
    if(shouldAnimateGravatar.value) {
        shouldAnimateGravatar.value = false;
       window.setTimeout(animateGravatar, 100);
    } else {
        shouldAnimateGravatar.value = true;
        setTimeout(() => { shouldAnimateGravatar.value = false; console.log('animating complete') }, 2000);
    }
}
watch(isDark, animateGravatar);
</script>
