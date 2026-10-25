<!-- 搜索组件-->
<template>
    <div v-bind:class="{ readonly: readonly, 'focus': focusRef, 'has-value': isStringNotEmpty(valueRef) }"
        class="snail-search" :class="mode" :title="valueRef">
        <div class="input-area">
            <form action="javascript:void();" @submit.stop="onSubmit()">
                <input type="search" ref="input-dom" :placeholder="placeholder" :readonly="readonly"
                    v-model.trim="valueRef" @focus="focusRef = true" @keyup="onKeyUp($event)" @blur="onInputBlur()" />
            </form>
            <Icon v-if="readonly != true && clearDisabled != true" button :type="'plus'" :rotate="45" :size="16"
                :color="'white'" :background="'#c5c9db'" :radius="'16px'" @click="onClear()" />
        </div>
        <!-- 操作按钮区域 -->
        <div class="operate-area" v-if="readonly != true" @click="mode == 'mobile' ? inputDom.focus() : onSubmit()">
            <Icon class="search-button" custom button :size="22" color="#707070">
                <path
                    d="M 860.16 824.32 l -163.84 -163.84 c 102.4 -120.32 97.28 -302.08 -17.92 -414.72 c -120.32 -120.32 -314.88 -120.32 -435.2 0 c -120.32 120.32 -120.32 314.88 0 435.2 c 112.64 112.64 294.4 120.32 414.72 17.92 l 163.84 163.84 c 10.24 10.24 25.6 10.24 35.84 0 c 12.8 -12.8 12.8 -28.16 2.56 -38.4 Z M 281.6 642.56 C 181.76 542.72 181.76 381.44 281.6 281.6 c 99.84 -99.84 261.12 -99.84 360.96 0 c 99.84 99.84 99.84 261.12 0 360.96 c -99.84 102.4 -261.12 102.4 -360.96 0 Z" />
            </Icon>
            <span v-if="mode == 'mobile'" v-text="placeholder" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { correctString, isStringNotEmpty } from "snail.core";
import { onMounted, shallowRef, ShallowRef, useTemplateRef } from "vue";
import Icon from "../base/icon.vue";
import { useApp } from "../base/utils/app-util";
import { syncValue } from "../base/utils/base-util";
import { SearchEvents, SearchOptions } from "./models/search-model";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data 
defineOptions({ name: "Search", inheritAttrs: true, });
const props = defineProps<SearchOptions>();
const emits = defineEmits<SearchEvents>();
const { mode } = useApp();
/**     input 输入框 */
const inputDom = useTemplateRef("input-dom");
//  2、组件交互变量、常量
/**     搜索文本 */
const valueRef: ShallowRef<string> = shallowRef(correctString(props.value, "", true));
/**     输入框是否聚焦了 */
const focusRef: ShallowRef<boolean> = shallowRef();
/**     上一次搜索提交的文本 */
let preSearchText: string = valueRef.value;

// *****************************************   👉  方法+事件    ****************************************
/**
 * 提交搜索
 */
function onSubmit(keepFocus?: boolean) {
    keepFocus != true && inputDom.value.blur();
    //  避免重复提交
    if (preSearchText !== valueRef.value) {
        preSearchText = valueRef.value;
        emits("search", valueRef.value);
    }
}
/**
 * 点击清除按钮时
 */
function onClear() {
    if (props.readonly != true) {
        valueRef.value = "";
        onSubmit();
    }
}
/**
 * 输入框失去焦点时，延迟设置变量，避免click事件无效
 */
function onInputBlur() {
    focusRef.value == true && setTimeout(() => focusRef.value = false, 200);
}
/**
 * 按键后
 * @param evt 
 */
function onKeyUp(evt: KeyboardEvent) {
    /* autoComplete时：这里需要注意一下，组合按键，或者按下 ctrl等非文本键，都会触发，后续优化 */
    //  enter 回车健，或者自动完成时，触发搜索逻辑：后期做一些验证，将旧值存储起来，没变化时不做触发
    if (props.readonly != true) {
        evt.code == "Enter"
            ? onSubmit()
            : (props.autoComplete && onSubmit(true));
    }
}

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
syncValue<string>(valueRef, () => props.value, value => correctString(value, undefined, true));
//  2、生命周期响应
props.readonly != true && props.autoFocus == true && onMounted(() => inputDom.value.focus());
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-search {
    flex-shrink: 0;
    min-width: 100px;

    &,
    &>div {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    >div.input-area {
        flex: 1;
        height: 34px;

        >form,
        >form>input {
            height: 100%;
            width: 100%;
            border: none !important;
            border-radius: 0 !important;
        }

        // 删除按钮
        >svg {
            position: absolute;
            right: 8px;
            top: 8px;
            display: none;
        }
    }

    // 操作按钮区域
    >div.operate-area {
        height: 34px;
        color: #8a9099;

        >span {
            line-height: 22px;
        }
    }

    // 聚焦，且有值时，显示删除按钮
    &.focus.has-value,
    &.desktop.has-value:hover {
        >div.input-area {
            >input {
                padding-right: 30px;
            }

            >svg {
                display: initial;
            }
        }
    }
}

// 桌面端特有样式
.snail-search.desktop {
    background: white;

    >div.input-area {
        border: 1px solid #DDDFED;
    }

    >div.operate-area {
        width: 34px;
        border: 1px solid #DDDFED;
        border-left: none;
    }

    //  聚焦时，输入框显示蓝色边框
    &.focus>div.input-area {
        border: 1px solid #3292ea;
    }
}

// 移动端特有样式：默认情况下，搜索图标居中，隐藏input的placeholder
.snail-search.mobile {
    padding: 8px 10px;

    >.input-area {
        background: white;
        border-radius: 4px;

        input::placeholder {
            opacity: 0;
        }
    }

    // 搜索图标，居中显示
    >.operate-area {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    // 得到焦点，或者有值时，搜索图标放到左侧，此时显示input的placeholder
    &.focus,
    &.has-value {
        >.input-area {
            padding-left: 20px;

            input::placeholder {
                opacity: 1;
            }
        }

        >.operate-area {
            left: 14px;
            width: 22px;
            transform: translate(0, -50%);

            >span {
                display: none;
            }
        }
    }
}
</style>
