const fs = require('fs');
const file = 'src/pages/index.astro';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const newLayout = `                        <!-- Timeline Layout -->
                        <div class="relative w-full overflow-x-auto pb-12 pt-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory cursor-grab active:cursor-grabbing">
                            <div class="relative flex flex-row gap-6 sm:gap-10 md:gap-16 w-max px-4 sm:px-8 items-center min-h-[450px]">
                                <!-- Horizontal Line (Desktop only for better visual) -->
                                <div class="hidden md:block absolute top-1/2 left-0 w-full border-t border-dashed border-black/30 dark:border-white/20 -translate-y-1/2 z-0"></div>
                                
                                <!-- Timeline Year: 2026 (Top) -->
                                <div class="relative flex flex-col md:w-80 shrink-0 snap-center group">
                                    <div class="md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mb-6 md:mb-0 flex items-center justify-center bg-[#EFEEE8] dark:bg-[#0E0D0B] z-10 py-1 transition-colors duration-300">
                                        <span class="font-mono text-xs sm:text-sm font-bold tracking-wider text-black dark:text-white px-3 py-1 border border-black/10 dark:border-white/10 select-none hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
                                            [ 2026 ]
                                        </span>
                                    </div>
                                    <div class="md:pb-24 w-full order-last md:order-first z-10">
                                        <div class="relative border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] backdrop-blur-sm p-5 transition-all duration-500 hover:-translate-y-2 hover:border-black/30 dark:hover:border-white/30 group-hover:shadow-lg shadow-black/5 dark:shadow-white/5 select-none">
                                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-black/20 to-transparent dark:from-white/20 hidden md:block"></div>
                                            <div class="flex items-center gap-3 mb-3.5">
                                                <div class="w-7 h-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black/60 dark:text-white/60">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                                </div>
                                                <span class="font-mono text-[9px] font-bold tracking-widest text-black/45 dark:text-white/35 uppercase">
                                                    // CATEGORY
                                                </span>
                                            </div>
                                            <h4 class="font-display text-base sm:text-lg font-bold tracking-tight text-black dark:text-white mb-1">
                                                Role Title
                                            </h4>
                                            <p class="font-mono text-[10px] sm:text-xs text-black/40 dark:text-white/30 mb-4 font-semibold uppercase tracking-wider">
                                                Company &middot; Period
                                            </p>
                                            <p class="font-mono text-[10.5px] xs:text-xs text-black/55 dark:text-[#EFEEE8]/50 leading-relaxed text-justify mb-4">
                                                Description of your roles, projects, or milestones.
                                            </p>
                                            <div class="flex flex-wrap gap-2">
                                                <span class="font-mono text-[9px] text-black/50 dark:text-white/40 border border-black/10 dark:border-white/10 px-2 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] select-none hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150">[Tag]</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="hidden md:block w-full h-[220px]"></div>
                                </div>

                                <!-- Timeline Year: 2025 (Bottom) -->
                                <div class="relative flex flex-col md:w-80 shrink-0 snap-center group">
                                    <div class="md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mb-6 md:mb-0 flex items-center justify-center bg-[#EFEEE8] dark:bg-[#0E0D0B] z-10 py-1 transition-colors duration-300">
                                        <span class="font-mono text-xs sm:text-sm font-bold tracking-wider text-black dark:text-white px-3 py-1 border border-black/10 dark:border-white/10 select-none hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
                                            [ 2025 ]
                                        </span>
                                    </div>
                                    <div class="hidden md:block w-full h-[220px]"></div>
                                    <div class="md:pt-24 w-full z-10">
                                        <div class="relative border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] backdrop-blur-sm p-5 transition-all duration-500 hover:-translate-y-2 hover:border-black/30 dark:hover:border-white/30 group-hover:shadow-lg shadow-black/5 dark:shadow-white/5 select-none">
                                            <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-t from-black/20 to-transparent dark:from-white/20 hidden md:block"></div>
                                            <div class="flex items-center gap-3 mb-3.5">
                                                <div class="w-7 h-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black/60 dark:text-white/60">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                                </div>
                                                <span class="font-mono text-[9px] font-bold tracking-widest text-black/45 dark:text-white/35 uppercase">
                                                    // CATEGORY
                                                </span>
                                            </div>
                                            <h4 class="font-display text-base sm:text-lg font-bold tracking-tight text-black dark:text-white mb-1">
                                                Role Title
                                            </h4>
                                            <p class="font-mono text-[10px] sm:text-xs text-black/40 dark:text-white/30 mb-4 font-semibold uppercase tracking-wider">
                                                Company &middot; Period
                                            </p>
                                            <p class="font-mono text-[10.5px] xs:text-xs text-black/55 dark:text-[#EFEEE8]/50 leading-relaxed text-justify mb-4">
                                                Description of your roles, projects, or milestones.
                                            </p>
                                            <div class="flex flex-wrap gap-2">
                                                <span class="font-mono text-[9px] text-black/50 dark:text-white/40 border border-black/10 dark:border-white/10 px-2 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] select-none hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150">[Tag]</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Timeline Year: 2024 (Top) -->
                                <div class="relative flex flex-col md:w-80 shrink-0 snap-center group">
                                    <div class="md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mb-6 md:mb-0 flex items-center justify-center bg-[#EFEEE8] dark:bg-[#0E0D0B] z-10 py-1 transition-colors duration-300">
                                        <span class="font-mono text-xs sm:text-sm font-bold tracking-wider text-black dark:text-white px-3 py-1 border border-black/10 dark:border-white/10 select-none hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
                                            [ 2024 ]
                                        </span>
                                    </div>
                                    <div class="md:pb-24 w-full order-last md:order-first z-10">
                                        <div class="relative border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] backdrop-blur-sm p-5 transition-all duration-500 hover:-translate-y-2 hover:border-black/30 dark:hover:border-white/30 group-hover:shadow-lg shadow-black/5 dark:shadow-white/5 select-none">
                                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-black/20 to-transparent dark:from-white/20 hidden md:block"></div>
                                            <div class="flex items-center gap-3 mb-3.5">
                                                <div class="w-7 h-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black/60 dark:text-white/60">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                                </div>
                                                <span class="font-mono text-[9px] font-bold tracking-widest text-black/45 dark:text-white/35 uppercase">
                                                    // CATEGORY
                                                </span>
                                            </div>
                                            <h4 class="font-display text-base sm:text-lg font-bold tracking-tight text-black dark:text-white mb-1">
                                                Role Title
                                            </h4>
                                            <p class="font-mono text-[10px] sm:text-xs text-black/40 dark:text-white/30 mb-4 font-semibold uppercase tracking-wider">
                                                Company &middot; Period
                                            </p>
                                            <p class="font-mono text-[10.5px] xs:text-xs text-black/55 dark:text-[#EFEEE8]/50 leading-relaxed text-justify mb-4">
                                                Description of your roles, projects, or milestones.
                                            </p>
                                            <div class="flex flex-wrap gap-2">
                                                <span class="font-mono text-[9px] text-black/50 dark:text-white/40 border border-black/10 dark:border-white/10 px-2 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] select-none hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150">[Tag]</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="hidden md:block w-full h-[220px]"></div>
                                </div>

                                <!-- Timeline Year: 2023 (Bottom) -->
                                <div class="relative flex flex-col md:w-80 shrink-0 snap-center group">
                                    <div class="md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mb-6 md:mb-0 flex items-center justify-center bg-[#EFEEE8] dark:bg-[#0E0D0B] z-10 py-1 transition-colors duration-300">
                                        <span class="font-mono text-xs sm:text-sm font-bold tracking-wider text-black dark:text-white px-3 py-1 border border-black/10 dark:border-white/10 select-none hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200">
                                            [ 2023 ]
                                        </span>
                                    </div>
                                    <div class="hidden md:block w-full h-[220px]"></div>
                                    <div class="md:pt-24 w-full z-10">
                                        <div class="relative border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] backdrop-blur-sm p-5 transition-all duration-500 hover:-translate-y-2 hover:border-black/30 dark:hover:border-white/30 group-hover:shadow-lg shadow-black/5 dark:shadow-white/5 select-none">
                                            <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-t from-black/20 to-transparent dark:from-white/20 hidden md:block"></div>
                                            <div class="flex items-center gap-3 mb-3.5">
                                                <div class="w-7 h-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-black/60 dark:text-white/60">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                                </div>
                                                <span class="font-mono text-[9px] font-bold tracking-widest text-black/45 dark:text-white/35 uppercase">
                                                    // CATEGORY
                                                </span>
                                            </div>
                                            <h4 class="font-display text-base sm:text-lg font-bold tracking-tight text-black dark:text-white mb-1">
                                                Role Title
                                            </h4>
                                            <p class="font-mono text-[10px] sm:text-xs text-black/40 dark:text-white/30 mb-4 font-semibold uppercase tracking-wider">
                                                Company &middot; Period
                                            </p>
                                            <p class="font-mono text-[10.5px] xs:text-xs text-black/55 dark:text-[#EFEEE8]/50 leading-relaxed text-justify mb-4">
                                                Description of your roles, projects, or milestones.
                                            </p>
                                            <div class="flex flex-wrap gap-2">
                                                <span class="font-mono text-[9px] text-black/50 dark:text-white/40 border border-black/10 dark:border-white/10 px-2 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] select-none hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150">[Tag]</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;

const startIdx = lines.findIndex(l => l.includes('<!-- Timeline Layout -->'));
// Find the ending div of timeline layout. The next sibling is `</div>` of the journey section, followed by `</section>`
// Let's find exactly the line. It's line 571 (0-indexed 570)
// Or better, let's find the specific pattern matching the end of Timeline Layout
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].includes('<!-- Section: Quotes -->')) {
        break; // Should not reach here
    }
    if (lines[i].trim() === '</div>' && lines[i+1].trim() === '</div>' && lines[i+4].trim() === '</section>') {
        endIdx = i;
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const updatedLines = [...lines.slice(0, startIdx), newLayout, ...lines.slice(endIdx + 1)];
    fs.writeFileSync(file, updatedLines.join('\n'));
    console.log("Successfully replaced only the timeline layout!");
} else {
    console.log("Failed to find bounds. start:", startIdx, "end:", endIdx);
}
