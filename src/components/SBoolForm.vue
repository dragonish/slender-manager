<template>
  <a-form name="bool_form">
    <a-form-item :label :tooltip name="value">
      <a-switch v-model:checked="value" @change="v => emit('change', !!v)"></a-switch>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  label: string;
  tooltip: string;
}>();

const value = ref(false);

const emit = defineEmits<{
  change: [v: boolean];
}>();
</script>
