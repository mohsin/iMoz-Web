<script setup lang="ts">
var events = (await queryContent('/data/events').findOne())
var upcomingEvents = events.body.filter(it => it.status == 'future')
var pastEvents = events.body.filter(it => it.status == 'past')

const toIsoDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toISOString().split('T')[0]
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(
        events.body.map((event: any) => ({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          startDate: toIsoDate(event.date[0]),
          endDate: toIsoDate(event.date[event.date.length - 1]),
          eventStatus: event.status === 'future'
            ? 'https://schema.org/EventScheduled'
            : 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: event.location[0]
          },
          description: event.description,
          image: event.image ? `https://imoz.in${event.image}` : undefined,
          organizer: {
            '@type': 'Person',
            name: 'Saifur Rahman Mohsin',
            url: 'https://imoz.in'
          }
        }))
      )
    }
  ]
})
</script>

<template>
    <Head>
      <Title>iMoz - Events</Title>
    </Head>
    <section v-if="upcomingEvents.length > 0">
      <div class="mt-4 pt-0 sm:pt-4 text-justify text-lg text-black dark:text-whitesmoke">
        <div class="flex flex-col justify-center mx-3 sm:mx-0">
          <h2 id="upcoming-events" class="text-black dark:text-white text-3xl font-extrabold mt-6 w-full text-center sm:text-left">Upcoming Events</h2>
          <div class="mt-4 bg-gradient-to-b from-[#4291F2] to-[#1264C7] rounded-lg">
            <PageEvents :upcoming="true" :data="upcomingEvents" />
          </div>
        </div>
      </div>
    </section>
    <section v-if="pastEvents.length > 0">
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
