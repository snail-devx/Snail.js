/**
 * 作用域接口
 * - 约束资源销毁方法
 */
export interface IScope {
    /**
     * 销毁作用域、注册信息等
     */
    destroy(): void;
}