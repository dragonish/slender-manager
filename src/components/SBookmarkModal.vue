<template>
  <a-modal
    v-model:open="open"
    :title="t('bookmarks.modalTitle', { msg: edit ? t('actions.edit') : t('actions.add') })"
    :confirm-loading="fetching"
    @cancel="onCancel"
  >
    <template #footer>
      <a-button key="cancel" @click="onCancel">{{ t('actions.cancel') }}</a-button>
      <a-popconfirm
        v-if="edit"
        placement="topLeft"
        :title="t('bookmarks.deleteConfirm', 1)"
        :ok-text="t('actions.ok')"
        :cancel-text="t('actions.cancel')"
        @confirm="onDelete"
      >
        <a-button key="delete" type="primary" danger :loading="fetching">{{ t('actions.delete') }}</a-button>
      </a-popconfirm>
      <a-button key="ok" type="primary" :loading="fetching" @click="onOK">{{ t('actions.ok') }}</a-button>
    </template>
    <a-form ref="formRef" :model="form" name="bookmark_form_in_modal" :disabled="fetching" :rules>
      <a-form-item :label="t('data.name.text')" :tooltip="t('data.name.tip')" name="name">
        <a-input v-model:value="form.name" ref="nameInput"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.url.text')" :tooltip="t('data.url.tip')" name="url">
        <template #extra>
          <template v-for="item in urlKeys" :key="item">
            <a-tag class="slender-bookmark-extra-tag" :title="getLocation(item)" @click="onTagClick(item)">{{ item }}</a-tag>
          </template>
        </template>
        <a-input v-model:value="form.url"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.description.text')" :tooltip="t('data.description.tip')" name="description">
        <a-input v-model:value="form.description"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.icon.text')" :tooltip="t('data.icon.tip')">
        <a-space>
          <a-avatar shape="square" style="background-color: #dfdfdf" :src="icon"></a-avatar>
          <a-segmented v-model:value="iconSelected" :options="segmentOptions" @change="onSegmentedChange">
            <template #label="{ title }">
              {{ title }}
            </template>
          </a-segmented>
        </a-space>
        <div style="margin-top: 10px">
          <a-select
            v-if="iconSelected === 'builtIn'"
            v-model:value="iconForm.builtIn"
            show-search
            :options="iconsOptions"
            :filter-option="builtInFilterOption"
            @select="onBuiltInSelect"
          >
            <template #option="{ value, label }">
              <a-avatar v-if="value" shape="square" :size="18" style="background-color: #dfdfdf" :src="getBuiltInIcon(value)"></a-avatar>
              <span style="margin-left: 5px">{{ label }}</span>
            </template>
          </a-select>
          <div v-else-if="iconSelected === 'input'">
            <a-input
              v-model:value="iconForm.input"
              :placeholder="t('bookmarks.iconInputPlaceholder')"
              style="margin-bottom: 10px"
              @change="onIconInputChange"
            ></a-input>
            <a-upload
              v-model:file-list="fileList"
              action="/api/v1/files"
              accept=".jpg,.jpeg,.ico,.png,.bmp,.gif,.tif,.tiff,.webp,.svg"
              list-type="picture"
              :before-upload="beforeUpload"
              @change="onUploadChange"
              @remove="onFileRemove"
              @preview="onFilePreview"
            >
              <a-button>
                <upload-outlined></upload-outlined>
                {{ t('files.upload') }}
              </a-button>
            </a-upload>
          </div>
        </div>
      </a-form-item>
      <a-form-item :label="t('data.privacy.text')" :tooltip="t('data.privacy.tip')" name="privacy">
        <a-switch v-model:checked="form.privacy"></a-switch>
      </a-form-item>
      <a-form-item :label="t('data.folder.text')" :tooltip="t('data.folder.tip')" name="folderId">
        <a-select v-model:value="form.folderId" show-search :options="folderOptions" :filter-option="folderFilterOption"></a-select>
      </a-form-item>
      <a-form-item :label="t('data.weight.text')" :tooltip="t('data.weight.tip')" name="weight">
        <a-input-number v-model:value="form.weight" :min="-32768" :max="32767" :step="1"></a-input-number>
      </a-form-item>
      <a-form-item v-if="edit" :label="t('data.visits.text')" :tooltip="t('data.visits.tip')" name="visits">
        <a-space>
          <span>{{ form.visits }}</span>
          <a-popconfirm
            placement="topLeft"
            :disabled="form.visits === 0"
            :title="t('bookmarks.visitsClearConfirm')"
            :ok-text="t('actions.ok')"
            :cancel-text="t('actions.cancel')"
            @confirm="onClearVisits"
          >
            <a-button
              key="clearVisits"
              type="primary"
              shape="circle"
              danger
              size="small"
              :disabled="form.visits === 0"
              :title="t('actions.clear')"
              :icon="h(ClearOutlined)"
            ></a-button>
          </a-popconfirm>
        </a-space>
      </a-form-item>
      <a-form-item v-if="edit" :label="t('data.createdTime.text')" :tooltip="t('data.createdTime.tip')" name="createdTime">
        <span>{{ form.createdTime }}</span>
      </a-form-item>
      <a-form-item v-if="edit" :label="t('data.modifiedTime.text')" :tooltip="t('data.modifiedTime.tip')" name="modifiedTime">
        <span>{{ form.modifiedTime }}</span>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h, watch, nextTick } from 'vue';
import { useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';
import { message } from 'ant-design-vue';
import type { FormInstance, InputProps, SegmentedProps, SelectProps, UploadChangeParam, UploadFile } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { ClearOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { addBookmark, deleteBookmark, getBookmark, updateBookmark } from '@/apis/bookmarks';
import { getBookmarkFolderList } from '@/apis/folders';
import { deleteFile } from '@/apis/files';
import { getIcons } from '@/apis/icons';
import { getBuiltInIcon } from '@/common/serializer';
import { urlKeys, getLocation } from '@/common/url';
import { builtInFilterOption } from '@/common/ui';

type IconSelectedType = 'builtIn' | 'input';
type BookmarkForm = Omit<BookmarkResData, 'icon' | 'files'>;

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const rules: Record<string, Rule[]> = {
  url: [{ required: true, whitespace: true, message: t('validator.required', { msg: t('data.url.text') }), trigger: ['change'] }],
};

const open = defineModel<boolean>('open', {
  required: true,
});

const props = defineProps<{
  id: number;
  edit?: boolean;
}>();

const emit = defineEmits<{
  changed: [];
}>();

const segmentOptions = [
  {
    value: 'builtIn',
    title: t('bookmarks.builtInIcon'),
  },
  {
    value: 'input',
    title: t('bookmarks.inputIcon'),
  },
];

const formRef = ref<FormInstance>();

const form = reactive<BookmarkForm>(generateForm());
const icon = ref('');
const iconSelected = ref(segmentOptions[0].value);
const iconForm = reactive<Record<IconSelectedType, string>>({
  builtIn: '',
  input: '',
});
const fileList = ref<UploadFile<{ data: FileBaseData }>[]>([]);

const clearVisitsState = ref(false);

const nameInput = ref<HTMLInputElement>();

const { run: getInfoRun, loading: getLoading } = useRequest(getBookmark, {
  onSuccess: data => {
    if (data[1]) {
      const { icon: readIcon, files, ...other } = data[1];
      Object.assign<BookmarkForm, BookmarkForm>(form, other);

      if (readIcon) {
        const builtInIcon = getBuiltInIcon(readIcon);
        if (builtInIcon) {
          iconSelected.value = 'builtIn';
          iconForm.builtIn = readIcon;
          icon.value = builtInIcon;
        } else {
          iconSelected.value = 'input';
          iconForm.input = readIcon;
          icon.value = readIcon;
        }
      }

      files.forEach(file => {
        fileList.value.push({
          name: file.path,
          uid: file.id.toString(),
          thumbUrl: file.path,
          response: {
            data: file,
          },
        });
      });
    } else {
      message.error(t('bookmarks.getErr'));
    }
  },
});
const { run: addRun, loading: addLoading } = useRequest(addBookmark, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('bookmarks.addErr'));
    } else {
      emit('changed');
      message.success(t('bookmarks.added'));
      open.value = false;
    }
  },
});
const { run: updateRun, loading: updateLoading } = useRequest(updateBookmark, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('bookmarks.updateErr'));
    } else {
      emit('changed');
      message.success(t('bookmarks.updated'));
      open.value = false;
    }
  },
});
const { run: deleteRun, loading: deleteLoading } = useRequest(deleteBookmark, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('bookmarks.deleteErr'));
    } else {
      emit('changed');
      message.success(t('bookmarks.deleted'));
      open.value = false;
    }
  },
});
const { data: folderData, run: getFolderRun, loading: folderLoading } = useRequest(getBookmarkFolderList);
const { data: iconsData, run: getIconsRun, loading: iconsLoading } = useRequest(getIcons);
const { runAsync: deleteFileRun, loading: deleteFileLoading } = useRequest(deleteFile);

const fetching = computed(() => {
  return (
    getLoading.value || addLoading.value || updateLoading.value || deleteLoading.value || folderLoading.value || iconsLoading.value || deleteFileLoading.value
  );
});

const folderOptions = computed<SelectProps['options']>(() => {
  const res: SelectProps['options'] = [
    {
      value: 0,
      label: t('bookmarks.noFolder'),
    },
  ];

  if (folderData.value) {
    folderData.value[1]?.forEach(item => {
      res.push({
        value: item.id,
        label: (item.privacy ? '*' : '') + item.name,
      });
    });
  }

  return res;
});

const iconsOptions = computed<SelectProps['options']>(() => {
  const res: SelectProps['options'] = [
    {
      value: '',
      label: t('bookmarks.noIcon'),
    },
  ];

  if (iconsData.value) {
    iconsData.value[1]?.forEach(item => {
      res.push({
        value: item,
        label: item,
      });
    });
  }

  return res;
});

watch(
  () => open.value,
  newVal => {
    if (newVal) {
      formRef.value?.resetFields();
      Object.assign<BookmarkForm, BookmarkForm>(form, generateForm());
      icon.value = '';
      iconSelected.value = 'builtIn';
      iconForm.builtIn = '';
      iconForm.input = '';
      fileList.value = [];
      clearVisitsState.value = false;

      getFolderRun();
      getIconsRun();

      if (props.edit) {
        // read data
        getInfoRun(props.id);
      }

      nextTick(() => {
        nameInput.value?.focus();
      });
    }
  }
);

const onSegmentedChange: SegmentedProps['onChange'] = value => {
  switch (value as IconSelectedType) {
    case 'builtIn':
      icon.value = getBuiltInIcon(iconForm.builtIn);
      break;
    case 'input':
      icon.value = iconForm.input;
      break;
  }
};

const onBuiltInSelect: SelectProps['onSelect'] = (value: unknown) => {
  if (value) {
    icon.value = getBuiltInIcon(<string>value);
  } else {
    icon.value = '';
  }
};

const onIconInputChange: InputProps['onChange'] = evt => {
  icon.value = evt.target.value || '';
};

const folderFilterOption: SelectProps['filterOption'] = (inputValue, option) => {
  if (option?.value) {
    return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  }
  return false;
};

function generateForm(): BookmarkForm {
  return {
    id: 0,
    name: '',
    url: '',
    description: '',
    privacy: false,
    weight: 0,
    createdTime: '',
    modifiedTime: '',
    visits: 0,
    folderId: 0,
  };
}

function onDelete() {
  deleteRun(form.id);
}

function onClearVisits() {
  form.visits = 0;
  clearVisitsState.value = true;
}

async function onOK() {
  try {
    await formRef.value?.validate();
  } catch {
    message.warn(t('validator.incorrect'));
    return;
  }

  const { id, name, description, url, privacy, weight, folderId } = form;
  let iconValue = '';
  switch (iconSelected.value) {
    case 'builtIn':
      iconValue = iconForm.builtIn;
      break;
    case 'input':
      iconValue = iconForm.input.trim();
      break;
  }

  const files = fileList.value.map(item => item.response?.data.id).filter(v => v != undefined);
  if (props.edit) {
    // edit
    updateRun(id, {
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      icon: iconValue,
      privacy,
      weight,
      visits: clearVisitsState.value ? 0 : undefined,
      folderId,
      files,
    });
  } else {
    // add
    addRun({
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      icon: iconValue,
      privacy,
      weight,
      folderId,
      files,
    });
  }
}

function onCancel() {
  open.value = false;
}

function beforeUpload(file: UploadFile) {
  if (file.size) {
    const isLt1MB = file.size / 1024 / 1024 <= 1;
    if (!isLt1MB) {
      message.warn(t('files.limitWarn'));
      file.status = 'error';
      file.response = undefined;
    }
    return isLt1MB;
  } else {
    message.error(t('files.readSizeErr'));
    file.status = 'error';
    file.response = undefined;
    return false;
  }
}

function onUploadChange(info: UploadChangeParam<UploadFile<{ data: FileBaseData }>>) {
  if (info.file.status === 'done' && info.file.response) {
    message.success(t('files.uploaded', { msg: info.file.name }));
    info.file.name = info.file.response.data.path;
    iconForm.input = info.file.response.data.path;
  } else if (info.file.status === 'error') {
    message.error(t('files.uploadErr', { msg: info.file.name }));
  }
}

async function onFileRemove(file: UploadFile<{ data: FileBaseData }>) {
  if (file.response && file.response.data) {
    const path = file.response.data.path;
    const res = await deleteFileRun(file.response.data.id);
    if (res[0]) {
      message.error(t('files.deleteErr', { msg: file.response.data.path }));
      return false;
    } else {
      message.success(t('files.deleted', { msg: file.response.data.path }));
      if (iconForm.input === path) {
        iconForm.input = '';
      }
      return true;
    }
  }

  return true;
}

function onFilePreview(file: UploadFile<{ data: FileBaseData }>) {
  if (file.response && file.response.data.path) {
    iconForm.input = file.response.data.path;
    icon.value = iconForm.input;
  }
}

function onTagClick(key: keyof Location) {
  form.url += `{${key}}`;
  if (form.url) {
    formRef.value?.validate();
  }
}
</script>

<style>
.ant-tag.slender-bookmark-extra-tag {
  cursor: pointer;
  padding-inline: 6px;
}
</style>
