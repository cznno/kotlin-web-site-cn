[//]: # (title: 返回与跳转)

Kotlin 有三种结构化跳转表达式：

* `return` 默认从最直接包围它的函数或者[匿名函数](lambdas.md#匿名函数)返回。
* `break` 终止最直接包围它的循环。
* `continue` 继续下一次最直接包围它的循环。

所有这些表达式都可以用作更大表达式的一部分：

```kotlin
val s = person.name ?: return
```

这些表达式的类型是 [Nothing 类型](exceptions.md#nothing-类型)。

## Break 与 Continue 标签

在 Kotlin 中任何表达式都可以用标签来标记。
标签的格式为标识符后跟 `@` 符号，例如：`abc@`、`fooBar@`。
要为一个表达式加标签，我们只要在其前加标签即可。

```kotlin
loop@ for (i in 1..100) {
    // ……
}
```

现在，可以用标签限定 `break` 或者 `continue`：

```kotlin
loop@ for (i in 1..100) {
    for (j in 1..100) {
        if (……) break@loop
    }
}
```

标签限定的 `break` 跳转到刚好位于该标签指定的循环后面的执行点。
`continue` 继续标签指定的循环的下一次迭代。

> In some cases, you can apply `break` and `continue` *non-locally* without explicitly defining labels.
> Such non-local usages are valid in lambda expressions used in enclosing [inline functions](inline-functions.md#break-and-continue).
>
{style="note"}

## 返回到标签

Kotlin 中函数可以使用函数字面量、局部函数与对象表达式实现嵌套。
标签限定的 `return` 让你可能从外层函数返回。

最重要的一个用途就是从 lambda 表达式中返回。 To return from a lambda expression,
label it and qualify the `return`:

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach lit@{
        if (it == 3) return@lit // 局部返回到该 lambda 表达式的调用者——forEach 循环
        print(it)
    }
    print(" done with explicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

现在，它只会从 lambda 表达式中返回。通常情况下使用*隐式标签*更方便，因为该标签<!--
-->与接受该 lambda 的函数同名。

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return@forEach // 局部返回到该 lambda 表达式的调用者——forEach 循环
        print(it)
    }
    print(" done with implicit label")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

或者，我们用一个[匿名函数](lambdas.md#匿名函数)替代 lambda 表达式。
匿名函数内部的 `return` 语句将从该匿名函数自身返回

```kotlin
//sampleStart
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach(fun(value: Int) {
        if (value == 3) return  // 局部返回到匿名函数的调用者——forEach 循环
        print(value)
    })
    print(" done with anonymous function")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

请注意，前文三个示例中使用的局部返回类似于在常规循环中使用 `continue`。

并没有 `break` 的直接等价形式，不过可以通过增加另一层嵌套 lambda 表达式并从其中非局部返回来模拟：

```kotlin
//sampleStart
fun foo() {
    run loop@{
        listOf(1, 2, 3, 4, 5).forEach {
            if (it == 3) return@loop // 从传入 run 的 lambda 表达式非局部返回
            print(it)
        }
    }
    print(" done with nested loop")
}
//sampleEnd

fun main() {
    foo()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

当要返一个回值的时候，解析器优先选用标签限定的返回：

```kotlin
return@a 1
```

这意味着“返回 `1` 到 `@a`”，而不是“返回一个标签标注的表达式 `(@a 1)`”。

> In some cases, you can return from a lambda expression without using labels. Such *non-local* returns are located in a
> lambda but exit the enclosing [inline function](inline-functions.md#returns).
>
{style="note"}
