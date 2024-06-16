import { defineStore } from 'pinia';
import type { BookmarkListParams } from '@/apis/bookmarks';

interface BookmarkStore {
  params: BookmarkListParams;
  selectdRowKeys: Key[];
}

export const useBookmarkStore = defineStore('bookmark', {
  state: (): BookmarkStore => ({
    params: {
      page: 1,
      size: 20,
      order: 'created-time',
      privacy: null,
    },
    selectdRowKeys: [],
  }),
});
