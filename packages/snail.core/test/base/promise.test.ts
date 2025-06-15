import { assert, describe, expect, it, test } from 'vitest'
import { awaitX, defer, delay } from "../../src/base/promise"
import { getMessage } from '../../src/base/error';
import { RunResult } from '../../src/base/function';

test("defer", async () => {

    let deferred = defer<number>();
    setTimeout(deferred.resolve, 3, 100);
    await expect(deferred.promise).resolves.toEqual(100);

    deferred = defer<number>();
    setTimeout(deferred.reject, 3, 100);
    await expect(deferred.promise).rejects.toEqual(100);
});

test("delay", async () => {
    await expect(delay(100)).resolves.toStrictEqual(true);
});

//  使用通义灵码生成的单元测试
describe('awaitX', async () => {
    it('should resolve with success: true when given a non-Promise value', async () => {
        const result = await awaitX(42);
        expect(result).toEqual({ success: true, data: 42 } as RunResult<number>);
    });

    it('should resolve with success: true when given a resolved Promise', async () => {
        const result = await awaitX(Promise.resolve('hello'));
        expect(result).toEqual({ success: true, data: 'hello' } as RunResult<string>);
    });

    it('should resolve with success: false and an error when given a rejected Promise with Error', async () => {
        const error = new Error('Test error');
        const result = await awaitX(Promise.reject(error));
        expect(result).toEqual({
            success: false,
            ex: error,
            reason: 'Test error'
        } as RunResult<never>);
    });

    it('should resolve with success: false and string reason when given a rejected Promise with string', async () => {
        const result = await awaitX(Promise.reject('Custom error message'));
        expect(result).toEqual({
            success: false,
            ex: undefined,
            reason: 'Custom error message'
        } as RunResult<never>);
    });

    it('should resolve with success: false and JSON string when given a rejected Promise with object', async () => {
        const errorObject = { code: 500, message: 'Internal Server Error' };
        const result = await awaitX(Promise.reject(errorObject));
        expect(result).toEqual({
            success: false,
            ex: undefined,
            reason: '{"code":500,"message":"Internal Server Error"}'
        } as RunResult<never>);
    });

    it('should handle rejection with number reason correctly', async () => {
        const result = await awaitX(Promise.reject(404));
        expect(result).toEqual({
            success: false,
            ex: undefined,
            reason: '404'
        } as RunResult<never>);
    });
});