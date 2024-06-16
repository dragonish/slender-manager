<template>
  <a-form name="weight_form">
    <a-form-item :label="t('data.weight.text')" :tooltip="t('data.weight.tip')" name="weight">
      <a-input-number
        v-model:value="weight"
        ref="input"
        :addon-before="inc ? '+' : undefined"
        :min="-32768"
        :max="32767"
        :step="1"
        @change="v => emit('change', (v && parseInt(v.toString())) || 0)"
      ></a-input-number>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

defineProps<{
  inc?: boolean;
}>();

const weight = ref(0);

const input = ref<HTMLInputElement>();

const emit = defineEmits<{
  change: [v: number];
}>();

window.setTimeout(() => {
  nextTick(() => {
    input.value?.focus();
  });
}, 100);
</script>
