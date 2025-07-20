import { beforeEach, afterEach, afterAll, assert, beforeAll, describe, expect, it, test, vi } from 'vitest'
import { run, runAsync, debounce, throttle, polling } from "../../src/base/function"
import { throwError } from '../../src/base/error';

vi.mock("../../src/base/function", { spy: true });

afterAll(() => {
    vi.useFakeTimers(); // 测试结束后恢复默认设置
});

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
    expect(rt.reason).toStrictEqual(0);
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
        vi.useFakeTimers(); // 使用 fake timer 控制 setTimeout
    });

    afterEach(() => {
        vi.runOnlyPendingTimers(); // 清理所有 pending timers
        vi.useRealTimers(); // 恢复真实 timer
    });

    test('TC01: 应在 delay 后调用一次函数', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 100);

        debounced();

        expect(mockFn).not.toHaveBeenCalled(); // 尚未执行

        vi.advanceTimersByTime(100); // 快进时间

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('TC02: 快速多次调用，只执行一次', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 100);

        debounced();
        debounced();
        debounced();

        expect(mockFn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('TC03: 两次调用之间超过 delay，应执行两次', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 100);

        debounced();
        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);

        debounced();
        vi.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    test('TC04: this 上下文应正确传递', () => {
        const obj = {
            value: 'hello',
            method: vi.fn(function (this: typeof obj) {
                expect(this.value).toBe('hello');
            }),
        };

        const debounced = debounce(obj.method, 100);

        debounced.call(obj, 'arg1'); // 显式绑定 this
        vi.advanceTimersByTime(100);
    });

    test('TC05: 参数应正确传递给原函数', () => {
        const mockFn = vi.fn();
        const debounced = debounce(mockFn, 100);

        debounced('arg1', 'arg2');

        vi.advanceTimersByTime(100);

        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
});

//  使用通义灵码生成的单元测试
describe("throttle", async () => {
    beforeAll(() => vi.useFakeTimers());
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
    beforeAll(() => vi.useRealTimers());
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
    count = 0, await expect(polling(pFunc, cFunc, NaN, 2, 1)).rejects.eq("polling timeout");
    //@ts-ignore  2s的超时时间，1s轮询一次；每次自加1
    count = 0, await expect(polling(pFunc, cFunc, 1, 2, 1)).rejects.eq("polling timeout");
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

    count = 0, await expect(polling(() => throwError('dddddddd'), cFunc, 1, 2, 1)).rejects.eq("polling error: dddddddd");
    // @ts-ignore
    count = 0, await expect(polling(() => true, data => throwError('xxxxxxx'), 1, 2, 1)).rejects.eq("polling error: xxxxxxx");

    //  测试stop方法
    count = 0;
    const xstop = polling(pFunc, cFunc, 1, -1, 2);
    xstop.stop();
    await expect(xstop).rejects.eq("polling stopped");
});
