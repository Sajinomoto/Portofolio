<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register GSAP ScrollToPlugin in browser environment
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollToPlugin);
}

// Define greetings for 7 languages categorized by 5 times of day
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
    evening: [
        "Selamat Malam", // Indonesian
        "Good Evening", // English
        "こんばんは", // Japanese (Konbanwa)
        "좋은 저녁입니다", // Korean (Joeun Ryeonyeok-imnida)
        "مساء الخير", // Arabic (Masa al-Khair)
        "शुभ संध्या", // Hindi (Shubh Sandhya)
        "晚上好", // Mandarin (Wǎnshàng Hǎo)
    ],
    night: [
        "Selamat Malam", // Indonesian
        "Good Night", // English
        "おやすみなさい", // Japanese (Oyasuminasai)
        "좋은 밤입니다", // Korean (Joeun bam-imnida)
        "ليلة سعيدة", // Arabic (Lailah Sa'idah)
        "शुभ रात्रि", // Hindi (Shubh Ratri)
        "晚安", // Mandarin (Wǎn'ān)
    ],
};

// Define welcome sub-text translations
const welcomeTexts = {
    id: "Selamat datang di portofolio saya!",
    en: "Welcome to my portfolio!",
    ja: "ポートフォリオへようこそ！",
    ko: "포트폴리오에 오신 것을 환영합니다!",
    ar: "مرحباً بكم في معرض أعمالي!",
    hi: "मेरे पोर्टफोलियो में आपका स्वागत है!",
    zh: "欢迎来到我的作品集！",
};

// Define scroll down translations
const scrollTexts = {
    id: "Scroll ke bawah",
    en: "Scroll down",
    ja: "下にスクロール",
    ko: "아래로 스크롤",
    ar: "مرر للأسفل",
    hi: "नीचे स्क्रॉल करें",
    zh: "向下滚动",
};

const langToIndex: Record<string, number> = {
    id: 0,
    en: 1,
    ja: 2,
    ko: 3,
    ar: 4,
    hi: 5,
    zh: 6,
};

const currentText = ref("");
const isBlinking = ref(true);
const systemLang = ref<"id" | "en" | "ja" | "ko" | "ar" | "hi" | "zh">("en");
let timeoutId: ReturnType<typeof setTimeout> | null = null;

// Time HUD Card States
const currentTime = ref("");
const currentDate = ref("");
const currentDay = ref("");
let timeIntervalId: ReturnType<typeof setInterval> | null = null;
let handleGridParallax: ((e: MouseEvent) => void) | null = null;
let handleDeviceOrientation: ((e: DeviceOrientationEvent) => void) | null = null;
let triggerPermission: (() => void) | null = null;
let lastNx = 0;
let lastNy = 0;
const tickingTimecode = ref("00:00:00:00");
let timecodeIntervalId: ReturnType<typeof setInterval> | null = null;
let lastMouseX = 0;
let lastMouseY = 0;
let lastTime = 0;
let velocity = 0;
let rafId = 0;



onMounted(() => {
    // 1. Detect user time of day in minutes
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    let timeOfDay: "morning" | "siang" | "sore" | "evening" | "night" = "night";

    // Pagi: 04:00 - 10:59 (240 - 659 mins)
    if (timeInMinutes >= 240 && timeInMinutes < 660) {
        timeOfDay = "morning";
    }
    // Siang: 11:00 - 14:59 (660 - 899 mins)
    else if (timeInMinutes >= 660 && timeInMinutes < 900) {
        timeOfDay = "siang";
    }
    // Sore: 15:00 - 18:29 (900 - 1109 mins)
    else if (timeInMinutes >= 900 && timeInMinutes < 1110) {
        timeOfDay = "sore";
    }
    // Evening: 18:30 - 21:59 (1110 - 1319 mins)
    else if (timeInMinutes >= 1110 && timeInMinutes < 1320) {
        timeOfDay = "evening";
    }
    // Night: 22:00 - 03:59 (1320 - 239 mins)

    const greetings = greetingsByTime[timeOfDay];

    // Detect starting language index from system language
    const sysLang = navigator.language.split("-")[0].toLowerCase();
    if (sysLang in welcomeTexts) {
        systemLang.value = sysLang as any;
    } else {
        systemLang.value = "en";
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
        currentTime.value = now.toTimeString().split(" ")[0];

        const localeMap: Record<string, string> = {
            id: "id-ID",
            en: "en-US",
            ja: "ja-JP",
            ko: "ko-KR",
            ar: "ar-EG",
            hi: "hi-IN",
            zh: "zh-CN",
        };
        const currentLocale = localeMap[systemLang.value] || "en-US";

        currentDay.value = now.toLocaleDateString(currentLocale, {
            weekday: "long",
        });
        currentDate.value = now.toLocaleDateString(currentLocale, {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };
    updateTime();
    timeIntervalId = setInterval(updateTime, 1000);



    // 5. 3D Camera Parallax Effect on Grid Background & Glow
    const gridEl = document.querySelector(".grid-pattern") as HTMLElement;
    const glowEl = document.querySelector(".radial-glow") as HTMLElement;
    const hudEl = document.querySelector(".viewfinder-hud") as HTMLElement;
    const contentEl = document.querySelector(
        ".greeting-content",
    ) as HTMLElement;

    let targetNx = 0;
    let targetNy = 0;
    let currentNx = 0;
    let currentNy = 0;

    handleGridParallax = (e: MouseEvent) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // Normalize coordinates to [-1, 1] relative to viewport center
        targetNx = (e.clientX - w / 2) / (w / 2);
        targetNy = (e.clientY - h / 2) / (h / 2);

        // Velocity tracking for chromatic aberration
        const now = performance.now();
        if (lastTime > 0) {
            const dt = now - lastTime;
            if (dt > 0) {
                const dx = e.clientX - lastMouseX;
                const dy = e.clientY - lastMouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const speed = dist / dt; // pixels per millisecond
                // Smooth out spikes
                velocity = velocity * 0.85 + speed * 0.15;
            }
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastTime = now;
    };

    handleDeviceOrientation = (e: DeviceOrientationEvent) => {
        const beta = e.beta || 0;
        const gamma = e.gamma || 0;

        // Calibrate angles for natural holding position (beta ~45 deg, gamma ~0 deg)
        const betaCenter = 45;
        const betaRange = 22; // max tilt +/- 22 degrees
        let normBeta = (beta - betaCenter) / betaRange;
        normBeta = Math.max(-1, Math.min(1, normBeta));

        const gammaRange = 22; // max tilt +/- 22 degrees
        let normGamma = gamma / gammaRange;
        normGamma = Math.max(-1, Math.min(1, normGamma));

        targetNx = normGamma;
        targetNy = normBeta;

        // Velocity tracking for chromatic aberration based on gyroscope change
        const now = performance.now();
        if (lastTime > 0) {
            const dt = now - lastTime;
            if (dt > 0) {
                const dx = (targetNx - lastNx) * 350; // map back to virtual pixel speed
                const dy = (targetNy - lastNy) * 350;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const speed = dist / dt;
                velocity = velocity * 0.85 + speed * 0.15;
            }
        }
        lastNx = targetNx;
        lastNy = targetNy;
        lastTime = now;
    };

    const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;

    if (!isMobileViewport) {
        window.addEventListener("mousemove", handleGridParallax);
    }

    // Device orientation initialization with user permission request on touch/click
    const initDeviceOrientation = () => {
        const DeviceEvent = window.DeviceOrientationEvent as any;
        if (DeviceEvent && typeof DeviceEvent.requestPermission === "function") {
            DeviceEvent.requestPermission()
                .then((permissionState: string) => {
                    if (permissionState === "granted" && handleDeviceOrientation) {
                        window.addEventListener("deviceorientation", handleDeviceOrientation);
                    }
                })
                .catch((err: any) => {
                    console.warn("DeviceOrientation permission denied:", err);
                });
        } else if (handleDeviceOrientation) {
            window.addEventListener("deviceorientation", handleDeviceOrientation);
        }
    };

    if (!isMobileViewport) {
        triggerPermission = () => {
            initDeviceOrientation();
            if (triggerPermission) {
                window.removeEventListener("click", triggerPermission);
                window.removeEventListener("touchstart", triggerPermission);
            }
        };
        window.addEventListener("click", triggerPermission);
        window.addEventListener("touchstart", triggerPermission);
    }

    // Smooth loop for parallax updates and velocity decay
    const tickParallaxDecay = () => {
        // Interpolate coordinates (lerp) for smooth parallax damping
        currentNx += (targetNx - currentNx) * 0.08;
        currentNy += (targetNy - currentNy) * 0.08;

        // Camera tilt / rotation limits
        const rx = -currentNy * 6;
        const ry = currentNx * 6;

        // Camera pan / translation limits
        const tx = currentNx * -18;
        const ty = currentNy * -18;

        if (gridEl) {
            gridEl.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${tx}px, ${ty}px, 0) scale(1.08)`;
        }
        if (glowEl) {
            glowEl.style.transform = `translate3d(${tx * -0.4}px, ${ty * -0.4}px, 0) scale(1.05)`;
        }

        // Chromatic aberration update based on velocity
        if (velocity > 0.01) {
            velocity *= 0.92;
            const chromaticOffset = Math.min(velocity * 8.0, 12);
            if (hudEl) {
                hudEl.style.setProperty("--c-offset", `${chromaticOffset}px`);
            }
            if (contentEl) {
                contentEl.style.setProperty(
                    "--c-offset",
                    `${chromaticOffset * 0.3}px`,
                );
            }
        } else if (velocity !== 0) {
            velocity = 0;
            if (hudEl) {
                hudEl.style.setProperty("--c-offset", "0px");
            }
            if (contentEl) {
                contentEl.style.setProperty("--c-offset", "0px");
            }
        }
        if (!isMobileViewport) {
            rafId = requestAnimationFrame(tickParallaxDecay);
        }
    };
    if (!isMobileViewport) {
        rafId = requestAnimationFrame(tickParallaxDecay);
    }

    // 6. Viewfinder ticking timecode update (60fps)
    let frameCount = 0;
    let timecodeSeconds = 0;
    let timecodeMinutes = 0;
    let timecodeHours = 0;

    const updateTimecode = () => {
        frameCount++;
        if (frameCount >= 60) {
            frameCount = 0;
            timecodeSeconds++;
            if (timecodeSeconds >= 60) {
                timecodeSeconds = 0;
                timecodeMinutes++;
                if (timecodeMinutes >= 60) {
                    timecodeMinutes = 0;
                    timecodeHours++;
                }
            }
        }
        const pad = (num: number) => String(num).padStart(2, "0");
        tickingTimecode.value = `${pad(timecodeHours)}:${pad(timecodeMinutes)}:${pad(timecodeSeconds)}:${pad(frameCount)}`;
    };
    timecodeIntervalId = setInterval(updateTimecode, 1000 / 60);
});

onUnmounted(() => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    if (timeIntervalId) {
        clearInterval(timeIntervalId);
    }
    if (handleGridParallax) {
        window.removeEventListener("mousemove", handleGridParallax);
    }
    if (handleDeviceOrientation) {
        window.removeEventListener("deviceorientation", handleDeviceOrientation);
    }
    if (triggerPermission) {
        window.removeEventListener("click", triggerPermission);
        window.removeEventListener("touchstart", triggerPermission);
    }
    if (timecodeIntervalId) {
        clearInterval(timecodeIntervalId);
    }
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
});

// Smooth scroll to the About section
const scrollToAbout = () => {
    const lenis = (window as any).lenis;
    if (lenis) {
        lenis.scrollTo("#about", {
            duration: 1.8,
            easing: (t: number) => 1 - Math.pow(1 - t, 4), // Heavy easeOutQuart
        });
    } else {
        gsap.to(window, {
            duration: 1.8,
            scrollTo: "#about",
            ease: "power4.out",
        });
    }
};
</script>

<template>
    <div
        class="flex flex-col items-center justify-center min-h-screen bg-[#EFEEE8] dark:bg-[#0E0D0B] text-black dark:text-[#EFEEE8] font-sans px-4 select-none text-center transition-colors duration-300 relative overflow-hidden"
    >
        <!-- Plus Grid Pattern Overlay -->
        <div
            class="absolute inset-0 pointer-events-none grid-pattern z-0"
        ></div>
        <!-- Radial Glow Overlay -->
        <div class="absolute inset-0 pointer-events-none radial-glow z-0"></div>

        <!-- Camera Viewfinder HUD Overlay -->
        <div
            class="absolute inset-0 pointer-events-none z-10 font-mono text-[9px] sm:text-[10px] font-bold tracking-widest text-black/25 dark:text-[#EFEEE8]/25 select-none viewfinder-hud"
        >
            <!-- Top Left: REC + Timecode -->
            <div
                class="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2"
            >
                <span
                    class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse-fast"
                ></span>
                <span>REC</span>
                <span class="ml-1.5 opacity-80">{{ tickingTimecode }}</span>
            </div>

            <!-- Top Right: Battery + Quality -->
            <div
                class="absolute top-6 right-6 sm:top-10 sm:right-10 flex items-center gap-4"
            >
                <span class="hidden xs:inline">RAW 4K 60FPS</span>
                <span class="flex items-center gap-1.5">
                    <span>BAT</span>
                    <span
                        class="border border-current px-0.5 py-px rounded-xs text-[7px] flex gap-0.5 items-center"
                    >
                        <span class="w-1 h-1.5 bg-current"></span>
                        <span class="w-1 h-1.5 bg-current"></span>
                        <span class="w-1 h-1.5 bg-current"></span>
                        <span class="w-1 h-1.5 bg-current/20"></span>
                    </span>
                    <span>78%</span>
                </span>
            </div>

            <!-- Bottom Left: AF & Specs -->
            <div
                class="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 flex flex-col gap-1 text-left"
            >
                <!-- Clock (HH:MM:SS) -->
                <div class="font-mono text-xs sm:text-sm font-bold tracking-wider leading-none mb-0.5">
                    {{ currentTime }}
                </div>
                <!-- Day and Date -->
                <div class="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest leading-none mb-2.5 opacity-80">
                    {{ currentDay }}, {{ currentDate }}
                </div>
                <div>AF-C [TRACKING]</div>
                <div class="opacity-80">ISO 400 | F2.8 | 1/125S</div>
            </div>

            <!-- Bottom Right: Audio Level Meter -->
            <div
                class="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex flex-col gap-1 text-right"
            >
                <div class="flex items-center gap-1.5 justify-end">
                    <span>CH1</span>
                    <div class="flex gap-0.5 h-1.5 items-center">
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 justify-end">
                    <span>CH2</span>
                    <div class="flex gap-0.5 h-1.5 items-center">
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                        <span class="w-1 h-1.5 bg-current audio-bar"></span>
                    </div>
                </div>
            </div>

            <!-- Center Focus Crosshair -->
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30"
            >
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="text-current"
                >
                    <path
                        d="M 20 12 V 28 M 12 20 H 28"
                        stroke="currentColor"
                        stroke-width="1.2"
                    />
                    <path
                        d="M 4 12 V 4 H 12"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                    <path
                        d="M 36 12 V 4 H 28"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                    <path
                        d="M 4 28 V 36 H 12"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                    <path
                        d="M 36 28 V 36 H 28"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                </svg>
            </div>
        </div>

        <!-- Main Content Container with Technical Frame -->
        <div
            class="z-10 relative px-8 py-6 sm:px-12 sm:py-9 md:px-20 md:py-14 flex flex-col items-center justify-center max-w-4xl mx-auto greeting-content"
        >
            <!-- Top-Left Corner Bracket -->
            <svg
                class="absolute top-0 left-0 text-black/40 dark:text-white/40"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 1 32 V 1 H 32"
                    stroke="currentColor"
                    stroke-width="1.5"
                />
                <rect x="10" y="-1" width="10" height="4" fill="currentColor" />
                <rect x="-1" y="10" width="4" height="10" fill="currentColor" />
            </svg>
            <!-- Top-Right Corner Bracket -->
            <svg
                class="absolute top-0 right-0 text-black/40 dark:text-white/40"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 31 32 V 1 H 0"
                    stroke="currentColor"
                    stroke-width="1.5"
                />
                <rect x="12" y="-1" width="10" height="4" fill="currentColor" />
                <rect x="29" y="10" width="4" height="10" fill="currentColor" />
            </svg>
            <!-- Bottom-Left Corner Bracket -->
            <svg
                class="absolute bottom-0 left-0 text-black/40 dark:text-white/40"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 1 0 V 31 H 32"
                    stroke="currentColor"
                    stroke-width="1.5"
                />
                <rect x="10" y="29" width="10" height="4" fill="currentColor" />
                <rect x="-1" y="12" width="4" height="10" fill="currentColor" />
            </svg>
            <!-- Bottom-Right Corner Bracket -->
            <svg
                class="absolute bottom-0 right-0 text-black/40 dark:text-white/40"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 31 0 V 31 H 0"
                    stroke="currentColor"
                    stroke-width="1.5"
                />
                <rect x="12" y="29" width="10" height="4" fill="currentColor" />
                <rect x="29" y="12" width="4" height="10" fill="currentColor" />
            </svg>

            <!-- Main Typing Greeting -->
            <h1
                class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight relative leading-none flex items-center justify-center mb-6 sm:mb-8"
            >
                <span
                    class="inline-block min-h-[1.1em] text-black dark:text-white"
                    >{{ currentText }}</span
                >
                <span
                    class="inline-block w-[5px] h-[0.9em] ml-2 bg-black dark:bg-white align-middle"
                    :class="{ 'animate-caret-blink': isBlinking }"
                ></span>
            </h1>

            <!-- Welcome Sub-text (Translated based on user's system language) -->
            <p
                class="text-base sm:text-lg md:text-xl font-medium text-black/50 dark:text-[#EFEEE8]/50 tracking-wide max-w-xl transition-colors duration-300"
            >
                {{ welcomeTexts[systemLang] }}
            </p>
        </div>

        <!-- Scroll Down Indicator (Bottom Center) -->
        <div
            @click="scrollToAbout"
            class="fixed bottom-8 left-1/2 -translate-x-1/2 md:bottom-12 z-40 flex items-center gap-2 animate-bounce-gentle text-black/40 dark:text-[#EFEEE8]/40 hover:text-black dark:hover:text-white transition-colors duration-300 cursor-pointer"
        >
            <span
                class="text-[10px] md:text-xs font-bold tracking-widest uppercase"
            >
                {{ scrollTexts[systemLang] }}
            </span>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-3.5 h-3.5"
            >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
        </div>


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

@keyframes bounce-gentle {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-6px);
    }
}

@keyframes grid-breath {
    0%,
    100% {
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
    -webkit-mask-image: radial-gradient(
        circle at center,
        black 40%,
        transparent 90%
    );
    animation: grid-breath 8s ease-in-out infinite;
    transform: scale(
        1.08
    ); /* Start scaled to prevent showing blank viewport edges */
    will-change: transform;
    transition: transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1); /* Physical camera damping inertia */
}

/* Radial Glow Background */
.radial-glow {
    background: radial-gradient(
        circle at 50% 40%,
        rgba(0, 0, 0, 0.015) 0%,
        transparent 60%
    );
    transform: scale(1.05);
    will-change: transform;
    transition: transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
}



/* Viewfinder Chromatic Aberration HUD styling */
.viewfinder-hud {
    --c-offset: 0px;
    /* Split overlay details into red and cyan drop shadows based on dynamic offset */
    filter: drop-shadow(var(--c-offset) 0px 0px rgba(255, 0, 80, 0.45))
        drop-shadow(calc(-1 * var(--c-offset)) 0px 0px rgba(0, 240, 255, 0.45));
    will-change: filter;
    transition: filter 0.08s ease-out; /* Super quick response to mouse motion */
}

/* Greeting Content Chromatic Aberration styling */
.greeting-content {
    --c-offset: 0px;
    /* Split greeting content text and brackets into red and cyan drop shadows */
    filter: drop-shadow(var(--c-offset) 0px 0px rgba(255, 0, 80, 0.4))
        drop-shadow(calc(-1 * var(--c-offset)) 0px 0px rgba(0, 240, 255, 0.4));
    will-change: filter;
    transition: filter 0.08s ease-out;
}

/* Viewfinder Animations */
@keyframes pulse-fast {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.2;
    }
}

.animate-pulse-fast {
    animation: pulse-fast 1s ease-in-out infinite;
}

.audio-bar {
    animation: audio-pulse 0.5s ease-in-out infinite alternate;
}
.audio-bar:nth-child(1) {
    animation-delay: 0.1s;
    animation-duration: 0.4s;
}
.audio-bar:nth-child(2) {
    animation-delay: 0.2s;
    animation-duration: 0.5s;
}
.audio-bar:nth-child(3) {
    animation-delay: 0.15s;
    animation-duration: 0.35s;
}
.audio-bar:nth-child(4) {
    animation-delay: 0.3s;
    animation-duration: 0.6s;
}
.audio-bar:nth-child(5) {
    animation-delay: 0.05s;
    animation-duration: 0.45s;
}
.audio-bar:nth-child(6) {
    animation-delay: 0.25s;
    animation-duration: 0.55s;
}
.audio-bar:nth-child(7) {
    animation-delay: 0.35s;
    animation-duration: 0.3s;
}

@keyframes audio-pulse {
    0% {
        opacity: 0.15;
    }
    100% {
        opacity: 1;
    }
}
</style>

<style>
/* Global overrides for Dark Mode */
.dark .grid-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 40 80 M 0 40 L 80 40' stroke='rgba(255,255,255,0.18)' stroke-width='1'/%3E%3Cpath d='M 37 40 L 43 40 M 40 37 L 40 43' stroke='rgba(255,255,255,0.45)' stroke-width='1'/%3E%3C/svg%3E") !important;
}

.dark .radial-glow {
    background: radial-gradient(
        circle at 50% 40%,
        rgba(255, 255, 255, 0.045) 0%,
        transparent 60%
    ) !important;
}
</style>
