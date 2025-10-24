<!-- 基础测试组件：测试一些Vue基础功能 -->
<template>
    <!-- <div @mouseenter="showTest = !showTest;">测试:{{ new Date().getTime() }}</div> -->
    <div @mouseenter="toast('arrow', 'dddddddddd')">测试:{{ new Date().getTime() }}</div>
    <div style="position: fixed;top: 100px;left: 200px;width: 200px;height: 200px;background-color: red;"
        v-if="showTest" />
    <div id="testDatePicker" style="width: 100px;height: 40px;background-color: red;"></div>
    <DatePicker style="width: 100px;height: 20px;background-color: yellow;opacity: 1;top: 100px;"
        @picker-blur="console.log('picker-blur')" @picker-focus="console.log('picker-focus')" @change="console.log" />
</template>
<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { components, usePopup } from "../../core";

const { toast } = usePopup();
const showTest = shallowRef(false);
const { DatePicker } = components;
defineOptions({ name: "BaseTest", inheritAttrs: true, });

</script>