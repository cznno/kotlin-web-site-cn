[//]: # (title: 多平台 Gradle DSL 参考)

Kotlin 多平台 Gradle 插件是用于创建 [Kotlin 多平台](multiplatform.md)项目的工具。
这里我们提供了它的参考；在为 Kotlin 多平台项目编写 Gradle 构建脚本时，
用它作提醒。 Learn the [concepts of Kotlin Multiplatform projects, how to create and configure them](multiplatform-get-started.md).

## id 与版本

Kotlin 多平台 Gradle 插件的全限定名是 `org.jetbrains.kotlin.multiplatform`。
如果你使用 Kotlin Gradle DSL，那么你可以通过 `kotlin("multiplatform")` 来应用插件。
插件版本与 Kotlin 发行版本相匹配。最新的版本是：%kotlinVersion%。

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

## 顶层块

`kotlin` 是在 Gradle 构建脚本中用于配置多平台项目的顶层块。
`kotlin` 块内，你可以使用以下块：

| **块**|**介绍**                                                                                                          |
|------------------|--------------------------------------------------------------------------------------------------------------------------|
| _\<目标名称\>_ | 声明项目的特定目标，所有可用的目标名称已陈列在[目标](#目标)部分中. |
| `targets`        | 项目的所有目标。                                                                                              |
| `presets`        | 所有预定义的目标。使用这个同时[配置多个预定义目标](#目标)。                        |
| `sourceSets`     | 配置预定义和声明自定义项目的[源代码集](#源代码集)。|

## 目标

_目标_ 是构建的一部分，负责构建编译、测试、以及针对某个<!--
-->已支持平台打包软件。 Kotlin provides target presets for each platform. See how to [use a target preset](multiplatform-set-up-targets.md).

Each target can have one or more [compilations](#编译项). In addition to default compilations for
test and production purposes, you can [create custom compilations](multiplatform-configure-compilations.md#创建自定义编译项).

多平台项目的目标<!--
-->在 `kotlin` 块中的相应代码块中描述，例如：`jvm`、`android` 以及 `iosArm64`。
以下是可用目标的完整列表：

<table>
    <tr>
        <th>Target platform</th>
        <th>Target preset</th>
        <th>Comments</th>
    </tr>
    <tr>
        <td>Kotlin/JVM</td>
        <td><code>jvm</code></td>
        <td></td>
    </tr>
    <tr>
        <td>Kotlin/JS</td>
        <td><code>js</code></td>
        <td>
            <p>Select the execution environment:</p>
            <list>
                <li><code>browser {}</code> for applications running in the browser.</li>
                <li><code>nodejs {}</code> for applications running on Node.js.</li>
            </list>
            <p>Learn more in <a href="js-project-setup.md#执行环境">Setting up a Kotlin/JS project</a>.</p>
        </td>
    </tr>
    <tr>
        <td>Kotlin/Native</td>
        <td></td>
        <td>
            <p>Learn about currently supported targets for the macOS, Linux, and Windows hosts in <a href="native-target-support.md">Kotlin/Native target support</a>.</p>
        </td>
    </tr>
    <tr>
        <td>Android applications and libraries</td>
        <td><code>android</code></td>
        <td>
            <p>Manually apply an Android Gradle plugin: <code>com.android.application</code> or <code>com.android.library</code>.</p>
            <p>You can only create one Android target per Gradle subproject.</p>
        </td>
    </tr>
</table>

> A target that is not supported by the current host is ignored during building and, therefore, not published.
>
{type="note"}

```groovy
kotlin {
    jvm()
    iosX64()
    macosX64()
    js().browser()
}
```

目标的配置项可以包含这两个部分：

* 可用于所有目标的[公共目标配置](#公共目标配置)。
* 目标特定的配置项。

Each target can have one or more [compilations](#编译项).

### 公共目标配置

In any target block, you can use the following declarations:

| **Name**            | **Description**                                                                                                                                   | 
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `attributes`        | Attributes used for [disambiguating targets](multiplatform-set-up-targets.md#区分一个平台的多个目标) for a single platform. |
| `preset`            | The preset that the target has been created from, if any.                                                                                         |
| `platformType`      | Designates the Kotlin platform of this target. Available values: `jvm`, `androidJvm`, `js`, `native`, `common`.                                   |
| `artifactsTaskName` | The name of the task that builds the resulting artifacts of this target.                                                                          |
| `components`        | The components used to setup Gradle publications.                                                                                                 |

### JVM 目标

In addition to [common target configuration](#公共目标配置), `jvm` targets have a specific function:

| **Name**     | **Description**                                           | 
|--------------|-----------------------------------------------------------|
| `withJava()` | Includes Java sources into the JVM target's compilations. |

Use this function for projects that contain both Java and Kotlin source files. Note that the default source directories for Java sources
don't follow the Java plugin's defaults. Instead, they are derived from the Kotlin source sets. For example, if the JVM target
has the default name `jvm`, the paths are `src/jvmMain/java` (for production Java sources) and `src/jvmTest/java` for test Java sources.
Learn more about [Java sources in JVM compilations](multiplatform-configure-compilations.md#use-java-sources-in-jvm-compilations).

```kotlin
kotlin {
    jvm {
        withJava()
    } 
}
```

### JavaScript 目标

The `js` block describes the configuration of JavaScript targets. It can contain one of two blocks depending on the target execution environment:

| **Name**  | **Description**                      | 
|-----------|--------------------------------------|
| `browser` | Configuration of the browser target. |
| `nodejs`  | Configuration of the Node.js target. |

Learn more about [configuring Kotlin/JS projects](js-project-setup.md).

#### Browser

`browser` can contain the following configuration blocks:

| **Name**       | **Description**                                                            | 
|----------------|----------------------------------------------------------------------------|
| `testRuns`     | Configuration of test execution.                                           |
| `runTask`      | Configuration of project running.                                          |
| `webpackTask`  | Configuration of project bundling with [Webpack](https://webpack.js.org/). |
| `dceTask`      | Configuration of [Dead Code Elimination](javascript-dce.md).               |
| `distribution` | Path to output files.                                                      |

```kotlin
kotlin {
    js().browser {
        webpackTask { /* ... */ }
        testRuns { /* ... */ }
        dceTask {
            keep("myKotlinJsApplication.org.example.keepFromDce")
        }
        distribution {
            directory = File("$projectDir/customdir/")
        }
    }
}
```

#### Node.js

`nodejs` can contain configurations of test and run tasks:

| **Name**   | **Description**                   | 
|------------|-----------------------------------|
| `testRuns` | Configuration of test execution.  |
| `runTask`  | Configuration of project running. |

```kotlin
kotlin {
    js().nodejs {
        runTask { /* ... */ }
        testRuns { /* ... */ }
    }
}
```

### 原生目标

For native targets, the following specific blocks are available:

| **Name**    | **Description**                                          | 
|-------------|----------------------------------------------------------|
| `binaries`  | Configuration of [binaries](#binaries) to produce.       |
| `cinterops` | Configuration of [interop with C libraries](#cinterops). |

#### Binaries

There are the following kinds of binaries:

| **Name**     | **Description**        | 
|--------------|------------------------|
| `executable` | Product executable.    |
| `test`       | Test executable.       |
| `sharedLib`  | Shared library.        |
| `staticLib`  | Static library.        |
| `framework`  | Objective-C framework. |

```kotlin
kotlin {
    linuxX64 { // Use your target instead.
        binaries {
            executable {
                // Binary configuration.
            }
        }
    }
}
```

For binary configuration, the following parameters are available:

| **Name**      | **Description**                                                                                                                                                   | 
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `compilation` | The compilation from which the binary is built. By default, `test` binaries are based on the `test` compilation while other binaries - on the `main` compilation. |
| `linkerOpts`  | Options passed to a system linker during binary building.                                                                                                         |
| `baseName`    | Custom base name for the output file. The final file name will be formed by adding system-dependent prefix and postfix to this base name.                         |
| `entryPoint`  | The entry point function for executable binaries. By default, it's `main()` in the root package.                                                                  |
| `outputFile`  | Access to the output file.                                                                                                                                        |
| `linkTask`    | Access to the link task.                                                                                                                                          |
| `runTask`     | Access to the run task for executable binaries. For targets other than `linuxX64`, `macosX64`, or `mingwX64` the value is `null`.                                 |
| `isStatic`    | For Objective-C frameworks. Includes a static library instead of a dynamic one.                                                                                   |

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
binaries {
    executable("my_executable", listOf(RELEASE)) {
        // Build a binary on the basis of the test compilation.
        compilation = compilations["test"]

        // Custom command line options for the linker.
        linkerOpts = mutableListOf("-L/lib/search/path", "-L/another/search/path", "-lmylib")

        // Base name for the output file.
        baseName = "foo"

        // Custom entry point function.
        entryPoint = "org.example.main"

        // Accessing the output file.
        println("Executable path: ${outputFile.absolutePath}")

        // Accessing the link task.
        linkTask.dependsOn(additionalPreprocessingTask)

        // Accessing the run task.
        // Note that the runTask is null for non-host platforms.
        runTask?.dependsOn(prepareForRun)
    }

    framework("my_framework" listOf(RELEASE)) {
        // Include a static library instead of a dynamic one into the framework.
        isStatic = true
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
binaries {
    executable('my_executable', [RELEASE]) {
        // Build a binary on the basis of the test compilation.
        compilation = compilations.test

        // Custom command line options for the linker.
        linkerOpts = ['-L/lib/search/path', '-L/another/search/path', '-lmylib']

        // Base name for the output file.
        baseName = 'foo'

        // Custom entry point function.
        entryPoint = 'org.example.main'

        // Accessing the output file.
        println("Executable path: ${outputFile.absolutePath}")

        // Accessing the link task.
        linkTask.dependsOn(additionalPreprocessingTask)

        // Accessing the run task.
        // Note that the runTask is null for non-host platforms.
        runTask?.dependsOn(prepareForRun)
    }

    framework('my_framework' [RELEASE]) {
        // Include a static library instead of a dynamic one into the framework.
        isStatic = true
    }
}
```

</tab>
</tabs>

Learn more about [building native binaries](multiplatform-build-native-binaries.md).

#### CInterops

`cinterops` is a collection of descriptions for interop with native libraries.
To provide an interop with a library, add an entry to `cinterops` and define its parameters:

| **Name**       | **Description**                                       | 
|----------------|-------------------------------------------------------|
| `defFile`      | `def` file describing the native API.                 |
| `packageName`  | Package prefix for the generated Kotlin API.          |
| `compilerOpts` | Options to pass to the compiler by the cinterop tool. |
| `includeDirs`  | Directories to look for headers.                      |

Learn more how to [configure interop with native languages](multiplatform-configure-compilations.md#配置与原生语言的互操作).

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    linuxX64 { // Replace with a target you need.
        compilations.getByName("main") {
            val myInterop by cinterops.creating {
                // Def-file describing the native API.
                // The default path is src/nativeInterop/cinterop/<interop-name>.def
                defFile(project.file("def-file.def"))

                // Package to place the Kotlin API generated.
                packageName("org.sample")

                // Options to be passed to compiler by cinterop tool.
                compilerOpts("-Ipath/to/headers")

                // Directories for header search (an analogue of the -I<path> compiler option).
                includeDirs.allHeaders("path1", "path2")

                // A shortcut for includeDirs.allHeaders.
                includeDirs("include/directory", "another/directory")
            }

            val anotherInterop by cinterops.creating { /* ... */ }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    linuxX64 { // Replace with a target you need.
        compilations.main {
            cinterops {
                myInterop {
                    // Def-file describing the native API.
                    // The default path is src/nativeInterop/cinterop/<interop-name>.def
                    defFile project.file("def-file.def")

                    // Package to place the Kotlin API generated.
                    packageName 'org.sample'

                    // Options to be passed to compiler by cinterop tool.
                    compilerOpts '-Ipath/to/headers'

                    // Directories for header search (an analogue of the -I<path> compiler option).
                    includeDirs.allHeaders("path1", "path2")

                    // A shortcut for includeDirs.allHeaders.
                    includeDirs("include/directory", "another/directory")
                }

                anotherInterop { /* ... */ }
            }
        }
    }
}
```

</tab>
</tabs>

### Android 目标

The Kotlin Multiplatform plugin contains two specific functions for android targets.
Two functions help you configure [build variants](https://developer.android.com/studio/build/build-variants):

| **Name**                      | **Description**                                                                                                                                | 
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `publishLibraryVariants()`    | Specifies build variants to publish. Learn more about [publishing Android libraries](multiplatform-publish-lib.md#发布-android-库). |
| `publishAllLibraryVariants()` | Publishes all build variants.                                                                                                                  |

```kotlin
kotlin {
    android {
        publishLibraryVariants("release", "debug")
    }
}
```

Learn more about [compilation for Android](multiplatform-configure-compilations.md#android-编译项).

> The `android` configuration inside `kotlin` doesn't replace the build configuration of any Android project.
> Learn more about writing build scripts for Android projects in [Android developer documentation](https://developer.android.com/studio/build).
>
{type="note"}

## 源代码集

The `sourceSets` block describes source sets of the project. A source set contains Kotlin source files that participate
in compilations together, along with their resources, dependencies, and language settings. 

A multiplatform project contains [predefined](#预定义源代码集) source sets for its targets;
developers can also create [custom](#自定义源代码集) source sets for their needs.

### 预定义源代码集

Predefined source sets are set up automatically upon creation of a multiplatform project.
Available predefined source sets are the following:

| **Name**                            | **Description**                                                                                                                                                                                       | 
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `commonMain`                        | Code and resources shared between all platforms. Available in all multiplatform projects. Used in all main [compilations](#编译项) of a project.                                                |
| `commonTest`                        | Test code and resources shared between all platforms. Available in all multiplatform projects. Used in all test compilations of a project.                                                            |
| _\<targetName\>\<compilationName\>_ | Target-specific sources for a compilation. _\<targetName\>_ is the name of a predefined target and _\<compilationName\>_ is the name of a compilation for this target. Examples: `jsTest`, `jvmMain`. |

With Kotlin Gradle DSL, the sections of predefined source sets should be marked `by getting`.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonMain by getting { /* ... */ }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin { 
    sourceSets { 
        commonMain { /* ... */ } 
    }
}
```

</tab>
</tabs>

Learn more about [source sets](multiplatform-discover-project.md#源代码集).

### 自定义源代码集

Custom source sets are created by the project developers manually.
To create a custom source set, add a section with its name inside the `sourceSets` section.
If using Kotlin Gradle DSL, mark custom source sets `by creating`.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin { 
    sourceSets { 
        val myMain by creating { /* ... */ } // create a new source set by the name 'MyMain'
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin { 
    sourceSets { 
        myMain { /* ... */ } // create or configure a source set by the name 'myMain' 
    }
}
```

</tab>
</tabs>

Note that a newly created source set isn't connected to other ones. To use it in the project's compilations,
[connect it with other source sets](multiplatform-hierarchy.md#manual-configuration).

### 源代码集参数

Configurations of source sets are stored inside the corresponding blocks of `sourceSets`. A source set has the following parameters:

| **Name**           | **Description**                                                                                                          | 
|--------------------|--------------------------------------------------------------------------------------------------------------------------|
| `kotlin.srcDir`    | Location of Kotlin source files inside the source set directory.                                                         |
| `resources.srcDir` | Location of resources inside the source set directory.                                                                   |
| `dependsOn`        | [Connection with another source set](multiplatform-hierarchy.md#manual-configuration). |
| `dependencies`     | [依赖项](#依赖项) of the source set.                                                                         |
| `languageSettings` | [语言设置](#语言设置) applied to the source set.                                                       |

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin { 
    sourceSets { 
        val commonMain by getting {
            kotlin.srcDir("src")
            resources.srcDir("res")

            dependencies {
                /* ... */
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin { 
    sourceSets { 
        commonMain {
            kotlin.srcDir('src')
            resources.srcDir('res')

            dependencies {
                /* ... */
            }
        }
    }
}
``` 

</tab>
</tabs>

## 编译项

A target can have one or more compilations, for example, for production or testing. There are [predefined compilations](#预定义编译项)
that are added automatically upon target creation. You can additionally create [custom compilations](#自定义编译项).

To refer to all or some particular compilations of a target, use the `compilations` object collection.
From `compilations`, you can refer to a compilation by its name.

Learn more about [configuring compilations](multiplatform-configure-compilations.md).

### 预定义编译项

Predefined compilations are created automatically for each target of a project except for Android targets.
Available predefined compilations are the following:

| **Name** | **Description**                     | 
|----------|-------------------------------------|
| `main`   | Compilation for production sources. |
| `test`   | Compilation for tests.              |

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            output // get the main compilation output
        }

        compilations["test"].runtimeDependencyFiles // get the test runtime classpath
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main.output // get the main compilation output
        compilations.test.runtimeDependencyFiles // get the test runtime classpath
    }
}
```

</tab>
</tabs>

### 自定义编译项

In addition to predefined compilations, you can create your own custom compilations.
To create a custom compilation, add a new item into the `compilations` collection.
If using Kotlin Gradle DSL, mark custom compilations `by creating`.

Learn more about creating a [custom compilation](multiplatform-configure-compilations.md#创建自定义编译项).

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm() {
        compilations {
            val integrationTest by compilations.creating {
                defaultSourceSet {
                    dependencies {
                        /* ... */
                    }
                }

                // Create a test task to run the tests produced by this compilation:
                tasks.register<Test>("integrationTest") {
                    /* ... */
                }
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm() {
        compilations.create('integrationTest') {
            defaultSourceSet {
                dependencies {
                    /* ... */
                }
            }

            // Create a test task to run the tests produced by this compilation:
            tasks.register('jvmIntegrationTest', Test) {
                /* ... */
            }
        }
    }
}
```

</tab>
</tabs>

### 编译项参数

A compilation has the following parameters:

| **Name**                 | **Description**                                                                                                                     | 
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `defaultSourceSet`       | The compilation's default source set.                                                                                               |
| `kotlinSourceSets`       | Source sets participating in the compilation.                                                                                       |
| `allKotlinSourceSets`    | Source sets participating in the compilation and their connections via `dependsOn()`.                                               |
| `compilerOptions`        | Compiler options applied to the compilation. For the list of available options, see [Compiler options](gradle-compiler-options.md). |
| `compileKotlinTask`      | Gradle task for compiling Kotlin sources.                                                                                           |
| `compileKotlinTaskName`  | Name of `compileKotlinTask`.                                                                                                        |
| `compileAllTaskName`     | Name of the Gradle task for compiling all sources of a compilation.                                                                 |
| `output`                 | The compilation output.                                                                                                             |
| `compileDependencyFiles` | Compile-time dependency files (classpath) of the compilation.                                                                       |
| `runtimeDependencyFiles` | Runtime dependency files (classpath) of the compilation.                                                                            |

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    jvm {
        val main by compilations.getting {
            compilerOptions.configure { 
                // Set up the Kotlin compiler options for the 'main' compilation:
                jvmTarget.set(JvmTarget.JVM_1_8)
            }
        
            compileKotlinTask // get the Kotlin task 'compileKotlinJvm' 
            output // get the main compilation output
        }
        
        compilations["test"].runtimeDependencyFiles // get the test runtime classpath
    }

    // Configure all compilations of all targets:
    targets.all {
        compilations.all {
            compilerOptions.configure {
                allWarningsAsErrors.set(true)
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    jvm {
        compilations.main.compilerOptions.configure { 
            // Setup the Kotlin compiler options for the 'main' compilation:
            jvmTarget.set(JvmTarget.JVM_1_8)
        }

        compilations.main.compileKotlinTask // get the Kotlin task 'compileKotlinJvm' 
        compilations.main.output // get the main compilation output
        compilations.test.runtimeDependencyFiles // get the test runtime classpath
    }

    // Configure all compilations of all targets:
    targets.all {
        compilations.all {
            compilerOptions.configure {
                allWarningsAsError.set(true)
            }
        }
    }
}
```

</tab>
</tabs>

## 依赖项

The `dependencies` block of the source set declaration contains the dependencies of this source set.

Learn more about [configuring dependencies](gradle-configure-project.md).

There are four types of dependencies:

| **Name**         | **Description**                                                                     | 
|------------------|-------------------------------------------------------------------------------------|
| `api`            | Dependencies used in the API of the current module.                                 |
| `implementation` | Dependencies used in the module but not exposed outside it.                         |
| `compileOnly`    | Dependencies used only for compilation of the current module.                       |
| `runtimeOnly`    | Dependencies available at runtime but not visible during compilation of any module. |

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets {
        val commonMain by getting {
            dependencies {
                api("com.example:foo-metadata:1.0")
            }
        }
        val jvmMain by getting {
            dependencies {
                implementation("com.example:foo-jvm:1.0")
            }
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets {
        commonMain {
            dependencies {
                api 'com.example:foo-metadata:1.0'
            }
        }
        jvmMain {
            dependencies {
                implementation 'com.example:foo-jvm:1.0'
            }
        }
    }
}
```

</tab>
</tabs>

Additionally, source sets can depend on each other and form a hierarchy.
In this case, the [`dependsOn()`](#源代码集参数) relation is used.

Source set dependencies can also be declared in the top-level `dependencies` block of the build script.
In this case, their declarations follow the pattern `<sourceSetName><DependencyKind>`, for example, `commonMainApi`.

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    "commonMainApi"("com.example:foo-common:1.0")
    "jvm6MainApi"("com.example:foo-jvm6:1.0")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    commonMainApi 'com.example:foo-common:1.0'
    jvm6MainApi 'com.example:foo-jvm6:1.0'
}
```

</tab>
</tabs>

## 语言设置

The `languageSettings` block of a source set defines certain aspects of project analysis and build. The following language settings are available:

| **Name**                | **Description**                                                                                                                                                                 | 
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `languageVersion`       | Provides source compatibility with the specified version of Kotlin.                                                                                                             |
| `apiVersion`            | Allows using declarations only from the specified version of Kotlin bundled libraries.                                                                                          |
| `enableLanguageFeature` | Enables the specified language feature. The available values correspond to the language features that are currently experimental or have been introduced as such at some point. |
| `optIn`                 | Allows using the specified [opt-in annotation](opt-in-requirements.md).                                                                                                         |
| `progressiveMode`       | Enables the [progressive mode](whatsnew13.md#渐进模式).                                                                                                                 |

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
kotlin {
    sourceSets.all {
        languageSettings.apply {
            languageVersion = "1.8" // possible values: "1.4", "1.5", "1.6", "1.7", "1.8", "1.9"
            apiVersion = "1.8" // possible values: "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9"
            enableLanguageFeature("InlineClasses") // language feature name
            optIn("kotlin.ExperimentalUnsignedTypes") // annotation FQ-name
            progressiveMode = true // false by default
        }
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
kotlin {
    sourceSets.all {
        languageSettings {
            languageVersion = '1.8' // possible values: '1.4', '1.5', '1.6', '1.7', '1.8', '1.9'
            apiVersion = '1.8' // possible values: '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9'
            enableLanguageFeature('InlineClasses') // language feature name
            optIn('kotlin.ExperimentalUnsignedTypes') // annotation FQ-name
            progressiveMode = true // false by default
        }
    }
}
```

</tab>
</tabs>
