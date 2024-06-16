import { ajaxGet } from './ajax';

export function getInfo() {
  return ajaxGet<Info>('/about/info');
}

export function getIcons() {
  return ajaxGet<Icons>('/about/icons');
}
