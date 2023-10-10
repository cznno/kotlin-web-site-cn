[//]: # (title: 相等性)

Kotlin 中有两类相等性：

* *结构*相等（`==`——用 `equals()` 检测）；
* *引用*相等（`===`——两个引用指向同一对象）。

## 结构相等

结构相等由 `==` 以及其否定形式 `!=` 操作判断。
按照约定，像 `a == b` 这样的表达式会翻译成：

```kotlin
a?.equals(b) ?: (b === null)
```

如果 `a` 不是 `null` 则调用 `equals(Any?)` 函数，否则（`a` 是 `null`）检测 `b`
是否与`null` 引用相等。

请注意，当与 `null` 显式比较时完全没必要优化你的代码：
`a == null` 会被自动转换为 `a === null`。

如需提供自定义的相等检测实现，请覆盖
[`equals(other: Any?): Boolean`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/equals.html) 函数。
名称相同但签名不同的函数，如 `equals(other: Foo)` 并不会影响<!--
-->操作符 `==` 与 `!=` 的相等性检测。

结构相等与 `Comparable<……>` 接口定义的比较无关，因此只有自定义的
`equals(Any?)` 实现可能会影响该操作符的行为。

## 引用相等

引用相等由 `===`（以及其否定形式 `!==`）操作判断。`a === b`
当且仅当 `a` 与 `b` 指向同一个对象时求值为 true。对于运行时以原生类型表示的值
（例如 `Int`），`===` 相等检测等价于 `==` 检测。

## 浮点数相等性

当相等性检测的两个操作数都是静态已知的（可空或非空的）`Float` 或 `Double` 类型时，该检测遵循
[IEEE 754 浮点数运算标准](https://en.wikipedia.org/wiki/IEEE_754)。

否则会使用不符合该标准的结构相等性检测，这会导致 `NaN` 等于其自身，`NaN` is considered greater than any other element, including `POSITIVE_INFINITY`, 而 `-0.0` 不等于 `0.0`。

更多信息请参见[浮点数比较](numbers.md#浮点数比较)。

## Array equality

To compare whether two arrays have the same elements in the same order, use [`contentEquals()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/content-equals.html).

For more information, see [Compare arrays](arrays.md#compare-arrays).