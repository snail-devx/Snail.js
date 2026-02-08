//  类型导出
export * from "./models/control-model";
export * from "./models/field-base";
export * from "./models/field-container";
export * from "./models/form-model";

//  方法、属性导出
export * from "./utils/control-registery";

//  组件导出：赋值给 components
import FormDesigner from "./components/form-designer.vue";
import FormRenderer from "./components/form-renderer.vue";

export const components = {
    //  表单设计器和渲染器
    FormDesigner, FormRenderer
};
