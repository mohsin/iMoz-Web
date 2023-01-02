<script setup lang="ts">
import { useForm } from 'vee-validate'
import * as yup from 'yup'

const isSubmitted = ref(false)
const contactForm = ref(null)

const schema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required(),
  referer: yup.string(),
  message: yup.string().required(),
})

const { useFieldModel, errors } = useForm({
  validationSchema: schema
})

const [name, referer, email, message] = useFieldModel(['name', 'referer', 'email', 'message'])

const hasErrors = computed(() => Object.keys(errors.value).length !== 0)
const onSubmit = (event) => {
  event.preventDefault()
  const contactForm = event.target;

  isSubmitted.value = true
  if(hasErrors.value) {
    return
  }

  fetch('/', {
    body: new FormData(event.target),
    method: 'POST',
  }).then(() => {
    contactForm.reset()
  }).catch((error) => {
    console.log(`Failed: ${error}`)
  }).finally(() => setTimeout(() => {
    name.value = referer.value = email.value = message.value = ''
    isSubmitted.value = false
  }, 5000))
}
if (process.client) {
  document.querySelector('form')?.addEventListener('submit', onSubmit)
}
</script>

<template>
    <Head>
      <Title>iMoz - Contact</Title>
    </Head>
    <section class="flex justify-center my-4">
      <form netlify ref="contactForm" name="contact" method="POST" class="w-full max-w-lg" enctype="multipart/form-data">
        <input type="hidden" name="form-name" value="contact" />
        <div class="py-1 sm:py-4 mb-8 text-center leading-none">
          <h1 class="text-2xl my-1 sm:my-4">Have a requirement? Get in touch!</h1>
          <span class="text-sm leading-2">(Due to the volume of requests, I'm only considering projects that have a solid PRD<sup class="text-red-700">*</sup> with a budget of $3000 and above or pays at-least $50/hour).</span>
        </div>
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="name">
              Name
            </label>
            <input v-model="name" :class="errors.name && isSubmitted ? 'border-red-500' : 'border-gray-200'" class="appearance-none block w-full bg-gray-200 text-gray-700 border py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-white focus:border-gray-700" name="name" type="text" placeholder="Harold Finch">
            <p v-if="errors.name && isSubmitted" class="text-red-500 text-xs italic">
              {{ errors.name }}
            </p>
          </div>
          <div class="w-full md:w-1/2 px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="referer">
              Referer (Optional)
            </label>
            <input v-model="referer" :class="errors.referer && isSubmitted ? 'border-red-500' : 'border-gray-200'" class="appearance-none block w-full bg-gray-200 text-gray-700 border py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-700" name="referer" type="text" placeholder="LinkedIn">
            <p v-if="errors.referer && isSubmitted" class="text-red-500 text-xs italic">
              {{ errors.referer }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap -mx-3 mb-6">
          <div class="w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="email">
              E-mail
            </label>
            <input v-model="email" :class="errors.email && isSubmitted ? 'border-red-500' : 'border-gray-200'" class="appearance-none block w-full bg-gray-200 text-gray-700 border py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-700" name="email" type="email" placeholder="harold@ift.us">
            <p v-if="errors.email && isSubmitted" class="text-red-500 text-xs italic">
              {{ errors.email }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap -mx-3 mb-2 sm:mb-4">
          <div class="w-full px-3">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="message">
              Message
            </label>
            <textarea v-model="message" :class="errors.message && isSubmitted ? 'border-red-500' : 'border-gray-200'" class="appearance-none block w-full bg-gray-200 text-gray-700 border py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-700 h-24 resize-none" name="message"></textarea>
            <p v-if="errors.message && isSubmitted" class="text-red-500 text-xs italic">
              {{ errors.message }}
            </p>
          </div>
        </div>
        <div class="sm:flex justify-center sm:justify-between items-center mb-2 sm:mb-6">
          <input name="file" class="w-full px-2 py-1 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-200 m-0  focus:text-gray-700 focus:bg-white focus:border-gray-700 focus:outline-none" type="file" />
          <div class="py-3 sm:py-0 w-full sm:w-1/3 text-center sm:text-end">
            <button class="bg-gray-700 text-white py-1.5 px-4" type="submit">
              Submit
            </button>
          </div>
        </div>
        <p class="text-gray-600 text-xs italic mt-4">
          <sup class="text-red-700">*</sup> Projects with proper UI designs (preferably on Figma) and detailed descriptions. Sample briefs are <a href="https://tinyurl.com/prdsamples" target="_new" class="text-black border-b border-black">at this link</a>. Kindly attach it to this form or include a link in the message.
        </p>
        <p v-if="isSubmitted && !hasErrors" class="mt-8 text-center text-base text-red-700">
          The form has been submitted.
        </p>
      </form>
    </section>
</template>
