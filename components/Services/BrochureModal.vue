<script setup lang="ts">
const props = defineProps<{ workshop: any }>()
const emit  = defineEmits(['close'])

const step = ref(1)
const loading = ref(false)
const success = ref(false)
const error = ref('')

// Step 1 — variant
const selectedTab = ref(props.workshop.tabs?.[0] ?? null)

// Step 2 — institution
const institution_name       = ref('')
const institution_department = ref('')
const institution_address    = ref('')
const institution_city       = ref('')
const institution_state      = ref('')
const institution_pincode    = ref('')

// Places Autocomplete — proxied through Nuxt server (key stays server-side)
const suggestions = ref<any[]>([])
const showDropdown = ref(false)
let _debounce: ReturnType<typeof setTimeout> | null = null

async function onInstitutionInput() {
  const q = institution_name.value.trim()
  if (q.length < 2) { suggestions.value = []; showDropdown.value = false; return }
  if (_debounce) clearTimeout(_debounce)
  _debounce = setTimeout(async () => {
    try {
      const { suggestions: res } = await $fetch<any>('/api/places/autocomplete', {
        method: 'POST',
        body: { input: q },
      })
      suggestions.value = res ?? []
      showDropdown.value = suggestions.value.length > 0
    } catch { /* quota or network error — fall back to manual entry */ }
  }, 300)
}

async function selectSuggestion(s: any) {
  showDropdown.value = false
  const pred = s.placePrediction
  institution_name.value = pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? institution_name.value

  try {
    const place = await $fetch<any>(`/api/places/details?placeId=${pred.placeId}`)
    const components: any[] = place.addressComponents ?? []
    const get = (type: string) =>
      components.find((c: any) => c.types?.includes(type))?.longText ?? ''

    // Resolve city/state/pincode first, then subtract them from address parts
    const city  = get('administrative_area_level_3') || get('locality') || get('administrative_area_level_2')
    const state = get('administrative_area_level_1')

    institution_city.value    = city
    institution_state.value   = state
    institution_pincode.value = get('postal_code')

    // Types that are never part of a street address line
    const neverAddress = new Set([
      'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3',
      'administrative_area_level_4', 'country', 'postal_code', 'plus_code',
    ])
    // Resolved text values to exclude (city, state, country)
    const skipText = new Set([city, state, get('country'), get('administrative_area_level_2')].filter(Boolean))

    const seen = new Set<string>()
    const addressParts = components
      .filter((c: any) =>
        !c.types.every((t: string) => neverAddress.has(t) || t === 'political') &&
        !skipText.has(c.longText)
      )
      .map((c: any) => c.longText)
      .filter((text: string) => text && !seen.has(text) && seen.add(text))

    institution_address.value = addressParts.join(', ')
  } catch { /* details fetch failed — user can fill manually */ }
  suggestions.value = []
}

// Step 3 — contact
const requester_name        = ref('')
const requester_email       = ref('')
const requester_phone       = ref('')
const requester_designation = ref('')
const expected_students     = ref(100)

const hackathonName = computed(() => {
  const h = props.workshop.highlight ?? ''
  return h.split('—')[0].trim() || 'Hackathon'
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/brochure/request', {
      method: 'POST',
      body: {
        workshop_slug:    props.workshop.slug,
        workshop_title:   props.workshop.title,
        variant_label:    selectedTab.value?.label,
        topics:           selectedTab.value?.topics ?? [],
        hackathon_name:   hackathonName.value,
        institution_name:       institution_name.value,
        institution_department: institution_department.value,
        institution_address:    institution_address.value,
        institution_city:       institution_city.value,
        institution_state:      institution_state.value,
        institution_pincode:    institution_pincode.value,
        requester_name:        requester_name.value,
        requester_email:       requester_email.value,
        requester_phone:       requester_phone.value,
        requester_designation: requester_designation.value,
        expected_students:     expected_students.value,
      },
    })
    success.value = true
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" @click.self="close">
    <div class="relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-xl overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between bg-slate-700 dark:bg-slate-600 px-5 py-4">
        <h2 class="text-white font-semibold text-sm uppercase tracking-wide">Request Brochure</h2>
        <button class="text-white hover:text-slate-300 transition-colors" aria-label="Close" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="20" width="20" fill="currentColor">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12Z"/>
          </svg>
        </button>
      </div>

      <!-- Success state -->
      <div v-if="success" class="p-8 text-center">
        <Icon name="heroicons-outline:check-circle" class="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Brochure on its way!</h3>
        <p class="text-sm text-gray-500 dark:text-slate-400 mb-6">
          Check your inbox at <strong>{{ requester_email }}</strong> — the password-protected PDF will arrive shortly.
        </p>
        <button
          class="bg-slate-700 dark:bg-slate-600 text-white text-sm font-medium px-6 py-2.5 hover:bg-slate-600 transition-colors"
          @click="close"
        >
          Done
        </button>
      </div>

      <!-- Step flow -->
      <template v-else>
        <!-- Step indicator -->
        <div class="flex border-b border-slate-100 dark:border-slate-700">
          <div
            v-for="(label, i) in ['Variant', 'Institution', 'Contact']"
            :key="label"
            class="flex-1 text-center py-2.5 text-xs font-medium transition-colors"
            :class="step === i + 1
              ? 'text-slate-700 dark:text-white border-b-2 border-slate-700 dark:border-white'
              : 'text-slate-400 dark:text-slate-500'"
          >
            {{ i + 1 }}. {{ label }}
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[70vh]">

          <!-- Step 1 — Variant -->
          <div v-if="step === 1">
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {{ workshop.title }} — select the format you're interested in.
            </p>
            <div class="flex flex-col gap-2">
              <button
                v-for="tab in workshop.tabs"
                :key="tab.label"
                class="w-full text-left p-4 border transition-colors"
                :class="selectedTab?.label === tab.label
                  ? 'border-slate-700 dark:border-slate-400 bg-slate-50 dark:bg-slate-700'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400'"
                @click="selectedTab = tab"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-900 dark:text-white text-sm">{{ tab.label }}</span>
                  <Icon
                    v-if="selectedTab?.label === tab.label"
                    name="heroicons-outline:check-circle"
                    class="w-5 h-5 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <p class="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  {{ tab.topics?.length ?? 0 }} topics covered
                </p>
              </button>
            </div>
          </div>

          <!-- Step 2 — Institution -->
          <div v-if="step === 2">
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Enter your institution or company details. We'll use these to personalise the brochure.
            </p>
            <div class="flex flex-col gap-4">
              <div class="relative">
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Institution / Company name *</label>
                <input
                  v-model="institution_name"
                  type="text"
                  autocomplete="off"
                  placeholder="e.g. PSG College of Technology"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                  @input="onInstitutionInput"
                  @blur="setTimeout(() => { showDropdown = false }, 150)"
                />
                <ul
                  v-if="showDropdown"
                  class="absolute z-50 left-0 right-0 mt-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-lg max-h-56 overflow-y-auto text-sm"
                >
                  <li
                    v-for="s in suggestions"
                    :key="s.placePrediction.placeId"
                    class="px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-600 last:border-0"
                    @mousedown.prevent="selectSuggestion(s)"
                  >
                    <span class="font-medium">{{ s.placePrediction.structuredFormat?.mainText?.text }}</span>
                    <span class="text-xs text-gray-400 dark:text-slate-400 ml-1.5">{{ s.placePrediction.structuredFormat?.secondaryText?.text }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  v-model="institution_department"
                  type="text"
                  placeholder="e.g. Department of Computer Science"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Address *</label>
                <input
                  v-model="institution_address"
                  type="text"
                  placeholder="Street address"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">City *</label>
                  <input
                    v-model="institution_city"
                    type="text"
                    placeholder="City"
                    class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    v-model="institution_state"
                    type="text"
                    placeholder="State"
                    class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Pincode</label>
                <input
                  v-model="institution_pincode"
                  type="text"
                  placeholder="e.g. 641 004"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          <!-- Step 3 — Contact -->
          <div v-if="step === 3">
            <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Your details. The brochure will be emailed directly to you.
            </p>
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Your name *</label>
                <input
                  v-model="requester_name"
                  type="text"
                  placeholder="Full name"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Email address *</label>
                <input
                  v-model="requester_email"
                  type="email"
                  placeholder="you@institution.edu.in"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Phone number</label>
                <input
                  v-model="requester_phone"
                  type="tel"
                  placeholder="+91 XXXXX YYYYY"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Designation</label>
                <input
                  v-model="requester_designation"
                  type="text"
                  placeholder="e.g. HOD, Training & Placement Officer"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Expected number of students</label>
                <input
                  v-model.number="expected_students"
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  class="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-slate-500"
                />
              </div>

              <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
          <button
            v-if="step > 1"
            class="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            @click="step--"
          >
            ← Back
          </button>
          <span v-else />

          <button
            v-if="step < 3"
            class="bg-slate-700 dark:bg-slate-600 text-white text-sm font-medium px-6 py-2.5 hover:bg-slate-600 transition-colors disabled:opacity-50"
            :disabled="(step === 1 && !selectedTab) || (step === 2 && (!institution_name || !institution_address || !institution_city))"
            @click="step++"
          >
            Continue →
          </button>

          <button
            v-else
            class="bg-slate-700 dark:bg-slate-600 text-white text-sm font-medium px-6 py-2.5 hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            :disabled="loading || !requester_name || !requester_email"
            @click="submit"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ loading ? 'Generating…' : 'Send Brochure' }}
          </button>
        </div>
      </template>

    </div>
  </div>
</template>
