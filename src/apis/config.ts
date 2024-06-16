import { ajaxGet, ajaxPatch } from './ajax';

export function getConfig() {
  return ajaxGet<SlenderSettings>('/config');
}

export function updateConfig(conf: Partial<SlenderSettings>) {
  return ajaxPatch<undefined, Partial<SlenderSettings>>('/config', conf);
}
