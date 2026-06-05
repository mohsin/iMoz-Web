<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useProjectDecrypt, decryptProjectBlock } from '~/composables/useProjectDecrypt'
import type { EncryptedBlock, DecryptedProject } from '~/composables/useProjectDecrypt'

const props = defineProps<{
  slug: string
  encrypted: EncryptedBlock
}>()

const { keys, getKey } = useProjectDecrypt()
const data = ref<DecryptedProject | null>(null)

async function attempt() {
  const pw = getKey(props.slug)
  if (!pw) { data.value = null; return }
  data.value = await decryptProjectBlock(props.encrypted, pw)
}

onMounted(attempt)
watch(() => keys.value[props.slug], attempt)
</script>

<template>
  <div v-if="data" class="border-t-2 border-slate-200 dark:border-slate-600 mt-4 pt-5 space-y-6 px-4 pb-6">

    <!-- Header -->
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 text-amber-500" fill="currentColor">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
      </svg>
      <p class="text-xs font-semibold uppercase tracking-widest text-amber-500">Private Details</p>
    </div>

    <!-- Technical Summary -->
    <div v-if="data.technical_summary">
      <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Technical Summary</p>
      <p class="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{{ data.technical_summary }}</p>
    </div>

    <!-- Modules -->
    <div v-if="data.modules?.length">
      <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Modules</p>
      <div class="space-y-2">
        <div
          v-for="m in data.modules"
          :key="m.name"
          class="bg-slate-50 dark:bg-slate-600/50 border border-slate-100 dark:border-slate-600 p-3"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-medium text-gray-800 dark:text-white">{{ m.name }}</p>
            <span v-if="m.hours" class="text-xs text-slate-400 dark:text-slate-500 shrink-0">{{ m.hours }}h</span>
          </div>
          <p class="text-xs text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">{{ m.description }}</p>
        </div>
      </div>
    </div>

    <!-- Milestones -->
    <div v-if="data.milestones?.length">
      <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">Milestones</p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-600 text-left">
              <th class="pb-2 pr-4 text-xs font-normal text-slate-400 dark:text-slate-500">Milestone</th>
              <th class="pb-2 pr-4 text-xs font-normal text-slate-400 dark:text-slate-500">Billed</th>
              <th class="pb-2 pr-4 text-xs font-normal text-slate-400 dark:text-slate-500">Received (INR)</th>
              <th class="pb-2 pr-4 text-xs font-normal text-slate-400 dark:text-slate-500">Status</th>
              <th class="pb-2 text-xs font-normal text-slate-400 dark:text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ms in data.milestones"
              :key="ms.name"
              class="border-b border-slate-100 dark:border-slate-700/50"
            >
              <td class="py-2 pr-4 text-gray-700 dark:text-slate-300">{{ ms.name }}</td>
              <td class="py-2 pr-4 text-gray-700 dark:text-slate-300 font-mono text-xs">{{ ms.billed }}</td>
              <td class="py-2 pr-4 text-gray-700 dark:text-slate-300 font-mono text-xs">
                {{ ms.received_inr != null ? '₹' + ms.received_inr.toLocaleString('en-IN') : '—' }}
              </td>
              <td class="py-2 pr-4">
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': ms.status === 'paid',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': ms.status === 'pending',
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': ms.status === 'cancelled',
                  }"
                >{{ ms.status }}</span>
              </td>
              <td class="py-2 text-slate-400 dark:text-slate-500 text-xs font-mono">{{ ms.date ?? '—' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div class="flex justify-end gap-6 mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
          <p v-if="data.total_billed" class="text-sm text-slate-500 dark:text-slate-400">
            Billed: <span class="font-semibold text-gray-800 dark:text-white font-mono">{{ data.total_billed }}</span>
          </p>
          <p v-if="data.total_received_inr != null" class="text-sm text-slate-500 dark:text-slate-400">
            Received: <span class="font-semibold text-gray-800 dark:text-white font-mono">₹{{ data.total_received_inr.toLocaleString('en-IN') }}</span>
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
