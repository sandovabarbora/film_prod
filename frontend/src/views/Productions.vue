<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Productions</h1>
      <button class="btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        New Production
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="spinner"></div>
    </div>

    <div v-else class="grid gap-6">
      <div
        v-for="production in productions"
        :key="production.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-gradient-to-br from-production-500 to-production-700 rounded-xl flex items-center justify-center"
            >
              <Film class="w-6 h-6 text-white" />
            </div>

            <div>
              <div class="flex items-center space-x-3">
                <h2 class="text-xl font-semibold text-gray-900">
                  {{ production.title }}
                </h2>
                <span
                  class="status-badge"
                  :class="getStatusClass(production.status)"
                >
                  {{ getStatusText(production.status) }}
                </span>
              </div>

              <div
                class="mt-1 flex items-center space-x-6 text-sm text-gray-500"
              >
                <span>Director: {{ production.director }}</span>
                <span>Producer: {{ production.producer }}</span>
                <span
                  >{{ formatDate(production.start_date) }} -
                  {{ formatDate(production.end_date) }}</span
                >
              </div>

              <div class="mt-2 flex items-center space-x-6 text-sm">
                <span class="text-gray-600"
                  >{{ production.scenes_count }} scenes</span
                >
                <span class="text-wrap-600 font-medium"
                  >{{ production.completion_percentage }}% complete</span
                >
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <router-link
              :to="`/productions/${production.id}`"
              class="btn-secondary"
            >
              View Details
            </router-link>

            <router-link
              v-if="production.status === 'shoot'"
              :to="`/productions/${production.id}/dashboard`"
              class="btn-primary"
            >
              <div class="flex items-center">
                <div class="live-indicator mr-2"></div>
                Live Dashboard
              </div>
            </router-link>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-4">
          <div
            class="flex items-center justify-between text-sm text-gray-600 mb-1"
          >
            <span>Production Progress</span>
            <span>{{ production.completion_percentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-wrap-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${production.completion_percentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Film, Plus } from "lucide-vue-next";
import { useProductionStore } from "@/stores";

const productionStore = useProductionStore();

const isLoading = ref(false);
const productions = computed(() => productionStore.productions);

const getStatusClass = (status) => {
  const classes = {
    prep: "bg-gray-100 text-gray-800",
    shoot: "bg-alert-100 text-alert-800",
    post: "bg-onset-100 text-onset-800",
    wrap: "bg-wrap-100 text-wrap-800",
  };
  return classes[status] || classes.prep;
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("cs-CZ");
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await productionStore.fetchProductions();
  } catch (error) {
    console.error("Error loading productions:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
