<template>
  <a-form name="hide_in_other_form">
    <a-form-item :label="t('data.hideInOther.text')" :tooltip="t('data.hideInOther.tip')" name="hideInOther">
      <a-switch v-model:checked="hideInOther" @change="v => emit('change', !!v)"></a-switch>
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

const hideInOther = ref(false);

const emit = defineEmits<{
  change: [v: boolean];
}>();
</script>
