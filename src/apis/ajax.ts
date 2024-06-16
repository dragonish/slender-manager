import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { to } from 'await-to-js';

interface DataResponse<T> {
  data?: T;
}

const prefix_v1 = '/api/v1';

async function request<ReturnType>(method: Promise<AxiosResponse<DataResponse<ReturnType>>>): Promise<[null | Error, ReturnType | undefined]> {
  const res = await to(method);
  if (res[0]) {
    console.error(res[0]);
  }
  return [res[0], res[1]?.data?.data];
}

export function ajaxGet<ReturnType>(url: string) {
  return request(axios.get<DataResponse<ReturnType>>(prefix_v1 + url));
}

export function ajaxDelete<ReturnType>(url: string) {
  return request(axios.delete<DataResponse<ReturnType>>(prefix_v1 + url));
}

export function ajaxPost<ReturnType, ParamType = unknown>(url: string, data: ParamType) {
  return request(axios.post<DataResponse<ReturnType>>(prefix_v1 + url, data));
}

export function ajaxPut<ReturnType, ParamType = unknown>(url: string, data: ParamType) {
  return request(axios.put<DataResponse<ReturnType>>(prefix_v1 + url, data));
}

export async function ajaxPatch<ReturnType, ParamType = unknown>(url: string, data: ParamType) {
  return request(axios.patch<DataResponse<ReturnType>>(prefix_v1 + url, data));
}
