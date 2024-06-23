<template>
  <span class="slender-bookmark-url">
    <template v-for="({ highlight, text }, index) in textList" :key="index">
      <span :class="{ 'slender-bookmark-dynamic-text': highlight }" :title="textTitle(highlight, text)">{{ text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getLocation, findKeys } from '@/common/url';

const props = defineProps<{
  url: string;
}>();

const textList = computed(() => {
  return findKeys(props.url);
});

function textTitle(highlight: boolean, text: string) {
  if (highlight) {
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
