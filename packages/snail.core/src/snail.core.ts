/**
 * 统一对外的输出口
 *      部分对外做一次重命名，如event，server、http等
 *      纯粹助手类的方法、变量直接一级挂载，如isNull、、、
 */

// ******************************      base      ******************************
//  基础数据类型
export * from "./base/models/scope-model"

export * from "./base/data"
export * from "./base/error"
export * from "./base/event"
export * from "./base/function"
export * from "./base/hook"
export * from "./base/promise"
// export * from "./base/queue"
// export * from "./base/storage"

// ******************************      web      ******************************
export * from "./web/http";
export * from "./web/script";
export * from "./web/server";
export * from "./web/style";
export * from "./web/url";
export * from "./web/version";