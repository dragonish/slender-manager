<template>
  <a-config-provider
    :locale
    :theme="{
      algorithm: scheme,
    }"
  >
    <a-layout class="slender-app-layout">
      <a-layout-sider class="slender-layout-sider" width="150" breakpoint="lg" collapsed-width="40">
        <div class="slender-logo slender-css-no-select">Slender</div>
        <s-sider-menu></s-sider-menu>
      </a-layout-sider>

      <a-layout class="slender-main-layout">
        <a-layout-header class="slender-layout-header">
          <s-header-breadcrumb></s-header-breadcrumb>
          <div class="slender-layout-header-element">
            <a-dropdown :trigger="['click']">
              <template #overlay>
                <a-menu @click="switchColor">
                  <a-menu-item key="system">System</a-menu-item>
                  <a-menu-item key="light">Light</a-menu-item>
                  <a-menu-item key="dark">Dark</a-menu-item>
                </a-menu>
              </template>
              <a-button type="text" class="slender-color-scheme-text">{{ colorText }}</a-button>
            </a-dropdown>
            <a-button type="link" danger href="/admin/logout" target="_self">{{ t('logins.logout') }}</a-button>
          </div>
        </a-layout-header>

        <a-layout-content class="slender-layout-content">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { theme } from 'ant-design-vue';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import enUS from 'ant-design-vue/es/locale/en_US';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { getLocalLanguage, type MessageSchema } from '@/locales/schema';
import SSiderMenu from './components/SSiderMenu.vue';
import SHeaderBreadcrumb from './components/SHeaderBreadcrumb.vue';

type colorScheme = 'system' | 'light' | 'dark';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const storageKey = 'slender-color';

const locale = ref(getLocalLanguage() === 'zh-CN' ? zhCN : enUS);
const color = ref<colorScheme>('system');

const scheme = computed(() => {
  if (color.value === 'system') {
    return isDarkColorScheme() ? theme.darkAlgorithm : theme.defaultAlgorithm;
  }
  return color.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;
});

const colorText = computed(() => {
  switch (color.value) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'system':
    default:
      return 'System';
  }
});

function isDarkColorScheme() {
  return matchMedia('(prefers-color-scheme: dark)').matches;
}

function switchColor(info: MenuInfo) {
  const key = info.key as colorScheme;
  color.value = key;
  localStorage.setItem(storageKey, key);
}

onBeforeMount(() => {
  const storage = localStorage.getItem(storageKey);
  if (storage) {
    switch (storage as colorScheme) {
      case 'light':
        color.value = 'light';
        break;
      case 'dark':
        color.value = 'dark';
        break;
      case 'system':
      default:
        color.value = 'system';
        break;
    }
  }
});
</script>

<style lang="less">
.slender-app-layout {
  .slender-layout-sider {
    .slender-logo {
      color: #ffffff;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 8px;
    }
  }

  .slender-main-layout {
    padding: 0;
    overflow: auto;
    height: 100dvh;

    .slender-layout-header {
      position: fixed;
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      padding-inline: 5px;
      z-index: 1;

      .slender-layout-header-element {
        position: fixed;
        right: 0;

        .slender-color-scheme-text {
          color: #ffffff;
        }
      }
    }

    .slender-layout-content {
      margin: 40px 0 0 0;
      padding: 5px 10px 5px 10px;
      overflow: auto;
    }
  }
}

@media screen and (max-width: 991px) {
  .slender-app-layout {
    .slender-layout-sider .slender-logo {
      overflow: hidden;
      visibility: hidden;
    }
  }
}
</style>
