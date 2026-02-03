export * from "snail.core";
import { getType, onMountScope, script } from "snail.core";
//  基础模块注册
import SortableUrl from "./libraries/sortable.js?url";
import calendarUrl from "./libraries/zane-calendar.js?url";
script.register(
    { id: "snail.core", exports },
    { id: "sortablejs", url: SortableUrl },
    { id: "zane-calendar", url: calendarUrl },
    //  @ts-ignore
    { id: "vue", exports: Vue },
)