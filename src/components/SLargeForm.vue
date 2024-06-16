<template>
  <a-form name="large_form">
    <a-form-item :label="t('data.large.text')" :tooltip="t('data.large.tip')" name="large">
      <a-switch v-model:checked="large" @change="v => emit('change', !!v)"></a-switch>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const large = ref(false);

const emit = defineEmits<{
  change: [v: boolean];
}>();
</script>
