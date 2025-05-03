[//]: # (title: 选择加入要求)

Kotlin 标准库提供了一种机制，用于要求并明确同意使用某些 API 元素。
通过这种机制，库作者可以将需要选择加入的特定条件告知用户，
例如，当某个 API 处于实验状态，并且将来可能会更改时。

为了保护用户，编译器会对这些条件发出警告，并要求用户在使用 API 之前选择加入。

## Opt in to API

如果库作者将其库的 API 声明标记为**[要求选择加入](#require-opt-in-to-use-api)**，
必须在代码中使用它之前明确表示同意。
有多种方式可以选择加入。我们建议选择最适合实际情况的方式。

### Opt in locally

To opt in to a specific API element when you use it in your code, use the [`@OptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-opt-in/)
annotation with a reference to the experimental API marker. For example, suppose you want to use the `DateProvider` class,
which requires an opt-in:

```kotlin
// 库代码
@RequiresOptIn(message = "This API is experimental. It could change in the future without notice.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime

@MyDateTime
// 要求选择加入的类
class DateProvider
```

In your code, before declaring a function that uses the `DateProvider` class, add the `@OptIn` annotation with
a reference to the `MyDateTime` annotation class:

```kotlin
// 客户端代码
@OptIn(MyDateTime::class)

// Uses DateProvider
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

It's important to note that with this approach, if the `getDate()` function is called elsewhere in your code or used by 
another developer, no opt-in is required:

```kotlin
// Client code
@OptIn(MyDateTime::class)

// Uses DateProvider
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    // OK: No opt-in is required
    println(getDate()) 
}
```

The opt-in requirement is not propagated, which means others might unknowingly use experimental APIs. To avoid this, it
is safer to propagate the opt-in requirements.

#### Propagate opt-in requirements

在代码中使用供第三方使用的 API（例如库）时，你也可以把其选择加入的要求传播到<!--
-->自己的 API。为此，请在你的声明上标注与该库使用的相同**[要求选择加入的注解](#创建选择加入要求的注解)**
。

For example, before declaring a function that uses the `DateProvider` class, add the `@MyDateTime` annotation:

```kotlin
// Client code
@MyDateTime
fun getDate(): Date {
    // OK: the function requires opt-in as well
    val dateProvider: DateProvider
    // ...
}

fun displayDate() {
    println(getDate())
    // Error: getDate() requires opt-in
}
```

如本例所示，带注释的函数看起来是 `@MyDateTime` API 的一部分。
这种选择加入会将选择加入的要求传播到 `getDate()` 函数的用户。

If the signature of an API element includes a type that requires opt-in, the signature itself must also require opt-in.
Otherwise, if an API element doesn't require opt-in, but its signature includes a type that does, using it triggers an error.

```kotlin
// Client code
@MyDateTime
fun getDate(dateProvider: DateProvider = DateProvider()): Date

@MyDateTime
fun displayDate() {
    // OK: the function requires opt-in as well
    println(getDate())
}
```

Similarly, if you apply `@OptIn` to a declaration whose signature includes a type that requires opt-in, the opt-in requirement
still propagates:

```kotlin
//客户端代码
@OptIn(MyDateTime::class)
// Propagates opt-in due to DateProvider in the signature
fun getDate(dateProvider: DateProvider = DateProvider()): Date

fun displayDate() {
    println(getDate())
    // Error: getDate() requires opt-in
}
```

When propagating opt-in requirements, it's important to understand that if an API element becomes stable and no longer
has an opt-in requirement, any other API elements that still have the opt-in requirement remain experimental. For example,
suppose a library author removes the opt-in requirement for the `getDate()` function because it's now stable:

```kotlin
// Library code
// No opt-in requirement
fun getDate(): Date {
    val dateProvider: DateProvider
    // ...
}
```

If you use the `displayDate()` function without removing the opt-in annotation, it remains experimental even though the 
opt-in is no longer needed:

```kotlin
// Client code

// Still experimental!
@MyDateTime 
fun displayDate() {
    // Uses a stable library function
    println(getDate())
}
```

#### Opt in to multiple APIs

To opt in to multiple APIs, mark the declaration with all their opt-in requirement annotations. For example:

```kotlin
@ExperimentalCoroutinesApi
@FlowPreview
```

Or alternatively with `@OptIn`:

```kotlin
@OptIn(ExperimentalCoroutinesApi::class, FlowPreview::class)
```

### Opt in a file

要在一个文件的所有函数和类中使用要求选择加入的 API，请在文件的顶部，
文件包说明和导入声明前添加文件级注释 `@file:OptIn`。

 ```kotlin
 //客户端代码
 @file:OptIn(MyDateTime::class)
 ```

### Opt in a module

> The `-opt-in` compiler option is available since Kotlin 1.6.0. For earlier Kotlin versions, use `-Xopt-in`.
>
{style="note"}

If you don't want to annotate every usage of APIs that require opt-in, you can opt in to them for your whole module.
To opt in to using an API in a module, compile it with the argument `-opt-in`,
specifying the fully qualified name of the opt-in requirement annotation of the API you use: `-opt-in=org.mylibrary.OptInAnnotation`.
Compiling with this argument has the same effect as if every declaration in the module has the annotation`@OptIn(OptInAnnotation::class)`.

如果使用 Gradle 构建模块，可以添加如下参数：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions.optIn.add("org.mylibrary.OptInAnnotation")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        optIn.add('org.mylibrary.OptInAnnotation')
    }
}
```

</tab>
</tabs>

如果你的 Gradle 模块是多平台模块，请使用 `optIn` 方法：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
sourceSets {
    all {
        languageSettings.optIn("org.mylibrary.OptInAnnotation")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
sourceSets {
    all {
        languageSettings {
            optIn('org.mylibrary.OptInAnnotation')
        }
    }
}
```

</tab>
</tabs>

对于 Maven，请使用以下内容：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-maven-plugin</artifactId>
            <version>${kotlin.version}</version>
            <executions>...</executions>
            <configuration>
                <args>
                    <arg>-opt-in=org.mylibrary.OptInAnnotation</arg>                    
                </args>
            </configuration>
        </plugin>
    </plugins>
</build>
```

要在模块级别选择加入多个 API，请为每个要求选择加入的 API 添加以上描述的参数之一。

### Opt in to inherit from a class or interface

Sometimes, a library author provides an API but wants to require users to explicitly opt in before they can extend it. 
For example, the library API may be stable for use but not for inheritance, as it might be extended in the future with 
new abstract functions. Library authors can enforce this by marking [open](inheritance.md) or [abstract classes](classes.md#抽象类) and [non-functional interfaces](interfaces.md)
with the [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) annotation.

To opt in to use such an API element and extend it in your code, use the `@SubclassOptInRequired` annotation
with a reference to the annotation class. For example, suppose you want to use the `CoreLibraryApi` interface, which 
requires an opt-in:

```kotlin
// Library code
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// An interface requiring opt-in to extend
interface CoreLibraryApi 
```

In your code, before creating a new interface that inherits from the `CoreLibraryApi` interface, add the `@SubclassOptInRequired`
annotation with a reference to the `UnstableApi` annotation class:

```kotlin
// Client code
@SubclassOptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi
```

Note that when you use the `@SubclassOptInRequired` annotation on a class, the opt-in requirement is not propagated to 
any [inner or nested classes](nested-classes.md):

```kotlin
// Library code
@RequiresOptIn
annotation class ExperimentalFeature

@SubclassOptInRequired(ExperimentalFeature::class)
open class FileSystem {
    open class File
}

// Client code

// Opt-in is required
class NetworkFileSystem : FileSystem()

// Nested class
// No opt-in required
class TextFile : FileSystem.File()
```

Alternatively, you can opt in by using the `@OptIn` annotation. You can also use an experimental marker annotation
to propagate the requirement further to any uses of the class in your code:

```kotlin
// Client code
// With @OptIn annotation
@OptInRequired(UnstableApi::class)
interface SomeImplementation : CoreLibraryApi

// With annotation referencing annotation class
// Propagates the opt-in requirement further
@UnstableApi
interface SomeImplementation : CoreLibraryApi
```

## Require opt-in to use API

You can require users of your library to opt in before they are able to use your API. Additionally, you can inform users
about any special conditions for using your API until you decide to remove the opt-in requirement.

### 创建选择加入要求的注解

如需让用户选择加入才能使用你的模块 API，请创建一个注解类，作为**要求选择加入的注解**。
这个类必须使用 [`@RequiresOptIn`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/) 标注：

```kotlin
@RequiresOptIn
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class MyDateTime
```

要求选择加入的注解必须满足几个要求。它们必须具备：

* `BINARY` 或 `RUNTIME` [retention](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-retention/)。
* `EXPRESSION`、 `FILE`、 `TYPE` 或 `TYPE_PARAMETER` 作为 [target](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.annotation/-target/)。
* 没有参数。

选择加入的要求可以具有以下两个严格[级别](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-requires-opt-in/-level/)之一：

* `RequiresOptIn.Level.ERROR`。选择加入是强制性的。 否则，使用标记 API 的代码将无法编译。 这是默认级别。
* `RequiresOptIn.Level.WARNING`。选择加入不是强制性的，而是建议使用的。 没有它，编译器会发出警告。

要设置所需的级别，请指定 `@RequiresOptIn` 注解的 `level` 参数。

另外，你可以向 API 用户提供一个 `message`。编译器会将此消息显示给尝试使用该 API
但未选择加入的用户：

```kotlin
@RequiresOptIn(level = RequiresOptIn.Level.WARNING, message = "This API is experimental. It can be incompatibly changed in the future.")
@Retention(AnnotationRetention.BINARY)
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
annotation class ExperimentalDateTime
```

如果你发布了多个需要选择加入的独立功能，请为每个功能声明一个注解。
这让你的客户可以更安全地使用你的 API，因为他们只能使用其明确接受的功能。
这也意味着你可以独立地从功能中删除选择加入的要求，which makes your API easier <!--
-->to maintain.

### 标记 API 元素

要在使用 API 时要求选择加入，请给它的声明添加要求选择加入的注解。

```kotlin
@MyDateTime
class DateProvider

@MyDateTime
fun getTime(): Time {}
```

Note that for some language elements, an opt-in requirement annotation is not applicable:

* You can't annotate a backing field or a getter of a property, just the property itself.
* You can't annotate a local variable or a value parameter.

## Require opt-in to extend API

There may be times when you want more granular control over which specific parts of your API can be used and
extended. For example, when you have some API that is stable to use but:

* **Unstable to implement** due to ongoing evolution, such as when you have a family of interfaces where you expect to add new abstract functions without default implementations.
* **Delicate or fragile to implement**, such as individual functions that need to behave in a coordinated manner.
* **Has a contract that may be weakened in the future** in a backward-incompatible way for external implementations, such as changing an input parameter `T` to a nullable version `T?` where the code didn't previously consider `null` values.

In such cases, you can require users to opt in to your API before they can extend it further. Users can extend your API 
by inheriting from the API or implementing abstract functions. By using the [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/) annotation,
you can enforce this requirement to opt-in for [open](inheritance.md) or [abstract classes](classes.md#抽象类) and [non-functional interfaces](interfaces.md).

To add the opt-in requirement to an API element, use the [`@SubclassOptInRequired`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-subclass-opt-in-required/)
annotation with a reference to the annotation class:

```kotlin
@RequiresOptIn(
 level = RequiresOptIn.Level.WARNING,
 message = "Interfaces in this library are experimental"
)
annotation class UnstableApi()

@SubclassOptInRequired(UnstableApi::class)
// An interface requiring opt-in to extend
interface CoreLibraryApi 
```

Note that when you use the `@SubclassOptInRequired` annotation to require opt-in, the requirement is not propagated to
any [inner or nested classes](nested-classes.md).

For a real-world example of how to use the `@SubclassOptInRequired` annotation in your API, check out the [`SharedFlow`](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)
interface in the `kotlinx.coroutines` library.

## 稳定前 API 的选择加入要求

如果要求选择加入尚未稳定的特性，请仔细处理 API 由实验状态到稳定状态的转换，
以避免破坏客户端代码。

当稳定前 API 稳定之后并以稳定状态发布后，请从你的声明中删除要求选择加入<!--
-->的注解。 客户就可以不受限制地使用它们。但是，你应该将注解类留在<!--
-->模块中，以便与现有的客户代码保持兼容。

为了鼓励 API 用户通过从代码中删除任何注解并重新编译来更新其模块，请将注解标记为
[`@Deprecated`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-deprecated/) 并在弃用 message 中提供说明。

```kotlin
@Deprecated("This opt-in requirement is not used anymore. Remove its usages from your code.")
@RequiresOptIn
annotation class ExperimentalDateTime
```
