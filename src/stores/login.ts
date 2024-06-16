import { defineStore } from 'pinia';
import type { LoginListParams } from '@/apis/logins';

interface LoginStore {
  params: LoginListParams;
}

export const useLoginStore = defineStore('login', {
  state: (): LoginStore => ({
    params: {
      page: 1,
      size: 20,
      order: 'login-time',
      admin: null,
    },
  }),
});
