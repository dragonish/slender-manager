import { defineStore } from 'pinia';
import type { FolderListParams } from '@/apis/folders';

interface FolderStore {
  params: FolderListParams;
  selectedRowKeys: Key[];
}

export const useFolderStore = defineStore('folder', {
  state: (): FolderStore => ({
    params: {
      page: 1,
      size: 20,
      order: 'weight',
      privacy: null,
    },
    selectedRowKeys: [],
  }),
});
