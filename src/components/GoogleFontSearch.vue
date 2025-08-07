<template>
  <div class="relative">
    <label class="theme-text text-sm font-medium block mb-2 theme-font">Font Family</label>
    
    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        @focus="showDropdown = true"
        :placeholder="selectedFont || 'Search Google Fonts...'"
        class="w-full theme-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 theme-font pr-10"
      />
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <svg v-if="isLoading" class="animate-spin h-4 w-4 theme-text" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="h-4 w-4 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="showDropdown && (searchResults.length > 0 || popularFonts.length > 0)"
      class="absolute z-50 w-full mt-2 theme-glass rounded-xl border max-h-64 overflow-y-auto shadow-lg"
    >
      <!-- Search Results -->
      <div v-if="searchQuery && searchResults.length > 0">
        <div class="px-3 py-2 text-xs theme-text-secondary theme-font border-b border-white/10">
          Search Results ({{ searchResults.length }})
        </div>
        <button
          v-for="font in searchResults.slice(0, 10)"
          :key="font.family"
          @click="selectFont(font)"
          class="w-full px-4 py-3 text-left theme-text hover:bg-white/10 theme-transition flex items-center justify-between group"
          :style="{ fontFamily: font.family }"
        >
          <div>
            <div class="font-medium">{{ font.family }}</div>
            <div class="text-xs theme-text-secondary">{{ font.category }} • {{ font.variants?.length || 0 }} variants</div>
          </div>
          <div class="opacity-0 group-hover:opacity-100 theme-transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- Popular Fonts -->
      <div v-else-if="!searchQuery">
        <div class="px-3 py-2 text-xs theme-text-secondary theme-font border-b border-white/10">
          Popular Fonts
        </div>
        <button
          v-for="font in popularFonts"
          :key="font.family"
          @click="selectFont(font)"
          class="w-full px-4 py-3 text-left theme-text hover:bg-white/10 theme-transition flex items-center justify-between group"
          :style="{ fontFamily: font.family }"
        >
          <div>
            <div class="font-medium">{{ font.family }}</div>
            <div class="text-xs theme-text-secondary">{{ font.category }}</div>
          </div>
          <div class="opacity-0 group-hover:opacity-100 theme-transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- No Results -->
      <div v-else-if="searchQuery && searchResults.length === 0 && !isLoading" class="px-4 py-6 text-center">
        <div class="theme-text-secondary text-sm theme-font">No fonts found</div>
        <div class="theme-text-secondary text-xs mt-1">Try a different search term</div>
      </div>
    </div>

    <!-- Font Preview -->
    <div v-if="selectedFont" class="mt-3 p-3 theme-glass rounded-xl">
      <div class="text-xs theme-text-secondary mb-2 theme-font">Preview:</div>
      <div 
        :style="{ fontFamily: selectedFont }" 
        class="theme-text text-lg theme-font"
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </div>

    <!-- Click outside to close -->
    <div 
      v-if="showDropdown" 
      @click="showDropdown = false" 
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface GoogleFont {
  family: string
  variants: string[]
  subsets: string[]
  version: string
  lastModified: string
  files: Record<string, string>
  category: string
}

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const selectedFont = ref(props.modelValue || '')
const showDropdown = ref(false)
const isLoading = ref(false)
const searchResults = ref<GoogleFont[]>([])
const allFonts = ref<GoogleFont[]>([])

// Popular fonts that are commonly used
const popularFonts = ref<GoogleFont[]>([
  { family: 'Inter', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Roboto', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Open Sans', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Lato', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Source Sans Pro', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Montserrat', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Poppins', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Nunito', category: 'sans-serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Playfair Display', category: 'serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
  { family: 'Merriweather', category: 'serif', variants: ['400'], subsets: ['latin'], version: 'v1', lastModified: '', files: {} },
])

const debounceTimeout = ref<number | null>(null)

// Load Google Fonts API data
const loadGoogleFonts = async () => {
  try {
    const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDummy&sort=popularity')
    if (response.ok) {
      const data = await response.json()
      allFonts.value = data.items || []
    }
  } catch (error) {
    console.log('Google Fonts API not available, using popular fonts only')
  }
}

const handleSearch = () => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  debounceTimeout.value = setTimeout(() => {
    performSearch()
  }, 300)
}

const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isLoading.value = true

  // Search in local fonts first (popular fonts)
  const localResults = popularFonts.value.filter(font =>
    font.family.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  // Search in Google Fonts if available
  const googleResults = allFonts.value.filter(font =>
    font.family.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 20)

  // Combine and deduplicate results
  const combined = [...localResults, ...googleResults]
  const unique = combined.filter((font, index, self) =>
    index === self.findIndex(f => f.family === font.family)
  )

  searchResults.value = unique.slice(0, 15)
  isLoading.value = false
}

const selectFont = (font: { family: string; category?: string }) => {
  selectedFont.value = font.family
  searchQuery.value = ''
  showDropdown.value = false
  
  // Load the font from Google Fonts
  loadGoogleFont(font.family)
  
  // Emit the selected font
  emit('update:modelValue', font.family)
}

const loadGoogleFont = (fontFamily: string) => {
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`)
  if (existingLink) return

  // Create link element for Google Fonts
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`
  document.head.appendChild(link)
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedFont.value = newValue
    loadGoogleFont(newValue)
  }
})

onMounted(() => {
  loadGoogleFonts()
  if (selectedFont.value) {
    loadGoogleFont(selectedFont.value)
  }
})
</script>
