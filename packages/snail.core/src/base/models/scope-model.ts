/**
 * 接口：作用域
 * - 约束资源销毁方法
 */
export interface IScope {
    /**
     * 【作用域】是否已经销毁了
     * - 外部只读，不可修改
     */
    destroyed: Readonly<boolean>;

    /**
     * 监听【作用域】销毁
     * - destroy方法执行时触发
     * @param fn 回调方法
     * @returns 【作用域】自身，方便链式调用
     */
    onDestroy(fn: () => void): IScope;

    /**
     * 销毁【作用域】
     */
    destroy(): void;
}

/**
 * 接口：作用域组
 * - 内部管理多个子作用域
 * - 在作用域destroy时，自动销毁子作用域
 */
export interface IScopes extends IScope {
    /**
     * 添加【子作用域】
     * - 当前作用域销毁时，自动执行【子作用域】的destroy方法
     * @param child 【子作用域】对象 
     * @returns 传入的child对象，方便链式调用
     */
    add(child: IScope): IScope;
    /**
     * 移除【子作用域】
     * - 不再由 当前作用域 管理
     * @param child 子作用域对象
     */
    remove(child: IScope): void;
}

/**
 * 接口：异步作用域
 * - 异步任务完成后，自动执行destroy方法销毁作用域
 * - 基于Promise实现异步
 */
export interface IAsyncScope<T> extends Promise<T>, IScope { }

/**
 * 接口：作用域管理器
 */
export interface IScopeManager {
    /**
     * 给指定对象挂载【作用域】
     * - 将IScope的相关属性、方法挂载到target对象上
     * - 这里一个助手类方法，方便基于继承IScope构建新对象，如Http请求、Hook管理等
     * @param target 要挂载【作用域】的实例
     * @returns target，方便链式调用
     */
    mountScope<T>(target: T): T;

    /**
     * 使用新的【作用域】
     * @returns 【作用域】对象
     */
    useScope(): IScope;
    /**
     * 使用新的【作用域组】
     * @returns 【作用域组】对象
     */
    useScopes(): IScopes;
    /**
     * 使用【异步作用域】
     * - 等待task执行完成后，自动销毁作用域
     * @param task 异步任务对象
     * @returns 【异步作用域】对象
     */
    useAsyncScope<T>(task: Promise<T>): IAsyncScope<T>;
}