<template>
  <div class="flex flex-col min-h-screen w-full">
    <header>
        <PageNavbar />
    </header>
    <div class="dark:text-white flex flex-col grow shrink-0 basis-auto items-center">
      <div class="w-full lg:w-2/3 p-3 lg:px-6">
        <slot />
      </div>
    </div>
    <PageFooter />
  </div>
</template>