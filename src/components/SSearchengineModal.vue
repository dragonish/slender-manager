<template>
  <a-modal
    v-model:open="open"
    :title="t('searchEngines.modalTitle', { msg: edit ? t('actions.edit') : t('actions.add') })"
    :confirm-loading="fetching"
    @cancel="onCancel"
  >
    <template #footer>
      <a-button key="cancel" @click="onCancel">{{ t('actions.cancel') }}</a-button>
      <a-popconfirm
        v-if="edit"
        placement="topLeft"
        :title="t('searchEngines.deleteConfirm', 1)"
        :ok-text="t('actions.ok')"
        :cancel-text="t('actions.cancel')"
        @confirm="onDelete"
      >
        <a-button key="delete" type="primary" danger :loading="fetching">{{ t('actions.delete') }}</a-button>
      </a-popconfirm>
      <a-button key="ok" type="primary" :loading="fetching" @click="onOK">{{ t('actions.ok') }}</a-button>
    </template>
    <a-form ref="formRef" :model="form" name="search_engine_form_in_modal" :disabled="fetching" :rules>
      <a-form-item :label="t('data.name.text')" :tooltip="t('data.name.tip')" name="name">
        <a-input v-model:value="form.name" ref="nameInput"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.url.text')" :tooltip="t('data.url.tip')" name="url">
        <a-input v-model:value="form.url"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.method.text')" :tooltip="t('data.method.tip')" name="method">
        <a-radio-group v-model:value="form.method">
          <a-radio value="GET">GET</a-radio>
          <a-radio value="POST">POST</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('data.body.text')" :tooltip="t('data.body.tip')" name="body">
        <a-input v-model:value="form.body" :disabled="form.method === 'GET'"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.icon.text')" :tooltip="t('data.icon.tip')">
        <a-space>
          <a-avatar shape="square" style="background-color: #dfdfdf" :src="icon"></a-avatar>
          <a-segmented v-model:value="iconSelected" :options="segmentOptions" @change="onSegmentedChange"></a-segmented>
        </a-space>
        <div style="margin-top: 10px">
          <a-select
            v-if="iconSelected === 'builtIn'"
            v-model:value="iconForm.builtIn"
            show-search
            :options="iconsOptions"
            :filter-option="builtInFilterOption"
            @select="onBuiltInSelect"
          ></a-select>
          <a-input v-else v-model:value="iconForm.input" :placeholder="t('bookmarks.iconInputPlaceholder')" @change="onIconInputChange"></a-input>
        </div>
      </a-form-item>
      <a-form-item :label="t('data.weight.text')" :tooltip="t('data.weight.tip')" name="weight">
        <a-input-number v-model:value="form.weight" :min="-32768" :max="32767" :step="1"></a-input-number>
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
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useRequest } from 'vue-request';
import { useI18n } from 'vue-i18n';
import { MessageSchema } from '@/locales/schema';
import { message } from 'ant-design-vue';
import type { FormInstance, InputProps, SegmentedProps, SelectProps } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { getSearchEngine, addSearchEngine, updateSearchEngine, deleteSearchEngine } from '@/apis/searchEngines';
import { getIcons } from '@/apis/icons';
import { getBuiltInIcon } from '@/common/serializer';
import { builtInFilterOption } from '@/common/ui';

type IconSelectedType = 'builtIn' | 'input';
type SearchEngineForm = Omit<SearchEngineBaseData, 'icon'>;

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, whitespace: true, message: t('validator.required', { msg: t('data.name.text') }), trigger: ['change'] }],
  url: [{ required: true, whitespace: true, message: t('validator.required', { msg: t('data.url.text') }), trigger: ['change'] }],
};

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

const formRef = ref<FormInstance>();

const form = reactive(generateForm());
const icon = ref('');
const iconSelected = ref(segmentOptions[0].value);
const iconForm = reactive<Record<IconSelectedType, string>>({
  builtIn: '',
  input: '',
});

const nameInput = ref<HTMLInputElement>();

const { run: getInfoRun, loading: getLoading } = useRequest(getSearchEngine, {
  onSuccess: data => {
    if (data[1]) {
      const { icon: readIcon, ...other } = data[1];
      Object.assign(form, other);

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
    } else {
      message.error(t('searchEngines.getErr'));
    }
  },
});
const { run: addRun, loading: addLoading } = useRequest(addSearchEngine, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('searchEngines.addErr'));
    } else {
      emit('changed');
      message.success(t('searchEngines.added'));
      open.value = false;
    }
  },
});
const { run: updateRun, loading: updateLoading } = useRequest(updateSearchEngine, {
  onSuccess: data => {
    if (data[0]) {
      message.error('searchEngines.updateErr');
    } else {
      emit('changed');
      message.success(t('searchEngines.updated'));
      open.value = false;
    }
  },
});
const { run: deleteRun, loading: deleteLoading } = useRequest(deleteSearchEngine, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('searchEngines.deleteErr'));
    } else {
      emit('changed');
      message.success(t('searchEngines.deleted'));
      open.value = false;
    }
  },
});
const { data: iconsData, run: getIconsRun, loading: iconsLoading } = useRequest(getIcons);

const fetching = computed(() => {
  return getLoading.value || addLoading.value || updateLoading.value || deleteLoading.value || iconsLoading.value;
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
      Object.assign(form, generateForm());
      iconSelected.value = 'builtIn';
      iconForm.builtIn = '';
      iconForm.input = '';
      icon.value = '';

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

function generateForm(): SearchEngineForm {
  return {
    id: 0,
    name: '',
    url: '',
    method: 'GET',
    body: '',
    weight: 0,
    createdTime: '',
    modifiedTime: '',
  };
}

function onCancel() {
  open.value = false;
}

function onDelete() {
  deleteRun(form.id);
}

async function onOK() {
  try {
    await formRef.value?.validate();
  } catch {
    message.warn(t('validator.incorrect'));
    return;
  }

  const { id, name, url, method, body, weight } = form;
  let iconValue = '';
  switch (iconSelected.value) {
    case 'builtIn':
      iconValue = iconForm.builtIn;
      break;
    case 'input':
      iconValue = iconForm.input.trim();
      break;
  }

  if (props.edit) {
    // edit
    updateRun(id, {
      name: name.trim(),
      url: url.trim(),
      method,
      body: body.trim(),
      weight,
      icon: iconValue,
    });
  } else {
    // add
    addRun({
      name: name.trim(),
      url: url.trim(),
      method,
      body: body.trim(),
      weight,
      icon: iconValue,
    });
  }
}

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
</script>
