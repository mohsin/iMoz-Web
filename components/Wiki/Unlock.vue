<script setup lang="ts">
import { useWiki } from '~/composables/useWiki'

const { state, unlock, createWiki } = useWiki()
const password = ref('')
const busy = ref(false)
const error = ref('')

async function submit() {
  if (!password.value) return
  busy.value = true
  error.value = ''
  try {
    await unlock(password.value)
  } catch (e: any) {
    error.value = e.code === 'not_configured'
      ? 'The wiki is not set up on the server yet: ' + e.message
      : e.message
  } finally {
    busy.value = false
    password.value = ''
  }
}

async function create() {
  busy.value = true
  error.value = ''
  try { await createWiki() } catch (e: any) { error.value = e.message } finally { busy.value = false }
}
</script>

<template>
  <div class="wp-login">
    <template v-if="state.status === 'setup'">
      <h1 class="wp-title">Create Mozpedia</h1>
      <p>The password was accepted and the data repository is empty. Creating the wiki writes an encrypted Main Page and index. Pages are encrypted with this same password, so it can't be recovered if you forget it.</p>
      <div v-if="error" class="wp-notice error">{{ error }}</div>
      <button class="wp-button primary" type="button" :disabled="busy" @click="create">{{ busy ? 'Creating…' : 'Create the wiki' }}</button>
    </template>
    <template v-else>
      <h1 class="wp-title">Log in</h1>
      <p class="wp-sitesub">Mozpedia is private. Enter your password to unlock it on this device.</p>
      <form @submit.prevent="submit">
        <div class="wp-field">
          <label for="wp-password">Password</label>
          <input id="wp-password" v-model="password" class="wp-input" type="password" autocomplete="current-password" autofocus>
        </div>
        <div v-if="error" class="wp-notice error">{{ error }}</div>
        <button class="wp-button primary" type="submit" :disabled="busy" style="width: 100%; justify-content: center">{{ busy ? 'Unlocking…' : 'Log in' }}</button>
      </form>
    </template>
  </div>
</template>
