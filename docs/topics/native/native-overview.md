[//]: # (title: Kotlin 原生)

Kotlin/Native 是一种将 Kotlin 代码编译为无需虚拟机就可运行的原生二进制文件的技术。
Kotlin/Native 包含一个基于 [LLVM](https://llvm.org/) 的 Kotlin 编译器后端以及 Kotlin 标准库的原生实现<!--
-->。

## 为什么选用 Kotlin/Native？

Kotlin/Native 的主要设计目标是让 Kotlin 可以为不希望或者不可能使用 *虚拟机* 的平台<!--
-->（例如嵌入式设备或者 iOS）编译。
它非常适合开发人员需要生成<!--
-->无需额外运行时或虚拟机的自包含程序的情况。

## 目标平台

Kotlin/Native 支持以下平台：
* macOS
   * iOS、 tvOS、 watchOS
* Linux
   * Windows（MinGW）
* Android NDK

> 如需编译苹果目标平台 macOS、 iOS、 tvOS 以及 watchOS，需要安装 [Xcode](https://apps.apple.com/us/app/xcode/id497799835)
> 及其命令行工具。
> 
{type="note"}

[参见所支持目标的完整列表](native-target-support.md)。

## 互操作

Kotlin/Native 支持与不同操作系统的原生编程语言的双向互操作。
编译器可创建：
* 用于多个[平台](#目标平台)的可执行文件
* 用于 C/C++ 项目的静态库或[动态](native-dynamic-libraries.md)库以及 C 语言头文件
* 用于Swift 与 Objective-C 项目的 [Apple 框架](apple-framework.md)

支持直接在 Kotlin/Native 中使用以下现有库<!--
-->的互操作：
* 静态或动态 [C 语言库](native-c-interop.md)
* C 语言、 [Swift 以及 Objective-C](native-objc-interop.md) 框架

将编译后的 Kotlin 代码包含进<!--
-->用 C、 C++、 Swift、 Objective-C 以及其他语言编写的现有项目中会很容易。
直接在 Kotlin/Native 中使用现有原生代码、
静态或动态 [C 语言库](native-c-interop.md)、
Swift/Objective-C [框架](native-objc-interop.md)、
图形引擎以及任何其他原生内容也很容易。

Kotlin/Native [库](native-platform-libs.md)有助于在多个项目之间共享 Kotlin
代码。
POSIX、 gzip、 OpenGL、 Metal、 Foundation 以及许多其他流行库与
Apple 框架都已预先导入并作为 Kotlin/Native 库包含在编译器包中。

## 在多个平台之间共享代码

[Kotlin Multiplatform](multiplatform.md) helps share common code across multiple platforms, including Android, iOS, JVM,
web, and native. Multiplatform libraries provide the necessary APIs for common Kotlin code and allow writing shared parts
of projects in Kotlin all in one place.

You can use the [Get started with Kotlin Multiplatform for mobile](multiplatform-mobile-getting-started.md) tutorial
to create applications and share business logic between iOS and Android. To share UIs among iOS, Android, desktop, and web,
try [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/),
JetBrains' declarative UI framework based on Kotlin and [Jetpack Compose](https://developer.android.com/jetpack/compose).

## 如何入门

刚接触 Kotlin？可以看看 [Kotlin 入门](getting-started.md)。

推荐文档：

* [Get started with Kotlin Multiplatform](multiplatform-get-started.md)
* [Interoperability with C](native-c-interop.md)
* [Interoperability with Swift/Objective-C](native-objc-interop.md)

推荐教程：

* [Kotlin/Native 入门](native-get-started.md)
* [Get started with Kotlin Multiplatform for mobile](multiplatform-mobile-getting-started.md)
* [Mapping primitive data types from C](mapping-primitive-data-types-from-c.md)
* [Kotlin/Native 开发动态库](native-dynamic-libraries.md)
* [Kotlin/Native 开发 Apple 框架](apple-framework.md)
