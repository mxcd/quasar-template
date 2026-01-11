<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { connect, disconnect } from "./api/websocket";

onMounted(connect);
onUnmounted(disconnect);
</script>
