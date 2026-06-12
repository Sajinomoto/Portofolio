<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import FloatingCube from "./FloatingCube.vue";
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
    id: "Selamat datang di portofolio-ku!",
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

const gridCanvas = ref<HTMLCanvasElement | null>(null);
const currentText = ref("");
const isBlinking = ref(true);
const systemLang = ref<"id" | "en" | "ja" | "ko" | "ar" | "hi" | "zh">("en");
let timeoutId: ReturnType<typeof setTimeout> | null = null;

// Time HUD Card States
const currentTime = ref("");
const currentDate = ref("");
const currentDay = ref("");
let timeIntervalId: ReturnType<typeof setInterval> | null = null;
const tickingTimecode = ref("00:00:00:00");
let timecodeRafId = 0;
let rafId = 0;
let handleLanguageChange: ((e: Event) => void) | null = null;

onMounted(() => {
    // Radial Water Ripple System
    interface Ripple {
        x: number;
        y: number;
        birthTime: number;
        duration: number;
        maxRadius: number;
        amplitude: number;
    }
    let activeRipples: Ripple[] = [];
    let lastHeartbeatTime = performance.now() - 2500; // spawn first ripple 500ms after load

    // Canvas grid setup
    const canvas = gridCanvas.value;
    if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            let width = (canvas.width = window.innerWidth);
            let height = (canvas.height = window.innerHeight);

            const handleResize = () => {
                if (!canvas) return;
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            };
            window.addEventListener("resize", handleResize);

            const cols = window.innerWidth < 1024 ? 40 : 80;
            const rows = window.innerWidth < 1024 ? 40 : 80;
            const gridW = 2000;
            const gridH = 1450;

            const camera = {
                fov: 460,
                pitch: 0.0,
                yaw: 0.0,
            };

            function project(
                x: number,
                y: number,
                z: number,
                w: number,
                h: number,
            ) {
                const cosY = Math.cos(camera.yaw);
                const sinY = Math.sin(camera.yaw);
                const x1 = x * cosY - y * sinY;
                const y1 = x * sinY + y * cosY;

                const cosP = Math.cos(camera.pitch);
                const sinP = Math.sin(camera.pitch);
                const y2 = y1 * cosP - z * sinP;
                const z2 = y1 * sinP + z * cosP;

                const dist = 520;
                const sz = z2 + dist;
                if (sz <= 50) return null;

                const scale = camera.fov / sz;
                const px = w / 2 + x1 * scale;
                const py = h / 2 + y2 * scale + 80;

                return { x: px, y: py, scale };
            }

            const draw3DGrid = () => {
                ctx.clearRect(0, 0, width, height);

                // Static camera angles since cursor movement features are removed
                camera.pitch = 0.0;
                camera.yaw = 0.0;

                const now = performance.now();

                // 1. Spawn heartbeat ripple automatically (every 3 seconds)
                if (now - lastHeartbeatTime >= 3000) {
                    lastHeartbeatTime = now;
                    activeRipples.push({
                        x: 0,
                        y: 0,
                        birthTime: now,
                        duration: 4000, // Slow and calm ripple (lasts 4 seconds)
                        maxRadius: 1800, // Wide propagation
                        amplitude: 12, // Gentle amplitude
                    });
                }

                // 2. Clean up expired ripples
                activeRipples = activeRipples.filter(
                    (r) => now - r.birthTime < r.duration,
                );

                // 3. Project 3D points
                const points: Array<
                    Array<{ x: number; y: number; scale: number } | null>
                > = [];

                for (let r = 0; r <= rows; r++) {
                    points[r] = [];
                    for (let c = 0; c <= cols; c++) {
                        const gx = (c / cols - 0.5) * gridW;
                        const gy = (r / rows - 0.5) * gridH;

                        // Ambient tiny background wave so it is never completely static
                        let gz =
                            Math.sin(gx * 0.0015 - now * 0.0005) *
                            Math.cos(gy * 0.0015 + now * 0.0003) *
                            1.5;

                        // Accumulate active ripple waves (water ripple physics)
                        activeRipples.forEach((ripple) => {
                            const age = now - ripple.birthTime;
                            const progress = age / ripple.duration;

                            const dx = gx - ripple.x;
                            const dy = gy - ripple.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            // Wave front moves outward
                            const currentRadius = progress * ripple.maxRadius;
                            const distToWaveFront = Math.abs(
                                dist - currentRadius,
                            );
                            const waveWidth = 250; // Width of the wave packet

                            if (distToWaveFront < waveWidth) {
                                // Fade factors: decay with distance/time + smooth envelope
                                const envelope = Math.cos(
                                    ((distToWaveFront / waveWidth) * Math.PI) /
                                        2,
                                );
                                const ageFade = 1.0 - progress;

                                // Wavelength of the ripples
                                const wavelength = 180; // Smooth, wide wave
                                const wave = Math.sin(
                                    ((dist - currentRadius) / wavelength) *
                                        Math.PI *
                                        2,
                                );
                                gz +=
                                    wave *
                                    ripple.amplitude *
                                    envelope *
                                    ageFade;
                            }
                        });

                        let p = project(gx, gy, gz, width, height);
                        points[r][c] = p;
                    }
                }

                const isDark =
                    document.documentElement.classList.contains("dark");

                // Base colors and alphas
                const baseR = isDark ? 239 : 14;
                const baseG = isDark ? 238 : 13;
                const baseB = isDark ? 232 : 11;
                const baseLineAlpha = isDark ? 0.14 : 0.07;
                const baseDotAlpha = isDark ? 0.45 : 0.22;

                // 4. Draw rendering passes (Single pass neutral color)
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${baseLineAlpha})`;
                ctx.lineWidth = 1;

                for (let r = 0; r <= rows; r++) {
                    for (let c = 0; c <= cols; c++) {
                        const p1 = points[r][c];
                        if (!p1) continue;

                        if (c < cols) {
                            const p2 = points[r][c + 1];
                            if (p2) {
                                ctx.moveTo(p1.x, p1.y);
                                ctx.lineTo(p2.x, p2.y);
                            }
                        }
                        if (r < rows) {
                            const p2 = points[r + 1][c];
                            if (p2) {
                                ctx.moveTo(p1.x, p1.y);
                                ctx.lineTo(p2.x, p2.y);
                            }
                        }
                    }
                }
                ctx.stroke();

                ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${baseDotAlpha})`;
                for (let r = 0; r <= rows; r += 2) {
                    for (let c = 0; c <= cols; c += 2) {
                        const p = points[r][c];
                        if (!p) continue;
                        ctx.fillRect(p.x - 2, p.y, 5, 1);
                        ctx.fillRect(p.x, p.y - 2, 1, 5);
                    }
                }
            };

            (window as any)._draw3DGrid = draw3DGrid;
            (window as any)._cleanup3DGrid = () => {
                window.removeEventListener("resize", handleResize);
            };
        }
    }

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

    // Detect starting language index from preferred-language in localStorage or system language
    const preferredLang = localStorage.getItem("preferred-language");
    let activeLang = "en";
    if (preferredLang && preferredLang in welcomeTexts) {
        activeLang = preferredLang;
    } else {
        const sysLang = navigator.language.split("-")[0].toLowerCase();
        if (sysLang in welcomeTexts) {
            activeLang = sysLang;
        }
    }

    systemLang.value = activeLang as any;
    const startIndex = activeLang in langToIndex ? langToIndex[activeLang] : 1; // Default to English (1)

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

    function resetTypewriter(
        newLang: "id" | "en" | "ja" | "ko" | "ar" | "hi" | "zh",
    ) {
        const newIndex = langToIndex[newLang];
        if (newIndex !== undefined) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            wordIndex = newIndex;
            charIndex = 0;
            isDeleting = false;
            currentText.value = "";
            isBlinking.value = false;
            tick();
        }
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

    // 4. Language Change Event Listener
    handleLanguageChange = (e: Event) => {
        const customEvent = e as CustomEvent<
            "id" | "en" | "ja" | "ko" | "ar" | "hi" | "zh"
        >;
        const newLang = customEvent.detail;
        if (newLang && newLang in welcomeTexts) {
            systemLang.value = newLang;
            updateTime();
            resetTypewriter(newLang);
        }
    };
    window.addEventListener("language-changed", handleLanguageChange);

    const isMobileViewport =
        typeof window !== "undefined" && window.innerWidth < 768;

    // Smooth loop for grid updates and timecode
    const tickParallaxDecay = () => {
        if ((window as any)._draw3DGrid) {
            (window as any)._draw3DGrid();
        }

        // Update timecode inside desktop animation loop
        updateTimecode();

        if (!isVisible) return;
        if (!isMobileViewport) {
            rafId = requestAnimationFrame(tickParallaxDecay);
        }
    };

    // Lightweight loop for mobile viewport that only updates the timecode
    const tickTimecodeOnly = () => {
        if (!isVisible) return;
        updateTimecode();
        timecodeRafId = requestAnimationFrame(tickTimecodeOnly);
    };

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

    // Loops start/stop controllers based on viewport visibility
    let isVisible = true;
    let observer: IntersectionObserver | null = null;

    const startLoops = () => {
        if (!isMobileViewport) {
            if (!rafId) {
                rafId = requestAnimationFrame(tickParallaxDecay);
            }
        } else {
            if (!timecodeRafId) {
                timecodeRafId = requestAnimationFrame(tickTimecodeOnly);
            }
        }
    };

    const stopLoops = () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
        if (timecodeRafId) {
            cancelAnimationFrame(timecodeRafId);
            timecodeRafId = 0;
        }
    };

    if (canvas && canvas.parentElement) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        startLoops();
                    } else {
                        stopLoops();
                    }
                });
            },
            { threshold: 0.01 },
        );
        observer.observe(canvas.parentElement);
    } else {
        startLoops();
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
    }
    if ((window as any)._cleanup3DGrid) {
        (window as any)._cleanup3DGrid();
        delete (window as any)._draw3DGrid;
        delete (window as any)._cleanup3DGrid;
    }
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    if (timeIntervalId) {
        clearInterval(timeIntervalId);
    }

    if (timecodeIntervalId) {
        clearInterval(timecodeIntervalId);
    }
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    if (handleLanguageChange) {
        window.removeEventListener("language-changed", handleLanguageChange);
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
        <!-- Interactive 3D Wave Grid Canvas -->
        <canvas
            ref="gridCanvas"
            class="absolute inset-0 pointer-events-none z-0 transition-colors duration-300 radial-mask"
        ></canvas>
        <!-- Floating 3D Cubes -->
        <FloatingCube
            :initialXPercent="0.75"
            :initialYPercent="0.25"
            :sizeFactor="1.0"
        />
        <FloatingCube
            :initialXPercent="0.15"
            :initialYPercent="0.55"
            :sizeFactor="0.65"
        />
        <FloatingCube
            :initialXPercent="0.85"
            :initialYPercent="0.65"
            :sizeFactor="0.45"
        />
        <!-- Radial Glow Overlay -->
        <div class="absolute inset-0 pointer-events-none radial-glow z-0"></div>

        <!-- Camera Viewfinder HUD Overlay -->
        <div
            class="absolute inset-0 pointer-events-none z-10 font-mono text-[9px] sm:text-[10px] font-bold tracking-widest text-black/25 dark:text-[#EFEEE8]/25 select-none viewfinder-hud"
        >
            <!-- Bottom Left: AF & Specs -->
            <div
                class="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 lg:bottom-14 lg:left-14 flex flex-col gap-1 text-left"
            >
                <!-- Clock (HH:MM:SS) -->
                <div
                    class="font-mono text-xs sm:text-sm font-bold tracking-wider leading-none mb-0.5"
                >
                    {{ currentTime }}
                </div>
                <!-- Day and Date -->
                <div
                    class="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest leading-none mb-2.5 opacity-80"
                >
                    {{ currentDay }}, {{ currentDate }}
                </div>
                <div>AF-C [TRACKING]</div>
                <div class="opacity-80">ISO 400 | F2.8 | 1/125S</div>
            </div>

            <!-- Bottom Right: Audio Level Meter -->
            <div
                class="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 lg:bottom-14 lg:right-14 flex flex-col gap-1 text-right"
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

        <!-- Cyber Bezel and Brackets Border Overlay (Desktop Only) -->
        <div
            class="absolute inset-0 pointer-events-none z-20 hidden lg:block text-[#0E0D0B] dark:text-[#EFEEE8]"
        >
            <!-- Corner Brackets -->
            <!-- Top-Left Corner Bracket -->
            <svg
                class="absolute top-[112px] left-8 w-24 h-24"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 0 72 V 24 L 24 0 H 72"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="opacity-80"
                />
                <path
                    d="M 8 64 V 28 L 28 8 H 64"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-30"
                    stroke-dasharray="4 2"
                />
                <path
                    d="M 7 21 L 21 7"
                    stroke="currentColor"
                    stroke-width="3.5"
                    class="opacity-95"
                />
                <line
                    x1="0"
                    y1="40"
                    x2="6"
                    y2="40"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <line
                    x1="40"
                    y1="0"
                    x2="40"
                    y2="6"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <circle
                    cx="16"
                    cy="16"
                    r="1.5"
                    fill="currentColor"
                    class="opacity-60"
                />
                <circle
                    cx="22"
                    cy="22"
                    r="1"
                    fill="currentColor"
                    class="opacity-30"
                />
            </svg>

            <!-- Top-Right Corner Bracket -->
            <svg
                class="absolute top-[112px] right-8 w-24 h-24"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 96 72 V 24 L 72 0 H 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="opacity-80"
                />
                <path
                    d="M 88 64 V 28 L 68 8 H 32"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-30"
                    stroke-dasharray="4 2"
                />
                <path
                    d="M 89 21 L 75 7"
                    stroke="currentColor"
                    stroke-width="3.5"
                    class="opacity-95"
                />
                <line
                    x1="96"
                    y1="40"
                    x2="90"
                    y2="40"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <line
                    x1="56"
                    y1="0"
                    x2="56"
                    y2="6"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <circle
                    cx="80"
                    cy="16"
                    r="1.5"
                    fill="currentColor"
                    class="opacity-60"
                />
                <circle
                    cx="74"
                    cy="22"
                    r="1"
                    fill="currentColor"
                    class="opacity-30"
                />
            </svg>

            <!-- Bottom-Left Corner Bracket -->
            <svg
                class="absolute bottom-8 left-8 w-24 h-24"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 0 24 V 72 L 24 96 H 72"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="opacity-80"
                />
                <path
                    d="M 8 32 V 68 L 28 88 H 64"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-30"
                    stroke-dasharray="4 2"
                />
                <path
                    d="M 7 75 L 21 89"
                    stroke="currentColor"
                    stroke-width="3.5"
                    class="opacity-95"
                />
                <line
                    x1="0"
                    y1="56"
                    x2="6"
                    y2="56"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <line
                    x1="40"
                    y1="96"
                    x2="40"
                    y2="90"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <circle
                    cx="16"
                    cy="80"
                    r="1.5"
                    fill="currentColor"
                    class="opacity-60"
                />
                <circle
                    cx="22"
                    cy="74"
                    r="1"
                    fill="currentColor"
                    class="opacity-30"
                />
            </svg>

            <!-- Bottom-Right Corner Bracket -->
            <svg
                class="absolute bottom-8 right-8 w-24 h-24"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M 96 24 V 72 L 72 96 H 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="opacity-80"
                />
                <path
                    d="M 88 32 V 68 L 68 88 H 32"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-30"
                    stroke-dasharray="4 2"
                />
                <path
                    d="M 89 75 L 75 89"
                    stroke="currentColor"
                    stroke-width="3.5"
                    class="opacity-95"
                />
                <line
                    x1="96"
                    y1="56"
                    x2="90"
                    y2="56"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <line
                    x1="56"
                    y1="96"
                    x2="56"
                    y2="90"
                    stroke="currentColor"
                    stroke-width="1"
                    class="opacity-50"
                />
                <circle
                    cx="80"
                    cy="80"
                    r="1.5"
                    fill="currentColor"
                    class="opacity-60"
                />
                <circle
                    cx="74"
                    cy="74"
                    r="1"
                    fill="currentColor"
                    class="opacity-30"
                />
            </svg>

            <!-- Outer Frame Connecting Lines -->
            <div
                class="absolute top-[112px] left-[104px] right-[104px] border-t border-current opacity-15"
            ></div>
            <div
                class="absolute bottom-8 left-[104px] right-[104px] border-b border-current opacity-15"
            ></div>
            <div
                class="absolute left-8 top-[184px] bottom-[104px] border-l border-current opacity-15"
            ></div>
            <div
                class="absolute right-8 top-[184px] bottom-[104px] border-r border-current opacity-15"
            ></div>

            <!-- Top Center HUD Label (Masks the top border) -->
            <div
                class="absolute top-[112px] left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-[#EFEEE8] dark:bg-[#0E0D0B] font-mono text-[9px] tracking-[0.25em] opacity-60 transition-colors duration-300 select-none uppercase"
            >
                PORTOFOLIO
            </div>

            <!-- Bottom Center Alignment Scale (Masks the bottom border) -->
            <div
                class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-3.5 pb-px bg-[#EFEEE8] dark:bg-[#0E0D0B] px-4 transition-colors duration-300"
            >
                <div class="w-[1px] h-3 bg-current opacity-40"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-2.5 bg-current opacity-35"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-3.5 bg-current opacity-55"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-2.5 bg-current opacity-35"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-1.5 bg-current opacity-25"></div>
                <div class="w-[1px] h-3 bg-current opacity-40"></div>
            </div>

            <!-- Left Side Vertical Focus Scale (Masks the left border) -->
            <div
                class="absolute left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#EFEEE8] dark:bg-[#0E0D0B] py-3 px-1 transition-colors duration-300"
            >
                <svg
                    class="w-4 h-32 opacity-35"
                    viewBox="0 0 16 128"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M 0 0 V 128"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                    <path
                        d="M 0 16 H 8 M 0 32 H 4 M 0 48 H 4 M 0 64 H 12 M 0 80 H 4 M 0 96 H 4 M 0 112 H 8"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                </svg>
            </div>
            <div
                class="absolute left-10 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-widest text-current opacity-35 select-none"
                style="writing-mode: vertical-lr; transform: rotate(180deg)"
            >
                [ELEVATION_MTR]
            </div>

            <!-- Right Side Vertical Focus Scale (Masks the right border) -->
            <div
                class="absolute right-8 top-1/2 -translate-y-1/2 translate-x-1/2 bg-[#EFEEE8] dark:bg-[#0E0D0B] py-3 px-1 transition-colors duration-300"
            >
                <svg
                    class="w-4 h-32 opacity-35"
                    viewBox="0 0 16 128"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M 16 0 V 128"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                    <path
                        d="M 8 16 H 16 M 12 32 H 16 M 12 48 H 16 M 4 64 H 16 M 12 80 H 16 M 12 96 H 16 M 8 112 H 16"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                </svg>
            </div>
            <div
                class="absolute right-10 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-widest text-current opacity-35 select-none"
                style="writing-mode: vertical-lr"
            >
                [EXPOSURE_VAL]
            </div>
        </div>

        <!-- Main Content Container with Technical Frame -->
        <div
            class="z-10 relative px-8 py-6 sm:px-12 sm:py-9 md:px-20 md:py-14 flex flex-col items-center justify-center max-w-4xl mx-auto greeting-content bg-white/[0.00] dark:bg-white/[0.00] backdrop-blur-[2px] border border-black/10 dark:border-white/[0.08] rounded-lg shadow-sm"
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

.radial-mask {
    mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 85%);
    -webkit-mask-image: radial-gradient(
        circle at 50% 50%,
        black 30%,
        transparent 85%
    );
}

.animate-caret-blink {
    animation: blink 1s step-end infinite;
}

.animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
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

/* Viewfinder HUD styling */
.viewfinder-hud {
}

/* Greeting Content styling */
.greeting-content {
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
.dark .radial-glow {
    background: radial-gradient(
        circle at 50% 40%,
        rgba(255, 255, 255, 0.045) 0%,
        transparent 60%
    ) !important;
}
</style>
