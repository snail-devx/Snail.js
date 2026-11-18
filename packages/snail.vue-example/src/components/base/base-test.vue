<!-- 基础测试组件：测试一些Vue基础功能 -->
<template>
    <!-- <div @mouseenter="showTest = !showTest;">测试:{{ new Date().getTime() }}</div> -->
    <div @mouseenter="toast('dddddddddd', { type: 'arrow' })">测试:{{ new Date().getTime() }}</div>
    <div style="position: fixed;top: 100px;left: 200px;width: 200px;height: 200px;background-color: red;"
        v-if="showTest" />

    <button @click="itemsRef.push({ id: newId(), name: String(Date.now()) })">添加数据</button>
    <div style="width: 100%;height: 100%;overflow: auto;">
        <Sort :changer="itemsRef.length" :draggable="'.item'"
            @update="(oldIndex, newIndex) => moveFromArray(itemsRef, oldIndex, newIndex)">
            <div class="item" v-for="(item, index) in itemsRef" style="width: 100%;height: 32px;line-height: 32px;"
                :key="item.id">
                <span v-text="index" />
                <span v-text="item.name" />
            </div>
        </Sort>
    </div>

</template>
<script setup lang="ts">
import { moveFromArray, newId } from "snail.core";
import { onMounted, Ref, ref, shallowRef } from "vue";
import { components, usePrompt } from "../../libraries/snail_vue";

const { toast } = usePrompt();
const showTest = shallowRef(false);
const { Sort } = components;
defineOptions({ name: "BaseTest", inheritAttrs: true, });


const itemsRef: Ref<{ id: string, name: string }[]> = ref([]);
onMounted(() => {
    itemsRef.value.push({ id: "1", name: "1" });
    itemsRef.value.push({ id: "2", name: "2" });
    itemsRef.value.push({ id: "3", name: "3" });
});
</script>