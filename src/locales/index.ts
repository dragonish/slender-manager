import { createI18n } from 'vue-i18n';
import en from './en.json';
import zhCN from './zh-CN.json';
import { getLocalLanguage, type MessageSchema } from './schema';

const i18n = createI18n<[MessageSchema], 'en' | 'zh-CN'>({
  legacy: false,
  locale: getLocalLanguage(),
  fallbackLocale: 'en',
  messages: {
    en: en,
    'zh-CN': zhCN,
  },
});

export default i18n;
