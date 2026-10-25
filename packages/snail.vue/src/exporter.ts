/**
 * 功能导出器：把 snail.vue.ts 中导出组件的部分，抽取出来
 *   1、.vue组件导出
 *   2、通用方法组件导出
 *   3、数据类型导出
 * 配合【snail.vue-example】使用，做进一步示例测试封装
 */

// *****************************************   👉  base 相关导出    ****************************************
//  类型导出
export * from "./base/models/app-model";
export * from "./base/models/base-event";
export * from "./base/models/base-model";
export * from "./base/models/component-model";
export * from "./base/models/icon-model";
export * from "./base/models/motion-model";
export * from "./base/models/reactive-model";
export * from "./base/models/sort-model";
//  组件导出
import Dynamic from "./base/dynamic.vue";
import Env from "./base/env.vue";
import Icon from "./base/icon.vue";
import Motion from "./base/motion.vue";
import Sort from "./base/sort.vue";
//  方法导出
export * from "./base/reactive";
export * from "./base/utils/app-util";
export * from "./base/utils/base-util";
export * from "./base/utils/component-util";
export * from "./base/utils/icon-util";
export * from "./base/utils/motion-util";

// *****************************************   👉  container 相关导出    ****************************************
//  类型导出
export * from "./container/models/elastic-model";
export * from "./container/models/field-model";
export * from "./container/models/flex-model";
export * from "./container/models/fold-model";
export * from "./container/models/layout-model";
export * from "./container/models/page-model";
export * from "./container/models/scroll-model";
export * from "./container/models/table-model";
export * from "./container/models/wrapper-model";
//  组件导出：赋值给 components
import ElasticBar from "./container/components/elastic-bar.vue";
import ElasticPadding from "./container/components/elastic-padding.vue";
import ElasticUpdown from "./container/components/elastic-updown.vue";
import Footer from "./container/components/footer.vue";
import Header from "./container/components/header.vue";
import DataTable from "./container/data-table.vue";
import ElasticTable from "./container/elastic-table.vue";
import Elastic from "./container/elastic.vue";
import Field from "./container/field.vue";
import Flex from "./container/flex.vue";
import Fold from "./container/fold.vue";
import Layout from "./container/layout.vue";
import Page from "./container/page.vue";
import Scroll from "./container/scroll.vue";
import Table from "./container/table.vue";
import Wrapper from "./container/wrapper.vue";
//  方法导出


// *****************************************   👉  control 相关导出    ****************************************
//  类型导出
export * from "./control/models/button-model";
export * from "./control/models/choose-model";
export * from "./control/models/input-model";
export * from "./control/models/number-model";
export * from "./control/models/search-model";
export * from "./control/models/select-model";
export * from "./control/models/switch-model";
export * from "./control/models/textarea-model";
export * from "./control/models/tree-base";
export * from "./control/models/tree-model";
//  组件导出：赋值给 components
import Button from "./control/button.vue";
import Choose from "./control/choose.vue";
import Input from "./control/input.vue";
import Number from "./control/number.vue";
import Search from "./control/search.vue";
import Select from "./control/select.vue";
import Switch from "./control/switch.vue";
import Textarea from "./control/textarea.vue";
import Tree from "./control/tree.vue";
//  方法导出
export * from "./control/components/tree-base";


// *****************************************   👉  other 相关导出    ****************************************
//  类型导出
export * from "./other/models/action-model";
export * from "./other/models/card-model";
export * from "./other/models/nav-bar-model";
//  组件导出：赋值给 components
import Action from "./other/action.vue";
import Card from "./other/card.vue";
import FlashNumber from "./other/flash-number.vue";
import NavBar from "./other/nav-bar.vue";

// *****************************************   👉  picker 相关导出    ****************************************
//  类型导出
export * from "./picker/models/datetime-model";
export * from "./picker/models/picker-model";
export * from "./picker/models/scroll-piker-model";
//  组件导出
import DateTimePicker from "./picker/datetime-picker.vue";
import ScrollPicker from "./picker/scroll-picker.vue";

//  方法导出
export * from "./picker/manager";

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
export * from "./prompt/models/progress-model";
//  组件导出：赋值给 components
import DragVerify from "./prompt/drag-verify.vue";
import Empty from "./prompt/empty.vue";
import Loading from "./prompt/loading.vue";
import Progress from "./prompt/progress.vue";
import Spinner from "./prompt/spinner.vue";
//  方法导出

// *****************************************   👉  组件合并导出    ****************************************
export const components = {
    //  base下的组件
    Dynamic, Env, Icon, Motion, Sort,
    //  container 下的组件
    Flex, Field, Fold, Layout, Page, Scroll, Wrapper,
    Elastic, ElasticTable, Table, DataTable,
    //      components下的辅助组件
    ElasticBar, ElasticPadding, ElasticUpdown, Footer, Header,
    //  control 下的组件
    Button, Choose, Input, Number, Search, Select, Switch, Textarea, Tree,
    //  other   下的组件
    Action, Card, FlashNumber, NavBar,
    //  picker    下的组件
    DateTimePicker, ScrollPicker,
    //  prompt 下的组件
    DragVerify, Empty, Loading, Progress, Spinner
};