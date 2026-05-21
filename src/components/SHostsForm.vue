<template>
  <a-form name="enabled_hosts_form">
    <a-form-item :label="t('data.enabledHosts.text')" :tooltip="t('data.enabledHosts.tip')" name="enabledHosts">
      <a-space-compact block>
        <a-input :value="enabledHosts" :placeholder="t('bookmarks.hosts')" @change="v => emit('change', v.target.value || '')"></a-input>
        <a-button :title="t('bookmarks.hostTip')" @click="onInsertCurrentHost">{{ t('bookmarks.host') }}</a-button>
      </a-space-compact>
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

const enabledHosts = ref('');

const emit = defineEmits<{
  change: [v: string];
}>();

function onInsertCurrentHost() {
  const curList = enabledHosts.value
    .trim()
    .split(',')
    .map(v => v.trim())
    .filter(v => v);
  const host = window.location.host;
  if (!curList.includes(host)) {
    curList.push(host);
  }
  enabledHosts.value = curList.join(',');
  emit('change', enabledHosts.value);
}
</script>
