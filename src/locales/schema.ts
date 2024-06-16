import en from './en.json';

/** message schema */
export type MessageSchema = typeof en;

export function getLocalLanguage() {
  const lang = navigator.language;
  const l = lang.substring(0, 2);
  if (l === 'zh') {
    return 'zh-CN';
  }
  return 'en';
}
