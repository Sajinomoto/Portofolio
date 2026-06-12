<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const containerRef = ref<HTMLDivElement | null>(null);
const asciiText = ref("");
const width = ref(120);
const height = ref(50);

const isVisible = ref(false);

// --- FADE-IN STATE ---
const isReady = ref(false);
let observer: IntersectionObserver | null = null;
let lastFrameTime = 0;
const fpsInterval = 1000 / 30; // Target 30 FPS for optimized CPU usage and retro low-fi aesthetic

// --- KEN PERLIN 3D IMPROVED NOISE IMPLEMENTATION ---
const p = new Uint8Array(512);
const permutation = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
    234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
    134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
    116, 188, 189, 134, 86, 62, 35, 68, 250, 24, 154, 223, 109, 101, 47, 128,
    193, 81, 22, 238, 95, 210, 140, 36, 66, 139, 164, 40, 119, 77, 247, 204, 8,
    252, 14, 97, 30, 24, 224, 196, 87, 174, 128, 125, 232, 83, 91, 30, 241, 51,
    73, 198, 189, 240, 12, 122, 203, 241, 120, 250, 216, 173, 197, 93, 31, 64,
    124, 182, 29, 85, 258, 51, 102, 110, 49, 177, 181, 90, 55, 39, 228, 221,
    201, 222, 84, 107, 23, 148, 86, 244, 120, 188, 142, 66, 211, 245, 61, 244,
    5, 247, 222, 77, 228, 229, 166, 111, 222, 34, 225, 129, 219, 54, 227, 88,
    64, 39, 110, 250, 5, 19, 73, 109, 47, 117, 122, 60, 43, 2, 101, 192, 212,
    178, 180, 194, 56, 128, 200, 196, 136, 75, 48, 27, 175, 70, 57, 172, 251,
    47, 80, 67, 111, 252, 129, 37, 173, 151, 198, 147, 74, 244, 40, 228, 99,
    228, 122, 60, 230, 22, 109, 69, 8, 229, 223, 128, 244, 240, 250, 222, 116,
    219, 252, 140, 36, 92, 41, 60, 210, 60, 211, 142, 68, 175, 69, 219, 83, 180,
    244, 229, 178, 168, 116, 69, 139, 133,
];
for (let i = 0; i < 256; i++) {
    p[i] = permutation[i];
    p[256 + i] = permutation[i];
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number) => a + t * (b - a);
const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};

const perlin3D = (x: number, y: number, z: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    return lerp(
        w,
        lerp(
            v,
            lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
            lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z)),
        ),
        lerp(
            v,
            lerp(
                u,
                grad(p[AA + 1], x, y, z - 1),
                grad(p[BA + 1], x - 1, y, z - 1),
            ),
            lerp(
                u,
                grad(p[AB + 1], x, y - 1, z - 1),
                grad(p[BB + 1], x - 1, y - 1, z - 1),
            ),
        ),
    );
};
// --------------------------------------------------

let animationFrameId: number;
let time = 0;

const updateGridSize = () => {
    if (!containerRef.value) return;
    const w = containerRef.value.clientWidth;
    const h = containerRef.value.clientHeight;
    // Monospace character dimensions matching CSS font-size (10px, approx 6px width) and line-height (9px)
    // We add a +4 character padding to ensure it always overflows slightly and clips, leaving absolutely no gaps.
    width.value = Math.ceil(w / 6.0) + 4;
    height.value = Math.ceil(h / 9.0) + 4;
};

const renderFrame = (timestamp: number = 0) => {
    if (!isVisible.value) return;

    // Request next frame
    animationFrameId = requestAnimationFrame(renderFrame);

    const elapsed = timestamp - lastFrameTime;
    // Cap calculation rate to 30 FPS to save device battery and CPU resources
    if (elapsed < fpsInterval) return;

    // Adjust last frame timestamp
    lastFrameTime = timestamp - (elapsed % fpsInterval);

    time += 0.007; // Slower noise speed for a calmer wave

    const w = width.value;
    const h = height.value;

    // Create empty screen buffer and z-buffer
    const screen = Array(h)
        .fill(null)
        .map(() => Array(w).fill(" "));
    const zBuffer = Array(h)
        .fill(null)
        .map(() => Array(w).fill(Infinity));

    // Detect mobile viewport width
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const aspectCorrection = isMobile ? 1.2 : 2.6;

    // Rectangular grid parameters - significantly reduced complexity on mobile to save resource
    const numX = isMobile ? 70 : 140; // 50% fewer grid points horizontally
    const numZ = isMobile ? 32 : 60;  // 46% fewer grid points vertically
    const spacingX = isMobile ? 1.6 : 2.4; // Narrower spacing on mobile
    const spacingZ = isMobile ? 1.2 : 1.4; // Narrower spacing on mobile

    // Camera configuration for a wide, elevated view of the terrain
    const pitch = 0.52;
    const yaw = 0.0; // Looking straight forward (no skewing)
    const camY = 12;
    const camZ = 52;
    const fov = 42;

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    for (let i = 0; i < numX; i++) {
        for (let j = 0; j < numZ; j++) {
            // 3D grid plane coordinates
            const x = (i - numX / 2) * spacingX;
            const z = (j - numZ / 2) * spacingZ;

            // Organic wave height - reduced height and frequency for a calmer wave
            let y = perlin3D(x * 0.05, z * 0.05, time * 0.7) * 4.5;
            y += perlin3D(x * 0.12, z * 0.12, time * 1.2) * 1.0;

            // 3D Rotations
            // Yaw
            const xRot = x * cosY - z * sinY;
            const zRotY = x * sinY + z * cosY;

            // Pitch
            const yRot = y * cosP - zRotY * sinP;
            const zRot = y * sinP + zRotY * cosP;

            // Camera Space Translation
            const transX = xRot;
            const transY = yRot + camY;
            const transZ = zRot + camZ;

            if (transZ <= 0) continue;

            // Perspective Projection with monospace aspect correction
            const screenX = Math.floor(w / 2 + (transX * fov * aspectCorrection) / transZ);
            const screenY = Math.floor(h / 2 + (transY * fov) / transZ);

            if (screenX >= 0 && screenX < w && screenY >= 0 && screenY < h) {
                if (transZ < zBuffer[screenY][screenX]) {
                    zBuffer[screenY][screenX] = transZ;

                    // Map depth to binary and ASCII symbol sets
                    let char = ".";
                    if (transZ < 33) char = "0";
                    else if (transZ < 41) char = "1";
                    else if (transZ < 49) char = "o";
                    else if (transZ < 57) char = "*";
                    else char = ".";

                    screen[screenY][screenX] = char;
                }
            }
        }
    }

    // --- SUNSET SUN GENERATION & RENDERING ---
    const sunRadius = isMobile ? 15.0 : 25.0;
    const sunSpacing = isMobile ? 1.0 : 0.5; // Wider spacing on mobile to reduce rendering iterations by 90%
    const sunHeight = isMobile ? 3.0 : 0.5; // Slightly higher on mobile to keep it visible above the wave horizon
    const yBob = Math.sin(time * 1.2) * 0.7; // Gentle bobbing
    const spin = time * 0.12; // Slow rotation of ASCII characters

    const cosSpin = Math.cos(spin);
    const sinSpin = Math.sin(spin);
    const zSun = 45.0; // Positioned behind the wave grid (horizon)

    const range = Math.ceil(sunRadius / sunSpacing);

    for (let i = -range; i <= range; i++) {
        for (let j = -range; j <= range; j++) {
            const u = i * sunSpacing;
            const v = j * sunSpacing;
            const r = Math.sqrt(u * u + v * v);

            if (r <= sunRadius) {
                // Spin the characters locally around center of sun
                const rx = u * cosSpin - v * sinSpin;
                const ry = u * sinSpin + v * cosSpin;

                // Standing upright in 3D world space at the back
                const x = rx;
                const y = ry + sunHeight + yBob;
                const z = zSun;

                // Project to screen using camera rotations
                const xRot = x * cosY - z * sinY;
                const zRotY = x * sinY + z * cosY;

                const yRot = y * cosP - zRotY * sinP;
                const zRot = y * sinP + zRotY * cosP;

                const transX = xRot;
                const transY = yRot + camY;
                const transZ = zRot + camZ;

                if (transZ <= 0) continue;

                // Perspective Projection
                const screenX = Math.floor(
                    w / 2 + (transX * fov * aspectCorrection) / transZ,
                );
                const screenY = Math.floor(h / 2 + (transY * fov) / transZ);

                if (
                    screenX >= 0 &&
                    screenX < w &&
                    screenY >= 0 &&
                    screenY < h
                ) {
                    if (transZ < zBuffer[screenY][screenX]) {
                        zBuffer[screenY][screenX] = transZ;

                        // Radial gradient for a glowing sunset sun
                        let char = ".";
                        const ratio = r / sunRadius;
                        if (ratio < 0.45) char = "0";
                        else if (ratio < 0.75) char = "1";
                        else if (ratio < 0.9) char = "o";
                        else char = ".";

                        screen[screenY][screenX] = char;
                    }
                }
            }
        }
    }

    // --- SHIPS GENERATION & RENDERING (Alternating between Yacht & Cargo Ship) ---
    const shipSpeed = 1.2; // Kecepatan kapal bergerak lambat dan tenang
    const loopDistance = 150.0;
    const rawShipPos = time * shipSpeed;
    const loopIndex = Math.floor(rawShipPos / loopDistance);
    const shipX = (rawShipPos % loopDistance) - (loopDistance / 2); // Bergerak dari -75 ke 75
    const shipZ = 12.0; // Posisinya di tengah ombak laut (zSun = 45.0)

    // Desain Kapal 1: Sleek Yacht
    const shipYacht = [
        "      ___________      ",
        "    _/_o__o__o__\\_    ",
        "___/______________\\___",
        "\\____________________/"
    ];

    // Desain Kapal 3: Cargo/Container Ship
    const shipCargo = [
        "                  ___  ",
        "     _[]_ _[]_   |   | ",
        "    |====|====|__|___| ",
        "___/_________________\\_",
        "\\____________________/ "
    ];

    const selectedSprite = loopIndex % 2 === 0 ? shipYacht : shipCargo;
    const sH = selectedSprite.length;
    const sW = selectedSprite[0].length;

    // Menghitung tinggi gelombang laut di titik koordinat kapal (agar kapal mengapung naik-turun)
    let shipY = perlin3D(shipX * 0.05, shipZ * 0.05, time * 0.7) * 4.5;
    shipY += perlin3D(shipX * 0.12, shipZ * 0.12, time * 1.2) * 1.0;
    shipY += 1.2; // Sedikit menenggelamkan bagian lambung bawah kapal ke dalam air agar realistis

    // Proyeksi 3D pusat kapal ke ruang layar (Screen Space)
    const xRotShip = shipX * cosY - shipZ * sinY;
    const zRotYShip = shipX * sinY + shipZ * cosY;
    const yRotShip = shipY * cosP - zRotYShip * sinP;
    const zRotShip = shipY * sinP + zRotYShip * cosP;

    const transXShip = xRotShip;
    const transYShip = yRotShip + camY;
    const transZShip = zRotShip + camZ;

    if (transZShip > 0) {
        const centerX = Math.floor(w / 2 + (transXShip * fov * aspectCorrection) / transZShip);
        const centerY = Math.floor(h / 2 + (transYShip * fov) / transZShip);

        for (let r = 0; r < sH; r++) {
            for (let c = 0; c < sW; c++) {
                const char = selectedSprite[r][c];
                if (char === " ") continue; // Skip bagian transparan kosong

                // Tentukan posisi X dan Y karakter kapal di layar
                const screenX = centerX + c - Math.floor(sW / 2);
                const screenY = centerY + r - sH + 1;

                if (screenX >= 0 && screenX < w && screenY >= 0 && screenY < h) {
                    // Lakukan depth testing dengan zBuffer agar ombak di depan menutupi lambung bawah kapal
                    if (transZShip < zBuffer[screenY][screenX]) {
                        zBuffer[screenY][screenX] = transZShip;
                        screen[screenY][screenX] = char;
                    }
                }
            }
        }
    }

    // --- FLYING BIRDS GENERATION & RENDERING ---
    // A small flock of 3 birds flying from right to left across the sky
    const flockSpeed = 2.4;
    const xFlock = 60.0 - ((time * flockSpeed) % 120.0); // Loops from 60 to -60
    const yFlock = isMobile ? -6.0 : -10.0; // Positioned higher in the sky (projected upper-screen)
    const zFlock = 43.0; // Behind the waves, in front of the sun (zSun = 45.0)

    const birdOffsets = [
        { dx: 0.0, dy: 0.0, dz: 0.0 },      // Leader bird
        { dx: 3.5, dy: 1.2, dz: 0.5 },      // Follower 1 (higher and behind)
        { dx: 6.0, dy: -0.8, dz: -0.5 }     // Follower 2 (lower and further behind)
    ];

    for (let k = 0; k < birdOffsets.length; k++) {
        const offset = birdOffsets[k];
        const x = xFlock + offset.dx;
        // Individual vertical bobbing based on time + index for natural flap motion
        const y = yFlock + offset.dy + Math.sin(time * 6.0 + k * 1.5) * 0.25;
        const z = zFlock + offset.dz;

        // Project bird to screen coordinates
        const xRot = x * cosY - z * sinY;
        const zRotY = x * sinY + z * cosY;

        const yRot = y * cosP - zRotY * sinP;
        const zRot = y * sinP + zRotY * cosP;

        const transX = xRot;
        const transY = yRot + camY;
        const transZ = zRot + camZ;

        if (transZ <= 0) continue;

        // Perspective Projection
        const screenX = Math.floor(w / 2 + (transX * fov * aspectCorrection) / transZ);
        const screenY = Math.floor(h / 2 + (transY * fov) / transZ);

        if (screenX >= 0 && screenX < w && screenY >= 0 && screenY < h) {
            // Render bird only if it is closer than current Z-buffer (so waves can occlude it)
            if (transZ < zBuffer[screenY][screenX]) {
                zBuffer[screenY][screenX] = transZ;

                // Simple 3-frame flapping animation based on time
                const flap = Math.floor(time * 20.0 + k * 2.0) % 3;
                let birdChar = "~"; // Default wings flat
                if (flap === 0) birdChar = "v"; // Wings up
                else if (flap === 2) birdChar = "^"; // Wings down

                screen[screenY][screenX] = birdChar;
            }
        }
    }

    // --- FLOCK 2 (Distant, higher up, flying left to right) ---
    const flockSpeed2 = 1.9;
    const xFlock2 = ((time * flockSpeed2) % 130.0) - 65.0; // Loops from -65 to 65
    const yFlock2 = isMobile ? -9.0 : -15.0; // Positioned even higher in the sky (further up-screen)
    const zFlock2 = 44.5; // Slightly further back (appears smaller)

    const birdOffsets2 = [
        { dx: 0.0, dy: 0.0, dz: 0.0 },      // Leader bird 2
        { dx: -4.0, dy: 1.0, dz: -0.3 }     // Follower bird 2 (behind in left-to-right flight)
    ];

    for (let k = 0; k < birdOffsets2.length; k++) {
        const offset = birdOffsets2[k];
        const x = xFlock2 + offset.dx;
        const y = yFlock2 + offset.dy + Math.sin(time * 7.0 + k * 2.0) * 0.2;
        const z = zFlock2 + offset.dz;

        // Project to screen coordinates
        const xRot = x * cosY - z * sinY;
        const zRotY = x * sinY + z * cosY;

        const yRot = y * cosP - zRotY * sinP;
        const zRot = y * sinP + zRotY * cosP;

        const transX = xRot;
        const transY = yRot + camY;
        const transZ = zRot + camZ;

        if (transZ <= 0) continue;

        // Perspective Projection
        const screenX = Math.floor(w / 2 + (transX * fov * aspectCorrection) / transZ);
        const screenY = Math.floor(h / 2 + (transY * fov) / transZ);

        if (screenX >= 0 && screenX < w && screenY >= 0 && screenY < h) {
            if (transZ < zBuffer[screenY][screenX]) {
                zBuffer[screenY][screenX] = transZ;

                const flap = Math.floor(time * 24.0 + k * 1.5) % 3;
                let birdChar = "~";
                if (flap === 0) birdChar = "v";
                else if (flap === 2) birdChar = "^";

                screen[screenY][screenX] = birdChar;
            }
        }
    }

    let result = "";
    for (let r = 0; r < h; r++) {
        result += screen[r].join("") + "\n";
    }

    asciiText.value = result;
    animationFrameId = requestAnimationFrame(renderFrame);
};

onMounted(() => {
    updateGridSize();
    window.addEventListener("resize", updateGridSize);

    // Set up IntersectionObserver to play/pause the animation loop dynamically based on viewport visibility
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!isVisible.value) {
                    isVisible.value = true;
                    lastFrameTime = performance.now();
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = requestAnimationFrame(renderFrame);
                }
                isReady.value = true;
            } else {
                isVisible.value = false;
                isReady.value = false;
                cancelAnimationFrame(animationFrameId);
            }
        });
    }, {
        root: null,
        threshold: 0.02, // Trigger when 2% of the container enters/leaves viewport
    });

    if (containerRef.value) {
        observer.observe(containerRef.value);
    }
});

onUnmounted(() => {
    window.removeEventListener("resize", updateGridSize);
    if (observer) {
        observer.disconnect();
    }
    cancelAnimationFrame(animationFrameId);
});
</script>

<template>
    <div
        ref="containerRef"
        class="w-full h-full bg-transparent ascii-container flex items-center justify-center select-none overflow-hidden"
    >
        <pre
            class="ascii-pre text-black/75 dark:text-[#EFEEE8]/75 transition-all duration-1000 ease-out"
            :class="isReady ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[0.98] blur-[2.5px]'"
            >{{ asciiText }}</pre
        >
    </div>
</template>

<style scoped>
.ascii-container {
    width: 100%;
    height: 100%;
}

.ascii-pre {
    font-family: "Courier New", Courier, monospace;
    font-weight: bold;
    font-size: 10px;
    line-height: 9px;
    white-space: pre;
    margin: 0;
    padding: 0;
    pointer-events: none;
    user-select: none;
    transition: opacity 1s ease-out, transform 1s ease-out, filter 1s ease-out;
}
</style>
