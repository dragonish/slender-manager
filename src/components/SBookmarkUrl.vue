<template>
  <span class="slender-bookmark-url">
    <template v-for="({ isUrlKey, text }, index) in textList" :key="index">
      <span :class="{ 'slender-bookmark-dynamic-text': isUrlKey }" :title="textTitle(isUrlKey, text)">{{ text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getLocation, findUrlKeys } from '@/common/url';

const props = defineProps<{
  url: string;
}>();

const textList = computed(() => {
  return findUrlKeys(props.url);
});

function textTitle(isUrlKey: boolean, text: string) {
  if (isUrlKey) {
    const key = text.slice(1, -1) as keyof Location;
    return getLocation(key);
  }
  return '';
}
</script>

<style>
.slender-bookmark-dynamic-text {
  color: #379b37;
}
</style>
