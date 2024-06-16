import { ajaxPost } from './ajax';

export function requestAdminStatus(password: string) {
  return ajaxPost('/admin', {
    password,
  });
}
