import { ref, computed, watch } from 'vue'
import type { ThemeConfig, ThemePreset } from '@/types/theme'

const currentTheme = ref<ThemeConfig | null>(null)
const availablePresets = ref<ThemePreset[]>([])
const isLoading = ref(false)

export function useTheme() {
  const setTheme = (theme: ThemeConfig) => {
    currentTheme.value = theme
    applyThemeToDOM(theme)
    // Save to localStorage for persistence
    localStorage.setItem('app-theme', JSON.stringify(theme))
  }

  const loadTheme = async (themeId?: string) => {
    isLoading.value = true
    try {
      let theme: ThemeConfig

      if (themeId) {
        // Load specific theme from API or presets
        const preset = availablePresets.value.find(p => p.id === themeId)
        if (preset) {
          theme = preset.config
        } else {
          // Fallback to default theme
          theme = await getDefaultTheme()
        }
      } else {
        // Try to load from localStorage first
        const savedTheme = localStorage.getItem('app-theme')
        if (savedTheme) {
          theme = JSON.parse(savedTheme)
        } else {
          theme = await getDefaultTheme()
        }
      }

      setTheme(theme)
    } catch (error) {
      console.error('Failed to load theme:', error)
      // Load default theme as fallback
      const defaultTheme = await getDefaultTheme()
      setTheme(defaultTheme)
    } finally {
      isLoading.value = false
    }
  }

  const updateThemeProperty = <K extends keyof ThemeConfig>(
    property: K,
    value: ThemeConfig[K]
  ) => {
    if (currentTheme.value) {
      currentTheme.value = {
        ...currentTheme.value,
        [property]: value
      }
      applyThemeToDOM(currentTheme.value)
      // Save updated theme
      localStorage.setItem('app-theme', JSON.stringify(currentTheme.value))
    }
  }

  const updateThemeColor = (colorPath: string, value: string) => {
    if (currentTheme.value) {
      const pathArray = colorPath.split('.')
      let target: any = currentTheme.value.colors
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        target = target[pathArray[i]]
      }
      
      target[pathArray[pathArray.length - 1]] = value
      applyThemeToDOM(currentTheme.value)
      localStorage.setItem('app-theme', JSON.stringify(currentTheme.value))
    }
  }

  const applyThemeToDOM = (theme: ThemeConfig) => {
    const root = document.documentElement

    // Apply CSS custom properties
    root.style.setProperty('--theme-font-family', `${theme.font.family}, ${theme.font.fallback.join(', ')}`)
    root.style.setProperty('--theme-color-section', theme.colors.section)
    root.style.setProperty('--theme-color-secondary', theme.colors.secondary)
    root.style.setProperty('--theme-color-accent', theme.colors.accent)
    root.style.setProperty('--theme-color-text', theme.colors.text)
    root.style.setProperty('--theme-color-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--theme-color-background', theme.colors.background)
    root.style.setProperty('--theme-color-surface', theme.colors.surface)
    root.style.setProperty('--theme-color-border', theme.colors.border)
    
    // Input colors
    root.style.setProperty('--theme-input-background', theme.colors.input.background)
    root.style.setProperty('--theme-input-border', theme.colors.input.border)
    root.style.setProperty('--theme-input-text', theme.colors.input.text)
    root.style.setProperty('--theme-input-placeholder', theme.colors.input.placeholder)
    root.style.setProperty('--theme-input-focus', theme.colors.input.focus)
    
    // Glassmorphism
    root.style.setProperty('--theme-glass-blur', `${theme.glassmorphism.blur}px`)
    root.style.setProperty('--theme-glass-opacity', theme.glassmorphism.opacity.toString())
    root.style.setProperty('--theme-glass-border-width', `${theme.glassmorphism.border.width}px`)
    root.style.setProperty('--theme-glass-border-opacity', theme.glassmorphism.border.opacity.toString())
    
    // Animation duration
    root.style.setProperty('--theme-animation-duration', `${theme.animations.duration}ms`)

    // Load Google Fonts if needed
    loadGoogleFont(theme.font.family)
  }

  const loadGoogleFont = (fontFamily: string) => {
    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${fontFamily.replace(' ', '+')}"]`)
    if (existingLink) return

    // Create link element for Google Fonts
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`
    document.head.appendChild(link)
  }

  const exportTheme = () => {
    if (currentTheme.value) {
      return JSON.stringify(currentTheme.value, null, 2)
    }
    return null
  }

  const importTheme = (jsonString: string) => {
    try {
      const theme = JSON.parse(jsonString) as ThemeConfig
      setTheme(theme)
      return true
    } catch (error) {
      console.error('Failed to import theme:', error)
      return false
    }
  }

  // Computed properties for easy access
  const backgroundStyle = computed(() => {
    if (!currentTheme.value) return {}

    const bg = currentTheme.value.background
    const style: Record<string, string> = {}

    switch (bg.type) {
      case 'image':
        style.backgroundImage = `url('${bg.value}')`
        style.backgroundSize = bg.size || 'cover'
        style.backgroundPosition = bg.position || 'center'
        style.backgroundRepeat = bg.repeat || 'no-repeat'
        
        if (bg.overlay) {
          style.background = `linear-gradient(${bg.overlay.color}${Math.round(bg.overlay.opacity * 255).toString(16)}, ${bg.overlay.color}${Math.round(bg.overlay.opacity * 255).toString(16)}), url('${bg.value}')`
        }
        break
      
      case 'gradient':
        style.background = bg.value
        break
      
      case 'solid':
        style.backgroundColor = bg.value
        break
    }

    return style
  })

  const fontStyle = computed(() => {
    if (!currentTheme.value) return {}
    return {
      fontFamily: `${currentTheme.value.font.family}, ${currentTheme.value.font.fallback.join(', ')}`
    }
  })

  return {
    currentTheme: computed(() => currentTheme.value),
    availablePresets: computed(() => availablePresets.value),
    isLoading: computed(() => isLoading.value),
    backgroundStyle,
    fontStyle,
    setTheme,
    loadTheme,
    updateThemeProperty,
    updateThemeColor,
    exportTheme,
    importTheme,
    setAvailablePresets: (presets: ThemePreset[]) => {
      availablePresets.value = presets
    }
  }
}

async function getDefaultTheme(): Promise<ThemeConfig> {
  // This could be loaded from an API or local JSON file
  return {
    id: 'default',
    name: 'Default Theme',
    description: 'Default application theme',
    font: {
      family: 'Inter',
      weights: [300, 400, 500, 600, 700],
      fallback: ['system-ui', 'sans-serif']
    },
    colors: {
      section: 'rgba(59, 130, 246, 0.15)',
      secondary: '#64748b',
      accent: '#06b6d4',
      text: '#ffffff',
      textSecondary: '#e2e8f0',
      background: '#0f172a',
      surface: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      input: {
        background: 'rgba(59, 130, 246, 0.2)',
        border: 'rgba(255, 255, 255, 0.3)',
        text: '#ffffff',
        placeholder: '#d1d5db',
        focus: '#3b82f6'
      }
    },
    background: {
      type: 'image',
      value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      position: 'center',
      size: 'cover',
      repeat: 'no-repeat'
    },
    glassmorphism: {
      blur: 12,
      opacity: 0.1,
      border: {
        width: 1,
        opacity: 0.2
      }
    },
    animations: {
      enabled: true,
      duration: 300
    }
  }
}
