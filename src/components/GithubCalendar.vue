<template>
  <div ref="containerRef" class="relative w-full border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 select-none font-mono">
    
    <!-- Cyber Corner Brackets (Animated via GSAP) -->
    <div class="cb-tl absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-black/30 dark:border-white/30"></div>
    <div class="cb-tr absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-black/30 dark:border-white/30"></div>
    <div class="cb-bl absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-black/30 dark:border-white/30"></div>
    <div class="cb-br absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-black/30 dark:border-white/30"></div>

    <!-- Header Section (Tabs Switch) -->
    <div class="flex items-center justify-center gap-6 mb-6 border-b border-black/5 dark:border-white/5 pb-4 select-none">
      <button 
        @click="selectTab('github', true)"
        class="calendar-title text-[11.5px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer pb-1"
        :class="activeTab === 'github' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-black/45 dark:text-white/35 hover:text-black/75 dark:hover:text-white/65'"
      >
        {{ githubTitleText }}
      </button>
      <button 
        @click="selectTab('steam', true)"
        class="steam-title text-[11.5px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer pb-1"
        :class="activeTab === 'steam' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-black/45 dark:text-white/35 hover:text-black/75 dark:hover:text-white/65'"
      >
        {{ steamTitleText }}
      </button>
    </div>

    <!-- Main Content Frame -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 min-h-[140px]">
      <div class="flex items-center gap-2 text-xs text-black/50 dark:text-white/40">
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="animate-pulse">[CONNECTING_GITHUB_DATABASE...]</span>
      </div>
    </div>

    <div v-else>
      <transition name="fade" mode="out-in">
        
        <!-- Tab 1: GitHub Contributions -->
        <div v-if="activeTab === 'github'" key="github" class="space-y-6">
          
          <!-- GitHub Sub Tab Header with Cyber Arrows -->
          <div class="github-subheader flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-2">
            <div class="text-[11.5px] font-bold text-black/45 dark:text-white/35 uppercase tracking-widest flex items-center gap-2">
              <span class="text-[#00ff41] animate-pulse">■</span>
              <span>{{ getGithubSubTabTitle() }}</span>
            </div>
            
            <!-- Navigation controls -->
            <div class="flex items-center gap-1.5 select-none font-mono">
              <button 
                @click="prevGithubSubTab"
                class="hover:text-black dark:hover:text-white text-black/45 dark:text-white/35 text-[10px] font-bold cursor-pointer border border-black/10 dark:border-white/10 px-2.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 active:scale-95"
              >
                ◄
              </button>
              <button 
                @click="nextGithubSubTab"
                class="hover:text-black dark:hover:text-white text-black/45 dark:text-white/35 text-[10px] font-bold cursor-pointer border border-black/10 dark:border-white/10 px-2.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 active:scale-95"
              >
                ►
              </button>
            </div>
          </div>

          <!-- Swappable Sub-panels -->
          <div class="relative min-h-[160px] overflow-hidden">
            
            <!-- Panel 1: Contribution Calendar -->
            <div v-if="activeGithubSubTab === 'contributions'" class="github-contributions-panel space-y-6">
              <!-- Stats Summary -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-black/5 dark:border-white/5 pb-5">
                <div class="stat-item">
                  <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Total Contributions</div>
                  <div class="text-xl sm:text-2xl font-bold font-display text-black dark:text-white">
                    {{ totalContributions }}
                  </div>
                  <div class="text-[10px] text-black/40 dark:text-white/30 uppercase mt-0.5">In the last year</div>
                </div>
                <div class="stat-item">
                  <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Current Streak</div>
                  <div class="text-xl sm:text-2xl font-bold font-display text-black dark:text-white">
                    {{ streakCurrent }} <span class="text-sm font-mono font-normal">days</span>
                  </div>
                  <div class="text-[10px] text-black/40 dark:text-white/30 uppercase mt-0.5">Consecutive days</div>
                </div>
                <div class="stat-item">
                  <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Longest Streak</div>
                  <div class="text-xl sm:text-2xl font-bold font-display text-black dark:text-white">
                    {{ streakMax }} <span class="text-sm font-mono font-normal">days</span>
                  </div>
                  <div class="text-[10px] text-black/40 dark:text-white/30 uppercase mt-0.5">Record commit run</div>
                </div>
                <div class="stat-item">
                  <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Peak Commits</div>
                  <div class="text-xl sm:text-2xl font-bold font-display text-black dark:text-white">
                    {{ busyDay ? busyDay.count : 0 }} <span class="text-sm font-mono font-normal">commits</span>
                  </div>
                  <div class="text-[10px] text-black/40 dark:text-white/30 uppercase mt-0.5">
                    {{ busyDay ? formatDateLabel(busyDay.date) : 'No commits' }}
                  </div>
                </div>
              </div>

              <!-- Calendar Container -->
              <div class="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 pb-4">
                <div class="min-w-[760px] select-none flex flex-col justify-start">
                  
                  <!-- Months Header -->
                  <div 
                    class="grid grid-flow-col gap-[3px] mb-1 pl-[28px]"
                    :style="{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }"
                  >
                    <div 
                      v-for="w in totalWeeks" 
                      :key="'m-label-' + w"
                      class="text-[9px] font-bold text-black/35 dark:text-white/25 text-left h-[12px] leading-none"
                    >
                      {{ getMonthLabelForWeek(w - 1) }}
                    </div>
                  </div>

                  <!-- Calendar Grid + Row labels -->
                  <div class="flex items-start">
                    
                    <!-- Weekday Row Labels -->
                    <div class="grid grid-rows-7 gap-[3px] text-[9px] font-bold text-black/35 dark:text-white/25 pr-2 w-[20px] h-[88px] leading-[10px] items-center">
                      <span style="grid-row: 2;">Mon</span>
                      <span style="grid-row: 4;">Wed</span>
                      <span style="grid-row: 6;">Fri</span>
                    </div>

                    <!-- Contribution Squares Grid -->
                    <div 
                      class="grid grid-rows-7 grid-flow-col gap-[3px] h-[88px] flex-grow"
                      :style="{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }"
                    >
                      <div
                        v-for="(day, index) in days"
                        :key="day.date + '-' + index"
                        @mouseenter="showTooltip($event, day)"
                        @mousemove="moveTooltip($event)"
                        @mouseleave="hideTooltip"
                        class="contrib-cell w-2.5 h-2.5 sm:w-[11px] sm:h-[11px] aspect-square flex items-center justify-center cursor-crosshair relative"
                      >
                        <div
                          class="transition-all duration-150"
                          :class="[
                            day.level === 0
                              ? 'w-[3px] h-[3px] rounded-full bg-black/25 dark:bg-white/20 hover:bg-black/45 dark:hover:bg-white/40'
                              : 'w-full h-full rounded-[1px] hover:scale-110 hover:z-10 ' + getCellClass(day.level)
                          ]"
                        ></div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              <!-- Footer Info -->
              <div class="flex flex-wrap items-center justify-end gap-4 text-[11px] text-black/45 dark:text-white/35 pt-2 border-t border-black/5 dark:border-white/5">
                <!-- Legend -->
                <div class="flex items-center gap-1.5 font-bold">
                  <span>Less</span>
                  <div class="w-2.5 h-2.5 sm:w-[11px] sm:h-[11px] flex items-center justify-center">
                    <div class="w-[3px] h-[3px] rounded-full bg-black/25 dark:bg-white/20"></div>
                  </div>
                  <div class="w-2.5 h-2.5 rounded-[1px] bg-[#0e4429] dark:bg-[#00ff41]/20 border border-green-900/10 dark:border-[#00ff41]/10"></div>
                  <div class="w-2.5 h-2.5 rounded-[1px] bg-[#006d32] dark:bg-[#00ff41]/45 border border-green-800/20 dark:border-[#00ff41]/20"></div>
                  <div class="w-2.5 h-2.5 rounded-[1px] bg-[#26a641] dark:bg-[#00ff41]/70 border border-green-600/30 dark:border-[#00ff41]/35"></div>
                  <div class="w-2.5 h-2.5 rounded-[1px] bg-[#39d353] dark:bg-[#00ff41] border border-green-400/40 dark:border-[#00ff41]/55 shadow-[0_0_6px_rgba(0,255,65,0.4)] dark:shadow-[0_0_10px_rgba(0,255,65,0.7)]"></div>
                  <span>More</span>
                </div>
              </div>
            </div>

            <!-- Panel 2: Account Statistics (Includes Profile details and Stats grid) -->
            <div v-else-if="activeGithubSubTab === 'stats'" class="github-stats-panel space-y-4">
              <div v-if="githubExtraLoading" class="flex flex-col items-center justify-center py-12 min-h-[140px]">
                <div class="flex items-center gap-2 text-xs text-black/50 dark:text-white/40">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="animate-pulse">[GATHERING_SYS_STATISTICS...]</span>
                </div>
              </div>
              
              <div v-else class="space-y-4">
                <div class="flex flex-col md:flex-row gap-5">
                  <!-- Left Side: Profile Card -->
                  <div class="flex-grow flex items-center gap-4 border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] p-4 relative min-w-[260px]">
                    <!-- Corner brackets on profile card -->
                    <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-black/20 dark:border-white/20"></div>
                    <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black/20 dark:border-white/20"></div>
                    
                    <!-- Cyber Avatar Container -->
                    <div class="relative w-14 h-14 border border-black/20 dark:border-white/20 p-0.5 bg-black/[0.03] dark:bg-white/[0.03] shrink-0">
                      <div class="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-t border-l border-black/40 dark:border-white/40"></div>
                      <div class="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 border-b border-r border-black/40 dark:border-white/40"></div>
                      <img v-if="githubStats.avatar_url" :src="githubStats.avatar_url" :alt="githubStats.login" class="w-full h-full object-cover select-none" />
                      <div v-else class="w-full h-full bg-[#00ff41]/10 flex items-center justify-center text-[#00ff41] font-bold text-xs select-none">
                        GH
                      </div>
                    </div>

                    <!-- Profile Details -->
                    <div class="flex flex-col min-w-0">
                      <span class="text-base font-bold text-black dark:text-white leading-tight truncate">
                        {{ githubStats.name || githubStats.login }}
                      </span>
                      <a :href="githubStats.html_url || 'https://github.com/Sajinomoto'" target="_blank" rel="noopener noreferrer" class="text-[11px] text-black/45 dark:text-white/35 hover:text-[#00ff41] transition-colors duration-150 uppercase tracking-widest font-mono mt-0.5 truncate">
                        @{{ githubStats.login || 'Sajinomoto' }}
                      </a>
                      <p class="text-[11px] text-black/60 dark:text-white/50 leading-relaxed line-clamp-2 mt-1.5 italic font-sans" :title="githubStats.bio">
                        {{ githubStats.bio || 'No biography details provided.' }}
                      </p>
                    </div>
                  </div>

                  <!-- Right Side: Stats Grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow md:max-w-[50%] lg:max-w-none">
                    <div class="stat-card relative border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] p-4 transition-all duration-300 hover:border-black/20 dark:hover:border-white/20">
                      <div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-black/20 dark:border-white/20"></div>
                      <div class="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black/20 dark:border-white/20"></div>
                      <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Public Repos</div>
                      <div class="text-xl sm:text-2xl font-bold font-display text-black dark:text-white">
                        {{ githubStats.public_repos }}
                      </div>
                    </div>
                    
                    <div class="stat-card relative border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] p-4 transition-all duration-300 hover:border-black/20 dark:hover:border-white/20">
                      <div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-black/20 dark:border-white/20"></div>
                      <div class="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black/20 dark:border-white/20"></div>
                      <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Followers</div>
                      <div class="text-xl sm:text-2xl font-bold font-display text-black dark:text-white">
                        {{ githubStats.followers }}
                      </div>
                    </div>

                    <div class="stat-card relative border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] p-4 transition-all duration-300 hover:border-black/20 dark:hover:border-white/20">
                      <div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-black/20 dark:border-white/20"></div>
                      <div class="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black/20 dark:border-white/20"></div>
                      <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Following</div>
                      <div class="text-xl sm:text-2xl font-bold font-display text-black dark:text-white">
                        {{ githubStats.following }}
                      </div>
                    </div>

                    <div class="stat-card relative border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] p-4 transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 font-mono">
                      <div class="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-black/20 dark:border-white/20"></div>
                      <div class="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-black/20 dark:border-white/20"></div>
                      <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-1">Account Uplink</div>
                      <div class="text-sm font-bold text-[#00ff41] leading-tight pt-1">
                        ESTABLISHED<br/>{{ formatJoinedDate(githubStats.created_at) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer Info link -->
                <div class="flex flex-wrap items-center justify-start gap-4 text-[11px] text-black/45 dark:text-white/35 pt-2 border-t border-black/5 dark:border-white/5">
                  <a 
                    :href="githubStats.html_url || 'https://github.com/Sajinomoto'" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="hover:text-black dark:hover:text-white transition-colors duration-200 flex items-center gap-1 group font-bold"
                  >
                    <span>VISIT MY GITHUB</span>
                    <span class="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Panel 3: Live Activity Feed -->
            <div v-else class="github-activity-panel space-y-4">
              <div v-if="githubExtraLoading" class="flex flex-col items-center justify-center py-12 min-h-[140px]">
                <div class="flex items-center gap-2 text-xs text-black/50 dark:text-white/40">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="animate-pulse">[UPLINKING_SYS_LOG_FEED...]</span>
                </div>
              </div>
              
              <div v-else-if="githubEvents.length === 0" class="text-[11px] font-bold text-black/40 dark:text-white/30 uppercase py-8 text-center">
                » NO RECENT GITHUB ACTIVITIES RECORDED IN THE LOGS
              </div>
              
              <div v-else class="space-y-2 font-mono text-xs py-1">
                <div 
                  v-for="event in githubEvents" 
                  :key="event.id"
                  class="flex items-center justify-between text-black/60 dark:text-white/50 border-b border-dashed border-black/5 dark:border-white/5 pb-1.5 last:border-0 hover:text-black dark:hover:text-white transition-colors duration-150"
                >
                  <span class="truncate pr-4 font-bold flex items-center gap-1.5">
                    <span class="text-[#00ff41]">»</span> {{ formatGithubEvent(event) }}
                  </span>
                  <span class="shrink-0 text-black/40 dark:text-white/30 text-right font-mono text-[10px] uppercase">
                    {{ getRelativeTime(event.created_at) }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Tab 2: Steam Statistics -->
        <div v-else key="steam" class="space-y-6">
          
          <!-- Steam Profile Header -->
          <div class="steam-header-item flex flex-wrap items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
            <div class="flex items-center gap-4">
              <!-- Cyber Avatar Container -->
              <div class="relative w-11 h-11 border border-black/20 dark:border-white/20 p-0.5 bg-black/[0.03] dark:bg-white/[0.03]">
                <!-- Corner brackets on avatar -->
                <div class="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-t border-l border-black/40 dark:border-white/40"></div>
                <div class="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 border-b border-r border-black/40 dark:border-white/40"></div>
                <img v-if="steamProfile.avatarfull" :src="steamProfile.avatarfull" :alt="steamProfile.personaname" class="w-full h-full object-cover select-none" />
                <div v-else class="w-full h-full bg-[#00ff41]/10 flex items-center justify-center text-[#00ff41] font-bold text-xs select-none">
                  {{ getInitials(steamProfile.personaname) }}
                </div>
              </div>
              
              <!-- User Info -->
              <div class="flex flex-col">
                <span class="text-base font-bold text-black dark:text-white leading-tight">{{ steamProfile.personaname }}</span>
              </div>
            </div>

            <!-- Steam stats summary right side -->
            <div class="text-right">
              <div class="text-[11px] uppercase tracking-wider text-black/45 dark:text-[#EFEEE8]/35 mb-0.5">STATUS</div>
              <div class="flex items-center justify-end gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="steamProfile.isOnline ? 'bg-[#00ff41] animate-pulse' : 'bg-black/30 dark:bg-white/30'"></span>
                <span class="text-sm font-bold tracking-wider uppercase" :class="steamProfile.isOnline ? 'text-[#00ff41]' : 'text-black/45 dark:text-white/35'">
                  {{ steamProfile.statusText }}<span v-if="steamProfile.isOnline && steamProfile.inGameName" class="text-sm font-medium text-[#00ff41] ml-2">Playing: {{ steamProfile.inGameName }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Sub Tab Header with Cyber Arrows -->
          <div class="steam-subheader flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-2">
            <div class="text-[11.5px] font-bold text-black/45 dark:text-white/35 uppercase tracking-widest flex items-center gap-2">
              <span class="text-[#00ff41] animate-pulse">■</span>
              <span>{{ activeSteamSubTab === 'most_played' ? 'MOST_PLAYED_GAMES' : 'RECENT_ACTIVITIES' }}</span>
            </div>
            
            <!-- Navigation controls -->
            <div class="flex items-center gap-1.5 select-none font-mono">
              <button 
                @click="toggleSteamSubTab"
                class="hover:text-black dark:hover:text-white text-black/45 dark:text-white/35 text-[10px] font-bold cursor-pointer border border-black/10 dark:border-white/10 px-2.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 active:scale-95"
              >
                ◄
              </button>
              <button 
                @click="toggleSteamSubTab"
                class="hover:text-black dark:hover:text-white text-black/45 dark:text-white/35 text-[10px] font-bold cursor-pointer border border-black/10 dark:border-white/10 px-2.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 active:scale-95"
              >
                ►
              </button>
            </div>
          </div>

          <!-- Swappable Sub-panels -->
          <div class="relative min-h-[160px] overflow-hidden">
            
            <!-- Panel A: Most Played Games -->
            <div v-if="activeSteamSubTab === 'most_played'" class="steam-games-panel space-y-4">
              <div v-if="steamLoading" class="flex flex-col items-center justify-center py-12 min-h-[140px]">
                <div class="flex items-center gap-2 text-xs text-black/50 dark:text-white/40">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="animate-pulse">[RETRIEVING_STEAM_DATA...]</span>
                </div>
              </div>
              
              <div v-else-if="steamGames.length === 0" class="text-center py-8 text-xs text-black/50 dark:text-white/40">
                [NO MOST PLAYED GAMES FOUND]
              </div>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Game Card -->
                <div 
                  v-for="game in steamGames" 
                  :key="game.appid"
                  class="steam-card relative border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] p-4 flex flex-col justify-between hover:border-black/25 dark:hover:border-white/25 transition-all duration-300"
                >
                  <!-- Corner brackets on game card -->
                  <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-black/20 dark:border-white/20"></div>
                  <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black/20 dark:border-white/20"></div>
                  
                  <div>
                    <h4 class="text-[15px] font-bold text-black dark:text-white uppercase tracking-wider leading-tight mb-2 truncate" :title="game.name">
                      {{ game.name }}
                    </h4>
                    
                    <!-- Playtime details -->
                    <div class="space-y-1 font-mono text-[13.5px] text-black/50 dark:text-white/45">
                      <div class="flex justify-between">
                        <span>TOTAL RUNTIME:</span>
                        <span class="font-bold text-black dark:text-white">{{ formatPlaytime(game.playtime_forever) }} HRS</span>
                      </div>
                      <div class="flex justify-between">
                        <span>RECENT RUNTIME:</span>
                        <span class="font-bold text-black dark:text-white">{{ formatPlaytime(game.playtime_2weeks) }} (2 WKS)</span>
                      </div>
                    </div>
                  </div>

                  <!-- Achievement Progress Bar -->
                  <div v-if="game.achievements" class="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                    <div class="flex justify-between text-[10px] font-bold text-black/45 dark:text-white/35 mb-1">
                      <span>ACHIEVEMENTS</span>
                      <span>{{ game.achievements.unlocked }} / {{ game.achievements.total }} ({{ game.achievements.percentage }}%)</span>
                    </div>
                    <div class="font-mono text-[11px] text-[#00ff41] leading-none tracking-normal select-none">
                      {{ formatProgressBar(game.achievements.percentage) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Panel B: Recent Activities -->
            <div v-else class="steam-recent-panel space-y-4">
              <div v-if="steamLoading" class="animate-pulse space-y-1.5 py-4">
                <div class="h-3 bg-black/5 dark:bg-white/5 w-3/4 rounded-[1px]"></div>
                <div class="h-3 bg-black/5 dark:bg-white/5 w-2/3 rounded-[1px]"></div>
                <div class="h-3 bg-black/5 dark:bg-white/5 w-1/2 rounded-[1px]"></div>
              </div>
              
              <div v-else-if="steamRecentGames.length === 0" class="text-[11px] font-bold text-black/40 dark:text-white/30 uppercase py-8 text-center">
                » NO RECENT ACTIVITY DETECTED IN THE PAST 2 WEEKS
              </div>
              
              <div v-else class="space-y-2 font-mono text-[13.5px] py-1">
                <div 
                  v-for="game in steamRecentGames" 
                  :key="'recent-' + game.appid"
                  class="flex items-center justify-between text-black/60 dark:text-white/50 border-b border-dashed border-black/5 dark:border-white/5 pb-1.5 last:border-0 hover:text-black dark:hover:text-white transition-colors duration-150"
                >
                  <span class="truncate pr-4 font-bold flex items-center gap-1.5">
                    <span class="text-[#00ff41]">»</span> {{ game.name }}
                  </span>
                  <span class="shrink-0 text-black/40 dark:text-white/30 text-right font-mono">
                    <span class="font-bold text-black dark:text-white">{{ formatPlaytime(game.playtime_2weeks) }} HRS</span>
                    <span class="text-[11px] ml-1.5 uppercase">(Total: {{ formatPlaytime(game.playtime_forever) }} Hrs)</span>
                  </span>
                </div>
              </div>

            </div>

          </div>

          <!-- Footer Info -->
          <div class="flex flex-wrap items-center justify-start gap-4 text-[11px] text-black/45 dark:text-white/35 pt-2 border-t border-black/5 dark:border-white/5">
            <a 
              :href="steamProfile.profileurl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="hover:text-black dark:hover:text-white transition-colors duration-200 flex items-center gap-1 group font-bold"
            >
              <span>VISIT MY STEAM</span>
              <span class="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </a>
          </div>

        </div>

      </transition>
    </div>

    <!-- Floating Tooltip -->
    <div 
      v-if="tooltipVisible"
      class="absolute z-50 pointer-events-none bg-[#0E0D0B] dark:bg-[#EFEEE8] text-[#EFEEE8] dark:text-[#0E0D0B] font-mono text-[9px] font-bold border border-white/20 dark:border-black/20 px-2 py-1 shadow-[0_6px_16px_rgba(0,0,0,0.6)] select-none transition-all duration-75"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px', transform: 'translate(-50%, -130%)' }"
    >
      <!-- Cyber tooltip design details -->
      <div class="absolute top-0 left-0 w-1 h-1 bg-[#00ff41]"></div>
      <div class="absolute bottom-0 right-0 w-1 h-1 bg-[#00ff41]"></div>
      {{ tooltipText }}
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const props = defineProps({
  username: {
    type: String,
    default: 'Sajinomoto'
  }
});

// Grid configuration
const totalWeeks = 53;
const totalDays = totalWeeks * 7;

// Component References
const containerRef = ref(null);
let scrollTriggerInstance = null;
let autoSlideTimer = null;

// Component State
const loading = ref(true);
const apiMode = ref('LIVE');
const totalContributions = ref(0);
const streakCurrent = ref(0);
const streakMax = ref(0);
const busyDay = ref(null);
const days = ref([]);
const monthLabels = ref([]);
const activeTab = ref('github');
const githubTitleText = ref("[SYS.DATA: GITHUB]");
const steamTitleText = ref("[SYS.DATA: STEAM]");

// Steam API State
const steamLoading = ref(true);
const steamError = ref(null);
const steamProfile = ref({
  personaname: 'Sajinomoto',
  avatarfull: '',
  profileurl: 'https://steamcommunity.com/id/Sajinomoto',
  statusText: 'OFFLINE',
  isOnline: false,
  inGameName: null
});
const steamGames = ref([]);
const steamRecentGames = ref([]);
const activeSteamSubTab = ref('most_played');
let steamSubTabTimer = null;

// GitHub Sub-tab State
const activeGithubSubTab = ref('contributions');
const githubExtraLoading = ref(true);
const githubStats = ref({
  name: '',
  login: '',
  avatar_url: '',
  bio: '',
  html_url: '',
  public_repos: 0,
  followers: 0,
  following: 0,
  created_at: null
});
const githubEvents = ref([]);
let githubSubTabTimer = null;

const getGithubSubTabTitle = () => {
  switch (activeGithubSubTab.value) {
    case 'contributions': return 'CONTRIBUTION_CALENDAR';
    case 'stats': return 'SYS_ACCOUNT_STATISTICS';
    case 'activity': return 'RECENT_LOGS_FEED';
    default: return '';
  }
};

const formatGithubEvent = (event) => {
  const repoName = event.repo.replace('Sajinomoto/', '');
  switch (event.type) {
    case 'PushEvent':
      return `Pushed commits to ${repoName}`;
    case 'CreateEvent':
      return `Created branch/repo ${repoName}`;
    case 'WatchEvent':
      return `Starred repository ${repoName}`;
    case 'IssuesEvent':
      return `${event.payload.action || 'Opened'} issue in ${repoName}`;
    case 'IssueCommentEvent':
      return `Commented on issue in ${repoName}`;
    case 'PullRequestEvent':
      return `${event.payload.action || 'Opened'} pull request in ${repoName}`;
    case 'ForkEvent':
      return `Forked repository ${repoName}`;
    default:
      return `Activity in ${repoName}`;
  }
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

const formatJoinedDate = (dateStr) => {
  if (!dateStr) return 'OCT_2018';
  const d = new Date(dateStr);
  const m = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const y = d.getFullYear();
  return `${m}_${y}`;
};

const fetchGithubExtraData = async () => {
  try {
    githubExtraLoading.value = true;
    const res = await fetch('/api/github.json');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    githubStats.value = data.stats;
    githubEvents.value = data.events;
  } catch (e) {
    console.warn("Failed fetching live GitHub details. Using mock fallbacks.", e);
    githubStats.value = {
      name: 'Satrio Aji',
      login: 'Sajinomoto',
      avatar_url: '',
      bio: 'Developer building web applications, game scripts, and digital interfaces.',
      html_url: 'https://github.com/Sajinomoto',
      public_repos: 22,
      followers: 26,
      following: 33,
      created_at: '2019-04-11T09:41:26Z'
    };
    githubEvents.value = [
      { id: '1', type: 'PushEvent', repo: 'Sajinomoto/Portofolio', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: '2', type: 'PushEvent', repo: 'Sajinomoto/Portofolio', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
      { id: '3', type: 'WatchEvent', repo: 'vuejs/core', created_at: new Date(Date.now() - 3600000 * 24).toISOString() }
    ];
  } finally {
    githubExtraLoading.value = false;
  }
};

const getInitials = (name) => {
  if (!name) return 'SAJ';
  return name.substring(0, 3).toUpperCase();
};

const formatPlaytime = (mins) => {
  if (!mins) return '0';
  return (mins / 60).toFixed(1).replace('.0', '');
};

const formatProgressBar = (percentage) => {
  const filledCount = Math.round(percentage / 10);
  const emptyCount = 10 - filledCount;
  return '[' + '█'.repeat(filledCount) + '░'.repeat(emptyCount) + ']';
};

const fetchSteamData = async () => {
  try {
    steamLoading.value = true;
    steamError.value = null;
    const response = await fetch('/api/steam.json');
    if (!response.ok) {
      throw new Error(`Steam API returned HTTP status ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.message || data.error);
    }
    steamProfile.value = data.profile;
    steamGames.value = data.games;
    steamRecentGames.value = data.recentGames || [];
  } catch (err) {
    console.warn("Could not load live Steam data. Using local mock fallbacks.", err);
    steamError.value = err.message;
    // Set fallback mock data if fetch fails
    steamProfile.value = {
      personaname: 'Sajinomoto',
      avatarfull: '',
      profileurl: 'https://steamcommunity.com/id/Sajinomoto',
      statusText: 'ONLINE',
      isOnline: true,
      inGameName: null
    };
    steamGames.value = [
      {
        appid: 2077,
        name: 'Cyberpunk 2077',
        playtime_forever: 20520,
        playtime_2weeks: 750,
        achievements: { unlocked: 41, total: 44, percentage: 93 }
      },
      {
        appid: 730,
        name: 'Counter-Strike 2',
        playtime_forever: 49260,
        playtime_2weeks: 492,
        achievements: { unlocked: 20, total: 25, percentage: 80 }
      },
      {
        appid: 2,
        name: 'Hades II',
        playtime_forever: 5520,
        playtime_2weeks: 924,
        achievements: { unlocked: 35, total: 50, percentage: 70 }
      }
    ];
    steamRecentGames.value = [
      {
        appid: 213330,
        name: 'LEGO® Batman™ 2: DC Super Heroes',
        playtime_2weeks: 94,
        playtime_forever: 394
      },
      {
        appid: 1162750,
        name: 'Songs of Syx',
        playtime_2weeks: 38,
        playtime_forever: 370
      },
      {
        appid: 365670,
        name: 'Blender',
        playtime_2weeks: 34,
        playtime_forever: 42
      }
    ];
  } finally {
    steamLoading.value = false;
  }
};

// GitHub Sub-tab Navigation and Auto-slide
const startGithubSubTabAutoSlide = () => {
  stopGithubSubTabAutoSlide();
  if (activeTab.value !== 'github') return;
  githubSubTabTimer = setInterval(() => {
    const subs = ['contributions', 'stats', 'activity'];
    const idx = subs.indexOf(activeGithubSubTab.value);
    const nextIdx = (idx + 1) % subs.length;
    selectGithubSubTab(subs[nextIdx], false);
  }, 10000);
};

const stopGithubSubTabAutoSlide = () => {
  if (githubSubTabTimer) {
    clearInterval(githubSubTabTimer);
    githubSubTabTimer = null;
  }
};

const nextGithubSubTab = () => {
  const subs = ['contributions', 'stats', 'activity'];
  const idx = subs.indexOf(activeGithubSubTab.value);
  const nextIdx = (idx + 1) % subs.length;
  selectGithubSubTab(subs[nextIdx], true);
};

const prevGithubSubTab = () => {
  const subs = ['contributions', 'stats', 'activity'];
  const idx = subs.indexOf(activeGithubSubTab.value);
  const prevIdx = (idx - 1 + subs.length) % subs.length;
  selectGithubSubTab(subs[prevIdx], true);
};

const selectGithubSubTab = (subTab, manual = false) => {
  if (activeGithubSubTab.value === subTab) return;
  
  const container = containerRef.value;
  if (!container) {
    activeGithubSubTab.value = subTab;
    return;
  }
  
  const currentPanel = container.querySelector(
    activeGithubSubTab.value === 'contributions' ? '.github-contributions-panel' :
    activeGithubSubTab.value === 'activity' ? '.github-activity-panel' : '.github-stats-panel'
  );
  
  if (manual) {
    startGithubSubTabAutoSlide();
  }

  if (currentPanel) {
    const subs = ['contributions', 'stats', 'activity'];
    const fromIdx = subs.indexOf(activeGithubSubTab.value);
    const toIdx = subs.indexOf(subTab);
    let isNext = true;
    if (fromIdx === 0 && toIdx === subs.length - 1) {
      isNext = false;
    } else if (fromIdx === subs.length - 1 && toIdx === 0) {
      isNext = true;
    } else {
      isNext = toIdx > fromIdx;
    }
    const direction = isNext ? 15 : -15;

    gsap.to(currentPanel, {
      opacity: 0,
      x: -direction,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        activeGithubSubTab.value = subTab;
        
        nextTick(() => {
          const newPanel = container.querySelector(
            subTab === 'contributions' ? '.github-contributions-panel' :
            subTab === 'activity' ? '.github-activity-panel' : '.github-stats-panel'
          );
          if (newPanel) {
            gsap.set(newPanel, { opacity: 0, x: direction });
            
            if (subTab === 'contributions') {
              const statItems = newPanel.querySelectorAll('.stat-item');
              const cells = newPanel.querySelectorAll('.contrib-cell');
              if (statItems.length > 0) gsap.set(statItems, { y: 12, opacity: 0 });
              if (cells.length > 0) gsap.set(cells, { scale: 0.2, opacity: 0 });
              gsap.to(newPanel, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
              if (statItems.length > 0) {
                gsap.to(statItems, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" });
              }
              if (cells.length > 0) {
                gsap.to(cells, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.005, ease: "power1.out", force3D: true, lazy: true });
              }
            } else if (subTab === 'stats') {
              const cards = newPanel.querySelectorAll('.stat-card');
              if (cards && cards.length > 0) {
                gsap.set(cards, { y: 12, opacity: 0 });
                gsap.to(newPanel, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
                gsap.to(cards, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" });
              } else {
                gsap.to(newPanel, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
              }
            } else {
              gsap.to(newPanel, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
            }
          }
        });
      }
    });
  } else {
    activeGithubSubTab.value = subTab;
  }
};

// Steam Sub-tab Navigation and Auto-slide
const startSteamSubTabAutoSlide = () => {
  stopSteamSubTabAutoSlide();
  if (activeTab.value !== 'steam') return;
  steamSubTabTimer = setInterval(() => {
    const nextSub = activeSteamSubTab.value === 'most_played' ? 'recent' : 'most_played';
    selectSteamSubTab(nextSub, false);
  }, 10000);
};

const stopSteamSubTabAutoSlide = () => {
  if (steamSubTabTimer) {
    clearInterval(steamSubTabTimer);
    steamSubTabTimer = null;
  }
};

const toggleSteamSubTab = () => {
  const nextSub = activeSteamSubTab.value === 'most_played' ? 'recent' : 'most_played';
  selectSteamSubTab(nextSub, true);
};

const selectSteamSubTab = (subTab, manual = false) => {
  if (activeSteamSubTab.value === subTab) return;
  
  const container = containerRef.value;
  if (!container) {
    activeSteamSubTab.value = subTab;
    return;
  }
  
  const currentPanel = container.querySelector(
    activeSteamSubTab.value === 'most_played' ? '.steam-games-panel' : '.steam-recent-panel'
  );
  
  if (manual) {
    startSteamSubTabAutoSlide();
  }

  if (currentPanel) {
    gsap.to(currentPanel, {
      opacity: 0,
      x: subTab === 'recent' ? -15 : 15,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        activeSteamSubTab.value = subTab;
        
        nextTick(() => {
          const newPanel = container.querySelector(
            subTab === 'most_played' ? '.steam-games-panel' : '.steam-recent-panel'
          );
          if (newPanel) {
            gsap.set(newPanel, { opacity: 0, x: subTab === 'recent' ? 15 : -15 });
            
            if (subTab === 'most_played') {
              const steamCards = newPanel.querySelectorAll('.steam-card');
              if (steamCards && steamCards.length > 0) {
                gsap.set(steamCards, { y: 15, opacity: 0 });
                gsap.to(newPanel, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
                gsap.to(steamCards, {
                  y: 0,
                  opacity: 1,
                  duration: 0.5,
                  stagger: 0.1,
                  ease: "power2.out",
                  overwrite: "auto"
                });
              } else {
                gsap.to(newPanel, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" });
              }
            } else {
              gsap.to(newPanel, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
            }
          }
        });
      }
    });
  } else {
    activeSteamSubTab.value = subTab;
  }
};

// Tooltip State
const tooltipText = ref('');
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

// Months map
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Date string formatter (Timezone-safe)
const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dateVal = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dateVal}`;
};

// Pretty Date Label: e.g. "Jun 12, 2026"
const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Cell Styling map
const getCellClass = (level) => {
  switch (level) {
    case 1:
      return 'bg-[#0e4429] dark:bg-[#00ff41]/20 border border-green-900/10 dark:border-[#00ff41]/10';
    case 2:
      return 'bg-[#006d32] dark:bg-[#00ff41]/45 border border-green-800/20 dark:border-[#00ff41]/20';
    case 3:
      return 'bg-[#26a641] dark:bg-[#00ff41]/70 border border-green-600/30 dark:border-[#00ff41]/35';
    case 4:
      return 'bg-[#39d353] dark:bg-[#00ff41] border border-green-400/40 dark:border-[#00ff41]/55 shadow-[0_0_6px_rgba(0,255,65,0.4)] dark:shadow-[0_0_10px_rgba(0,255,65,0.7)]';
    case 0:
    default:
      return '';
  }
};

// Tooltip Handlers
const showTooltip = (event, day) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const dateLabel = formatDateLabel(day.date);
  const commitsText = day.count === 0 ? 'No contributions' : `${day.count} contribution${day.count > 1 ? 's' : ''}`;
  tooltipText.value = `${commitsText} on ${dateLabel}`;
  
  tooltipX.value = event.clientX - rect.left;
  tooltipY.value = event.clientY - rect.top;
  tooltipVisible.value = true;
};

const moveTooltip = (event) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  tooltipX.value = event.clientX - rect.left;
  tooltipY.value = event.clientY - rect.top;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
};

// Decrypt text effect
const decryptText = (titleRef, targetText, duration = 1.2) => {
  const chars = "01o*.!@#$%^&*()_+{}|:<>?`-=[];',./";
  const length = targetText.length;
  const obj = { progress: 0 };

  gsap.to(obj, {
    progress: 1,
    duration: duration,
    overwrite: "auto",
    onUpdate: () => {
      const currentProgress = obj.progress;
      const revealCount = Math.floor(currentProgress * length);
      let output = "";
      for (let i = 0; i < length; i++) {
        if (i < revealCount) {
          output += targetText[i];
        } else if (targetText[i] === " ") {
          output += " ";
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      titleRef.value = output;
    },
  });
};

// Encrypt text effect
const encryptText = (titleRef, targetText, duration = 0.5) => {
  const chars = "01o*.!@#$%^&*()_+{}|:<>?`-=[];',./";
  const length = targetText.length;
  const obj = { progress: 0 };

  gsap.to(obj, {
    progress: 1,
    duration: duration,
    overwrite: "auto",
    onUpdate: () => {
      const currentProgress = obj.progress;
      const hideCount = Math.floor(currentProgress * length);
      let output = "";
      for (let i = 0; i < length; i++) {
        if (i < hideCount) {
          if (targetText[i] === " ") {
            output += " ";
          } else {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
        } else {
          output += targetText[i];
        }
      }
      titleRef.value = output;
    },
  });
};

// Switch Tab Handler
const selectTab = (tab, manual = false) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  tooltipVisible.value = false;
  
  if (tab === 'steam') {
    startSteamSubTabAutoSlide();
    stopGithubSubTabAutoSlide();
  } else {
    startGithubSubTabAutoSlide();
    stopSteamSubTabAutoSlide();
  }
  
  nextTick(() => {
    const container = containerRef.value;
    if (!container) return;

    if (tab === "github") {
      decryptText(githubTitleText, "[SYS.DATA: GITHUB]", 0.2);
      
      const statItems = container.querySelectorAll(".stat-item");
      const cells = container.querySelectorAll(".contrib-cell");
      
      if (statItems && statItems.length > 0) {
        gsap.set(statItems, { y: 0, opacity: 1, overwrite: "auto" });
      }
      
      if (cells && cells.length > 0) {
        gsap.set(cells, { scale: 1, opacity: 1, overwrite: "auto" });
      }
    } else {
      const steamHeader = container.querySelector(".steam-header-item");
      const steamCards = container.querySelectorAll(".steam-card");
      
      decryptText(steamTitleText, "[SYS.DATA: STEAM]", 0.2);
      
      if (steamHeader) {
        gsap.set(steamHeader, { y: 0, opacity: 1, overwrite: "auto" });
      }
      
      if (steamCards && steamCards.length > 0) {
        gsap.set(steamCards, { y: 0, opacity: 1, overwrite: "auto" });
      }
    }
  });
};

// Scrolltrigger Init Function
const initScrollAnimations = () => {
  if (!containerRef.value) return;

  const container = containerRef.value;
  const cbTl = container.querySelector('.cb-tl');
  const cbTr = container.querySelector('.cb-tr');
  const cbBl = container.querySelector('.cb-bl');
  const cbBr = container.querySelector('.cb-br');

  // Set initial visible states for corner brackets
  if (cbTl && cbTr && cbBl && cbBr) {
    gsap.set([cbTl, cbTr, cbBl, cbBr], { x: 0, y: 0, opacity: 1 });
  }

  // Set initial visible states for active tab elements dynamically
  if (activeTab.value === "github") {
    const statItems = container.querySelectorAll('.stat-item');
    const cells = container.querySelectorAll('.contrib-cell');
    if (statItems.length > 0) gsap.set(statItems, { y: 0, opacity: 1 });
    if (cells.length > 0) gsap.set(cells, { scale: 1, opacity: 1, force3D: true });
  } else {
    const steamHeader = container.querySelector('.steam-header-item');
    const steamCards = container.querySelectorAll('.steam-card');
    if (steamHeader) gsap.set(steamHeader, { y: 0, opacity: 1 });
    if (steamCards.length > 0) gsap.set(steamCards, { y: 0, opacity: 1 });
  }

  // Decrypt titles immediately (fast)
  decryptText(githubTitleText, "[SYS.DATA: GITHUB]", 0.2);
  decryptText(steamTitleText, "[SYS.DATA: STEAM]", 0.2);

  // Start auto-sliding
  if (activeTab.value === 'steam') {
    startSteamSubTabAutoSlide();
  } else {
    startGithubSubTabAutoSlide();
  }
};

// Generates simulated contribution data when offline or rate-limited
const generateFallbackData = (startSunday, endSaturday) => {
  const fallbackList = [];
  const curr = new Date(startSunday);
  
  while (curr <= endSaturday) {
    const dateStr = formatDateStr(curr);
    const dayOfWeek = curr.getDay();
    
    let count = 0;
    let level = 0;
    const rand = Math.random();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const activityChance = isWeekend ? 0.15 : 0.45;
    
    if (rand < activityChance) {
      const commitRoll = Math.random();
      if (commitRoll < 0.60) {
        count = Math.floor(Math.random() * 2) + 1;
        level = 1;
      } else if (commitRoll < 0.85) {
        count = Math.floor(Math.random() * 2) + 3;
        level = 2;
      } else if (commitRoll < 0.95) {
        count = Math.floor(Math.random() * 3) + 5;
        level = 3;
      } else {
        count = Math.floor(Math.random() * 4) + 8;
        level = 4;
      }
    }
    
    fallbackList.push({
      date: dateStr,
      count,
      level
    });
    
    curr.setDate(curr.getDate() + 1);
  }
  return fallbackList;
};

// Process Raw contribution data list into grid
const processContributionData = (apiContributions, yearTotals) => {
  const today = new Date();
  
  const endSaturday = new Date(today);
  endSaturday.setDate(today.getDate() + (6 - today.getDay()));
  
  const startSunday = new Date(endSaturday);
  startSunday.setDate(endSaturday.getDate() - totalDays + 1);
  
  const apiMap = {};
  apiContributions.forEach(item => {
    apiMap[item.date] = item;
  });

  const daysList = [];
  let total = 0;
  let runningStreak = 0;
  let maxStreak = 0;
  let peakCommits = 0;
  let peakDate = '';

  const curr = new Date(startSunday);
  while (curr <= endSaturday) {
    const dateStr = formatDateStr(curr);
    const item = apiMap[dateStr] || { date: dateStr, count: 0, level: 0 };
    
    daysList.push({
      date: dateStr,
      count: item.count,
      level: item.level,
      dayOfWeek: curr.getDay(),
      month: curr.getMonth(),
      year: curr.getFullYear()
    });

    total += item.count;
    
    if (item.count > 0) {
      runningStreak++;
      if (runningStreak > maxStreak) {
        maxStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }

    if (item.count > peakCommits) {
      peakCommits = item.count;
      peakDate = dateStr;
    }

    curr.setDate(curr.getDate() + 1);
  }

  // Calculate current active streak (working backwards from today)
  let currentActiveStreak = 0;
  let streakSearchDate = new Date(today);
  const todayStr = formatDateStr(streakSearchDate);
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  const todayCount = apiMap[todayStr]?.count || 0;
  const yesterdayCount = apiMap[yesterdayStr]?.count || 0;

  let activeDate = todayCount > 0 ? streakSearchDate : (yesterdayCount > 0 ? yesterday : null);

  if (activeDate) {
    let check = true;
    while (check) {
      const dStr = formatDateStr(activeDate);
      const count = apiMap[dStr]?.count || 0;
      if (count > 0) {
        currentActiveStreak++;
        activeDate.setDate(activeDate.getDate() - 1);
      } else {
        check = false;
      }
    }
  }

  totalContributions.value = total;
  streakMax.value = maxStreak;
  streakCurrent.value = currentActiveStreak;
  busyDay.value = peakCommits > 0 ? { date: peakDate, count: peakCommits } : null;
  days.value = daysList;

  buildMonthLabels(daysList);
};

const getMonthLabelForWeek = (weekIndex) => {
  const labelObj = monthLabels.value.find(l => l.index === weekIndex);
  return labelObj ? labelObj.text : '';
};

const buildMonthLabels = (daysList) => {
  const labels = [];
  
  for (let w = 0; w < totalWeeks; w++) {
    const firstDayOfWeek = daysList[w * 7];
    const dateObj = new Date(firstDayOfWeek.date);
    const currentMonthName = months[dateObj.getMonth()];
    
    if (w === 0) {
      labels.push({ text: currentMonthName, index: w });
    } else {
      const prevWeekFirstDay = daysList[(w - 1) * 7];
      const prevWeekDateObj = new Date(prevWeekFirstDay.date);
      const prevMonthName = months[prevWeekDateObj.getMonth()];
      
      if (currentMonthName !== prevMonthName) {
        const lastLabel = labels[labels.length - 1];
        if (!lastLabel || (w - lastLabel.index) >= 3) {
          labels.push({ text: currentMonthName, index: w });
        }
      }
    }
  }
  monthLabels.value = labels;
};

// Mount hook: load data
onMounted(async () => {
  try {
    loading.value = true;
    apiMode.value = 'LIVE';

    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${props.username}`);
    if (!response.ok) {
      throw new Error(`API returned HTTP status ${response.status}`);
    }
    const data = await response.json();
    processContributionData(data.contributions, data.total);
  } catch (err) {
    console.warn(`Could not load live github contribution trail for ${props.username}. Launching offline simulation.`, err);
    apiMode.value = 'FALLBACK';
    
    const today = new Date();
    const endSat = new Date(today);
    endSat.setDate(today.getDate() + (6 - today.getDay()));
    const startSun = new Date(endSat);
    startSun.setDate(endSat.getDate() - totalDays + 1);

    const fallback = generateFallbackData(startSun, endSat);
    processContributionData(fallback, null);
  } finally {
    loading.value = false;
    
    // Proactively fetch Steam API data
    fetchSteamData();
    fetchGithubExtraData();
    
    // Wait for Vue to render the elements in v-else before querying DOM
    await nextTick();
    initScrollAnimations();
  }
});

onUnmounted(() => {
  stopSteamSubTabAutoSlide();
  stopGithubSubTabAutoSlide();
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
  }
});
</script>

<style scoped>
/* Custom styled minimal scrollbar for contribution calendar to keep look and feel tight */
.scrollbar-thin::-webkit-scrollbar {
    height: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 2px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.16);
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.16);
}

.contrib-cell {
    will-change: transform, opacity;
    transform: translate3d(0, 0, 0);
}
.calendar-title, .steam-title {
    display: inline-block;
    contain: layout paint;
    text-align: center;
}

/* Tabs Swapping Animation Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
}
.fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
