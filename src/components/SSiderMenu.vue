<template>
  <a-menu v-model:selectedKeys="selectedKeys" class="slender-css-no-select" theme="dark" mode="vertical">
    <template v-for="{ key, icon, text, path, children } in menuList" :key="key">
      <a-menu-item v-if="path" :key="key">
        <router-link :to="path">
          <component :is="icon"></component>
          <span class="nav-text">{{ text }}</span>
        </router-link>
      </a-menu-item>
      <a-sub-menu v-else>
        <template #title>
          <span>
            <inbox-outlined style="margin-right: 5px" />
            {{ text }}
          </span>
        </template>
        <a-menu-item v-for="item in children" :key="item.key">
          <router-link :to="item.path || ''">
            <component :is="item.icon"></component>
            <span class="nav-text">{{ item.text }}</span>
          </router-link>
        </a-menu-item>
      </a-sub-menu>
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { ref, watch, type FunctionalComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';
import {
  FileImageOutlined,
  FolderOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { pathMatcher } from '@/common/url';

interface MenuItem {
  key: MenuKey;
  icon: FunctionalComponent;
  text: string;
  path?: string;
  children?: MenuItem[];
}

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const route = useRoute();

const menuList: MenuItem[] = [
  {
    key: 'bookmarks',
    icon: OrderedListOutlined,
    text: t('menus.bookmarks'),
    path: '/bookmarks',
  },
  {
    key: 'folders',
    icon: FolderOutlined,
    text: t('menus.folders'),
    path: '/folders',
  },
  {
    key: 'searchEngines',
    icon: SearchOutlined,
    text: t('menus.searchEngines'),
    path: '/search-engines',
  },
  {
    key: 'files',
    icon: FileImageOutlined,
    text: t('menus.files'),
    path: '/files',
  },
  {
    key: 'logins',
    icon: UserOutlined,
    text: t('menus.logins'),
    path: '/logins',
  },
  {
    key: 'settings',
    icon: SettingOutlined,
    text: t('menus.settings'),
    path: '/settings',
  },
  {
    key: 'about',
    icon: InfoCircleOutlined,
    text: t('menus.about'),
    path: '/about',
  },
];

const selectedKeys = ref<MenuKey[]>(['bookmarks']);

//? First access to page
routeToMenuKey(location.pathname);

//? Routing changes
watch(
  () => route.path,
  toPath => {
    routeToMenuKey(toPath);
  }
);

function routeToMenuKey(path: string) {
  if (pathMatcher(path, '/bookmarks')) {
    selectedKeys.value = ['bookmarks'];
  } else if (pathMatcher(path, '/folders')) {
    selectedKeys.value = ['folders'];
  } else if (pathMatcher(path, '/search-engines')) {
    selectedKeys.value = ['searchEngines'];
  } else if (pathMatcher(path, '/files')) {
    selectedKeys.value = ['files'];
  } else if (pathMatcher(path, '/logins')) {
    selectedKeys.value = ['logins'];
  } else if (pathMatcher(path, '/settings')) {
    selectedKeys.value = ['settings'];
  } else if (pathMatcher(path, '/about')) {
    selectedKeys.value = ['about'];
  }
}
</script>
