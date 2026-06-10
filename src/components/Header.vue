<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register GSAP plugin in the browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}

// Define UI translations for the Header
const translations = {
  id: {
    home: 'Beranda',
    about: 'Tentang Saya',
    tooltip: 'Kunjungi Github Saya :)'
  },
  en: {
    home: 'Home',
    about: 'About Me',
    tooltip: 'Visit My Github :)'
  },
  ja: {
    home: 'ホーム',
    about: '自己紹介',
    tooltip: 'GitHubを訪ねる :)'
  },
  ko: {
    home: '홈',
    about: '자기소개',
    tooltip: 'GitHub 방문하기 :)'
  },
  ar: {
    home: 'الرئيسية',
    about: 'عني',
    tooltip: 'تفضل بزيارة حسابي على جيت هاب :)'
  },
  hi: {
    home: 'होम',
    about: 'मेरे बारे में',
    tooltip: 'मेरे गिटहब पर जाएँ :)'
  },
  zh: {
    home: '首页',
    about: '关于我',
    tooltip: '访问我的 GitHub :)'
  }
};

const currentLang = ref<'id' | 'en' | 'ja' | 'ko' | 'ar' | 'hi' | 'zh'>('en');
const isDark = ref(false);

onMounted(() => {
  // Detect language
  const sysLang = navigator.language.split('-')[0];
  if (sysLang in translations) {
    currentLang.value = sysLang as any;
  } else {
    currentLang.value = 'en';
  }

  // Detect theme
  isDark.value = document.documentElement.classList.contains('dark');
});

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// Smooth scroll to target section using GSAP
const scrollToSection = (selector: string) => {
  gsap.to(window, { 
    duration: 1, 
    scrollTo: selector, 
    ease: 'power2.out' 
  });
};
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-[#EFEEE8] dark:bg-[#0E0D0B] text-black dark:text-[#EFEEE8] transition-colors duration-300 z-50">
    <div class="max-w-7xl mx-auto px-6 py-5 md:px-12 flex items-center justify-between">
      <!-- Brand Name (Left) with CSS Tooltip -->
      <div class="relative group">
        <a 
          href="https://github.com/Sajinomoto" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="text-xl font-bold tracking-tight text-black dark:text-white hover:opacity-75 transition-opacity duration-200 block"
        >
          Sajinomoto
        </a>
        <!-- Bubble Text (Tooltip) -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black dark:bg-[#EFEEE8] text-white dark:text-black text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
          <!-- Arrow pointing up -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black dark:bg-[#EFEEE8] rotate-45"></div>
          {{ translations[currentLang].tooltip }}
        </div>
      </div>

      <!-- Navigation & Dark Mode Toggle (Right) -->
      <nav class="flex items-center gap-6">
        <div class="flex items-center gap-4 sm:gap-6">
          <!-- Home Link -->
          <a 
            href="#home" 
            @click.prevent="scrollToSection('#home')"
            class="text-base font-semibold text-black dark:text-[#EFEEE8] hover:opacity-60 transition-opacity duration-200"
          >
            {{ translations[currentLang].home }}
          </a>

          <!-- About Me Link -->
          <a 
            href="#about" 
            @click.prevent="scrollToSection('#about')"
            class="text-base font-semibold text-black dark:text-[#EFEEE8] hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
          >
            {{ translations[currentLang].about }}
          </a>
        </div>

        <!-- Dark Mode Toggle Button -->
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded-full text-black hover:bg-black/5 dark:text-[#EFEEE8] dark:hover:bg-white/5 transition-all duration-200 focus:outline-none flex items-center justify-center cursor-pointer"
          :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <!-- Sun Icon (shown in Light Mode) -->
          <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
          <!-- Moon Icon (shown in Dark Mode) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        </button>
      </nav>
    </div>
  </header>
</template>
