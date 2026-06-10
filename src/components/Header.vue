<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Define UI translations for the Header
const translations = {
  id: {
    home: 'Beranda',
    tooltip: 'Kunjungi Github Saya :)'
  },
  en: {
    home: 'Home',
    tooltip: 'Visit My Github :)'
  },
  ja: {
    home: 'ホーム',
    tooltip: 'GitHubを訪ねる :)'
  },
  ko: {
    home: '홈',
    tooltip: 'GitHub 방문하기 :)'
  },
  ar: {
    home: 'الرئيسية',
    tooltip: 'تفضل بزيارة حسابي على جيت هاب :)'
  },
  hi: {
    home: 'होम',
    tooltip: 'मेरे गिटहब पर जाएँ :)'
  },
  zh: {
    home: '首页',
    tooltip: '访问我的 GitHub :)'
  }
};

const currentLang = ref<'id' | 'en' | 'ja' | 'ko' | 'ar' | 'hi' | 'zh'>('en');

onMounted(() => {
  const sysLang = navigator.language.split('-')[0];
  if (sysLang in translations) {
    currentLang.value = sysLang as any;
  } else {
    currentLang.value = 'en';
  }
});
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-[#EFEEE8] z-50">
    <div class="max-w-7xl mx-auto px-6 py-5 md:px-12 flex items-center justify-between">
      <!-- Brand Name (Left) with CSS Tooltip -->
      <div class="relative group">
        <a 
          href="https://github.com/Sajinomoto" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="text-xl font-bold tracking-tight text-black hover:opacity-75 transition-opacity duration-200 block"
        >
          Sajinomoto
        </a>
        <!-- Bubble Text (Tooltip) -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
          <!-- Arrow pointing up -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
          {{ translations[currentLang].tooltip }}
        </div>
      </div>

      <!-- Navigation (Right) -->
      <nav class="flex items-center">
        <a 
          href="/" 
          class="text-base font-semibold text-black hover:opacity-60 transition-opacity duration-200"
        >
          {{ translations[currentLang].home }}
        </a>
      </nav>
    </div>
  </header>
</template>
