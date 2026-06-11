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
const radialBlurRef = ref<HTMLDivElement | null>(null);
const loaderContentRef = ref<HTMLDivElement | null>(null);

let cleanup: (() => void) | null = null;

onMounted(() => {
  const startTime = Date.now();

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

  // 3. Loading screen duration (slides up after 11.2 seconds, allowing the explosion of the globe to finish and leaving a 200ms empty pause first)
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
  }, 11200);

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

  // Generate sphere particles using Fibonacci spiral with random speed attributes and scatter vectors for explosion
  const particles: { 
    x: number; 
    y: number; 
    z: number; 
    rSpeed: number;
    scatterX: number;
    scatterY: number;
    scatterZ: number;
  }[] = [];
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

    // Random scattering direction offset for a natural explosion look
    const scatterX = (Math.random() - 0.5) * 0.35;
    const scatterY = (Math.random() - 0.5) * 0.35;
    const scatterZ = (Math.random() - 0.5) * 0.35;

    particles.push({ 
      x, 
      y, 
      z,
      rSpeed: 0.5 + Math.random() * 1.0, // Random scattering speed factor
      scatterX,
      scatterY,
      scatterZ
    });
  }

  let angleY = 0;
  let angleX = 0.41; // 23.5 degrees (0.41 rad) tilt matching Earth's axis

  const render = () => {
    const elapsedTime = Date.now() - startTime;

    // Timing configurations
    const T_accel = 10000;            // Acceleration phase: 10.0 seconds
    const T_explosion_start = 10000;  // Explosion starts at 10.0 seconds
    const T_explosion_duration = 1000;// Explosion lasts 1.0 second (fades completely during slide-up)

    // Calculate explosion progress (ease-out cubic progression)
    let rawExplosion = 0;
    if (elapsedTime > T_explosion_start) {
      rawExplosion = Math.min(1, (elapsedTime - T_explosion_start) / T_explosion_duration);
    }
    const easeOutExplode = 1 - Math.pow(1 - rawExplosion, 3); // Instant burst, then deceleration

    // 1. Calculate rotation angle (frame-rate independent integrated ease-in sine curve)
    const baseSpeed = 0.004;
    const maxSpeed = 0.28;             // Faster peak speed for intense motion blur
    const tickDuration = 16.666;       // Target 60fps frame duration in ms
    const totalTicks = elapsedTime / tickDuration;

    if (elapsedTime <= T_accel) {
      const p = elapsedTime / T_accel;
      // Integrated sine ease-in: p - (2 / PI) * sin(p * PI / 2)
      const integratedEase = p - (2 / Math.PI) * Math.sin(p * Math.PI / 2);
      angleY = totalTicks * baseSpeed + (T_accel / tickDuration) * (maxSpeed - baseSpeed) * integratedEase;
    } else {
      const maxEase = 1 - 2 / Math.PI;
      const angleAtPeak = (T_accel / tickDuration) * baseSpeed + (T_accel / tickDuration) * (maxSpeed - baseSpeed) * maxEase;
      angleY = angleAtPeak + ((elapsedTime - T_accel) / tickDuration) * maxSpeed;
    }

    // 2. Calculate speed ratio for motion blur
    let speedRatio = 0;
    if (elapsedTime <= T_accel) {
      const p = elapsedTime / T_accel;
      speedRatio = 1 - Math.cos(p * Math.PI / 2);
    } else {
      speedRatio = 1.0;
    }
    let blurAlpha = 1.0 - speedRatio * 0.94; // 1.0 (no blur) to 0.06 (intense blur at peak)

    // Ramp up blurAlpha to 1.0 during explosion to quickly clear motion trails
    if (rawExplosion > 0) {
      blurAlpha = blurAlpha + (1.0 - blurAlpha) * rawExplosion;
    }

    // 4. Update DOM element opacities directly for peak performance
    if (loaderContentRef.value) {
      loaderContentRef.value.style.opacity = String(Math.max(0, 1.0 - rawExplosion * 1.5)); // Fades out slightly faster than particles
    }
    if (radialBlurRef.value) {
      radialBlurRef.value.style.opacity = String(Math.max(0, 1.0 - rawExplosion));
    }

    const isDark = document.documentElement.classList.contains('dark');
    
    // Clear canvas or draw accumulative background overlay for motion blur
    if (blurAlpha < 1.0) {
      ctx.fillStyle = isDark ? `rgba(14, 13, 11, ${blurAlpha})` : `rgba(239, 238, 232, ${blurAlpha})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    const color = isDark ? '255, 255, 255' : '0, 0, 0';
    const sphereRadius = Math.min(width, height) * 0.28;

    // Keep centered
    let posX = width / 2;

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    // Project particles
    const projected = particles.map(p => {
      // Y-axis rotation
      let rx = p.x * cosY - p.z * sinY;
      let rz = p.z * cosY + p.x * sinY;

      // X-axis tilt rotation
      let ry = p.y * cosX - rz * sinX;
      rz = rz * cosX + p.y * sinX;

      // Apply explosive expansion with random scattering
      const explodeScale = 1.0 + easeOutExplode * 8.5 * p.rSpeed;
      const ex = rx * explodeScale + p.scatterX * easeOutExplode * 1.5;
      const ey = ry * explodeScale + p.scatterY * easeOutExplode * 1.5;
      const ez = rz * explodeScale + p.scatterZ * easeOutExplode * 1.5;

      const screenX = posX + ex * sphereRadius;
      const screenY = (height / 2) + ey * sphereRadius;

      return {
        x: screenX,
        y: screenY,
        z: rz, // Use un-exploded depth to preserve sorting order and depth sizes
        rawExplosion
      };
    });

    // Depth sort (draw back particles first)
    projected.sort((a, b) => b.z - a.z);

    // Draw particles
    projected.forEach(p => {
      const depth = (p.z + 1.2) / 2.4; // Normalized depth
      let opacity = 0.12 + depth * 0.78;
      
      // Fade out opacity dynamically during explosion
      if (p.rawExplosion > 0) {
        opacity = Math.max(0, opacity * (1.0 - p.rawExplosion));
      }

      const size = 0.45 + depth * 0.8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${color}, ${opacity})`;
      ctx.fill();
    });

    // 5. Draw Canvas Shockwaves
    if (rawExplosion > 0) {
      // Shockwave 1: Outer fast shockwave
      ctx.beginPath();
      const sw1Progress = Math.pow(rawExplosion, 0.5); // fast expansion
      const shockwaveRadius1 = sphereRadius * (1.0 + sw1Progress * 3.5);
      ctx.arc(posX, height / 2, shockwaveRadius1, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(${color}, ${0.35 * (1.0 - rawExplosion)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Shockwave 2: Inner thicker shockwave
      if (rawExplosion > 0.15) {
        const sw2Progress = (rawExplosion - 0.15) / 0.85;
        ctx.beginPath();
        const shockwaveRadius2 = sphereRadius * (1.0 + Math.pow(sw2Progress, 0.4) * 2.0);
        ctx.arc(posX, height / 2, shockwaveRadius2, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(${color}, ${0.2 * (1.0 - sw2Progress)})`;
        ctx.lineWidth = 3.0;
        ctx.stroke();
      }
    }

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
    <div ref="radialBlurRef" class="radial-blur-bg"></div>

    <!-- Main Loader Content -->
    <div ref="loaderContentRef" class="relative z-20 flex flex-col items-center select-none">
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
