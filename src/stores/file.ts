import { defineStore } from 'pinia';
import type { FileListParams } from '@/apis/files';

interface FileStore {
  params: FileListParams;
}

export const useFileStore = defineStore('file', {
  state: (): FileStore => ({
    params: {
      page: 1,
      size: 20,
      use: null,
    },
  }),
});
