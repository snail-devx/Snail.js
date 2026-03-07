<template>
    <div>{{ msg }}</div>
    <div>{{ msg }}</div>
</template>
<script lang="ts">
import { reactive, ref } from "vue";
const msg = ref("123112x211xccc3");

export default {
    setup() {
        return {
            msg
        };
    }
};
</script>