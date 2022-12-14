<script setup lang="ts">
const MAX_SUMMARY_LENGTH = 300

var work = (await queryContent('/data/work').findOne()).body
work = reactive(work.map((work: any) => ({ ...work, isClosed: true })))

const truncate = (string: string) => {
  return (string.length > MAX_SUMMARY_LENGTH) ? string.substring(0, MAX_SUMMARY_LENGTH) + '…' : string
}
</script>

<template>
    <Head>
      <Title>iMoz - About</Title>
    </Head>
    <section>
      <div class="mt-4 pt-0 sm:pt-4 text-justify text-lg text-black dark:text-whitesmoke opacity-70">
        <div class="flex flex-col justify-center mx-3 sm:mx-0">
          <h2 id="work" class="text-black text-3xl font-extrabold mt-6 w-full text-center sm:text-left">Work</h2>
          <div @click="entry.isClosed = !entry.isClosed" v-for="entry in work" v-bind:key="entry.company" class="block p-6 mx-2 rounded-lg shadow-lg bg-white w-full mt-6">
            <div class="flex justify-between">
              <div class="text-left w-[95%]">
                <h5 id="company" class="text-gray-900 text-xl leading-tight font-medium">
                  <span>{{ entry.position }} @ {{ entry.company }}</span>
                </h5>
                <span class="text-gray-600 text-sm leading-tight font-medium mt-2">{{ entry.duration }}</span>
                <span class="text-gray-600 text-sm leading-tight font-medium mb-2"> ({{ entry.location }})</span>
              </div>
              <span v-if="entry.summary.length > MAX_SUMMARY_LENGTH" :class="entry.isClosed ? 'rotate-180' : 'mt-2'" class="h-full cursor-pointer">^</span>
            </div>
            <p v-if="entry.isClosed" class="text-gray-900 text-base my-4">
              {{ truncate(entry.summary) }}
            </p>
            <p v-else class="text-gray-900 text-base my-4">
              {{ entry.summary }}
            </p>
          </div>
        </div>
      </div>
    </section>
</template>

<script lang="ts">
export { } // Fix for Vetur check
</script>
