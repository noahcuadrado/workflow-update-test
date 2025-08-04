<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-8 flex items-center justify-center">
    <div class="w-full max-w-2xl mx-auto space-y-6">
      <!-- Business Description Section -->
      <div class="backdrop-blur-md bg-black/5 rounded-3xl p-6 shadow-inner border border-white/10">
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
      <div class="backdrop-blur-md bg-black/5 rounded-3xl p-6 shadow-inner border border-white/10">
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
import { ref } from 'vue'

interface Mood {
  emoji: string
  value: number
}

interface Interest {
  emoji: string
  name: string
}

const businessDescription = ref('')
const selectedMood = ref<number | null>(null)
const selectedInterests = ref<string[]>([])

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
