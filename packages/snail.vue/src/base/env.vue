<!-- 环境组件：
    1、用于在特定环境下渲染内部子组件；如 Desktop 环境下渲染 Mobile 组件
    2、使用 provide 截断覆盖app/父组件提供的 AppEnv 相关配置
    3、子组件使用 useApp 方法，获取到应用环境配置
-->
<template>
    <slot :="$attrs" />
</template>

<script setup lang="ts">
import { provide } from "vue";
import { AppEnv } from "./models/app-model";
import { correctAppEnv, INJECTKEY_AppEnv, useApp } from "./utils/app-util";

// *****************************************   👉  组件定义    *****************************************
defineOptions({ inheritAttrs: false });
const { mode } = defineProps<Required<Pick<AppEnv, "mode">>>();
//  注入配置，除了 mode 属性，其他的继承当前环境的配置
provide(INJECTKEY_AppEnv, correctAppEnv({ ...useApp(), mode }));
</script>