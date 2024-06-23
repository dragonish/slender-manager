<template>
  <span class="slender-searchengine-url">
    <template v-for="({ highlight, text }, index) in textList" :key="index">
      <span :class="{ 'slender-bookmark-dynamic-text': highlight }" :title="highlight ? t('searchEngines.placeholder') : ''">{{ text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';
import { findKeys } from '@/common/url';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const props = defineProps<{
  url: string;
}>();

const textList = computed(() => {
  return findKeys(props.url, true);
});
</script>

<style>
.slender-bookmark-dynamic-text {
  color: #379b37;
}
</style>
