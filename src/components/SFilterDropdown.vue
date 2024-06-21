<template>
  <div style="padding: 8px">
    <a-input
      ref="searchInput"
      :placeholder="t('actions.searchPlaceholder', { msg: title })"
      :value="value"
      style="width: 188px; margin-bottom: 8px; display: block"
      @change="(e: any) => emit('change', e.target?.value ? [e.target.value] : [])"
      @pressEnter="() => confirm()"
    ></a-input>
    <a-button type="primary" size="small" style="width: 90px; margin-right: 8px" @click="() => confirm()">
      <template #icon><search-outlined /></template>
      {{ t('actions.search') }}
    </a-button>
    <a-button size="small" style="width: 90px" @click="onReset()">{{ t('actions.reset') }}</a-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FilterDropdownProps } from 'ant-design-vue/es/table/interface';
import { SearchOutlined } from '@ant-design/icons-vue';
import { MessageSchema } from '@/locales/schema';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const props = defineProps<{
  title: string;
  value: Key;
  confirm: FilterDropdownProps<BookmarkListItem>['confirm'];
  clearFilters: FilterDropdownProps<FolderListItem>['clearFilters'];
}>();

const emit = defineEmits<{
  change: [value: Key[]];
}>();

defineExpose({
  focus,
});

const searchInput = ref<HTMLInputElement>();

function onReset() {
  if (typeof props.clearFilters === 'function') {
    props.clearFilters({ confirm: true, closeDropdown: true });
  }
}

function focus() {
  searchInput.value?.focus();
}
</script>
