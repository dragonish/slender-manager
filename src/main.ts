import { createApp } from 'vue';
import { setGlobalOptions } from 'vue-request';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';
import { requestAdminStatus } from '@/apis/admin';
import { getLocalLanguage } from './locales/schema';
import type { MessageSchema } from './locales/schema';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';
import './style.css';

setGlobalOptions({
  manual: true,
  loadingDelay: 500,
  loadingKeep: 1000,
  pagination: {
    currentKey: 'page',
    pageSizeKey: 'size',
    totalKey: '1.total',
  },
});

const bookmarks = () => import('@/views/SBookmarks.vue');
const folders = () => import('@/views/SFolders.vue');
const searchEngines = () => import('@/views/SSearchengines.vue');
const files = () => import('@/views/SFiles.vue');
const logins = () => import('@/views/SLogins.vue');
const settings = () => import('@/views/SSettings.vue');
const about = () => import('@/views/SAbout.vue');

const i18n = createI18n<[MessageSchema], 'en' | 'zh-CN'>({
  legacy: false,
  locale: getLocalLanguage(),
  fallbackLocale: 'en',
  messages: {
    en: en,
    'zh-CN': zhCN,
  },
});

const pinia = createPinia();

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: bookmarks,
    },
    {
      path: '/folders',
      name: 'folders',
      component: folders,
    },
    {
      path: '/search-engines',
      name: 'searchEngines',
      component: searchEngines,
    },
    {
      path: '/files',
      name: 'files',
      component: files,
    },
    {
      path: '/logins',
      name: 'logins',
      component: logins,
    },
    {
      path: '/settings',
      name: 'settings',
      component: settings,
    },
    {
      path: '/about',
      name: 'about',
      component: about,
    },
    {
      path: '/:pathMacth(.*)*',
      redirect: '/bookmarks',
    },
  ],
});

const app = createApp(App);

app.use(i18n);
app.use(pinia);
app.use(router);

app.mount('#app');

//? requesting administrator status in development mode.
if (import.meta.env.DEV) {
  const password = import.meta.env.GO_DEV ? import.meta.env.DEV_ADMIN_PWD : import.meta.env.PRO_ADMIN_PWD;
  requestAdminStatus(password);
}
