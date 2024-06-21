import { h } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';

export const customFilterIcon = (opt: { filtered: boolean }) =>
  h(SearchOutlined, {
    style: `color: ${opt.filtered ? '#108ee9' : 'unset'}`,
  });
