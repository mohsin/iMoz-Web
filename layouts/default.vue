<template>
  <div class="flex flex-col min-h-screen w-full">
    <header>
        <PageNavbar />
    </header>
    <div class="dark:text-white flex grow shrink-0 basis-auto">
      <div class="pl-4 pr-4">
        <slot />
      </div>
    </div>
    <PageFooter />
  </div>
</template>