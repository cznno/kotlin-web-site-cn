[//]: # (title: 在 JavaScript 中使用 Kotlin 代码)

根据所选的 [JavaScript 模块](js-modules.md)系统，Kotlin/JS 编译器会生成不同的输出。
当然通常 Kotlin 编译器生成正常的 JavaScript 类，可以在 JavaScript 代码中自由地<!--
-->使用的函数和属性。不过，应该记住一些微妙的事情。

## 在 plain 模式中用独立的 JavaScript 隔离声明

如果将模块种类明确设置为 `plain`, 为了防止损坏全局对象，
Kotlin 创建一个包含当前模块中所有 Kotlin 声明的对象。这意味着对于一个模块 `myModule`，
所有的声明都可以通过 `myModule` 对象在 JavaScript 中使用。例如：

```kotlin
fun foo() = "Hello"
```

可以在 JavaScript 中这样调用：

```javascript
alert(myModule.foo());
```

将 Kotlin 模块编译为 JavaScript 模块 〔例如 UMD，（这是
`browser` 与 `nodejs` 目标的默认设置）、CommonJS 或 AMD〕时，此方法不适用。在这种情况下，声明将以选择的
JavaScript 模块系统指定的格式暴露。例如，当使用 UMD 或 CommonJS 时，调用处可能<!--
-->如下所示：

```javascript
alert(require('myModule').foo());
```

查看有关 [JavaScript 模块](js-modules.md)的文章，以获取有关 JavaScript 模块系统专题的更多信息。

## 包结构

Kotlin 将其包结构暴露给 JavaScript，因此除非你在根包中定义声明，
否则必须在 JavaScript 中使用完整限定名。例如：

```kotlin
package my.qualified.packagename

fun foo() = "Hello"
```

例如，当使用 UMD 或 CommonJS 时，调用处可能如下所示：

```javascript
alert(require('myModule').my.qualified.packagename.foo())
```

或者，在使用 `plain` 格式作为模块系统设置的情况下：

```javascript
alert(myModule.my.qualified.packagename.foo());
```

### @JsName 注解

在某些情况下（例如为了支持重载），Kotlin 编译器会修饰（mangle） JavaScript 代码中生成的函数和属性<!--
-->的名称。要控制生成的名称，可以使用 `@JsName` 注解：

```kotlin
// 模块“kjs”
class Person(val name: String) {
    fun hello() {
        println("Hello $name!")
    }

    @JsName("helloWithGreeting")
    fun hello(greeting: String) {
        println("$greeting $name!")
    }
}
```

现在，你可以通过以下方式在 JavaScript 中使用这个类：

```javascript
// 如有必要，根据所选模块系统导入“kjs”
var person = new kjs.Person("Dmitry");   // 引用到模块“kjs”
person.hello();                          // 输出“Hello Dmitry!”
person.helloWithGreeting("Servus");      // 输出“Servus Dmitry!”
```

如果我们没有指定 `@JsName` 注解，相应函数的名称会包含<!--
-->从函数签名计算而来的后缀，例如 `hello_61zpoe$`。

请注意，在某些情况下，Kotlin 编译器不应用修饰：
- `external` 声明不会被修饰
- 从 `external` 类继承的非 `external` 类中的任何重写函数都不会被修饰。

`@JsName` 的参数需要是一个常量字符串字面值，该字面值是一个有效的标识符。
任何尝试将非标识符字符串传递给 `@JsName` 时，编译器都会报错。
以下示例会产生编译期错误：

```kotlin
@JsName("new C()")   // 此处出错
external fun newC()
```

### @JsExport 注解

> This feature is [Experimental](components-stability.md#stability-levels-explained).
> 其设计可能会在将来的版本中更改。
>
{style="warning"} 

通过将 `@JsExport` 注解应用于顶级声明（如类或函数），可以从 JavaScript 使用 Kotlin
声明。注解会导出所有嵌套声明，并使用 Kotlin 中给出的名称。
也可以使用 `@file:JsExport` 将其应用于文件级。

要解决导出中的歧义（例如，具有相同名称的函数的重载），可以将 `@JsExport`
批注与 `@JsName` 一起使用，以指定生成与导出函数的名称。

在当前的 [IR 编译器后端](js-ir-compiler.md)中， the `@JsExport` annotation is the only way to make your functions
visible from Kotlin.

对于多平台项目，`@JsExport` 也可以在公共代码中使用。它仅在针对
JavaScript 目标进行编译时才有效，并且还允许导出非平台特有的 Kotlin 声明。

### @JsStatic

> This feature is [Experimental](components-stability.md#stability-levels-explained). It may be dropped or changed at any time.
> Use it only for evaluation purposes. We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-18891/JS-provide-a-way-to-declare-static-members-JsStatic).
>
{style="warning"}

The `@JsStatic` annotation instructs the compiler to generate additional static methods for the target declaration.
This helps you use static members from your Kotlin code directly in JavaScript.

You can apply the `@JsStatic` annotation to functions defined in named objects, as well as in companion objects declared
inside classes and interfaces. If you use this annotation, the compiler will generate both a static method of the object
and an instance method in the object itself. For example:

```kotlin
// Kotlin
class C {
    companion object {
        @JsStatic
        fun callStatic() {}
        fun callNonStatic() {}
    }
}
```

Now, the `callStatic()` function is static in JavaScript while the `callNonStatic()` function is not:

```javascript
// JavaScript
C.callStatic();              // Works, accessing the static function
C.callNonStatic();           // Error, not a static function in the generated JavaScript
C.Companion.callStatic();    // Instance method remains
C.Companion.callNonStatic(); // The only way it works
```

It's also possible to apply the `@JsStatic` annotation to a property of an object or a companion object, making its getter
and setter methods static members in that object or the class containing the companion object.

## JavaScript 中的 Kotlin 类型

See how Kotlin types are mapped to JavaScript ones:

| Kotlin                                                                      | JavaScript                 | Comments                                                                                  |
|-----------------------------------------------------------------------------|----------------------------|-------------------------------------------------------------------------------------------|
| `Byte`, `Short`, `Int`, `Float`, `Double`                                   | `Number`                   |                                                                                           |
| `Char`                                                                      | `Number`                   | The number represents the character's code.                                               |
| `Long`                                                                      | Not supported              | There is no 64-bit integer number type in JavaScript, so it is emulated by a Kotlin class. |
| `Boolean`                                                                   | `Boolean`                  |                                                                                           |
| `String`                                                                    | `String`                   |                                                                                           |
| `Array`                                                                     | `Array`                    |                                                                                           |
| `ByteArray`                                                                 | `Int8Array`                |                                                                                           |
| `ShortArray`                                                                | `Int16Array`               |                                                                                           |
| `IntArray`                                                                  | `Int32Array`               |                                                                                           |
| `CharArray`                                                                 | `UInt16Array`              | Carries the property `$type$ == "CharArray"`.                                             |
| `FloatArray`                                                                | `Float32Array`             |                                                                                           |
| `DoubleArray`                                                               | `Float64Array`             |                                                                                           |
| `LongArray`                                                                 | `Array<kotlin.Long>`       | Carries the property `$type$ == "LongArray"`. Also see Kotlin's Long type comment.        |
| `BooleanArray`                                                              | `Int8Array`                | Carries the property `$type$ == "BooleanArray"`.                                          |
| `List`, `MutableList`                                                       | `KtList`, `KtMutableList`  | Exposes an `Array` via `KtList.asJsReadonlyArrayView` or `KtMutableList.asJsArrayView`.   |
| `Map`, `MutableMap`                                                         | `KtMap`, `KtMutableMap`    | Exposes an ES2015 `Map` via `KtMap.asJsReadonlyMapView` or `KtMutableMap.asJsMapView`.    |
| `Set`, `MutableSet`                                                         | `KtSet`, `KtMutableSet`    | Exposes an ES2015 `Set` via `KtSet.asJsReadonlySetView` or `KtMutableSet.asJsSetView`.    |
| `Unit`                                                                      | Undefined                  | Exportable when used as return type, but not when used as parameter type.                 |
| `Any`                                                                       | `Object`                   |                                                                                           |
| `Throwable`                                                                 | `Error`                    |                                                                                           |
| Nullable `Type?`                                                            | `Type | null | undefined`  |                                                                                            |
| All other Kotlin types (except for those marked with `JsExport` annotation) | Not supported              | Includes Kotlin's [unsigned integer types](unsigned-integer-types.md).                    |

Additionally, it is important to know that:

* Kotlin preserves overflow semantics for `kotlin.Int`, `kotlin.Byte`, `kotlin.Short`, `kotlin.Char` and `kotlin.Long`.
* Kotlin cannot distinguish between numeric types at runtime (except for `kotlin.Long`), so the following code works:
  
  ```kotlin
  fun f() {
      val x: Int = 23
      val y: Any = x
      println(y as Float)
  }
  ```

* Kotlin 在 JavaScript 中保留了惰性对象初始化。
* Kotlin 不会在 JavaScript 中实现顶层属性的惰性初始化。
