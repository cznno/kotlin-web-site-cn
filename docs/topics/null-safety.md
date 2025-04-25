[//]: # (title: 空安全)

Null safety is a Kotlin feature designed to significantly reduce the risk of null references, also known as [The Billion-Dollar Mistake](https://en.wikipedia.org/wiki/Null_pointer#History).

许多编程语言（包括 Java）中最常见的陷阱之一，就是访问空引用的成员<!--
-->会导致空引用异常。在 Java 中，这等同于 `NullPointerException` 
或简称 *NPE*。

Kotlin explicitly supports nullability as part of its type system, meaning you can explicitly declare 
which variables or properties are allowed to be `null`. Also, when you declare non-null variables, the compiler 
enforces that these variables cannot hold a `null` value,
preventing an NPE. 

Kotlin's null safety ensures safer code by catching potential null-related issues at compile time rather than runtime. 
This feature improves code robustness, readability, and maintainability by explicitly expressing `null` values, making the code easier to understand and manage.

Kotlin 中 NPE 的可能的原因只可能是：

* 显式调用 [`throw NullPointerException()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-null-pointer-exception/)。
* 使用了[非空断言操作符 `!!`](#非空断言操作符)。
* 数据在初始化期间不一致，例如当：
    * 一个在构造函数中出现的未初始化的 `this` 用于其他地方（[“泄漏 `this`”](https://youtrack.jetbrains.com/issue/KTIJ-9751)）。
    * [超类的构造函数调用一个开放成员](inheritance.md#派生类初始化顺序)，该成员在派生类中的实现<!--
  -->使用了未初始化的状态。
* Java 互操作：
    * 企图访问[平台类型](java-interop.md#空安全与平台类型)的 `null` 引用的成员。
    * 泛型类型的可空性问题。例如，一段 Java 代码可能会向 Kotlin 的 `MutableList<String>` 中添加
      `null`，这需要 `MutableList<String?>` 才能正确处理。
    * 由外部 Java 代码引发的其他问题。

> Besides NPE, another exception related to null safety is [`UninitializedPropertyAccessException`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-uninitialized-property-access-exception/). Kotlin throws this exception 
> when you try to access a property that has not been initialized, ensuring that non-nullable properties are not used until they are ready. 
> This typically happens with [`lateinit` properties](properties.md#late-initialized-properties-and-variables).
>
{style="tip"}

## Nullable types and non-nullable types

在 Kotlin 中，类型系统区分一个类型可以容纳 `null` （可空类型）还是
不能容纳（非空类型）。例如，String 类型的常规变量不能容纳 `null`：

```kotlin
fun main() {
//sampleStart
    // Assigns a non-null string to a variable
    var a: String = "abc"
    // Attempts to re-assign null to the non-nullable variable
    a = null
    print(a)
    // Null can not be a value of a non-null type String
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

You can safely call a method or access a property on `a`. It's guaranteed not to cause an NPE because `a` is a non-nullable variable.
The compiler ensures that `a` always holds a valid `String` value, so there's no risk of accessing its properties or methods when it's `null`:

```kotlin
fun main() {
//sampleStart
    // Assigns a non-null string to a variable
    val a: String = "abc"
    // Returns the length of a non-nullable variable
    val l = a.length
    print(l)
    // 3
//sampleEnd
}
```
{kotlin-runnable="true" validate="false"}

To allow `null` values, declare a variable with a `?` sign right after the variable type. For example, 
you can declare a nullable string by writing `String?`. This expression makes `String` a type that
can accept `null`:

```kotlin
fun main() {
//sampleStart
    // Assigns a nullable string to a variable
    var b: String? = "abc"
    // Successfully re-assigns null to the nullable variable
    b = null
    print(b)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

If you try accessing `length` directly on `b`, the compiler reports an error. This is because `b` is declared as a nullable
variable and can hold `null` values. Attempting to access properties on nullables directly leads to an NPE:

```kotlin
fun main() {
//sampleStart
    // Assigns a nullable string to a variable
    var b: String? = "abc"
    // Re-assigns null to the nullable variable
    b = null
    // Tries to directly return the length of a nullable variable
    val l = b.length
    print(l)
    // Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type String? 
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

In the example above, the compiler requires you to use safe calls to check for nullability before accessing properties or 
performing operations. There are several ways to handle nullables: 

* [Check for `null` with the `if` conditional](#check-for-null-with-the-if-conditional)
* [Safe call operator `?.`](#safe-call-operator)
* [Elvis operator `?:`](#elvis-operator)
* [Not-null assertion operator `!!`](#非空断言操作符)
* [Nullable receiver](#nullable-receiver)
* [`let` function](#let-function)
* [Safe casts `as?`](#safe-casts)
* [Collections of a nullable type](#collections-of-a-nullable-type)

Read the next sections for details and examples of `null` handling tools and techniques.

## Check for null with the if conditional

When working with nullable types, you need to handle nullability safely to avoid an NPE. One way to 
handle this is checking for nullability explicitly with the `if` conditional expression. 

For example, check whether `b` is `null` and then access `b.length`:

```kotlin
fun main() {
//sampleStart
    // Assigns null to a nullable variable
    val b: String? = null
    // Checks for nullability first and then accesses length
    val l = if (b != null) b.length else -1
    print(l)
    // -1
//sampleEnd
}
```
{kotlin-runnable="true"}

In the example above, the compiler performs a [smart cast](typecasts.md#smart-casts) to change the type from nullable `String?` to non-nullable `String`. 它还会跟踪所执行检测的<!--
-->相关信息，并允许在 `if` 条件内部调用 `length`。

同时，也支持更复杂的条件：

```kotlin
fun main() {
//sampleStart
    // Assigns a nullable string to a variable
    val b: String? = "Kotlin"

    // Checks for nullability first and then accesses length
    if (b != null && b.length > 0) {
        print("String of length ${b.length}")
        // String of length 6
    } else {
        // Provides alternative if the condition is not met
        print("Empty string")
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

Note that the example above only works when the compiler can guarantee that `b` doesn't change between the check and its usage, same as 
the [smart cast prerequisites](typecasts.md#smart-cast-prerequisites).

## Safe call operator

The safe call operator `?.` allows you to handle nullability safely in a shorter form. Instead of throwing an NPE, 
if the object is `null`, the `?.` operator simply returns `null`:

```kotlin
fun main() {
//sampleStart
    // Assigns a nullable string to a variable
    val a: String? = "Kotlin"
    // Assigns null to a nullable variable
    val b: String? = null
    
    // Checks for nullability and returns length or null
    println(a?.length)
    // 6
    println(b?.length)
    // null
//sampleEnd
}
```
{kotlin-runnable="true"}

The `b?.length` expression checks for nullability and 如果 `b` 非空，就返回 `b.length`，否则返回 `null`，这个表达式的类型是 `Int?`。

You can use the `?.` operator with both [`var` and `val` variables](basic-syntax.md#variables) in Kotlin:

* A nullable `var` can hold a `null` (for example, `var nullableValue: String? = null`) or a non-null value (for example, `var nullableValue: String? = "Kotlin"`). If it's a non-null value, you can change it to `null` at any point.
* A nullable `val` can hold a `null` (for example, `val nullableValue: String? = null`) or a non-null value (for example, `val nullableValue: String? = "Kotlin"`). If it's a non-null value, you cannot change it to `null` subsequently.

安全调用在链式调用中很有用。例如，一个员工 Bob 可能会（或者不会）分配给一个部门。
可能有另外一个员工是该部门的负责人。获取 Bob 所在部门负责人（如果有的话）的名字，
写作：

```kotlin
bob?.department?.head?.name
```

如果链中的任何属性（环节）为 `null`，这个链式调用就会返回 `null`。

也可以将安全调用放在赋值的左侧：

```kotlin
person?.department?.head = managersPool.getManager()
```

In the example above, if one of the receivers in the safe call chain is `null`, the assignment is skipped, and the expression on the right is not evaluated at all. For example, if either
`person` or `person.department` is `null`, the function is not called. Here's the equivalent of the same safe call but with the `if` conditional:

```kotlin
if (person != null && person.department != null) {
    person.department.head = managersPool.getManager()
}
```

## Elvis 操作符

When working with nullable types, you can check for `null` and provide an alternative value. For example, if `b` is not `null`,
access `b.length`. Otherwise, return an alternative value:

```kotlin
fun main() {
//sampleStart
    // Assigns null to a nullable variable  
    val b: String? = null
    // Checks for nullability. If not null, returns length. If null, returns 0
    val l: Int = if (b != null) b.length else 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

除了写完整的 `if` 表达式，还可以使用 Elvis 操作符 `?:` 以更简洁的方式处理：

```kotlin
fun main() {
//sampleStart
    // Assigns null to a nullable variable  
    val b: String? = null
    // Checks for nullability. If not null, returns length. If null, returns a non-null value
    val l = b?.length ?: 0
    println(l)
    // 0
//sampleEnd
}
```
{kotlin-runnable="true"}

如果 `?:` 左侧表达式不是 `null`，Elvis 操作符就返回其左侧表达式。否则，Elvis 操作符返回<!--
-->右侧表达式。当且仅当左侧为 `null` 时，才会对右侧表达式求值。

因为 `throw` 和 `return` 在 Kotlin 中都是表达式，也可以将它们用在
elvis 操作符右侧。这可能会很方便，例如，检测函数参数：

```kotlin
fun foo(node: Node): String? {
    // Checks for getParent(). If not null, it's assigned to parent. If null, returns null
    val parent = node.getParent() ?: return null
    // Checks for getName(). If not null, it's assigned to name. If null, throws exception
    val name = node.getName() ?: throw IllegalArgumentException("name expected")
    // ……
}
```

## 非空断言操作符

非空断言操作符（`!!`）将任何值转换为非空类型。

When you apply the `!!` operator to a variable whose value is not `null`, it's safely handled as a non-nullable type, 
and the code executes normally. However, if the value is `null`, the `!!` operator forces it to be treated as non-nullable, 
which results in an NPE.

When `b` is not `null` and the `!!` operator makes it return its non-null value (which is a `String` in this example), it accesses `length` correctly:

```kotlin
fun main() {
//sampleStart
    // Assigns a nullable string to a variable
    val b: String? = "Kotlin"
    // Treats b as non-null and accesses its length
    val l = b!!.length
    println(l)
    // 6
//sampleEnd
}
```
{kotlin-runnable="true"}

When `b` is `null` and the `!!` operator makes it return its non-null value, and an NPE occurs:

```kotlin
fun main() {
//sampleStart
    // Assigns null to a nullable variable  
    val b: String? = null
    // Treats b as non-null and tries to access its length
    val l = b!!.length
    println(l) 
    // Exception in thread "main" java.lang.NullPointerException
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" validate="false"}

The `!!` operator is particularly useful 
when you are confident that a value is not `null` and there’s no chance of getting an NPE, but the compiler cannot guarantee this due to certain rules. 
In such cases, you can use the `!!` operator to explicitly tell the compiler that the value is not `null`.

## Nullable receiver

You can use extension functions with a [nullable receiver type](extensions.md#nullable-receiver), 
allowing these functions to be called on variables that might be `null`.

By defining an extension function on a nullable receiver type, you can handle `null` values within the function itself 
instead of checking for `null` at every place where you call the function.

For example, the [`.toString()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/to-string.html) extension function 
can be called on a nullable receiver. When invoked on a `null` value, it safely returns the string `"null"` without throwing an exception:

```kotlin
//sampleStart
fun main() {
    // Assigns null to a nullable Person object stored in the person variable
    val person: Person? = null

    // Applies .toString to the nullable person variable and prints a string
    println(person.toString())
    // null
}

// Defines a simple Person class
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

In the example above, even though `person` is `null`, the `.toString()` function safely returns the string `"null"`. This can be helpful for debugging and logging.

If you expect the `.toString()` function to return a nullable string (either a string representation or `null`), use the [safe-call operator `?.`](#safe-call-operator).
The `?.` operator calls `.toString()` only if the object is not `null`, otherwise it returns `null`:

```kotlin
//sampleStart
fun main() {
    // Assigns a nullable Person object to a variable
    val person1: Person? = null
    val person2: Person? = Person("Alice")

    // Prints "null" if person is null; otherwise prints the result of person.toString()
    println(person1?.toString())
    // null
    println(person2?.toString())
    // Person(name=Alice)
}

// Defines a Person class
data class Person(val name: String)
//sampleEnd
```
{kotlin-runnable="true"}

The `?.` operator allows you to safely handle potential `null` values while still accessing properties or functions of objects that might be `null`.

## Let function

To handle `null` values and perform operations only on non-null types, you can use the safe call operator `?.` together with the
[`let` function](scope-functions.md#let). 

This combination is useful for evaluating an expression, check the result for `null`, and execute code only if it's not `null`, avoiding manual null checks:

```kotlin
fun main() {
//sampleStart
    // Declares a list of nullable strings
    val listWithNulls: List<String?> = listOf("Kotlin", null)

    // Iterates over each item in the list
    for (item in listWithNulls) {
        // Checks if the item is null and only prints non-null values
        item?.let { println(it) }
        //Kotlin 
    }
//sampleEnd
}
```
{kotlin-runnable="true"}

## 安全的类型转换

The regular Kotlin operator for [type casts](typecasts.md#unsafe-cast-operator) is the `as` operator. However, regular casts can result in an exception
if the object is not of the target type. 

You can use the `as?` operator for safe casts. It tries to cast a value to the specified type and returns `null` if the value is not of that type:

```kotlin
fun main() {
//sampleStart
    // Declares a variable of type Any, which can hold any type of value
    val a: Any = "Hello, Kotlin!"

    // Safe casts to Int using the 'as?' operator
    val aInt: Int? = a as? Int
    // Safe casts to String using the 'as?' operator
    val aString: String? = a as? String

    println(aInt)
    // null
    println(aString)
    // "Hello, Kotlin!"
//sampleEnd
}
```
{kotlin-runnable="true"}

The code above prints `null` because `a` is not an `Int`, so the cast fails safely. It also prints
`"Hello, Kotlin!"` because it matches the `String?` type, so the safe cast succeeds.

## 可空类型的集合

如果你有一个包含可空元素的集合，并且只想保留其中非空的元素，可使用
filterNotNull() 函数：

```kotlin
fun main() {
//sampleStart
    // Declares a list containing some null and non-null integer values
    val nullableList: List<Int?> = listOf(1, 2, null, 4)

    // Filters out null values, resulting in a list of non-null integers
    val intList: List<Int> = nullableList.filterNotNull()
  
    println(intList)
    // [1, 2, 4]
//sampleEnd
}
```
{kotlin-runnable="true"}

## 下一步做什么？

* 了解如何[在 Java 与 Kotlin 中处理可空性](java-to-kotlin-nullability-guide.md)。
* Learn about generic types that are [definitely non-nullable](generics.md#definitely-non-nullable-types).
