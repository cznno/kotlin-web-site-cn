[//]: # (title: 分组)

Kotlin 标准库提供用于对集合元素进行分组的扩展函数。
基本函数 [`groupBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/group-by.html) 使用一个
lambda 函数并返回一个 `Map`。
在此 Map 中，每个键都是 lambda 结果，而对应的值是返回此结果的元素 `List`。
例如，可以使用此函数将 `String` 列表按首字母分组。 

还可以使用第二个 lambda 参数（值转换函数）调用 `groupBy()`。
在带有两个 lambda 的 `groupBy()` 结果 Map 中，由 `keySelector` 函数生成的<!--
-->键映射到值转换函数的结果，而不是原始元素。

This example illustrates using the `groupBy()` function to group the strings by their first letter, iterating through
the groups on the resulting `Map` with the `for` operator, and then transforming the values to uppercase using the `valueTransform` function:

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // Groups the strings by their first letter using groupBy()
    val groupedByFirstLetter = numbers.groupBy { it.first().uppercase() }
    println(groupedByFirstLetter)
    // {O=[one], T=[two, three], F=[four, five]}

    // Iterates through each group and prints the key and its associated values
    for ((key, value) in groupedByFirstLetter) {
        println("Key: $key, Values: $value")
    }
    // Key: O, Values: [one]
    // Key: T, Values: [two, three]
    // Key: F, Values: [four, five]

    // Groups the strings by their first letter and transforms the values to uppercase
    val groupedAndTransformed = numbers.groupBy(keySelector = { it.first() }, valueTransform = { it.uppercase() })
    println(groupedAndTransformed)
    // {o=[ONE], t=[TWO, THREE], f=[FOUR, FIVE]}
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如果要对元素进行分组，然后一次将操作应用于所有分组，请使用 [`groupingBy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/grouping-by.html) 函数。
它返回一个 [`Grouping`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-grouping/index.html) 类型的实例。
通过 `Grouping` 实例，可以以一种惰性的方式将操作应用于所有组：这些分组实际上是<!--
-->刚好在执行操作前构建的。

即，`Grouping` 支持以下操作：

* [`eachCount()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/each-count.html) 计算每个组中的元素。 
* [`fold()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/fold.html) 与 [`reduce()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/reduce.html)
   对每个组分别执行 [fold 与 reduce](collection-aggregate.md#fold-与-reduce) 操作，作为一个单独的集合<!--
   -->并返回结果。
* [`aggregate()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/aggregate.html) 随后将给定操作应用于<!--
   -->每个组中的所有元素并返回结果。
   这是对 `Grouping` 执行任何操作的通用方法。当折叠或缩小不够时，可使用它来实现自定义操作。

You can use the `for` operator on the resulting `Map` to iterate through the groups created by the `groupingBy()` function.
This allows you to access each key and the count of elements associated with that key.

The following example demonstrates how to group strings by their first letter using the `groupingBy()` function,
count the elements in each group, and then iterate through each group to print the key and count of elements:

```kotlin
fun main() {
//sampleStart
    val numbers = listOf("one", "two", "three", "four", "five")

    // Groups the strings by their first letter using groupingBy() and counts the elements in each group
    val grouped = numbers.groupingBy { it.first() }.eachCount()

    // Iterates through each group and prints the key and its associated values
    for ((key, count) in grouped) {
        println("Key: $key, Count: $count")
        // Key: o, Count: 1
        // Key: t, Count: 2
        // Key: f, Count: 2
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}
