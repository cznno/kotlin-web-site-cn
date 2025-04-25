[//]: # (title: 内联函数)

使用[高阶函数](lambdas.md)会带来一些运行时的效率损失：每一个函数都是一个对象，并且会捕获一个闭包。
闭包那些在函数体内会访问到的变量的作用域。
内存分配（对于函数对象和类）和虚拟调用会引入运行时间开销。

但是在许多情况下通过内联化 lambda 表达式可以消除这类的开销。
下述函数是这种情况的很好的例子。`lock()` 函数可以很容易地在调用处内联。
考虑下面的情况：

```kotlin
lock(l) { foo() }
```

编译器没有为参数创建一个函数对象并生成一个调用。取而代之，编译器可以生成以下代码：

```kotlin
l.lock()
try {
    foo()
} finally {
    l.unlock()
}
```

为了让编译器这么做，需要使用 `inline` 修饰符标记 `lock()` 函数：

```kotlin
inline fun <T> lock(lock: Lock, body: () -> T): T { …… }
```

`inline` 修饰符影响函数本身和传给它的 lambda 表达式：所有这些都将内联<!--
-->到调用处。

内联可能导致生成的代码增加。不过如果使用得当（避免内联过大<!--
-->函数）， 性能上会有所提升，尤其是在循环中的“超多态（megamorphic）”调用处。

## noinline

如果不希望内联所有传给内联函数的 lambda 表达式参数都内联，那么可以用 `noinline` 修饰符标记<!--
-->不希望内联的函数参数：

```kotlin
inline fun foo(inlined: () -> Unit, noinline notInlined: () -> Unit) { …… }
```

可以内联的 lambda 表达式只能在内联函数内部调用或者作为可内联的参数传递。
但是 `noinline` 的 lambda 表达式可以以任何喜欢的方式操作，包括存储在字段中、或者进行传递。

> 如果一个内联函数没有可内联的函数参数并且没有<!--
> -->[具体化的类型参数](#具体化的类型参数)，编译器会产生一个警告，因为内联这样的函数<!--
> -->很可能并无益处（如果你确认需要内联，
> 那么可以用 `@Suppress("NOTHING_TO_INLINE")` 注解关掉该警告）。
>
{style="note"}

## Non-local jump expressions

### Returns

在 Kotlin 中，只能对具名或匿名函数使用正常的、非限定的 return 来退出。
要退出一个 lambda 表达式，需要使用一个[标签](returns.md#返回到标签)。
在 lambda 表达式内部禁止使用裸 `return`，因为 lambda 表达式不能使包含它的函数返回：

```kotlin
fun ordinaryFunction(block: () -> Unit) {
    println("hi!")
}
//sampleStart
fun foo() {
    ordinaryFunction {
        return // 错误：不能使 `foo` 在此处返回
    }
}
//sampleEnd
fun main() {
    foo()
}
```
{kotlin-runnable="true" validate="false"}

但是如果 lambda 表达式传给的函数是内联的，该 return 也可以内联。因此可以这样：

```kotlin
inline fun inlined(block: () -> Unit) {
    println("hi!")
}
//sampleStart
fun foo() {
    inlined {
        return // OK：该 lambda 表达式是内联的
    }
}
//sampleEnd
fun main() {
    foo()
}
```
{kotlin-runnable="true"}

这种返回（位于 lambda 表达式中，但退出包含它的函数）称为*非局部*返回。
通常会在循环中用到这种结构，其内联函数通常包含：

```kotlin
fun hasZeros(ints: List<Int>): Boolean {
    ints.forEach {
        if (it == 0) return true // 从 hasZeros 返回
    }
    return false
}
```

请注意，一些内联函数可能调用传给它们的不是直接来自函数体、而是来自另一个执行<!--
-->上下文的 lambda 表达式参数，例如来自局部对象或嵌套函数。在这种情况下，该 lambda 表达式中<!--
-->也不允许非局部控制流。To indicate that the lambda parameter of the inline function cannot use non-local
returns, mark the lambda parameter with the `crossinline` modifier:

```kotlin
inline fun f(crossinline body: () -> Unit) {
    val f = object: Runnable {
        override fun run() = body()
    }
    // ……
}
```

### Break and continue

> This feature is currently [In preview](kotlin-evolution-principles.md#pre-stable-features).
> We're planning to stabilize it in future releases.
> To opt in, use the `-Xnon-local-break-continue` compiler option.
> We would appreciate your feedback on it in [YouTrack](https://youtrack.jetbrains.com/issue/KT-1436).
>
{style="warning"}

Similar to non-local `return`, you can apply `break` and `continue` [jump expressions](returns.md) in lambdas passed
as arguments to an inline function that encloses a loop:

```kotlin
fun processList(elements: List<Int>): Boolean {
    for (element in elements) {
        val variable = element.nullableMethod() ?: run {
            log.warning("Element is null or invalid, continuing...")
            continue
        }
        if (variable == 0) return true
    }
    return false
}
```

## 具体化的类型参数

有时候需要访问一个作为参数传递的一个类型：

```kotlin
fun <T> TreeNode.findParentOfType(clazz: Class<T>): T? {
    var p = parent
    while (p != null && !clazz.isInstance(p)) {
        p = p.parent
    }
    @Suppress("UNCHECKED_CAST")
    return p as T?
}
```

在这里向上遍历一棵树并且检测每个节点是不是特定的类型。
这都没有问题，但是调用处不是很优雅：

```kotlin
treeNode.findParentOfType(MyTreeNode::class.java)
```

更好的解决方案是只要传一个类型给该函数，可以按以下方式调用它：

```kotlin
treeNode.findParentOfType<MyTreeNode>()
```

为能够这么做，内联函数支持*具体化的类型参数*，于是可以这样写：

```kotlin
inline fun <reified T> TreeNode.findParentOfType(): T? {
    var p = parent
    while (p != null && p !is T) {
        p = p.parent
    }
    return p as T?
}
```

上述代码使用 `reified` 修饰符来限定类型参数使其可以在函数内部访问它，
几乎就像是一个普通的类一样。由于函数是内联的，不需要反射，正常的操作符如 `!is`
和 `as` 现在均可用。此外，还可以按照如上所示的方式调用该函数：`myTree.findParentOfType<MyTreeNodeType>()`。

虽然在许多情况下可能不需要反射，但仍然可以对一个具体化的类型参数使用它：

```kotlin
inline fun <reified T> membersOf() = T::class.members

fun main(s: Array<String>) {
    println(membersOf<StringBuilder>().joinToString("\n"))
}
```

普通的函数（未标记为内联函数的）不能有具体化参数。
不具有运行时表示的类型（例如非具体化的类型参数或者类似于
`Nothing` 的虚构类型）不能用作具体化的类型参数的实参。

## 内联属性

`inline` 修饰符可用于没有[幕后字段](properties.md#幕后字段)的属性的访问器。
你可以标注独立的属性访问器：

```kotlin
val foo: Foo
    inline get() = Foo()

var bar: Bar
    get() = ……
    inline set(v) { …… }
```

你也可以标注整个属性，将它的两个访问器都标记为内联（`inline`）：

```kotlin
inline var bar: Bar
    get() = ……
    set(v) { …… }
```

在调用处，内联访问器如同内联函数一样内联。

## 公有 API 内联函数的限制

当一个内联函数是 `public` 或 `protected` 而不是 `private` 或 `internal` 声明的一部分时，
就会认为它是一个[模块级](visibility-modifiers.md#模块)的公有 API。可以在其他模块中调用它，并且也可以<!--
-->在调用处内联这样的调用。

这带来了一些由模块做这样变更时导致的二进制兼容的风险——
声明一个内联函数但调用它的模块在它修改后并没有重新编译。

为了消除这种由*非*公有 API 变更引入的不兼容的风险，公有
API 内联函数体内不允许使用非公有声明，即，不允许使用 `private` 与 `internal`
声明以及其部件。

一个 `internal` 声明可以由 `@PublishedApi` 标注，这会允许它在公有 API 内联函数中使用。
当一个 `internal` 内联函数标记有 `@PublishedApi` 时，也会像公有函数一样检测其函数体。
