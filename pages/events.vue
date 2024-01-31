<script setup lang="ts">
var events = (await queryContent('/data/events').findOne())
var upcomingEvents = events.body.filter(it => it.status == 'future')
var pastEvents = events.body.filter(it => it.status == 'past')
</script>

<template>
    <Head>
      <Title>iMoz - Events</Title>
    </Head>
    <section>
      <div class="mt-4 pt-0 sm:pt-4 text-justify text-lg text-black dark:text-whitesmoke">
        <div class="flex flex-col justify-center mx-3 sm:mx-0">
          <h2 id="upcoming-events" class="text-black dark:text-white text-3xl font-extrabold mt-6 w-full text-center sm:text-left">Upcoming Events</h2>
          <div class="mt-4 bg-gradient-to-b from-[#4291F2] to-[#1264C7] rounded-lg">
            <PageEvents :upcoming="true" :data="upcomingEvents" />
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="mt-4 pt-0 sm:pt-4 text-justify text-lg text-black dark:text-whitesmoke">
        <div class="flex flex-col justify-center mx-3 sm:mx-0">
          <h2 id="past-events" class="text-black dark:text-white text-3xl font-extrabold mt-6 w-full text-center sm:text-left">Past Events</h2>
          <div>
            <PageEvents :data="pastEvents" />
          </div>
        </div>
      </div>
    </section>
</template>

<script lang="ts">
export { } // Fix for Vetur check
</script>
