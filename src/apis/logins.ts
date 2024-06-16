import { ajaxDelete, ajaxGet, ajaxPost } from './ajax';

export interface LoginListParams {
  page: number;
  size: number;
  order: LoginOrder;
  admin: boolean | null;
  ip?: string;
  ua?: string;
}

export function getLoginList(params: LoginListParams) {
  let ad = '';
  if (params.admin != null) {
    ad = params.admin ? '1' : '0';
  }

  return ajaxGet<LoginListData>(
    `/logins?page=${params.page}&size=${params.size}&order=${params.order}&admin=${ad}&ip=${encodeURIComponent(params.ip || '')}&ua=${encodeURIComponent(
      params.ua || ''
    )}`
  );
}

export function clearLoginLog() {
  return ajaxDelete<undefined>('/logins');
}

export function logoutAllUsers() {
  return ajaxPost<undefined, undefined>('/logins', undefined);
}
