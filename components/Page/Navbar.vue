<script lang="ts" setup>
const { setDarkMode } = useMode()
</script>

<template>
    <nav>
        <div class="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8">
            <div class="relative flex flex-col lg:flex-row h-32 lg:h-16 justify-evenly lg:items-center lg:justify-between">
                <div class="flex flex-row items-center">
                    <img @click="navigateTo('/')" class="cursor-pointer h-20 lg:my-2 w-auto block p-3 invert dark:filter-none" src="~/assets/img/imoz.webp" width="478" height="251" alt="iMoz Blog Logo">
                    <span @click="setDarkMode(false)" class="hidden cursor-pointer dark:inline text-white px-1 py-4 mt-2">
                        <svg fill="currentColor" viewBox="0 0 48 48" height="24" width="24">
                            <path d="M24 31q2.9 0 4.95-2.05Q31 26.9 31 24q0-2.9-2.05-4.95Q26.9 17 24 17q-2.9 0-4.95 2.05Q17 21.1 17 24q0 2.9 2.05 4.95Q21.1 31 24 31Zm0 3q-4.15 0-7.075-2.925T14 24q0-4.15 2.925-7.075T24 14q4.15 0 7.075 2.925T34 24q0 4.15-2.925 7.075T24 34ZM3.5 25.5q-.65 0-1.075-.425Q2 24.65 2 24q0-.65.425-1.075Q2.85 22.5 3.5 22.5h5q.65 0 1.075.425Q10 23.35 10 24q0 .65-.425 1.075-.425.425-1.075.425Zm36 0q-.65 0-1.075-.425Q38 24.65 38 24q0-.65.425-1.075.425-.425 1.075-.425h5q.65 0 1.075.425Q46 23.35 46 24q0 .65-.425 1.075-.425.425-1.075.425ZM24 10q-.65 0-1.075-.425Q22.5 9.15 22.5 8.5v-5q0-.65.425-1.075Q23.35 2 24 2q.65 0 1.075.425.425.425.425 1.075v5q0 .65-.425 1.075Q24.65 10 24 10Zm0 36q-.65 0-1.075-.425-.425-.425-.425-1.075v-5q0-.65.425-1.075Q23.35 38 24 38q.65 0 1.075.425.425.425.425 1.075v5q0 .65-.425 1.075Q24.65 46 24 46ZM12 14.1l-2.85-2.8q-.45-.45-.425-1.075.025-.625.425-1.075.45-.45 1.075-.45t1.075.45L14.1 12q.4.45.4 1.05 0 .6-.4 1-.4.45-1.025.45-.625 0-1.075-.4Zm24.7 24.75L33.9 36q-.4-.45-.4-1.075t.45-1.025q.4-.45 1-.45t1.05.45l2.85 2.8q.45.45.425 1.075-.025.625-.425 1.075-.45.45-1.075.45t-1.075-.45ZM33.9 14.1q-.45-.45-.45-1.05 0-.6.45-1.05l2.8-2.85q.45-.45 1.075-.425.625.025 1.075.425.45.45.45 1.075t-.45 1.075L36 14.1q-.4.4-1.025.4-.625 0-1.075-.4ZM9.15 38.85q-.45-.45-.45-1.075t.45-1.075L12 33.9q.45-.45 1.05-.45.6 0 1.05.45.45.45.45 1.05 0 .6-.45 1.05l-2.8 2.85q-.45.45-1.075.425-.625-.025-1.075-.425ZM24 24Z"/>
                        </svg>
                    </span>
                    <span @click="setDarkMode(true)" class="inline cursor-pointer dark:hidden text-black px-1 py-4 mt-2">
                        <svg fill="currentColor" viewBox="0 0 48 48" height="24" width="24">
                            <path d="M24 42q-7.5 0-12.75-5.25T6 24q0-7.5 5.25-12.75T24 6q.4 0 .85.025.45.025 1.15.075-1.8 1.6-2.8 3.95-1 2.35-1 4.95 0 4.5 3.15 7.65Q28.5 25.8 33 25.8q2.6 0 4.95-.925T41.9 22.3q.05.6.075.975Q42 23.65 42 24q0 7.5-5.25 12.75T24 42Zm0-3q5.45 0 9.5-3.375t5.05-7.925q-1.25.55-2.675.825Q34.45 28.8 33 28.8q-5.75 0-9.775-4.025T19.2 15q0-1.2.25-2.575.25-1.375.9-3.125-4.9 1.35-8.125 5.475Q9 18.9 9 24q0 6.25 4.375 10.625T24 39Zm-.2-14.85Z"/>
                        </svg>
                    </span>
                </div>
                <ul class="flex lg:w-1/2 px-2 justify-between dark:text-white">
                    <li><NuxtLink class="hover:bg-gray-200 p-2 dark:hover:text-black" to="/about">About</NuxtLink></li>
                    <li><NuxtLink class="hover:bg-gray-200 p-2 dark:hover:text-black" to="/projects">Projects</NuxtLink></li>
                    <li><NuxtLink class="hover:bg-gray-200 p-2 dark:hover:text-black" to="/events">Events</NuxtLink></li>
                    <li><NuxtLink class="hover:bg-gray-200 p-2 dark:hover:text-black" to="/contact">Contact</NuxtLink></li>
                    <li><NuxtLink class="hover:bg-gray-200 p-2 dark:hover:text-black border border-black dark:border-white" to="/resume.pdf" target="_new">Resume</NuxtLink></li>
                </ul>
            </div>
        </div>
    </nav>
</template>
