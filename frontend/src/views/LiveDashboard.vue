<template>
  <div class="space-y-6">
    <!-- Header with live status -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h1 class="text-3xl font-bold text-gray-900">Live Dashboard</h1>
        <div
          class="flex items-center space-x-2 px-3 py-1 bg-alert-50 rounded-full"
        >
          <div class="live-indicator"></div>
          <span class="text-sm font-semibold text-alert-700"
            >LIVE PRODUCTION</span
          >
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="text-right">
          <div class="text-2xl font-mono font-bold text-gray-900">
            {{ currentTime }}
          </div>
          <div class="text-sm text-gray-600">{{ currentDate }}</div>
        </div>
        <button @click="refreshData" class="btn-primary">
          <RotateCcw class="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Critical Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Current Status -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Current Status</h3>
          <component :is="statusIcon" class="w-6 h-6" :class="statusColor" />
        </div>
        <div class="space-y-2">
          <div class="text-2xl font-bold" :class="statusColor">
            {{ liveData?.current_status || "Preparing" }}
          </div>
          <div class="text-sm text-gray-600">
            Scene {{ liveData?.current_scene || "--" }}
            <span v-if="liveData?.current_shot"
              >• Shot {{ liveData.current_shot }}</span
            >
          </div>
        </div>
      </div>

      <!-- Schedule Status -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Schedule</h3>
          <Clock class="w-6 h-6 text-gray-400" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Behind/Ahead:</span>
            <span class="font-semibold" :class="scheduleColor">
              {{ scheduleText }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Est. Wrap:</span>
            <span class="font-mono">{{
              liveData?.estimated_wrap || "--:--"
            }}</span>
          </div>
        </div>
      </div>

      <!-- Progress Today -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Today's Progress</h3>
          <TrendingUp class="w-6 h-6 text-wrap-500" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Scenes:</span>
            <span class="font-semibold">{{
              liveData?.scenes_completed_today || 0
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Shots:</span>
            <span class="font-semibold">{{
              liveData?.shots_completed_today || 0
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Pages:</span>
            <span class="font-semibold">{{
              liveData?.pages_shot_today || 0
            }}</span>
          </div>
        </div>
      </div>

      <!-- Weather & Conditions -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Conditions</h3>
          <Sun class="w-6 h-6 text-onset-500" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Temperature:</span>
            <span class="font-semibold"
              >{{ liveData?.current_temperature || "--" }}°C</span
            >
          </div>
          <div class="text-sm text-gray-600">
            {{ liveData?.weather_description || "No data" }}
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Crew on set:</span>
            <span class="font-semibold"
              >{{ liveData?.crew_on_set || 0 }}/{{
                liveData?.crew_total || 0
              }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Status Update -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Status Update Panel -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Update Status</h3>
          <Radio class="w-6 h-6 text-gray-400" />
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Current Scene</label
              >
              <input
                v-model="statusUpdate.current_scene"
                type="text"
                class="input-field"
                placeholder="e.g., 5A"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Current Shot</label
              >
              <input
                v-model="statusUpdate.current_shot"
                type="text"
                class="input-field"
                placeholder="e.g., Master"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Status</label
            >
            <select v-model="statusUpdate.current_status" class="select-field">
              <option value="prep">Preparing</option>
              <option value="rehearsal">Rehearsing</option>
              <option value="lighting">Lighting</option>
              <option value="rolling">Rolling</option>
              <option value="reset">Resetting</option>
              <option value="moving_on">Moving On</option>
              <option value="meal_break">Meal Break</option>
              <option value="weather_hold">Weather Hold</option>
              <option value="equipment_issue">Equipment Issue</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Notes</label
            >
            <textarea
              v-model="statusUpdate.notes"
              rows="2"
              class="input-field"
              placeholder="Optional notes about current status..."
            ></textarea>
          </div>

          <button
            @click="updateStatus"
            :disabled="isUpdating"
            class="btn-primary w-full"
          >
            <Radio class="w-4 h-4 mr-2" />
            {{ isUpdating ? "Updating..." : "Broadcast Update" }}
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <Zap class="w-6 h-6 text-onset-500" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button
            @click="quickAction('lunch')"
            class="btn-secondary text-left p-4"
          >
            <Coffee class="w-5 h-5 mb-2 text-onset-600" />
            <div class="font-medium">Lunch Break</div>
            <div class="text-xs text-gray-600">Call lunch for cast & crew</div>
          </button>

          <button
            @click="quickAction('moving_on')"
            class="btn-secondary text-left p-4"
          >
            <ArrowRight class="w-5 h-5 mb-2 text-production-600" />
            <div class="font-medium">Moving On</div>
            <div class="text-xs text-gray-600">Next scene/setup</div>
          </button>

          <button
            @click="quickAction('weather_hold')"
            class="btn-secondary text-left p-4"
          >
            <Cloud class="w-5 h-5 mb-2 text-gray-600" />
            <div class="font-medium">Weather Hold</div>
            <div class="text-xs text-gray-600">Weather delay</div>
          </button>

          <button
            @click="quickAction('wrap')"
            class="btn-success text-left p-4"
          >
            <Check class="w-5 h-5 mb-2 text-white" />
            <div class="font-medium text-white">Wrap</div>
            <div class="text-xs text-wrap-100">End shooting day</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Next Up -->
    <div class="card" v-if="liveData?.next_scene">
      <div class="card-header">
        <h3 class="text-lg font-semibold text-gray-900">Next Up</h3>
        <ArrowRight class="w-6 h-6 text-gray-400" />
      </div>

      <div class="flex items-center justify-between">
        <div>
          <div class="text-xl font-semibold">
            Scene {{ liveData.next_scene }}
          </div>
          <div class="text-sm text-gray-600">
            Estimated start: {{ liveData.next_estimated_time }}
          </div>
        </div>
        <button @click="prepareNextScene" class="btn-primary">
          Prepare Scene
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
  Clock,
  Radio,
  Zap,
  TrendingUp,
  Sun,
  RotateCcw,
  ArrowRight,
  Coffee,
  Cloud,
  Check,
  Play,
  Pause,
  Square,
  AlertTriangle,
} from "lucide-vue-next";
import { useProductionStore } from "@/stores";
import { useNotificationStore } from "@/stores";

const route = useRoute();
const productionStore = useProductionStore();
const notificationStore = useNotificationStore();

const liveData = computed(() => productionStore.liveData);
const isUpdating = ref(false);
const currentTime = ref("");
const currentDate = ref("");

const statusUpdate = ref({
  current_scene: "",
  current_shot: "",
  current_status: "prep",
  notes: "",
});

// Status display logic
const statusIcon = computed(() => {
  const icons = {
    prep: Clock,
    rehearsal: Play,
    lighting: Sun,
    rolling: AlertTriangle,
    reset: RotateCcw,
    moving_on: ArrowRight,
    meal_break: Coffee,
    weather_hold: Cloud,
    equipment_issue: AlertTriangle,
  };
  return icons[liveData.value?.current_status] || Clock;
});

const statusColor = computed(() => {
  const colors = {
    prep: "text-gray-600",
    rehearsal: "text-onset-600",
    lighting: "text-onset-600",
    rolling: "text-alert-600",
    reset: "text-gray-600",
    moving_on: "text-production-600",
    meal_break: "text-onset-600",
    weather_hold: "text-gray-600",
    equipment_issue: "text-alert-600",
  };
  return colors[liveData.value?.current_status] || "text-gray-600";
});

const scheduleColor = computed(() => {
  const minutes = liveData.value?.behind_schedule_minutes || 0;
  if (minutes > 30) return "text-alert-600";
  if (minutes > 0) return "text-onset-600";
  return "text-wrap-600";
});

const scheduleText = computed(() => {
  const minutes = liveData.value?.behind_schedule_minutes || 0;
  if (minutes === 0) return "On schedule";
  if (minutes > 0) return `${minutes}min behind`;
  return `${Math.abs(minutes)}min ahead`;
});

let timeInterval = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  currentDate.value = now.toLocaleDateString("cs-CZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const refreshData = async () => {
  try {
    await productionStore.fetchLiveDashboard(route.params.id);
    notificationStore.showSuccess("Dashboard Updated", "Live data refreshed");
  } catch (error) {
    notificationStore.showError(
      "Update Failed",
      "Could not refresh dashboard data"
    );
  }
};

const updateStatus = async () => {
  if (!statusUpdate.value.current_status) return;

  isUpdating.value = true;
  try {
    await productionStore.updateStatus(route.params.id, statusUpdate.value);
    notificationStore.showSuccess(
      "Status Updated",
      "Production status broadcast to all crew"
    );

    // Clear form after successful update
    statusUpdate.value.notes = "";
  } catch (error) {
    notificationStore.showError(
      "Update Failed",
      "Could not broadcast status update"
    );
  } finally {
    isUpdating.value = false;
  }
};

const quickAction = async (action) => {
  const actions = {
    lunch: { current_status: "meal_break", notes: "Lunch break called" },
    moving_on: { current_status: "moving_on", notes: "Moving to next setup" },
    weather_hold: {
      current_status: "weather_hold",
      notes: "Weather hold in effect",
    },
    wrap: { current_status: "wrapped", notes: "That's a wrap!" },
  };

  const actionData = actions[action];
  if (actionData) {
    Object.assign(statusUpdate.value, actionData);
    await updateStatus();
  }
};

const prepareNextScene = () => {
  if (liveData.value?.next_scene) {
    statusUpdate.value.current_scene = liveData.value.next_scene;
    statusUpdate.value.current_status = "prep";
    statusUpdate.value.notes = "Preparing next scene";
  }
};

onMounted(async () => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);

  await refreshData();

  // Populate form with current data
  if (liveData.value) {
    statusUpdate.value.current_scene = liveData.value.current_scene || "";
    statusUpdate.value.current_shot = liveData.value.current_shot || "";
    statusUpdate.value.current_status = liveData.value.current_status || "prep";
  }

  // Auto-refresh every 30 seconds
  const refreshInterval = setInterval(refreshData, 30000);

  onUnmounted(() => {
    clearInterval(refreshInterval);
  });
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>
