<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

let cleanup: (() => void) | null = null;

const createTextTexture = (isDark: boolean) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    
    // Smooth text drawing
    ctx.fillStyle = isDark ? '#ffffff' : '#0e0d0b';
    ctx.font = 'bold 58px "Geist Variable", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('esc', 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const initThree = () => {
  const container = containerRef.value;
  const canvas = canvasRef.value;
  if (!container || !canvas) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 2.5, 4.5);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.autoRotate = true; // Slowly spin when user is idle
  controls.autoRotateSpeed = 1.0;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Focus lights
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight2.position.set(-5, 3, -5);
  scene.add(dirLight2);

  // Specular light panels (for nice glossy white edge highlights)
  const panelGeom = new THREE.PlaneGeometry(8, 1.5);
  const panelMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  
  const panel1 = new THREE.Mesh(panelGeom, panelMat);
  panel1.position.set(3, 4, 3);
  panel1.lookAt(0, 0, 0);
  scene.add(panel1);

  const panel2 = new THREE.Mesh(panelGeom, panelMat);
  panel2.position.set(-3, 4, -3);
  panel2.lookAt(0, 0, 0);
  scene.add(panel2);

  // Create Keycap Mesh procedurally
  // width 2, height 1.3, depth 2.
  const geometry = new THREE.BoxGeometry(1.8, 1.2, 1.8, 8, 8, 8);
  const posAttr = geometry.attributes.position;
  
  // Taper and dish the geometry mathematically
  for (let i = 0; i < posAttr.count; i++) {
    let x = posAttr.getX(i);
    let y = posAttr.getY(i);
    let z = posAttr.getZ(i);

    // Height Y goes from -0.6 to +0.6
    const t = (y + 0.6) / 1.2; // 0 to 1
    
    // Taper top to 72% of base
    const scale = 1.0 - t * 0.28;
    posAttr.setX(i, x * scale);
    posAttr.setZ(i, z * scale);

    // Concave dish on top face
    if (y > 0.58) {
      const r = Math.sqrt(x*x + z*z);
      const scoop = 0.12 * Math.max(0, 1 - (r / 0.7));
      posAttr.setY(i, y - scoop);
    }
  }
  geometry.computeVertexNormals();

  // Theme Detection
  const getIsDark = () => document.documentElement.classList.contains('dark');
  let isDark = getIsDark();

  // Glass Material Parameters
  const glassOptions = {
    color: 0xffffff,
    transmission: 0.95,
    opacity: 1.0,
    transparent: true,
    roughness: 0.05,
    metalness: 0.0,
    ior: 1.52,
    thickness: 1.2,
    specularIntensity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  };

  const glassMaterial = new THREE.MeshPhysicalMaterial(glassOptions);
  
  let textTexture = createTextTexture(isDark);
  const topMaterial = new THREE.MeshPhysicalMaterial({
    ...glassOptions,
    map: textTexture,
  });

  const materials = [
    glassMaterial, // +x
    glassMaterial, // -x
    topMaterial,   // +y
    glassMaterial, // -y
    glassMaterial, // +z
    glassMaterial, // -z
  ];

  const keycapMesh = new THREE.Mesh(geometry, materials);
  scene.add(keycapMesh);

  // Animation Loop
  let animationFrameId: number;
  
  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();

  const handleResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  // Watch for theme changes to update text texture color
  const themeObserver = new MutationObserver(() => {
    const nextDark = getIsDark();
    if (nextDark !== isDark) {
      isDark = nextDark;
      textTexture.dispose();
      textTexture = createTextTexture(isDark);
      topMaterial.map = textTexture;
      topMaterial.needsUpdate = true;
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  return () => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationFrameId);
    themeObserver.disconnect();
    geometry.dispose();
    glassMaterial.dispose();
    topMaterial.dispose();
    textTexture.dispose();
    controls.dispose();
    renderer.dispose();
  };
};

onMounted(() => {
  cleanup = initThree();
});

onUnmounted(() => {
  if (cleanup) cleanup();
});
</script>

<template>
  <div class="w-full max-w-sm aspect-square relative mx-auto select-none hud-panel-3d rounded-xl">
    <!-- Top-Left Corner Bracket -->
    <svg class="absolute top-0 left-0 text-black/20 dark:text-white/20 pointer-events-none" width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 1 32 V 1 H 32" stroke="currentColor" stroke-width="1.5" />
      <rect x="8" y="-1" width="8" height="3" fill="currentColor" />
      <rect x="-1" y="8" width="3" height="8" fill="currentColor" />
    </svg>
    <!-- Top-Right Corner Bracket -->
    <svg class="absolute top-0 right-0 text-black/20 dark:text-white/20 pointer-events-none" width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 31 32 V 1 H 0" stroke="currentColor" stroke-width="1.5" />
      <rect x="10" y="-1" width="8" height="3" fill="currentColor" />
      <rect x="29" y="8" width="3" height="8" fill="currentColor" />
    </svg>
    <!-- Bottom-Left Corner Bracket -->
    <svg class="absolute bottom-0 left-0 text-black/20 dark:text-white/20 pointer-events-none" width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 1 0 V 31 H 32" stroke="currentColor" stroke-width="1.5" />
      <rect x="8" y="29" width="8" height="3" fill="currentColor" />
      <rect x="-1" y="10" width="3" height="8" fill="currentColor" />
    </svg>
    <!-- Bottom-Right Corner Bracket -->
    <svg class="absolute bottom-0 right-0 text-black/20 dark:text-white/20 pointer-events-none" width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 31 0 V 31 H 0" stroke="currentColor" stroke-width="1.5" />
      <rect x="10" y="29" width="8" height="3" fill="currentColor" />
      <rect x="29" y="10" width="3" height="8" fill="currentColor" />
    </svg>

    <!-- Canvas Container -->
    <div ref="containerRef" class="w-full h-full cursor-grab active:cursor-grabbing">
      <canvas ref="canvasRef" class="w-full h-full block"></canvas>
    </div>

    <!-- Drag Instructions HUD overlay -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-center bg-black/5 dark:bg-white/5 px-3 py-1 rounded border border-black/5 dark:border-white/5 backdrop-blur-sm">
      <span class="text-[9px] font-bold tracking-widest uppercase text-black/40 dark:text-white/40">
        Hold & Drag to Rotate
      </span>
    </div>
  </div>
</template>

<style scoped>
.hud-panel-3d {
  border: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(239, 238, 232, 0.3);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

:global(html.dark) .hud-panel-3d {
  border: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(14, 13, 11, 0.3);
}
</style>
