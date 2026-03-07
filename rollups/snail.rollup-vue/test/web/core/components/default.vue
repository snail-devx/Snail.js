<template>
    <div>{{ msg }}</div>
    <div>{{ msg }}</div>
</template>
<script lang="ts">
import { reactive, ref } from "vue";
const msg = ref("123112x211xccc3");

export default {
    setup() {
        return {
            msg
        };
    }
};
</script>

<style lang="less">
#body1 {
    background-color: red;
}

head {
    background-image: url("../images/asset.png");
}

@import url("../styles/core.less");
</style>

<style lang="less">
#body2 {
    background-color: red;
}
</style>

<style lang="less" scoped>
#body3 {
    background-color: red;
}

@import url("../styles/core.less");
</style>

<style lang="less">
#body4 {
    background-color: white;
}
</style>

<style lang="less">
#body6 {
    background-color: red;
}
</style>

<style lang="less">
#body5 {
    background-color: red;
}
</style>