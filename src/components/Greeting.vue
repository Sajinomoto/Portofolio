<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// Define greetings for 7 languages categorized by 4 times of day
const greetingsByTime = {
    morning: [
        "Selamat Pagi", // Indonesian
        "Good Morning", // English
        "おはようございます", // Japanese (Ohayou Gozaimasu)
        "좋은 아침", // Korean (Joeun Achim)
        "صباح الخير", // Arabic (Sabah al-Khair)
        "सुप्रभात", // Hindi (Suprabhat)
        "早上好", // Mandarin (Zǎoshang Hǎo)
    ],
    siang: [
        "Selamat Siang", // Indonesian
        "Good Afternoon", // English
        "こんにちは", // Japanese (Konnichiwa)
        "안녕하세요", // Korean (Annyeonghaseyo)
        "طاب يومك", // Arabic (Tab Yawmuk)
        "नमस्कार", // Hindi (Namaskar)
        "中午好", // Mandarin (Zhōngwǔ Hǎo)
    ],
    sore: [
        "Selamat Sore", // Indonesian
        "Good Afternoon", // English
        "こんにちは", // Japanese (Konnichiwa)
        "안녕하세요", // Korean (Annyeonghaseyo)
        "مساء الخير", // Arabic (Masa al-Khair)
        "नमस्कार", // Hindi (Namaskar)
        "下午好", // Mandarin (Xiàwǔ Hǎo)
    ],
    malam: [
        "Selamat Malam", // Indonesian
        "Good Evening", // English
        "こんばんは", // Japanese (Konbanwa)
        "좋은 저녁입니다", // Korean (Joeun Ryeonyeok-imnida)
        "مساء الخير", // Arabic (Masa al-Khair)
        "शुभ संध्या", // Hindi (Shubh Sandhya)
        "晚上好", // Mandarin (Wǎnshàng Hǎo)
    ],
};

const langToIndex: Record<string, number> = {
  id: 0,
  en: 1,
  ja: 2,
  ko: 3,
  ar: 4,
  hi: 5,
  zh: 6
};

const currentText = ref('');
const isBlinking = ref(true);
let timeoutId: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  // 1. Detect user time of day in minutes
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  let timeOfDay: 'morning' | 'siang' | 'sore' | 'malam' = 'malam';

  // Pagi: 04:00 - 10:59 (240 - 659 mins)
  if (timeInMinutes >= 240 && timeInMinutes < 660) {
    timeOfDay = 'morning';
  }
  // Siang: 11:00 - 14:59 (660 - 899 mins)
  else if (timeInMinutes >= 660 && timeInMinutes < 900) {
    timeOfDay = 'siang';
  }
  // Sore: 15:00 - 18:29 (900 - 1109 mins)
  else if (timeInMinutes >= 900 && timeInMinutes < 1110) {
    timeOfDay = 'sore';
  }
  // Malam: 18:30 - 03:59 (1110 - 239 mins)

  const greetings = greetingsByTime[timeOfDay];
  
  // Detect starting language index from system language
  const sysLang = navigator.language.split('-')[0];
  const startIndex = sysLang in langToIndex ? langToIndex[sysLang] : 1; // Default to English (1)

  // 2. Typewriter state variables
  let wordIndex = startIndex;
  let charIndex = 0;
  let isDeleting = false;
  let delay = 100;

    function tick() {
        const fullWord = greetings[wordIndex];

        if (isDeleting) {
            // Deleting phase
            currentText.value = fullWord.substring(0, charIndex - 1);
            charIndex--;
            delay = 40; // Erase faster than typing
            isBlinking.value = false;
        } else {
            // Typing phase
            currentText.value = fullWord.substring(0, charIndex + 1);
            charIndex++;
            // Natural variable typing speed
            delay = 100 + Math.random() * 80;
            isBlinking.value = false;
        }

        if (!isDeleting && charIndex === fullWord.length) {
            // Fully typed: pause and start blinking caret
            isDeleting = true;
            isBlinking.value = true;
            delay = 2000; // Pause for 2 seconds
        } else if (isDeleting && charIndex === 0) {
            // Fully erased: pause slightly, then switch to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % greetings.length;
            isBlinking.value = true;
            delay = 500; // Short pause before next word
        }

        timeoutId = setTimeout(tick, delay);
    }

    // Start the typing cycle
    tick();
});

onUnmounted(() => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
});
</script>

<template>
    <div
        class="flex items-center justify-center min-h-screen bg-[#EFEEE8] text-black font-sans px-4 select-none"
    >
        <h1
            class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-center relative leading-none flex items-center justify-center"
        >
            <!-- Direct wrapper for text -->
            <span class="inline-block min-h-[1.1em] text-black">{{
                currentText
            }}</span>
            <!-- Custom vertical caret/cursor -->
            <span
                class="inline-block w-[5px] h-[0.9em] ml-2 bg-black align-middle"
                :class="{ 'animate-caret-blink': isBlinking }"
            ></span>
        </h1>
    </div>
</template>

<style scoped>
@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

.animate-caret-blink {
    animation: blink 1s step-end infinite;
}
</style>
