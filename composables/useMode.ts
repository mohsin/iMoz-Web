import { ModeManager } from '../utils/mode'
import { usePersistedState } from '../utils/persist';

export function useMode() {
    const isDark = ModeManager();

    function setDarkMode(value: boolean) {
        const isDark = usePersistedState('is-dark', false);
        isDark.value = value;
    }

    return {
        isDark,
        setDarkMode
    }
}
