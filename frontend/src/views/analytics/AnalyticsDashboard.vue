<template>
  <div class="analytics-dashboard">
    <!-- Header with filters -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Production Analytics</h1>
        <div class="header-controls">
          <select
            v-model="selectedProduction"
            @change="loadData"
            class="production-select"
          >
            <option v-for="prod in productions" :key="prod.id" :value="prod.id">
              {{ prod.title }}
            </option>
          </select>
          <select
            v-model="timeframe"
            @change="loadData"
            class="timeframe-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button @click="refreshData" class="refresh-btn" :disabled="loading">
            <RotateCcw :class="{ 'animate-spin': loading }" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading analytics...</p>
    </div>

    <!-- Main content -->
    <div v-else class="dashboard-content">
      <!-- Key Metrics Cards -->
      <div class="metrics-grid">
        <MetricCard
          title="Production Velocity"
          :value="formatVelocity(dashboardData.velocity?.current)"
          :trend="dashboardData.velocity?.trend"
          icon="TrendingUp"
          color="blue"
        />
        <MetricCard
          title="Efficiency Score"
          :value="formatPercentage(dashboardData.efficiency?.score)"
          :trend="dashboardData.efficiency?.trend"
          icon="Target"
          color="green"
        />
        <MetricCard
          title="Schedule Status"
          :value="formatScheduleStatus(dashboardData.schedule?.variance_days)"
          :subtitle="dashboardData.velocity?.forecast"
          icon="Clock"
          color="purple"
        />
        <MetricCard
          title="Daily Cost"
          :value="formatCurrency(dashboardData.budget?.daily_average)"
          :trend="dashboardData.budget?.variance_percent"
          icon="DollarSign"
          color="orange"
        />
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <h3 class="chart-title">Velocity Trend</h3>
          <VelocityChart :data="chartData.velocity" />
        </div>

        <div class="chart-container">
          <h3 class="chart-title">Efficiency Analysis</h3>
          <EfficiencyChart :data="chartData.efficiency" />
        </div>
      </div>

      <!-- Insights Section -->
      <div class="insights-section">
        <h3 class="section-title">AI Insights & Recommendations</h3>
        <div class="insights-grid">
          <InsightCard
            v-for="insight in dashboardData.insights"
            :key="insight.id"
            :insight="insight"
          />
        </div>
      </div>

      <!-- Detailed Analysis Tabs -->
      <div class="analysis-tabs">
        <div class="tab-headers">
          <button
            v-for="tab in analysisTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-header', { active: activeTab === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <VelocityAnalysis
            v-if="activeTab === 'velocity'"
            :production-id="selectedProduction"
          />
          <EfficiencyBreakdown
            v-if="activeTab === 'efficiency'"
            :production-id="selectedProduction"
          />
          <PredictiveInsights
            v-if="activeTab === 'predictions'"
            :production-id="selectedProduction"
          />
          <CostAnalysis
            v-if="activeTab === 'costs'"
            :production-id="selectedProduction"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import {
  RotateCcw,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
} from "lucide-vue-next";
import { useAnalyticsStore } from "@/stores/analytics";
import { useProductionStore } from "@/stores";

// Components
import MetricCard from "@/components/analytics/widgets/MetricCard.vue";
import VelocityChart from "@/components/analytics/charts/VelocityChart.vue";
import EfficiencyChart from "@/components/analytics/charts/EfficiencyChart.vue";
import InsightCard from "@/components/analytics/widgets/InsightCard.vue";
import VelocityAnalysis from "@/components/analytics/VelocityAnalysis.vue";
import EfficiencyBreakdown from "@/components/analytics/EfficiencyBreakdown.vue";
import PredictiveInsights from "@/components/analytics/PredictiveInsights.vue";
import CostAnalysis from "@/components/analytics/CostAnalysis.vue";

const route = useRoute();
const analyticsStore = useAnalyticsStore();
const productionStore = useProductionStore();

// Reactive data
const loading = ref(false);
const selectedProduction = ref(route.params.productionId || null);
const timeframe = ref("30d");
const activeTab = ref("velocity");

// Store data
const dashboardData = computed(() => analyticsStore.dashboardData);
const chartData = computed(() => analyticsStore.chartData);
const productions = computed(() => productionStore.productions);

// Tab configuration
const analysisTabs = [
  { id: "velocity", label: "Velocity Analysis" },
  { id: "efficiency", label: "Efficiency Breakdown" },
  { id: "predictions", label: "Predictive Insights" },
  { id: "costs", label: "Cost Analysis" },
];

// Methods
const loadData = async () => {
  if (!selectedProduction.value) return;

  loading.value = true;
  try {
    await analyticsStore.loadDashboardData({
      productionId: selectedProduction.value,
      timeframe: timeframe.value,
    });
  } catch (error) {
    console.error("Failed to load analytics data:", error);
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  await loadData();
};

// Formatters
const formatVelocity = (velocity) => {
  if (!velocity) return "--";
  return `${velocity.toFixed(1)} pages/day`;
};

const formatPercentage = (value) => {
  if (!value) return "--";
  return `${value.toFixed(0)}%`;
};

const formatScheduleStatus = (varianceDays) => {
  if (!varianceDays) return "On Track";
  if (varianceDays > 0) return `${varianceDays} days behind`;
  if (varianceDays < 0) return `${Math.abs(varianceDays)} days ahead`;
  return "On Track";
};

const formatCurrency = (amount) => {
  if (!amount) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Lifecycle
onMounted(async () => {
  if (!productions.value.length) {
    await productionStore.fetchProductions();
  }

  if (!selectedProduction.value && productions.value.length) {
    selectedProduction.value = productions.value[0].id;
  }

  await loadData();
});

// Watchers
watch(
  () => route.params.productionId,
  (newId) => {
    if (newId && newId !== selectedProduction.value) {
      selectedProduction.value = newId;
      loadData();
    }
  }
);
</script>

<style scoped>
.analytics-dashboard {
  min-height: 100vh;
  background: #f8fafc;
  padding: 1.5rem;
}

.dashboard-header {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.production-select,
.timeframe-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
}

.refresh-btn {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-container {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.insights-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.analysis-tabs {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-headers {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-header {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-header:hover {
  background: #f9fafb;
}

.tab-header.active {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  background: #eff6ff;
}

.tab-content {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .analytics-dashboard {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-controls {
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .tab-headers {
    flex-wrap: wrap;
  }

  .tab-header {
    min-width: 50%;
  }
}
</style>
