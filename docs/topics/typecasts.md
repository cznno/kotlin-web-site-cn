[//]: # (title: 类型检测与类型转换)

In Kotlin, you can perform type checks to check the type of an object at runtime. Type casts enable you to convert objects to a 
different type.

> To learn specifically about **generics** type checks and casts, for example `List<T>`, `Map<K,V>`, see [Generics type checks and casts](generics.md#泛型类型检测与类型转换).
>
{style="tip"}

## is 与 !is 操作符

如需在运行时检测对象是否符合给定类型，使用 `is` 操作符或其否定形式 `!is`：

```kotlin
if (obj is String) {
    print(obj.length)
}

if (obj !is String) { // 与 !(obj is String) 相同
    print("Not a String")
} else {
    print(obj.length)
}
```

## 智能转换

大多数场景都不需要使用显式转换操作符，because the compiler automatically casts objects for you.
This is called smart-casting. 编译器跟踪不可变值的类型检测以及[显式转换](#不安全的转换操作符)，
并在必要时自动插入隐式安全的）转换：

```kotlin
fun demo(x: Any) {
    if (x is String) {
        print(x.length) // x 自动转换为字符串
    }
}
```

编译器甚至足够聪明，能够知道如果反向检测导致返回那么该转换是安全的：

```kotlin
if (x !is String) return

print(x.length) // x 自动转换为字符串
```

### Control flow

Smart casts work not only for `if` conditional expressions but also for [`when` expressions](control-flow.md#when-expressions-and-statements)
and [`while` loops](control-flow.md#while-loops):

```kotlin
when (x) {
    is Int -> print(x + 1)
    is String -> print(x.length + 1)
    is IntArray -> print(x.sum())
}
```

If you declare a variable of `Boolean` type before using it in your `if`, `when`, or `while` condition, then any
information collected by the compiler about the variable will be accessible in the corresponding block for
smart-casting.

This can be useful when you want to do things like extract boolean conditions into variables. Then, you can give the
variable a meaningful name, which will improve your code readability and make it possible to reuse the variable later
in your code. For example:

```kotlin
class Cat {
    fun purr() {
        println("Purr purr")
    }
}

fun petAnimal(animal: Any) {
    val isCat = animal is Cat
    if (isCat) {
        // The compiler can access information about
        // isCat, so it knows that animal was smart-cast
        // to the type Cat.
        // Therefore, the purr() function can be called.
        animal.purr()
    }
}

fun main(){
    val kitty = Cat()
    petAnimal(kitty)
    // Purr purr
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-local-variables" validate="false"}

### Logical operators

The compiler can perform smart casts on the right-hand side of `&&` or `||` operators if there is a type check (regular or negative) on the left-hand side:

```kotlin
// `||` 右侧的 x 自动转换为 String
if (x !is String || x.length == 0) return

// `&&` 右侧的 x 自动转换为 String
if (x is String && x.length > 0) {
    print(x.length) // x 自动转换为 String
}
```

If you combine type checks for objects with an `or` operator (`||`), a smart cast is made to their closest common supertype:

```kotlin
interface Status {
    fun signal() {}
}

interface Ok : Status
interface Postponed : Status
interface Declined : Status

fun signalCheck(signalStatus: Any) {
    if (signalStatus is Postponed || signalStatus is Declined) {
        // signalStatus is smart-cast to a common supertype Status
        signalStatus.signal()
    }
}
```

> The common supertype is an **approximation** of a [union type](https://en.wikipedia.org/wiki/Union_type). Union types
> are [not currently supported in Kotlin](https://youtrack.jetbrains.com/issue/KT-13108/Denotable-union-and-intersection-types).
>
{style="note"}

### Inline functions

The compiler can smart-cast variables captured within lambda functions that are passed to [inline functions](inline-functions.md).

Inline functions are treated as having an implicit [`callsInPlace`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.contracts/-contract-builder/calls-in-place.html)
contract. This means that any lambda functions passed to an inline function are called in place. Since lambda functions
are called in place, the compiler knows that a lambda function can't leak references to any variables contained within
its function body.

The compiler uses this knowledge, along with other analyses to decide whether it's safe to smart-cast any of the
captured variables. For example:

```kotlin
interface Processor {
    fun process()
}

inline fun inlineAction(f: () -> Unit) = f()

fun nextProcessor(): Processor? = null

fun runProcessor(): Processor? {
    var processor: Processor? = null
    inlineAction {
        // The compiler knows that processor is a local variable and inlineAction()
        // is an inline function, so references to processor can't be leaked.
        // Therefore, it's safe to smart-cast processor.
      
        // If processor isn't null, processor is smart-cast
        if (processor != null) {
            // The compiler knows that processor isn't null, so no safe call 
            // is needed
            processor.process()
        }

        processor = nextProcessor()
    }

    return processor
}
```

### Exception handling

Smart cast information is passed on to `catch` and `finally` blocks. This makes your code safer
as the compiler tracks whether your object has a nullable type. For example:

```kotlin
//sampleStart
fun testString() {
    var stringInput: String? = null
    // stringInput is smart-cast to String type
    stringInput = ""
    try {
        // The compiler knows that stringInput isn't null
        println(stringInput.length)
        // 0

        // The compiler rejects previous smart cast information for 
        // stringInput. Now stringInput has the String? type.
        stringInput = null

        // Trigger an exception
        if (2 > 1) throw Exception()
        stringInput = ""
    } catch (exception: Exception) {
        // The compiler knows stringInput can be null
        // so stringInput stays nullable.
        println(stringInput?.length)
        // null
    }
}
//sampleEnd
fun main() {
    testString()
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="2.0" id="kotlin-smart-casts-exception-handling"}

### Smart cast prerequisites

> 请注意，当编译器能保证变量在检测及其使用之间不可改变时，智能转换才有效。
>
{style="warning"}

智能转换适用于以下情形：

<table style="none">
    <tr>
        <td>
            <code>val</code> 局部变量
        </td>
        <td>
            总是可以，<a href="delegated-properties.md">局部委托属性</a>除外。
        </td>
    </tr>
    <tr>
        <td>
            <code>val</code> 属性
        </td>
        <td>
            如果属性是 <code>private</code>、 <code>internal</code>，或者该检测在声明属性的同一<a href="visibility-modifiers.md#模块">模块</a>中执行。 智能转换不能用于 <code>open</code> 的属性或者具有自定义 getter 的属性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 局部变量
        </td>
        <td>
            如果变量在检测及其使用之间未修改、没有在会修改它的 lambda 中捕获、并且不是局部委托属性。
        </td>
    </tr>
    <tr>
        <td>
            <code>var</code> 属性
        </td>
        <td>
            决不可能，因为该变量可以随时被其他代码修改。
        </td>
    </tr>
</table>

## “不安全的”转换操作符

To explicitly cast an object to a non-nullable type, use the *unsafe* cast operator `as`:

```kotlin
val x: String = y as String
```

If the cast isn't possible, the compiler throws an exception. This is why it's called _unsafe_.

In the previous example, if `y` is `null`, the code above also throws an exception. This is because `null` can't be cast
to `String`, as `String` isn't [nullable](null-safety.md). To make the example work for possible null values, use a nullable
type on the right-hand side of the cast:

```kotlin
val x: String? = y as String?
```

## “安全的”（可空）转换操作符

为了避免异常，可以使用*安全*转换操作符 `as?`，它可以在失败时返回 `null`：

```kotlin
val x: String? = y as? String
```

请注意，尽管事实上 `as?` 的右边是一个非空类型的 `String`，但是其转换的结果是可空的。
