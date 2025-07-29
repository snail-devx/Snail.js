<!-- 选项菜单【选择项】节点组件
    1、若有子项，则展示箭头；不做任何事件控制 
    2、配合 ./select-popup.vue 使用，无法独立使用
    3、为确保样式能够限定和唯一性，样式信息在【./select-popup.vue】中写入，此处不做约束
 -->
<template>
    <div class="select-item" v-if="props.disabled.value != true" :title="props.item.text"
        :class="{ clickable: props.item.clickable, group: props.item.type == 'group', item: props.item.type != 'group', selected: props.selected.value }">
        <div class="item-text" v-text="props.item.text" />
        <Icon v-if="props.item.type == 'group'" :type="'arrow'" :color="'#8a9099'" />
    </div>
</template>

<script setup lang="ts">
import { SelectNode } from "../models/select-model";
import Icon from "../icon.vue";

// *****************************************   👉  组件定义    *****************************************
//  1、props、data
const props = defineProps<SelectNode<any>>();

//  2、可选配置选项
defineOptions({ name: "SelectNode", inheritAttrs: true, });
</script>