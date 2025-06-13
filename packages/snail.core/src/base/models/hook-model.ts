/**
 * 钩子管理器配置选项
 */
export type HookOptions<HookCodes> = {
    /**
     * 钩子函数模式：
     * - Single：一个钩子只能有一个钩子处理函数，注册多个时，根据run模式选举
     * - Multi：一个钩子可以有多个钩子处理函数，执行顺序根据run模式选举
     * - 默认值：Single
     */
    mode?: "Single" | "Multi";
    /**
     * 钩子处理函数运行模式
     * - Asc：按照注册顺序执行；mode为Single模式时，仅取第一个执行
     * - Desc：按照注册顺序反序执行：mode为Single模式时，仅取最后一个执行
     * - 默认值：Asc
     */
    run?: "Asc" | "Desc";
    /**
     * 判断是否继续执行钩子处理函数
     * - 配合@see IHookManager.run 使用
     * @param code 钩子编码
     * @param data 当前钩子处理函数返回值
     * @returns 返回false时停止执行后续钩子处理函数；否则继续执行
     */
    judge?: (code: HookCodes, data?: any) => false | void;
    /**
     * 判断是否继续执行钩子处理函数
     * - 配合@see IHookManager.runAsync 使用
     * @param code 钩子编码
     * @param data 当前钩子处理函数返回值
     * @returns 返回false时停止执行后续钩子处理函数；否则继续执行
     */
    judgeAsync?: (code: HookCodes, data?: any) => void | Promise<false | void>;
}

/**
 * 钩子函数管理器
 */
export interface IHookManager<HookCodes> {
    /**
     * 注册钩子函数
     * @param code 钩子编码
     * @param fn 钩子处理函数
     */
    register<T>(code: HookCodes, fn: (args?: any[]) => T): void;

    /**
     * 执行已注册的钩子函数
     * - 钩子函数无异步逻辑时，使用此方法
     * @param code 钩子编码
     * @param args 运行时传递参数
     * @returns 执行结果
     */
    run<T>(code: HookCodes, ...args: []): T;
    /**
     * 执行已注册的钩子函数
     * - 当钩子函数有异步逻辑时，等待结束再返回
     * - 不确定钩子函数是否异步时，推荐使用此方法，内部兼容同步、异步钩子处理函数
     * @param code 钩子编码
     * @param args 运行时传递参数
     */
    runAsync<T>(code: HookCodes, ...args: []): Promise<T>;

    /**
     * 销毁管理器
     */
    destroy(): void;
}