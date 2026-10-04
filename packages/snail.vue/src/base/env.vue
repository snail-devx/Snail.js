<!-- 环境组件：
    1、用于在特定环境下渲染内部子组件；如 Desktop 环境下渲染 Mobile 组件
    2、使用 provide 截断覆盖app/父组件提供的 AppOptions 相关配置
    3、子组件使用 useApp 方法，获取到应用环境配置
-->
<template>
    <slot :="$attrs" />
</template>

<script setup lang="ts">
import { provide } from "vue";
import { AppOptions } from "./models/app-model";
import { correctAppOptions, INJECTKEY_AppOptions } from "./utils/app-util";

// *****************************************   👉  组件定义    *****************************************
defineOptions({ inheritAttrs: false });
const { mode } = defineProps<AppOptions>();
provide(INJECTKEY_AppOptions, correctAppOptions({ mode }));
</script>