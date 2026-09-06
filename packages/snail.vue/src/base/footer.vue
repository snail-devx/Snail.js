<!-- 底部组件：默认固定确认、取消按钮；可通过插槽重新定制-->
<template>
    <footer class="snail-footer" :class="{ 'start-divider': divider }" v-bind:class="align || 'right'">
        <slot>
            <Button v-if="cancelDisabled != true" :size="'max'" :type="'default'" @click="emits('cancel')"
                v-text="cancelName || '取消'" />
            <Button v-if="confirmDisabled != true" :size="'max'" :type="'primary'" @click="emits('confirm')"
                v-text="confirmName || '确定'" />
        </slot>
    </footer>
</template>

<script setup lang="ts">
import Button from "./button.vue";
import { FooterOptions, FooterEvents } from "./models/footer-model"

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
defineProps<FooterOptions>();
const emits = defineEmits<FooterEvents>();
//  2、可选配置选项
defineOptions({ name: "Footer", inheritAttrs: true, });
</script>

<style lang="less">
// 引入Mixins样式
@import "snail.view/dist/styles/mixins.less";

.snail-footer {
    width: 100%;
    flex-shrink: 0;
    background-color: white;
    height: 72px;
    padding: 0 40px;
    gap: 20px;
    // flex 布局：display: flex，align-items 为center
    .flex-cross-center();
}

// *****************************************   👉  特殊样式适配    *****************************************
//  1、启用分隔符
.snail-footer.start-divider {
    border-top: 1px solid #dddfed;
}

//  2、左对齐时，按钮给左边距
.snail-footer.left {
    justify-content: flex-start;
}

//  3、居中对齐时，按钮（除第一个外）给左边距
.snail-footer.center {
    justify-content: center;
}

//  4、对齐时，按钮给右边距
.snail-footer.right {
    justify-content: flex-end;
}
</style>