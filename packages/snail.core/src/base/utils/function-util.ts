import { RunResult } from "../function";

/**
 * 基于错误信息构建运行结果
 * - error 为   Error 时，ex为error，reason:error.message
 * - error 不为 Error 时，ex为undefined，reason:error
 * @param error 错误信息
 * @param title 日志输出时的标题信息
 * @returns 
 */
export function buildResultByError<T>(error: any, title: string): RunResult<T> {
    console.error(title, error);
    const isEx: boolean = error instanceof Error;
    return {
        success: false,
        ex: isEx ? error : undefined,
        reason: isEx ? error.message : error
    }
}