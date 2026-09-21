<!-- 页面组件：兼容App打开、桌面端弹窗、嵌入等模式打开
    1、提供 桌面端、移动端两个插槽，进行分别逻辑实现
    2、desktop 桌面客户端模式下，支持弹窗方式时，支持Header和Footer配置
        1、弹窗模式下使用时，给个默认大小，并支持根据内容区域自适应
        2、支持配置内容区域的滚动模式等
    3、mobile 移动端模式下
        1、支持Footer配置，指定操作按钮，先默认确定和取消，后期看情况在增加
        2、支持内容区域配置滚动模式等
    4、支持 default 插槽，实现各端共享主内容区域渲染，如表单
-->
<template>
    <div class="snail-page" :class="mode">
        <template v-if="pageArea != undefined" :key="mode">
            <!-- 头部渲染：配置了，且没禁用时显示 -->
            <Header class="header-area" v-if="header && header.disabled != true" :="header" @close="emits('close')" />
            <!-- 主内容区域渲染。渲染顺序：端自有插槽 > 默认插槽 > 不支持提示 -->
            <Flex class="main-area" :="main">
                <slot v-if="$slots[mode]" :name="mode" :="slotHandle" />
                <slot v-else-if="$slots.default" :="slotHandle" />
                <Empty v-else :message="`未实现[${mode}]端渲染`" />
            </Flex>
            <!-- 底部区域：配置了，且没禁用时显示-->
            <Flex class="footer-area" :class="{ divider: footer && footer.divider == true }"
                v-if="footer && footer.disabled != true" :cross="'center'"
                :main="footer && footer.align ? footer.align : 'end'" :gap="'20px'">
                <template v-for="item in footer.buttons" :key="item.code">
                    <Button v-if="item.disabled != true" :type="item.type || 'primary'" :size="item.size || 'max'"
                        :title="item.title" v-text="item.title" @click="emits('button', item.code)" />
                </template>
            </Flex>
        </template>
        <Empty v-else :message="`不支持[${mode}]端渲染`" />
    </div>
</template>
<script setup lang="ts">
import { isStringNotEmpty } from 'snail.core';
import Button from '../base/button.vue';
import Header from '../base/header.vue';
import { useApp } from '../base/utils/app-util';
import Empty from '../prompt/empty.vue';
import Flex from './flex.vue';
import { PageEvents, PageOptions, PageSlotHandle } from './models/page-model';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<PageOptions>();
const emits = defineEmits<PageEvents>();
const { mode } = useApp();
//  2、组件交互变量、常量
/**     插槽句柄 */
const slotHandle: PageSlotHandle = Object.freeze<PageSlotHandle>({ mode });
/**     要渲染的页面区域：根据mode动态计算出来，mobile模式下，强制header失效 */
const pageArea = [
    { code: "desktop", ...props.desktop },
    { code: "mobile", ...props.mobile, header: undefined }
].find(item => item.code == mode);
const { header, main = {}, footer } = pageArea || {};

// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//      对main区域的配置做默认值处理
{
    isStringNotEmpty(main.direction) || (main.direction = "column");
    main.class || (main.class = "scroll-y small-scrollbar");
}
//  2、生命周期响应
</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-page {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    >div.main-area {
        position: relative;
        flex: 1;
    }

    >div.footer-area {
        position: relative;
        flex-shrink: 0;
        width: 100%;
        background-color: white;

        &.divider {
            border-top: 1px solid #dddfed;
        }
    }

    // 桌面端
    &.desktop {

        // 弹窗打开时
        &.dialog-body {
            width: 80%;
            max-width: 1000px;
            height: fit-content;
            min-height: 50%;
            max-height: 70%;

            // 弹窗打开时，左右外边距，实现和Header、Footer对齐
            >div.main-area {
                margin: 0 40px;
            }
        }

        //  桌面端 底部区域特定样式
        >.footer-area {
            height: 72px;
            padding: 0 40px;
        }
    }

    // 移动端渲染
    &.mobile {
        width: 100%;
        height: 100%;
        background: #F7F8F9;

        //  移动端 底部区域特定样式
        >.footer-area {
            margin-top: 8px;
            height: 55px;
            padding: 0 12px;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);

            // 按钮 均分宽度
            >div.snail-button {
                flex: 1;
                font-size: 16px;
            }
        }
    }
}
</style>