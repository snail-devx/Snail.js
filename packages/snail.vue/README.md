# 1. **概述**

**snail.vue 基于 vue 3.x，实现一些常用功能模块，通过 MIT 协议开放使用：**

1. **基于 vue 封装常用组件（如表单、列表、树、弹窗、容器、提示等组件），并不断补充**
2. **提供基于 vue 的通用数据结构和事件模型**
3. **对 vue 的部分功能做了再次封装，简化使用和生命周期管理**

# 2. **环境搭建**

## 2.1. **依赖安装**

1. **安装 npm 包**
2. **注册依赖组件**
3. **打包输出**

## 2.2. **动态注册**

# 3. **使用说明**

## 3.1. **base 基础组件**

**封装基础 vue 组件，如 Button、Select、Header、Icon、Search、Switch 等等**

**详细说明：**[https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8)

| **组件**                                                               | **简介**                                                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Button](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#s1zYq)   | **按钮组件；集成 type、size 属性，封装大小和类型，简化使用**                         |
| [Choose](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#gCenb)   | **选择组件；集成 radio、checkbook 常用功能，支持选项组；支持美化和原生两种渲染模式** |
| [Icon](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#xf4og)     | **图标组件；使用 svg 进行图标绘，内置常用图标类型；并支持自定义图标绘制路径**        |
| [Search](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#VoyjZ)   | **搜索组件；封装搜索输入框、搜索按钮；支持自动完成等功能**                           |
| [Select](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#NPAQL)   | **选项菜单组件；对原生 select 的扩充，支持多级选项，支持单选和多选等**               |
| [Switch](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#sOSDT)   | **开关组件；支持只读、v-model 绑定操纵**                                             |
| [Reactive](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#LzpHK) | **响应式模块，非 vue 组件；对 vue 响应时做了封装，集成常用生命周期管理**             |
| [Footer](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#Mk0Pf)   | **尾部组件；和 Header 配套，封装确定、取消按钮；不常用**                             |
| [Header](https://www.yuque.com/snail-devx/js/mhieowa8ddbdhgu8#jQkjV)   | **头部组件；封装标题、关闭按钮，用于 page 和 dialog 模式；支持插槽**                 |

## 3.2. **container 容器组件**

**实现对子组件的动态加载，如列表、树、滚动容器，折叠面板，动态组件等等；**

**详细说明：**[https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc)

| **组件**                                                              | **简介**                                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [dynamic](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#NNGJt) | **动态组件；vue 的 Component 组件扩展，支持 url、name、object 方式加载异步组件，并支持 event、props、model、slot 等绑定** |
| [fold](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#sJOfO)    | **折叠面板组件；通过 slot 加载实际内容，封装折叠 title 实现面板展开、收起功能**                                           |
| [layout](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#lGmps)  | **布局组件；实现上中下、左中右布局，通过 slot 指定每块内容**                                                              |
| [scroll](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#IcwVh)  | **滚动组件；实现滚动条状态、事件封装，并通过 class、event 等方式对外，通过 slot 加载实际内容**                            |
| [sort](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#dKA7E)    | **排序组件；集成 sortable.js 库，实现再次封装，暴露常见属性**                                                             |
| [table](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#UViu6)   | **表格组件；封装表头、内容区域，基于 TableCol、TableRow 子组件对外做自定义渲染**                                          |
| [tree](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#tKdSd)    | **树组件；基于 nodes 渲染树，支持节点自定义，集成节点事件和本地搜索**                                                     |
| [wrapper](https://www.yuque.com/snail-devx/js/kaynh9t44gbl6fxc#gita6) | **包裹层组件；作为常用组件的包裹层，自动实现组件在 page 和 popup 中展现，让内容组件关注核心逻辑即可**                     |

## 3.3. **form 表单组件**

**封装表单专属组件，如 input、文件上传等**

**详细说明：**[https://www.yuque.com/snail-devx/js/wl1q8db0qms764eg](https://www.yuque.com/snail-devx/js/wl1q8db0qms764eg)

| **组件**                                                            | **简介**                                        |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| [input](https://www.yuque.com/snail-devx/js/wl1q8db0qms764eg#lw7O6) | **输入框组件，对原生 input 做美化，支持标题等** |

## 3.4. **popup 弹窗组件**

**基于 IPopupManager 实现弹窗管理，自动管理弹窗层级、弹窗生命周期；提供基础 popup 弹窗方法；并扩展 dialog、follow、toast、confirm 弹窗方法**

**详细说明：**[https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2](https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2)

| **弹窗方法**                                                           | **简介**                                                                               |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [usePopup](https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2#MF7uV) | **弹窗管理器接口实现接口，后续 popup、dialog 等弹窗的具体实现**                        |
| [popup](https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2#gppwu)    | **通用弹窗方法；管理弹窗生成周期，自动分配弹层，实现属性、事件绑定**                   |
| [dialog](https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2#YZ42j)   | **模态弹窗；利用 popup 实现弹窗遮罩，支持关闭前拦截**                                  |
| [follow](https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2#lMTk5)   | **跟随弹窗；弹窗自动跟随指定 target 元素，实现高度、宽度跟随、位置跟随、位置智能感知** |
| [toast](https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2#FWNH1)    | **消息提示弹窗；模拟 Android 的 Toast 弹窗提示消息**                                   |
| [confirm](https://www.yuque.com/snail-devx/js/byho94c6ms40kdb2#wohc0)  | **确认弹窗；模拟实现原生 confirm 弹窗**                                                |

## 3.5. **prompt 提示组件**

**封装一些提示性质的通用组件，如数据加载状态、无数据提醒等等**

**详细说明：**[https://www.yuque.com/snail-devx/js/kp0nznuu61qs8zgw](https://www.yuque.com/snail-devx/js/kp0nznuu61qs8zgw)

| **组件**                                                                  | **简介**                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| [drag-verify](https://www.yuque.com/snail-devx/js/kp0nznuu61qs8zgw#YN3YF) | **拖拽验证组件；拖动滑块验证，给出验证提示和结果信息** |
| [empty](https://www.yuque.com/snail-devx/js/kp0nznuu61qs8zgw#qZsqi)       | **空组件；用于提示无数据、无搜索结果等空状态**         |
| [loading](https://www.yuque.com/snail-devx/js/kp0nznuu61qs8zgw#IuBmQ)     | **加载组件；用于在数据加载过程中进行加载提示**         |
