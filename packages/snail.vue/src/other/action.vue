<!-- 可操作项组件：包裹自定义内容，触发配置的操作项
    1、操作项显示激活方式：
        1、鼠标移入显示
        2、长摁显示
        3、后期支持：点击、右键菜单
    2、操作项显示方式
        1、弹窗显示
        2、内联显示：后期支持
    3、支持value模式，默认插槽无值则显示选项文本
 -->
<template>
    <div class="snail-action flex-cross-center" :class="{ button: mode == 'whole' && disabled != true }"
        ref="snail-action" @click="mode == 'whole' && onShowActions(false)">
        <div class="action-slot flex-cross-center">
            <slot name="default" :="slotHandle">
                <span class="ellipsis" v-text="buildDefaultText()" />
            </slot>
        </div>
        <!-- 鼠标引入时显示时：press 模式时不显示 -->
        <div class="trigger-slot" :class="{ 'hover-show': icon != 'always' }"
            v-if="disabled != true && (mode != 'press')">
            <slot name="trigger" :="slotHandle">
                <Icon button :type="'more'" :size="16" @click="mode != 'whole' && onShowActions(false)" />
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IAsyncScope, isArrayNotEmpty } from 'snail.core';
import { useObserver } from 'snail.view';
import { onMounted, shallowRef, ShallowRef, useTemplateRef } from 'vue';
import { isStringNotEmpty } from 'snail.core';
import { ActionEvents, ActionItemsOptions, ActionOptions, ActionSlotHandle } from './models/action-model';
import Icon from '../base/icon.vue';
import { usePopup } from '../popup/manager';
import ActionItems from './components/action-items.vue';
import { usePicker } from '../picker/manager';

// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const props = defineProps<ActionOptions>();
const emits = defineEmits<ActionEvents>();
const { follow } = usePopup();
const { showScroll } = usePicker();
const { onTouch } = useObserver();
//  2、组件交互变量、常量
/**     操作项名称 */
const valueRef: ShallowRef<string> = shallowRef(props.value);
/**     根节点 */
const rootDom = useTemplateRef("snail-action");
/**      弹窗组件*/
const popupScopeRef: ShallowRef<IAsyncScope<string>> = shallowRef(undefined);
/**     操作项句柄 */
const slotHandle: ActionSlotHandle = Object.freeze<ActionSlotHandle>({
    isActived: () => popupScopeRef.value != undefined,
    trigger: () => onShowActions(props.mode == "press"),
});

// *****************************************   👉  方法+事件    ****************************************
/**
 * 构建默认的文本值
 * - 外部无默认插槽时基于操作项构建文本数据
 */
function buildDefaultText() {
    if (isArrayNotEmpty(props.actions) == true) {
        const item = props.actions.find(item => item.code == valueRef.value) || props.actions[0];
        return item.name;
    }
    return undefined;
}
/**
 * 显示操作项时
 * @param longPress 
 */
async function onShowActions(longPress: boolean) {
    //  若已显示了，则直接销毁
    if (popupScopeRef.value && popupScopeRef.value.destroyed != true) {
        popupScopeRef.value.destroy();
        popupScopeRef.value = undefined;
    }
    //  没禁用才生效
    if (props.disabled != true) {
        switch (props.popup) {
            case "picker": {
                popupScopeRef.value = showScroll({
                    value: valueRef.value,
                    items: props.actions,
                    clearDisabled: true,
                });
                break;
            }
            default: {
                const followOptions: ActionOptions["follow"] = props.follow || Object.create(null);
                //  后期针对 longPress 时，计算出跟手的效果，避免割裂；现在followX 策略先： center > start > end
                popupScopeRef.value = follow<string, ActionItemsOptions>(rootDom.value, {
                    component: ActionItems,
                    closeOnEscape: true,
                    closeOnMask: true,
                    closeOnResize: true,
                    closeOnTarget: true,
                    followX: followOptions.followX || ["center", "start", "end", "after", "before", "ratio"],
                    followY: followOptions.followY || ["after", "before", "center", "end", "start", "ratio"],
                    spaceX: followOptions.spaceX,
                    spaceY: followOptions.spaceY,

                    props: {
                        mode: "vertical",
                        actions: props.actions,
                    }
                });
                break;
            }
        }
        const code = await popupScopeRef.value;
        popupScopeRef.value = undefined;
        if (isStringNotEmpty(code) == true) {
            valueRef.value = code;
            emits("trigger", code);
        }
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听

//  2、生命周期响应
onMounted(() => {
    onTouch(rootDom.value, {}, detail => {
        if (props.mode == "press" && detail.status == "end") {
            const time = detail.now.timestamp - detail.start.timestamp;
            if (time > 500) {
                navigator.vibrate && navigator.vibrate(200);
                onShowActions(true);
            }
        }
    });
});

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-action {
    user-select: none;
    overflow: hidden;

    &.button {
        cursor: pointer;
    }

    // 实际内容插槽
    >.action-slot {
        flex: 1;
        overflow: hidden;
        position: relative;
    }

    // 鼠标移入时，操作提示区域
    >.trigger-slot {
        display: flex;
        flex-shrink: 0;
        width: fit-content;
        align-items: center;

        &.hover-show {
            display: none;
        }
    }
}

// 鼠标移入时的效果
.snail-action:hover {
    >.trigger-slot {
        display: flex;
    }
}
</style>