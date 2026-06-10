<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Define greetings for 7 languages categorized by 4 times of day
const greetingsByTime = {
  morning: [
    'Selamat Pagi',         // Indonesian
    'Good Morning',         // English
    'おはようございます',       // Japanese (Ohayou Gozaimasu)
    '좋은 아침',            // Korean (Joeun Achim)
    'صباح الخير',           // Arabic (Sabah al-Khair)
    'सुप्रभात',             // Hindi (Suprabhat)
    '早上好'                // Mandarin (Zǎoshang Hǎo)
  ],
  siang: [
    'Selamat Siang',        // Indonesian
    'Good Afternoon',       // English
    'こんにちは',            // Japanese (Konnichiwa)
    '안녕하세요',            // Korean (Annyeonghaseyo)
    'طاب يومك',             // Arabic (Tab Yawmuk)
    'नमस्कार',             // Hindi (Namaskar)
    '中午好'                // Mandarin (Zhōngwǔ Hǎo)
  ],
  sore: [
    'Selamat Sore',         // Indonesian
    'Good Afternoon',       // English
    'こんにちは',            // Japanese (Konnichiwa)
    '안녕하세요',            // Korean (Annyeonghaseyo)
    'مساء الخير',           // Arabic (Masa al-Khair)
    'नमस्कार',             // Hindi (Namaskar)
    '下午好'                // Mandarin (Xiàwǔ Hǎo)
  ],
  malam: [
    'Selamat Malam',        // Indonesian
    'Good Evening',         // English
    'こんばんは',            // Japanese (Konbanwa)
    '좋은 저녁입니다',        // Korean (Joeun Ryeonyeok-imnida)
    'مساء الخير',           // Arabic (Masa al-Khair)
    'शुभ संध्या',           // Hindi (Shubh Sandhya)
    '晚上好'                // Mandarin (Wǎnshàng Hǎo)
  ]
};

// Define welcome sub-text translations
const welcomeTexts = {
  id: 'Selamat datang di portofolio saya!',
  en: 'Welcome to my portfolio!',
  ja: 'ポートフォリオへようこそ！',
  ko: '포트폴리오에 오신 것을 환영합니다!',
  ar: 'مرحباً بكم في معرض أعمالي!',
  hi: 'मेरे पोर्टफोलियो में आपका स्वागत है!',
  zh: '欢迎来到我的作品集！'
};

// Define scroll down translations
const scrollTexts = {
  id: 'Scroll ke bawah',
  en: 'Scroll down',
  ja: '下にスクロール',
  ko: '아래로 스크롤',
  ar: 'مرر للأسفل',
  hi: 'नीचे स्क्रॉल करें',
  zh: '向下滚动'
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
const systemLang = ref<'id' | 'en' | 'ja' | 'ko' | 'ar' | 'hi' | 'zh'>('en');
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
  if (sysLang in welcomeTexts) {
    systemLang.value = sysLang as any;
  } else {
    systemLang.value = 'en';
  }

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
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#EFEEE8] dark:bg-[#0E0D0B] text-black dark:text-[#EFEEE8] font-sans px-4 select-none text-center transition-colors duration-300 relative">
    <!-- Main Typing Greeting -->
    <h1 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight relative leading-none flex items-center justify-center mb-6 sm:mb-8">
      <span class="inline-block min-h-[1.1em] text-black dark:text-white">{{ currentText }}</span>
      <span 
        class="inline-block w-[5px] h-[0.9em] ml-2 bg-black dark:bg-white align-middle"
        :class="{ 'animate-caret-blink': isBlinking }"
      ></span>
    </h1>

    <!-- Welcome Sub-text (Translated based on user's system language) -->
    <p class="text-base sm:text-lg md:text-xl font-medium text-black/50 dark:text-[#EFEEE8]/50 tracking-wide max-w-xl transition-colors duration-300">
      {{ welcomeTexts[systemLang] }}
    </p>

    <!-- Scroll Down Indicator (Bottom Right) -->
    <div class="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40 flex items-center gap-2 animate-bounce-gentle text-black/40 dark:text-[#EFEEE8]/40 hover:text-black dark:hover:text-white transition-colors duration-300 cursor-pointer">
      <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase">
        {{ scrollTexts[systemLang] }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    </div>
  </div>
</template>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-caret-blink {
  animation: blink 1s step-end infinite;
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}
</style>
