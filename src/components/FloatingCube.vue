<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

// Component props to support multiple cubes with different positions and sizes
const props = withDefaults(
    defineProps<{
        initialXPercent?: number; // Initial position X ratio (0 to 1)
        initialYPercent?: number; // Initial position Y ratio (0 to 1)
        sizeFactor?: number;      // Scaling multiplier (e.g. 1.0, 0.65, 0.5)
    }>(),
    {
        initialXPercent: 0.75,
        initialYPercent: 0.3,
        sizeFactor: 1.0,
    }
);

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Make canvas size scale based on sizeFactor
const size = ref(
    typeof window !== "undefined" && window.innerWidth < 768
        ? Math.round(130 * props.sizeFactor)
        : Math.round(200 * props.sizeFactor)
);

const x = ref(0);
const y = ref(0);
const isDragging = ref(false);
const isHovered = ref(false);
const chromaticIntensity = ref(0);
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

// Physics states
let vx = 0;
let vy = 0;
let targetX = 0;
let targetY = 0;
let collisionFlash = 0; // Flash decay factor (0 to 1) triggered on bounces

// Rotation states
let angleX = Math.random() * Math.PI;
let angleY = Math.random() * Math.PI;
let angleZ = Math.random() * Math.PI;
let spinSpeedX = 0.005;
let spinSpeedY = 0.008;
let spinSpeedZ = 0.003;

// Drag tracking
let dragStartX = 0;
let dragStartY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let lastTime = 0;

// 3D Geometry: Cube (Centered around origin)
const vertices = [
    { x: -0.65, y: -0.65, z: -0.65 }, // 0
    { x: 0.65, y: -0.65, z: -0.65 },  // 1
    { x: 0.65, y: 0.65, z: -0.65 },   // 2
    { x: -0.65, y: 0.65, z: -0.65 },  // 3
    { x: -0.65, y: -0.65, z: 0.65 },  // 4
    { x: 0.65, y: -0.65, z: 0.65 },   // 5
    { x: 0.65, y: 0.65, z: 0.65 },    // 6
    { x: -0.65, y: 0.65, z: 0.65 }    // 7
];

const edges = [
    // Back face
    [0, 1], [1, 2], [2, 3], [3, 0],
    // Front face
    [4, 5], [5, 6], [6, 7], [7, 4],
    // Sides
    [0, 4], [1, 5], [2, 6], [3, 7]
];

// Helper rotation functions
const rotateX = (v: typeof vertices[0], angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x,
        y: v.y * cos - v.z * sin,
        z: v.y * sin + v.z * cos
    };
};

const rotateY = (v: typeof vertices[0], angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos + v.z * sin,
        y: v.y,
        z: -v.x * sin + v.z * cos
    };
};

const rotateZ = (v: typeof vertices[0], angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos,
        z: v.z
    };
};

// Perspective projection
const project = (v: typeof vertices[0], w: number, h: number, scale: number) => {
    const fov = 3.0;
    const distance = fov + v.z;
    const factor = scale / distance;
    return {
        x: w / 2 + v.x * factor,
        y: h / 2 - v.y * factor
    };
};

// Get parent dimensions dynamically
const getParentDimensions = () => {
    const parent = containerRef.value?.parentElement;
    return {
        width: parent ? parent.clientWidth : window.innerWidth,
        height: parent ? parent.clientHeight : window.innerHeight
    };
};

// Interactive drag triggers
const onMouseDown = (e: MouseEvent) => {
    isDragging.value = true;
    dragStartX = e.clientX - x.value;
    dragStartY = e.clientY - y.value;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastTime = performance.now();
    vx = 0;
    vy = 0;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
};

const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    
    // Constrain drag within parent section walls
    const { width: pWidth, height: pHeight } = getParentDimensions();
    const isDesktop = pWidth >= 1024;
    const topMargin = isDesktop ? 112 : 80;
    const sideMargin = 16;
    const rightLimit = pWidth - size.value - sideMargin;
    const bottomLimit = pHeight - size.value - sideMargin;

    x.value = Math.max(sideMargin, Math.min(rightLimit, e.clientX - dragStartX));
    y.value = Math.max(topMargin, Math.min(bottomLimit, e.clientY - dragStartY));
    targetX = x.value;
    targetY = y.value;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        
        // Track velocity
        vx = dx;
        vy = dy;

        // Increase spin speed proportionally during drag moves
        spinSpeedX = spinSpeedX * 0.9 + dy * 0.003;
        spinSpeedY = spinSpeedY * 0.9 + dx * 0.003;
    }
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastTime = now;
};

const onMouseUp = () => {
    isDragging.value = false;
    
    // Clamp throwing velocity to prevent flying off screen instantly
    vx = Math.max(-20, Math.min(20, vx));
    vy = Math.max(-20, Math.min(20, vy));
    
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
};

// Touch support for mobile viewport
const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 0) return;
    isDragging.value = true;
    const touch = e.touches[0];
    dragStartX = touch.clientX - x.value;
    dragStartY = touch.clientY - y.value;
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;
    lastTime = performance.now();
    vx = 0;
    vy = 0;
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
};

const onTouchMove = (e: TouchEvent) => {
    if (!isDragging.value || e.touches.length === 0) return;
    const touch = e.touches[0];
    
    // Constrain touch move within parent section walls
    const { width: pWidth, height: pHeight } = getParentDimensions();
    const isDesktop = pWidth >= 1024;
    const topMargin = isDesktop ? 112 : 80;
    const sideMargin = 12;
    const rightLimit = pWidth - size.value - sideMargin;
    const bottomLimit = pHeight - size.value - sideMargin;

    x.value = Math.max(sideMargin, Math.min(rightLimit, touch.clientX - dragStartX));
    y.value = Math.max(topMargin, Math.min(bottomLimit, touch.clientY - dragStartY));
    targetX = x.value;
    targetY = y.value;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt > 0) {
        const dx = touch.clientX - lastMouseX;
        const dy = touch.clientY - lastMouseY;
        vx = dx;
        vy = dy;
        spinSpeedX = spinSpeedX * 0.9 + dy * 0.003;
        spinSpeedY = spinSpeedY * 0.9 + dx * 0.003;
    }
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;
    lastTime = now;
};

const onTouchEnd = () => {
    isDragging.value = false;
    vx = Math.max(-15, Math.min(15, vx));
    vy = Math.max(-15, Math.min(15, vy));
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
};

let animationFrameId = 0;
const frameInterval = 1000 / 30; // Cap decorative animation at 30 FPS to save CPU/GPU
let lastFrameTime = 0;

onMounted(() => {
    // Initial spawning coordinates relative to parent viewport
    const { width: pWidth, height: pHeight } = getParentDimensions();
    x.value = pWidth * props.initialXPercent - size.value / 2;
    y.value = pHeight * props.initialYPercent - size.value / 2;
    targetX = x.value;
    targetY = y.value;

    // Initialize with a slow random drift velocity
    const initialAngle = Math.random() * Math.PI * 2;
    const initialSpeed = 0.15 + Math.random() * 0.15;
    vx = Math.cos(initialAngle) * initialSpeed;
    vy = Math.sin(initialAngle) * initialSpeed;

    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = (timestamp: number) => {
        if (!isVisible.value) return;

        const elapsed = timestamp - lastFrameTime;
        if (elapsed < frameInterval) {
            animationFrameId = requestAnimationFrame(tick);
            return;
        }
        lastFrameTime = timestamp - (elapsed % frameInterval);

        const now = performance.now();
        const isDark = document.documentElement.classList.contains("dark");
        const { width: pWidth, height: pHeight } = getParentDimensions();

        // 1. Update positions (Physics loop)
        if (!isDragging.value) {
            let speed = Math.sqrt(vx * vx + vy * vy);
            const maxDriftSpeed = 0.32;
            const minDriftSpeed = 0.12;

            if (speed > maxDriftSpeed) {
                // Apply decay to high speeds (e.g. from user throw)
                vx *= 0.96;
                vy *= 0.96;
            } else {
                // Apply a tiny random walk acceleration to drift slowly
                vx += (Math.random() - 0.5) * 0.015;
                vy += (Math.random() - 0.5) * 0.015;

                // Clamp speed to drift range
                speed = Math.sqrt(vx * vx + vy * vy);
                if (speed < minDriftSpeed) {
                    if (speed > 0.001) {
                        vx = (vx / speed) * minDriftSpeed;
                        vy = (vy / speed) * minDriftSpeed;
                    } else {
                        const angle = Math.random() * Math.PI * 2;
                        vx = Math.cos(angle) * minDriftSpeed;
                        vy = Math.sin(angle) * minDriftSpeed;
                    }
                } else if (speed > maxDriftSpeed) {
                    vx = (vx / speed) * maxDriftSpeed;
                    vy = (vy / speed) * maxDriftSpeed;
                }
            }

            // Apply velocities
            targetX += vx;
            targetY += vy;

            // Section boundary bounce physics
            const isDesktop = pWidth >= 1024;
            const topMargin = isDesktop ? 112 : 80;
            const sideMargin = 16;
            
            const rightLimit = pWidth - size.value - sideMargin;
            const bottomLimit = pHeight - size.value - sideMargin;

            let hitBoundary = false;

            if (targetX < sideMargin) {
                targetX = sideMargin;
                vx = -vx * 0.75;
                spinSpeedY += vx * 0.05; // Transform linear speed to spin speed
                hitBoundary = true;
            }
            if (targetX > rightLimit) {
                targetX = rightLimit;
                vx = -vx * 0.75;
                spinSpeedY -= vx * 0.05;
                hitBoundary = true;
            }
            if (targetY < topMargin) {
                targetY = topMargin;
                vy = -vy * 0.75;
                spinSpeedX += vy * 0.05;
                hitBoundary = true;
            }
            if (targetY > bottomLimit) {
                targetY = bottomLimit;
                vy = -vy * 0.75;
                spinSpeedX -= vy * 0.05;
                hitBoundary = true;
            }

            if (hitBoundary) {
                collisionFlash = 1.0; // Trigger collision flash and chromatic spike
                
                // Ensure speed is within drift bounds after a bounce dampening
                const postBounceSpeed = Math.sqrt(vx * vx + vy * vy);
                if (postBounceSpeed < minDriftSpeed && postBounceSpeed > 0.001) {
                    vx = (vx / postBounceSpeed) * minDriftSpeed;
                    vy = (vy / postBounceSpeed) * minDriftSpeed;
                }
            }

            x.value = targetX;
            y.value = targetY;
        }

        // 2. Decay flash factor
        collisionFlash *= 0.88;

        // 3. Update spins and angles
        angleX += spinSpeedX;
        angleY += spinSpeedY;
        angleZ += spinSpeedZ;

        // Slow down spinning back to a gentle idle rotation
        const idleX = 0.004;
        const idleY = 0.006;
        const idleZ = 0.002;
        spinSpeedX = spinSpeedX * 0.97 + idleX * 0.03;
        spinSpeedY = spinSpeedY * 0.97 + idleY * 0.03;
        spinSpeedZ = spinSpeedZ * 0.97 + idleZ * 0.03;

        // 4. Chromatic Aberration Intensity Transition (fade in / out)
        const targetIntensity = (isHovered.value || isDragging.value) ? 1.0 : 0.0;
        chromaticIntensity.value += (targetIntensity - chromaticIntensity.value) * 0.16;

        // 5. Render Cube
        ctx.clearRect(0, 0, size.value, size.value);

        // Project 3D points
        const scaleVal = size.value * 0.44; // scaling factor
        const projectedPoints = vertices.map(v => {
            let rotated = rotateX(v, angleX);
            rotated = rotateY(rotated, angleY);
            rotated = rotateZ(rotated, angleZ);
            return project(rotated, size.value, size.value, scaleVal);
        });

        // Drawing helper
        const drawWireframe = (dx: number, dy: number, strokeColor: string, isBloom = false) => {
            // Apply extra shadowBlur bloom during collision flashes
            ctx.shadowBlur = isBloom 
                ? (16 * (1.0 + chromaticIntensity.value * 0.4)) + (collisionFlash * 25) 
                : 0;
            ctx.shadowColor = strokeColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = isBloom ? 1.5 : 1.0;

            edges.forEach(edge => {
                const p1 = projectedPoints[edge[0]];
                const p2 = projectedPoints[edge[1]];
                if (!p1 || !p2) return;
                ctx.beginPath();
                ctx.moveTo(p1.x + dx, p1.y + dy);
                ctx.lineTo(p2.x + dx, p2.y + dy);
                ctx.stroke();
            });
        };

        const mainColor = isDark ? "rgba(255, 255, 255, 0.95)" : "rgba(14, 13, 11, 0.90)";

        // A. Always draw the main glowing cube in the center (boosted bloom on collision)
        drawWireframe(0, 0, mainColor, true);

        // B. Overlay chromatic aberration fringes (spikes momentarily on border hits)
        const activeIntensity = Math.max(chromaticIntensity.value, collisionFlash);
        if (activeIntensity > 0.02) {
            ctx.globalCompositeOperation = isDark ? "screen" : "source-over";

            // Increased offset factor for more visible, premium split (proportional to canvas size)
            const offsetFactor = size.value * 0.018;
            const totalOffset = (chromaticIntensity.value * offsetFactor) + (collisionFlash * 4.5);
            
            // Slightly increased opacities for better visual pop
            const alpha = (chromaticIntensity.value * (isDark ? 0.48 : 0.35)) + (collisionFlash * 0.4);
            const rColor = `rgba(255, 60, 60, ${alpha})`;
            const bColor = `rgba(60, 110, 255, ${alpha})`;

            // Draw Red channel (shifted top-left, no bloom to keep lines sharp and clean)
            drawWireframe(-totalOffset, -totalOffset, rColor, false);

            // Draw Blue channel (shifted bottom-right, no bloom)
            drawWireframe(totalOffset, totalOffset, bColor, false);

            ctx.globalCompositeOperation = "source-over";
        }

        animationFrameId = requestAnimationFrame(tick);
    };

    // Set up IntersectionObserver to play/pause the animation loop dynamically based on viewport visibility
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!isVisible.value) {
                    isVisible.value = true;
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = requestAnimationFrame(tick);
                }
            } else {
                isVisible.value = false;
                cancelAnimationFrame(animationFrameId);
            }
        });
    }, {
        root: null,
        threshold: 0.01,
    });

    if (containerRef.value) {
        observer.observe(containerRef.value);
    }
});

const onMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
        isHovered.value = true;
    }
};

const onMouseLeave = () => {
    isHovered.value = false;
};

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    if (observer) {
        observer.disconnect();
    }
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
});
</script>

<template>
    <div
        ref="containerRef"
        class="absolute pointer-events-auto select-none floating-cube z-20"
        :style="{
            left: `${x}px`,
            top: `${y}px`,
            width: `${size}px`,
            height: `${size}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
        }"
        @mousedown="onMouseDown"
        @touchstart="onTouchStart"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <canvas
            ref="canvasRef"
            :width="size"
            :height="size"
            class="w-full h-full block"
        ></canvas>
    </div>
</template>

<style scoped>
.floating-cube {
    will-change: left, top;
    transition: cursor 0.1s ease;
}
</style>
