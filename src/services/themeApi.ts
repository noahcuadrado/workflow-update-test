import type { ThemeConfig, ThemePreset, ThemeAPI } from '@/types/theme'

class ThemeApiService implements ThemeAPI {
  private baseUrl: string
  private storageKey = 'theme-presets'

  constructor(baseUrl: string = '/api/themes') {
    this.baseUrl = baseUrl
  }

  async getTheme(id: string): Promise<ThemeConfig> {
    try {
      // Try to load from local JSON file first
      const response = await fetch(`/themes/${id}.json`)
      if (response.ok) {
        const text = await response.text()
        if (text.trim()) {
          return JSON.parse(text)
        }
      }

      // If that fails, try the API endpoint
      const apiResponse = await fetch(`${this.baseUrl}/${id}`)
      if (apiResponse.ok) {
        const apiText = await apiResponse.text()
        if (apiText.trim()) {
          return JSON.parse(apiText)
        }
      }

      throw new Error(`Theme ${id} not found`)
    } catch (error) {
      console.error('Error fetching theme:', error)
      // Fallback to local storage or default
      return this.getLocalTheme(id)
    }
  }

  async saveTheme(theme: ThemeConfig): Promise<void> {
    try {
      // Try API first (this will likely fail in frontend-only environment)
      const response = await fetch(`${this.baseUrl}/${theme.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
      })

      if (!response.ok) {
        throw new Error(`API save failed: ${response.statusText}`)
      }

      console.log('Theme saved to API successfully')
    } catch (error) {
      console.log('API save failed, using local storage fallback:', error instanceof Error ? error.message : 'Unknown error')
      // Always fallback to local storage (expected behavior for frontend-only app)
      this.saveLocalTheme(theme)
    }
  }

  async listPresets(): Promise<ThemePreset[]> {
    try {
      // Try to load from local JSON file first (since this is a frontend-only app)
      const response = await fetch('/themes/presets.json')
      if (response.ok) {
        const text = await response.text()
        if (text.trim()) {
          return JSON.parse(text)
        }
      }

      // If that fails, try the API endpoint
      const apiResponse = await fetch(`${this.baseUrl}/presets`)
      if (apiResponse.ok) {
        const apiText = await apiResponse.text()
        if (apiText.trim()) {
          return JSON.parse(apiText)
        }
      }

      throw new Error('No valid preset data found')
    } catch (error) {
      console.error('Error fetching presets:', error)
      // Return local presets as fallback
      return this.getLocalPresets()
    }
  }

  loadFromJSON(json: string): ThemeConfig {
    try {
      if (!json || json.trim() === '') {
        throw new Error('Empty JSON content')
      }

      let parsed = JSON.parse(json)

      // Handle theme preset format (with config property)
      if (parsed.config && !parsed.id) {
        console.log('Detected theme preset format, extracting config')
        parsed = parsed.config
      }

      // Handle array of presets (take first one)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Detected array of presets, taking first one')
        parsed = parsed[0].config || parsed[0]
      }

      const theme = parsed as ThemeConfig

      // Add missing glassmorphism if not present (for backward compatibility)
      if (!theme.glassmorphism) {
        theme.glassmorphism = {
          blur: 12,
          opacity: 0.1,
          border: {
            width: 1,
            opacity: 0.2
          }
        }
      }

      // Add missing animations if not present
      if (!theme.animations) {
        theme.animations = {
          enabled: true,
          duration: 300
        }
      }

      this.validateThemeConfig(theme)
      return theme
    } catch (error) {
      console.error('JSON parsing error:', error)
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`)
      } else {
        throw new Error(`Theme validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  exportToJSON(theme: ThemeConfig): string {
    return JSON.stringify(theme, null, 2)
  }

  // Local storage fallback methods
  private getLocalTheme(id: string): ThemeConfig {
    const presets = this.getLocalPresets()
    const preset = presets.find(p => p.id === id)
    if (preset) {
      return preset.config
    }
    throw new Error(`Theme ${id} not found`)
  }

  private saveLocalTheme(theme: ThemeConfig): void {
    const presets = this.getLocalPresets()
    const existingIndex = presets.findIndex(p => p.id === theme.id)
    
    const preset: ThemePreset = {
      id: theme.id,
      name: theme.name,
      description: theme.description || '',
      config: theme
    }

    if (existingIndex >= 0) {
      presets[existingIndex] = preset
    } else {
      presets.push(preset)
    }

    localStorage.setItem(this.storageKey, JSON.stringify(presets))
  }

  private getLocalPresets(): ThemePreset[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading local presets:', error)
    }
    return this.getDefaultPresets()
  }

  private validateThemeConfig(theme: any): void {
    console.log('Validating theme config:', theme)

    if (!theme || typeof theme !== 'object') {
      throw new Error('Theme must be a valid object')
    }

    // More flexible validation - only check critical properties
    const criticalProps = ['id', 'name', 'colors']
    const missingCritical: string[] = []

    for (const prop of criticalProps) {
      if (!theme[prop]) {
        missingCritical.push(prop)
      }
    }

    if (missingCritical.length > 0) {
      throw new Error(`Missing critical properties: ${missingCritical.join(', ')}`)
    }

    // Validate and fix font structure
    if (!theme.font || typeof theme.font !== 'object') {
      console.log('Adding missing font configuration')
      theme.font = {
        family: 'Inter',
        weights: [300, 400, 500, 600, 700],
        fallback: ['system-ui', 'sans-serif']
      }
    }
    if (!theme.font.family) {
      theme.font.family = 'Inter'
    }
    if (!theme.font.fallback) {
      theme.font.fallback = ['system-ui', 'sans-serif']
    }

    // Validate and fix colors structure
    if (!theme.colors || typeof theme.colors !== 'object') {
      throw new Error('Colors configuration must be an object')
    }

    // Handle migration from old 'primary' to new 'section' color
    if (theme.colors.primary && !theme.colors.section) {
      console.log('Migrating primary color to section color')
      theme.colors.section = theme.colors.primary
      delete theme.colors.primary
    }

    // Ensure required colors exist with defaults
    if (!theme.colors.section) {
      theme.colors.section = 'rgba(59, 130, 246, 0.15)'
    }
    if (!theme.colors.text) {
      theme.colors.text = '#ffffff'
    }
    if (!theme.colors.input || typeof theme.colors.input !== 'object') {
      theme.colors.input = {
        background: 'rgba(59, 130, 246, 0.2)',
        border: 'rgba(255, 255, 255, 0.3)',
        text: '#ffffff',
        placeholder: '#d1d5db',
        focus: '#3b82f6'
      }
    }

    // Add missing color properties with defaults
    if (!theme.colors.textSecondary) theme.colors.textSecondary = '#e2e8f0'
    if (!theme.colors.background) theme.colors.background = '#0f172a'
    if (!theme.colors.surface) theme.colors.surface = 'rgba(255, 255, 255, 0.1)'
    if (!theme.colors.border) theme.colors.border = 'rgba(255, 255, 255, 0.2)'

    // Validate and fix background structure
    if (!theme.background || typeof theme.background !== 'object') {
      console.log('Adding missing background configuration')
      theme.background = {
        type: 'image',
        value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
      }
    }
    if (!theme.background.type) theme.background.type = 'image'
    if (!theme.background.value) {
      theme.background.value = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
    }

    console.log('Theme validation and migration completed')
  }

  private getDefaultPresets(): ThemePreset[] {
    return [
      {
        id: 'glassmorphism',
        name: 'Glassmorphism',
        description: 'Modern glass effect with vibrant background',
        config: {
          id: 'glassmorphism',
          name: 'Glassmorphism',
          description: 'Modern glass effect with vibrant background',
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
            blur: 16,
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
      },
      {
        id: 'flat',
        name: 'Flat',
        description: 'Clean flat design with solid colors',
        config: {
          id: 'flat',
          name: 'Flat',
          description: 'Clean flat design with solid colors',
          font: {
            family: 'Source Sans Pro',
            weights: [300, 400, 500, 600, 700],
            fallback: ['system-ui', 'sans-serif']
          },
          colors: {
            section: '#ffffff',
            secondary: '#475569',
            accent: '#0891b2',
            text: '#1e293b',
            textSecondary: '#64748b',
            background: '#f8fafc',
            surface: '#ffffff',
            border: '#e2e8f0',
            input: {
              background: '#ffffff',
              border: '#d1d5db',
              text: '#1e293b',
              placeholder: '#9ca3af',
              focus: '#2563eb'
            }
          },
          background: {
            type: 'solid',
            value: '#f1f5f9'
          },
          glassmorphism: {
            blur: 0,
            opacity: 1.0,
            border: {
              width: 1,
              opacity: 1.0
            }
          },
          animations: {
            enabled: true,
            duration: 200
          }
        }
      }
    ]
  }

  // Utility methods for theme management
  async loadThemeFromFile(file: File): Promise<ThemeConfig> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'))
        return
      }

      if (!file.name.endsWith('.json')) {
        reject(new Error('Please select a JSON file'))
        return
      }

      if (file.size > 1024 * 1024) { // 1MB limit
        reject(new Error('File too large (max 1MB)'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          if (!content) {
            reject(new Error('File appears to be empty'))
            return
          }

          const theme = this.loadFromJSON(content)
          resolve(theme)
        } catch (error) {
          console.error('Error loading theme from file:', error)
          reject(new Error(`Failed to load theme: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  downloadTheme(theme: ThemeConfig, filename?: string): void {
    const json = this.exportToJSON(theme)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `${theme.id}-theme.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const themeApi = new ThemeApiService()
