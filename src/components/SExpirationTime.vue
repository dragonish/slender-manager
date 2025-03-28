<template>
  <div :class="{ 'time-is-expired': expirationTime.isExpired }">{{ expirationTime.time }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getExpirationTime, isExpired } from '@/common/serializer';

const props = defineProps<{
  start: string;
  maxAge: number;
}>();

const expirationTime = computed(() => {
  const time = getExpirationTime(props.start, props.maxAge);
  return {
    time,
    isExpired: isExpired(time),
  };
});
</script>

<style>
.time-is-expired {
  opacity: 0.5;
}
</style>
