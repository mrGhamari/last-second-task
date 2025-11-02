export type BsTheme = 'light' | 'dark'

const STORAGE_KEY = 'bs-theme'

export function useTheme() {
  const theme = useState<BsTheme>('bs-theme', () => 'light')

  const setTheme = (value: BsTheme) => {
    theme.value = value
    if (process.client) {
      document.documentElement.setAttribute('data-bs-theme', value)
      try { localStorage.setItem(STORAGE_KEY, value) } catch (_) { /* ignore */ }
    }
  }

  const toggleTheme = () => setTheme(theme.value === 'dark' ? 'light' as BsTheme : 'dark' as BsTheme)

  const initTheme = () => {
    if (!process.client) return
    try {
      const pref = localStorage.getItem(STORAGE_KEY) as BsTheme | null
      const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(pref || (systemDark ? 'dark' : 'light'))
    } catch (_) {
      setTheme('light')
    }
  }

  return { theme, setTheme, toggleTheme, initTheme }
}

