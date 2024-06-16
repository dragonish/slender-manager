<template>
  <a-table
    :data-source="data && data[1]?.list"
    row-key="loginId"
    size="small"
    bordered
    :locale
    :columns
    :pagination
    :loading="loading || clearLoading || logoutLoading"
    :scroll="{ x: true }"
    @change="onTableChange"
  >
    <template #title>
      <a-space>
        <template #split>
          <a-divider type="vertical" />
        </template>
        <a-popconfirm placement="bottomLeft" :title="t('logins.clearConfirm')" :ok-text="t('actions.ok')" :cancel-text="t('actions.cancel')" @confirm="onClear">
          <a-button type="primary" danger size="small">{{ t('actions.clear') }}</a-button>
        </a-popconfirm>
        <a-popconfirm
          placement="bottomLeft"
          :title="t('logins.logoutAllConfirm')"
          :ok-text="t('actions.ok')"
          :cancel-text="t('actions.cancel')"
          @confirm="onLogoutAll"
        >
          <a-button type="primary" danger size="small">{{ t('logins.logoutAll') }}</a-button>
        </a-popconfirm>
      </a-space>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'admin'">
        {{ record.isAdmin ? t('logins.admin') : t('logins.user') }}
      </template>
    </template>
    <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
      <div style="padding: 8px">
        <a-input
          ref="searchInput"
          :placeholder="t('actions.searchPlaceholder', { msg: column.title })"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block"
          @change="(e: any) => setSelectedKeys(e.target?.value ? [e.target.value] : [])"
          @pressEnter="onSearch(confirm)"
        ></a-input>
        <a-button type="primary" size="small" style="width: 90px; margin-right: 8px" @click="onSearch(confirm)">
          <template #icon><search-outlined /></template>
          {{ t('actions.search') }}
        </a-button>
        <a-button size="small" style="width: 90px" @click="onReset(clearFilters)">{{ t('actions.reset') }}</a-button>
      </div>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { ref, computed, h, onBeforeMount } from 'vue';
import { usePagination, useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import type { TableColumnType, TableProps } from 'ant-design-vue';
import type { FilterDropdownProps } from 'ant-design-vue/es/table/interface';
import { SearchOutlined } from '@ant-design/icons-vue';
import { MessageSchema } from '@/locales/schema';
import { useLoginStore } from '@/stores/login';
import { getLoginList, clearLoginLog, logoutAllUsers } from '@/apis/logins';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const loginStore = useLoginStore();

const { data, run, refresh, current, total, pageSize, loading } = usePagination(getLoginList);
const { run: clearRun, loading: clearLoading } = useRequest(clearLoginLog, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('logins.clearErr'));
    } else {
      message.success(t('logins.cleared'));
      refresh();
    }
  },
});
const { run: logoutRun, loading: logoutLoading } = useRequest(logoutAllUsers, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('logins.logoutAllErr'));
    } else {
      window.location.reload();
    }
  },
});

const searchInput = ref<HTMLInputElement>();

const customFilterIcon = (opt: { filtered: boolean }) =>
  h(SearchOutlined, {
    style: `color: ${opt.filtered ? '#108ee9' : 'unset'}`,
  });

const columns: TableColumnType<LoginBaseData>[] = [
  {
    key: 'ip',
    dataIndex: 'ip',
    title: 'IP',
    customFilterDropdown: true,
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        window.setTimeout(() => {
          searchInput.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: loginStore.params.ip ? [loginStore.params.ip] : undefined,
    filterIcon: customFilterIcon,
  },
  {
    key: 'ua',
    dataIndex: 'ua',
    title: 'User-Agent',
    customFilterDropdown: true,
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        window.setTimeout(() => {
          searchInput.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: loginStore.params.ua ? [loginStore.params.ua] : undefined,
    filterIcon: customFilterIcon,
  },
  {
    key: 'admin',
    dataIndex: 'isAdmin',
    title: t('logins.identity'),
    align: 'center',
    filters: [
      { text: t('logins.admin'), value: true },
      { text: t('logins.user'), value: false },
    ],
    filterMultiple: false,
    defaultFilteredValue: loginStore.params.admin == null ? undefined : [loginStore.params.admin.toString()],
  },
  {
    key: 'loginTime',
    dataIndex: 'loginTime',
    title: t('logins.loginTime'),
  },
];

const locale: TableProps['locale'] = {
  filterConfirm: t('actions.ok'),
  filterReset: t('actions.reset'),
  emptyText: t('actions.empty'),
};

const pagination = computed(() => ({
  total: total.value,
  current: current.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} / ${total}`,
}));

onBeforeMount(() => {
  run(loginStore.params);
});

const onTableChange: TableProps<FolderListItem>['onChange'] = (pag, filters) => {
  loginStore.params.ip = filters.ip?.toString();
  loginStore.params.ua = filters.ua?.toString();
  if (filters.admin == null) {
    loginStore.params.admin = null;
  } else {
    loginStore.params.admin = !!filters.admin[0];
  }

  if (pag.current) {
    loginStore.params.page = pag.current;
  }
  if (pag.pageSize) {
    loginStore.params.size = pag.pageSize;
  }

  run(loginStore.params);
};

function onSearch(confirm: FilterDropdownProps<FolderListItem>['confirm']) {
  confirm();
}

function onReset(clearFilters: FilterDropdownProps<FolderListItem>['clearFilters']) {
  if (clearFilters) {
    clearFilters({ confirm: true, closeDropdown: true });
  }
}

function onClear() {
  clearRun();
}

function onLogoutAll() {
  logoutRun();
}
</script>
