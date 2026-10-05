<!-- 日期时间选择测试 -->
<template>
    <Fold class="datetime-picker-test" :title="'桌面客户端'">
        <Env :mode="'desktop'">
            <Fold title="年：yyyy" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy'" value="2026" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy'" min-date="2026" />
                </section>
                <section>
                    最大值：2026
                    <DateTimePicker :format="'yyyy'" max-date="2026" />
                </section>
                <section>
                    范围值：2025~2025
                    <DateTimePicker :format="'yyyy'" min-date="2025" max-date="2025" />
                </section>
                <section>
                    范围值：2026~2026
                    <DateTimePicker :format="'yyyy'" min-date="2026" max-date="2026" />
                </section>
                <section>
                    范围值：2024~2026
                    <DateTimePicker :format="'yyyy'" min-date="2024" max-date="2026" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy'" min-date="2027" max-date="2026" />
                </section>
            </Fold>
            <Fold title="年月：yyyy-MM" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM'" value="2026-10" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy-MM'" min-date="2026" />
                </section>
                <section>
                    最小值：2026-10
                    <DateTimePicker :format="'yyyy-MM'" min-date="2026-10" />
                </section>
                <section>
                    最大值：2026-10
                    <DateTimePicker :format="'yyyy-MM'" max-date="2026-10" />
                </section>
                <section>
                    范围值：2025-10~2025-10
                    <DateTimePicker :format="'yyyy-MM'" min-date="2025-10" max-date="2025-10" />
                </section>
                <section>
                    范围值：2026~2026-10
                    <DateTimePicker :format="'yyyy-MM'" min-date="2026" max-date="2026-10" />
                </section>
                <section>
                    范围值：2024~2026-11
                    <DateTimePicker :format="'yyyy-MM'" min-date="2024" max-date="2026-11" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy-MM'" min-date="2027" max-date="2026" />
                </section>
                <hr />
            </Fold>
            <Fold title="年月日：yyyy-MM-dd" status="expand">
                <section>
                    默认：format不传
                    <DateTimePicker />
                </section>
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM-dd'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026-10" />
                </section>
                <section>
                    默认：value=2026-10-22
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026-10-22" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM-dd'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2026" />
                </section>
                <section>
                    最小值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2026-10" />
                </section>
                <section>
                    最大值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" max-date="2026-10" />
                </section>
                <section>
                    范围值：2025-10~2025-10
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2025-10" max-date="2025-10" />
                </section>
                <section>
                    范围值：2026~2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2026" max-date="2026-10" />
                </section>
                <section>
                    范围值：2024~2026-11
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2024" max-date="2026-11" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2027" max-date="2026" />
                </section>
                <hr />
                <!-- 工具栏控制 -->
                <section>
                    工具栏：{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd'" :toolbar="{ nowDisabled: true }" />
                </section>
            </Fold>
            <Fold title="年月日时分：yyyy-MM-dd HH:mm" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="2026-10" />
                </section>
                <section>
                    默认：value=2026-10-22
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="2026-10-22" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2026" />
                </section>
                <section>
                    最小值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2026-10" />
                </section>
                <section>
                    最大值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" max-date="2026-10" />
                </section>
                <section>
                    范围值：2025-10~2025-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2025-10" max-date="2025-10" />
                </section>
                <section>
                    范围值：2026~2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2026" max-date="2026-10" />
                </section>
                <section>
                    范围值：2024~2026-11
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2024" max-date="2026-11" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2027" max-date="2026" />
                </section>
                <hr />
                <!-- 工具栏控制 -->
                <section>
                    工具栏：{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ nowDisabled: true }" />
                </section>
            </Fold>
            <Fold title="年月日时分秒：yyyy-MM-dd HH:mm:ss" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026-10" />
                </section>
                <section>
                    默认：value=2026-10-22
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026-10-22" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="xxx" />
                </section>
                <!-- 最大、最小值、工具栏控制：内部逻辑和【年月日 时分】一致，不配置了 -->
                <section>
                    最大、最小值、工具栏控制：内部逻辑和【年月日 时分】一致，不配置了
                </section>
            </Fold>
            <Fold title="时分：HH:mm" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'HH:mm'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'HH:mm'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10-02
                    <DateTimePicker :format="'HH:mm'" value="2026-10-02" />
                </section>
                <section>
                    默认：value=23
                    <DateTimePicker :format="'HH:mm'" value="23" />
                </section>
                <section>
                    默认：value=23:11
                    <DateTimePicker :format="'HH:mm'" value="23:11" />
                </section>
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：23
                    <DateTimePicker :format="'HH:mm'" min-time="23" />
                </section>
                <section>
                    最小值：23:11
                    <DateTimePicker :format="'HH:mm'" min-time="23:11" />
                </section>
                <section>
                    最大值：23:11
                    <DateTimePicker :format="'HH:mm'" max-time="23:11" />
                </section>
                <section>
                    区间值：22:11~23:11
                    <DateTimePicker :format="'HH:mm'" min-time="22:11" max-time="23:11" />
                </section>
                <section>
                    区间值：22:11~22:11
                    <DateTimePicker :format="'HH:mm'" min-time="22:11" max-time="22:11" />
                </section>
                <section>
                    区间值：23:11~22:11
                    <DateTimePicker :format="'HH:mm'" min-time="23:11" max-time="22:11" />
                </section>
            </Fold>
            <Fold title="时分秒：HH:mm:ss" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'HH:mm:ss'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'HH:mm:ss'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10-02
                    <DateTimePicker :format="'HH:mm:ss'" value="2026-10-02" />
                </section>
                <section>
                    默认：value=23
                    <DateTimePicker :format="'HH:mm:ss'" value="23" />
                </section>
                <section>
                    默认：value=23:11
                    <DateTimePicker :format="'HH:mm:ss'" value="23:11" />
                </section>
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：23:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="23:11" />
                </section>
                <section>
                    最小值：23:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="23:11:11" />
                </section>
                <section>
                    最大值：23:11:11
                    <DateTimePicker :format="'HH:mm:ss'" max-time="23:11:11" />
                </section>
                <section>
                    区间值：22:11~23:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="22:11" max-time="23:11:11" />
                </section>
                <section>
                    区间值：22:11:11~22:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="22:11:11" max-time="22:11:11" />
                </section>
                <section>
                    区间值：23:11:11~22:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="23:11:11" max-time="22:11:11" />
                </section>
            </Fold>
            <Fold title="简化模式、只读控制、工具栏控制" status="fold">
                <section>
                    只读：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026" readonly />
                </section>
                <section>
                    简化模式：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026" display="simple" />
                </section>
                <section>
                    简化模式：readonly、value=2026
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026" readonly display="simple" />
                </section>
                <hr />
                <!-- 工具栏控制 -->
                <section>
                    工具栏：年月{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM'" :toolbar="{ nowDisabled: true }" />
                </section>
                <hr />
                <section>
                    工具栏：年月日时分{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：年月日时分{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：年月日时分{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ nowDisabled: true }" />
                </section>
                <hr />
                <section>
                    工具栏：时分秒{ disabled: true }
                    <DateTimePicker :format="'HH:mm:ss'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：时分秒{ clearDisabled: true }
                    <DateTimePicker :format="'HH:mm:ss'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：时分秒{ nowDisabled: true }
                    <DateTimePicker :format="'HH:mm:ss'" :toolbar="{ nowDisabled: true }" />
                </section>
            </Fold>
        </Env>
    </Fold>
    <hr />
    <!-- 移动端模式 -->
    <Fold class="datetime-picker-test" :title="'移动端'">
        <Env :mode="'mobile'">
            <Fold title="年：yyyy" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy'" value="2026" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy'" min-date="2026" />
                </section>
                <section>
                    最大值：2026
                    <DateTimePicker :format="'yyyy'" max-date="2026" />
                </section>
                <section>
                    范围值：2025~2025
                    <DateTimePicker :format="'yyyy'" min-date="2025" max-date="2025" />
                </section>
                <section>
                    范围值：2026~2026
                    <DateTimePicker :format="'yyyy'" min-date="2026" max-date="2026" />
                </section>
                <section>
                    范围值：2024~2026
                    <DateTimePicker :format="'yyyy'" min-date="2024" max-date="2026" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy'" min-date="2027" max-date="2026" />
                </section>
            </Fold>
            <Fold title="年月：yyyy-MM" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM'" value="2026-10" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy-MM'" min-date="2026" />
                </section>
                <section>
                    最小值：2026-10
                    <DateTimePicker :format="'yyyy-MM'" min-date="2026-10" />
                </section>
                <section>
                    最大值：2026-10
                    <DateTimePicker :format="'yyyy-MM'" max-date="2026-10" />
                </section>
                <section>
                    范围值：2025-10~2025-10
                    <DateTimePicker :format="'yyyy-MM'" min-date="2025-10" max-date="2025-10" />
                </section>
                <section>
                    范围值：2026~2026-10
                    <DateTimePicker :format="'yyyy-MM'" min-date="2026" max-date="2026-10" />
                </section>
                <section>
                    范围值：2024~2026-11
                    <DateTimePicker :format="'yyyy-MM'" min-date="2024" max-date="2026-11" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy-MM'" min-date="2027" max-date="2026" />
                </section>
                <hr />
            </Fold>
            <Fold title="年月日：yyyy-MM-dd" status="expand">
                <section>
                    默认：format不传
                    <DateTimePicker />
                </section>
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM-dd'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026-10" />
                </section>
                <section>
                    默认：value=2026-10-22
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026-10-22" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM-dd'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2026" />
                </section>
                <section>
                    最小值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2026-10" />
                </section>
                <section>
                    最大值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" max-date="2026-10" />
                </section>
                <section>
                    范围值：2025-10~2025-10
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2025-10" max-date="2025-10" />
                </section>
                <section>
                    范围值：2026~2026-10
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2026" max-date="2026-10" />
                </section>
                <section>
                    范围值：2024~2026-11
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2024" max-date="2026-11" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy-MM-dd'" min-date="2027" max-date="2026" />
                </section>
                <hr />
                <!-- 工具栏控制 -->
                <section>
                    工具栏：{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd'" :toolbar="{ nowDisabled: true }" />
                </section>
            </Fold>
            <Fold title="年月日时分：yyyy-MM-dd HH:mm" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="2026-10" />
                </section>
                <section>
                    默认：value=2026-10-22
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="2026-10-22" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" value="xxx" />
                </section>
                <hr />
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2026" />
                </section>
                <section>
                    最小值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2026-10" />
                </section>
                <section>
                    最大值：2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" max-date="2026-10" />
                </section>
                <section>
                    范围值：2025-10~2025-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2025-10" max-date="2025-10" />
                </section>
                <section>
                    范围值：2026~2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2026" max-date="2026-10" />
                </section>
                <section>
                    范围值：2024~2026-11
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2024" max-date="2026-11" />
                </section>
                <section>
                    范围值：2027~2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" min-date="2027" max-date="2026" />
                </section>
                <hr />
                <!-- 工具栏控制 -->
                <section>
                    工具栏：{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ nowDisabled: true }" />
                </section>
            </Fold>
            <Fold title="年月日时分秒：yyyy-MM-dd HH:mm:ss" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026-10" />
                </section>
                <section>
                    默认：value=2026-10-22
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026-10-22" />
                </section>
                <section>
                    默认：value=xxx
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="xxx" />
                </section>
                <!-- 最大、最小值、工具栏控制：内部逻辑和【年月日 时分】一致，不配置了 -->
                <section>
                    最大、最小值、工具栏控制：内部逻辑和【年月日 时分】一致，不配置了
                </section>
            </Fold>
            <Fold title="时分：HH:mm" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'HH:mm'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'HH:mm'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10-02
                    <DateTimePicker :format="'HH:mm'" value="2026-10-02" />
                </section>
                <section>
                    默认：value=23
                    <DateTimePicker :format="'HH:mm'" value="23" />
                </section>
                <section>
                    默认：value=23:11
                    <DateTimePicker :format="'HH:mm'" value="23:11" />
                </section>
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：23
                    <DateTimePicker :format="'HH:mm'" min-time="23" />
                </section>
                <section>
                    最小值：23:11
                    <DateTimePicker :format="'HH:mm'" min-time="23:11" />
                </section>
                <section>
                    最大值：23:11
                    <DateTimePicker :format="'HH:mm'" max-time="23:11" />
                </section>
                <section>
                    区间值：22:11~23:11
                    <DateTimePicker :format="'HH:mm'" min-time="22:11" max-time="23:11" />
                </section>
                <section>
                    区间值：22:11~22:11
                    <DateTimePicker :format="'HH:mm'" min-time="22:11" max-time="22:11" />
                </section>
                <section>
                    区间值：23:11~22:11
                    <DateTimePicker :format="'HH:mm'" min-time="23:11" max-time="22:11" />
                </section>
            </Fold>
            <Fold title="时分秒：HH:mm:ss" status="fold">
                <section>
                    默认：
                    <DateTimePicker :format="'HH:mm:ss'" />
                </section>
                <section>
                    默认：value=2026
                    <DateTimePicker :format="'HH:mm:ss'" value="2026" />
                </section>
                <section>
                    默认：value=2026-10-02
                    <DateTimePicker :format="'HH:mm:ss'" value="2026-10-02" />
                </section>
                <section>
                    默认：value=23
                    <DateTimePicker :format="'HH:mm:ss'" value="23" />
                </section>
                <section>
                    默认：value=23:11
                    <DateTimePicker :format="'HH:mm:ss'" value="23:11" />
                </section>
                <!-- 最大、最小值控制 -->
                <section>
                    最小值：23:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="23:11" />
                </section>
                <section>
                    最小值：23:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="23:11:11" />
                </section>
                <section>
                    最大值：23:11:11
                    <DateTimePicker :format="'HH:mm:ss'" max-time="23:11:11" />
                </section>
                <section>
                    区间值：22:11~23:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="22:11" max-time="23:11:11" />
                </section>
                <section>
                    区间值：22:11:11~22:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="22:11:11" max-time="22:11:11" />
                </section>
                <section>
                    区间值：23:11:11~22:11:11
                    <DateTimePicker :format="'HH:mm:ss'" min-time="23:11:11" max-time="22:11:11" />
                </section>
            </Fold>
            <Fold title="简化模式、只读控制、工具栏控制" status="fold">
                <section>
                    只读：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026" readonly />
                </section>
                <section>
                    简化模式：value=2026
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm:ss'" value="2026" display="simple" />
                </section>
                <section>
                    简化模式：readonly、value=2026
                    <DateTimePicker :format="'yyyy-MM-dd'" value="2026" readonly display="simple" />
                </section>
                <hr />
                <!-- 工具栏控制 -->
                <section>
                    工具栏：年月{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM'" :toolbar="{ nowDisabled: true }" />
                </section>
                <hr />
                <section>
                    工具栏：年月日时分{ disabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：年月日时分{ clearDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：年月日时分{ nowDisabled: true }
                    <DateTimePicker :format="'yyyy-MM-dd HH:mm'" :toolbar="{ nowDisabled: true }" />
                </section>
                <hr />
                <section>
                    工具栏：时分秒{ disabled: true }
                    <DateTimePicker :format="'HH:mm:ss'" :toolbar="{ disabled: true }" />
                </section>
                <section>
                    工具栏：时分秒{ clearDisabled: true }
                    <DateTimePicker :format="'HH:mm:ss'" :toolbar="{ clearDisabled: true }" />
                </section>
                <section>
                    工具栏：时分秒{ nowDisabled: true }
                    <DateTimePicker :format="'HH:mm:ss'" :toolbar="{ nowDisabled: true }" />
                </section>
            </Fold>
        </Env>
    </Fold>
</template>

<script setup lang="ts">
import { components } from '../../libraries/snail_vue';


// *****************************************   👉  组件定义    *****************************************
//  1、props、event、model、components
const { Fold, Env, DateTimePicker } = components;

//  2、组件交互变量、常量


// *****************************************   👉  方法+事件    ****************************************

// *****************************************   👉  组件渲染    *****************************************
//  1、数据初始化、变化监听
//  2、生命周期响应

</script>

<style lang="less">
// 引入基础Mixins样式
@import "snail.view/dist/styles/mixins.less";

.datetime-picker-test {
    width: 100%;
    flex: none;

    .fold-body {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }

    section {
        width: 30%;
        flex: none;
    }

    hr {
        width: 100%;
        flex: none;
    }

    .snail-fold {
        width: 100%;
        flex: none;
    }
}
</style>