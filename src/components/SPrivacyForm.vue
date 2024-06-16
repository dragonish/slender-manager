<template>
  <a-form name="privacy_form">
    <a-form-item :label="t('data.privacy.text')" :tooltip="t('data.privacy.tip')" name="privacy">
      <a-switch v-model:checked="privacy" @change="v => emit('change', !!v)"></a-switch>
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

const privacy = ref(false);

const emit = defineEmits<{
  change: [v: boolean];
}>();
</script>
