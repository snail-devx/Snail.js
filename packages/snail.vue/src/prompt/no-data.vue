<!-- 无数据提醒 组件；支持外部自定义图片，自定义提示插槽 -->
<template>
    <div class="snail-no-data">
        <!-- 无数据提醒图片 -->
        <img :src="props.imageUrl || defaultImageBase64" />
        <!-- 无数据提醒消息 -->
        <slot>
            <div class="hint-message" v-text="props.message || '无数据'" />
        </slot>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onActivated, onDeactivated } from "vue";
import { NoDataOptions } from "./models/no-data-model";
import { getNoDataBase64Image } from "./utils/prompt-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<NoDataOptions>();
/**     默认图片的base64编码值：后期考虑引入图片资源 */
const defaultImageBase64: string = getNoDataBase64Image();
//  2、可选配置选项
defineOptions({ name: "NoData", inheritAttrs: true, });
</script>

<style lang="less">
.snail-no-data {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    >img {
        height: 60px;
        width: 60px;
    }

    >div.hint-message {
        color: #babdc2;
        font-size: 14px;
        font-weight: 400;
        padding: 0 10px 10px 10px;
    }
}
</style>