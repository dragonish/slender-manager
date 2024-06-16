import { ajaxGet } from './ajax';

export function getIcons() {
  return ajaxGet<string[]>('/icons');
}
