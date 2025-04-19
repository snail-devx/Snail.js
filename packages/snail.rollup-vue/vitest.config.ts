import { resolve } from 'path'
import { configDefaults, defineConfig } from 'vitest/config'

/**
 * 独立测试项目配置；专门针对vue 项目进行测试
 *  1、将vue npm包放到全局安装不合适，在这里独立测试
 *  2、显式指定测试root为当前根目录
 *  3、显式指定.test.ts文件为当前根目录下
 * 先使用默认的配置；后期再研究，如进行mock
 *  参照：https://cn.vitest.dev/config/#include
 */
export default defineConfig({
    test: {
        root: __dirname,
        //  如果要完整模拟dom，则加上
        // environment: "jsdom",
        testTimeout: 1000 * 100,
        exclude: [
            ...configDefaults.exclude,
        ],
        include: [
            // "packages/*/__test__/**",
            "test/*.test.ts"
        ]
    },
})