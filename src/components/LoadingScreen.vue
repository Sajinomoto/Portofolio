<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';

// Define loading translations for 7 languages
const translations = {
  id: 'Memuat...',
  en: 'Loading...',
  ja: '読み込み中...',
  ko: '로딩 중...',
  ar: 'جاري التحميل...',
  hi: 'लोड हो रहा है...',
  zh: '加载中...'
};

const systemLang = ref<'id' | 'en' | 'ja' | 'ko' | 'ar' | 'hi' | 'zh'>('en');
const showLoader = ref(true);

onMounted(() => {
  // 1. Detect if the user has already visited in this session to skip the loader
  if (typeof window !== 'undefined') {
    if (sessionStorage.getItem('visited') === 'true') {
      showLoader.value = false;
      document.documentElement.classList.add('is-loaded');
      return;
    }
  }

  // 2. Detect language
  const sysLang = navigator.language.split('-')[0];
  if (sysLang in translations) {
    systemLang.value = sysLang as any;
  } else {
    systemLang.value = 'en';
  }

  // 3. Loading screen duration (slides up after 2.5 seconds)
  setTimeout(() => {
    // 4. Slide up animation using GSAP
    gsap.to('#loading-screen', {
      yPercent: -100,
      duration: 1.8,
      ease: 'power4.inOut',
      onComplete: () => {
        showLoader.value = false;
        sessionStorage.setItem('visited', 'true');
        // Trigger the fade-in animation for the main content only after loader clears
        document.documentElement.classList.add('is-loaded');
      }
    });
  }, 2500);
});
</script>

<template>
  <div 
    v-if="showLoader"
    id="loading-screen"
    class="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-[#EFEEE8] dark:bg-[#0E0D0B] text-black dark:text-[#EFEEE8] transition-colors duration-300 font-sans"
  >
    <div class="flex flex-col items-center select-none">
      <!-- 3 Animated Dots -->
      <div class="flex items-center space-x-2.5 mb-5">
        <div class="dot w-2.5 h-2.5 bg-black dark:bg-[#EFEEE8] rounded-full"></div>
        <div class="dot w-2.5 h-2.5 bg-black dark:bg-[#EFEEE8] rounded-full"></div>
        <div class="dot w-2.5 h-2.5 bg-black dark:bg-[#EFEEE8] rounded-full"></div>
      </div>
      <!-- Loading Text -->
      <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase text-black/50 dark:text-[#EFEEE8]/50">
        {{ translations[systemLang] }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Ensure smooth transitions */
#loading-screen {
  will-change: transform;
}

.dot {
  animation: dot-wave 1.2s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-wave {
  0%, 100% {
    transform: translateY(0) scale(0.8);
    opacity: 0.35;
  }
  50% {
    transform: translateY(-8px) scale(1.15);
    opacity: 1;
  }
}
</style>
