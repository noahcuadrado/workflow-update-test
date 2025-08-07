<template>
  <div>
    <label class="theme-text text-xs block mb-1 theme-font">Gradient</label>
    
    <!-- Gradient Preview -->
    <div
      class="w-full h-16 rounded-lg border-2 theme-border mb-4 relative overflow-hidden cursor-pointer"
      :style="{ background: gradientCSS }"
      @click="showEditor = !showEditor"
    >
      <!-- Gradient overlay -->
      <div class="absolute inset-0" :style="{ background: gradientCSS }"></div>
      
      <!-- Play icon when collapsed -->
      <div v-if="!showEditor" class="absolute inset-0 flex items-center justify-center">
        <div class="bg-black/50 rounded-full p-2">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Gradient Editor -->
    <div v-if="showEditor" class="space-y-4 p-4 theme-glass rounded-xl">
      <!-- Direction Controls -->
      <div>
        <label class="theme-text text-xs block mb-2 theme-font">Direction</label>
        <div class="grid grid-cols-4 gap-2 mb-2">
          <button
            v-for="dir in directions"
            :key="dir.value"
            @click="direction = dir.value"
            :class="[
              'p-2 rounded-lg text-xs theme-transition border',
              direction === dir.value 
                ? 'theme-button ring-2 ring-blue-400' 
                : 'theme-glass hover:bg-white/10'
            ]"
          >
            {{ dir.label }}
          </button>
        </div>
        
        <!-- Custom angle input -->
        <div v-if="direction.includes('deg')" class="flex items-center gap-2">
          <label class="theme-text text-xs theme-font">Angle:</label>
          <input
            v-model.number="customAngle"
            @input="updateCustomAngle"
            type="number"
            min="0"
            max="360"
            class="flex-1 px-2 py-1 text-xs theme-input rounded"
          />
          <span class="theme-text text-xs">°</span>
        </div>
      </div>

      <!-- Color Stops -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="theme-text text-xs theme-font">Colors</label>
          <button
            @click="addColorStop"
            class="px-3 py-1 text-xs theme-button rounded-lg flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add
          </button>
        </div>

        <!-- Color Stop List -->
        <div class="space-y-2">
          <div
            v-for="(stop, index) in colorStops"
            :key="index"
            class="flex items-center gap-3 p-2 theme-glass rounded-lg"
          >
            <!-- Color picker button -->
            <div class="relative">
              <button
                @click="toggleStopPicker(index)"
                class="w-8 h-8 rounded border-2 theme-border"
                :style="{ backgroundColor: stop.color }"
              ></button>
              
              <!-- Mini color picker -->
              <div
                v-if="activeStopPicker === index"
                class="absolute z-50 mt-1 left-0"
              >
                <ColorPicker
                  :model-value="stop.color"
                  @update:model-value="updateStopColor(index, $event)"
                  :position="index > colorStops.length / 2 ? 'right' : 'left'"
                />
              </div>
            </div>

            <!-- Position slider -->
            <div class="flex-1 relative">
              <input
                v-model.number="stop.position"
                @input="updateGradient"
                type="range"
                min="0"
                max="100"
                class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs theme-text-secondary mt-1">
                <span>0%</span>
                <span class="theme-text">{{ stop.position }}%</span>
                <span>100%</span>
              </div>
            </div>

            <!-- Remove button -->
            <button
              v-if="colorStops.length > 2"
              @click="removeColorStop(index)"
              class="p-1 text-red-400 hover:text-red-300 theme-transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Preset Gradients -->
      <div>
        <label class="theme-text text-xs block mb-2 theme-font">Presets</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="preset in presetGradients"
            :key="preset.name"
            @click="applyPreset(preset)"
            class="h-10 rounded-lg border theme-border hover:scale-105 theme-transition relative overflow-hidden"
            :style="{ background: preset.css }"
            :title="preset.name"
          >
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs text-white mix-blend-difference bg-black/20 px-2 py-1 rounded">
                {{ preset.name }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- CSS Output -->
      <div>
        <label class="theme-text text-xs block mb-2 theme-font">CSS Output</label>
        <div class="relative">
          <textarea
            :value="gradientCSS"
            @input="updateFromCSS"
            class="w-full h-20 px-3 py-2 text-xs theme-input rounded-lg font-mono resize-none"
            placeholder="linear-gradient(...)"
          ></textarea>
          <button
            @click="copyGradientCSS"
            class="absolute top-2 right-2 p-1 theme-button rounded"
            title="Copy CSS"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Click outside to close color pickers -->
    <div v-if="activeStopPicker !== null" @click="activeStopPicker = null" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ColorPicker from './ColorPicker.vue'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

interface ColorStop {
  color: string
  position: number
}

interface PresetGradient {
  name: string
  css: string
  stops: ColorStop[]
  direction: string
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showEditor = ref(false)
const activeStopPicker = ref<number | null>(null)
const direction = ref('to right')
const customAngle = ref(90)
const colorStops = ref<ColorStop[]>([
  { color: '#3b82f6', position: 0 },
  { color: '#8b5cf6', position: 100 }
])

const directions = [
  { label: 'Right', value: 'to right' },
  { label: 'Left', value: 'to left' },
  { label: 'Bottom', value: 'to bottom' },
  { label: 'Top', value: 'to top' },
  { label: 'BR', value: 'to bottom right' },
  { label: 'BL', value: 'to bottom left' },
  { label: 'TR', value: 'to top right' },
  { label: 'TL', value: 'to top left' },
  { label: 'Custom', value: `${customAngle.value}deg` }
]

const presetGradients: PresetGradient[] = [
  {
    name: 'Ocean',
    css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 }
    ],
    direction: '135deg'
  },
  {
    name: 'Sunset',
    css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    stops: [
      { color: '#f093fb', position: 0 },
      { color: '#f5576c', position: 100 }
    ],
    direction: '135deg'
  },
  {
    name: 'Forest',
    css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    stops: [
      { color: '#4facfe', position: 0 },
      { color: '#00f2fe', position: 100 }
    ],
    direction: '135deg'
  },
  {
    name: 'Fire',
    css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    stops: [
      { color: '#fa709a', position: 0 },
      { color: '#fee140', position: 100 }
    ],
    direction: '135deg'
  },
  {
    name: 'Purple',
    css: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    stops: [
      { color: '#a8edea', position: 0 },
      { color: '#fed6e3', position: 100 }
    ],
    direction: '135deg'
  },
  {
    name: 'Night',
    css: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
    stops: [
      { color: '#2c3e50', position: 0 },
      { color: '#000000', position: 100 }
    ],
    direction: '135deg'
  }
]

const gradientCSS = computed(() => {
  const sortedStops = [...colorStops.value].sort((a, b) => a.position - b.position)
  const stopsString = sortedStops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')
  
  return `linear-gradient(${direction.value}, ${stopsString})`
})

const updateCustomAngle = () => {
  direction.value = `${customAngle.value}deg`
  updateGradient()
}

const updateGradient = () => {
  emit('update:modelValue', gradientCSS.value)
}

const addColorStop = () => {
  // Find a good position for the new stop
  const positions = colorStops.value.map(s => s.position).sort((a, b) => a - b)
  let newPosition = 50
  
  // Find the largest gap and place the stop in the middle
  for (let i = 0; i < positions.length - 1; i++) {
    const gap = positions[i + 1] - positions[i]
    if (gap > 20) {
      newPosition = positions[i] + gap / 2
      break
    }
  }
  
  colorStops.value.push({
    color: '#ffffff',
    position: newPosition
  })
  updateGradient()
}

const removeColorStop = (index: number) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1)
    updateGradient()
  }
}

const toggleStopPicker = (index: number) => {
  activeStopPicker.value = activeStopPicker.value === index ? null : index
}

const updateStopColor = (index: number, color: string) => {
  colorStops.value[index].color = color
  updateGradient()
}

const applyPreset = (preset: PresetGradient) => {
  direction.value = preset.direction
  colorStops.value = [...preset.stops]
  
  // Update custom angle if it's a degree direction
  if (preset.direction.includes('deg')) {
    customAngle.value = parseInt(preset.direction)
  }
  
  updateGradient()
}

const updateFromCSS = (event: Event) => {
  const css = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', css)
  
  // Try to parse the CSS to update the UI
  parseGradientCSS(css)
}

const parseGradientCSS = (css: string) => {
  try {
    // Basic parsing - this could be more robust
    const match = css.match(/linear-gradient\(([^)]+)\)/)
    if (match) {
      const parts = match[1].split(',').map(s => s.trim())
      
      // First part might be direction
      let directionPart = parts[0]
      let colorParts = parts.slice(1)
      
      // Check if first part is a direction
      if (directionPart.includes('deg') || directionPart.includes('to ')) {
        direction.value = directionPart
        if (directionPart.includes('deg')) {
          customAngle.value = parseInt(directionPart)
        }
      } else {
        // No direction specified, treat first part as color
        colorParts = parts
        direction.value = 'to right'
      }
      
      // Parse color stops
      const newStops: ColorStop[] = []
      colorParts.forEach(part => {
        const colorMatch = part.match(/^(.*?)\s+(\d+)%$/)
        if (colorMatch) {
          newStops.push({
            color: colorMatch[1].trim(),
            position: parseInt(colorMatch[2])
          })
        } else {
          // Color without position
          const position = newStops.length === 0 ? 0 : 100
          newStops.push({
            color: part.trim(),
            position
          })
        }
      })
      
      if (newStops.length >= 2) {
        colorStops.value = newStops
      }
    }
  } catch (error) {
    console.error('Failed to parse gradient CSS:', error)
  }
}

const copyGradientCSS = async () => {
  try {
    await navigator.clipboard.writeText(gradientCSS.value)
  } catch (err) {
    console.error('Failed to copy gradient CSS:', err)
  }
}

// Initialize from prop
const initializeFromProp = (value: string) => {
  if (value && value.includes('linear-gradient')) {
    parseGradientCSS(value)
  }
}

// Watch for changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== gradientCSS.value) {
    initializeFromProp(newValue)
  }
}, { immediate: true })

watch(gradientCSS, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>
