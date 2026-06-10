<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register GSAP ScrollToPlugin in browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}

// Define greetings for 7 languages categorized by 5 times of day
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
  evening: [
    'Selamat Malam',        // Indonesian
    'Good Evening',         // English
    'こんばんは',            // Japanese (Konbanwa)
    '좋은 저녁입니다',        // Korean (Joeun Ryeonyeok-imnida)
    'مساء الخير',           // Arabic (Masa al-Khair)
    'शुभ संध्या',           // Hindi (Shubh Sandhya)
    '晚上好'                // Mandarin (Wǎnshàng Hǎo)
  ],
  night: [
    'Selamat Malam',        // Indonesian
    'Good Night',           // English
    'おやすみなさい',          // Japanese (Oyasuminasai)
    '좋은 밤입니다',          // Korean (Joeun bam-imnida)
    'ليلة سعيدة',           // Arabic (Lailah Sa'idah)
    'शुभ रात्रि',            // Hindi (Shubh Ratri)
    '晚安'                  // Mandarin (Wǎn'ān)
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

// Time HUD Card States
const currentTime = ref('');
const currentDate = ref('');
const currentDay = ref('');
const isCollapsed = ref(true);
const hasEntered = ref(false);
let timeIntervalId: ReturnType<typeof setInterval> | null = null;
let cardTimeoutId: ReturnType<typeof setTimeout> | null = null;
let collapseTimeoutId: ReturnType<typeof setTimeout> | null = null;
let loaderObserver: MutationObserver | null = null;

const startCollapseTimer = () => {
  if (collapseTimeoutId) {
    clearTimeout(collapseTimeoutId);
  }
  collapseTimeoutId = setTimeout(() => {
    isCollapsed.value = true;
  }, 5000);
};

const handleMouseEnter = () => {
  if (!hasEntered.value) return;
  if (collapseTimeoutId) {
    clearTimeout(collapseTimeoutId);
    collapseTimeoutId = null;
  }
  isCollapsed.value = false;
};

const handleMouseLeave = () => {
  if (!hasEntered.value) return;
  startCollapseTimer();
};

onMounted(() => {
  // 1. Detect user time of day in minutes
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  let timeOfDay: 'morning' | 'siang' | 'sore' | 'evening' | 'night' = 'night';

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
  // Evening: 18:30 - 21:59 (1110 - 1319 mins)
  else if (timeInMinutes >= 1110 && timeInMinutes < 1320) {
    timeOfDay = 'evening';
  }
  // Night: 22:00 - 03:59 (1320 - 239 mins)

  const greetings = greetingsByTime[timeOfDay];
  
  // Detect starting language index from system language
  const sysLang = navigator.language.split('-')[0].toLowerCase();
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

  // 3. Clock update logic
  const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toTimeString().split(' ')[0];

    const localeMap: Record<string, string> = {
      id: 'id-ID',
      en: 'en-US',
      ja: 'ja-JP',
      ko: 'ko-KR',
      ar: 'ar-EG',
      hi: 'hi-IN',
      zh: 'zh-CN'
    };
    const currentLocale = localeMap[systemLang.value] || 'en-US';

    currentDay.value = now.toLocaleDateString(currentLocale, { weekday: 'long' });
    currentDate.value = now.toLocaleDateString(currentLocale, { day: 'numeric', month: 'long', year: 'numeric' });
  };
  updateTime();
  timeIntervalId = setInterval(updateTime, 1000);

  // 4. Slide in card 5s after home section opacity is 100%
  const startCardTimer = () => {
    // 2.0s fade-in transition + 5.0s delay = 7.0s
    cardTimeoutId = setTimeout(() => {
      hasEntered.value = true;
      isCollapsed.value = false;
      startCollapseTimer();
    }, 7000);
  };

  if (typeof window !== 'undefined') {
    if (document.documentElement.classList.contains('is-loaded')) {
      startCardTimer();
    } else {
      loaderObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class' &&
            document.documentElement.classList.contains('is-loaded')
          ) {
            startCardTimer();
            if (loaderObserver) {
              loaderObserver.disconnect();
              loaderObserver = null;
            }
          }
        });
      });
      loaderObserver.observe(document.documentElement, { attributes: true });
    }
  }
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (timeIntervalId) {
    clearInterval(timeIntervalId);
  }
  if (cardTimeoutId) {
    clearTimeout(cardTimeoutId);
  }
  if (collapseTimeoutId) {
    clearTimeout(collapseTimeoutId);
  }
  if (loaderObserver) {
    loaderObserver.disconnect();
  }
});

// Smooth scroll to the About section
const scrollToAbout = () => {
  const lenis = (window as any).lenis;
  if (lenis) {
    lenis.scrollTo('#about', {
      duration: 1.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 4), // Heavy easeOutQuart
    });
  } else {
    gsap.to(window, { 
      duration: 1.8, 
      scrollTo: '#about', 
      ease: 'power4.out' 
    });
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#EFEEE8] dark:bg-[#0E0D0B] text-black dark:text-[#EFEEE8] font-sans px-4 select-none text-center transition-colors duration-300 relative overflow-hidden">
    <!-- Plus Grid Pattern Overlay -->
    <div class="absolute inset-0 pointer-events-none grid-pattern z-0"></div>
    <!-- Radial Glow Overlay -->
    <div class="absolute inset-0 pointer-events-none radial-glow z-0"></div>

    <!-- Main Content Container with Technical Frame -->
    <div class="z-10 relative px-8 py-6 sm:px-12 sm:py-9 md:px-20 md:py-14 flex flex-col items-center justify-center max-w-4xl mx-auto">
      <!-- Top-Left Corner Bracket -->
      <svg class="absolute top-0 left-0 text-black/40 dark:text-white/40" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 1 32 V 1 H 32" stroke="currentColor" stroke-width="1.5" />
        <rect x="10" y="-1" width="10" height="4" fill="currentColor" />
        <rect x="-1" y="10" width="4" height="10" fill="currentColor" />
      </svg>
      <!-- Top-Right Corner Bracket -->
      <svg class="absolute top-0 right-0 text-black/40 dark:text-white/40" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 31 32 V 1 H 0" stroke="currentColor" stroke-width="1.5" />
        <rect x="12" y="-1" width="10" height="4" fill="currentColor" />
        <rect x="29" y="10" width="4" height="10" fill="currentColor" />
      </svg>
      <!-- Bottom-Left Corner Bracket -->
      <svg class="absolute bottom-0 left-0 text-black/40 dark:text-white/40" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 1 0 V 31 H 32" stroke="currentColor" stroke-width="1.5" />
        <rect x="10" y="29" width="10" height="4" fill="currentColor" />
        <rect x="-1" y="12" width="4" height="10" fill="currentColor" />
      </svg>
      <!-- Bottom-Right Corner Bracket -->
      <svg class="absolute bottom-0 right-0 text-black/40 dark:text-white/40" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 31 0 V 31 H 0" stroke="currentColor" stroke-width="1.5" />
        <rect x="12" y="29" width="10" height="4" fill="currentColor" />
        <rect x="29" y="12" width="4" height="10" fill="currentColor" />
      </svg>

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
    </div>

    <!-- Scroll Down Indicator (Bottom Right) -->
    <div @click="scrollToAbout" class="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40 flex items-center gap-2 animate-bounce-gentle text-black/40 dark:text-[#EFEEE8]/40 hover:text-black dark:hover:text-white transition-colors duration-300 cursor-pointer">
      <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase">
        {{ scrollTexts[systemLang] }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    </div>

    <!-- Time HUD Card (Bottom Left) -->
    <div 
      class="fixed bottom-8 left-8 md:bottom-12 md:left-12 z-40 flex items-stretch gap-2.5 transition-all duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)] select-none h-12 sm:h-[52px] hud-container"
      :class="[
        !hasEntered ? 'translate-x-[-120%] opacity-0 pointer-events-none' : 'opacity-100',
        hasEntered && !isCollapsed ? 'translate-x-0 pointer-events-auto' : '',
        hasEntered && isCollapsed ? 'hud-collapsed pointer-events-auto' : ''
      ]"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Main Card (Left) -->
      <div 
        class="bg-[#0E0D0B] dark:bg-[#EFEEE8] text-[#EFEEE8] dark:text-[#0E0D0B] px-5 flex flex-col items-start justify-center shadow-lg relative hud-card-clip min-w-[160px] sm:min-w-[190px] transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        :class="isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'"
      >
        <!-- Clock (HH:MM:SS) -->
        <span class="font-mono text-base sm:text-lg font-bold tracking-wider leading-none mb-1">
          {{ currentTime }}
        </span>
        <!-- Day and Date -->
        <span class="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#EFEEE8]/60 dark:text-[#0E0D0B]/60 leading-none">
          {{ currentDay }}, {{ currentDate }}
        </span>
      </div>

      <!-- Graphic Aksen (Right) -->
      <div class="w-12 sm:w-[52px] bg-[#0E0D0B] dark:bg-[#EFEEE8] text-[#EFEEE8] dark:text-[#0E0D0B] shadow-lg border border-[#EFEEE8]/10 dark:border-[#0E0D0B]/10 flex items-center justify-center relative overflow-hidden cursor-pointer">
        <!-- Repeating diagonal lines -->
        <div class="absolute inset-0 opacity-30 hud-diagonal-stripes"></div>
      </div>
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

@keyframes grid-breath {
  0%, 100% {
    opacity: 0.15;
  }
  50% {
    opacity: 1;
  }
}

.animate-caret-blink {
  animation: blink 1s step-end infinite;
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}

/* Plus Grid Pattern (Light Mode) */
.grid-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 40 80 M 0 40 L 80 40' stroke='rgba(0,0,0,0.08)' stroke-width='1'/%3E%3Cpath d='M 37 40 L 43 40 M 40 37 L 40 43' stroke='rgba(0,0,0,0.22)' stroke-width='1'/%3E%3C/svg%3E");
  background-size: 80px 80px;
  background-position: center;
  mask-image: radial-gradient(circle at center, black 40%, transparent 90%);
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 90%);
  animation: grid-breath 8s ease-in-out infinite;
}

/* Radial Glow Background */
.radial-glow {
  background: radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.015) 0%, transparent 60%);
}

/* Cyberpunk HUD Time Card Clip & Stripes */
.hud-card-clip {
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
  filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1));
}

.hud-diagonal-stripes {
  background: repeating-linear-gradient(
    -45deg,
    currentColor,
    currentColor 4px,
    transparent 4px,
    transparent 8px
  );
}

.hud-container {
  --accent-width: 48px; /* w-12 = 48px */
  --left-offset: 2rem;  /* left-8 = 2rem */
}

@media (min-width: 768px) {
  .hud-container {
    --accent-width: 52px; /* w-[52px] = 52px */
    --left-offset: 3rem;  /* left-12 = 3rem */
  }
}

.hud-collapsed {
  transform: translateX(calc(-100% + var(--accent-width) - var(--left-offset) + 0.5rem));
}
</style>

<style>
/* Global overrides for Dark Mode */
.dark .grid-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 40 80 M 0 40 L 80 40' stroke='rgba(255,255,255,0.18)' stroke-width='1'/%3E%3Cpath d='M 37 40 L 43 40 M 40 37 L 40 43' stroke='rgba(255,255,255,0.45)' stroke-width='1'/%3E%3C/svg%3E") !important;
}

.dark .radial-glow {
  background: radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.045) 0%, transparent 60%) !important;
}
</style>
