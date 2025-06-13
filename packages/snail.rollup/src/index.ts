/**
 * Rollup构建器：
 *  1、封装构建RollupOptions配置
 *      1、支持批量按照组件构建
 *      2、按照项目和项目依赖方式构建
 *      3、通过命令行方式构建
 *  2、标准化组件打包能力，提供插件辅助类和助手类方法；辅助插件开发
 */

/** 把自己的类型共享出去 */
export * from "./models/builder-model"
export * from "./models/component-model"
export * from "./models/module-model"
export * from "./models/project-model"

/** 构建器 */
export { Builder } from "./components/rollup-builder";
/** 资产文件管理器 */
export { AssetManager } from "./components/asset-manager";

//  助手类中部分常量、方法共享
export { FLAG } from "./utils/helper"