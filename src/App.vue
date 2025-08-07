<template>
  <div
    class="min-h-screen px-4 py-8 flex items-center justify-center relative overflow-hidden theme-transition"
    :style="backgroundStyle"
  >
    <!-- Settings Button -->
    <button
      @click="toggleSettings"
      class="fixed top-6 right-6 z-50 theme-button rounded-full p-3 shadow-lg"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        ></path>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        ></path>
      </svg>
    </button>

    <!-- Settings Panel -->
    <div
      v-if="showSettings"
      class="fixed top-20 right-6 z-40 theme-glass rounded-2xl p-6 shadow-xl w-96 max-h-[80vh] overflow-y-auto theme-transition"
    >
      <h3 class="theme-text text-lg font-medium mb-4 theme-font">Settings</h3>

      <div class="space-y-6">
        <!-- Theme Presets -->
        <div>
          <label class="theme-text text-sm font-medium block mb-3 theme-font">Theme Presets</label>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="preset in availablePresets"
              :key="preset.id"
              @click="selectThemePreset(preset.id)"
              :class="[
                'w-full theme-glass border rounded-xl px-4 py-3 theme-text text-sm theme-transition flex items-center justify-between theme-font',
                currentTheme?.id === preset.id
                  ? 'ring-2 ring-blue-400'
                  : 'hover:scale-[1.02]'
              ]"
            >
              <div class="text-left">
                <div class="font-medium">{{ preset.name }}</div>
                <div class="text-xs opacity-70">{{ preset.description }}</div>
              </div>
              <div v-if="currentTheme?.id === preset.id" class="text-blue-300">
                ✓
              </div>
            </button>
          </div>
        </div>

        <!-- Font Selection -->
        <div v-if="currentTheme">
          <label class="theme-text text-sm font-medium block mb-2 theme-font">Font Family</label>
          <select
            :value="currentTheme.font.family"
            @change="updateThemeProperty('font', { ...currentTheme.font, family: ($event.target as HTMLSelectElement).value })"
            class="w-full theme-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 theme-font"
          >
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Nunito">Nunito</option>
            <option value="Roboto">Roboto</option>
            <option value="Source Sans Pro">Source Sans Pro</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
          </select>
        </div>

        <!-- Color Customization -->
        <div v-if="currentTheme">
          <label class="theme-text text-sm font-medium block mb-3 theme-font">Colors</label>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="theme-text text-xs theme-font">Primary</label>
              <input
                type="color"
                :value="currentTheme.colors.primary"
                @input="updateThemeColor('primary', ($event.target as HTMLInputElement).value)"
                class="w-12 h-8 rounded border border-white/30"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="theme-text text-xs theme-font">Text Color</label>
              <input
                type="color"
                :value="currentTheme.colors.text"
                @input="updateThemeColor('text', ($event.target as HTMLInputElement).value)"
                class="w-12 h-8 rounded border border-white/30"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="theme-text text-xs theme-font">Input Background</label>
              <input
                type="color"
                :value="currentTheme.colors.input.background.replace(/rgba?\([^)]+\)/g, '#3b82f6')"
                @input="updateThemeColor('input.background', `rgba(${parseInt(($event.target as HTMLInputElement).value.slice(1, 3), 16)}, ${parseInt(($event.target as HTMLInputElement).value.slice(3, 5), 16)}, ${parseInt(($event.target as HTMLInputElement).value.slice(5, 7), 16)}, 0.2)`)"
                class="w-12 h-8 rounded border border-white/30"
              />
            </div>
          </div>
        </div>

        <!-- Background Settings -->
        <div v-if="currentTheme">
          <label class="theme-text text-sm font-medium block mb-3 theme-font">Background</label>
          <div class="space-y-3">
            <div>
              <label class="theme-text text-xs block mb-1 theme-font">Type</label>
              <select
                :value="currentTheme.background.type"
                @change="updateThemeProperty('background', { ...currentTheme.background, type: ($event.target as HTMLSelectElement).value as any })"
                class="w-full theme-input rounded-xl px-3 py-2 text-xs theme-font"
              >
                <option value="image">Image</option>
                <option value="gradient">Gradient</option>
                <option value="solid">Solid Color</option>
              </select>
            </div>
            <div>
              <label class="theme-text text-xs block mb-1 theme-font">
                {{ currentTheme.background.type === 'image' ? 'Image URL' : currentTheme.background.type === 'gradient' ? 'Gradient CSS' : 'Color' }}
              </label>
              <input
                type="text"
                :value="currentTheme.background.value"
                @input="updateThemeProperty('background', { ...currentTheme.background, value: ($event.target as HTMLInputElement).value })"
                :placeholder="currentTheme.background.type === 'image' ? 'https://...' : currentTheme.background.type === 'gradient' ? 'linear-gradient(...)' : '#ffffff'"
                class="w-full theme-input rounded-xl px-3 py-2 text-xs theme-font"
              />
            </div>
          </div>
        </div>

        <!-- Legacy Background Cycling -->
        <div>
          <label class="theme-text text-sm font-medium block mb-2 theme-font">Quick Backgrounds</label>
          <button
            @click="cycleBackground"
            class="w-full theme-button rounded-xl px-4 py-3 text-sm theme-transition flex items-center justify-center gap-2 theme-font"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
              ></path>
            </svg>
            Change Background
          </button>
          <p class="theme-text-secondary text-xs mt-1 theme-font">
            Current: {{ backgroundImages[currentBackgroundIndex].name }}
          </p>
        </div>

        <!-- Import/Export Theme -->
        <div>
          <label class="theme-text text-sm font-medium block mb-3 theme-font">Theme Management</label>
          <div class="space-y-2">
            <button
              @click="downloadCurrentTheme"
              class="w-full theme-button rounded-xl px-4 py-2 text-sm theme-transition flex items-center justify-center gap-2 theme-font"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export Theme
            </button>
            <div class="relative">
              <input
                type="file"
                accept=".json"
                @change="handleThemeFileUpload"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                class="w-full theme-button rounded-xl px-4 py-2 text-sm theme-transition flex items-center justify-center gap-2 theme-font"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                Import Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Click outside to close settings -->
    <div v-if="showSettings" @click="showSettings = false" class="fixed inset-0 z-30"></div>

    <div class="w-full max-w-2xl mx-auto space-y-6 relative z-10 pb-20">
      <!-- Business Description Section -->
      <div
        class="theme-glass rounded-3xl p-6 shadow-inner theme-transition hover:shadow-2xl hover:scale-[1.02]"
      >
        <h2 class="theme-text text-2xl font-normal text-left mb-6 theme-font">Business Description or Idea</h2>
        <div class="theme-glass p-6 min-h-[165px] theme-transition hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-400 focus-within:shadow-lg rounded-xl">
          <textarea
            v-model="businessDescription"
            placeholder="Describe your business or idea here"
            class="w-full h-full bg-transparent theme-text placeholder-gray-300 text-sm resize-none outline-none theme-transition theme-font"
            rows="6"
          ></textarea>
        </div>
      </div>

      <!-- Mood Scale Section -->
      <div
        class="theme-glass rounded-3xl p-6 shadow-inner theme-transition hover:shadow-2xl hover:scale-[1.02]"
      >
        <div class="mb-6">
          <h2 class="theme-text text-2xl font-normal text-left mb-2 theme-font">Mood Scale</h2>
          <p class="theme-text text-lg font-normal text-left theme-font">Mood Scale</p>
        </div>
        <div class="grid grid-cols-7 gap-4">
          <div
            v-for="mood in moods"
            :key="mood.value"
            @click="selectedMood = mood.value"
            :class="[
              'p-4 flex flex-col items-center gap-3 cursor-pointer theme-transition theme-hover active:scale-95',
              selectedMood === mood.value
                ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-transparent scale-102 shadow-lg shadow-blue-500/30 outline outline-2 outline-blue-300'
                : '',
            ]"
            class="theme-glass rounded-xl"
          >
            <div class="text-4xl">{{ mood.emoji }}</div>
            <div class="theme-text text-2xl font-normal theme-font">{{ mood.value }}</div>
          </div>
        </div>
      </div>

      <!-- Interests Section -->
      <div
        class="theme-glass rounded-3xl p-6 shadow-inner theme-transition hover:shadow-2xl hover:scale-[1.02]"
      >
        <div class="mb-6">
          <h2 class="theme-text text-2xl font-normal text-left mb-2 theme-font">Your Interests</h2>
          <p class="theme-text text-lg font-normal text-left theme-font">
            Pick all that apply and add any custom interest
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div
              v-for="interest in leftColumnInterests"
              :key="interest.name"
              @click="toggleInterest(interest.name)"
              :class="[
                'p-4 flex items-center gap-3 cursor-pointer theme-transition theme-hover active:scale-95',
                selectedInterests.includes(interest.name)
                  ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-transparent scale-102 shadow-lg shadow-blue-500/30 outline outline-2 outline-blue-300'
                  : '',
              ]"
              class="theme-glass rounded-xl"
            >
              <div class="text-4xl">{{ interest.emoji }}</div>
              <div class="theme-text text-xs font-normal text-left flex-1 theme-font">{{ interest.name }}</div>
            </div>
          </div>
          <div class="space-y-3">
            <div
              v-for="interest in rightColumnInterests"
              :key="interest.name"
              @click="toggleInterest(interest.name)"
              :class="[
                'p-4 flex items-center gap-3 cursor-pointer theme-transition theme-hover active:scale-95',
                selectedInterests.includes(interest.name)
                  ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-transparent scale-102 shadow-lg shadow-blue-500/30 outline outline-2 outline-blue-300'
                  : '',
              ]"
              class="theme-glass rounded-xl"
            >
              <div class="text-4xl">{{ interest.emoji }}</div>
              <div class="theme-text text-xs font-normal text-left flex-1 theme-font">{{ interest.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Footer with Continue Button -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 theme-glass border-t p-4 shadow-lg"
    >
      <div class="w-full max-w-2xl mx-auto flex justify-end">
        <button
          @click="handleContinue"
          class="theme-button rounded-3xl px-8 py-3 text-sm font-normal shadow-inner theme-font"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { themeApi } from '@/services/themeApi'

interface Mood {
  emoji: string
  value: number
}

interface Interest {
  emoji: string
  name: string
}

interface BackgroundImage {
  url: string
  name: string
}

const businessDescription = ref('')
const selectedMood = ref<number | null>(null)
const selectedInterests = ref<string[]>([])
const showSettings = ref(false)
const currentBackgroundIndex = ref(1)
const showThemeSettings = ref(false)

// Theme system
const {
  currentTheme,
  availablePresets,
  isLoading: themeLoading,
  backgroundStyle: themeBackgroundStyle,
  fontStyle,
  loadTheme,
  setTheme,
  updateThemeProperty,
  updateThemeColor,
  exportTheme,
  importTheme,
  setAvailablePresets
} = useTheme()

const backgroundImages: BackgroundImage[] = [
  { url: '', name: 'Default Gradient' },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    name: 'Mountain Lake',
  },
  {
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
    name: 'Forest Path',
  },
  {
    url: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=1920&h=1080&fit=crop',
    name: 'Ocean Sunset',
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
    name: 'Desert Canyon',
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
    name: 'Aurora Borealis',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    name: 'Starry Night',
  },
  {
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop',
    name: 'City Lights',
  },
]

// Legacy background style (now handled by theme system)
const backgroundStyle = computed(() => {
  // Use theme background if available, otherwise fallback to legacy
  if (currentTheme.value) {
    return themeBackgroundStyle.value
  }

  const currentBg = backgroundImages[currentBackgroundIndex.value]
  if (currentBg.url) {
    return {
      backgroundImage: `url('${currentBg.url}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return {
    background: 'linear-gradient(to bottom right, rgb(241 245 249), rgb(226 232 240))',
  }
})

const moods: Mood[] = [
  { emoji: '😟', value: 1 },
  { emoji: '😁', value: 2 },
  { emoji: '🤩', value: 3 },
  { emoji: '🥳', value: 4 },
  { emoji: '😌', value: 5 },
  { emoji: '😐', value: 6 },
  { emoji: '🙂', value: 7 },
]

const leftColumnInterests: Interest[] = [
  { emoji: '🍎', name: 'Healthy Eating' },
  { emoji: '🚴‍♂️', name: 'Cycling for Fitness' },
  { emoji: '🧘‍♀️', name: 'Mindfulness Practices' },
  { emoji: '🎮', name: 'Video Game Trends' },
]

const rightColumnInterests: Interest[] = [
  { emoji: '📚', name: 'Reading Habits' },
  { emoji: '🎭', name: 'Creative Arts' },
  { emoji: '🌱', name: 'Sustainable Living' },
  { emoji: '🏡', name: 'Home Gardening' },
]

function toggleInterest(interestName: string) {
  const index = selectedInterests.value.indexOf(interestName)
  if (index > -1) {
    selectedInterests.value.splice(index, 1)
  } else {
    selectedInterests.value.push(interestName)
  }
}

function toggleSettings() {
  showSettings.value = !showSettings.value
}

function cycleBackground() {
  currentBackgroundIndex.value = (currentBackgroundIndex.value + 1) % backgroundImages.length
}

function handleContinue() {
  console.log('Form data:', {
    businessDescription: businessDescription.value,
    selectedMood: selectedMood.value,
    selectedInterests: selectedInterests.value,
  })
  // Handle form submission logic here
}

// Theme management functions
function toggleThemeSettings() {
  showThemeSettings.value = !showThemeSettings.value
}

function selectThemePreset(presetId: string) {
  const preset = availablePresets.value.find(p => p.id === presetId)
  if (preset) {
    setTheme(preset.config)
  }
}

function downloadCurrentTheme() {
  if (currentTheme.value) {
    themeApi.downloadTheme(currentTheme.value)
  }
}

function handleThemeFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    themeApi.loadThemeFromFile(file)
      .then(theme => {
        setTheme(theme)
        target.value = '' // Reset file input
      })
      .catch(error => {
        console.error('Failed to load theme:', error)
        alert('Failed to load theme file. Please check the file format.')
      })
  }
}

// Initialize theme system
onMounted(async () => {
  try {
    // Load available presets
    const presets = await themeApi.listPresets()
    setAvailablePresets(presets)
    
    // Load theme (from localStorage or default)
    await loadTheme()
  } catch (error) {
    console.error('Failed to initialize theme system:', error)
  }
})
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
