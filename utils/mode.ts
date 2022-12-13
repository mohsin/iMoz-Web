import { usePersistedState } from './persist';

export function ModeManager() {
    const modeSetting = usePersistedState('is-dark', false);

    if (modeSetting) {
        return modeSetting
    } else {
        try {
            return window
                ? ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
                ? ref(true)
                : ref(false)
                : modeSetting
        } catch (error) {
            return ref(false)
        } 
    }
}