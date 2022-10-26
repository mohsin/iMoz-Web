<script lang="ts">

export default defineComponent({
  created() {
    this.$bus.on('is-animating', ($event) => { this.isAnimating = $event });
    this.$bus.on('to-dark', ($event) => { this.toDark = $event;console.log(this.toDark); });
  },
  data() {
    return {
      isAnimating: false,
      toDark: true
    }
  },
})
</script>

<template>
  <div>
    <div :class="isAnimating ? 'bg-whitesmoke' : 'bg-whitesmoke dark:bg-blacksmoke'">
      <header>
          <PageNavbar />
      </header>
      <div class="flex flex-col min-h-screen transition-all duration-300 dark:text-white">
        <slot />
      </div>
    </div>
  </div>
</template>