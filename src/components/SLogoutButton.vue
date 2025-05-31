<template>
  <a-button :disabled="!active" type="text" shape="circle" size="small" danger @click="onLogout">
    <logout-outlined></logout-outlined>
  </a-button>
</template>

<script setup lang="ts">
import { LogoutOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  id: string;
  active: boolean | null;
  loginTime: string;
  maxAge: number;
}>();

const emit = defineEmits<{
  logout: [id: string];
}>();

function onLogout() {
  emit('logout', props.id);
}
</script>
