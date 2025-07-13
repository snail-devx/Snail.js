import { Component, createApp } from "vue";
import Toast from "../components/toast.vue";
import { IconType } from "../../base/models/icon-model";
import { DialogOpenResult } from "../../container/models/dialog-model";
import { defer } from "snail.core";
import Confirm from "../components/confirm.vue";
import { openDialog } from "../../container/utils/dialog-util";

//#region *****************************************   👉  内部使用的常量，使用到时才返回，不直接定义为常亮    ****************************************
/**
 * 获取双箭头图片绘制路径
 * - drag-verify 组件使用
 * @returns 
 */
export function getTwoArrowIconDraw(): string {
    return "M759.467 533.333L469.333 243.2l29.867-29.867 320 320-320 320-29.867-29.866 290.134-290.134z m-298.667 0L170.667 243.2l29.866-29.867 320 320-320 320-29.866-29.866L460.8 533.333z";
}
/**
 * 获取暂无数据图标
 */
export function getNoDataBase64Image(): string {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyREREODhFQ0M5M0UxMUU5ODlFREVENzc4Njk0RjQ2MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyREREODhFREM5M0UxMUU5ODlFREVENzc4Njk0RjQ2MiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjJEREQ4OEVBQzkzRTExRTk4OUVERUQ3Nzg2OTRGNDYyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJEREQ4OEVCQzkzRTExRTk4OUVERUQ3Nzg2OTRGNDYyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8++keGxAAAA5lJREFUeNrsmktoE0EYx3eSTdpsk2abvnwcFBVp8QFqVPDgQaGgIogIoictelKKVhARBA8q+KAVrFqooh4qXgRfiHpTEHqw9iCKXqQHSVstpqlt0yabrP9p52K1yW72GTMf/JhZMrM7/3l+37REVVWhlMwjlJhxwVwwF8wFc8FcMBfsnIlGKg98TxRa9RbYAFYXUnl+XbjoRpiKXVXMU9qns3xK76CC/YC4QfA1MAg26aiTZGlQQ9la8AZ0g3VuENwLqsArsFVnXW+e30PgKVgGnoA+Nwi+Cw6DAHgGdmqoMwJoXJrJUcYPHoGN4C3Yl6e8rWv4Nmhma/kh2J6n/HW2JsdylLkKtoAPYAeYcPxYmmX32AjcAVHwPEfZFxreR2fAJ9Z5CbMaSYzceMxxDtN198vKo8Vt57ClYh0d4f/OtTTgOjpquaa8WEhldISM5DRYWYCXZdTS4DVoR9tSegdI9y6Nl1KBL5k/7JRto99HW/ZAtGralJ7DTtCPEUKUmqqKPlH0rtXgMZk2utms2jk0PEqPqt3gEOiybJdGjy5BcobmI7LUC7HrbRQ7HaR4PORoOBRoY+f0RbSp3spjqQNIPtEb8/vEqFMnixTwH0T6gPnwbZYIRk/uZWtHqApLQzaP7GyL1kSCPUinqIuKtjWZKhgvpFt1O82X+cXPXq9njdNHD2ZZC/aRTvZ4A20sN3OEz7IgXJDDkls8laV11aEBpHGaB62mCEbPNSA5QvNYO+88hDS6xcHABtbq9XiusMdTYJ4ZI3yBORdKZTBQ6zKnqq62OiQh7WdByzmjgqlzsWs6BAqW9xAiLHJdMECEY36f9zJ7pLt3oxHH4/j0O4kwWREoW8BuKvSYxG4utFoWjOoVHZErlg/+GP2I7ApwkgnXHy1h/VLntNJA76sROfgFI9CgoXh8OD72OJ3OHDA46Am4m3KhU7rSyJfRl2QiOaXVE3oPsU0mzPKw3RcAf5iiZEPaOkf9KsxcyVq7s1vu7SsZEQ5/LO81ydhk3I5Q05Y/tcQTExKLY/+9U2XV++PJVLMtZ7cdH0mlFfnnyPgIpm3s758y3Qj3NiNfY8sxlmeXNt2NhC/ej0grllXVdHIyVY/RbTD7G9iliZkXAIZsKqUspjjmjgolZlwwF1xigr8VoaYBI4I7ilBwl5Hw8JIwcx3aAha6XCj9t4ub4HzBjgfftLhgLpgL5oK5YC6YC+aCuWDt9luAAQC2EPxjL8cUkwAAAABJRU5ErkJggg==";
}

//#endregion

/**
 * 将一个组件挂载的body下的div上
 * - 全新构建Vue App实例
 * @param component 
 * @param props 
 * @returns 
 */
function mountInBodyDiv<T>(component: Component, props: any): DialogOpenResult<T> {
    const deferred = defer<T>();
    //  创建div，构建Vue实例对象
    const container = document.createElement("div");
    container.classList.add("snail-mount-app");
    document.body.appendChild(container);
    const app = createApp(component, {
        ...(props || {}),
        close: (data: T) => {
            destroy();
            deferred.resolve(data);
        }
    });
    const destroy = function () {
        app.unmount();
        document.body.removeChild(container);
    }
    //  挂载并返回组件挂载结果对象
    app.mount(container);
    const dr = deferred.promise as DialogOpenResult<T>;
    dr.destroy = destroy;
    return dr;
}

/**
 * toast提示
 * @param type 提示类型：成功、失败、、、
 * @param message 提示消息
 */
export function toast(type: IconType, message: string) {
    mountInBodyDiv(Toast, { type, message });

    // const container = document.createElement("div");
    // container.classList.add("snail-toast-container");
    // document.body.appendChild(container);
    // const app = createApp(Toast, {
    //     type,
    //     message,
    //     close: () => {
    //         app.unmount();
    //         document.body.removeChild(container);
    //     }
    // });
    // app.mount(container);
}

/**
 * 打开【确认】弹窗
 * @param title 弹窗标题
 * @param message 确认提示信息，支持html片段
 * @returns 弹窗句柄
 */
export function confirm(title: string, message: string): DialogOpenResult<boolean> {
    //  后续支持 确认、取消按钮等配置
    return openDialog({
        component: Confirm,
        closeOnEscape: true,
        props: { title, message }
    });
}