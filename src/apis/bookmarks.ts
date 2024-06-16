import { ajaxDelete, ajaxGet, ajaxPatch, ajaxPost } from './ajax';

export interface BookmarkListParams {
  page: number;
  size: number;
  order: BookmarkOrder;
  privacy: boolean | null;
  name?: string;
  description?: string;
  url?: string;
  folder?: number;
}

export function getBookmarkList(params: BookmarkListParams) {
  let pr = '';
  if (params.privacy != null) {
    pr = params.privacy ? '1' : '0';
  }

  let f = '';
  if (params.folder != undefined) {
    f = params.folder.toString();
  }

  return ajaxGet<BookmarkListData>(
    `/bookmarks?page=${params.page}&size=${params.size}&order=${params.order}&privacy=${pr}&name=${encodeURIComponent(
      params.name || ''
    )}&description=${encodeURIComponent(params.description || '')}&url=${encodeURIComponent(params.url || '')}&folder=${f}`
  );
}

export function addBookmark(bookmark: BookmarkBody) {
  return ajaxPost<number, BookmarkBody>('/bookmarks', bookmark);
}

export function getBookmark(bookmarkId: number) {
  return ajaxGet<BookmarkResData>('/bookmarks/' + bookmarkId);
}

export function updateBookmark(bookmarkId: number, bookmark: BookmarkBody) {
  const { visits, ...other } = bookmark;

  return ajaxPatch<undefined, BookmarkBody>(
    '/bookmarks/' + bookmarkId,
    visits != undefined
      ? {
          visits,
          ...other,
        }
      : other
  );
}

export function deleteBookmark(bookmarkId: number) {
  return ajaxDelete<undefined>('/bookmarks/' + bookmarkId);
}

export function batchBookmark<T = unknown>(body: BookmarkBatchBody<T>) {
  return ajaxPatch<undefined, BookmarkBatchBody<T>>('/bookmarks', body);
}

export function importBookmarks(list: BookmarkImportItem[]) {
  return ajaxPost<number, BookmarkImportItem[]>('/import/bookmarks', list);
}
