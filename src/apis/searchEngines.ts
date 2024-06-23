import { ajaxDelete, ajaxGet, ajaxPatch, ajaxPost } from './ajax';

export interface SearchEngineListParams {
  page: number;
  size: number;
  order: SearchEngineOrder;
  name?: string;
  url?: string;
  method?: string;
}

export function getSearchEngineList(params: SearchEngineListParams) {
  let m = '';
  if (params.method != null) {
    m = params.method.toLowerCase();
  }

  return ajaxGet<SearchEngineListData>(
    `/search-engines?page=${params.page}&size=${params.size}&order=${params.order}&method=${m}&name=${encodeURIComponent(
      params.name || ''
    )}&url=${encodeURIComponent(params.url || '')}`
  );
}

export function addSearchEngine(searchEngine: SearchEngineBody) {
  return ajaxPost<number, SearchEngineBody>('/search-engines', searchEngine);
}

export function getSearchEngine(searchEngineId: number) {
  return ajaxGet<SearchEngineBaseData>('/search-engines/' + searchEngineId);
}

export function updateSearchEngine(searchEngineId: number, searchEngine: SearchEngineBody) {
  return ajaxPatch<undefined, SearchEngineBody>('/search-engines/' + searchEngineId, searchEngine);
}

export function deleteSearchEngine(searchEngineId: number) {
  return ajaxDelete<undefined>('/search-engines/' + searchEngineId);
}

export function batchSearchEngine<T = unknown>(body: SearchEngineBatchBody<T>) {
  return ajaxPatch<undefined, SearchEngineBatchBody<T>>('/search-engines', body);
}
