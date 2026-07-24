<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  date: string;
  verificationId: string;
  file: string;
  type: 'certificate' | 'badge';
}

const certificates = ref<Certificate[]>([
  {
    id: 1,
    name: "Belajar Dasar Pemrograman Web",
    issuer: "Dicoding Indonesia",
    date: "JUNE 2026",
    verificationId: "DIC-WEB-DASAR",
    file: "/sertifikat/dicoding-web-dasar.png",
    type: 'certificate'
  },
  {
    id: 2,
    name: "Belajar Dasar Pemrograman JavaScript",
    issuer: "Dicoding Indonesia",
    date: "JUNE 2026",
    verificationId: "DIC-JS-DASAR",
    file: "/sertifikat/dicoding-javascript-dasar.png",
    type: 'certificate'
  },
  {
    id: 3,
    name: "Belajar Membuat Front-End Web untuk Pemula",
    issuer: "Dicoding Indonesia",
    date: "JUNE 2026",
    verificationId: "DIC-FE-PEMULA",
    file: "/sertifikat/dicoding-front-end-pemula.png",
    type: 'certificate'
  },
  {
    id: 4,
    name: "Memulai Pemrograman Dengan Python",
    issuer: "Dicoding Indonesia",
    date: "JUNE 2026",
    verificationId: "DIC-PYTHON-DASAR",
    file: "/sertifikat/dicoding-python-dasar.png",
    type: 'certificate'
  },
  {
    id: 5,
    name: "Belajar Dasar AI",
    issuer: "Dicoding Indonesia",
    date: "JUNE 2026",
    verificationId: "DIC-DASAR-AI",
    file: "/sertifikat/dicoding-dasar-ai.png",
    type: 'certificate'
  },
  {
    id: 6,
    name: "AWS Academy Graduate - AWS Academy Cloud Developing",
    issuer: "Amazon Web Services (AWS)",
    date: "JUNE 2026",
    verificationId: "AWS-CLOUD-DEV-2026",
    file: "/badges/aws-cloud-developing-1.png",
    type: 'badge'
  },
  {
    id: 7,
    name: "AWS Academy Graduate - AWS Academy Cloud Foundations",
    issuer: "Amazon Web Services (AWS)",
    date: "JUNE 2026",
    verificationId: "AWS-ACF-2026",
    file: "/badges/aws-cloud-foundations-1.png",
    type: 'badge'
  },
  {
    id: 8,
    name: "AWS Academy Graduate - AWS Academy Cloud Security Foundations",
    issuer: "Amazon Web Services (AWS)",
    date: "JUNE 2026",
    verificationId: "AWS-ACS-2026",
    file: "/badges/aws-cloud-security-1.png",
    type: 'badge'
  },
  {
    id: 9,
    name: "CCNAv7: Introduction to Networks",
    issuer: "Cisco Networking Academy",
    date: "JUNE 2026",
    verificationId: "CISCO-CCNA-ITN-2026",
    file: "/badges/cisco-ccna-itnu-1.png",
    type: 'badge'
  },
  {
    id: 10,
    name: "HTML Essentials",
    issuer: "Cisco Networking Academy",
    date: "JUNE 2026",
    verificationId: "CISCO-HTML-2026",
    file: "/badges/cisco-html-essentials-1.png",
    type: 'badge'
  },
  {
    id: 11,
    name: "Introduction to IoT",
    issuer: "Cisco Networking Academy",
    date: "JUNE 2026",
    verificationId: "CISCO-IOT-2026",
    file: "/badges/cisco-intro-to-iot-1.png",
    type: 'badge'
  }
]);

const currentPage = ref(1);
const itemsPerPage = 3;

const visibleCertificates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return certificates.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(certificates.value.length / itemsPerPage));

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Modal State
const modalOpen = ref(false);
const selectedCert = ref<Certificate | null>(null);

const openModal = (cert: Certificate) => {
  selectedCert.value = cert;
  modalOpen.value = true;
  document.body.style.overflow = 'hidden'; // Lock background scrolling
};

const closeModal = () => {
  modalOpen.value = false;
  selectedCert.value = null;
  document.body.style.overflow = ''; // Unlock background scrolling
};

// Escape Key closing handler
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modalOpen.value) {
    closeModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="w-full mt-16 z-10 flex flex-col items-center font-mono">
    <!-- Section Header -->
    <div class="mb-10 text-center w-full relative">
      <h3 id="certificates-title" class="text-2xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-black dark:text-white mb-2 uppercase select-none">
        CERTIFICATE & BADGES
      </h3>
      <p id="certificates-subtitle" class="font-mono text-[9px] sm:text-xs text-black/55 dark:text-[#EFEEE8]/45 uppercase tracking-widest select-none">
        [ A compilation of my achievements and verified credentials ]
      </p>
    </div>

    <!-- Main Section Box -->
    <div class="relative w-full border border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-black/20 dark:hover:border-white/20 select-none">
      
      <!-- Cyber Corner Brackets -->
      <div class="cb-tl absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-black/30 dark:border-white/30"></div>
      <div class="cb-tr absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-black/30 dark:border-white/30"></div>
      <div class="cb-bl absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-black/30 dark:border-white/30"></div>
      <div class="cb-br absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-black/30 dark:border-white/30"></div>

      <!-- Subheader with controls -->
      <div class="flex items-center justify-end gap-4 border-b border-black/5 dark:border-white/5 pb-4 mb-6">
        
        <!-- Pagination controls -->
        <div class="flex items-center gap-3">
          <span class="text-[10px] text-black/40 dark:text-white/30 font-bold uppercase tracking-wider">
            PAGE {{ currentPage }} / {{ totalPages }}
          </span>
          <div class="flex items-center gap-1.5">
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="hover:text-black dark:hover:text-white text-black/45 dark:text-white/35 text-[10px] font-bold cursor-pointer border border-black/10 dark:border-white/10 px-2.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              ◄
            </button>
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="hover:text-black dark:hover:text-white text-black/45 dark:text-white/35 text-[10px] font-bold cursor-pointer border border-black/10 dark:border-white/10 px-2.5 py-0.5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              ►
            </button>
          </div>
        </div>
      </div>

      <!-- Cards Grid -->
      <transition name="fade" mode="out-in">
        <div :key="currentPage" class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div 
            v-for="cert in visibleCertificates" 
            :key="cert.id"
            @click="openModal(cert)"
            class="group cursor-pointer border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] p-4 flex flex-col transition-all duration-300 hover:border-black/30 dark:hover:border-white/30 select-none hover:-translate-y-1 relative h-full"
          >
            <!-- Tiny border corner highlights on card hover -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t border-l border-black dark:border-white"></div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t border-r border-black dark:border-white"></div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b border-l border-black dark:border-white"></div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b border-r border-black dark:border-white"></div>

            <!-- Preview Frame (Image) -->
            <div class="w-full aspect-[4/3] bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden mb-4 flex-shrink-0">
              <img :src="cert.file" :alt="cert.name" :class="[
                'w-full h-full transition-all duration-500',
                cert.type === 'badge' ? 'object-contain p-3 group-hover:scale-105' : 'object-cover object-center group-hover:scale-105'
              ]" />
            </div>

            <!-- Certificate Info -->
            <div class="flex-grow flex flex-col justify-between">
              <div>
                <div class="text-[9px] text-black/40 dark:text-white/35 uppercase tracking-widest mb-1.5 font-bold">
                  [ {{ cert.type === 'badge' ? 'BADGE' : 'CREDENTIAL' }} {{ cert.id.toString().padStart(2, '0') }} ]
                </div>
                <h4 class="font-display text-sm font-bold text-black dark:text-white line-clamp-2 leading-tight group-hover:text-black/80 dark:group-hover:text-white/90 transition-colors duration-200">
                  {{ cert.name }}
                </h4>
              </div>
              <div class="mt-3 flex items-center justify-between text-[9px] text-black/35 dark:text-white/30 border-t border-black/5 dark:border-white/5 pt-2">
                <span>ISSUER: {{ cert.issuer }}</span>
                <span>{{ cert.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Modal for viewing full certificate image -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div 
          v-if="modalOpen" 
          class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md"
          @click.self="closeModal"
        >
          <!-- Modal Frame -->
          <div class="relative w-full max-w-4xl border border-black/20 dark:border-white/20 bg-[#EFEEE8] dark:bg-[#0E0D0B] p-5 sm:p-6 font-mono shadow-2xl flex flex-col max-h-[90vh]">
            
            <!-- Corner brackets for Modal -->
            <div class="cb-tl absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black/30 dark:border-white/30"></div>
            <div class="cb-tr absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black/30 dark:border-white/30"></div>
            <div class="cb-bl absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black/30 dark:border-white/30"></div>
            <div class="cb-br absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black/30 dark:border-white/30"></div>

            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 mb-4 select-none">
              <div class="pr-4 flex-grow">
                <h3 class="text-xs sm:text-sm font-bold text-black dark:text-white uppercase tracking-wider font-display">
                  {{ selectedCert?.name }}
                </h3>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button 
                  @click="closeModal"
                  class="text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white px-2.5 py-1 text-[10px] transition-all duration-150 uppercase tracking-widest cursor-pointer active:scale-95"
                >
                  [ CLOSE ]
                </button>
              </div>
            </div>

            <!-- Modal Content: Certificate Image -->
            <div class="flex-1 min-h-0 w-full bg-black/[0.04] dark:bg-white/[0.02] border border-dashed border-black/15 dark:border-white/15 flex flex-col items-center justify-center p-2 relative overflow-hidden">
              <div class="w-full h-full flex items-center justify-center overflow-auto">
                <img :src="selectedCert?.file" :alt="selectedCert?.name" class="max-w-full max-h-[65vh] object-contain shadow-md" />
              </div>
            </div>
            
            <!-- Modal Footer Details -->
            <div class="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-[9px] text-black/40 dark:text-white/30 uppercase tracking-widest select-none">
              <span>VERIFICATION ID: {{ selectedCert?.verificationId }}</span>
              <span>ISSUER: {{ selectedCert?.issuer }}</span>
              <span>DATE OF ISSUE: {{ selectedCert?.date }}</span>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Modal animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Page transitions style */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
