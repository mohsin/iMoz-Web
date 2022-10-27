<template>
  <div class="bg-whitesmoke dark:bg-blacksmoke transition-bg ease-in-out duration-1000 flex flex-col min-h-[98vh] w-full">
    <header>
        <PageNavbar />
    </header>
    <div class="dark:text-white flex grow shrink-0 basis-auto">
      <div class="pl-4 pr-4">
        <slot />
      </div>
    </div>
  </div>
</template>