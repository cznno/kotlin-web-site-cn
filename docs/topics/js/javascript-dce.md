[//]: # (title: Kotlin/JS 无用代码消除)

> The dead code elimination (DCE) tool is deprecated. The DCE tool was designed for the legacy JS backend, which is now obsolete. The current 
> [JS IR backend](#dce-and-javascript-ir-compiler) supports DCE out of the box, and the [@JsExport annotation](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-export/) 
> allows specifying which Kotlin functions and classes to retain during DCE.
>
{style="warning"}

Kotlin Multiplatform Gradle 插件包含一个*[无用代码消除](https://zh.wikipedia.org/wiki/%E6%AD%BB%E7%A2%BC%E5%88%AA%E9%99%A4)*（_DCE_）工具。
无用代码消除通常也称为 _<span title="tree shaking">摇树</span>_。
通过删除未使用的属性、函数和类，它减小了大小或生成的 JavaScript 代码。

在以下情况下会出现未使用的声明：

* 函数是内联的，永远不会直接调用（除了少数情况总是发生）。
* 模块使用共享库。没有 DCE 的情况下，未使用的组件仍会进入结果包。
  例如，Kotlin 标准库中包含用于操作列表、数组、字符序列、DOM 适配器的函数。
  所有这些功能将需要约 1.3MB 的 JavaScript 文件。 一个简单的
  “Hello, world”应用程序仅需要控制台例程，整个程序只有几 KB。

Kotlin Multiplatform Gradle 插件在构建**生产包**时会自动处理 DCE，例如：使用
`browserProductionWebpack` 任务。**开发包**任务（例如 `browserDevelopmentWebpack`）不包含 DCE。

## DCE and JavaScript IR compiler

The application of DCE with the IR compiler is as follows:

* DCE is disabled when compiling for development, which corresponds to the following Gradle tasks:
  * `browserDevelopmentRun`
  * `browserDevelopmentWebpack`
  * `nodeDevelopmentRun`
  * `compileDevelopmentExecutableKotlinJs`
  * `compileDevelopmentLibraryKotlinJs`
  * Other Gradle tasks including "development" in their name
* DCE is enabled when compiling for production, which corresponds to the following Gradle tasks:
  * `browserProductionRun`
  * `browserProductionWebpack`
  * `compileProductionExecutableKotlinJs`
  * `compileProductionLibraryKotlinJs`
  * Other Gradle tasks including "production" in their name

With the @JsExport annotation, you can specify the declarations you want DCE to treat as roots.

## 从 DCE 排除的声明

有时，即使未在模块中使用函数或类，也可能需要在结果 JavaScript 代码中保留一个函数或一个类，
例如：如果要在客户端 JavaScript 代码中使用它，则可能会保留该函数或类。

为了避免某些声明被删除，请将 `dceTask` 代码块添加到 Gradle 构建脚本中，并将这些声明列为 `keep` 函数的参数。
参数必须是声明的完整限定名，并且模块名称为前缀：
`moduleName.dot.separated.package.name.declarationName`

> 函数与模块名称在生成的 JavaScript 代码中会被[修饰](js-to-kotlin-interop.md#jsname-注解)，
> 除非指定了其他名称。为了避免消除这些函数，请在 `keep` 参数中使用修饰的名称——
> 就是出现在所生成 JavaScript 代码中的名称。
>
{style="note"}

```groovy
kotlin {
    js {
        browser {
            dceTask {
                keep("myKotlinJSModule.org.example.getName", "myKotlinJSModule.org.example.User" )
            }
            binaries.executable()
        }
    }
}
```

If you want to keep a whole package or module from elimination, you can use its fully qualified name as it appears in the
generated JavaScript code.

> 避免删除整个软件包或模块会阻止 DCE 删除许多未使用的声明。
> 因此，最好逐个选择应从 DCE 中排除的单个声明。
>
{style="note"}

## 禁用 DCE

要完全关闭 DCE，可以使用 `dceTask` 中的 `devMode` 选项：

```groovy
kotlin {
    js {
        browser {
            dceTask {
                dceOptions.devMode = true
            }
        }
        binaries.executable()
    }
}
```