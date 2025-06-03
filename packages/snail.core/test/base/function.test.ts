import { afterAll, assert, describe, expect, it, test, vi } from 'vitest'
import { run, runAsync, debounce, throttle, polling } from "../../src/base/function"
import { afterEach, beforeEach } from 'node:test';

vi.mock("../../src/base/function", { spy: true });


test("run", () => {
    var rt = run(undefined as any);
    expect(rt).toBeTypeOf("object");
    expect(rt.success).toStrictEqual(false);
    expect(rt.reason).toEqual("func must be a function.");

    rt = run(data => data, 100);
    expect(rt.success).toStrictEqual(true);
    expect(rt.data).toEqual(100);

    rt = run(data => { throw new Error(data) }, 100);
    expect(rt.success).toStrictEqual(false);
    expect(rt.reason).toStrictEqual("100");
    expect(rt.ex instanceof Error).toStrictEqual(true);
});

test("runAsync", async () => {
    function testFunc<T>(number: T): Promise<T> {
        if (number == -1) {
            throw new Error("测试Error");
        }
        return new Promise<T>((resolve, reject) => {
            number == 0
                ? reject(number)
                : resolve(number);
        })
    };

    var rt = await runAsync(testFunc, 100);
    expect(rt.success).toStrictEqual(true);
    expect(rt.data).toStrictEqual(100);
    rt = await runAsync(testFunc, 0);
    expect(rt.success).toStrictEqual(false);
    expect(rt.data).toStrictEqual(undefined);
    expect(rt.reason).toStrictEqual("0");
    rt = await runAsync(testFunc, -1);
    expect(rt.success).toStrictEqual(false);
    expect(rt.reason).toStrictEqual("测试Error");
    expect(rt.ex instanceof Error).toStrictEqual(true);

    rt = await runAsync(number => number, 100);
    expect(rt.success).toStrictEqual(true);
    expect(rt.data).toStrictEqual(100);

});

//  通义灵码 生成的单元测试
describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers(); // 使用虚拟时钟加速测试
    });

    afterEach(() => {
        vi.useRealTimers(); // 恢复真实时钟
    });

    test('TC01 - 单次调用后应在 delay 后执行函数', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 100);

        debounced();

        expect(mockFn).not.toHaveBeenCalled(); // 尚未执行
        vi.advanceTimersByTime(100); // 快进时间
        expect(mockFn).toHaveBeenCalledTimes(1); // 应该执行一次
    });

    test('TC02 - 多次调用只执行最后一次', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 100);

        debounced();
        debounced();
        debounced();

        vi.advanceTimersByTime(99); // 还没到时间
        expect(mockFn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1); // 到达时间
        expect(mockFn).toHaveBeenCalledTimes(1); // 只执行一次
    });

    test('TC03 - 参数应正确传递', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 100);

        debounced('hello', 42);
        vi.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledWith('hello', 42);
    });

    test('TC04 - this 上下文应保留', () => {
        const obj = {
            value: 'context',
            method: vi.fn(function (this: any) {
                expect(this.value).toBe('context');
            }),
        };
        // @ts-ignore
        obj.method = debounce(obj.method, 100);

        obj.method();
        vi.advanceTimersByTime(100);
    });

    test('TC05 - delay 为 0 时应立即执行', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 0);

        debounced();
        vi.runAllTimers(); // 触发所有异步任务

        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});

//  使用通义灵码生成的单元测试
describe("throttle", async () => {
    vi.useFakeTimers()
    // 恢复真实定时器
    afterAll(vi.useRealTimers);

    it('should execute the function once within the delay period', () => {
        const mockFn = vi.fn()
        const throttledFn = throttle(mockFn, 1000)
        // 连续调用多次
        for (let i = 0; i < 5; i++) {
            throttledFn()
        }
        expect(mockFn).toHaveBeenCalledTimes(1) // 应该只执行一次
    })

    it('should execute the function after the delay period', () => {
        const mockFn = vi.fn()
        const delay = 1000
        const throttledFn = throttle(mockFn, delay)

        // 第一次调用
        throttledFn()
        expect(mockFn).toHaveBeenCalledTimes(1)

        // 在delay时间内调用
        throttledFn()
        expect(mockFn).toHaveBeenCalledTimes(1)

        // 快进时间到delay之后
        vi.advanceTimersByTime(delay + 1)

        // 再次调用应该执行
        throttledFn()
        expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should preserve "this" context and arguments', () => {
        const thisContext = { "context": 'test' };
        const mockFn = vi.fn(function (this: any, ...args: any[]) {
            expect(this).toBe(thisContext);
            expect(args).toEqual(['arg1', 'arg2'])
        })

        const throttledFn = throttle(mockFn, 1000)

        // 调用带有上下文和参数的函数
        throttledFn.call(thisContext, 'arg1', 'arg2')
    })

    it('should handle different time intervals correctly', () => {
        const mockFn = vi.fn()
        const delay = 1000
        const throttledFn = throttle(mockFn, delay)

        // 初始调用
        throttledFn()
        expect(mockFn).toHaveBeenCalledTimes(1)

        // 快进800ms
        vi.advanceTimersByTime(800)
        throttledFn()
        expect(mockFn).toHaveBeenCalledTimes(1) // 不应执行

        // 快进300ms（总1100ms）
        vi.advanceTimersByTime(300)
        throttledFn()
        expect(mockFn).toHaveBeenCalledTimes(2) // 应该执行
    })
});

test("polling", async () => {
    var count: number = 0;

    function pFunc(number): number {
        count += number;
        return count;
    }
    function cFunc(data) {
        return data >= 10;
    }

    //  无效参数测试
    {
        //@ts-ignore
        expect(() => polling(null, null)).toThrowError();
        //@ts-ignore
        expect(() => polling(pFunc, null)).toThrowError();
        //@ts-ignore
        expect(() => polling(null, cFunc)).toThrowError();
    }

    //@ts-ignore  2s的超时时间，NaN轮询时间则默认5s轮询一次；每次自加1
    count = 0, await expect(polling(pFunc, cFunc, NaN, 2, 1)).rejects.eq("超时时间已到，强制停止");
    //@ts-ignore  2s的超时时间，1s轮询一次；每次自加1
    count = 0, await expect(polling(pFunc, cFunc, 1, 2, 1)).rejects.eq("超时时间已到，强制停止");
    //@ts-ignore  10s的超时时间，1s轮询一次；每次自加1
    count = 0, await expect(polling(pFunc, cFunc, 1, 10, 4)).resolves.greaterThanOrEqual(10);
    //  测试then方法，promise模式
    count = 0, await (expect(polling((number) => {
        return new Promise(resolve => {
            count = count + number;
            resolve(count);
        })
    }, cFunc, 1, 10, 4))).resolves.greaterThanOrEqual(10);
    //@ts-ignore  测试始终等待
    count = 0, await (expect(polling(pFunc, cFunc, 1, -1, 2))).resolves.greaterThanOrEqual(10);
});
