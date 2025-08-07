export interface FontConfig {
  family: string
  weights: number[]
  fallback: string[]
}

export interface ColorConfig {
  primary: string
  secondary: string
  accent: string
  text: string
  textSecondary: string
  background: string
  surface: string
  border: string
  input: {
    background: string
    border: string
    text: string
    placeholder: string
    focus: string
  }
}

export interface BackgroundConfig {
  type: 'image' | 'gradient' | 'solid'
  value: string
  position?: string
  size?: string
  repeat?: string
  overlay?: {
    color: string
    opacity: number
  }
}

export interface ThemeConfig {
  id: string
  name: string
  description?: string
  font: FontConfig
  colors: ColorConfig
  background: BackgroundConfig
  glassmorphism: {
    blur: number
    opacity: number
    border: {
      width: number
      opacity: number
    }
  }
  animations: {
    enabled: boolean
    duration: number
  }
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  config: ThemeConfig
}

export interface ThemeAPI {
  getTheme(id: string): Promise<ThemeConfig>
  saveTheme(theme: ThemeConfig): Promise<void>
  listPresets(): Promise<ThemePreset[]>
  loadFromJSON(json: string): ThemeConfig
  exportToJSON(theme: ThemeConfig): string
}
