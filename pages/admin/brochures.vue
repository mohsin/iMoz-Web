<script setup lang="ts">
const { data: versions, refresh } = await useFetch<Record<string, any>>('/api/brochure/versions')

const entries = computed(() =>
  Object.entries(versions.value ?? {}).map(([key, val]) => ({ key, ...val }))
)

const regenerating = ref<string | null>(null)
const resend = ref<Record<string, boolean>>({})

async function regenerate(key: string) {
  regenerating.value = key
  try {
    const result = await $fetch('/api/brochure/regenerate', {
      method: 'POST',
      body: { version_key: key, resend_email: resend.value[key] ?? false },
    })
    await refresh()
    alert(`Regenerated as v${(result as any).version}`)
  } catch (e: any) {
    alert('Failed: ' + (e?.data?.message ?? e.message))
  } finally {
    regenerating.value = null
  }
}
</script>

<template>
  <Head>
    <Title>iMoz Admin — Brochures</Title>
  </Head>
  <div class="mt-8 mx-auto max-w-4xl px-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Brochure Requests</h1>

    <p v-if="!entries.length" class="text-gray-500 dark:text-slate-400 text-sm">No brochures generated yet.</p>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="entry in entries"
        :key="entry.key"
        class="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 p-5 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 class="font-semibold text-gray-900 dark:text-white text-base">{{ entry.institution_name }}</h2>
            <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {{ entry.workshop_title }} · {{ entry.variant_label }} ·
              <span class="font-medium text-slate-700 dark:text-slate-300">v{{ entry.current_version }}</span>
            </p>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">{{ entry.requester_name }} — {{ entry.requester_email }}</p>
          </div>

          <div class="flex flex-col gap-2 items-end">
            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
              <input :id="`resend-${entry.key}`" v-model="resend[entry.key]" type="checkbox" class="rounded" />
              <label :for="`resend-${entry.key}`">Re-send email</label>
            </div>
            <button
              class="bg-slate-700 dark:bg-slate-600 text-white text-xs font-medium px-4 py-2 hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              :disabled="regenerating === entry.key"
              @click="regenerate(entry.key)"
            >
              <svg v-if="regenerating === entry.key" class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ regenerating === entry.key ? 'Generating…' : 'Regenerate' }}
            </button>
          </div>
        </div>

        <!-- Version history -->
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-600">
          <p class="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">History</p>
          <div class="flex flex-col gap-1">
            <div
              v-for="h in [...entry.history].reverse()"
              :key="h.version"
              class="flex items-center justify-between text-xs"
            >
              <span class="font-medium text-gray-700 dark:text-slate-300">v{{ h.version }}</span>
              <span class="text-gray-400 dark:text-slate-500">
                ₹{{ h.pricing?.student }} / ₹{{ h.pricing?.professional }} per head ·
                {{ new Date(h.generated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
