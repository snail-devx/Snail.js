import { RunResult } from "./function-model";
import { IScope } from "./scope-model";

/**
 * 钩子函数管理器
 */
export interface IHookManager<HookCodes> extends IScope {
    /**
     * 注册钩子处理函数
     * @param code 钩子编码
     * @param fn 钩子处理函数；处理函数返回false时，终止钩子处理函数执行
     * @returns 返回scope作用域，支持销毁处理函数
     */
    register(code: HookCodes, fn: HookFunction): IScope;

    /**
     * 执行已注册的钩子
     * - 钩子处理函数无异步逻辑时，使用此方法
     * @param code 钩子编码
     * @param options 执行时的配置选项
     * @param args 运行时传递参数
     * @returns 执行结果，不同情况返回值不一样，注意区分：
     * - 处理函数返回false： { success: false, data: false, reason }
     * - 处理函数发生异常：  { success: false, reason, ex};
     * - 其他情况正常执行：  { success: true };
     */
    runHook(code: HookCodes, options?: HookRunOptions, ...args: any[]): RunResult<false | undefined>;
    /**
     * 执行已注册的钩子
     * - 当钩子处理函数有异步逻辑时，等待结束再返回
     * - 不确定钩子函数是否异步时，推荐使用此方法，内部兼容同步、异步钩子处理函数
     * @param code 钩子编码
     * @param options 执行时的配置选项
     * @param args 运行时传递参数
     * @returns 执行结果，不同情况返回值不一样，注意区分：
     * - 处理函数返回false： { success: false, data: false, reason }
     * - 处理函数发生异常：  { success: false, reason, ex};
     * - 其他情况正常执行：  { success: true };
     */
    runHookAsync(code: HookCodes, options?: HookRunOptions, ...args: any[]): Promise<RunResult<false | undefined>>;

    /**
     * 移除指定的钩子；销毁此钩子的所有处理函数
     * @param code 钩子编码
     */
    remove(code: HookCodes);
}

/**
 * 钩子处理函数
 */
export type HookFunction = (...args: any[]) => HookFunctionReturn;
/**
 * 钩子处理函数返回值
 * - 返回false时，终止后续钩子处理函数执行
 * - 返回Promise<false>时，外部需要使用runAsync运行
 * - 返回其他值时继续后续钩子函数执行
 */
export type HookFunctionReturn = false | undefined | Promise<false | undefined>;

/**
 * 执行钩子处理函数的配置选项
 */
export type HookRunOptions = {
    /**
     * 钩子处理函数的执行模式：
     * - One：单个，运行钩子的一个处理函数，注册多个时，根据order模式选举
     * - All：所有：运行钩子的所有处理函数，执行顺序根据order模式选举
     * - 默认值：All
     */
    mode?: "one" | "all";
    /**
     * 钩子处理函数的执行顺序
     * - Asc：按照注册顺序执行；mode为One模式时，仅取第一个执行
     * - Desc：按照注册顺序反序执行：mode为One模式时，仅取最后一个执行
     * - 默认值：Asc
     */
    order?: "asc" | "desc";
}