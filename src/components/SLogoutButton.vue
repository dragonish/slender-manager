<template>
  <a-button :disabled="!isActive" type="text" shape="circle" size="small" danger @click="onLogout">
    <logout-outlined></logout-outlined>
  </a-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LogoutOutlined } from '@ant-design/icons-vue';
import { getExpirationTime, isExpired } from '@/common/serializer';

const props = defineProps<{
  id: string;
  active: boolean | null;
  loginTime: string;
  maxAge: number;
}>();

const isActive = computed(() => {
  if (!props.active) {
    return false;
  }
  const time = getExpirationTime(props.loginTime, props.maxAge);
  return !isExpired(time);
});

const emit = defineEmits<{
  logout: [id: string];
}>();

function onLogout() {
  emit('logout', props.id);
}
</script>
