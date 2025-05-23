[//]: # (title: Kotlin 1.5.20 的新特性)

_[发布于：2021-06-24](releases.md#版本发布详情)_

Kotlin 1.5.20 has fixes for issues discovered in the new features of 1.5.0, and it also includes various tooling improvements.

You can find an overview of the changes in the [release blog post](https://blog.jetbrains.com/kotlin/2021/06/kotlin-1-5-20-released/)
and this video:

<video src="https://www.youtube.com/v/SV8CgSXQe44" title="Kotlin 1.5.20"/>

## Kotlin/JVM

Kotlin 1.5.20 is receiving the following updates on the JVM platform: 
* [通过 invokedynamic 字符串连接](#通过-invokedynamic-字符串连接)
* [JSpecify 可空性注解的支持](#jspecify-可空性注解的支持)
* [支持在 Kotlin 与 Java 代码都有的模块中调用 Java 的 Lombok 所生成代码](#支持在-kotlin-与-java-代码都有的模块中调用-java-的-lombok-所生成代码)

### 通过 invokedynamic 字符串连接

Kotlin 1.5.20 compiles string concatenations into [dynamic invocations](https://docs.oracle.com/javase/7/docs/technotes/guides/vm/multiple-language-support.html#invokedynamic)
(`invokedynamic`) on JVM 9+ targets, thereby keeping up with modern Java versions.
More precisely, it uses [`StringConcatFactory.makeConcatWithConstants()`](https://docs.oracle.com/javase/9/docs/api/java/lang/invoke/StringConcatFactory.html#makeConcatWithConstants-java.lang.invoke.MethodHandles.Lookup-java.lang.String-java.lang.invoke.MethodType-java.lang.String-java.lang.Object...-)
for string concatenation.

To switch back to concatenation via [`StringBuilder.append()`](https://docs.oracle.com/javase/9/docs/api/java/lang/StringBuilder.html#append-java.lang.String-)
used in previous versions, add the compiler option `-Xstring-concat=inline`.

Learn how to add compiler options in [Gradle](gradle-compiler-options.md), [Maven](maven.md#指定编译器选项), and the [command-line compiler](compiler-reference.md#编译器选项).

### JSpecify 可空性注解的支持

The Kotlin compiler can read various types of [nullability annotations](java-interop.md#可空性注解) to pass
nullability information from Java to Kotlin. Version 1.5.20 introduces support for the [JSpecify project](https://jspecify.dev/),
which includes the standard unified set of Java nullness annotations.

With JSpecify, you can provide more detailed nullability information to help Kotlin keep null-safety interoperating with
Java. You can set default nullability for the declaration, package, or module scope, specify parametric nullability,
and more. You can find more details about this in the [JSpecify user guide](https://jspecify.dev/docs/user-guide).

Here is the example of how Kotlin can handle JSpecify annotations:

```java
// JavaClass.java
import org.jspecify.nullness.*;

@NullMarked
public class JavaClass {
  public String notNullableString() { return ""; }
  public @Nullable String nullableString() { return ""; }
}
```

```kotlin
// Test.kt
fun kotlinFun() = with(JavaClass()) {
  notNullableString().length // OK
  nullableString().length    // Warning: receiver nullability mismatch
}
```

In 1.5.20, all nullability mismatches according to the JSpecify-provided nullability information are reported as warnings.
Use the `-Xjspecify-annotations=strict` and `-Xtype-enhancement-improvements-strict-mode` compiler options to enable
strict mode (with error reporting) when working with JSpecify.
Please note that the JSpecify project is under active development. Its API and implementation can change significantly at any time.

[Learn more about null-safety and platform types](java-interop.md#空安全与平台类型).

### 支持在 Kotlin 与 Java 代码都有的模块中调用 Java 的 Lombok 所生成代码

> The Lombok compiler plugin is [Experimental](components-stability.md).
> It may be dropped or changed at any time. Use it only for evaluation purposes.
> We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-7112).
>
{style="warning"}

Kotlin 1.5.20 introduces an experimental [Lombok compiler plugin](lombok.md). This plugin makes it possible to generate
and use Java's [Lombok](https://projectlombok.org/) declarations within modules that have Kotlin and Java code. Lombok
annotations work only in Java sources and are ignored if you use them in Kotlin code.

The plugin supports the following annotations:
* `@Getter`, `@Setter`
* `@NoArgsConstructor`, `@RequiredArgsConstructor`, and `@AllArgsConstructor`
* `@Data`
* `@With`
* `@Value`

We're continuing to work on this plugin. To find out the detailed current state, visit the [Lombok compiler plugin's README](https://github.com/JetBrains/kotlin/tree/master/plugins/lombok).

Currently, we don't have plans to support the `@Builder` annotation. However, we can consider this if you vote
for [`@Builder` in YouTrack](https://youtrack.jetbrains.com/issue/KT-46959).

[Learn how to configure the Lombok compiler plugin](lombok.md#gradle).

## Kotlin/Native

Kotlin/Native 1.5.20 offers a preview of the new feature and the tooling improvements:

* [将 KDoc 注释导出到所生成的 Objective-C 头文件的选择加入项 ](#将-kdoc-注释导出到所生成的-objective-c-头文件的选择加入项 )
* [编译器 bug 修复](#编译器-bug-修复)
* [提高了同一数组内 Array.copyInto() 的性能](#提高了同一数组内-array-copyinto-的性能)

### 将 KDoc 注释导出到所生成的 Objective-C 头文件的选择加入项 

> The ability to export KDoc comments to generated Objective-C headers is [Experimental](components-stability.md).
> It may be dropped or changed at any time.
> Opt-in is required (see the details below), and you should use it only for evaluation purposes.
> We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-38600).
>
{style="warning"}

You can now set the Kotlin/Native compiler to export the [documentation comments (KDoc)](kotlin-doc.md) from Kotlin code
to the Objective-C frameworks generated from it, making them visible to the frameworks' consumers.

For example, the following Kotlin code with KDoc:

```kotlin
/**
 * Prints the sum of the arguments.
 * Properly handles the case when the sum doesn't fit in 32-bit integer.
 */
fun printSum(a: Int, b: Int) = println(a.toLong() + b)
```

produces the following Objective-C headers:

```objc
/**
 * Prints the sum of the arguments.
 * Properly handles the case when the sum doesn't fit in 32-bit integer.
 */
+ (void)printSumA:(int32_t)a b:(int32_t)b __attribute__((swift_name("printSum(a:b:)")));
```

This also works well with Swift.

To try out this ability to export KDoc comments to Objective-C headers, use the `-Xexport-kdoc` compiler option. Add the
following lines to `build.gradle(.kts)` of the Gradle projects you want to export comments from:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget> {
        compilations.get("main").kotlinOptions.freeCompilerArgs += "-Xexport-kdoc"
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    targets.withType(org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget) {
        compilations.get("main").kotlinOptions.freeCompilerArgs += "-Xexport-kdoc"
    }
}
```

</tab>
</tabs>

We would be very grateful if you would share your feedback with us using this [YouTrack ticket](https://youtrack.jetbrains.com/issue/KT-38600).

### 编译器 bug 修复

The Kotlin/Native compiler has received multiple bug fixes in 1.5.20. You can find the complete list in the [changelog](https://github.com/JetBrains/kotlin/releases/tag/v1.5.20).

There is an important bug fix that affects compatibility: in previous versions, string constants that contained incorrect
UTF [surrogate pairs](https://en.wikipedia.org/wiki/Universal_Character_Set_characters#Surrogates) were losing their
values during compilation. Now such values are preserved. Application developers can safely update to 1.5.20 – nothing
will break. However, libraries compiled with 1.5.20 are incompatible with earlier compiler versions.
See [this YouTrack issue](https://youtrack.jetbrains.com/issue/KT-33175) for details.

### 提高了同一数组内 Array.copyInto() 的性能

We've improved the way `Array.copyInto()` works when its source and destination are the same array. Now such operations
finish up to 20 times faster (depending on the number of objects being copied) due to memory management optimizations
for this use case.

## Kotlin/JS

With 1.5.20, we're publishing a guide that will help you migrate your projects to the new [IR-based backend](js-ir-compiler.md)
for Kotlin/JS.

### JS IR 后端迁移指南

The new [JS IR 后端迁移指南](js-ir-migration.md) identifies issues you may encounter during migration
and provides solutions for them. If you find any issues that aren't covered in the guide, please report them to our [issue tracker](http://kotl.in/issue).

## Gradle

Kotlin 1.5.20 introduces the following features that can improve the Gradle experience:

* [在 kapt 中缓存注解处理器的类加载器](#在-kapt-中缓存注解处理器的类加载器)
* [弃用 `kotlin.parallel.tasks.in.project` 构建属性](#弃用-kotlin-parallel-tasks-in-project-构建属性)

### 在 kapt 中缓存注解处理器的类加载器

> 在 kapt 中缓存注解处理器的类加载器 is [Experimental](components-stability.md).
> It may be dropped or changed at any time. Use it only for evaluation purposes.
> We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-28901).
>
{style="warning"}

There is now a new experimental feature that makes it possible to cache the classloaders of annotation processors in [kapt](kapt.md).
This feature can increase the speed of kapt for consecutive Gradle runs.

To enable this feature, use the following properties in your `gradle.properties` file:

```none
# positive value will enable caching
# use the same value as the number of modules that use kapt
kapt.classloaders.cache.size=5

# disable for caching to work
kapt.include.compile.classpath=false
```

Learn more about [kapt](kapt.md).

### 弃用 kotlin.parallel.tasks.in.project 构建属性

With this release, Kotlin parallel compilation is controlled by the [Gradle parallel execution flag `--parallel`](https://docs.gradle.org/current/userguide/performance.html#parallel_execution).
Using this flag, Gradle executes tasks concurrently, increasing the speed of compiling tasks and utilizing the resources
more efficiently.

You no longer need to use the `kotlin.parallel.tasks.in.project` property. This property has been deprecated and will be
removed in the next major release.

## 标准库

Kotlin 1.5.20 changes the platform-specific implementations of several functions for working with characters and as a
result brings unification across platforms:
* [Kotlin/Native 与 Kotlin/JS 的 Char.digitToInt() 支持所有 Unicode 数字](#kotlin-native-与-kotlin-js-的-char-digittoint-支持所有-unicode-数字)。
* [跨平台统一 Char.isLowerCase()/isUpperCase() 的实现](#跨平台统一-char-islowercase-isuppercase-的实现)。

### Kotlin/Native 与 Kotlin/JS 的 Char.digitToInt() 支持所有 Unicode 数字

[`Char.digitToInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/digit-to-int.html) returns the numeric
value of the decimal digit that the character represents. Before 1.5.20, the function supported all Unicode digit characters
only for Kotlin/JVM: implementations on the Native and JS platforms supported only ASCII digits.

From now, both with Kotlin/Native and Kotlin/JS, you can call `Char.digitToInt()` on any Unicode digit character and get
its numeric representation.

```kotlin
fun main() {
//sampleStart
    val ten = '\u0661'.digitToInt() + '\u0039'.digitToInt() // ARABIC-INDIC DIGIT ONE + DIGIT NINE
    println(ten)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}


### 跨平台统一 Char.isLowerCase()/isUpperCase() 的实现

The functions [`Char.isUpperCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-upper-case.html) and
[`Char.isLowerCase()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/is-lower-case.html) return a boolean value
depending on the case of the character. For Kotlin/JVM, the implementation checks both the `General_Category` and the
`Other_Uppercase`/`Other_Lowercase` [Unicode properties](https://en.wikipedia.org/wiki/Unicode_character_property).

Prior to 1.5.20, implementations for other platforms worked differently and considered only the general category.
In 1.5.20, implementations are unified across platforms and use both properties to determine the character case:

```kotlin
fun main() {
//sampleStart
    val latinCapitalA = 'A' // has "Lu" general category
    val circledLatinCapitalA = 'Ⓐ' // has "Other_Uppercase" property
    println(latinCapitalA.isUpperCase() && circledLatinCapitalA.isUpperCase())
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

