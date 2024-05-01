[//]: # (title: 条件与循环)

## If 表达式

在 Kotlin 中，`if` 是一个表达式：它会返回一个值。
因此就不需要三元运算符（`条件 ? 然后 : 否则`），因为普通的 `if` 就能胜任这个角色。

```kotlin
fun main() {
    val a = 2
    val b = 3

    //sampleStart
    var max = a
    if (a < b) max = b

    // With else
    if (a > b) {
      max = a
    } else {
      max = b
    }

  // 作为表达式
 max = if (a > b) a else b

    // You can also use `else if` in expressions:
    val maxLimit = 1
    val maxOrLimit = if (maxLimit > a) maxLimit else if (a > b) a else b

    //sampleEnd
    println("max is $max")
    println("maxOrLimit is $maxOrLimit")
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="if-else-if-kotlin"}

`if` 表达式的分支可以是代码块，这种情况最后的表达式作为该块的值：

```kotlin
val max = if (a > b) {
    print("Choose a")
    a
} else {
    print("Choose b")
    b
}
```

If you're using `if` as an expression, for example, for returning its value or
assigning it to a variable, the `else` branch is mandatory.

## When 表达式

`when` defines a conditional expression with multiple branches. It is similar to the `switch` statement in C-like languages.
Its simple form looks like this.

```kotlin
when (x) {
    1 -> print("x == 1")
    2 -> print("x == 2")
    else -> {
        print("x is neither 1 nor 2")
    }
}
```

`when` 将它的参数与所有的分支条件顺序比较，直到某个分支满足条件。

`when` 既可以作为表达式使用也可以作为语句使用。如果它被当做表达式，
第一个符合条件的分支的值就是整个表达式的值，如果当做语句使用，
则忽略个别分支的值。 类似于 `if`，每一个分支可以是一个代码块，它的值<!--
-->是块中最后的表达式的值。

如果其他分支都不满足条件将会求值 `else` 分支。
如果 `when` 作为一个*表达式*使用，那么必须有 `else` 分支，
除非编译器能够检测出所有的可能情况都已经覆盖了，
例如，对于 [枚举（`enum`）类](enum-classes.md)条目与[密封（`sealed`）类](sealed-classes.md)子类型〕。

```kotlin
enum class Bit {
    ZERO, ONE
}

val numericValue = when (getRandomBit()) {
    Bit.ZERO -> 0
    Bit.ONE -> 1
    // 'else' is not required because all cases are covered
}
```

In `when` _statements_, the `else` branch is mandatory in the following conditions:
* `when` has a subject of a `Boolean`, [`enum`](enum-classes.md),
or [`sealed`](sealed-classes.md) type, or their nullable counterparts.
* branches of `when` don't cover all possible cases for this subject.

```kotlin
enum class Color {
    RED, GREEN, BLUE
}

when (getColor()) {  
    Color.RED -> println("red")
    Color.GREEN -> println("green")   
    Color.BLUE -> println("blue")
    // 'else' is not required because all cases are covered
}

when (getColor()) {
    Color.RED -> println("red") // no branches for GREEN and BLUE
    else -> println("not red") // 'else' is required
}
```


To define a common behavior for multiple cases, combine their conditions in a single line with a comma: 

```kotlin
when (x) {
    0, 1 -> print("x == 0 or x == 1")
    else -> print("otherwise")
}
```

可以用任意表达式（而不只是常量）作为分支条件

```kotlin
when (x) {
    s.toInt() -> print("s encodes x")
    else -> print("s does not encode x")
}
```

还可以检测一个值在（`in`）或者不在（`!in`）一个[区间](ranges.md)或者集合中：

```kotlin
when (x) {
    in 1..10 -> print("x is in the range")
    in validNumbers -> print("x is valid")
    !in 10..20 -> print("x is outside the range")
    else -> print("none of the above")
}
```

另一种选择是检测一个值是（`is`）或者不是（`!is`）一个特定类型的值。注意：
由于[智能转换](typecasts.md#智能转换)，你可以访问该类型的方法与属性而无需<!--
-->任何额外的检测。

```kotlin
fun hasPrefix(x: Any) = when(x) {
    is String -> x.startsWith("prefix")
    else -> false
}
```

`when` 也可以用来取代 `if`-`else` `if` 链。
如果不提供参数，所有的分支条件都是简单的布尔表达式，而当一个分支的条件为真时则执行该分支：

```kotlin
when {
    x.isOdd() -> print("x is odd")
    y.isEven() -> print("y is even")
    else -> print("x+y is odd")
}
```

可以使用以下语法将 *when* 的主语（subject，译注：指 `when` 所判断的表达式）捕获到变量中：

```kotlin
fun Request.getBody() =
    when (val response = executeRequest()) {
        is Success -> response.body
        is HttpError -> throw HttpException(response.status)
    }
```

在 *when* 主语中引入的变量的作用域仅限于 *when* 主体。

## For 循环

`for` 循环可以对任何提供迭代器（iterator）的对象进行遍历，这相当于像 C# 这样的语言中的 `foreach` 循环。
`for` 的语法如下所示：

```kotlin
for (item in collection) print(item)
```

`for` 循环体可以是一个代码块。

```kotlin
for (item: Int in ints) {
    // ……
}
```

如上所述，`for` 可以循环遍历任何提供了迭代器的对象。这意味着：

* 有一个成员函数或者扩展函数 `iterator()` 返回 `Iterator<>`：
  * 有一个成员函数或者扩展函数 `next()`
  * 有一个成员函数或者扩展函数 `hasNext()` 返回 `Boolean`。

这三个函数都需要标记为 `operator`。

如需在数字区间上迭代，请使用[区间表达式](ranges.md):

```kotlin
fun main() {
//sampleStart
    for (i in 1..3) {
        println(i)
    }
    for (i in 6 downTo 0 step 2) {
        println(i)
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

对区间或者数组的 `for` 循环会被编译为并不创建迭代器的基于索引的循环。

如果你想要通过索引遍历一个数组或者一个 list，你可以这么做：

```kotlin
fun main() {
val array = arrayOf("a", "b", "c")
//sampleStart
    for (i in array.indices) {
        println(array[i])
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

或者你可以用库函数 `withIndex`：

```kotlin
fun main() {
    val array = arrayOf("a", "b", "c")
//sampleStart
    for ((index, value) in array.withIndex()) {
        println("the element at $index is $value")
    }
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

## while 循环

`while` 和 `do-while` 当循环条件满足时会持续执行它们的主体。
它们之间的区别在于条件检查的时间：
* `while` 先检查条件，如果满足，则执行主体，然后再返回到条件检查。
* `do-while` 先执行主体，然后检查条件。如果满足，则循环重复。
所以 `do-while` 的主体至少执行一次，不管条件如何。

```kotlin
while (x > 0) {
    x--
}

do {
  val y = retrieveData()
} while (y != null) // y 在此处可见
```

## 循环中的 break 与 continue

在循环中 Kotlin 支持传统的 `break` 与 `continue` 操作符。参见[返回与跳转](returns.md)。
