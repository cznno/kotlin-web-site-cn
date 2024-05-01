[//]: # (title: JavaScript 模块)

可以将 Kotlin 项目编译为适用于各种流行模块系统的 JavaScript 模块。我们目前支持<!--
-->以下 JavaScript 模块配置：

- [统一模块定义（UMD，Unified Module Definitions）](https://github.com/umdjs/umd)，它与 *AMD* 和 *CommonJS* 兼容。
  UMD 模块也可以在不导入或没有模块系统的情况下执行。这是 `browser` 与 `nodejs` 目标的默认选项。
- [异步模块定义（AMD，Asynchronous Module Definition）](https://github.com/amdjs/amdjs-api/wiki/AMD)，它尤其为
  [RequireJS](https://requirejs.org/) 库所使用。
- [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1)，广泛用于 Node.js/npm
  （`require` 函数和 `module.exports` 对象）。
- 无模块（Plain）。不为任何模块系统编译。可以在全局作用域中以其名称访问模块。

## 浏览器目标

如果打算在 web 浏览器环境中运行代码并希望使用 UMD 之外的模块系统，那么可以在
`webpackTask` 配置块中指定所需的模块类型。例如，要切换到 CommonJS，请使用：

```groovy
kotlin {
    js {
        browser {
            webpackTask {
                output.libraryTarget = "commonjs2"
            }
        }
        binaries.executable()
    }
}

```

Webpack 提供了 `commonjs` 与 `commonjs2` 这两种不同的 CommonJS“风味”，它们影响声明的<!--
-->可用方式。在大多数情况下，可能希望使用 `commonjs2`，该模块将 `module.exports` 语法添加到<!--
-->所生成的库中。或者，也可以选择 `commonjs` 选项，严格遵守 CommonJS 规范。
如需了解有关 `commonjs` 与 `commonjs2` 之间的区别的更多信息，请参见 [Webpack 版本库](https://github.com/webpack/webpack/issues/1114)查看。

## JavaScript 库与 Node.js 文件

如果要创建一个用于 JavaScript 或 Node.js 环境的库，并且希望使用不同的模块<!--
-->系统，那么其说明会略有不同。

### 选择目标模块系统

如需选择目标模块系统，请在 Gradle 构建脚本中设置 `moduleKind` 编译器选项。

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrLink> {
    compilerOptions.moduleKind.set(org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS)
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
compileKotlinJs.compilerOptions.moduleKind = org.jetbrains.kotlin.gradle.dsl.JsModuleKind.MODULE_COMMONJS
```

</tab>
</tabs>

可用值为：`umd`（默认）、`commonjs`、`amd`、`plain`。

> 这与调整 `webpackTask.output.libraryTarget` 不同。库目标更改了
> _webpack 生成的_ 输出（在代码已编译之后）。`compilerOptions.moduleKind` 更改
> _由 Kotlin 编译器_ 生成的输出。
>
{type="note"}  

在 Kotlin Gradle DSL 中，还有一个用于设置 CommonJS 模块种类的快捷方式：

```kotlin
kotlin {
    js {
        useCommonJs()
        // ...
    }
}
```

## @JsModule 注解

要告诉 Kotlin 一个 `external` 类、 包、 函数或者属性是一个 JavaScript 模块，你可以使用 `@JsModule`
注解。考虑你有以下 CommonJS 模块叫“hello”：

```javascript
module.exports.sayHello = function (name) { alert("Hello, " + name); }
```

你应该在 Kotlin 中这样声明：

```kotlin
@JsModule("hello")
external fun sayHello(name: String)
```

### 将 @JsModule 应用到包

一些 JavaScript 库导出包（命名空间）而不是函数和类。
从 JavaScript 角度讲，它是一个具有一些*成员*的*对象*，这些成员是类、函数和属性。
将这些包作为 Kotlin 对象导入通常看起来不自然。
编译器可以使用以下助记符将导入的 JavaScript 包映射到 Kotlin 包：

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

external class C
```

其中相应的 JavaScript 模块的声明如下：

```javascript
module.exports = {
  foo: { /* 此处一些代码 */ },
  C: { /* 此处一些代码 */ }
}
```

标有 `@file:JsModule` 注解的文件无法声明非外部成员。
下面的示例会产生编译期错误：

```kotlin
@file:JsModule("extModule")

package ext.jspackage.name

external fun foo()

fun bar() = "!" + foo() + "!" // 此处报错
```

### 导入更深的包层次结构

在前文示例中，JavaScript 模块导出单个包。
但是，一些 JavaScript 库会从模块中导出多个包。
Kotlin 也支持这种场景，尽管你必须为每个导入的包声明一个新的 `.kt` 文件。

例如，让示例更复杂一些：

```javascript
module.exports = {
  mylib: {
    pkg1: {
      foo: function () { /* 此处一些代码 */ },
      bar: function () { /* 此处一些代码 */ }
    },
    pkg2: {
      baz: function () { /* 此处一些代码 */ }
    }
  }
}
```

要在 Kotlin 中导入该模块，你必须编写两个 Kotlin 源文件：

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg1")

package extlib.pkg1

external fun foo()

external fun bar()
```

以及

```kotlin
@file:JsModule("extModule")
@file:JsQualifier("mylib.pkg2")

package extlib.pkg2

external fun baz()
```

### @JsNonModule 注解

当一个声明标有 `@JsModule`、当你并不把它编译到一个 JavaScript 模块时，你不能在 Kotlin 代码中使用它。
通常，开发人员将他们的库既作为 JavaScript 模块也作为可下载的` .js` 文件分发，
可以将这些文件复制到项目的静态资源，并通过 `<script>` 标签包含。 如需告诉 Kotlin，可以在非模块环境中使用一个
`@JsModule` 声明，请添加 `@JsNonModule` 注解。例如，考虑<!--
-->以下 JavaScript 代码：

```javascript
function topLevelSayHello (name) { alert("Hello, " + name); }

if (module && module.exports) {
  module.exports = topLevelSayHello;
}
```

在 Kotlin 中可以这样描述：

```kotlin
@JsModule("hello")
@JsNonModule
@JsName("topLevelSayHello")
external fun sayHello(name: String)
```

### Kotlin 标准库使用的模块系统

Kotlin 以 Kotlin/JS 标准库作为单个文件分发，该文件本身被编译为 UMD 模块，
因此可以使用上述任何模块系统。在大多数 Kotlin/JS 使用场景中，建议对
`kotlin-stdlib-js` 使用 Gradle 依赖项, 它也在 NPM 上作为 [`kotlin` ](https://www.npmjs.com/package/kotlin)
包提供。
