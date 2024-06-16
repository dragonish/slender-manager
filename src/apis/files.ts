import { ajaxDelete, ajaxGet } from './ajax';

export interface FileListParams {
  page: number;
  size: number;
  use: boolean | null;
  path?: string;
}

export function getFileList(params: FileListParams) {
  let u = '';
  if (params.use != null) {
    u = params.use ? '1' : '0';
  }

  return ajaxGet<FileListData>(`/files?page=${params.page}&size=${params.size}&use=${u}&path=${encodeURIComponent(params.path || '')}`);
}

export function deleteFile(fileId: number, force = false) {
  return ajaxDelete<undefined>(`/files/${fileId}?force=${force ? '1' : '0'}`);
}

export function removeAllUnused() {
  return ajaxDelete<undefined>('/files');
}
