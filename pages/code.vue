<script setup lang="ts">
var projects = [
  {
    name: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
  },
  {
    name: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  },
  {
    name: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  },
  {
    name: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.'
  },
  {
    name: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'
  }
]
</script>

<template>
  <Head>
    <Title>iMoz - Code</Title>
  </Head>
  <div class="mt-3 sm:mt-12">
    <h2 class="text-black dark:text-white text-3xl font-semibold my-2 sm:my-6 w-full text-center sm:text-left">Client Projects</h2>
    <div class="grid [grid-template-rows:masonry] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3">
      <div v-for="project in projects" v-bind:key="project.name" class="p-3 pl-0 mb-3 border-b border-[#eee] border-r-0 sm:border-r sm:[&:nth-child(even)]:border-r-0 md:[&:nth-child(even)]:border-r border-r-[#eee] md:[&:nth-child(3)]:border-r-0">
        <div class="flex justify-center w-full min-h-[128px] bg-gray-200 px-4 py-2">
          <span class="py-2 text-center">{{ project.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
