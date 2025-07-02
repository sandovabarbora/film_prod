<template>
  <div id="app">
    <!-- Just render the route component without navigation -->
    <router-view v-slot="{ Component }">
      <transition name="quantum-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Home,
  Film,
  Users,
  Calendar,
  Bell,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
} from "lucide-vue-next";
import { useNotificationStore } from "@/stores";

const router = useRouter();
const notificationStore = useNotificationStore();

const navigation = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Productions", path: "/productions", icon: Film },
  // Ostatní odkazy prozatím zakomentované
  // { name: 'Crew', path: '/crew', icon: Users },
  // { name: 'Schedule', path: '/schedule', icon: Calendar },
  // { name: 'Notifications', path: '/notifications', icon: Bell },
  // { name: 'Settings', path: '/settings', icon: Settings },
];

const isLive = ref(false);
const notifications = computed(() => notificationStore.activeNotifications);

const notificationClass = (type) => {
  const classes = {
    success: "border-green-500/50",
    error: "border-red-500/50",
    warning: "border-amber-500/50",
    info: "border-blue-500/50",
  };
  return classes[type] || classes.info;
};

const notificationIcon = (type) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };
  return icons[type] || icons.info;
};

const dismissNotification = (id) => {
  notificationStore.dismissNotification(id);
};

onMounted(() => {
  // Initialize real-time connection
  // TODO: WebSocket connection for live updates

  // Check if we're currently shooting
  checkLiveStatus();
});

const checkLiveStatus = () => {
  // TODO: Check if there's an active shooting day
  const now = new Date();
  const hour = now.getHours();

  // Simple mock: assume we're live during working hours
  isLive.value = hour >= 6 && hour <= 20;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
