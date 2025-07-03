<!-- frontend/src/views/analytics/AnalyticsDashboard.vue -->
<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900">Production Analytics</h1>
        <div class="flex items-center space-x-4">
          <select
            v-model="timeframe"
            @change="fetchDashboardData"
            class="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            @click="fetchDashboardData"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!dashboardData" class="text-center py-12">
      <p class="text-gray-500 mb-4">No analytics data available</p>
      <button
        @click="generateSampleData"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Generate Sample Data
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Key Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Velocity Card -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Current Velocity</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ (dashboardData.velocity?.current || 0).toFixed(1) }}
              </p>
              <p class="text-sm text-gray-500">pages/day</p>
            </div>
            <div class="text-2xl">📈</div>
          </div>
          <div v-if="dashboardData.velocity?.trend" class="mt-4">
            <span
              :class="
                getTrendClass(dashboardData.velocity.trend.change_percent)
              "
            >
              {{ dashboardData.velocity.trend.change_percent > 0 ? "+" : ""
              }}{{ dashboardData.velocity.trend.change_percent }}%
            </span>
          </div>
        </div>

        <!-- Efficiency Card -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Efficiency Score</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ Math.round(dashboardData.efficiency?.score || 0) }}%
              </p>
              <p class="text-sm text-gray-500">composite score</p>
            </div>
            <div class="text-2xl">⚡</div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${dashboardData.efficiency?.score || 0}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Schedule Card -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Schedule Status</p>
              <p :class="getStatusClass(dashboardData.schedule?.status)">
                {{ getScheduleStatusText(dashboardData.schedule) }}
              </p>
            </div>
            <div class="text-2xl">📅</div>
          </div>
        </div>

        <!-- Budget Card -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Daily Cost Avg</p>
              <p class="text-3xl font-bold text-gray-900">
                ${{
                  (dashboardData.budget?.daily_average || 0).toLocaleString()
                }}
              </p>
              <p class="text-sm text-gray-500">per day</p>
            </div>
            <div class="text-2xl">💰</div>
          </div>
          <div v-if="dashboardData.budget?.variance_percent" class="mt-4">
            <span
              :class="getVarianceClass(dashboardData.budget.variance_percent)"
            >
              {{ dashboardData.budget.variance_percent > 0 ? "+" : ""
              }}{{ dashboardData.budget.variance_percent }}% variance
            </span>
          </div>
        </div>
      </div>

      <!-- Simple Chart Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Velocity Chart (Simple Table) -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-xl font-semibold mb-4">Recent Velocity Data</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Date
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Pages
                  </th>
                  <th
                    class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in recentTimelineData" :key="item.date">
                  <td class="px-3 py-2 text-sm text-gray-900">
                    {{ formatDate(item.date) }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-900">
                    {{ item.pages_shot }}
                  </td>
                  <td class="px-3 py-2 text-sm text-gray-900">
                    {{ Math.round(item.efficiency_score || 0) }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stats Summary -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-xl font-semibold mb-4">Production Summary</h3>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Scenes Completed:</span>
              <span class="font-semibold">{{ getTotalScenesCompleted() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Shots Completed:</span>
              <span class="font-semibold">{{ getTotalShotsCompleted() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Pages Shot:</span>
              <span class="font-semibold">{{ getTotalPagesShot() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Average Efficiency:</span>
              <span class="font-semibold">{{ getAverageEfficiency() }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Insights Section -->
      <div
        v-if="dashboardData.insights && dashboardData.insights.length > 0"
        class="bg-white rounded-xl shadow-sm p-6 mb-8"
      >
        <h3 class="text-xl font-semibold mb-4">Actionable Insights</h3>
        <div class="space-y-4">
          <div
            v-for="(insight, index) in dashboardData.insights"
            :key="index"
            :class="getInsightClass(insight.type)"
          >
            <div class="flex items-start">
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">{{ insight.title }}</h4>
                <p class="text-gray-700 mt-1">{{ insight.message }}</p>
                <p v-if="insight.action" class="text-sm text-gray-600 mt-2">
                  <strong>Action:</strong> {{ insight.action }}
                </p>
              </div>
              <span :class="getInsightBadgeClass(insight.type)">
                {{ insight.category }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Forecast Section -->
      <div
        v-if="dashboardData.velocity?.forecast"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 class="text-xl font-semibold mb-4">Completion Forecast</h3>
        <div class="flex items-center space-x-8">
          <div>
            <p class="text-sm font-medium text-gray-600">
              Predicted Completion
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatDate(dashboardData.velocity.forecast) }}
            </p>
          </div>
          <div class="text-4xl">🎬</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";

export default {
  name: "AnalyticsDashboard",
  setup() {
    const dashboardData = ref(null);
    const loading = ref(true);
    const timeframe = ref("30d");

    // Your production ID
    const productionId = "76e5afda-a65e-4104-8a0e-8bf2e6e3f6d6";

    const recentTimelineData = computed(() => {
      if (!dashboardData.value?.timeline_data) return [];
      return dashboardData.value.timeline_data.slice(-10); // Last 10 days
    });

    const fetchDashboardData = async () => {
      loading.value = true;
      try {
        const response = await fetch(
          `/api/v1/analytics/dashboard/overview/?production_id=${productionId}&timeframe=${timeframe.value}`
        );

        if (response.ok) {
          const data = await response.json();
          dashboardData.value = data;
        } else {
          console.error("API Error:", response.status, response.statusText);
          dashboardData.value = null;
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        dashboardData.value = null;
      } finally {
        loading.value = false;
      }
    };

    const generateSampleData = async () => {
      try {
        // You could call a Django management command endpoint here
        alert(
          'Run: python manage.py generate_simple_data --production-id="76e5afda-a65e-4104-8a0e-8bf2e6e3f6d6" --days=30 --clear'
        );
      } catch (error) {
        console.error("Error generating sample data:", error);
      }
    };

    // Helper functions
    const formatDate = (dateString) => {
      if (!dateString) return "TBD";
      return new Date(dateString).toLocaleDateString();
    };

    const getTrendClass = (changePercent) => {
      if (changePercent > 5)
        return "text-xs px-2 py-1 rounded-full bg-green-100 text-green-800";
      if (changePercent < -5)
        return "text-xs px-2 py-1 rounded-full bg-red-100 text-red-800";
      return "text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800";
    };

    const getStatusClass = (status) => {
      const baseClass =
        "text-lg font-semibold px-3 py-1 rounded-full inline-block ";
      switch (status) {
        case "excellent":
          return baseClass + "text-green-600 bg-green-100";
        case "normal":
          return baseClass + "text-blue-600 bg-blue-100";
        case "warning":
          return baseClass + "text-yellow-600 bg-yellow-100";
        case "critical":
          return baseClass + "text-red-600 bg-red-100";
        default:
          return baseClass + "text-gray-600 bg-gray-100";
      }
    };

    const getVarianceClass = (variance) => {
      if (variance > 10)
        return "text-xs px-2 py-1 rounded-full bg-red-100 text-red-800";
      if (variance > 0)
        return "text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800";
      return "text-xs px-2 py-1 rounded-full bg-green-100 text-green-800";
    };

    const getInsightClass = (type) => {
      const baseClass = "p-4 rounded-lg border-l-4 ";
      switch (type) {
        case "warning":
          return baseClass + "border-yellow-400 bg-yellow-50";
        case "alert":
          return baseClass + "border-red-400 bg-red-50";
        default:
          return baseClass + "border-blue-400 bg-blue-50";
      }
    };

    const getInsightBadgeClass = (type) => {
      const baseClass = "px-2 py-1 text-xs rounded-full font-medium ";
      switch (type) {
        case "warning":
          return baseClass + "bg-yellow-200 text-yellow-800";
        case "alert":
          return baseClass + "bg-red-200 text-red-800";
        default:
          return baseClass + "bg-blue-200 text-blue-800";
      }
    };

    const getScheduleStatusText = (schedule) => {
      if (!schedule) return "Unknown";

      if (schedule.variance_days > 0) {
        return `${schedule.variance_days} days behind`;
      } else if (schedule.variance_days < 0) {
        return `${Math.abs(schedule.variance_days)} days ahead`;
      }
      return "On schedule";
    };

    // Summary calculations
    const getTotalScenesCompleted = () => {
      if (!dashboardData.value?.timeline_data) return 0;
      return dashboardData.value.timeline_data.reduce(
        (sum, item) => sum + (item.scenes_completed || 0),
        0
      );
    };

    const getTotalShotsCompleted = () => {
      if (!dashboardData.value?.timeline_data) return 0;
      return dashboardData.value.timeline_data.reduce(
        (sum, item) => sum + (item.shots_completed || 0),
        0
      );
    };

    const getTotalPagesShot = () => {
      if (!dashboardData.value?.timeline_data) return 0;
      return dashboardData.value.timeline_data
        .reduce((sum, item) => sum + parseFloat(item.pages_shot || 0), 0)
        .toFixed(1);
    };

    const getAverageEfficiency = () => {
      if (!dashboardData.value?.timeline_data) return 0;
      const validScores = dashboardData.value.timeline_data.filter(
        (item) => item.efficiency_score
      );
      if (validScores.length === 0) return 0;
      const avg =
        validScores.reduce((sum, item) => sum + item.efficiency_score, 0) /
        validScores.length;
      return Math.round(avg);
    };

    onMounted(() => {
      fetchDashboardData();
    });

    return {
      dashboardData,
      loading,
      timeframe,
      recentTimelineData,
      fetchDashboardData,
      generateSampleData,
      formatDate,
      getTrendClass,
      getStatusClass,
      getVarianceClass,
      getInsightClass,
      getInsightBadgeClass,
      getScheduleStatusText,
      getTotalScenesCompleted,
      getTotalShotsCompleted,
      getTotalPagesShot,
      getAverageEfficiency,
    };
  },
};
</script>

<style scoped>
/* Component specific styles if needed */
</style>
