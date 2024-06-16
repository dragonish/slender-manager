<template>
  <a-table
    :data-source="data && data[1]?.list"
    row-key="id"
    size="small"
    bordered
    :locale
    :columns
    :pagination
    :loading="loading || deleteLoading || removeAllLoading"
    :scroll="{ x: true }"
    @change="onTableChange"
  >
    <template #title>
      <a-popconfirm
        placement="bottomLeft"
        :title="t('files.removeUnusedConfirm')"
        :ok-text="t('actions.ok')"
        :cancel-text="t('actions.cancel')"
        @confirm="onRemoveUnused"
      >
        <a-button type="primary" danger size="small">{{ t('files.removeUnused') }}</a-button>
      </a-popconfirm>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'icon'">
        <a-avatar shape="square" size="small" :src="record.path"></a-avatar>
      </template>
      <template v-else-if="column.key === 'used'">
        <s-bool-state :state="record[column.key]"></s-bool-state>
      </template>
      <template v-else-if="column.key === 'action'">
        <a-space>
          <a-button shape="circle" size="small" :title="t('actions.download')" @click="onDownload(record.path)">
            <download-outlined></download-outlined>
          </a-button>
          <a-popconfirm
            placement="leftTop"
            :title="t('files.deleteConfirm')"
            :ok-text="t('actions.ok')"
            :cancel-text="t('actions.cancel')"
            @confirm="onDeleteFile(record.id, record.path)"
          >
            <a-button danger shape="circle" size="small" :title="t('actions.delete')">
              <delete-outlined></delete-outlined>
            </a-button>
          </a-popconfirm>
        </a-space>
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
import { DeleteOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { MessageSchema } from '@/locales/schema';
import { useFileStore } from '@/stores/file';
import { getFileList, deleteFile, removeAllUnused } from '@/apis/files';
import { saveAs } from 'file-saver';
import SBoolState from '@/components/SBoolState.vue';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const fileStore = useFileStore();

const { data, run, refresh, current, total, pageSize, loading } = usePagination(getFileList);
const { runAsync: deleteRun, loading: deleteLoading } = useRequest(deleteFile);
const { run: removeAllRun, loading: removeAllLoading } = useRequest(removeAllUnused, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('files.UnusedRemoveErr'));
    } else {
      message.success(t('files.UnusedRemoved'));
      refresh();
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
    key: 'icon',
    title: t('data.icon.text'),
    align: 'center',
    width: 50,
  },
  {
    key: 'path',
    dataIndex: 'path',
    title: t('files.path'),
    customFilterDropdown: true,
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        window.setTimeout(() => {
          searchInput.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: fileStore.params.path ? [fileStore.params.path] : undefined,
    filterIcon: customFilterIcon,
  },
  {
    key: 'used',
    dataIndex: 'used',
    title: t('files.used'),
    align: 'center',
    width: 100,
    filters: [
      { text: t('actions.yes'), value: true },
      { text: t('actions.no'), value: false },
    ],
    filterMultiple: false,
    defaultFilteredValue: fileStore.params.use == null ? undefined : [fileStore.params.use.toString()],
  },
  {
    key: 'action',
    title: t('actions.action'),
    width: 100,
    align: 'center',
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
  run(fileStore.params);
});

const onTableChange: TableProps<FolderListItem>['onChange'] = (pag, filters) => {
  fileStore.params.path = filters.path?.toString();

  if (filters.used == null) {
    fileStore.params.use = null;
  } else {
    fileStore.params.use = !!filters.used[0];
  }

  if (pag.current) {
    fileStore.params.page = pag.current;
  }
  if (pag.pageSize) {
    fileStore.params.size = pag.pageSize;
  }

  run(fileStore.params);
};

function onSearch(confirm: FilterDropdownProps<FolderListItem>['confirm']) {
  confirm();
}

function onReset(clearFilters: FilterDropdownProps<FolderListItem>['clearFilters']) {
  if (clearFilters) {
    clearFilters({ confirm: true, closeDropdown: true });
  }
}

function onRemoveUnused() {
  removeAllRun();
}

async function onDeleteFile(fileId: number, filePath: string) {
  if (fileId) {
    const res = await deleteRun(fileId, true);
    if (res[0]) {
      message.error(t('files.deleteErr', { msg: filePath }));
    } else {
      message.success(t('files.deleted', { msg: filePath }));
      refresh();
    }
  }
}

function onDownload(path: string) {
  saveAs(path, path.substring(path.lastIndexOf('/') + 1));
}
</script>
