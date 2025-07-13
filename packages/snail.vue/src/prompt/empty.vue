<!-- 空状态提醒 组件；
 - 用于数据加载时 无数据、搜索无数据时的提醒
 - 支持外部自定义图片，自定义提示插槽 
 -->
<template>
    <div class="snail-empty">
        <!-- 提醒图片 -->
        <img :src="props.imageUrl || defaultImageBase64" />
        <!-- 提醒消息 -->
        <slot>
            <div class="message" v-text="props.message || '无数据'" />
        </slot>
    </div>
</template>

<script setup lang="ts">
import { EmptyOptions } from "./models/empty-model";
import { getNoDataBase64Image } from "./utils/prompt-util";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<EmptyOptions>();
/**     默认图片的base64编码值：后期考虑引入图片资源 */
const defaultImageBase64: string = getNoDataBase64Image();
//  2、可选配置选项
defineOptions({ name: "Empty", inheritAttrs: true, });
</script>

<style lang="less">
.snail-empty {
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

    >div.message {
        color: #babdc2;
        font-size: 14px;
        font-weight: 400;
        padding: 0 10px 10px 10px;
    }
}
</style>