import { onMountScope, script } from "snail.core";
import { linkMap } from "snail.view";

export * from "snail.core";
export * from "snail.view";
//  不直接导出 snail.vue.ts ，里面有一些less样式导出冲突会报错，且示例中把这些样式都合并到了一起了
export * from "../../snail.vue/src/exporter";

linkMap.set("/styles/snail.vue.vue.css", "/styles/index.css");

import SortableUrl from "./libraries/sortable.js?url";
import { getCurrentScope, onScopeDispose } from "vue";

script.register(
    { id: "snail.core", exports },
    { id: "snail.view", exports },
    { id: "snail.vue", exports },
    { id: "sortablejs", url: SortableUrl },
    //  @ts-ignore
    { id: "vue", exports: Vue },
)

//  挂载Scope时，若在Vue的setup中，则自动销毁
onMountScope(scope => getCurrentScope() && onScopeDispose(scope.destroy));