<template>
  <a-form name="folder_form" :disabled="loading">
    <a-form-item :label="t('data.folder.text')" :tooltip="t('data.folder.tip')" name="folder">
      <a-select v-model:value="folderId" show-search :options :filter-option="filterOption" @select="onSelect"></a-select>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import type { SelectProps } from 'ant-design-vue';
import { MessageSchema } from '@/locales/schema';
import { getBookmarkFolderList } from '@/apis/folders';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const emit = defineEmits<{
  select: [v: number];
}>();

const { data, run, loading } = useRequest(getBookmarkFolderList);

const folderId = ref(0);

const options = computed<SelectProps['options']>(() => {
  const res: SelectProps['options'] = [
    {
      value: 0,
      label: t('bookmarks.noFolder'),
    },
  ];

  if (data.value) {
    data.value[1]?.forEach(item => {
      res.push({
        value: item.id,
        label: (item.privacy ? '*' : '') + item.name,
      });
    });
  }

  return res;
});

const filterOption: SelectProps['filterOption'] = (inputValue, option) => {
  if (option?.value) {
    return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  }
  return false;
};

const onSelect: SelectProps['onSelect'] = (v: unknown) => {
  if (typeof v === 'number') {
    emit('select', v);
  }
};

onBeforeMount(() => {
  run();
});
</script>
