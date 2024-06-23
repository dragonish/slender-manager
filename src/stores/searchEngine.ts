import { defineStore } from 'pinia';
import type { SearchEngineListParams } from '@/apis/searchEngines';

interface SearchEngineStore {
  params: SearchEngineListParams;
  selectedRowKeys: Key[];
}

export const useSearchEngineStore = defineStore('searchEngine', {
  state: (): SearchEngineStore => ({
    params: {
      page: 1,
      size: 20,
      order: 'created-time',
    },
    selectedRowKeys: [],
  }),
});
