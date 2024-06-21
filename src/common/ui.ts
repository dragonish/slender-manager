import { h } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import type { SelectProps } from 'ant-design-vue';

export const customFilterIcon = (opt: { filtered: boolean }) =>
  h(SearchOutlined, {
    style: `color: ${opt.filtered ? '#108ee9' : 'unset'}`,
  });

export const builtInFilterOption: SelectProps['filterOption'] = (inputValue, option) => {
  if (option?.value) {
    const oVal = option.label.toLowerCase();
    const iValArr = inputValue.toLowerCase().split(/\s+/);
    for (const item of iValArr) {
      if (oVal.indexOf(item) === -1) {
        return false;
      }
    }
    return true;
  }
  return false;
};
