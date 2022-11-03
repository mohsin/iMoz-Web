import { defineNuxtModule } from '@nuxt/kit';
import { fileURLToPath } from 'node:url';

export default defineNuxtModule({
  hooks: {
    'components:dirs'(dirs) {
      dirs.push({
        path: fileURLToPath(new URL('../node_modules/vue-gravatar/src/components', import.meta.url))
      })
    }
  }
})
