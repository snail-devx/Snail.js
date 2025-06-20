> **Snail.js 项目目录；核心代码通过 npm 包方式对外共享**
>
> 整个目录结构和打包流程参照 Vue 项目；采用工作空间模式

# 1. 整体规划

## 1.1 目录规划

- packages 核心代码，npm 包源码；下面每个子文件就是一个 npm 包
  - src 源码目录
  - test vitest 测试代码目录
    - web 测试插件代码生成的源码目录
    - dist 测试插件代码生成的输出目录
- release 存放用于 npm 包发布时的文件
- scripts 源码构建时用到的 js 脚本代码
- temp 构建过程中需要临时存放的文件目录
- types 整个项目打包构建过程中定义的类型文件；非 packages 下 npm 包生产的 `.d.ts` 文件

## 1.2 解决方案

`.code-workspace`分类 `Snail.code-workspace`和 `Snail.Rullup.code-workspace`

- Snail：负责核心代码、界面项目相关代码；`snail.core`、`snail.vue`
- Snail.Rullup：负责 rollup 打包相关代码；`snail.rollup`、`snail.rollup-*`

# 2. 约束申明

## 2.1 共享相关

1. 配置共享：packages 下所有包共享一份配置，如.babelrc.json，都走根目录下的
2. 脚本共享：通过 scripts 下的脚本，进行 packages 下的代码构建，packages 下不做构建相关处理
3. 依赖共享：通过 workspace 概念，packages 所有依赖包都在根目录 node_modules 目录下，packages 下依赖安装，共享根目录

## 2.2 打包相关

> packages 的包，打包规则：
>
> - 包自己根目录下创建 `rollup.config.js`，导出需要打包的 js 文件配置；
> - 打包输出目录，强制约束到包自己的 `dist`目录下
>
> 最终由根下的 `rollup.config.js`进行加载，合并为最终的打包配置做执行；解析规则
>
> - 各 packages 下的 `rollup.config.js` 返回 input 和 outpu 配置，可自定义 plugins
> - 全局内置公共 rollup 插件（如 ts 编译、node-resolve 等）；各 packages 下的 plugins 作为最后的 rollup 插件存在

```javascript
//  依赖npm包支持：add -D  @rollup/plugin-node-resolve
import nodeResolve from "@rollup/plugin-node-resolve";
//  typescript支撑：add -D  @rollup/plugin-typescript typescript tslib
import typescript from "@rollup/plugin-typescript";
//  babel支持： add -D @rollup/plugin-babel
import babel from "@rollup/plugin-babel";
import { DEFAULT_EXTENSIONS } from "@babel/core";
//  文件路径相关包
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

/** 是否是生产环境 */
const isProd = process.env.NODE_ENV === "production";
/** 文件名称全路径 */
const __filename = fileURLToPath(import.meta.url);
/** 文件所在目录全路径 */
const __dirname = dirname(__filename);

/**
 * 打包的组件配置
 * @type {import("rollup").RollupOptions}
 */
export default [
  {
    input: resolve(__dirname, "./src/index.ts"),
    output: [
      { format: "module", dir: resolve(__dirname, "./dist"), sourcemap: true },
      {
        name: "snail",
        format: "umd",
        file: resolve(__dirname, "./dist/index.umd.js"),
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      //  编译ts文件：生产环境打包时，生成“.d.ts”文件；考虑使用当前目录下的tsconfig、、、
      typescript(
        Object.assign(
          { declaration: isProd },
          isProd
            ? { declarationDir: resolve(__dirname, "./dist/types") }
            : { declarationDir: undefined }
        )
      ),
      //  执行babel编译，加入垫片等；强制支持ts
      babel({
        extensions: [".ts", ...DEFAULT_EXTENSIONS],
        configFile: resolve(process.cwd(), "../../.babelrc.json"),
        comments: false,
      }),
    ],
    external: [/node_modules/gi],
  },
];
```

# 3. 构建流程

## 3.1 源码编译

## 3.2 代码测试

1、默认使用根目录下的 `vitest.config.js`配置；若涉及到项目独立配置时，再在 `package`下自身目录下构建 `vitest.conig.js`文件

2、测试代码放到 `package`下项目的 test 目录下，命名规范 `xxx.test.ts`

## 3.3 发布 NPM 包

# 4.注意事项

## 4.1 packages 打包时强制版本依赖

- @rollup/plugin-typescript 12.1.2 ；12.1.3 版本在 resolve 时去掉了 filter 过滤

  - 导致一些没有.d.ts 文件的 npm 包会被解析成实际的物理路径

- ```javascript
  // 12.1.2 import minimist from 'minimist';
  if (resolved) {
    if (/\.d\.[cm]?ts/.test(resolved.extension)) return null;
    if (!filter(resolved.resolvedFileName)) return null;
    return path.normalize(resolved.resolvedFileName);
  }
  ```

  ```javascript
  // 12.1.3  import minimist from 'E:\\00_Snail\\Snail.js\\node_modules\\.pnpm\\minimist@1.2.8\\node_modules\\minimist\\index.js';
  if (resolved) {
    if (/\.d\.[cm]?ts/.test(resolved.extension)) return null;
    return path.normalize(resolved.resolvedFileName);
  }
  ```
