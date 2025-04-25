[//]: # (title: Kotlin 1.6.0 的新特性)

_[发布于：2021-11-16](releases.md#版本发布详情)_

Kotlin 1.6.0 引入了新的语言特性、对现有特性的优化与改进以及对 Kotlin 标准库的大量改进。

还可以在[版本发布博文](https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/)中找到这些变更的概述。

## 语言

Kotlin 1.6.0 将上一版本 1.5.30 中预览的几个语言特性提升为稳定版了：
* [稳定版对于枚举、密封类与布尔值主语穷尽 when 语句]((#稳定版对于枚举密封类与布尔值主语穷尽-when-语句)
* [稳定版挂起函数作为超类型](#稳定版挂起函数作为超类型)
* [稳定版挂起转换](#稳定版挂起转换)
* [稳定版注解类实例化](#稳定版注解类实例化)

还包括各种类型推断改进以及对类的类型参数上注解的支持：
* [改进了递归泛型类型的类型推断](#改进了递归泛型类型的类型推断)
* [构建器类型推断变更](#构建器类型推断变更)
* [对类的类型参数上注解的支持](#对类的类型参数上注解的支持)

### 稳定版对于枚举、密封类与布尔值主语穷尽 when 语句

An _exhaustive_ [`when`](control-flow.md#when-expressions-and-statements) statement contains branches for all possible types or values of 
its subject, or for some types plus an `else` branch. It covers all possible cases, making your code safer.

We will soon prohibit non-exhaustive `when` statements to make the behavior consistent with `when` expressions. 
To ensure smooth migration, Kotlin 1.6.0 reports warnings about non-exhaustive `when` statements with an enum, sealed, or Boolean subject. 
These warnings will become errors in future releases.

```kotlin
sealed class Contact {
    data class PhoneCall(val number: String) : Contact()
    data class TextMessage(val number: String) : Contact()
}

fun Contact.messageCost(): Int =
    when(this) { // Error: 'when' expression must be exhaustive
        is Contact.PhoneCall -> 42
    }

fun sendMessage(contact: Contact, message: String) {
    // Starting with 1.6.0

    // Warning: Non exhaustive 'when' statements on Boolean will be
    // prohibited in 1.7, add 'false' branch or 'else' branch instead 
    when(message.isEmpty()) {
        true -> return
    }
    // Warning: Non exhaustive 'when' statements on sealed class/interface will be
    // prohibited in 1.7, add 'is TextMessage' branch or 'else' branch instead
    when(contact) {
        is Contact.PhoneCall -> TODO()
    }
}
```

See [this YouTrack ticket](https://youtrack.jetbrains.com/issue/KT-47709) for a more detailed explanation of the change and its effects.

### 稳定版挂起函数作为超类型

Implementation of suspending functional types has become [Stable](components-stability.md) in Kotlin 1.6.0. 
A preview was available [in 1.5.30](whatsnew1530.md#挂起函数作为超类型).

The feature can be useful when designing APIs that use Kotlin coroutines and accept suspending functional types. 
You can now streamline your code by enclosing the desired behavior in a separate class that implements a suspending functional type.

```kotlin
class MyClickAction : suspend () -> Unit {
    override suspend fun invoke() { TODO() }
}

fun launchOnClick(action: suspend () -> Unit) {}
```

You can use an instance of this class where only lambdas and suspending function references were allowed previously: `launchOnClick(MyClickAction())`.

There are currently two limitations coming from implementation details:
* You can't mix ordinary functional types and suspending ones in the list of supertypes.
* You can't use multiple suspending functional supertypes.

### 稳定版挂起转换

Kotlin 1.6.0 introduces [Stable](components-stability.md) conversions from regular to suspending functional types. 
Starting from 1.4.0, the feature supported functional literals and callable references.
With 1.6.0, it works with any form of expression. As a call argument, you can now pass any expression of a suitable regular functional type where suspending is expected. 
The compiler will perform an implicit conversion automatically.

```kotlin
fun getSuspending(suspending: suspend () -> Unit) {}

fun suspending() {}

fun test(regular: () -> Unit) {
    getSuspending { }           // OK
    getSuspending(::suspending) // OK
    getSuspending(regular)      // OK
}
```

### 稳定版注解类实例化

Kotlin 1.5.30 [introduced](whatsnew1530.md#注解类的实例化) experimental support for instantiation of annotation classes on the JVM platform.
With 1.6.0, the feature is available by default both for Kotlin/JVM and Kotlin/JS.

Learn more about instantiation of annotation classes in [this KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/annotation-instantiation.md).

### 改进了递归泛型类型的类型推断

Kotlin 1.5.30 introduced an improvement to type inference for recursive generic types, which allowed their type arguments to be inferred based only on the upper bounds of the corresponding type parameters.
The improvement was available with the compiler option. In version 1.6.0 and later, it is enabled by default.

```kotlin
// Before 1.5.30
val containerA = PostgreSQLContainer<Nothing>(DockerImageName.parse("postgres:13-alpine")).apply {
  withDatabaseName("db")
  withUsername("user")
  withPassword("password")
  withInitScript("sql/schema.sql")
}

// With compiler option in 1.5.30 or by default starting with 1.6.0
val containerB = PostgreSQLContainer(DockerImageName.parse("postgres:13-alpine"))
  .withDatabaseName("db")
  .withUsername("user")
  .withPassword("password")
  .withInitScript("sql/schema.sql")
```

### 构建器类型推断变更

Builder inference is a type inference flavor which is useful when calling generic builder functions. It can infer the type arguments of a call with the help of type information from calls inside its lambda argument.

We're making multiple changes that are bringing us closer to fully stable builder inference. Starting with 1.6.0:
* You can make calls returning an instance of a not yet inferred type inside a builder lambda without specifying the `-Xunrestricted-builder-inference` compiler option [introduced in 1.5.30](whatsnew1530.md#消除构建器推断限制).
* With `-Xenable-builder-inference`, you can write your own builders without applying the [`@BuilderInference`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-builder-inference/) annotation.

    > Note that clients of these builders will need to specify the same `-Xenable-builder-inference` compiler option.
    >
    {style="warning"}

* With the `-Xenable-builder-inference`, builder inference automatically activates if a regular type inference cannot get enough information about a type.

[Learn how to write custom generic builders](using-builders-with-builder-inference.md).

### 对类的类型参数上注解的支持

对类的类型参数上注解的支持 looks like this:

```kotlin
@Target(AnnotationTarget.TYPE_PARAMETER)
annotation class BoxContent

class Box<@BoxContent T> {}
```

Annotations on all type parameters are emitted into JVM bytecode so annotation processors are able to use them.

For the motivating use case, read this [YouTrack ticket](https://youtrack.jetbrains.com/issue/KT-43714).

Learn more about [annotations](annotations.md).

## 对以前版本的 API 支持更长时间

Starting with Kotlin 1.6.0, we will support development for three previous API versions instead of two, along with the current stable one. Currently, we support versions 1.3, 1.4, 1.5, and 1.6.

## Kotlin/JVM

For Kotlin/JVM, starting with 1.6.0, the compiler can generate classes with a bytecode version corresponding to JVM 17. The new language version also includes optimized delegated properties and repeatable annotations, which we had on the roadmap:
* [1.8 JVM 目标平台中运行时保留的可重复注解](#1-8-jvm-目标平台中运行时保留的可重复注解)
* [优化了在给定 KProperty 实例上调用了 get/set 的委托属性](#优化了在给定-kproperty-实例上调用了-get-set-的委托属性)

### 1.8 JVM 目标平台中运行时保留的可重复注解

Java 8 introduced [repeatable annotations](https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html), which can be applied multiple times to a single code element.
The feature requires two declarations to be present in the Java code: the repeatable annotation itself marked with [`@java.lang.annotation.Repeatable`](https://docs.oracle.com/javase/8/docs/api/java/lang/annotation/Repeatable.html) and the containing annotation to hold its values.

Kotlin also has repeatable annotations, but requires only [`@kotlin.annotation.Repeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-repeatable/) to be present on an annotation declaration to make it repeatable.
Before 1.6.0, the feature supported only `SOURCE` retention and was incompatible with Java's repeatable annotations.
Kotlin 1.6.0 removes these limitations. `@kotlin.annotation.Repeatable` now accepts any retention and makes the annotation repeatable both in Kotlin and Java.
Java's repeatable annotations are now also supported from the Kotlin side.

While you can declare a containing annotation, it's not necessary. For example:
* If an annotation `@Tag` is marked with `@kotlin.annotation.Repeatable`, the Kotlin compiler automatically generates a containing annotation class under the name of `@Tag.Container`:

    ```kotlin
    @Repeatable 
    annotation class Tag(val name: String)

    // The compiler generates @Tag.Container containing annotation
    ```

* To set a custom name for a containing annotation, apply the [`@kotlin.jvm.JvmRepeatable`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvmrepeatable/) meta-annotation and pass the explicitly declared containing annotation class as an argument:

    ```kotlin
    @JvmRepeatable(Tags::class)
    annotation class Tag(val name: String)
    
    annotation class Tags(val value: Array<Tag>)
    ```

Kotlin reflection now supports both Kotlin's and Java's repeatable annotations via a new function, [`KAnnotatedElement.findAnnotations()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/find-annotations.html).

Learn more about Kotlin repeatable annotations in [this KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/repeatable-annotations.md).

### 优化了在给定 KProperty 实例上调用了 get/set 的委托属性

We optimized the generated JVM bytecode by omitting the `$delegate` field and generating immediate access to the referenced property.

For example, in the following code

```kotlin
class Box<T> {
    private var impl: T = ...

    var content: T by ::impl
}
```

Kotlin no longer generates the field `content$delegate`.
Property accessors of the `content` variable invoke the `impl` variable directly, skipping the delegated property's `getValue`/`setValue` operators and thus avoiding the need for the property reference object of the [`KProperty`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-property/index.html) type.

Thanks to our Google colleagues for the implementation!

Learn more about [delegated properties](delegated-properties.md).

## Kotlin/Native

Kotlin/Native is receiving multiple improvements and component updates, some of them in the preview state:
* [新版内存管理器预览](#新版内存管理器预览)
* [对 Xcode 13 的支持](#对-xcode-13-的支持)
* [在任何主机上编译 Windows 目标](#在任何主机上编译-windows-目标)
* [LLVM 与链接器更新](#llvm-与链接器更新)
* [性能提升](#性能提升)
* [与 JVM 及 JS IR 后端统一编译器插件 ABI](#与-jvm-及-js-ir-后端统一编译器插件-abi)
* [klib 链接失败的详细错误信息](#klib-链接失败的详细错误信息)
* [重新设计了未处理异常的处理 API](#重新设计了未处理异常的处理-api)

### 新版内存管理器预览

> The new Kotlin/Native memory manager is [Experimental](components-stability.md).
> It may be dropped or changed at any time. Opt-in is required (see details below), and you should use it only for evaluation purposes.
> We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525).
>
{style="warning"}

With Kotlin 1.6.0, you can try the development preview of the new Kotlin/Native memory manager.
It moves us closer to eliminating the differences between the JVM and Native platforms to provide a consistent developer experience in multiplatform projects.

One of the notable changes is the lazy initialization of top-level properties, like in Kotlin/JVM. A top-level property gets initialized when a top-level property or function from the same file is accessed for the first time.
This mode also includes global interprocedural optimization (enabled only for release binaries), which removes redundant initialization checks.

We've recently published a [blog post](https://blog.jetbrains.com/kotlin/2021/08/try-the-new-kotlin-native-memory-manager-development-preview/) about the new memory manager.
Read it to learn about the current state of the new memory manager and find some demo projects, or jump right to the [migration instructions](https://github.com/JetBrains/kotlin/blob/master/kotlin-native/NEW_MM.md) to try it yourself.
Please check how the new memory manager works on your projects and share feedback in our issue tracker, [YouTrack](https://youtrack.jetbrains.com/issue/KT-48525).

### 对 Xcode 13 的支持

Kotlin/Native 1.6.0 supports Xcode 13 – the latest version of Xcode. Feel free to update your Xcode and continue working on your Kotlin projects for Apple operating systems.

> New libraries added in Xcode 13 aren't available for use in Kotlin 1.6.0, but we're going to add support for them in upcoming versions.
>
{style="note"}

### 在任何主机上编译 Windows 目标

Starting from 1.6.0, you don't need a Windows host to compile the Windows targets `mingwX64` and `mingwX86`. They can be compiled on any host that supports Kotlin/Native.

### LLVM 与链接器更新

We've reworked the LLVM dependency that Kotlin/Native uses under the hood. This brings various benefits, including:
* Updated LLVM version to 11.1.0.
* Decreased dependency size. For example, on macOS it's now about 300 MB instead of 1200 MB in the previous version.
* [Excluded dependency on the `ncurses5` library](https://youtrack.jetbrains.com/issue/KT-42693) that isn't available in modern Linux distributions.

In addition to the LLVM update, Kotlin/Native now uses the [LLD](https://lld.llvm.org/) linker (a linker from the LLVM project) for MingGW targets.
It provides various benefits over the previously used ld.bfd linker, and will allow us to improve runtime performance of produced binaries and support compiler caches for MinGW targets.
Note that LLD [requires import libraries for DLL linkage](whatsnew1530.md#对于-mingw-目标弃用了链接到-dll-而未导入库的用法).
Learn more in [this Stack Overflow thread](https://stackoverflow.com/questions/3573475/how-does-the-import-library-work-details/3573527/#3573527).

### 性能提升

Kotlin/Native 1.6.0 delivers the following performance improvements:

* Compilation time: compiler caches are enabled by default for `linuxX64` and `iosArm64` targets.
This speeds up most compilations in debug mode (except the first one). Measurements showed about a 200% speed increase on our test projects.
The compiler caches have been available for these targets since Kotlin 1.5.0 with [additional Gradle properties](whatsnew15.md#性能提升); you can remove them now. 
* Runtime: iterating over arrays with `for` loops is now up to 12% faster thanks to optimizations in the produced LLVM code.

### 与 JVM 及 JS IR 后端统一编译器插件 ABI

> The option to use the common IR compiler plugin ABI for Kotlin/Native is [Experimental](components-stability.md).
> It may be dropped or changed at any time. Opt-in is required (see details below), and you should use it only for evaluation purposes.
> We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-48595).
>
{style="warning"}

In previous versions, authors of compiler plugins had to provide separate artifacts for Kotlin/Native because of the differences in the ABI.

Starting from 1.6.0, the Kotlin Multiplatform Gradle plugin is able to use the embeddable compiler jar – the one used for the JVM and JS IR backends – for Kotlin/Native.
This is a step toward unification of the compiler plugin development experience, as you can now use the same compiler plugin artifacts for Native and other supported platforms.

This is a preview version of such support, and it requires an opt-in.
To start using generic compiler plugin artifacts for Kotlin/Native, add the following line to `gradle.properties`: `kotlin.native.useEmbeddableCompilerJar=true`.

We're planning to use the embeddable compiler jar for Kotlin/Native by default in the future, so it's vital for us to hear how the preview works for you.

If you are an author of a compiler plugin, please try this mode and check if it works for your plugin.
Note that depending on your plugin's structure, migration steps may be required. See [this YouTrack issue](https://youtrack.jetbrains.com/issue/KT-48595) for migration instructions and leave your feedback in the comments.

### klib 链接失败的详细错误信息

The Kotlin/Native compiler now provides detailed error messages for klib linkage errors.
The messages now have clear error descriptions, and they also include information about possible causes and ways to fix them.

For example:
* 1.5.30:

    ```text
    e: java.lang.IllegalStateException: IrTypeAliasSymbol expected: Unbound public symbol for public kotlinx.coroutines/CancellationException|null[0]
    <stack trace>
    ```

* 1.6.0:

    ```text
    e: The symbol of unexpected type encountered during IR deserialization: IrClassPublicSymbolImpl, kotlinx.coroutines/CancellationException|null[0].
    IrTypeAliasSymbol is expected.
    
    This could happen if there are two libraries, where one library was compiled against the different version of the other library than the one currently used in the project.
    Please check that the project configuration is correct and has consistent versions of dependencies.
    
    The list of libraries that depend on "org.jetbrains.kotlinx:kotlinx-coroutines-core (org.jetbrains.kotlinx:kotlinx-coroutines-core-macosx64)" and may lead to conflicts:
    <list of libraries and potential version mismatches>
    
    Project dependencies:
    <dependencies tree>
    ```

### 重新设计了未处理异常的处理 API

We've unified the processing of unhandled exceptions throughout the Kotlin/Native runtime and exposed the default processing as the function `processUnhandledException(throwable: Throwable)` for use by custom execution environments, like `kotlinx.coroutines`.
This processing is also applied to exceptions that escape operation in `Worker.executeAfter()`, but only for the new [memory manager](#新版内存管理器预览).

API improvements also affected the hooks that have been set by `setUnhandledExceptionHook()`. Previously such hooks were reset after the Kotlin/Native runtime called the hook with an unhandled exception, and the program would always terminate right after.
Now these hooks may be used more than once, and if you want the program to always terminate on an unhandled exception, either do not set an unhandled exception hook (`setUnhandledExceptionHook()`), or make sure to call `terminateWithUnhandledException()` at the end of your hook.
This will help you send exceptions to a third-party crash reporting service (like Firebase Crashlytics) and then terminate the program.
Exceptions that escape `main()` and exceptions that cross the interop boundary will always terminate the program, even if the hook did not call `terminateWithUnhandledException()`.

## Kotlin/JS

We're continuing to work on stabilizing the IR backend for the Kotlin/JS compiler.
Kotlin/JS now has an [禁用下载 Node.js 与 Yarn 的选项](#可以选择使用预装的-node-js-与-yarn).

### 可以选择使用预装的 Node.js 与 Yarn

You can now disable downloading Node.js and Yarn when building Kotlin/JS projects and use the instances already installed on the host.
This is useful for building on servers without internet connectivity, such as CI servers.

To disable downloading external components, add the following lines to your `build.gradle(.kts)`:

* Yarn:

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">
    
    ```kotlin
    rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin> {
        rootProject.the<org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension>().download = false // or true for default behavior
    }
    ```
    
    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnPlugin) {
        rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.yarn.YarnRootExtension).download = false
    }
    ```
    
    </tab>
    </tabs>

* Node.js:

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">
    
    ```kotlin
    rootProject.plugins.withType<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootPlugin> {
        rootProject.the<org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootExtension>().download = false // or true for default behavior
    }
     
    ```
    
    </tab>
    <tab title="Groovy" group-key="groovy">
    
    ```groovy
    rootProject.plugins.withType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootPlugin) {
        rootProject.extensions.getByType(org.jetbrains.kotlin.gradle.targets.js.nodejs.NodeJsRootExtension).download = false
    }
    ```
    
    </tab>
    </tabs>

## Kotlin Gradle 插件

In Kotlin 1.6.0, we changed the deprecation level of the `KotlinGradleSubplugin` class to 'ERROR'.
This class was used for writing compiler plugins. In the following releases, we'll remove this class. Use the class `KotlinCompilerPluginSupportPlugin` instead.

We removed the `kotlin.useFallbackCompilerSearch` build option and the `noReflect` and `includeRuntime` compiler options.
The `useIR` compiler option has been hidden and will be removed in upcoming releases.

Learn more about the [currently supported compiler options](gradle-compiler-options.md) in the Kotlin Gradle plugin.

## 标准库

The new 1.6.0 version of the standard library stabilizes experimental features, introduces new ones, and unifies its behavior across the platforms:

* [新版 readline 函数](#新版-readline-函数)
* [稳定版 typeOf()](#稳定版-typeof)
* [稳定版集合构建器](#稳定版集合构建器)
* [稳定版 Duration API](#稳定版-duration-api)
* [按 Regex 拆分为序列](#按-regex-拆分为序列)
* [整数的循环移位运算](#整数的循环移位运算)
* [JS 平台 replace() 与 replaceFirst() 的变更](#js-平台-replace-与-replacefirst-的变更)
* [既有 API 的改进](#既有-api-的改进)
* [弃用项](#弃用项)

### 新版 readline 函数

Kotlin 1.6.0 offers new functions for handling standard input: [`readln()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln.html) and [`readlnOrNull()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.io/readln-or-null.html).

> For now, new functions are available for the JVM and Native target platforms only.
>
{style="note"}

|**Earlier versions**|**1.6.0 alternative**|**Usage**|
| --- | --- | --- |
|`readLine()!!`|`readln()`| Reads a line from stdin and returns it, or throws a `RuntimeException` if EOF has been reached. |
|`readLine()`|`readlnOrNull()`| Reads a line from stdin and returns it, or returns `null` if EOF has been reached. |

We believe that eliminating the need to use `!!` when reading a line will improve the experience for newcomers and simplify teaching Kotlin.
To make the read-line operation name consistent with its `println()` counterpart, we've decided to shorten the names of new functions to 'ln'.

```kotlin
println("What is your nickname?")
val nickname = readln()
println("Hello, $nickname!")
```

```kotlin
fun main() {
//sampleStart
    var sum = 0
    while (true) {
        val nextLine = readlnOrNull().takeUnless { 
            it.isNullOrEmpty() 
        } ?: break
        sum += nextLine.toInt()
    }
    println(sum)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

The existing `readLine()` function will get a lower priority than `readln()` and `readlnOrNull()` in your IDE code completion.
IDE inspections will also recommend using new functions instead of the legacy `readLine()`.

We're planning to gradually deprecate the `readLine()` function in future releases.

### 稳定版 typeOf()

Version 1.6.0 brings a [Stable](components-stability.md) [`typeOf()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) function, closing one of the [major roadmap items](https://youtrack.jetbrains.com/issue/KT-45396).

[Since 1.3.40](https://blog.jetbrains.com/kotlin/2019/06/kotlin-1-3-40-released/), `typeOf()` was available on the JVM platform as an experimental API.
Now you can use it in any Kotlin platform and get [`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/#kotlin.reflect.KType) representation of any Kotlin type that the compiler can infer:

```kotlin
inline fun <reified T> renderType(): String {
    val type = typeOf<T>()
    return type.toString()
}

fun main() {
    val fromExplicitType = typeOf<Int>()
    val fromReifiedType = renderType<List<Int>>()
}
```

### 稳定版集合构建器

In Kotlin 1.6.0, collection builder functions have been promoted to [Stable](components-stability.md). Collections returned by collection builders are now serializable in their read-only state.

You can now use [`buildMap()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-map.html),
[`buildList()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-list.html), and [`buildSet()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/build-set.html)
without the opt-in annotation:

```kotlin
fun main() {
//sampleStart
    val x = listOf('b', 'c')
    val y = buildList {
        add('a')
        addAll(x)
        add('d')
    }
    println(y)  // [a, b, c, d]
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5" validate="false"}

### 稳定版 Duration API

The [Duration](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/) class for representing
duration amounts in different time units has been promoted to [Stable](components-stability.md). In 1.6.0, the Duration API has received the following changes:

* The first component of the [`toComponents()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.time/-duration/to-components.html) function that decomposes the duration into days, hours, minutes, seconds, and nanoseconds now has the `Long` type instead of `Int`.
  Before, if the value didn't fit into the `Int` range, it was coerced into that range. With the `Long` type, you can decompose any value in the duration range without cutting off the values that don't fit into `Int`.

* The `DurationUnit` enum is now standalone and not a type alias of `java.util.concurrent.TimeUnit` on the JVM.
  We haven't found any convincing cases in which having `typealias DurationUnit = TimeUnit` could be useful. Also, exposing the `TimeUnit` API through a type alias might confuse `DurationUnit` users.

* In response to community feedback, we're bringing back extension properties like `Int.seconds`. But we'd like to limit their applicability, so we put them into the companion of the `Duration` class.
  While the IDE can still propose extensions in completion and automatically insert an import from the companion, in the future we plan to limit this behavior to cases when the `Duration` type is expected.

  ```kotlin
  import kotlin.time.Duration.Companion.seconds
  
  fun main() {
  //sampleStart
      val duration = 10000
      println("There are ${duration.seconds.inWholeMinutes} minutes in $duration seconds")
      // There are 166 minutes in 10000 seconds
  //sampleEnd
  }
  ```
  {kotlin-runnable="true" kotlin-min-compiler-version="1.5" validate="false"}
  
  We suggest replacing previously introduced companion functions, such as `Duration.seconds(Int)`, and deprecated top-level extensions
  like `Int.seconds` with new extensions in `Duration.Companion`.

  > Such a replacement may cause ambiguity between old top-level extensions and new companion extensions.
  > Be sure to use the wildcard import of the kotlin.time package – `import kotlin.time.*` – before doing automated migration.
  >
  {style="note"}


### 按 Regex 拆分为序列

The `Regex.splitToSequence(CharSequence)` and `CharSequence.splitToSequence(Regex)` functions are promoted to [Stable](components-stability.md).
They split the string around matches of the given regex, but return the result as a [Sequence](sequences.md) so that all operations on this result are executed lazily:

```kotlin
fun main() {
//sampleStart
    val colorsText = "green, red, brown&blue, orange, pink&green"
    val regex = "[,\\s]+".toRegex()
    val mixedColor = regex.splitToSequence(colorsText)
    // or
    // val mixedColor = colorsText.splitToSequence(regex)
        .onEach { println(it) }
        .firstOrNull { it.contains('&') }
    println(mixedColor) // "brown&blue"
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5" validate="false"}

### 整数的循环移位运算

In Kotlin 1.6.0, the `rotateLeft()` and `rotateRight()` functions for bit manipulations became [Stable](components-stability.md).
The functions rotate the binary representation of the number left or right by a specified number of bits:

```kotlin
fun main() {
//sampleStart
    val number: Short = 0b10001
    println(number
        .rotateRight(2)
        .toString(radix = 2)) // 100000000000100
    println(number
        .rotateLeft(2)
        .toString(radix = 2))  // 1000100
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

### JS 平台 replace() 与 replaceFirst() 的变更

Before Kotlin 1.6.0, the [`replace()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace.html)
and [`replaceFirst()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/replace-first.html) Regex functions behaved differently in Java and JS when the replacement string contained a group reference.
To make the behavior consistent across all target platforms, we've changed their implementation in JS.

Occurrences of `${name}` or `$index` in the replacement string are substituted with the subsequences corresponding to the captured groups with the specified index or a name:
* `$index` – the first digit after '$' is always treated as a part of the group reference. Subsequent digits are incorporated into the `index` only if they form a valid group reference.Only digits '0'–'9' are considered potential components of the group reference. Note that indexes of captured groups start from '1'.
  The group with index '0' stands for the whole match.
* `${name}` – the `name` can consist of Latin letters 'a'–'z', 'A'–'Z', or digits '0'–'9'. The first character must be a letter.

    > Named groups in replacement patterns are currently supported only on the JVM.
    >
    {style="note"}

* To include the succeeding character as a literal in the replacement string, use the backslash character `\`:

    ```kotlin
    fun main() {
    //sampleStart
        println(Regex("(.+)").replace("Kotlin", """\$ $1""")) // $ Kotlin
        println(Regex("(.+)").replaceFirst("1.6.0", """\\ $1""")) // \ 1.6.0
    //sampleEnd
    }
    ```
    {kotlin-runnable="true" kotlin-min-compiler-version="1.6"}

    You can use [`Regex.escapeReplacement()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/escape-replacement.html) if the replacement string has to be treated as a literal string.

### 既有 API 的改进

* Version 1.6.0 added the infix extension function for `Comparable.compareTo()`. You can now use the infix form for comparing two objects for order:

    ```kotlin
     class WrappedText(val text: String) : Comparable<WrappedText> {
         override fun compareTo(other: WrappedText): Int =
             this.text compareTo other.text
    }
    ```

* `Regex.replace()` in JS is now also not inline to unify its implementation across all platforms.
* The `compareTo()` and `equals()` String functions, as well as the `isBlank()` CharSequence function now behave in JS exactly the same way they do on the JVM.
  Previously there were deviations when it came to non-ASCII characters.

### 弃用项

In Kotlin 1.6.0, we're starting the deprecation cycle with a warning for some JS-only stdlib API.

#### concat()、 match() 与 matches() 字符串函数

* To concatenate the string with the string representation of a given other object, use `plus()` instead of `concat()`.
* To find all occurrences of a regular expression within the input, use `findAll()` of the Regex class instead of `String.match(regex: String)`.
* To check if the regular expression matches the entire input, use `matches()` of the Regex class instead of `String.matches(regex: String)`.

#### 采用比较函数对数组排序（sort()）

We've deprecated the `Array<out T>.sort()` function and the inline functions `ByteArray.sort()`, `ShortArray.sort()`,
`IntArray.sort()`, `LongArray.sort()`, `FloatArray.sort()`, `DoubleArray.sort()`, and `CharArray.sort()`, which sorted arrays following the order passed by the comparison function.
Use other standard library functions for array sorting.

See the [collection ordering](collection-ordering.md) section for reference.

## 工具

### Kover——Kotlin 的代码覆盖工具

> The Kover Gradle plugin is Experimental. We would appreciate your feedback on it in [GitHub](https://github.com/Kotlin/kotlinx-kover/issues).
>
{style="warning"}

With Kotlin 1.6.0, we're introducing Kover – a Gradle plugin for the [IntelliJ](https://github.com/JetBrains/intellij-coverage) and [JaCoCo](https://github.com/jacoco/jacoco) Kotlin code coverage agents.
It works with all language constructs, including inline functions.

Learn more about Kover on its [GitHub repository](https://github.com/Kotlin/kotlinx-kover) or in this video:

<video src="https://www.youtube.com/v/jNu5LY9HIbw" title="Kover – The Code Coverage Plugin"/>

## Coroutines 1.6.0-RC

`kotlinx.coroutines` [1.6.0-RC](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.6.0-RC) is out with 
multiple features and improvements:

* Support for the [new Kotlin/Native memory manager](#新版内存管理器预览)
* Introduction of dispatcher _views_ API, which allows limiting parallelism without creating additional threads
* Migrating from Java 6 to Java 8 target
* `kotlinx-coroutines-test` with the new reworked API and multiplatform support
* Introduction of [`CopyableThreadContextElement`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-copyable-thread-context-element/index.html),
  which gives coroutines a thread-safe write access to [`ThreadLocal`](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/ThreadLocal.html) variables

Learn more in the [changelog](https://github.com/Kotlin/kotlinx.coroutines/releases/tag/1.6.0-RC).

## 迁移到 Kotlin 1.6.0

IntelliJ IDEA and Android Studio will suggest updating the Kotlin plugin to 1.6.0 once it is available.

To migrate existing projects to Kotlin 1.6.0, change the Kotlin version to `1.6.0` and reimport your Gradle or Maven
project. [Learn how to update to Kotlin 1.6.0](releases.md#update-to-a-new-kotlin-version).

To start a new project with Kotlin 1.6.0, update the Kotlin plugin and run the Project Wizard from **File** | **New** |
**Project**.

The new command-line compiler is available for download on the [GitHub release page](https://github.com/JetBrains/kotlin/releases/tag/v1.6.0).

Kotlin 1.6.0 is a [feature release](kotlin-evolution-principles.md#language-and-tooling-releases) and can, therefore, bring changes that are incompatible with your code written for earlier versions of the language.
Find the detailed list of such changes in the [Compatibility Guide for Kotlin 1.6](compatibility-guide-16.md).
