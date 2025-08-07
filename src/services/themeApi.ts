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
      const response = await fetch(`${this.baseUrl}/${theme.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to save theme: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error saving theme:', error)
      // Fallback to local storage
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
      const theme = JSON.parse(json) as ThemeConfig
      this.validateThemeConfig(theme)
      return theme
    } catch (error) {
      throw new Error('Invalid JSON format or theme configuration')
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
    if (!theme.id || !theme.name || !theme.font || !theme.colors || !theme.background) {
      throw new Error('Invalid theme configuration: missing required properties')
    }
  }

  private getDefaultPresets(): ThemePreset[] {
    return [
      {
        id: 'default',
        name: 'Default Theme',
        description: 'Default blue theme with glassmorphism',
        config: {
          id: 'default',
          name: 'Default Theme',
          description: 'Default blue theme with glassmorphism',
          font: {
            family: 'Inter',
            weights: [300, 400, 500, 600, 700],
            fallback: ['system-ui', 'sans-serif']
          },
          colors: {
            primary: '#3b82f6',
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
      },
      {
        id: 'dark-purple',
        name: 'Dark Purple',
        description: 'Dark theme with purple accents',
        config: {
          id: 'dark-purple',
          name: 'Dark Purple',
          description: 'Dark theme with purple accents',
          font: {
            family: 'Poppins',
            weights: [300, 400, 500, 600, 700],
            fallback: ['system-ui', 'sans-serif']
          },
          colors: {
            primary: '#8b5cf6',
            secondary: '#6366f1',
            accent: '#a855f7',
            text: '#ffffff',
            textSecondary: '#e2e8f0',
            background: '#1e1b4b',
            surface: 'rgba(139, 92, 246, 0.1)',
            border: 'rgba(139, 92, 246, 0.3)',
            input: {
              background: 'rgba(139, 92, 246, 0.2)',
              border: 'rgba(139, 92, 246, 0.4)',
              text: '#ffffff',
              placeholder: '#c4b5fd',
              focus: '#8b5cf6'
            }
          },
          background: {
            type: 'gradient',
            value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          },
          glassmorphism: {
            blur: 16,
            opacity: 0.15,
            border: {
              width: 1,
              opacity: 0.3
            }
          },
          animations: {
            enabled: true,
            duration: 400
          }
        }
      },
      {
        id: 'forest-green',
        name: 'Forest Green',
        description: 'Natural green theme with forest background',
        config: {
          id: 'forest-green',
          name: 'Forest Green',
          description: 'Natural green theme with forest background',
          font: {
            family: 'Nunito',
            weights: [300, 400, 500, 600, 700],
            fallback: ['system-ui', 'sans-serif']
          },
          colors: {
            primary: '#059669',
            secondary: '#10b981',
            accent: '#34d399',
            text: '#ffffff',
            textSecondary: '#d1fae5',
            background: '#064e3b',
            surface: 'rgba(5, 150, 105, 0.1)',
            border: 'rgba(5, 150, 105, 0.3)',
            input: {
              background: 'rgba(5, 150, 105, 0.2)',
              border: 'rgba(5, 150, 105, 0.4)',
              text: '#ffffff',
              placeholder: '#a7f3d0',
              focus: '#059669'
            }
          },
          background: {
            type: 'image',
            value: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
            position: 'center',
            size: 'cover',
            repeat: 'no-repeat'
          },
          glassmorphism: {
            blur: 10,
            opacity: 0.12,
            border: {
              width: 1,
              opacity: 0.25
            }
          },
          animations: {
            enabled: true,
            duration: 350
          }
        }
      }
    ]
  }

  // Utility methods for theme management
  async loadThemeFromFile(file: File): Promise<ThemeConfig> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const theme = this.loadFromJSON(content)
          resolve(theme)
        } catch (error) {
          reject(error)
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
