// frontend/src/components/analytics/AnalyticsWrapper.vue
<template>
  <div class="analytics-wrapper">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Analytics Dashboard -->
    <div v-else class="analytics-dashboard">
      <AnalyticsDashboard :production-id="productionId" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import AnalyticsDashboard from "./AnalyticsDashboard.jsx";

export default {
  name: "AnalyticsWrapper",
  components: {
    AnalyticsDashboard,
  },
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const productionId = ref(null);

    onMounted(async () => {
      // Získat production ID z route nebo API
      productionId.value =
        route.params.productionId || (await getDefaultProductionId());
      loading.value = false;
    });

    const getDefaultProductionId = async () => {
      try {
        const response = await fetch("/api/v1/production/productions/");
        const data = await response.json();
        return data.results?.[0]?.id || null;
      } catch (error) {
        console.error("Error fetching productions:", error);
        return null;
      }
    };

    return {
      loading,
      productionId,
    };
  },
};
</script>

<style scoped>
.analytics-wrapper {
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
