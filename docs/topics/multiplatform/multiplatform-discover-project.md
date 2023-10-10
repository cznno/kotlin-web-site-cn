[//]: # (title: 了解多平台项目结构)

探索多平台项目的主要部分：

* [多平台插件](#多平台插件)
* [目标](#目标)
* [源代码集](#源代码集)
* [编译项](#编译项)

## 多平台插件

[创建多平台项目](multiplatform-library.md)时，
项目向导会自动在 `build.gradle(.kts`) 文件中应用 `kotlin-multiplatform` 插件。

也可以手动应用它。

> `kotlin-multiplatform` 插件适用于 Gradle %minGradleVersion% 或更高版本。 
>
{type="note"}

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
plugins {
    kotlin("multiplatform") version "%kotlinVersion%"
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
plugins {
    id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
}
```

</tab>
</tabs>

`kotlin-multiplatform` 插件可配置项目以创建可在多个平台上工作的应用程序或库，
并为在这些平台上构建做好准备。

在 `build.gradle(.kts`) 文件中，它在顶层创建 `kotlin` 扩展，
其中包括[目标](#目标)、[源代码集](#源代码集)与依赖项的配置。

## 目标

一个多平台项目针对以不同目标表示的多个平台。
目标是构建的一部分，负责为特定平台（例如 macOS、iOS或Android）构建、测试与打包应用程序。
请参阅[支持的平台](multiplatform-dsl-reference.md#目标)列表。

创建多平台项目时，会将目标添加到 `build.gradle(.kts`) 文件中的 `kotlin` 块中。

```kotlin
kotlin {
    jvm()
    js(IR) {
        browser {}
    }
 }
```

了解如何[手动设置目标](multiplatform-set-up-targets.md)。

## 源代码集

该项目包括带有 Kotlin 源代码集的 `src` 目录，
这些源代码集是 Kotlin 代码文件的集合，以及源代码集的资源、依赖与语言设置。
可以在 Kotlin 编译项中使用一个或多个源代码集目标平台。

每个源代码集目录都包含 Kotlin 代码文件（`kotlin` 目录）与 `resources`。
项目向导会为公共代码以及所有已添加目标的 `main` 与 `test` 编译项创建默认源代码集。

![源代码集](source-sets.png){width=300}

> 源代码集名称区分大小写。
>
{type="note"}

源代码集被添加到顶层 `kotlin` 块的 `sourceSets` 块中。 For example, this is the source sets
structure you get when creating a multiplatform library with the IntelliJ IDEA project wizard:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonMain by getting
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
            }
        }
        val jvmMain by getting
        val jvmTest by getting
        val jsMain by getting
        val jsTest by getting
        val nativeMain by getting
        val nativeTest by getting
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {

        }
        commonTest {
            dependencies {
                implementation kotlin('test')
            }
        }
        jvmMain {

        }
        jvmTest {

        }
        jsMain {

        }
        jsTest {

        }
        nativeMain {

        }
        nativeTest {

        }
    }
}
```

</tab>
</tabs>

源代码集形成一个层次结构，用于共享公共代码。
在多个目标之间共享的源代码集中，可以使用所有这些目标可用的特定于平台的语言特性与依赖。

例如，所有 Kotlin 原生特性都可以在 `desktopMain` 源代码集中可用，
该源代码集的目标是 Linux(`linuxX64`)、Windows(`mingwX64`) 与 macOS(`macosX64`) 平台。

![层次结构](manual-hierarchical-structure.png)

了解如何[构建源代码集的层次结构](multiplatform-share-on-platforms.md#对相似平台共享代码)。

## 编译项

每个目标可以具有一个或多个编译项，例如，用于生产与测试目的。

对于每个目标，默认编译项包括：

*   针对 JVM、JS 与原生目标的 `main` 与 `test`编译项。
*   针对 Android 目标的每个 [Android 构建变体](https://developer.android.com/studio/build/build-variants) 的编译。

![编译项](compilations.png)

每个编译都有默认的源代码集，其中包含特定于该编译的源代码与依赖。

了解如何[配置编译项](multiplatform-configure-compilations.md)。