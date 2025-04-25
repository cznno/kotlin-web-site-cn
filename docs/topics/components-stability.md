[//]: # (title: Kotlin 各组件的稳定性)

The Kotlin language and toolset are divided into many components such as the compilers for the JVM, JS and Native targets,
the Standard Library, various accompanying tools and so on.
Many of these components were officially released as **Stable**, which means that they were evolved 
in a backward-compatible way following the [principles of _Comfortable Updates_ and _Keeping the Language Modern_](kotlin-evolution-principles.md).

Following the _Feedback Loop_ principle, we release many things early for the community to try out, 
so a number of components are not yet released as **Stable**.
Some of them are at a very early stage, some are more mature. 
We mark them as **Experimental**, **Alpha** or **Beta** depending on how quickly each component evolves
and the level of risk users take on when adopting it.

## Stability levels explained

Here's a quick guide to these stability levels and their meaning:

**实验性的** means "try it only in toy projects":
  * We are just trying out an idea and want some users to play with it and give feedback. If it doesn't work out, we may drop it any minute.

**Alpha** means "use at your own risk, expect migration issues": 
  * We intend to productize this idea, but it hasn't reached its final shape yet.

**Beta** means "you can use it, we'll do our best to minimize migration issues for you": 
  * It's almost done, user feedback is especially important now.
  * Still, it's not 100% finished, so changes are possible (including ones based on your own feedback).
  * Watch for deprecation warnings in advance for the best update experience.

We collectively refer to _Experimental_, _Alpha_ and _Beta_ as **pre-stable** levels.

<a name="stable"/>

**已稳定** means "use it even in most conservative scenarios":
  * It's done. We will be evolving it according to our strict [backward compatibility rules](https://kotlinfoundation.org/language-committee-guidelines/).

Please note that stability levels do not say anything about how soon a component will be released as Stable. Similarly, they do not indicate how much a component will be changed before release. They only say how fast a component is changing and how much risk of update issues users are running.

## GitHub badges for Kotlin components

The [Kotlin GitHub organization](https://github.com/Kotlin) hosts different Kotlin-related projects.
Some of them we develop full-time, while others are side projects.

Each Kotlin project has two GitHub badges describing its stability and support status:

* **Stability** status. This shows how quickly each project is evolving and how much risk the users are taking when adopting it.
  The stability status completely coincides with the [stability level of the Kotlin language features and its components](#stability-levels-explained):
    * ![Experimental stability level](https://kotl.in/badges/experimental.svg){type="joined"} stands for **Experimental**
    * ![Alpha stability level](https://kotl.in/badges/alpha.svg){type="joined"} stands for **Alpha**
    * ![Beta stability level](https://kotl.in/badges/beta.svg){type="joined"} stands for **Beta**
    * ![Stable stability level](https://kotl.in/badges/stable.svg){type="joined"} stands for **Stable**

* **Support** status. This shows our commitment to maintaining a project and helping users to solve their problems.
  The level of support is unified for all JetBrains products.  
  [See the JetBrains Open Source document for details](https://github.com/JetBrains#jetbrains-on-github).

## Stability of subcomponents

A stable component may have an experimental subcomponent, for example:
* a stable compiler may have an experimental feature;
* a stable API may include experimental classes or functions;
* a stable command-line tool may have experimental options.

We make sure to document precisely which subcomponents are not **Stable**.
We also do our best to warn users where possible and ask to opt them in explicitly 
to avoid the accidental use of features that have not been released as stable.

## Current stability of Kotlin components

> By default, all new components have Experimental status.
> 
{style="note"}

### Kotlin 编译器

| **组件**                                                        | **状态** | **状态起始版本** | **备注** |
|-----------------------------------------------------------------|----------|------------------|----------|
| Kotlin/JVM                                                      | 已稳定   | 1.0.0            |          |
| Kotlin/Native                                                   | 已稳定   | 1.9.0            |          |
| Kotlin/JS                                                       | 已稳定   | 1.3.0            |          |
| Kotlin/Wasm                                                     | Alpha    | 1.9.20           |          |
| [分析 API](https://kotlin.github.io/analysis-api/index_md.html) | 已稳定   |                  |          |

### 核心编译器插件

| **组件**                                         | **状态** | **状态起始版本** | **备注** |
|--------------------------------------------------|----------|------------------|----------|
| [All-open](all-open-plugin.md)                   | 已稳定   | 1.3.0            |          |
| [No-arg](no-arg-plugin.md)                       | 已稳定   | 1.3.0            |          |
| [SAM-with-receiver](sam-with-receiver-plugin.md) | 已稳定   | 1.3.0            |          |
| [kapt](kapt.md)                                  | 已稳定   | 1.3.0            |          |
| [Lombok](lombok.md)                              | 实验性的 | 1.5.20           |          |
| [Power-assert](power-assert.md)                  | 实验性的 | 2.0.0            |          |

### Kotlin 库

| **组件**              | **状态** | **状态起始版本** | **备注** |
|-----------------------|----------|------------------|----------|
| kotlin-stdlib (JVM)   | 已稳定   | 1.0.0            |          |
| kotlinx-coroutines    | 已稳定   | 1.3.0            |          |
| kotlinx-serialization | 已稳定   | 1.0.0            |          |
| kotlin-metadata-jvm   | 已稳定   | 2.0.0            |          |
| kotlin-reflect (JVM)  | Beta     | 1.0.0            |          |
| kotlinx-datetime      | Alpha    | 0.2.0            |          |
| kotlinx-io            | Alpha    | 0.2.0            |          |

### Kotlin 多平台

| **组件**                                 | **状态** | **状态起始版本** | **备注**                                           |
|------------------------------------------|----------|------------------|----------------------------------------------------|
| Kotlin 多平台                            | 已稳定   | 1.9.20           |                                                    |
| 用于 Android Studio 的 Kotlin 多平台插件 | Beta     | 0.8.0            | [与语言版本独立](multiplatform-plugin-releases.md) |

### Kotlin/Native

| **组件**                                     | **状态** | **状态起始版本** | **备注**                          |
|----------------------------------------------|----------|------------------|-----------------------------------|
| Kotlin/Native 运行时                         | 已稳定   | 1.9.20           |                                   |
| Kotlin/Native 与 C 语言及 Objective-C 互操作 | Beta     | 1.3.0            |                                   |
| klib 二进制                                  | 已稳定   | 1.9.20           | 不包括 cinterop klibs，请参阅下文 |
| cinterop klib 二进制                         | Beta     | 1.3.0            |                                   |
| CocoaPods 集成                               | 已稳定   | 1.9.20           |                                   |

> For details about Kotlin/Native targets support, see [](native-target-support.md).

### 语言工具

| **组件**           | **状态** | **状态起始版本** | **备注**                                       |
|--------------------|----------|------------------|------------------------------------------------|
| 脚本语法与语义     | Alpha    | 1.2.0            |                                                |
| 脚本嵌入与扩展 API | Beta     | 1.5.0            |                                                |
| 脚本 IDE 支持      | Beta     |                  | Available since IntelliJ IDEA 2023.1 and later |
| CLI 脚本           | Alpha    | 1.2.0            |                                                |

## Language features and design proposals

For language features and new design proposals, see [](kotlin-language-features-and-proposals.md).