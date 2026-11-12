# 《C++ 新经典：设计模式》学习笔记

&gt; 原书：王健伟《C++ 新经典：设计模式》，清华大学出版社
&gt; 整理说明：由扫描版 PDF 经 OCR 识别后逐章校对整理，面向有开发基础、想快速掌握设计模式思想的读者（尤其前端背景），已删除与模式无关的内容（C++ 环境搭建、出版社信息等）。

## 这本书怎么学

本书的教学方式很统一：**先给一个朴素实现 → 发现问题 → 逐步重构 → 引出模式 → 归纳 UML 与应用场景**。代码是 C++ 的，但每个模式的思想都对应到前端日常：

- 模板方法 / 策略 / 状态 → React 条件渲染逻辑抽离、表单校验策略
- 观察者 → 事件总线、响应式系统（Vue reactivity、RxJS）
- 单件 → 全局单例（`store`、`config` 对象）
- 装饰 → 高阶组件（HOC）、中间件
- 外观 / 适配器 → 封装第三方 SDK 的门面层、polyfill
- 职责链 → Express/Koa 中间件链、事件冒泡处理

建议按原书章节顺序通读（作者从最易理解的模板方法开始，难度递进），之后把本课程当字典按模式查。

## 目录

### 开篇

- [01. 设计模式与软件开发思想](/chapters/2026-11-cpp-design-patterns-01-design-patterns-overview) —— 设计模式是什么、为什么需要、23 种模式的分类与讲解规划

### 模式篇（按原书教学顺序）

- [02. 模板方法模式](/chapters/2026-11-cpp-design-patterns-02-template-method)
- [03. 工厂模式、原型模式、建造者模式](/chapters/2026-11-cpp-design-patterns-03-factory-prototype-builder)
- [04. 策略模式](/chapters/2026-11-cpp-design-patterns-04-strategy)
- [05. 观察者模式](/chapters/2026-11-cpp-design-patterns-05-observer)
- [06. 装饰模式](/chapters/2026-11-cpp-design-patterns-06-decorator)
- [07. 单件模式](/chapters/2026-11-cpp-design-patterns-07-singleton)
- [08. 外观模式](/chapters/2026-11-cpp-design-patterns-08-facade)
- [09. 命令模式](/chapters/2026-11-cpp-design-patterns-09-command)
- [10. 迭代器模式](/chapters/2026-11-cpp-design-patterns-10-iterator)
- [11. 组合模式](/chapters/2026-11-cpp-design-patterns-11-composite)
- [12. 状态模式](/chapters/2026-11-cpp-design-patterns-12-state)
- [13. 享元模式](/chapters/2026-11-cpp-design-patterns-13-flyweight)
- [14. 代理模式](/chapters/2026-11-cpp-design-patterns-14-proxy)
- [15. 适配器模式](/chapters/2026-11-cpp-design-patterns-15-adapter)
- [16. 桥接模式](/chapters/2026-11-cpp-design-patterns-16-bridge)
- [17. 中介者模式](/chapters/2026-11-cpp-design-patterns-17-mediator)
- [18. 备忘录模式](/chapters/2026-11-cpp-design-patterns-18-memento)
- [19. 职责链模式](/chapters/2026-11-cpp-design-patterns-19-chain-of-responsibility)
- [20. 访问者模式](/chapters/2026-11-cpp-design-patterns-20-visitor)
- [21. 解释器模式](/chapters/2026-11-cpp-design-patterns-21-interpreter)
- [22. 设计模式总结](/chapters/2026-11-cpp-design-patterns-22-design-patterns-summary) —— 全 23 种模式一览

### 附录（C++ 语言基础，支持理解模式实现细节）

- [23. 附录 A：类和对象](/chapters/2026-11-cpp-design-patterns-23-appendix-a-classes-and-objects) —— 静态对象与构造顺序、拷贝构造/赋值、public 继承与组合委托、虚析构与内存泄漏、命名空间、前向声明等
- [24. 附录 B：引用计数基础理论和实践](/chapters/2026-11-cpp-design-patterns-24-appendix-b-reference-counting) —— `shared_ptr` 思路、写时复制的 `mystring` 实现

## 整理规则

1. **代码块**：OCR 会把代码压成一行，已逐段对照原书页面图恢复缩进与换行；个别无法辨认的字符以 `/* 原书此处 OCR 不清 */` 标注。
2. **UML 图**：原书 UML 图已转写为 mermaid（本站可直接渲染），图下保留原书扫描插图对照。
3. **章节示意图**：每个模式章开头有一张仿"视觉笔记"风格的示意图，用书中范例把模式核心思想画出来，颜色编码区分稳定与变化的部分——先看图建立直觉，再进入正文。
4. **已删除内容**：1.3 节 C++ 编程环境介绍（Visual Studio 安装与使用）、出版社页/封底、章内无信息量的过渡段落。
5. 每章末尾保留原书"应用联想/小结"性质的小节，方便快速回顾。
