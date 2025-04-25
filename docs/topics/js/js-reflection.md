[//]: # (title: Kotlin/JS 反射)

Kotlin/JS provides a limited support for the Kotlin [reflection API](reflection.md). The only supported parts of the API
are:

* [Class references](reflection.md#类引用) (`::class`)
* [`KType` and `typeof()`](#ktype-and-typeof)
* [`KClass` and `createInstance()`](#kclass-and-createinstance)

## Class references

The `::class` syntax returns a reference to the class of an instance, or the class corresponding to the given type.
In Kotlin/JS, the value of a `::class` expression is a stripped-down [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/)
implementation that supports only:
* [simpleName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/simple-name.html)
and [isInstance()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/is-instance.html) members.
* [cast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/cast.html) and 
[safeCast()](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/safe-cast.html) extension functions.

除此之外，你可以使用 [KClass.js](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/js.html) 访问<!--
-->与 [JsClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.js/-js-class/index.html) 类对应的实例。
该 `JsClass` 实例本身就是对构造函数的引用。
这可以用于与期望构造函数的引用的 JS 函数进行互操作。

## KType and typeOf()

The [`typeof()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/type-of.html) function constructs an instance 
of [`KType`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-type/) for a given type.
The `KType` API is fully supported in Kotlin/JS except for Java-specific parts.

## KClass and createInstance()

The [`createInstance()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect.full/create-instance.html) function
from the [KClass](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.reflect/-k-class/) interface creates a new instance
of the specified class, which is useful for getting the runtime reference to a Kotlin class.

## Example

Here is an example of the reflection usage in Kotlin/JS.

```kotlin
open class Shape
class Rectangle : Shape()

inline fun <reified T> accessReifiedTypeArg() =
    println(typeOf<T>().toString())

fun main() {
    val s = Shape()
    val r = Rectangle()

    println(r::class.simpleName) // Prints "Rectangle"
    println(Shape::class.simpleName) // Prints "Shape"
    println(Shape::class.js.name) // Prints "Shape"

    println(Shape::class.isInstance(r)) // Prints "true"
    println(Rectangle::class.isInstance(s)) // Prints "false"
    val rShape = Shape::class.cast(r) // Casts a Rectangle "r" to Shape

    accessReifiedTypeArg<Rectangle>() // Accesses the type via typeOf(). Prints "Rectangle"
}
```
