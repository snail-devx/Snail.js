//  类型导出
export * from "./models/control-model";
export * from "./models/field-base";
export * from "./models/field-container";
export * from "./models/form-model";

//  方法、属性导出
export * from "./utils/control-registery";

//  组件导出：赋值给 components
//      控件实现
import Checkbox from "./components/controls/checkbox.vue";
import Combobox from "./components/controls/combobox.vue";
import Datetime from "./components/controls/datetime.vue";
import Group from "./components/controls/group.vue";
import Money from "./components/controls/money.vue";
import Number from "./components/controls/number.vue";
import Percent from "./components/controls/percent.vue";
import Radio from "./components/controls/radio.vue";
import Text from "./components/controls/text.vue";
//      表单相关组件
import FormDesigner from "./components/form-designer.vue";
import FormRenderer from "./components/form-renderer.vue";

export const components = {
    //  表单设计器和渲染器
    FormDesigner, FormRenderer
};
