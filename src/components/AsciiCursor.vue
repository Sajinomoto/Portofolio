<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  size: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  color: string;
  rotation: number;
  vRot: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Configuration & State
const chars = ['0', '1', '*', '+', '#', '@', '/>', '0x', '::', '{ }', '< >', 'SYS', '[ ]', '10', '01'];
const reticleChars = ['|', '/', '-', '\\'];

// Pure Monochrome (Black & White) palette
const darkColors = ['#FFFFFF', '#EFEEE8', '#E2E8F0', '#CBD5E1'];
const lightColors = ['#000000', '#0E0D0B', '#18181B', '#27272A'];

let particles: Particle[] = [];
let animFrameId: number | null = null;

let mouseX = -100;
let mouseY = -100;
let prevMouseX = -100;
let prevMouseY = -100;
let isHoveringInteractive = false;
let reticleRotIndex = 0;
let lastEmittedTime = 0;

let isDarkMode = true;
let isTouchDevice = false;

const checkDarkMode = () => {
  isDarkMode = document.documentElement.classList.contains('dark');
};

const spawnParticle = (x: number, y: number, isMove = true) => {
  if (isTouchDevice) return;

  const currentColors = isDarkMode ? darkColors : lightColors;
  const color = currentColors[Math.floor(Math.random() * currentColors.length)];
  const char = chars[Math.floor(Math.random() * chars.length)];
  
  const angle = Math.random() * Math.PI * 2;
  const speed = isMove ? 0.3 + Math.random() * 1.2 : 1 + Math.random() * 2;
  
  const size = char.length > 2 ? 10 + Math.random() * 3 : 12 + Math.random() * 5;
  const maxAlpha = 0.7 + Math.random() * 0.3;

  particles.push({
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 8,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (isMove ? 0.2 : 0),
    char,
    size,
    alpha: maxAlpha,
    maxAlpha,
    decay: 0.02 + Math.random() * 0.025,
    color,
    rotation: (Math.random() - 0.5) * 0.4,
    vRot: (Math.random() - 0.5) * 0.05
  });

  if (particles.length > 120) {
    particles.shift();
  }
};

const handleMouseMove = (e: MouseEvent) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Check if hovering over interactive elements
  const target = e.target as HTMLElement | null;
  if (target) {
    isHoveringInteractive = !!target.closest('a, button, [role="button"], input, textarea, select, .cursor-pointer, [tabindex="0"]');
  }

  const now = performance.now();
  const dist = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);

  // Interpolate particles along mouse movement line if moving fast
  if (dist > 8 && now - lastEmittedTime > 16) {
    const steps = Math.min(Math.floor(dist / 12), 4);
    for (let i = 1; i <= steps; i++) {
      const interpX = prevMouseX + (mouseX - prevMouseX) * (i / steps);
      const interpY = prevMouseY + (mouseY - prevMouseY) * (i / steps);
      spawnParticle(interpX, interpY);
    }
    lastEmittedTime = now;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
};

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
};

let frameCounter = 0;

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  frameCounter++;

  if (frameCounter % 15 === 0) {
    reticleRotIndex = (reticleRotIndex + 1) % reticleChars.length;
  }

  // Set Monochrome Glow properties
  const glowColor = isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.65)';
  const glowBlur = isDarkMode ? 8 : 6;

  // 1. Draw trail particles with shrinking size based on alpha
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.vRot;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    // Shrink size proportionally with alpha decay
    const alphaRatio = Math.max(0, p.alpha / p.maxAlpha);
    const currentSize = p.size * (0.2 + 0.8 * alphaRatio);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur * alphaRatio;
    ctx.font = `bold ${currentSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.char, 0, 0);
    ctx.restore();
  }

  // 2. Draw hover reticle around cursor when hovering over clickable items
  if (isHoveringInteractive && mouseX >= 0 && mouseY >= 0 && !isTouchDevice) {
    const reticleChar = reticleChars[reticleRotIndex];
    const color = isDarkMode ? '#FFFFFF' : '#000000';

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
    ctx.font = `bold 12px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw brackets & rotating center icon
    ctx.fillText(`[ ${reticleChar} ]`, mouseX + 16, mouseY + 16);
    ctx.restore();
  }

  animFrameId = requestAnimationFrame(render);
};

// MutationObserver for theme class changes
let themeObserver: MutationObserver | null = null;

onMounted(() => {
  isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  checkDarkMode();

  themeObserver = new MutationObserver(checkDarkMode);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  resizeCanvas();
  render();
});

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect();
  }
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('mousemove', handleMouseMove);
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
  }
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-[9998] transition-opacity duration-300"
  ></canvas>
</template>
