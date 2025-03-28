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
    :row-selection="{ fixed: true, selectedRowKeys: searchEngineStore.selectedRowKeys, onChange: onSelectChange }"
    :scroll="{ x: true }"
    @change="onTableChange"
  >
    <template #title>
      <a-space>
        <template #split>
          <a-divider type="vertical"></a-divider>
        </template>
        <a-button type="primary" size="small" @click="onAdd">{{ t('actions.add') }}</a-button>
        <a-dropdown :disabled="searchEngineStore.selectedRowKeys.length === 0">
          <template #overlay>
            <a-menu @click="onBatchEdit">
              <a-menu-item key="delete">{{ t('actions.delete') }}</a-menu-item>
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
      <template v-if="column.key === 'url' || column.key === 'body'">
        <s-searchengine-url :url="record[column.key]"></s-searchengine-url>
      </template>
      <template v-else-if="column.key === 'icon'">
        <a-avatar
          v-if="record[column.key]"
          shape="square"
          size="small"
          style="background-color: #dfdfdf"
          :src="getBuiltInIcon(record[column.key]) || record[column.key]"
        ></a-avatar>
      </template>
      <template v-else-if="column.key === 'action'">
        <a-button type="text" shape="circle" size="small" :title="t('actions.edit')" @click="onEdit(record.id)">
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
  <s-searchengine-modal v-model:open="modalOpen" :id="curId" :edit="editState" @changed="refresh"></s-searchengine-modal>
  <context-holder></context-holder>
</template>

<script setup lang="ts">
import { reactive, ref, h, computed, onBeforeMount } from 'vue';
import { usePagination, useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import type { MenuProps, TableColumnType, TableProps } from 'ant-design-vue';
import { DownOutlined, EditOutlined } from '@ant-design/icons-vue';
import { MessageSchema } from '@/locales/schema';
import { useSearchEngineStore } from '@/stores/searchEngine';
import { getSearchEngineList, batchSearchEngine } from '@/apis/searchEngines';
import { customFilterIcon } from '@/common/ui';
import { getBuiltInIcon } from '@/common/serializer';
import SWeightForm from '@/components/SWeightForm.vue';
import SSearchengineModal from '@/components/SSearchengineModal.vue';
import SFilterDropdown from '@/components/SFilterDropdown.vue';
import SSearchengineUrl from '@/components/SSearchengineUrl.vue';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const searchEngineStore = useSearchEngineStore();

const { data, run, refresh, current, total, pageSize, loading } = usePagination(getSearchEngineList);
const { run: batchRun, loading: batchLoading } = useRequest(batchSearchEngine, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('searchEngines.batchErr'));
    } else {
      message.success(t('searchEngines.batched'));
      searchEngineStore.selectedRowKeys = [];
      refresh();
    }
  },
});

const filterDropdown = ref<InstanceType<typeof SFilterDropdown> | null>();

const form = reactive({
  weight: 0,
});

const [modal, contextHolder] = Modal.useModal();

const columns: TableColumnType<SearchEngineBaseData>[] = [
  {
    key: 'icon',
    dataIndex: 'icon',
    title: t('data.icon.text'),
    align: 'center',
    width: 50,
  },
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
    defaultFilteredValue: searchEngineStore.params.name ? [searchEngineStore.params.name] : undefined,
    filterIcon: customFilterIcon,
  },
  {
    key: 'url',
    dataIndex: 'url',
    title: t('data.url.text'),
    customFilterDropdown: true,
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        window.setTimeout(() => {
          filterDropdown.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: searchEngineStore.params.url ? [searchEngineStore.params.url] : undefined,
    filterIcon: customFilterIcon,
  },
  {
    key: 'method',
    dataIndex: 'method',
    title: t('data.method.text'),
    align: 'center',
    width: 100,
    filters: [
      { text: 'GET', value: 'GET' },
      { text: 'POST', value: 'POST' },
    ],
    filterMultiple: false,
    defaultFilteredValue: searchEngineStore.params.method == null ? undefined : [searchEngineStore.params.method],
  },
  {
    key: 'body',
    dataIndex: 'body',
    title: t('data.body.text'),
  },
  {
    key: 'weight',
    dataIndex: 'weight',
    title: t('data.weight.text'),
    align: 'center',
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: searchEngineStore.params.order === 'weight' ? 'descend' : undefined,
  },
  {
    key: 'modified-time',
    dataIndex: 'modifiedTime',
    title: t('data.modifiedTime.text'),
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: searchEngineStore.params.order === 'modified-time' ? 'descend' : undefined,
  },
  {
    key: 'created-time',
    dataIndex: 'createdTime',
    title: t('data.createdTime.text'),
  },
  {
    key: 'action',
    title: t('actions.action'),
    width: 80,
    align: 'center',
  },
];

const onSelectChange = (selectedRowkeys: Key[]) => {
  searchEngineStore.selectedRowKeys = selectedRowkeys;
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
  run(searchEngineStore.params);
});

const onTableChange: TableProps<SearchEngineBaseData>['onChange'] = (pag, filters, sorter) => {
  searchEngineStore.params.name = filters.name?.toString();
  searchEngineStore.params.url = filters.url?.toString();
  if (filters.method == null) {
    searchEngineStore.params.method = undefined;
  } else {
    searchEngineStore.params.method = filters.method.toString();
  }

  let sortField: SearchEngineOrder = 'created-time';
  if (Array.isArray(sorter)) {
    if (sorter[0].order) {
      sortField = sorter[0].columnKey as SearchEngineOrder;
    }
  } else {
    if (sorter.order) {
      sortField = sorter.columnKey as SearchEngineOrder;
    }
  }
  searchEngineStore.params.order = sortField;

  if (pag.current) {
    searchEngineStore.params.page = pag.current;
  }
  if (pag.pageSize) {
    searchEngineStore.params.size = pag.pageSize;
  }

  run(searchEngineStore.params);
};

function onAdd() {
  editState.value = false;
  curId.value = 0;
  modalOpen.value = true;
}

const onBatchEdit: MenuProps['onClick'] = e => {
  if (searchEngineStore.selectedRowKeys.length === 0) {
    return;
  }

  const key = e.key as SearchEngineBatchAction;
  switch (key) {
    case 'delete':
      modal.confirm({
        title: t('actions.delete'),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: t('searchEngines.deleteConfirm', searchEngineStore.selectedRowKeys.length),
        onOk() {
          batchRun({
            dataSet: searchEngineStore.selectedRowKeys,
            action: 'delete',
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
            dataSet: searchEngineStore.selectedRowKeys,
            action: key,
            payload: form.weight,
          });
        },
      });
  }
};

function onEdit(id: number) {
  editState.value = true;
  curId.value = id;
  modalOpen.value = true;
}
</script>
