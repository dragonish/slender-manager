<template>
  <a-form name="enabled_form">
    <a-form-item :label="t('data.enabled.text')" :tooltip="t('data.enabled.tip')" name="enabled">
      <a-switch v-model:checked="enabled" @change="v => emit('change', !!v)"></a-switch>
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

const enabled = ref(true);

const emit = defineEmits<{
  change: [v: boolean];
}>();
</script>
