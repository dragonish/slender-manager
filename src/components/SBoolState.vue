<template>
  <a-tag v-if="state" color="#87d068">
    {{ t('actions.yes') }}
  </a-tag>
  <a-tag v-else color="#6a6a6a">
    {{ t('actions.no') }}
  </a-tag>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

defineProps<{
  state?: boolean;
}>();
</script>
