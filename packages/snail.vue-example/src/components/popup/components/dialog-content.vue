<template>
    <div>{{ title }}</div>
</template>

<script lang="ts" setup>
defineProps({
    title: { type: String }
});
defineOptions({ inheritAttrs: false });
</script>