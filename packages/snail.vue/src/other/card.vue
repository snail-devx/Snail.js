<!-- 卡片组件，显示一条信息的标题、详细信息和操作
    1、头部区域：标题+状态（支持自定义插槽）
    2、信息项区域：每个item包含名称+数据，后续支持数据可点击操作；支持最多显示几个数据项的配置，若超过了则出展开收起、、、 
    3、尾部区域：标题、值、操作；支持完全自定义插槽
-->
<template>
    <div class="snail-card">
        <!-- 标题区域:标题，做默认实现 -->
        <div class="header-area">
            <slot name="header">
                <span class="title" :title="title" v-text="title" />
            </slot>
        </div>
        <!-- 详细信息信息项，每个信息项支持自定义插槽 -->
        <div class="main-area">
            <div class="card-item" v-for="item in details || []" :key="getKey(item)"
                @click="evt => onCardItemClick(item, evt)">
                <slot v-if="item.custom == true" name="detail-item" :item="item">
                    <span>自定义信息项,但无插槽[detail-item]</span>
                </slot>
                <template v-else>
                    <span class="title ellipsis" :title="item.title" v-text="item.title" />
                    <span class="text ellipsis" :title="item.text" v-text="item.text" />
                    <Icon v-if="isFunction(item.click)" :type="'arrow'" />
                </template>

            </div>
        </div>
        <!-- 底部区域 -->
        <div v-if="footer" class="footer-area card-item" @click="evt => onCardItemClick(footer, evt)">
            <slot v-if="footer.custom == true" name="footer" :item="footer">
                <span>自定义footer,但无插槽[footer]</span>
            </slot>
            <template v-else>
                <span class="title ellipsis" :title="footer.title" v-text="footer.title" />
                <span class="text ellipsis" :title="footer.text" v-text="footer.text" />
                <Icon v-if="isFunction(footer.click)" :type="'arrow'" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { isFunction, useKey } from 'snail.core';
import Icon from '../base/icon.vue';
import { CardInfoItem, CardOptions } from './models/card-model';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
defineProps<CardOptions>();
const { getKey } = useKey();

//  2、组件交互变量、常量

// *****************************************   👉  方法+事件    ****************************************
/**
 * 卡片信息项点击事件
 * @param item 
 * @param evt 
 */
function onCardItemClick(item: CardInfoItem, evt: PointerEvent) {
    if (isFunction(item.click) == true) {
        evt.stopPropagation(); // 阻止事件冒泡
        item.click();
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-card {
    padding: 8px 12px;
    overflow-x: hidden;
    background: #FFFFFF;
    border-radius: 8px 8px 8px 8px;
    flex-shrink: 0;

    >div {
        width: 100%;
        overflow-x: hidden;
        flex-shrink: 0;
    }

    // 头部区域
    >.header-area {
        display: flex;
        align-items: center;

        >span.title {
            flex: 1;
            font-weight: bold;
            font-size: 16px;
            color: #2E3033;
        }
    }

    // 详情信息项区域
    >.main-area {
        margin-top: 8px;

        >.card-item {
            min-height: 32px;

            >span.title {
                color: #8A9099;
            }
        }
    }

    // 底部可操作区域
    >.footer-area {
        margin-top: 6px;
        min-height: 40px;
        border-top: 1px solid #D9D9D9;
    }

    // 详情和底部的信息项通用样式 
    .card-item {
        width: 100%;
        overflow-x: hidden;
        display: flex;
        align-items: center;
        gap: 12px;

        >span.title {
            width: 80px;
            flex-shrink: 0;
        }

        >span.text {
            flex: 1;
        }

        >svg {
            justify-self: flex-end;
        }
    }
}
</style>