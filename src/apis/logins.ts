import { ajaxDelete, ajaxGet, ajaxPatch } from './ajax';

export interface LoginListParams {
  page: number;
  size: number;
  order: LoginOrder;
  admin: boolean | null;
  active: boolean | null;
  ip?: string;
  ua?: string;
}

export function getLoginList(params: LoginListParams) {
  let ad = '',
    ac = '';
  if (params.admin != null) {
    ad = params.admin ? '1' : '0';
  }
  if (params.active != null) {
    ac = params.active ? '1' : '0';
  }

  return ajaxGet<LoginListData>(
    `/logins?page=${params.page}&size=${params.size}&order=${params.order}&admin=${ad}&active=${ac}&ip=${encodeURIComponent(
      params.ip || ''
    )}&ua=${encodeURIComponent(params.ua || '')}`
  );
}

export function logoutUser(id: string) {
  return ajaxPatch<undefined, undefined>(`/logins/${id}`, undefined);
}

export function cleanLoginLog() {
  return ajaxDelete<undefined>('/logins');
}

export function logoutAllUsers() {
  return ajaxPatch<undefined, undefined>('/logins', undefined);
}

export function getCurrentId() {
  return ajaxGet<string>('/admin');
}
