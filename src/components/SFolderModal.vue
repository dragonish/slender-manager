<template>
  <a-modal v-model:open="open" :title="t('folders.modalTitle', { msg: edit ? t('actions.edit') : t('actions.add') })" :confirm-loading="fetching">
    <template #footer>
      <a-button key="cancel" @click="open = false">{{ t('actions.cancel') }}</a-button>
      <a-popconfirm
        v-if="edit"
        placement="topLeft"
        :title="t('folders.deleteConfirm', 1)"
        :ok-text="t('actions.ok')"
        :cancel-text="t('actions.cancel')"
        @confirm="onDelete"
      >
        <a-button key="delete" type="primary" danger :loading="fetching">{{ t('actions.delete') }}</a-button>
      </a-popconfirm>
      <a-button key="ok" type="primary" :loading="fetching" @click="onOK">{{ t('actions.ok') }}</a-button>
    </template>
    <a-form ref="formRef" :model="form" name="folder_form_in_modal" :disabled="fetching" :rules>
      <a-form-item :label="t('data.name.text')" :tooltip="t('data.name.tip')" name="name">
        <a-input v-model:value="form.name" ref="nameInput"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.description.text')" :tooltip="t('data.description.tip')" name="description">
        <a-input v-model:value="form.description"></a-input>
      </a-form-item>
      <a-form-item :label="t('data.large.text')" :tooltip="t('data.large.tip')" name="large">
        <a-switch v-model:checked="form.large"></a-switch>
      </a-form-item>
      <a-form-item :label="t('data.privacy.text')" :tooltip="t('data.privacy.tip')" name="privacy">
        <a-switch v-model:checked="form.privacy"></a-switch>
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
import { message, type FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { addFolder, deleteFolder, getFolder, updateFolder } from '@/apis/folders';

const { t } = useI18n<{
  message: MessageSchema;
}>({
  useScope: 'global',
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, whitespace: true, message: t('validator.required', { msg: t('data.name.text') }), trigger: ['change'] }],
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

const formRef = ref<FormInstance>();

const form = reactive<FolderBaseData>(generateForm());

const nameInput = ref<HTMLInputElement>();

const { run: getRun, loading: getLoading } = useRequest(getFolder, {
  onSuccess: data => {
    if (data[1]) {
      Object.assign<FolderBaseData, FolderBaseData>(form, data[1]);
    } else {
      message.error(t('folders.getErr'));
    }
  },
});
const { run: addRun, loading: addLoading } = useRequest(addFolder, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('folders.addErr'));
    } else {
      emit('changed');
      message.success(t('folders.added'));
      open.value = false;
    }
  },
});
const { run: updateRun, loading: updateLoading } = useRequest(updateFolder, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('folders.updateErr'));
    } else {
      emit('changed');
      message.success(t('folders.updated'));
      open.value = false;
    }
  },
});
const { run: deleteRun, loading: deleteLoading } = useRequest(deleteFolder, {
  onSuccess: data => {
    if (data[0]) {
      message.error(t('folders.deleteErr'));
    } else {
      emit('changed');
      message.success(t('folders.deleted'));
      open.value = false;
    }
  },
});

const fetching = computed(() => {
  return getLoading.value || addLoading.value || updateLoading.value || deleteLoading.value;
});

watch(
  () => open.value,
  newVal => {
    if (newVal) {
      formRef.value?.resetFields();
      Object.assign<FolderBaseData, FolderBaseData>(form, generateForm());

      if (props.id > 0) {
        // read data
        getRun(props.id);
      }

      nextTick(() => {
        nameInput.value?.focus();
      });
    }
  }
);

function generateForm(): FolderBaseData {
  return {
    id: 0,
    name: '',
    description: '',
    large: false,
    privacy: false,
    weight: 0,
    createdTime: '',
    modifiedTime: '',
  };
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

  const { id, name, description, privacy, large, weight } = form;
  if (props.edit) {
    // edit
    updateRun(id, {
      name: name.trim(),
      description: description.trim(),
      privacy,
      large,
      weight,
    });
  } else {
    // add
    addRun({
      name: name.trim(),
      description: description.trim(),
      privacy,
      large,
      weight,
    });
  }
}
</script>
