<template>
    <article class="m-2 lg:m-6 p-2 lg:p-8">
        <gravatar-img class="h-32 w-32 rounded-full" :email="email" /><br>
        <header class="mb-4">
            <h1 class="text-4xl">Hi 👋</h1>
        </header>
        <div>
            <p class="text-md text-slate-500">I'm Mohsin, a freelance fullstack engineer based out of Bangalore, India who builds web, mobile, voice and watch apps.</p>
        </div>
    </article>
</template>

<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig()
const email = runtimeConfig.emailId;
</script>