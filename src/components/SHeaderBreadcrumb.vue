<template>
  <a-breadcrumb class="slender-breadcrumb">
    <a-breadcrumb-item>
      <a-button type="link" href="/">
        <home-outlined class="slender-breadcrumb-item"></home-outlined>
      </a-button>
    </a-breadcrumb-item>
    <a-breadcrumb-item class="slender-breadcrumb-item">{{ cur }}</a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';
import type { Route } from 'ant-design-vue/es/breadcrumb/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons-vue';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const routes: Record<MenuKey, Route> = {
  bookmarks: {
    path: '/bookmarks',
    breadcrumbName: t('menus.bookmarks'),
  },
  folders: {
    path: '/folders',
    breadcrumbName: t('menus.folders'),
  },
  searchEngines: {
    path: '/search-engines',
    breadcrumbName: t('menus.searchEngines'),
  },
  files: {
    path: '/files',
    breadcrumbName: t('menus.files'),
  },
  logins: {
    path: '/logins',
    breadcrumbName: t('menus.logins'),
  },
  settings: {
    path: '/settings',
    breadcrumbName: t('menus.settings'),
  },
  about: {
    path: '/about',
    breadcrumbName: t('menus.about'),
  },
};

const route = useRoute();

const cur = ref('');

//? First access to page
routeToBreadcrumb(location.pathname);

//? Routing changes
watch(
  () => route.path,
  toPath => {
    routeToBreadcrumb(toPath);
  }
);

function routeToBreadcrumb(path: string) {
  for (const key in routes) {
    const item = routes[key as MenuKey];
    if (path.includes(item.path)) {
      cur.value = item.breadcrumbName;
      break;
    }
  }
}
</script>

<style lang="less">
body .slender-breadcrumb {
  margin: 0 5px;

  .slender-breadcrumb-item,
  .ant-breadcrumb-separator {
    color: #ffffff;
  }
}
</style>
