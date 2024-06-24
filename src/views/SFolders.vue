<template>
  <a-table
    :data-source="data && data[1]?.list"
    row-key="id"
    size="small"
    bordered
    :locale
    :columns
    :pagination
    :loading="loading || batchLoading"
    :row-selection="{ fixed: true, selectedRowKeys: folderStore.selectedRowKeys, onChange: onSelectChange }"
    :scroll="{ x: true }"
    @change="onTableChange"
  >
    <template #title>
      <a-space>
        <template #split>
          <a-divider type="vertical" />
        </template>
        <a-button type="primary" size="small" @click="onAdd">{{ t('actions.add') }}</a-button>
        <a-dropdown :disabled="folderStore.selectedRowKeys.length === 0">
          <template #overlay>
            <a-menu @click="onBatchEdit">
              <a-menu-item key="delete">{{ t('actions.delete') }}</a-menu-item>
              <a-menu-item key="setLarge">{{ t('folders.setLarge') }}</a-menu-item>
              <a-menu-item key="setPrivacy">{{ t('actions.setPrivacy') }}</a-menu-item>
              <a-sub-menu key="editWeight" :title="t('actions.editWeight')">
                <a-menu-item key="setWeight">{{ t('actions.setWeight') }}</a-menu-item>
                <a-menu-item key="incWeight">{{ t('actions.incWeight') }}</a-menu-item>
              </a-sub-menu>
            </a-menu>
          </template>
          <a-button size="small">
            {{ t('actions.edit') }}
            <down-outlined></down-outlined>
          </a-button>
        </a-dropdown>
      </a-space>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'large' || column.key === 'privacy'">
        <s-bool-state :state="record[column.key]"></s-bool-state>
      </template>
      <template v-else-if="column.key === 'action'">
        <a-button shape="circle" size="small" :title="t('actions.edit')" @click="onEdit(record.id)">
          <edit-outlined></edit-outlined>
        </a-button>
      </template>
    </template>
    <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
      <s-filter-dropdown
        ref="filterDropdown"
        :title="column.title"
        :value="selectedKeys[0]"
        :confirm
        :clear-filters="clearFilters"
        @change="v => setSelectedKeys(v)"
      ></s-filter-dropdown>
    </template>
  </a-table>
  <s-folder-modal v-model:open="modalOpen" :id="curId" :edit="editState" @changed="refresh"></s-folder-modal>
  <context-holder></context-holder>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onBeforeMount } from 'vue';
import { usePagination, useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import type { MenuProps, TableColumnType, TableProps } from 'ant-design-vue';
import { DownOutlined, EditOutlined } from '@ant-design/icons-vue';
import { MessageSchema } from '@/locales/schema';
import { useFolderStore } from '@/stores/folder';
import { batchFolder, getFolderList } from '@/apis/folders';
import { customFilterIcon } from '@/common/ui';
import SBoolState from '@/components/SBoolState.vue';
import SFolderModal from '@/components/SFolderModal.vue';
import SLargeForm from '@/components/SLargeForm.vue';
import SPrivacyForm from '@/components/SPrivacyForm.vue';
import SWeightForm from '@/components/SWeightForm.vue';
import SFilterDropdown from '@/components/SFilterDropdown.vue';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const folderStore = useFolderStore();

const { data, run, refresh, current, total, pageSize, loading } = usePagination(getFolderList);
const { run: batchRun, loading: batchLoading } = useRequest(batchFolder, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('folders.batchErr'));
    } else {
      message.success(t('folders.batched'));
      folderStore.selectedRowKeys = [];
      refresh();
    }
  },
});

const filterDropdown = ref<InstanceType<typeof SFilterDropdown> | null>();

const form = reactive({
  large: false,
  privacy: false,
  weight: 0,
});

const [modal, contextHolder] = Modal.useModal();

const columns: TableColumnType<FolderListItem>[] = [
  {
    key: 'name',
    dataIndex: 'name',
    title: t('data.name.text'),
    customFilterDropdown: true,
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        window.setTimeout(() => {
          filterDropdown.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: folderStore.params.name ? [folderStore.params.name] : undefined,
    filterIcon: customFilterIcon,
  },
  {
    key: 'description',
    dataIndex: 'description',
    title: t('data.description.text'),
    customFilterDropdown: true,
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        window.setTimeout(() => {
          filterDropdown.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: folderStore.params.description ? [folderStore.params.description] : undefined,
    filterIcon: customFilterIcon,
  },
  {
    key: 'privacy',
    dataIndex: 'privacy',
    title: t('data.privacy.text'),
    align: 'center',
    width: 100,
    filters: [
      { text: t('actions.yes'), value: true },
      { text: t('actions.no'), value: false },
    ],
    filterMultiple: false,
    defaultFilteredValue: folderStore.params.privacy == null ? undefined : [folderStore.params.privacy.toString()],
  },
  {
    key: 'large',
    dataIndex: 'large',
    title: t('data.large.text'),
    align: 'center',
    width: 80,
  },
  {
    key: 'weight',
    dataIndex: 'weight',
    title: t('data.weight.text'),
    align: 'center',
  },
  {
    key: 'bookmark-total',
    dataIndex: 'bookmarkTotal',
    title: t('folders.bookmarkTotal'),
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: folderStore.params.order === 'bookmark-total' ? 'descend' : undefined,
  },
  {
    key: 'modified-time',
    dataIndex: 'modifiedTime',
    title: t('data.modifiedTime.text'),
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: folderStore.params.order === 'modified-time' ? 'descend' : undefined,
  },
  {
    key: 'created-time',
    dataIndex: 'createdTime',
    title: t('data.createdTime.text'),
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: folderStore.params.order === 'created-time' ? 'descend' : undefined,
  },
  {
    key: 'action',
    title: t('actions.action'),
    width: 80,
    align: 'center',
  },
];

const onSelectChange = (selectedRowKeys: Key[]) => {
  folderStore.selectedRowKeys = selectedRowKeys;
};

const locale: TableProps['locale'] = {
  filterConfirm: t('actions.ok'),
  filterReset: t('actions.reset'),
  emptyText: t('actions.empty'),
};

const editState = ref(false);
const curId = ref(0);
const modalOpen = ref(false);

const pagination = computed(() => ({
  total: total.value,
  current: current.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} / ${total}`,
}));

onBeforeMount(() => {
  run(folderStore.params);
});

const onTableChange: TableProps<FolderListItem>['onChange'] = (pag, filters, sorter) => {
  folderStore.params.name = filters.name?.toString();
  folderStore.params.description = filters.description?.toString();
  if (filters.privacy == null) {
    folderStore.params.privacy = null;
  } else {
    folderStore.params.privacy = !!filters.privacy[0];
  }

  let sortField: FolderOrder = 'weight';
  if (Array.isArray(sorter)) {
    if (sorter[0].order) {
      sortField = sorter[0].columnKey as FolderOrder;
    }
  } else {
    if (sorter.order) {
      sortField = sorter.columnKey as FolderOrder;
    }
  }
  folderStore.params.order = sortField;

  if (pag.current) {
    folderStore.params.page = pag.current;
  }
  if (pag.pageSize) {
    folderStore.params.size = pag.pageSize;
  }

  run(folderStore.params);
};

function onAdd() {
  editState.value = false;
  curId.value = 0;
  modalOpen.value = true;
}

function onEdit(id: number) {
  editState.value = true;
  curId.value = id;
  modalOpen.value = true;
}

const onBatchEdit: MenuProps['onClick'] = e => {
  if (folderStore.selectedRowKeys.length === 0) {
    return;
  }

  const key = e.key as FolderBatchAction;
  switch (key) {
    case 'delete':
      modal.confirm({
        title: t('actions.delete'),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: t('folders.deleteConfirm', folderStore.selectedRowKeys.length),
        onOk() {
          batchRun({
            dataSet: folderStore.selectedRowKeys,
            action: 'delete',
          });
        },
      });
      break;
    case 'setLarge':
      form.large = false;
      modal.confirm({
        title: t('folders.setLarge'),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: h(SLargeForm, {
          onChange: v => {
            form.large = v;
          },
        }),
        onOk() {
          batchRun({
            dataSet: folderStore.selectedRowKeys,
            action: 'setLarge',
            payload: form.large,
          });
        },
      });
      break;
    case 'setPrivacy':
      form.privacy = false;
      modal.confirm({
        title: t('actions.setPrivacy'),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: h(SPrivacyForm, {
          onChange: v => {
            form.privacy = v;
          },
        }),
        onOk() {
          batchRun({
            dataSet: folderStore.selectedRowKeys,
            action: 'setPrivacy',
            payload: form.privacy,
          });
        },
      });
      break;
    case 'setWeight':
    case 'incWeight':
      form.weight = 0;
      modal.confirm({
        title: t('actions.' + key),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: h(SWeightForm, {
          inc: key === 'incWeight',
          onChange: v => {
            form.weight = v;
          },
        }),
        onOk() {
          batchRun({
            dataSet: folderStore.selectedRowKeys,
            action: key,
            payload: form.weight,
          });
        },
      });
      break;
  }
};
</script>
