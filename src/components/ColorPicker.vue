<template>
  <div class="relative">
    <label v-if="label" class="theme-text text-xs block mb-1 theme-font">{{ label }}</label>
    
    <!-- Color Display Button -->
    <button
      @click="togglePicker"
      class="relative w-full h-10 rounded-lg border-2 theme-border theme-transition hover:scale-105 focus:ring-2 focus:ring-blue-400 focus:outline-none overflow-hidden"
      :style="{ backgroundColor: modelValue }"
    >
      <!-- Checkerboard pattern for transparency -->
      <div class="absolute inset-0 opacity-20">
        <div class="w-full h-full" style="background-image: repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px;"></div>
      </div>
      
      <!-- Color overlay -->
      <div class="absolute inset-0" :style="{ backgroundColor: modelValue }"></div>
      
      <!-- Color value text -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs font-mono text-white mix-blend-difference px-2 py-1 rounded bg-black/20">
          {{ displayValue }}
        </span>
      </div>
    </button>

    <!-- Color Picker Dropdown -->
    <div
      v-if="showPicker"
      class="absolute z-50 mt-2 p-4 theme-glass rounded-xl border shadow-xl"
      :class="position === 'left' ? 'right-0' : 'left-0'"
      style="width: 280px;"
    >
      <!-- Color Palette -->
      <div class="relative mb-4">
        <!-- Main color area -->
        <div
          ref="colorArea"
          @mousedown="startColorDrag"
          class="relative w-full h-32 rounded-lg cursor-crosshair overflow-hidden"
          :style="{ backgroundColor: `hsl(${hue}, 100%, 50%)` }"
        >
          <!-- White gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
          <!-- Black gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          
          <!-- Color selector dot -->
          <div
            class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg transform -translate-x-2 -translate-y-2 pointer-events-none"
            :style="{ left: `${saturation}%`, top: `${100 - lightness}%` }"
          ></div>
        </div>

        <!-- Hue slider -->
        <div class="mt-3 relative">
          <div
            ref="hueSlider"
            @mousedown="startHueDrag"
            class="w-full h-6 rounded-full cursor-pointer overflow-hidden"
            style="background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
          >
            <!-- Hue selector -->
            <div
              class="absolute top-0 w-4 h-6 border-2 border-white rounded-full shadow-lg transform -translate-x-2 pointer-events-none"
              :style="{ left: `${(hue / 360) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Alpha slider -->
        <div class="mt-3 relative">
          <div
            ref="alphaSlider"
            @mousedown="startAlphaDrag"
            class="w-full h-6 rounded-full cursor-pointer overflow-hidden relative"
          >
            <!-- Checkerboard background -->
            <div class="absolute inset-0 rounded-full" style="background-image: repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 10px 10px;"></div>
            <!-- Alpha gradient -->
            <div
              class="absolute inset-0 rounded-full"
              :style="{ background: `linear-gradient(to right, transparent 0%, ${currentColorWithoutAlpha} 100%)` }"
            ></div>
            
            <!-- Alpha selector -->
            <div
              class="absolute top-0 w-4 h-6 border-2 border-white rounded-full shadow-lg transform -translate-x-2 pointer-events-none"
              :style="{ left: `${alpha * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Preset Colors -->
      <div class="mb-4">
        <div class="text-xs theme-text-secondary mb-2 theme-font">Preset Colors</div>
        <div class="grid grid-cols-8 gap-2">
          <button
            v-for="preset in presetColors"
            :key="preset"
            @click="selectPresetColor(preset)"
            class="w-8 h-8 rounded-lg border theme-border hover:scale-110 theme-transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
            :style="{ backgroundColor: preset }"
          ></button>
        </div>
      </div>

      <!-- Input Fields -->
      <div class="space-y-2">
        <!-- Hex Input -->
        <div class="flex items-center gap-2">
          <label class="text-xs theme-text theme-font w-12">HEX</label>
          <input
            v-model="hexInput"
            @input="updateFromHex"
            class="flex-1 px-2 py-1 text-xs theme-input rounded font-mono"
            placeholder="#000000"
          />
        </div>

        <!-- RGB Inputs -->
        <div class="flex items-center gap-2">
          <label class="text-xs theme-text theme-font w-12">RGB</label>
          <input
            v-model.number="rgb.r"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            class="flex-1 px-2 py-1 text-xs theme-input rounded"
          />
          <input
            v-model.number="rgb.g"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            class="flex-1 px-2 py-1 text-xs theme-input rounded"
          />
          <input
            v-model.number="rgb.b"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            class="flex-1 px-2 py-1 text-xs theme-input rounded"
          />
        </div>

        <!-- Alpha Input -->
        <div class="flex items-center gap-2">
          <label class="text-xs theme-text theme-font w-12">Alpha</label>
          <input
            v-model.number="alphaPercent"
            @input="updateFromAlphaPercent"
            type="number"
            min="0"
            max="100"
            class="flex-1 px-2 py-1 text-xs theme-input rounded"
          />
          <span class="text-xs theme-text-secondary">%</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-4">
        <button
          @click="copyToClipboard"
          class="flex-1 px-3 py-2 text-xs theme-button rounded-lg flex items-center justify-center gap-1"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Copy
        </button>
        <button
          @click="closePicker"
          class="flex-1 px-3 py-2 text-xs theme-button rounded-lg"
        >
          Done
        </button>
      </div>
    </div>

    <!-- Click outside to close -->
    <div v-if="showPicker" @click="closePicker" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  modelValue: string
  label?: string
  position?: 'left' | 'right'
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  position: 'left'
})
const emit = defineEmits<Emits>()

const showPicker = ref(false)
const colorArea = ref<HTMLElement>()
const hueSlider = ref<HTMLElement>()
const alphaSlider = ref<HTMLElement>()

// Color state
const hue = ref(0)
const saturation = ref(100)
const lightness = ref(50)
const alpha = ref(1)

// Input states
const hexInput = ref('')
const rgb = ref({ r: 0, g: 0, b: 0 })
const alphaPercent = ref(100)

// Dragging states
const isDraggingColor = ref(false)
const isDraggingHue = ref(false)
const isDraggingAlpha = ref(false)

const presetColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#808080', '#c0c0c0', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'
]

const currentColorWithoutAlpha = computed(() => {
  const { r, g, b } = rgb.value
  return `rgb(${r}, ${g}, ${b})`
})

const displayValue = computed(() => {
  if (alpha.value < 1) {
    return `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, ${alpha.value.toFixed(2)})`
  }
  return rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
})

// Convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number) => {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

// Convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Convert Hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Update RGB from HSL
const updateRgbFromHsl = () => {
  rgb.value = hslToRgb(hue.value, saturation.value, lightness.value)
  hexInput.value = rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
  alphaPercent.value = Math.round(alpha.value * 100)
  emitColor()
}

// Update from RGB inputs
const updateFromRGB = () => {
  const hsl = rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b)
  hue.value = hsl.h
  saturation.value = hsl.s
  lightness.value = hsl.l
  hexInput.value = rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
  emitColor()
}

// Update from hex input
const updateFromHex = () => {
  const rgbResult = hexToRgb(hexInput.value)
  if (rgbResult) {
    rgb.value = rgbResult
    const hsl = rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b)
    hue.value = hsl.h
    saturation.value = hsl.s
    lightness.value = hsl.l
    emitColor()
  }
}

// Update from alpha percent
const updateFromAlphaPercent = () => {
  alpha.value = alphaPercent.value / 100
  emitColor()
}

// Emit color change
const emitColor = () => {
  const colorValue = alpha.value < 1 
    ? `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, ${alpha.value})`
    : rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
  
  emit('update:modelValue', colorValue)
}

// Color area dragging
const startColorDrag = (e: MouseEvent) => {
  isDraggingColor.value = true
  updateColorFromMouse(e)
  document.addEventListener('mousemove', updateColorFromMouse)
  document.addEventListener('mouseup', stopColorDrag)
}

const updateColorFromMouse = (e: MouseEvent) => {
  if (!isDraggingColor.value || !colorArea.value) return
  
  const rect = colorArea.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
  
  saturation.value = x * 100
  lightness.value = (1 - y) * 100
  updateRgbFromHsl()
}

const stopColorDrag = () => {
  isDraggingColor.value = false
  document.removeEventListener('mousemove', updateColorFromMouse)
  document.removeEventListener('mouseup', stopColorDrag)
}

// Hue slider dragging
const startHueDrag = (e: MouseEvent) => {
  isDraggingHue.value = true
  updateHueFromMouse(e)
  document.addEventListener('mousemove', updateHueFromMouse)
  document.addEventListener('mouseup', stopHueDrag)
}

const updateHueFromMouse = (e: MouseEvent) => {
  if (!isDraggingHue.value || !hueSlider.value) return
  
  const rect = hueSlider.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  hue.value = x * 360
  updateRgbFromHsl()
}

const stopHueDrag = () => {
  isDraggingHue.value = false
  document.removeEventListener('mousemove', updateHueFromMouse)
  document.removeEventListener('mouseup', stopHueDrag)
}

// Alpha slider dragging
const startAlphaDrag = (e: MouseEvent) => {
  isDraggingAlpha.value = true
  updateAlphaFromMouse(e)
  document.addEventListener('mousemove', updateAlphaFromMouse)
  document.addEventListener('mouseup', stopAlphaDrag)
}

const updateAlphaFromMouse = (e: MouseEvent) => {
  if (!isDraggingAlpha.value || !alphaSlider.value) return
  
  const rect = alphaSlider.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  alpha.value = x
  alphaPercent.value = Math.round(x * 100)
  emitColor()
}

const stopAlphaDrag = () => {
  isDraggingAlpha.value = false
  document.removeEventListener('mousemove', updateAlphaFromMouse)
  document.removeEventListener('mouseup', stopAlphaDrag)
}

// Preset color selection
const selectPresetColor = (color: string) => {
  const rgbResult = hexToRgb(color)
  if (rgbResult) {
    rgb.value = rgbResult
    const hsl = rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b)
    hue.value = hsl.h
    saturation.value = hsl.s
    lightness.value = hsl.l
    hexInput.value = color
    alpha.value = 1
    alphaPercent.value = 100
    emitColor()
  }
}

// Initialize from prop value
const initializeFromProp = (value: string) => {
  if (value.startsWith('rgba')) {
    const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (match) {
      rgb.value = {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      }
      alpha.value = match[4] ? parseFloat(match[4]) : 1
    }
  } else if (value.startsWith('#')) {
    const rgbResult = hexToRgb(value)
    if (rgbResult) {
      rgb.value = rgbResult
      alpha.value = 1
    }
  }
  
  const hsl = rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b)
  hue.value = hsl.h
  saturation.value = hsl.s
  lightness.value = hsl.l
  hexInput.value = rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
  alphaPercent.value = Math.round(alpha.value * 100)
}

const togglePicker = () => {
  showPicker.value = !showPicker.value
}

const closePicker = () => {
  showPicker.value = false
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(displayValue.value)
  } catch (err) {
    console.error('Failed to copy color to clipboard:', err)
  }
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    initializeFromProp(newValue)
  }
}, { immediate: true })
</script>
