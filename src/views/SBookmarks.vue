<template>
  <a-table
    :data-source="data && data[1]?.list"
    row-key="id"
    size="small"
    bordered
    :locale
    :columns
    :pagination
    :loading="loading || folderLoading || batchLoading || importLoading"
    :row-selection="{ fixed: true, selectedRowKeys: bookmarkStore.selectdRowKeys, onChange: onSelectChange }"
    :scroll="{ x: true }"
    @change="onTableChange"
  >
    <template #title>
      <a-space>
        <template #split>
          <a-divider type="vertical" />
        </template>
        <a-button type="primary" size="small" @click="onAdd">{{ t('actions.add') }}</a-button>
        <a-dropdown :disabled="bookmarkStore.selectdRowKeys.length === 0">
          <template #overlay>
            <a-menu @click="onBatchEdit">
              <a-menu-item key="delete">{{ t('actions.delete') }}</a-menu-item>
              <a-menu-item key="clearVisits">{{ t('bookmarks.clearVisits') }}</a-menu-item>
              <a-menu-item key="setPrivacy">{{ t('actions.setPrivacy') }}</a-menu-item>
              <a-menu-item key="setFolder">{{ t('bookmarks.setFolder') }}</a-menu-item>
              <a-menu-item key="export">{{ t('bookmarks.export') }}</a-menu-item>
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
        <a-button size="small" @click="onImport">{{ t('bookmarks.import') }}</a-button>
      </a-space>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'url'">
        <s-bookmark-url :url="record[column.key]"></s-bookmark-url>
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
      <template v-else-if="column.key === 'privacy'">
        <s-bool-state :state="record[column.key]"></s-bool-state>
      </template>
      <template v-else-if="column.key === 'action'">
        <a-button shape="circle" size="small" :title="t('actions.edit')" @click="onEdit(record.id)">
          <edit-outlined></edit-outlined>
        </a-button>
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
  <s-bookmark-modal v-model:open="modalOpen" :id="curId" :edit="editState" @changed="refresh"></s-bookmark-modal>
  <context-holder></context-holder>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, onBeforeMount } from 'vue';
import { usePagination, useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { Modal, message } from 'ant-design-vue';
import type { MenuProps, TableColumnType, TableProps } from 'ant-design-vue';
import type { ColumnFilterItem, FilterDropdownProps } from 'ant-design-vue/es/table/interface';
import { DownOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { MessageSchema } from '@/locales/schema';
import { useBookmarkStore } from '@/stores/bookmark';
import { batchBookmark, getBookmarkList, importBookmarks } from '@/apis/bookmarks';
import { getBookmarkFolderList } from '@/apis/folders';
import { getBuiltInIcon } from '@/common/serializer';
import { openTextFile, downloadTextFile } from '@/common/file';
import { customFilterIcon } from '@/common/ui';
import SBoolState from '@/components/SBoolState.vue';
import SBookmarkModal from '@/components/SBookmarkModal.vue';
import SPrivacyForm from '@/components/SPrivacyForm.vue';
import SWeightForm from '@/components/SWeightForm.vue';
import SFolderForm from '@/components/SFolderForm.vue';
import SBookmarkUrl from '@/components/SBookmarkUrl.vue';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const bookmarkStore = useBookmarkStore();

const folderFilters = reactive<ColumnFilterItem[]>([
  {
    text: t('bookmarks.ungrouped'),
    value: 0,
  },
]);

const { data, run, refresh, current, total, pageSize, loading } = usePagination(getBookmarkList);
const { run: folderRun, loading: folderLoading } = useRequest(getBookmarkFolderList, {
  onSuccess(data) {
    if (data[1]) {
      folderFilters.push(
        ...data[1].map(item => ({
          text: item.name,
          value: item.id,
        }))
      );
    }
  },
});
const { run: batchRun, loading: batchLoading } = useRequest(batchBookmark, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('bookmarks.batchErr'));
    } else {
      message.success(t('bookmarks.batched'));
      bookmarkStore.selectdRowKeys = [];
      refresh();
    }
  },
});
const { run: importRun, loading: importLoading } = useRequest(importBookmarks, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('bookmarks.importErr'));
    } else {
      message.success(t('bookmarks.imported', data[1] || 0));
      refresh();
    }
  },
});

const searchInput = ref<HTMLInputElement>();

const form = reactive({
  privacy: false,
  weight: 0,
  folder: 0,
});

const [modal, contextHolder] = Modal.useModal();

const columns: TableColumnType<BookmarkListItem>[] = [
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
          searchInput.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: bookmarkStore.params.name ? [bookmarkStore.params.name] : undefined,
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
          searchInput.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: bookmarkStore.params.url ? [bookmarkStore.params.url] : undefined,
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
          searchInput.value?.focus();
        }, 100);
      }
    },
    defaultFilteredValue: bookmarkStore.params.description ? [bookmarkStore.params.description] : undefined,
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
    defaultFilteredValue: bookmarkStore.params.privacy == null ? undefined : [bookmarkStore.params.privacy.toString()],
  },
  {
    key: 'folder-weight',
    dataIndex: 'folderName',
    title: t('data.folder.text'),
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: bookmarkStore.params.order === 'folder-weight' ? 'descend' : undefined,
    filters: folderFilters,
    filterMultiple: false,
    defaultFilteredValue: bookmarkStore.params.folder == undefined ? undefined : [bookmarkStore.params.folder.toString()],
  },
  {
    key: 'weight',
    dataIndex: 'weight',
    title: t('data.weight.text'),
    align: 'center',
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: bookmarkStore.params.order === 'weight' ? 'descend' : undefined,
  },
  {
    key: 'visits',
    dataIndex: 'visits',
    title: t('bookmarks.visits'),
    align: 'center',
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: bookmarkStore.params.order === 'visits' ? 'descend' : undefined,
  },
  {
    key: 'created-time',
    dataIndex: 'createdTime',
    title: t('data.createdTime.text'),
  },
  {
    key: 'modified-time',
    dataIndex: 'modifiedTime',
    title: t('data.modifiedTime.text'),
    sorter: true,
    sortDirections: ['descend'],
    defaultSortOrder: bookmarkStore.params.order === 'modified-time' ? 'descend' : undefined,
  },
  {
    key: 'action',
    title: t('actions.action'),
    width: 80,
    align: 'center',
  },
];

const onSelectChange = (selectedRowKeys: Key[]) => {
  bookmarkStore.selectdRowKeys = selectedRowKeys;
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
  folderRun();
  run(bookmarkStore.params);
});

const onTableChange: TableProps<BookmarkListItem>['onChange'] = (pag, filters, sorter) => {
  bookmarkStore.params.name = filters.name?.toString();
  bookmarkStore.params.description = filters.description?.toString();
  bookmarkStore.params.url = filters.url?.toString();
  if (filters.privacy == null) {
    bookmarkStore.params.privacy = null;
  } else {
    bookmarkStore.params.privacy = !!filters.privacy[0];
  }
  if (filters['folder-weight'] == null) {
    bookmarkStore.params.folder = undefined;
  } else {
    const f = filters['folder-weight'][0];
    if (typeof f === 'number') {
      bookmarkStore.params.folder = f;
    } else {
      bookmarkStore.params.folder = undefined;
    }
  }

  let sortField: BookmarkOrder = 'created-time';
  if (Array.isArray(sorter)) {
    if (sorter[0].order) {
      sortField = sorter[0].columnKey as BookmarkOrder;
    }
  } else {
    if (sorter.order) {
      sortField = sorter.columnKey as BookmarkOrder;
    }
  }
  bookmarkStore.params.order = sortField;

  if (pag.current) {
    bookmarkStore.params.page = pag.current;
  }
  if (pag.pageSize) {
    bookmarkStore.params.size = pag.pageSize;
  }

  run(bookmarkStore.params);
};

function onSearch(confirm: FilterDropdownProps<BookmarkListItem>['confirm']) {
  confirm();
}

function onReset(clearFilters: FilterDropdownProps<FolderListItem>['clearFilters']) {
  if (clearFilters) {
    clearFilters({ confirm: true, closeDropdown: true });
  }
}

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
  if (bookmarkStore.selectdRowKeys.length === 0) {
    return;
  }

  const key = e.key as BookmarkBatchAction | 'export';
  switch (key) {
    case 'delete':
      modal.confirm({
        title: t('actions.delete'),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: t('bookmarks.deleteConfirm', bookmarkStore.selectdRowKeys.length),
        onOk() {
          batchRun({
            dataSet: bookmarkStore.selectdRowKeys,
            action: 'delete',
          });
        },
      });
      break;
    case 'clearVisits':
      modal.confirm({
        title: t('bookmarks.clearVisits'),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: t('bookmarks.visitsClearConfirm'),
        onOk() {
          batchRun({
            dataSet: bookmarkStore.selectdRowKeys,
            action: 'clearVisits',
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
            dataSet: bookmarkStore.selectdRowKeys,
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
            dataSet: bookmarkStore.selectdRowKeys,
            action: key,
            payload: form.weight,
          });
        },
      });
      break;
    case 'setFolder':
      form.folder = 0;
      modal.confirm({
        title: t('bookmarks.setFolder'),
        okText: t('actions.ok'),
        cancelText: t('actions.cancel'),
        content: h(SFolderForm, {
          onSelect: v => {
            form.folder = v;
          },
        }),
        onOk() {
          batchRun({
            dataSet: bookmarkStore.selectdRowKeys,
            action: 'setFolder',
            payload: form.folder,
          });
        },
      });
      break;
    case 'export':
      onExport();
      break;
  }
};

async function onImport() {
  try {
    const res = await openTextFile();
    if (res.data) {
      try {
        const importArr = JSON.parse(res.data);
        if (Array.isArray(importArr)) {
          const importData: BookmarkImportItem[] = [];
          for (const item of importArr) {
            if (item) {
              const { url = '', name = '', description = '', icon = '', privacy = false, weight = 0 } = item as BookmarkImportItem;
              if (url.toString().trim()) {
                importData.push({
                  url: url.toString().trim(),
                  name: name.toString().trim(),
                  description: description.toString().trim(),
                  icon: icon.toString().trim(),
                  privacy: !!privacy,
                  weight: parseInt(weight.toString()) || 0,
                });
              }
            }
          }

          if (importData.length > 0) {
            importRun(importData);
          }
        } else {
          message.error(t('bookmarks.importErr'));
          console.warn('data is not an array.');
        }
      } catch (err) {
        message.error(t('bookmarks.importErr'));
        console.error(err);
      }
    }
  } catch (err) {
    console.warn(err);
  }
}

async function onExport() {
  if (bookmarkStore.selectdRowKeys.length > 0 && data.value) {
    const list: BookmarkListItem[] = data.value[1]?.list || [];
    const exportList: BookmarkImportItem[] = [];
    for (const item of list) {
      const { id, url, name, description, icon, privacy, weight } = item;
      if (bookmarkStore.selectdRowKeys.includes(id)) {
        exportList.push({
          url,
          name,
          description,
          icon,
          privacy,
          weight,
        });
      }
    }

    if (exportList.length > 0) {
      try {
        await downloadTextFile(JSON.stringify(exportList), `slender_bookmarks_${Date.now()}.txt`);
        message.success(t('bookmarks.exported'));
      } catch (err) {
        message.error(t('bookmarks.exportErr'));
        console.error(err);
      }
    } else {
      message.error(t('bookmarks.exportErr'));
    }
  } else {
    message.error(t('bookmarks.exportErr'));
  }
}
</script>
