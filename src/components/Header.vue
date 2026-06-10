<script setup lang="ts">
import { ref, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register GSAP plugin in the browser environment
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollToPlugin);
}

// Define UI translations for the Header
const translations = {
    id: {
        home: "Beranda",
        about: "Tentang Saya",
        tooltip: "Kunjungi Github Saya :)",
    },
    en: {
        home: "Home",
        about: "About Me",
        tooltip: "Visit My Github :)",
    },
    ja: {
        home: "ホーム",
        about: "自己紹介",
        tooltip: "GitHubを訪ねる :)",
    },
    ko: {
        home: "홈",
        about: "자기소개",
        tooltip: "GitHub 방문하기 :)",
    },
    ar: {
        home: "الرئيسية",
        about: "عني",
        tooltip: "تفضل بزيارة حسابي على جيت هاب :)",
    },
    hi: {
        home: "होम",
        about: "मेरे बारे में",
        tooltip: "मेरे गिटहब पर जाएँ :)",
    },
    zh: {
        home: "首页",
        about: "关于我",
        tooltip: "访问我的 GitHub :)",
    },
};

const currentLang = ref<"id" | "en" | "ja" | "ko" | "ar" | "hi" | "zh">("en");
const isDark = ref(false);
const isSidebarOpen = ref(false);

onMounted(() => {
    // Detect language
    const sysLang = navigator.language.split("-")[0];
    if (sysLang in translations) {
        currentLang.value = sysLang as any;
    } else {
        currentLang.value = "en";
    }

    // Detect theme
    isDark.value = document.documentElement.classList.contains("dark");
});

const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    if (isDark.value) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
};

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

// Smooth scroll to target section
const scrollToSection = (selector: string) => {
    isSidebarOpen.value = false; // Close sidebar if navigating

    const lenis = (window as any).lenis;
    const target = selector === "#home" ? 0 : selector;
    if (lenis) {
        lenis.scrollTo(target, {
            duration: 1.8,
            easing: (t: number) => 1 - Math.pow(1 - t, 4), // Heavy easeOutQuart
        });
    } else {
        gsap.to(window, {
            duration: 1.8,
            scrollTo: target === 0 ? 0 : { y: selector },
            ease: "power4.out",
        });
    }
};
</script>

<template>
    <header 
        class="fixed top-0 left-0 w-full text-black dark:text-[#EFEEE8] transition-colors duration-300 z-50"
        :class="isSidebarOpen ? 'bg-transparent' : 'bg-[#EFEEE8]/70 dark:bg-[#0E0D0B]/70 backdrop-blur-md'"
    >
        <div
            class="max-w-7xl mx-auto px-6 py-5 md:px-12 flex items-center justify-between relative"
        >
            <!-- Mobile Burger Menu (Left, hidden on desktop) -->
            <button
                @click="toggleSidebar"
                class="block md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none z-10 cursor-pointer text-black dark:text-white transition-all duration-300"
                :class="isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'"
                aria-label="Toggle Menu"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="4" x2="20" y1="12" y2="12"></line>
                    <line x1="4" x2="20" y1="6" y2="6"></line>
                    <line x1="4" x2="20" y1="18" y2="18"></line>
                </svg>
            </button>

            <!-- Brand Name (Centered on mobile, Left on desktop) -->
            <div
                class="absolute md:relative group left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 z-10 transition-all duration-300"
                :class="isSidebarOpen ? 'opacity-0 pointer-events-none md:opacity-100' : 'opacity-100'"
            >
                <a
                    href="https://github.com/Sajinomoto"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xl font-bold tracking-tight text-black dark:text-white hover:opacity-75 transition-opacity duration-200 block whitespace-nowrap"
                >
                    Sajinomoto
                </a>
                <!-- Bubble Text (Tooltip - Desktop Only) -->
                <div
                    class="hidden md:block absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black dark:bg-[#EFEEE8] text-white dark:text-black text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-10"
                >
                    <!-- Arrow pointing up -->
                    <div
                        class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black dark:bg-[#EFEEE8] rotate-45"
                    ></div>
                    {{ translations[currentLang].tooltip }}
                </div>
            </div>

            <!-- Navigation & Dark Mode (Right) -->
            <div class="flex items-center gap-6">
                <!-- Desktop Navigation (Hidden on mobile) -->
                <nav class="hidden md:flex items-center gap-6">
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
                </nav>

                <!-- Dark Mode Toggle Button (Visible on both) -->
                <button
                    @click="toggleDarkMode"
                    class="p-2 rounded-full text-black hover:bg-black/5 dark:text-[#EFEEE8] dark:hover:bg-white/5 focus:outline-none flex items-center justify-center cursor-pointer z-10 transition-all duration-300"
                    :class="isSidebarOpen ? 'opacity-0 pointer-events-none md:opacity-100' : 'opacity-100'"
                    :aria-label="
                        isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'
                    "
                >
                    <!-- Sun Icon (shown in Light Mode) -->
                    <svg
                        v-if="!isDark"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
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
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Sidebar Backdrop -->
        <div
            class="md:hidden fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out"
            :class="isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
            @click="toggleSidebar"
        ></div>

        <!-- Mobile Sidebar Panel (Slides in from the left) -->
        <div
            class="md:hidden fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-[#EFEEE8] dark:bg-[#0E0D0B] z-50 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out border-r border-black/5 dark:border-white/10"
            :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        >
            <div>
                <!-- Sidebar Header -->
                <div class="flex items-center justify-between mt-2">
                    <span class="text-xs font-bold tracking-widest text-black/40 dark:text-white/40 uppercase">
                        Menu
                    </span>
                    <button
                        @click="toggleSidebar"
                        class="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none cursor-pointer text-black dark:text-white"
                        aria-label="Close Menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <line x1="18" x2="6" y1="6" y2="18"></line>
                            <line x1="6" x2="18" y1="6" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Subtle separator -->
                <div class="h-[1px] bg-black/5 dark:bg-white/10 w-full mt-4 mb-8"></div>

                <!-- Navigation Links -->
                <nav class="flex flex-col gap-5">
                    <!-- Home Link -->
                    <a
                        href="#home"
                        @click.prevent="scrollToSection('#home')"
                        class="text-xl font-semibold text-black dark:text-white hover:opacity-60 transition-opacity tracking-tight py-1"
                    >
                        {{ translations[currentLang].home }}
                    </a>

                    <!-- About Me Link -->
                    <a
                        href="#about"
                        @click.prevent="scrollToSection('#about')"
                        class="text-xl font-semibold text-black dark:text-white hover:opacity-60 transition-opacity tracking-tight py-1"
                    >
                        {{ translations[currentLang].about }}
                    </a>
                </nav>
            </div>

            <!-- Sidebar Footer -->
            <div>
                <div class="h-[1px] bg-black/5 dark:bg-white/10 w-full mb-6"></div>
                <!-- GitHub Link -->
                <a
                    href="https://github.com/Sajinomoto"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors tracking-tight flex items-center gap-2 py-1"
                >
                    <span>GitHub</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" x2="21" y1="14" y2="3"></line>
                    </svg>
                </a>
            </div>
        </div>
    </header>
</template>
