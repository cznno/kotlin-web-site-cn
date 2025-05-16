[//]: # (title: Kotlin Gradle 插件中的编译器选项)

每个 Kotlin 的发行版本都包含对于以下目标代码的编译器：
JVM、JavaScript，以及[支持平台](native-overview.md#目标平台)的本地二进制文件。

这些编译器会在这些步骤中被调用：
* IDE，当你在你的 Kotlin 项目上点击**编译**或**运行**按钮时。
* Gradle，当你在控制台或者 IDE 上调用 `gradle build` 命令时。
* Maven，当你在控制台或者 IDE 上调用 `mvn compile` 或者 `mvn test-compile`命令时。

你也可以用命令行手动调用 Kotlin 编译器，
详见[使用命令行编译器](command-line.md)教程。

## 配置选项

Kotlin 编译器有一系列用于控制编译过程的参数。

The Gradle DSL allows comprehensive 
configuration of compiler options. It is available for [Kotlin Multiplatform](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html) and [JVM/Android](#面向-jvm) projects.

With the Gradle DSL, you can configure compiler options within the build script at three levels: 
* **[Extension level](#extension-level)**, in the `kotlin {}` block for all targets and shared source sets.
* **[Target level](#target-level)**, in the block for a specific target.
* **[Compilation unit level](#compilation-unit-level),** usually in a specific compilation task.

![Kotlin compiler options levels](compiler-options-levels.svg){width=700}

The settings at a higher level are used as a convention (default) for a lower level:

* Compiler options set at the extension level are the default for target-level options, including shared source sets 
  like `commonMain`, `nativeMain`, and `commonTest`.
* Compiler options set at the target level are the default for options at the compilation unit (task) level, 
  like `compileKotlinJvm` and `compileTestKotlinJvm` tasks.

In turn, configurations made at a lower level override related settings at a higher level:

* Task-level compiler options override related configurations at the target or the extension level.
* Target-level compiler options override related configurations at the extension level.

To find out which level of compiler arguments is applied to the compilation, use the `DEBUG` level of Gradle [logging](https://docs.gradle.org/current/userguide/logging.html).
For JVM and JS/WASM tasks, search for the `"Kotlin compiler args:"` string within the logs; for Native tasks,
search for the `"Arguments ="` string.

> If you're a third-party plugin author, it's best to apply your configuration on the project level to avoid
> overriding issues. You can use the new [Kotlin plugin DSL extension types](whatsnew21.md#new-api-for-kotlin-gradle-plugin-extensions) for this. It's recommended that you document this
> configuration on your side explicitly.
>
{style="tip"}

### Extension level

You can configure common compiler options for all the targets and shared source sets
in the `compilerOptions {}` block at the top level:

```kotlin
kotlin {
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}    
```

### Target level

You can configure compiler options for the JVM/Android target
in the `compilerOptions {}` block inside the `target {}` block:

```kotlin
kotlin {
    target { 
        compilerOptions {
            optIn.add("kotlin.RequiresOptIn")
        }
    }
}
```

In Kotlin Multiplatform projects, you can configure compiler options inside the
specific target. For example, `jvm { compilerOptions {}}`. For more information, see [Multiplatform Gradle DSL reference](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html).

### Compilation unit level

You can configure compiler options for a specific compilation unit or task in a `compilerOptions {}` 
block inside the task configuration:

```Kotlin
tasks.named<KotlinJvmCompile>("compileKotlin"){
    compilerOptions {
        optIn.add("kotlin.RequiresOptIn")
    }
}
```

You can also access and configure compiler options at a compilation unit level via `KotlinCompilation`:

```Kotlin
kotlin {
    target {
        val main by compilations.getting {
            compileTaskProvider.configure {
                compilerOptions {

                }
            }
        }
    }
}
```

If you want to configure a plugin of a target different from JVM/Android and [Kotlin Multiplatform](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html),
use the `compilerOptions {}` property of the corresponding Kotlin compilation task. The following examples
show how to set this configuration up in both Kotlin and Groovy DSLs:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.named("compileKotlin", org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask::class.java) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks.named('compileKotlin', org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class) {
    compilerOptions {
        apiVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.KOTLIN_2_0)
    }
}
```

</tab>
</tabs>

## 面向 JVM

[As explained before](#配置选项), you can define compiler options for your JVM/Android projects at the extension, target, and compilation unit levels (tasks).

Default JVM 环境下的编译任务，对于<!--
-->生产代码叫做 `compileKotlin`，而对于测试代码则叫做 `compileTestKotlin`。对于自定义源代码集（source set），这些任务命名遵循 `compile＜Name＞Kotlin` 模式。

You can see the list of Android compilation tasks by running the `gradlew tasks --all` command in the terminal
and searching for `compile*Kotlin` task names in the `Other tasks` group.

有几点是需要注意的：

* `android.kotlinOptions` 和 `kotlin.compilerOptions` 这两个配置会相互覆写。只有最新（即最下面）的一个会生效。
* `kotlin.compilerOptions` 会影响项目中所有 Kotlin 编译任务的配置。
* 对于那些应用到 `kotlin.compilerOptions` 的任务，你可以通过 `tasks.named<KotlinJvmCompile>("compileKotlin") { }`<!--
  -->（或者 `tasks.withType<KotlinJvmCompile>().configureEach { }`）来覆写配置。

## 面向 JavaScript

JavaScript 的编译任务，对于生产代码叫做 `compileKotlinJs`，对于测试代码叫做 `compileTestKotlinJs`。 对于自定义源代码集（source set），这些任务命名遵循 `compile＜Name＞KotlinJs` 模式。

要配置单个任务，请使用其名称：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ……

val compileKotlin: KotlinCompilationTask<*> by tasks

compileKotlin.compilerOptions.suppressWarnings.set(true)
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ……

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        suppressWarnings = true
    }
}
```

</tab>
</tabs>

请注意，对于 Gradle Kotlin DSL，首先从项目的 `tasks` 中获取任务。

相应地，为 JS 与公共目标使用类型 `Kotlin2JsCompile` 与 `KotlinCompileCommon`。

You can see the list of JavaScript compilation tasks by running the `gradlew tasks --all` command in the terminal
and searching for `compile*KotlinJS` task names in the `Other tasks` group.

## All Kotlin compilation tasks

你也可以在项目中对所有的 Kotlin 编译任务进行配置：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ……

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    compilerOptions { /*……*/ }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions { /*……*/ }
}
```

</tab>
</tabs>

## 所有编译器选项

这里列出了 Gradle 编译器的完整选项列表：

### 常规属性

| 名称              | 描述                                         |  可能的值                  | 默认值        |
|-------------------|--------------------------------------------|---------------------------|---------------|
| `optIn`           | 用于配置[选择加入的编译器参数](opt-in-requirements.md)的列表 | `listOf( /* opt-ins */ )` | `emptyList()` |
| `progressiveMode` | 启用[渐进式编译器模式](whatsnew13.md#渐进模式)               | `true`, `false`           | `false`       |
| `extraWarnings`   | Enables [additional declaration, expression, and type compiler checks](whatsnew21.md#extra-compiler-checks) that emit warnings if true | `true`, `false`           | `false`       |

### JVM 特有的属性

| 名称                      | 描述                                                                                                                                                                                                                                          | 可能的值                                                                                         | 默认值                      |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|-----------------------------|
| `javaParameters`          | 为方法参数生成 Java 1.8 反射的元数据                                                                                                                                                                                                          |                                                                                                  | false                       |
| `jvmTarget`               | 生成的 JVM 字节码的目标版本                                                                                                                                                                                                                   | "1.8"、 "9"、 "10"、 ……、 "22"、 "23"。另见[编译器选项的类型](#编译器选项的类型)                 | "%defaultJvmTargetVersion%" |
| `noJdk`                   |不要自动在类路径中包含 Java 运行时                                                                                                                                                                                                             |                                                                                                  | false                       |
| `jvmTargetValidationMode` | <list><li>验证 Kotlin 和 Java 之间 [JVM 目标的兼容性](gradle-configure-project.md#check-for-jvm-target-compatibility-of-related-compile-tasks)</li><li>该编译器选项属于 `KotlinCompile` 任务</li></list>                                      | `WARNING`, `ERROR`, `IGNORE`                                                                       | `ERROR`                     |

### JVM 与 JavaScript 的公共属性

| 名称 | 描述                                                                                           | 可能的值        | 默认值      |
|------|----------------------------------------------------------------------------------------------|----------------------------------------------------------------|--------------|
| `allWarningsAsErrors` | 任何警告都报告为错误                                                                                   |  | false |
| `suppressWarnings` | 不生成警告                                                                                        |  | false |
| `verbose` | 启用详细日志输出。仅在[已启用 Gradle debug 日志](https://docs.gradle.org/current/userguide/logging.html)时才有效 |  | false |
| `freeCompilerArgs` | 	附加编译器参数的列表。你也可以在这里使用实验性的`-X`参数。见[例](#通过-freecompilerargs-选项配置额外的参数的示例)。                     |  | [] || `apiVersion`      | Restrict the use of declarations to those from the specified version of bundled libraries | "1.8", "1.9", "2.0", "2.1", "2.2" (EXPERIMENTAL) |               |
| `apiVersion`      | Restrict the use of declarations to those from the specified version of bundled libraries | "1.8", "1.9", "2.0", "2.1", "2.2" (EXPERIMENTAL) |               |
| `languageVersion` | Provide source compatibility with the specified version of Kotlin                         | "1.8", "1.9", "2.0", "2.1", "2.2" (EXPERIMENTAL)  |               |

> 我们计划在今后的发行版本中将`freeCompilerArgs`选项弃用。如果你因此无法在 Kotlin Gradle DSL 中配置某些选项
> 请[提出一个 Issue](https://youtrack.jetbrains.com/newissue?project=kt)。
>
{style="warning"}

#### 通过 freeCompilerArgs 选项配置额外的参数的示例{initial-collapse-state="collapsed" collapsible="true"}

通过使用 `freeCompilerArgs` 属性来应用包括实验性参数在内的额外编译器参数。
可以在这个属性中加入一个单独的编译器参数或者一个编译器参数的列表。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

kotlin {
    compilerOptions {
        // Specifies the version of the Kotlin API and the JVM target
        apiVersion.set(KotlinVersion.%gradleLanguageVersion%)
        jvmTarget.set(JvmTarget.JVM_1_8)
        
        // 单个实验性参数
        freeCompilerArgs.add("-Xexport-kdoc")

        // 单个附加参数
        freeCompilerArgs.add("-Xno-param-assertions")

        // 参数列表
        freeCompilerArgs.addAll(
            listOf(
                "-Xno-receiver-assertions",
                "-Xno-call-assertions"
            )
        ) 
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        // Specifies the version of the Kotlin API and the JVM target
        apiVersion = KotlinVersion.%gradleLanguageVersion%
        jvmTarget = JvmTarget.JVM_1_8
        
        // 单个实验性参数
        freeCompilerArgs.add("-Xexport-kdoc")
        
        // 单个附加参数，可以是键值对
        freeCompilerArgs.add("-Xno-param-assertions")
        
        // 参数列表
        freeCompilerArgs.addAll(["-Xno-receiver-assertions", "-Xno-call-assertions"])
    }
}
```

</tab>
</tabs>

> The `freeCompilerArgs` attribute is available at the [extension](#extension-level), [target](#target-level), and [compilation unit (task)](#compilation-unit-level) levels.
>
{style="tip"} 

#### 设置 languageVersion 的示例 {initial-collapse-state="collapsed" collapsible="true"}

要设置语言的版本，请使用如下格式的语法：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    compilerOptions {
        languageVersion.set(org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%)
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
tasks
    .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask.class)
    .configureEach {
        compilerOptions.languageVersion =
            org.jetbrains.kotlin.gradle.dsl.KotlinVersion.%gradleLanguageVersion%
    }
```

</tab>
</tabs>

另见[编译器选项的类型](#编译器选项的类型)。

### JavaScript 特有的属性

| 名称 | 描述 | 可能的值 |默认值 |
|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| `friendModulesDisabled` | 禁用内部声明导出                                                                                                                                                                                                      |                                                                                                                                                                            | `false`                              |
| `main` | 指定是否在执行时调用 `main` 函数                                                                                                                                                                       | `JsMainFunctionExecutionMode.CALL`, `JsMainFunctionExecutionMode.NO_CALL`                                                                                                  | `JsMainFunctionExecutionMode.CALL` |
| `moduleKind` | 编译器生成的 JS 模块类型                                                                                                                                                                                          | `JsModuleKind.MODULE_AMD`, `JsModuleKind.MODULE_PLAIN`, `JsModuleKind.MODULE_ES`, `JsModuleKind.MODULE_COMMONJS`, `JsModuleKind.MODULE_UMD`                                | `null`                               |
| `sourceMap` | 生成源代码映射（source map）                                                                                                                                                                                                                      |                                                                                                                                                                            | `false`                              |
| `sourceMapEmbedSources` | 将源代码嵌入到源代码映射中                                                                                                                                                                                                   | `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_NEVER`, `JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_ALWAYS` | `null`                               |
| `sourceMapNamesPolicy` | 将 Kotlin 代码中声明的变量和函数添加到源代码映射中。详见[编译器引用](compiler-reference.md#source-map-names-policy-simple-names-fully-qualified-names-no)。 | `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_SIMPLE_NAMES`, `JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_NO` | `null`                               |
| `sourceMapPrefix` | 将指定前缀添加到源代码映射中的路径                                                                                                                                                                                      |                                                                                                                                                                            | `null`                               |
| `target` | 生成指定 ECMA 版本的 JS 文件                                                                                                                                                                                              | `"es5"`, `"es2015"`                                                                                                                                                            | `"es5"`                              |
| `useEsClasses` | Let generated JavaScript code use ES2015 classes. Enabled by default in case of ES2015 target usage                                                                                                                                                                                              |                                                                                                                                                                            | `null`                               |

### 编译器选项的类型

一些 `compilerOptions` 使用独有的类型来替代字符串类型

| 选项 | 类型 | 例子                                                                                              |
|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `jvmTarget`                        | [`JvmTarget`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JvmTarget.kt)                                     | `compilerOptions.jvmTarget.set(JvmTarget.JVM_11)`                                                    |
| `apiVersion` and `languageVersion` | [`KotlinVersion`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/KotlinVersion.kt)                             | `compilerOptions.languageVersion.set(KotlinVersion.%gradleLanguageVersion%)`                         |
| `main`                             | [`JsMainFunctionExecutionMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsMainFunctionExecutionMode.kt) | `compilerOptions.main.set(JsMainFunctionExecutionMode.NO_CALL)`                                      |
| `moduleKind`                       | [`JsModuleKind`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsModuleKind.kt)                               | `compilerOptions.moduleKind.set(JsModuleKind.MODULE_ES)`                                             |
| `sourceMapEmbedSources`            | [`JsSourceMapEmbedMode`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapEmbedMode.kt)               | `compilerOptions.sourceMapEmbedSources.set(JsSourceMapEmbedMode.SOURCE_MAP_SOURCE_CONTENT_INLINING)` |
| `sourceMapNamesPolicy`             | [`JsSourceMapNamesPolicy`](https://github.com/JetBrains/kotlin/blob/master/libraries/tools/kotlin-gradle-compiler-types/src/generated/kotlin/org/jetbrains/kotlin/gradle/dsl/JsSourceMapNamesPolicy.kt)           | `compilerOptions.sourceMapNamesPolicy.set(JsSourceMapNamesPolicy.SOURCE_MAP_NAMES_POLICY_FQ_NAMES)`  |

## 下一步做什么？

了解更多关于：
* [Kotlin Multiplatform DSL reference](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-dsl-reference.html).
* [增量编译、缓存支持、构建日志以及 Kotlin 守护进程](gradle-compilation-and-caches.md)。
* [Gradle 的基础知识和特性](https://docs.gradle.org/current/userguide/userguide.html)。
* [对 Gradle 插件变体的支持](gradle-plugin-variants.md)。
