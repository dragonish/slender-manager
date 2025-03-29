<template>
  <a-spin class="slenter-settings" :spinning>
    <a-divider orientation="left">{{ t('settings.contentSetting') }}</a-divider>
    <a-flex vertical gap="large">
      <a-flex wrap="wrap">
        <span>{{ t('settings.websiteTitle') }}:</span>
        <a-input v-model:value="settings.title" @change="onChange('content')"></a-input>
      </a-flex>
      <a-flex wrap="wrap">
        <span>{{ t('settings.customFooter') }}:</span>
        <a-textarea v-model:value="settings.customFooter" :auto-size="{ minRows: 2, maxRows: 15 }" @change="onChange('content')"></a-textarea>
      </a-flex>
      <div>
        <a-button type="primary" :disabled="!status.content" @click="onSave('content')">{{ t('actions.save') }}</a-button>
      </div>
    </a-flex>
    <a-divider orientation="left">{{ t('settings.elementSetting') }}</a-divider>
    <a-flex vertical gap="large">
      <a-space>
        <a-switch v-model:checked="settings.showSidebar" @change="onChange('element')"></a-switch>
        <span>{{ t('settings.showSidebar') }}</span>
      </a-space>
      <a-space>
        <a-switch v-model:checked="settings.showSearchInput" @change="onChange('element')"></a-switch>
        <span>{{ t('settings.showSearchInput') }}</span>
      </a-space>
      <a-space>
        <a-switch v-model:checked="settings.showScrollTop" @change="onChange('element')"></a-switch>
        <span>{{ t('settings.showScrollTop') }}</span>
      </a-space>
      <div>
        <a-button type="primary" :disabled="!status.element" @click="onSave('element')">{{ t('actions.save') }}</a-button>
      </div>
    </a-flex>
    <a-divider orientation="left">{{ t('settings.moduleSetting') }}</a-divider>
    <a-flex vertical gap="large">
      <a-space>
        <a-switch v-model:checked="settings.showLatest" @change="onChange('module')"></a-switch>
        <span>{{ t('settings.showLatest') }}</span>
      </a-space>
      <a-space>
        <span>{{ t('settings.latestTotal') }}:</span>
        <a-input-number
          v-model:value="settings.latestTotal"
          :disabled="!settings.showLatest"
          :min="0"
          :max="100"
          :step="1"
          @change="onChange('module')"
        ></a-input-number>
      </a-space>
      <a-space>
        <a-switch v-model:checked="settings.showHot" @change="onChange('module')"></a-switch>
        <span>{{ t('settings.showHot') }}</span>
      </a-space>
      <a-space>
        <span>{{ t('settings.hotTotal') }}:</span>
        <a-input-number
          v-model:value="settings.hotTotal"
          :disabled="!settings.showHot"
          :min="0"
          :max="100"
          :step="1"
          @change="onChange('module')"
        ></a-input-number>
      </a-space>
      <div>
        <a-button type="primary" :disabled="!status.module" @click="onSave('module')">{{ t('actions.save') }}</a-button>
      </div>
    </a-flex>
    <a-divider orientation="left">{{ t('settings.bookmarkSetting') }}</a-divider>
    <a-flex vertical gap="large">
      <a-space>
        <a-switch v-model:checked="settings.useLetterIcon" @change="onChange('bookmark')"></a-switch>
        <span>{{ t('settings.useLetterIcon') }}</span>
      </a-space>
      <a-space>
        <a-switch v-model:checked="settings.openInNewWindow" @change="onChange('bookmark')"></a-switch>
        <span>{{ t('settings.openInNewWindow') }}</span>
      </a-space>
      <div>
        <a-button type="primary" :disabled="!status.bookmark" @click="onSave('bookmark')">{{ t('actions.save') }}</a-button>
      </div>
    </a-flex>
    <a-divider orientation="left">{{ t('settings.networkSetting') }}</a-divider>
    <a-flex vertical gap="large">
      <a-flex wrap="wrap">
        <span>{{ t('settings.internalNetwork') }}:</span>
        <a-input v-model:value="settings.internalNetwork" @change="onChange('network')"></a-input>
      </a-flex>
      <div>
        <a-button type="primary" :disabled="!status.network" @click="onSave('network')">{{ t('actions.save') }}</a-button>
      </div>
    </a-flex>
  </a-spin>
</template>

<script setup lang="ts">
import { reactive, computed, onBeforeMount } from 'vue';
import { useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { MessageSchema } from '@/locales/schema';
import { getConfig, updateConfig } from '@/apis/config';

type SettingsType = 'content' | 'element' | 'module' | 'bookmark' | 'network';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const { runAsync: getRun, loading: getLoading } = useRequest(getConfig);
const { runAsync: updateRun, loading: updateLoading } = useRequest(updateConfig);

const settings = reactive<SlenderSettings>({
  title: '',
  customFooter: '',
  showSidebar: false,
  showSearchInput: false,
  showScrollTop: false,
  showLatest: false,
  latestTotal: 0,
  showHot: false,
  hotTotal: 0,
  useLetterIcon: false,
  openInNewWindow: false,
  internalNetwork: '',
});

const status = reactive<Record<SettingsType, boolean>>({
  content: false,
  element: false,
  module: false,
  bookmark: false,
  network: false,
});

const spinning = computed(() => {
  return getLoading.value || updateLoading.value;
});

onBeforeMount(async () => {
  const data = await getRun();
  if (data[1]) {
    Object.assign<SlenderSettings, SlenderSettings>(settings, data[1]);
  } else {
    message.error(t('settings.readErr'));
  }
});

function onChange(key: SettingsType) {
  status[key] = true;
}

async function onSave(key: SettingsType) {
  const {
    title,
    customFooter,
    showSidebar,
    showSearchInput,
    showScrollTop,
    showLatest,
    latestTotal,
    showHot,
    hotTotal,
    useLetterIcon,
    openInNewWindow,
    internalNetwork,
  } = settings;

  let conf: Partial<SlenderSettings> = {};

  switch (key) {
    case 'content':
      conf = {
        title,
        customFooter,
      };
      break;
    case 'element':
      conf = {
        showSidebar,
        showSearchInput,
        showScrollTop,
      };
      break;
    case 'module':
      conf = {
        showLatest,
        latestTotal,
        showHot,
        hotTotal,
      };
      break;
    case 'bookmark':
      conf = {
        useLetterIcon,
        openInNewWindow,
      };
      break;
    case 'network':
      conf = {
        internalNetwork,
      };
      break;
  }

  const resData = await updateRun(conf);
  if (resData[0]) {
    message.error(t('settings.updateErr'));
  } else {
    status[key] = false;
    message.success(t('settings.updated'));
  }
}
</script>
