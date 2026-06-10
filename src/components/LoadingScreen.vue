<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
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
const canvasRef = ref<HTMLCanvasElement | null>(null);

let cleanup: (() => void) | null = null;

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

  // 5. Canvas Particle Sphere
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let animationFrameId: number;
  let width = 0;
  let height = 0;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  // Keep sphere centered
  let posX = width / 2;

  // Generate sphere particles using Fibonacci spiral
  const particles: { x: number; y: number; z: number }[] = [];
  const particleCount = 2000;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = 2 * Math.PI * (2 - goldenRatio);

  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = angleIncrement * i;

    const x = Math.sin(inclination) * Math.cos(azimuth);
    const y = Math.sin(inclination) * Math.sin(azimuth);
    const z = Math.cos(inclination);

    particles.push({ x, y, z });
  }

  let angleY = 0;
  let angleX = 0.41; // 23.5 degrees (0.41 rad) tilt matching Earth's axis

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.classList.contains('dark');
    const color = isDark ? '255, 255, 255' : '0, 0, 0';
    const sphereRadius = Math.min(width, height) * 0.28;

    // Keep centered
    posX = width / 2;

    // Y-rotation speed (spinning like Earth, west to east)
    angleY += 0.004;

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    // Project particles
    const projected = particles.map(p => {
      // Y-axis rotation
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.z * cosY + p.x * sinY;

      // X-axis tilt rotation
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + p.y * sinX;

      const screenX = posX + x1 * sphereRadius;
      const screenY = (height / 2) + y2 * sphereRadius;

      return {
        x: screenX,
        y: screenY,
        z: z2
      };
    });

    // Depth sort (draw back particles first)
    projected.sort((a, b) => b.z - a.z);

    // Draw particles
    projected.forEach(p => {
      const depth = (p.z + 1.2) / 2.4; // Normalized depth
      const opacity = 0.12 + depth * 0.78;
      const size = 0.7 + depth * 1.5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${color}, ${opacity})`;
      ctx.fill();
    });

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  cleanup = () => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(animationFrameId);
  };
});

onUnmounted(() => {
  if (cleanup) cleanup();
});
</script>

<template>
  <div 
    v-if="showLoader"
    id="loading-screen"
    class="fixed inset-0 w-full h-full z-[9999] flex flex-col items-center justify-center bg-[#EFEEE8] dark:bg-[#0E0D0B] text-black dark:text-[#EFEEE8] transition-colors duration-300 font-sans overflow-hidden"
  >
    <!-- Background Canvas Particle Sphere -->
    <canvas 
      ref="canvasRef" 
      class="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60 dark:opacity-50"
    ></canvas>

    <!-- Fine Diagonal Line Overlay -->
    <div class="absolute inset-0 pointer-events-none z-5 loading-texture"></div>

    <!-- Radial Blur Background (Soft Feathered Circle) -->
    <div class="radial-blur-bg"></div>

    <!-- Main Loader Content -->
    <div class="relative z-20 flex flex-col items-center select-none">
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

/* Radial Blur Background */
.radial-blur-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85vw;
  height: 85vw;
  max-width: 380px;
  max-height: 380px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  background: radial-gradient(circle, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0) 70%);
  mask-image: radial-gradient(circle, black 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(circle, black 0%, transparent 70%);
  transition: background 0.3s ease;
}

:global(html.dark) .radial-blur-bg {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 70%);
}

/* Fine Diagonal Lines Texture */
.loading-texture {
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.03),
    rgba(0, 0, 0, 0.03) 1px,
    transparent 1px,
    transparent 4px
  );
}

:global(html.dark) .loading-texture {
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.02) 1px,
    transparent 1px,
    transparent 4px
  );
}
</style>
