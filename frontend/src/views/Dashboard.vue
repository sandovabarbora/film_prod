<template>
  <div class="cinematic-workspace" @mousemove="updateMousePosition">
    <!-- Elegant Background -->
    <div class="workspace-background">
      <div class="ambient-gradient"></div>
      <div class="floating-elements">
        <div
          v-for="element in floatingElements"
          :key="element.id"
          class="floating-element"
          :style="element.style"
        ></div>
      </div>
    </div>

    <!-- Sophisticated Header -->
    <header class="workspace-header">
      <div class="header-content">
        <div class="brand-identity" @click="triggerBrandAnimation">
          <div class="brand-symbol">
            <div class="symbol-inner">Φ</div>
            <div class="symbol-rings">
              <div class="ring" v-for="ring in 2" :key="ring"></div>
            </div>
          </div>
          <div class="brand-text">
            <h1 class="brand-title">FILMFLOW</h1>
            <div class="brand-subtitle">Production Command Center</div>
          </div>
        </div>

        <div class="workspace-status">
          <div class="status-indicator">
            <div class="status-pulse"></div>
            <span class="status-text">LIVE PRODUCTION</span>
          </div>
          <div class="workspace-time">
            <div class="time-display">{{ currentTime }}</div>
            <div class="date-display">{{ currentDate }}</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Dashboard -->
    <main class="workspace-main">
      <!-- Key Metrics -->
      <section class="metrics-section">
        <div class="metrics-grid">
          <div
            v-for="metric in keyMetrics"
            :key="metric.id"
            class="metric-card"
            :class="metric.theme"
          >
            <div class="metric-icon">{{ metric.icon }}</div>
            <div class="metric-content">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
            </div>
            <div class="metric-trend" :class="metric.trendDirection">
              {{ metric.trend }}
            </div>
          </div>
        </div>
      </section>

      <!-- Productions Showcase -->
      <section class="productions-showcase">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-accent">●</span>
            Active Productions
          </h2>
          <button class="elegant-button primary">
            <span>View All</span>
            <div class="button-shimmer"></div>
          </button>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="elegant-spinner"></div>
          <p>Loading productions...</p>
        </div>

        <div v-else-if="productions.length === 0" class="empty-showcase">
          <div class="empty-visual">🎬</div>
          <h3>No Active Productions</h3>
          <p>Ready to bring your vision to life?</p>
          <button class="elegant-button primary large">
            <span>Create New Production</span>
            <div class="button-shimmer"></div>
          </button>
        </div>

        <div v-else class="productions-gallery">
          <article
            v-for="production in productions"
            :key="production.id"
            class="production-showcase"
            @mouseenter="activateShowcase(production)"
            @mouseleave="deactivateShowcase"
            :class="{ active: activeProduction?.id === production.id }"
          >
            <div class="showcase-visual">
              <div class="production-thumbnail">
                <div class="thumbnail-overlay"></div>
                <div class="production-initial">{{ production.title[0] }}</div>
              </div>
            </div>

            <div class="showcase-content">
              <header class="production-header">
                <h3 class="production-title">{{ production.title }}</h3>
                <span
                  class="production-status"
                  :class="getStatusClass(production.status)"
                >
                  {{ getStatusText(production.status) }}
                </span>
              </header>

              <div class="production-details">
                <div class="detail-row">
                  <span class="detail-label">Director:</span>
                  <span class="detail-value">{{ production.director }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Scenes:</span>
                  <span class="detail-value">{{
                    production.scenes_count
                  }}</span>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-header">
                  <span class="progress-label">Completion</span>
                  <span class="progress-percentage"
                    >{{ production.completion_percentage }}%</span
                  >
                </div>
                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :style="{ width: production.completion_percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="showcase-actions">
              <button class="elegant-button secondary">
                <span>Details</span>
              </button>
              <button
                v-if="production.status === 'shoot'"
                class="elegant-button critical"
              >
                <span class="live-indicator"></span>
                <span>Live Dashboard</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Activity Timeline -->
      <section class="activity-timeline">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-accent">●</span>
            Recent Activity
          </h2>
        </div>

        <div class="timeline-container">
          <div class="timeline-track"></div>
          <div class="timeline-events">
            <div
              v-for="(event, index) in recentEvents"
              :key="event.id"
              class="timeline-event"
              :style="{ '--delay': index * 0.2 + 's' }"
            >
              <div class="event-marker">
                <div class="marker-dot"></div>
              </div>
              <div class="event-content">
                <div class="event-description">{{ event.description }}</div>
                <div class="event-timestamp">{{ event.timestamp }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Floating Action -->
    <div class="floating-action" @click="triggerQuickAction">
      <div class="action-symbol">+</div>
      <div class="action-ripple"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useProductionStore } from "@/stores";

const productionStore = useProductionStore();

const mousePosition = reactive({ x: 0, y: 0 });
const activeProduction = ref(null);
const currentTime = ref("");
const currentDate = ref("");
const isLoading = ref(false);

const floatingElements = ref([]);
const productions = computed(() => productionStore.productions);

const keyMetrics = ref([
  {
    id: 1,
    icon: "🎬",
    value: "3",
    label: "Active Productions",
    trend: "+12%",
    trendDirection: "up",
    theme: "primary",
  },
  {
    id: 2,
    icon: "👥",
    value: "24",
    label: "Crew Members",
    trend: "+3%",
    trendDirection: "up",
    theme: "success",
  },
  {
    id: 3,
    icon: "📅",
    value: "15",
    label: "Shooting Days",
    trend: "0%",
    trendDirection: "neutral",
    theme: "warning",
  },
  {
    id: 4,
    icon: "⏱️",
    value: "120",
    label: "Hours Shot",
    trend: "+8%",
    trendDirection: "up",
    theme: "info",
  },
]);

const recentEvents = ref([
  {
    id: 1,
    description: 'Scene 5A completed on "The Last Stand"',
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    description: "Call sheet distributed for tomorrow",
    timestamp: "4 hours ago",
  },
  {
    id: 3,
    description: "Weather alert received",
    timestamp: "6 hours ago",
  },
]);

const updateMousePosition = (event) => {
  mousePosition.x = event.clientX / window.innerWidth;
  mousePosition.y = event.clientY / window.innerHeight;
};

const triggerBrandAnimation = () => {
  const brand = document.querySelector(".brand-symbol");
  brand.classList.add("animate");
  setTimeout(() => brand.classList.remove("animate"), 800);
};

const activateShowcase = (production) => {
  activeProduction.value = production;
};

const deactivateShowcase = () => {
  activeProduction.value = null;
};

const getStatusClass = (status) => {
  const classes = {
    prep: "status-prep",
    shoot: "status-shooting",
    post: "status-post",
    wrap: "status-wrapped",
  };
  return classes[status] || "status-prep";
};

const getStatusText = (status) => {
  const texts = {
    prep: "Pre-production",
    shoot: "Shooting",
    post: "Post-production",
    wrap: "Wrapped",
  };
  return texts[status] || "Unknown";
};

const triggerQuickAction = () => {
  console.log("Quick action triggered");
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentDate.value = now.toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const generateFloatingElements = () => {
  floatingElements.value = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    style: {
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      animationDelay: Math.random() * 10 + "s",
      animationDuration: 15 + Math.random() * 25 + "s",
    },
  }));
};

onMounted(async () => {
  updateTime();
  setInterval(updateTime, 1000);

  generateFloatingElements();

  isLoading.value = true;
  await productionStore.fetchProductions();
  isLoading.value = false;
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap");

.cinematic-workspace {
  min-height: 100vh;
  background: #0a0a0a;
  color: #ffffff;
  font-family: "Inter", sans-serif;
  position: relative;
  overflow-x: hidden;
}

.workspace-background {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.ambient-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(59, 130, 246, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(168, 85, 247, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 70%,
      rgba(34, 197, 94, 0.06) 0%,
      transparent 50%
    );
  animation: gradient-shift 20s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  inset: 0;
}

.floating-element {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float-drift 20s linear infinite;
}

.workspace-header {
  position: relative;
  z-index: 10;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brand-identity:hover {
  transform: translateY(-2px);
}

.brand-symbol {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.symbol-inner {
  font-family: "JetBrains Mono", monospace;
  font-size: 2rem;
  font-weight: 500;
  color: #3b82f6;
  z-index: 2;
  position: relative;
}

.symbol-rings {
  position: absolute;
  inset: 0;
}

.ring {
  position: absolute;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  animation: ring-rotate 10s linear infinite;
}

.ring:nth-child(1) {
  width: 100%;
  height: 100%;
}

.ring:nth-child(2) {
  width: 120%;
  height: 120%;
  top: -10%;
  left: -10%;
  animation-duration: 15s;
  animation-direction: reverse;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.1em;
}

.brand-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.workspace-status {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 2rem;
}

.status-pulse {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ef4444;
  letter-spacing: 0.05em;
}

.workspace-time {
  text-align: right;
}

.time-display {
  font-family: "JetBrains Mono", monospace;
  font-size: 1.5rem;
  font-weight: 500;
  color: #3b82f6;
}

.date-display {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.workspace-main {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.metrics-section {
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.2);
}

.metric-card:hover::before {
  opacity: 1;
}

.metric-card.primary {
  --accent-color: #3b82f6;
}
.metric-card.success {
  --accent-color: #22c55e;
}
.metric-card.warning {
  --accent-color: #f59e0b;
}
.metric-card.info {
  --accent-color: #8b5cf6;
}

.metric-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.metric-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

.metric-trend {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.metric-trend.up {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.metric-trend.neutral {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.title-accent {
  color: #3b82f6;
  font-size: 0.75rem;
}

.elegant-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #ffffff;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elegant-button:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.elegant-button.primary {
  border-color: rgba(59, 130, 246, 0.5);
  color: #3b82f6;
}

.elegant-button.primary:hover {
  border-color: #3b82f6;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.elegant-button.secondary {
  border-color: rgba(255, 255, 255, 0.2);
}

.elegant-button.critical {
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.elegant-button.critical:hover {
  border-color: #ef4444;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2);
}

.button-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.elegant-button:hover .button-shimmer {
  left: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
}

.elegant-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-showcase {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-visual {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.productions-gallery {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.production-showcase {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.4s ease;
  cursor: pointer;
}

.production-showcase:hover {
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.production-showcase.active {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.showcase-visual {
  flex-shrink: 0;
}

.production-thumbnail {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

.production-initial {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  z-index: 2;
}

.showcase-content {
  flex: 1;
  min-width: 0;
}

.production-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.production-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.production-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-prep {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.status-shooting {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-post {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-wrapped {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.production-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.detail-value {
  color: #ffffff;
  font-weight: 500;
  font-size: 0.875rem;
}

.progress-section {
  margin-top: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.progress-percentage {
  font-weight: 600;
  color: #22c55e;
  font-size: 0.875rem;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 3px;
  transition: width 0.8s ease;
  position: relative;
}

.progress-fill::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
  animation: progress-shimmer 2s ease-in-out infinite;
}

.showcase-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.live-indicator {
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
}

.activity-timeline {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  padding: 2rem;
}

.timeline-container {
  position: relative;
}

.timeline-track {
  position: absolute;
  left: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #3b82f6, rgba(59, 130, 246, 0.3));
}

.timeline-events {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.timeline-event {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  animation: event-appear 0.6s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateX(-20px);
}

.event-marker {
  position: relative;
  flex-shrink: 0;
}

.marker-dot {
  width: 60px;
  height: 60px;
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  flex: 1;
}

.event-description {
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.event-timestamp {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.floating-action {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.floating-action:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.action-symbol {
  font-size: 1.5rem;
  font-weight: 300;
  color: #ffffff;
  z-index: 2;
}

.action-ripple {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 50%;
  animation: ripple-expand 3s ease-out infinite;
}

/* Animations */
@keyframes gradient-shift {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes float-drift {
  0% {
    transform: translateY(100vh) translateX(0);
  }
  100% {
    transform: translateY(-100px) translateX(100px);
  }
}

@keyframes ring-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 10px currentColor;
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 20px currentColor;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes progress-shimmer {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-20px);
  }
  50% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes event-appear {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes ripple-expand {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.brand-symbol.animate .symbol-inner {
  animation: symbol-burst 0.8s ease-out;
}

@keyframes symbol-burst {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.3) rotate(180deg);
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

@keyframes quantum-fade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
