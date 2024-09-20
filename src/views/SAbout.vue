<template>
  <a-descriptions :column="1" size="small" bordered :title="t('menus.about')" class="slender-about-descriptions">
    <a-descriptions-item :label="t('about.appVersion')">{{ info.version + '-' + info.commit }}</a-descriptions-item>
    <a-descriptions-item :label="t('about.appBuildDate')">{{ info.buildDate }}</a-descriptions-item>

    <a-descriptions-item :label="t('about.managerVersion')">{{ jsVersion }}</a-descriptions-item>
    <a-descriptions-item :label="t('about.managerBuildDate')">{{ jsDate }}</a-descriptions-item>

    <a-descriptions-item :label="t('about.mdiVersion')">{{ info.mdiVersion }}</a-descriptions-item>
    <a-descriptions-item :label="t('about.siVersion')">{{ info.siVersion }}</a-descriptions-item>

    <a-descriptions-item :label="t('about.arch')">{{ info.os + '/' + info.arch }}</a-descriptions-item>

    <a-descriptions-item :label="t('about.appLink')">
      <a href="https://github.com/dragonish/slender-go" target="_blank" rel="noopener">dragonish/slender-go</a>
    </a-descriptions-item>
    <a-descriptions-item :label="t('about.managerLink')">
      <a href="https://github.com/dragonish/slender-manager" target="_blank" rel="noopener">dragonish/slender-manager</a>
    </a-descriptions-item>
    <a-descriptions-item :label="t('about.mdiLink')">
      <a href="https://github.com/Templarian/MaterialDesign" target="_blank" rel="noopener">Templarian/MaterialDesign</a>
    </a-descriptions-item>
    <a-descriptions-item :label="t('about.siLink')">
      <a href="https://github.com/simple-icons/simple-icons" target="_blank" rel="noopener">simple-icons/simple-icons</a>
    </a-descriptions-item>
  </a-descriptions>
</template>

<script setup lang="ts">
import { reactive, onBeforeMount } from 'vue';
import { useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';
import { getInfo, getIcons } from '@/apis/about';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const jsVersion = import.meta.env.VERSION + ` [${import.meta.env.DEV ? t('about.dev') : t('about.official')}]`;
const jsDate = import.meta.env.DATE;

const info = reactive<Info & Icons>({
  version: '0.0.0',
  commit: '',
  os: '',
  arch: '',
  buildDate: '',
  mdiVersion: '',
  siVersion: '',
});

const { run } = useRequest(getInfo, {
  onSuccess(data) {
    if (data[1]) {
      Object.assign(info, data[1]);
    }
  },
});

const { run: runIcons } = useRequest(getIcons, {
  onSuccess(data) {
    if (data[1]) {
      Object.assign(info, data[1]);
    }
  },
});

onBeforeMount(() => {
  run();
  runIcons();
});
</script>

<style>
.slender-about-descriptions {
  text-align: center;
}
</style>
