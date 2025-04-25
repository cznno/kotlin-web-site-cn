[//]: # (title: 数字)

## 整数类型

Kotlin 提供了一组表示数字的内置类型。
对于整数，有四种不同大小与取值范围的类型：

| 类型	 | 大小（比特数）| 最小值 | 最大值 |
|--------|---------------|--------|------- |
| `Byte`	 | 8             |-128    |127     |
| `Short`	 | 16            |-32768  |32767   |
| `Int`	 | 32            |-2,147,483,648 (-2<sup>31</sup>)| 2,147,483,647 (2<sup>31</sup> - 1)|
| `Long`	 | 64            |-9,223,372,036,854,775,808 (-2<sup>63</sup>)|9,223,372,036,854,775,807 (2<sup>63</sup> - 1)|

> In addition to signed integer types, Kotlin also provides unsigned integer types.
> As unsigned integers are aimed at a different set of use cases, they are covered separately.
> See [](unsigned-integer-types.md).
> 
{style="tip"}

当初始化一个没有显式指定类型的变量时，编译器会自动推断为自 `Int` 起足以<!--
-->表示该值的最小类型。 如果不超过 `Int` 的取值范围，那么类型是 `Int`。
如果超出了该范围，那么类型是 `Long`。 如需显式指定 `Long` 值，请给该值追加后缀 `L`。
To use the `Byte` or `Short` type, specify it explicitly in the declaration.
显式指定类型会触发编译器检测该值不会超出指定类型的取值范围。

```kotlin
val one = 1 // Int
val threeBillion = 3000000000 // Long
val oneLong = 1L // Long
val oneByte: Byte = 1
```

## 浮点类型

对于实数，Kotlin 提供了浮点类型 `Float` 与 `Double` 类型，遵循 [IEEE 754 标准](https://zh.wikipedia.org/wiki/IEEE_754)。
`Float` 表达 IEEE 754 *单精度*，而 `Double` 表达*双精度*。

这两个类型的大小不同，并为两种不同精度的浮点数提供存储：

| 类型	 | 大小（比特数）| 有效数字比特数 | 指数比特数 | 十进制位数 |
|--------|---------------|--------------- |------------|------------|
| `Float`	 | 32            |24              |8           |6-7         |
| `Double` | 64            |53              |11          |15-16       |    

可以仅使用带小数部分的数字初始化 `Double` 与 `Float` 变量。
小数部分与整数部分之间用句点（`.`）分隔

对于以小数初始化的变量，编译器会推断为 `Double` 类型：

```kotlin
val pi = 3.14          // Double

val one: Double = 1    // Int is inferred
// 初始化类型不匹配

val oneDouble = 1.0    // Double
```
{validate="false"}

如需将一个值显式指定为 `Float` 类型，请添加 `f` 或 `F` 后缀。
如果以这种方式提供的值包含多于 7 位十进制数，那么会将其舍入：

```kotlin
val e = 2.7182818284          // Double
val eFloat = 2.7182818284f    // Float，实际值为 2.7182817
```

与一些其他语言不同，Kotlin 中的数字没有隐式拓宽转换。
例如，具有 `Double` 参数的函数只能对 `Double` 值调用，而不能对 `Float`、
`Int` 或者其他数字值调用：

```kotlin
fun main() {
//sampleStart
    fun printDouble(x: Double) { print(x) }

    val x = 1.0
    val xInt = 1    
    val xFloat = 1.0f 

    printDouble(x)
    
    printDouble(xInt)   
    // 参数类型不匹配
    
    printDouble(xFloat)
    // 参数类型不匹配
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

如需将数值转换为不同的类型，请使用[显式转换](#显式数字转换)。

## 数字字面常量

数值常量字面值有以下几种:

* 十进制：`123`
* Long 类型，以大写 `L` 结尾：`123L`
* 十六进制：`0x0F`
* 二进制：`0b00001011`

> Kotlin 不支持八进制。
>
{style="note"}

Kotlin 同样支持浮点数的常规表示方法:

* Doubles (default when the fractional part does not end with a letter): `123.5`, `123.5e10`
* Float，以字母 `f` 或 `F` 结尾：`123.5f`

你可以使用下划线使数字常量更易读：

```kotlin
val oneMillion = 1_000_000
val creditCardNumber = 1234_5678_9012_3456L
val socialSecurityNumber = 999_99_9999L
val hexBytes = 0xFF_EC_DE_5E
val bytes = 0b11010010_01101001_10010100_10010010
val bigFractional = 1_234_567.7182818284
```

> 无符号整数字面值也有特殊后缀。  
> 更多内容请参阅[无符号整型字面值](unsigned-integer-types.md)。
> 
{style="tip"}

## Boxing and caching numbers on the Java Virtual Machine

The way the JVM stores numbers can make your code behave counterintuitively because of the cache used by default
for small (byte-sized) numbers.

The JVM stores numbers as primitive types: `int`, `double`, and so on.
When you use [generic types](generics.md) or create a nullable number reference such as `Int?`, numbers are boxed in Java classes
such as `Integer` or `Double`.

The JVM applies a [memory optimization technique](https://docs.oracle.com/javase/specs/jls/se22/html/jls-5.html#jls-5.1.7)
to `Integer` and other objects that represent numbers between `−128` and `127`.
All nullable references to such objects refer to the same cached object.
For example, nullable objects in the following code are [referentially equal](equality.md#referential-equality):

```kotlin
fun main() {
//sampleStart
    val a: Int = 100
    val boxedA: Int? = a
    val anotherBoxedA: Int? = a
    
    println(boxedA === anotherBoxedA) // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

For numbers outside this range, the nullable objects are different but [structurally equal](equality.md#structural-equality):

```kotlin
fun main() {
//sampleStart
    val b: Int = 10000
    val boxedB: Int? = b
    val anotherBoxedB: Int? = b
    
    println(boxedB === anotherBoxedB) // false
    println(boxedB == anotherBoxedB) // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

For this reason, Kotlin warns about using referential equality with boxable numbers and literals
with the following message: `"Identity equality for arguments of types ... and ... is prohibited."`
When comparing `Int`, `Short`, `Long`, and `Byte` types (as well as `Char` and `Boolean`), use 
structural equality checks to get consistent results.

## 显式数字转换

由于不同的表示方式，数字类型并*不是*彼此的子类型。
As a consequence, smaller types are _not_ implicitly converted to bigger types and vice versa.
For example, assigning a value of type `Byte` to an `Int` variable requires an explicit conversion:

```kotlin
fun main() {
//sampleStart
    val byte: Byte = 1
    // OK，字面值会静态检测
    
    val intAssignedByte: Int = byte 
    // Initializer type mismatch
    
    val intConvertedByte: Int = byte.toInt()
    
    println(intConvertedByte)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false"}

所有数字类型都支持转换为其他类型：

* `toByte(): Byte` (deprecated for [Float](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-float/to-byte.html) and [Double](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-double/to-byte.html))
* `toShort(): Short`
* `toInt(): Int`
* `toLong(): Long`
* `toFloat(): Float`
* `toDouble(): Double`

很多情况都不需要显式类型转换，因为类型会从上下文推断出来，
而算术运算符会有重载自动处理类型转换。例如：

```kotlin
fun main() {
//sampleStart
    val l = 1L + 3       // Long + Int => Long
    println(l is Long)   // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.5"}

### Reasoning against implicit conversions

Kotlin doesn't support implicit conversions because they can lead to unexpected behavior.

If numbers of different types were converted implicitly, we could sometimes lose equality and identity silently.
For example, imagine if `Int` was a subtype of `Long`:

```kotlin
// Hypothetical code, does not actually compile:
val a: Int? = 1    // A boxed Int (java.lang.Integer)
val b: Long? = a   // Implicit conversion yields a boxed Long (java.lang.Long)
print(b == a)      // Prints "false" as Long.equals() checks not only the value but whether the other number is Long as well
```

## 数字运算

Kotlin支持数字运算的标准集：`+`、 `-`、 `*`、 `/`、 `%`。它们已定义<!--
-->为相应的类成员：

```kotlin
fun main() {
//sampleStart
    println(1 + 2)
    println(2_500_000_000L - 1L)
    println(3.14 * 2.71)
    println(10.0 / 3)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

可以在自定义数字类中覆盖这些操作符。
详情请参见[操作符重载](operator-overloading.md)。

### 整数除法

整数间的除法总是返回整数。会丢弃任何小数部分。

```kotlin
fun main() {
//sampleStart
    val x = 5 / 2
    println(x == 2.5) 
    // Operator '==' cannot be applied to 'Int' and 'Double'
    
    println(x == 2)   
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false"}

对于任何两个整数类型之间的除法来说都是如此：

```kotlin
fun main() {
//sampleStart
    val x = 5L / 2
    println (x == 2)
    // Error, as Long (x) cannot be compared to Int (2)
    
    println(x == 2L)
    // true
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" validate="false"}

如需返回带小数部分的除法结果，请将其中的一个参数显式转换为浮点类型：

```kotlin
fun main() {
//sampleStart
    val x = 5 / 2.toDouble()
    println(x == 2.5)
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 位运算

Kotlin 对整数提供了一组*位运算*。它们直接使用数字的比特表示在<!--
-->二进制级别进行操作。
位运算有可以通过中缀形式调用的函数表示。只能应用于 `Int` 与 `Long`：

```kotlin
fun main() {
//sampleStart
    val x = 1
    val xShiftedLeft = (x shl 2)
    println(xShiftedLeft)  
    // 4
    
    val xAnd = x and 0x000FF000
    println(xAnd)          
    // 0
//sampleEnd
}
```

完整的位运算列表：

* `shl(bits)` – 有符号左移
* `shr(bits)` – 有符号右移
* `ushr(bits)` – 无符号右移
* `and(bits)` – 位**与**
* `or(bits)` – 位**或**
* `xor(bits)` – 位**异或**
* `inv()` – 位非

### 浮点数比较

本节讨论的浮点数操作如下：

* 相等性检测：`a == b` 与 `a != b`
* 比较操作符：`a < b`、 `a > b`、 `a <= b`、 `a >= b`
* 区间实例以及区间检测：`a..b`、 `x in a..b`、 `x !in a..b`

当其中的操作数 `a` 与 `b` 都是静态已知的 `Float` 或 `Double` 或者它们对应的可空类型（声明为<!--
-->该类型，或者推断为该类型，或者[智能类型转换](typecasts.html#智能转换)的结果是该类型），两数字所形成的操作<!--
-->或者区间遵循 [IEEE 754 浮点运算标准](https://zh.wikipedia.org/wiki/IEEE_754)。

然而，为了支持泛型场景并提供全序支持，对于**并非**<!--
-->静态类型就是浮点数的情况，行为是不同的。例如是 `Any`、 `Comparable<...>` 或者 `Collection<T>` 类型。 这种情况下，这些<!-- 
-->操作使用为 `Float` 与 `Double` 实现的 `equals` 与 `compareTo`。 因此：

* 认为 `NaN` 与其自身相等
* 认为 `NaN` 比包括正无穷大（`POSITIVE_INFINITY`）在内的任何其他元素都大
* 认为 `-0.0` 小于 `0.0`

以下示例显示了静态类型作为浮点数 
（`Double.NaN`）的操作数与静态类型**并非**作为浮点数的操作数（`listOf(T)`）之间的行为差异。

```kotlin
fun main() {
    //sampleStart
    // 静态类型作为浮点数的操作数
    println(Double.NaN == Double.NaN)                 // false
    
    // 静态类型并非作为浮点数的操作数
    // 所以 NaN 等于它本身
    println(listOf(Double.NaN) == listOf(Double.NaN)) // true

    // 静态类型作为浮点数的操作数
    println(0.0 == -0.0)                              // true
    
    // 静态类型并非作为浮点数的操作数
    // 所以 -0.0 小于 0.0
    println(listOf(0.0) == listOf(-0.0))              // false

    println(listOf(Double.NaN, Double.POSITIVE_INFINITY, 0.0, -0.0).sorted())
    // [-0.0, 0.0, Infinity, NaN]
    //sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-numbers-floating-comp"}