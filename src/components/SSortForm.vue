<template>
  <a-form name="sort_form">
    <a-form-item :label="t('data.sortBy.text')" :tooltip="t('data.sortBy.tip')" name="sortBy">
      <a-select v-model:value="sortBy" :options="sortByOptions" @select="onSelect"></a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';
import type { SelectProps } from 'ant-design-vue';
import { sortByOptions } from '@/common/data';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const sortBy = ref<SortByType>('weight');

const emit = defineEmits<{
  change: [v: SortByType];
}>();

const onSelect: SelectProps['onSelect'] = (value: unknown) => {
  emit('change', value as SortByType);
};
</script>
