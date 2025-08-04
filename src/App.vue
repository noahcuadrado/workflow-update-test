<template>
  <div
    class="min-h-screen px-4 py-8 flex items-center justify-center relative overflow-hidden transition-all duration-700"
    :style="backgroundStyle"
  >


    <!-- Settings Button -->
    <button
      @click="toggleSettings"
      class="fixed top-6 right-6 z-50 backdrop-blur-md bg-white/20 border border-white/30 rounded-full p-3 text-white hover:bg-white/30 transition-all duration-200 shadow-lg"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    </button>

    <!-- Settings Panel -->
    <div
      v-if="showSettings"
      class="fixed top-20 right-6 z-40 backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-6 shadow-xl w-80 transition-all duration-300"
    >
      <h3 class="text-white text-lg font-medium mb-4">Settings</h3>

      <div class="space-y-4">
        <div>
          <label class="text-white text-sm font-medium block mb-2">Background</label>
          <button
            @click="cycleBackground"
            class="w-full backdrop-blur-md bg-blue-600/20 border border-white/30 rounded-xl px-4 py-3 text-white text-sm hover:bg-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Change Background
          </button>
          <p class="text-white/70 text-xs mt-1">Current: {{ backgroundImages[currentBackgroundIndex].name }}</p>
        </div>
      </div>
    </div>

    <!-- Click outside to close settings -->
    <div
      v-if="showSettings"
      @click="showSettings = false"
      class="fixed inset-0 z-30"
    ></div>

    <div class="w-full max-w-2xl mx-auto space-y-6 relative z-10">
      <!-- Business Description Section -->
      <div class="backdrop-blur-md bg-black/5 rounded-3xl p-6 shadow-inner border border-white/10 transition-all duration-300 hover:backdrop-blur-lg hover:bg-black/10 hover:shadow-2xl hover:border-white/20 hover:scale-[1.02] hover:shadow-white/10">
        <h2 class="text-white text-2xl font-normal text-center mb-6">Business Description or Idea</h2>
        <div class="bg-white/70 rounded-2xl p-6 min-h-[165px]">
          <textarea
            v-model="businessDescription"
            placeholder="Describe your business or idea here"
            class="w-full h-full bg-transparent text-gray-600 placeholder-gray-400 text-sm resize-none outline-none"
            rows="6"
          ></textarea>
        </div>
      </div>

      <!-- Mood Scale Section -->
      <div class="backdrop-blur-md bg-black/5 rounded-3xl p-6 shadow-inner border border-white/10 transition-all duration-300 hover:backdrop-blur-lg hover:bg-black/10 hover:shadow-2xl hover:border-white/20 hover:scale-[1.02] hover:shadow-white/10">
        <div class="mb-6">
          <h2 class="text-white text-2xl font-normal text-center mb-2">Mood Scale</h2>
          <p class="text-white text-lg font-normal text-center">Mood Scale</p>
        </div>
        <div class="grid grid-cols-7 gap-4">
          <div
            v-for="mood in moods"
            :key="mood.value"
            @click="selectedMood = mood.value"
            :class="[
              'bg-white/70 rounded-2xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-white/80',
              selectedMood === mood.value ? 'ring-2 ring-blue-400 bg-white/90' : ''
            ]"
          >
            <div class="text-4xl">{{ mood.emoji }}</div>
            <div class="text-black text-2xl font-normal">{{ mood.value }}</div>
          </div>
        </div>
      </div>

      <!-- Interests Section -->
      <div class="backdrop-blur-md bg-black/5 rounded-3xl p-6 shadow-inner border border-white/10">
        <div class="mb-6">
          <h2 class="text-white text-2xl font-normal text-center mb-2">Your Interests</h2>
          <p class="text-white text-lg font-normal text-center">Pick all that apply and add any custom interest</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div
              v-for="interest in leftColumnInterests"
              :key="interest.name"
              @click="toggleInterest(interest.name)"
              :class="[
                'bg-white/70 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-white/80',
                selectedInterests.includes(interest.name) ? 'ring-2 ring-blue-400 bg-white/90' : ''
              ]"
            >
              <div class="text-4xl">{{ interest.emoji }}</div>
              <div class="text-black text-xs font-normal text-center flex-1">{{ interest.name }}</div>
            </div>
          </div>
          <div class="space-y-3">
            <div
              v-for="interest in rightColumnInterests"
              :key="interest.name"
              @click="toggleInterest(interest.name)"
              :class="[
                'bg-white/70 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-white/80',
                selectedInterests.includes(interest.name) ? 'ring-2 ring-blue-400 bg-white/90' : ''
              ]"
            >
              <div class="text-4xl">{{ interest.emoji }}</div>
              <div class="text-black text-xs font-normal text-center flex-1">{{ interest.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="flex justify-end">
        <button
          @click="handleContinue"
          class="backdrop-blur-md bg-blue-600/10 border border-white/10 rounded-3xl px-8 py-3 text-white text-sm font-normal hover:bg-blue-600/20 transition-all duration-200 shadow-inner"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
const currentBackgroundIndex = ref(0)

const backgroundImages: BackgroundImage[] = [
  { url: '', name: 'Default Gradient' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: 'Mountain Lake' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop', name: 'Forest Path' },
  { url: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=1920&h=1080&fit=crop', name: 'Ocean Sunset' },
  { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop', name: 'Desert Canyon' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop', name: 'Aurora Borealis' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', name: 'Starry Night' },
  { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop', name: 'City Lights' }
]

const backgroundStyle = computed(() => {
  const currentBg = backgroundImages[currentBackgroundIndex.value]
  if (currentBg.url) {
    return {
      backgroundImage: `url('${currentBg.url}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {
    background: 'linear-gradient(to bottom right, rgb(241 245 249), rgb(226 232 240))'
  }
})

const moods: Mood[] = [
  { emoji: '😟', value: 1 },
  { emoji: '😁', value: 2 },
  { emoji: '🤩', value: 3 },
  { emoji: '🥳', value: 4 },
  { emoji: '😌', value: 5 },
  { emoji: '😐', value: 6 },
  { emoji: '🙂', value: 7 }
]

const leftColumnInterests: Interest[] = [
  { emoji: '🍎', name: 'Healthy Eating' },
  { emoji: '🚴‍♂️', name: 'Cycling for Fitness' },
  { emoji: '🧘‍♀️', name: 'Mindfulness Practices' },
  { emoji: '🎮', name: 'Video Game Trends' }
]

const rightColumnInterests: Interest[] = [
  { emoji: '📚', name: 'Reading Habits' },
  { emoji: '🎭', name: 'Creative Arts' },
  { emoji: '🌱', name: 'Sustainable Living' },
  { emoji: '🏡', name: 'Home Gardening' }
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
    selectedInterests: selectedInterests.value
  })
  // Handle form submission logic here
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
