<template>
  <div class="bg-whitesmoke dark:bg-blacksmoke transition-bg ease-in-out duration-1000">
    <header>
        <PageNavbar />
    </header>
    <div class="flex flex-col min-h-screen dark:text-white">
      <slot />
    </div>
  </div>
</template>