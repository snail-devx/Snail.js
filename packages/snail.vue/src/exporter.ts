/**
 * 功能导出器：把 snail.vue.ts 中导出组件的部分，抽取出来
 *   1、.vue组件导出
 *   2、通用方法组件导出
 *   3、数据类型导出
 * 配合【snail.vue-example】使用，做进一步示例测试封装
 */

// *****************************************   👉  base 相关导出    ****************************************
//  类型导出
export * from "./base/models/base-model";
export * from "./base/models/button-model";
export * from "./base/models/choose-model";
export * from "./base/models/footer-model";
export * from "./base/models/header-model";
export * from "./base/models/icon-model";
export * from "./base/models/reactive-model";
export * from "./base/models/search-model";
export * from "./base/models/select-model";
export * from "./base/models/switch-model";
export * from "./base/models/tree-base";
//  组件导出
import Button from "./base/button.vue";
import Choose from "./base/choose.vue";
import Footer from "./base/footer.vue";
import Header from "./base/header.vue";
import Icon from "./base/icon.vue";
import Search from "./base/search.vue";
import Select from "./base/select.vue";
import Switch from "./base/switch.vue";
export * from "./base/components/tree-base";
//  方法导出
export * from "./base/reactive";
export * from "./base/utils/app-util";
export * from "./base/utils/icon-util";

// *****************************************   👉  container 相关导出    ****************************************
//  类型导出
export * from "./container/models/component-model";
export * from "./container/models/fold-model";
export * from "./container/models/scroll-model";
export * from "./container/models/sort-model";
export * from "./container/models/table-model";
export * from "./container/models/tree-model";
//  组件导出：赋值给 components
import Dynamic from "./container/dynamic.vue";
import Fold from "./container/fold.vue";
import Scroll from "./container/scroll.vue";
import Sort from "./container/sort.vue";
import Table from "./container/table.vue";
import TableRow from "./container/components/table-row.vue";
import TableCol from "./container/components/table-col.vue";
import Tree from "./container/tree.vue";
//  方法导出
export * from "./container/utils/component-util";

// *****************************************   👉  form 相关导出    ****************************************
//  类型导出
export * from "./form/models/input-model"
//  组件导出：赋值给 components
import Input from "./form/input.vue";
//  方法导出

// *****************************************   👉  popup 相关导出    ****************************************
//  类型在【./popup/manager】中导出了
//  组件导出：赋值给 components
//  方法导出
export * from "./popup/manager";

// *****************************************   👉  prompt 相关导出    ****************************************
//  类型导出
export * from "./prompt/models/drag-verify-model";
export * from "./prompt/models/empty-model";
export * from "./prompt/models/loading-model";
//  组件导出：赋值给 components
import DragVerify from "./prompt/drag-verify.vue";
import Empty from "./prompt/empty.vue";
import Loading from "./prompt/loading.vue";
//  方法导出

// *****************************************   👉  组件合并导出    ****************************************
export const components = {
    //  base下的组件
    Button, Choose, Footer, Header, Icon, Search, Select, Switch,
    //  container 下的组件
    Dynamic, Fold, Scroll, Sort, Table, TableRow, TableCol, Tree,
    //  form 下的组件
    Input,
    //  prompt 下的组件
    DragVerify, Empty, Loading
}