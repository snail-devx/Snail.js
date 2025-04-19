import { assert, describe, expect, test } from 'vitest'
import { event } from "../../src/base/event"
import { EventHandle, IEventManager } from '../../src/base/models/event'
import { delay } from '../../src/base/promise';

/**
 * 测试方法
 * @param em 
 */
async function testFunc(em: IEventManager) {
    let counter: number = 0;
    const tmpFunc: EventHandle<number> = data => {
        counter += data || 0;
    }
    //  on两次，相同handl，以第一次为准，只会触发一次
    em.on("evx", tmpFunc);
    em.on("evx", tmpFunc);
    em.on("evx", () => { });// 充数，确保一个事件有多个监听者，测试覆盖率
    em.trigger("evx", 100);
    await delay(1000);
    expect(counter).toStrictEqual(100);
    //  once，trigger多次，也只会执行第一次
    counter = 0, em.once("xxx", tmpFunc);
    em.trigger("xxx", 300);
    em.trigger("xxx", 400);
    await delay(100);
    expect(counter).toStrictEqual(300);
    //  off 一次，on多次相同也只会存在一个，则off之后就无此事件监听了
    em.off("evx", tmpFunc);
    counter = 0, em.trigger("evx", 100);
    await delay(100);
    expect(counter).toStrictEqual(0);

    counter = 0, em.on<number>("snail", nx => counter = nx || 0);
    em.trigger("snail", 1024, true);
    expect(counter).toStrictEqual(1024);
    em.off("snail");

    //  trigger一个不存在的事件
    em.trigger("dddddd", 12312, true);

    //  阻断事件冒泡
    counter = 0;
    em.on<number>("stop", data => (counter += data || 0));
    em.on<number>("stop", (data, sender) => (counter += data || 0, sender.stopPropagation()));
    em.on<number>("stop", data => counter += data || 0);
    em.trigger("stop", 100);
    await delay();
    expect(counter).toStrictEqual(200);

    //  测试报错；这里后续使用mock，将console.log拦截掉，做判断
    em.on("error", () => { throw new Error("111"); });
    em.trigger("error", 100);
}

//  测试全局的
test("global", async () => testFunc(event));
test("newScope", async () => testFunc(event.newScope()));
test("mountScope", async () => testFunc(event.newScope()));

//  测试各个事件对象的隔离性；
test("test-private", async () => {
    let global_number = 0, scope1_number = 0, scope2_number = 0;

    event.on<number>("private", number => global_number = number!);
    const event1 = event.newScope().on<number>("private", number => scope1_number = number!);
    const event2 = event.newScope().on<number>("private", number => scope2_number = number!);

    event.trigger<number>("private", 100);
    event1.trigger<number>("private", 200);
    event2.trigger<number>("private", 300);

    await delay(100);

    assert.strictEqual(global_number, 100);
    assert.strictEqual(scope1_number, 200);
    assert.strictEqual(scope2_number, 300);
});
