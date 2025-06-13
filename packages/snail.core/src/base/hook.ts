import { HookOptions, IHookManager } from "./models/hook-model";

/** 
 * 钩子函数模块：用于在不同的阶段执行一些操作
 */
export namespace hook {

    /**
     * 创建一个新的钩子管理器
     * @param options 
     */
    export function create<HookCodes>(options: Partial<HookOptions<HookCodes>>): IHookManager<HookCodes> {
        return null;
    }
}