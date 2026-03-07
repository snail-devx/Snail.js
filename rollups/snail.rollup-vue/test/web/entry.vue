<template>
    <div>
        {{ message }}
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
const message = ref('hello world');
</script>