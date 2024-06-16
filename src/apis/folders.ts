import { ajaxDelete, ajaxGet, ajaxPatch, ajaxPost } from './ajax';

export interface FolderListParams {
  page: number;
  size: number;
  order: FolderOrder;
  privacy: boolean | null;
  name?: string;
  description?: string;
}

export function getFolderList(params: FolderListParams) {
  let pr = '';
  if (params.privacy != null) {
    pr = params.privacy ? '1' : '0';
  }

  return ajaxGet<FolderListData>(
    `/folders?page=${params.page}&size=${params.size}&order=${params.order}&privacy=${pr}&name=${encodeURIComponent(
      params.name || ''
    )}&description=${encodeURIComponent(params.description || '')}`
  );
}

export function addFolder(folder: FolderBody) {
  return ajaxPost<number, FolderBody>('/folders', folder);
}

export function getFolder(folderId: number) {
  return ajaxGet<FolderBaseData>('/folders/' + folderId);
}

export function updateFolder(folderId: number, folder: FolderBody) {
  return ajaxPatch<undefined, FolderBody>('/folders/' + folderId, folder);
}

export function deleteFolder(folderId: number) {
  return ajaxDelete<undefined>('/folders/' + folderId);
}

export function getBookmarkFolderList() {
  return ajaxGet<BookmarkFolderInfo[]>('/list/folders');
}

export function batchFolder<T = unknown>(body: FolderBatchBody<T>) {
  return ajaxPatch<undefined, FolderBatchBody<T>>('/folders', body);
}
