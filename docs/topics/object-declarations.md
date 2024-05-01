[//]: # (title: 对象表达式与对象声明)

有时候需要创建一个对某个类做了轻微改动的类的对象，而不用为之显式声明<!--
-->新的子类。 Kotlin 可以用*对象表达式*与*对象声明*处理这种情况。

## 对象表达式

_Object expressions_ create objects of anonymous classes, that is, classes that aren't explicitly declared with the `class`
declaration. Such classes are useful for one-time use. You can define them from scratch, inherit from existing classes,
or implement interfaces. Instances of anonymous classes are also called _anonymous objects_ because they are defined by
an expression, not a name.

### Creating anonymous objects from scratch

Object expressions start with the `object` keyword.

If you just need an object that doesn't have any nontrivial supertypes, write its members in curly braces after `object`:

```kotlin

fun main() {
//sampleStart
    val helloWorld = object {
        val hello = "Hello"
        val world = "World"
        // object expressions extend Any, so `override` is required on `toString()`
        override fun toString() = "$hello $world"
    }

    print(helloWorld)
//sampleEnd
}
```
{kotlin-runnable="true"}

### Inheriting anonymous objects from supertypes

如需创建一个继承自某个（或某些）类型的匿名类的对象， specify this type after `object` and a
colon (`:`). Then implement or override the members of this class as if you were [inheriting](inheritance.md) from it:

```kotlin
window.addMouseListener(object : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { /*……*/ }

    override fun mouseEntered(e: MouseEvent) { /*……*/ }
})
```

如果超类型有一个构造函数，那么传递适当的构造函数参数给它。
多个超类型可以由跟在冒号后面的逗号分隔的列表指定：

```kotlin
open class A(x: Int) {
    public open val y: Int = x
}

interface B { /*……*/ }

val ab: A = object : A(1), B {
    override val y = 15
}
```

### Using anonymous objects as return and value types

When an anonymous object is used as a type of a local or [private](visibility-modifiers.md#包) but not [inline](inline-functions.md)
declaration (function or property), all its members are accessible via this function or property:

```kotlin
class C {
    private fun getObject() = object {
        val x: String = "x"
    }

    fun printX() {
        println(getObject().x)
    }
}
```

If this function or property is public or private inline, its actual type is:
* `Any` if the anonymous object doesn't have a declared supertype
* The declared supertype of the anonymous object, if there is exactly one such type
* The explicitly declared type if there is more than one declared supertype

In all these cases, members added in the anonymous object are not accessible. Overridden members are accessible if they
are declared in the actual type of the function or property:

```kotlin
interface A {
    fun funFromA() {}
}
interface B

class C {
    // The return type is Any; x is not accessible
    fun getObject() = object {
        val x: String = "x"
    }

    // The return type is A; x is not accessible
    fun getObjectA() = object: A {
        override fun funFromA() {}
        val x: String = "x"
    }

    // The return type is B; funFromA() and x are not accessible
    fun getObjectB(): B = object: A, B { // explicit return type is required
        override fun funFromA() {}
        val x: String = "x"
    }
}
```

### Accessing variables from anonymous objects

对象表达式中的代码可以访问来自包含它的作用域的变量：

```kotlin
fun countClicks(window: JComponent) {
    var clickCount = 0
    var enterCount = 0

    window.addMouseListener(object : MouseAdapter() {
        override fun mouseClicked(e: MouseEvent) {
            clickCount++
        }

        override fun mouseEntered(e: MouseEvent) {
            enterCount++
        }
    })
    // ……
}
```

## 对象声明
{id="object-declarations-overview"}

[单例](https://en.wikipedia.org/wiki/Singleton_pattern)模式在一些场景中很有用，
而 Kotlin 使单例声明变得很容易：

```kotlin
object DataProviderManager {
    fun registerDataProvider(provider: DataProvider) {
        // ……
    }

    val allDataProviders: Collection<DataProvider>
        get() = // ……
}
```

这称为*对象声明*。并且它总是在 `object` 关键字后跟一个名称。
就像变量声明一样，对象声明不是一个表达式，不能用在赋值语句<!--
-->的右边。

对象声明的初始化过程是线程安全的并且在首次访问时进行。

如需引用该对象，直接使用其名称即可：

```kotlin
DataProviderManager.registerDataProvider(……)
```

这些对象可以有超类型：

```kotlin
object DefaultListener : MouseAdapter() {
    override fun mouseClicked(e: MouseEvent) { …… }

    override fun mouseEntered(e: MouseEvent) { …… }
}
```

> 对象声明不能在局部作用域（即不能直接嵌套在函数内部），但是它们可以嵌套<!-- 
> -->到其他对象声明或非内部类中。
>
{type="note"}

### Data objects

When printing a plain `object` declaration in Kotlin, the string representation contains both its name and the hash of the object:

```kotlin
object MyObject

fun main() {
    println(MyObject) // MyObject@1f32e575
}
```

Just like [data classes](data-classes.md), you can mark an `object` declaration with the `data` modifier. 
This instructs the compiler to generate a number of functions for your object:

* `toString()` returns the name of the data object
* `equals()`/`hashCode()` pair

  > You can't provide a custom `equals` or `hashCode` implementation for a `data object`.
  >
  {type="note"}

The `toString()` function of a data object returns the name of the object:
```kotlin
data object MyDataObject {
    val x: Int = 3
}

fun main() {
    println(MyDataObject) // MyDataObject
}
```

The `equals()` function for a `data object` ensures that all objects that have the type of your `data object` are considered equal.
In most cases, you will only have a single instance of your data object at runtime (after all, a `data object` declares a singleton).
However, in the edge case where another object of the same type is generated at runtime (for example, by using platform 
reflection with `java.lang.reflect` or a JVM serialization library that uses this API under the hood), this ensures that 
the objects are treated as being equal.

> Make sure that you only compare `data objects` structurally (using the `==` operator) and never by reference (using the `===` operator).
> This helps you to avoid pitfalls when more than one instance of a data object exists at runtime.
>
{type="warning"}

```kotlin
import java.lang.reflect.Constructor

data object MySingleton

fun main() {
    val evilTwin = createInstanceViaReflection()

    println(MySingleton) // MySingleton
    println(evilTwin) // MySingleton

    // Even when a library forcefully creates a second instance of MySingleton, its `equals` method returns true:
    println(MySingleton == evilTwin) // true

    // Do not compare data objects via ===.
    println(MySingleton === evilTwin) // false
}

fun createInstanceViaReflection(): MySingleton {
    // Kotlin reflection does not permit the instantiation of data objects.
    // This creates a new MySingleton instance "by force" (i.e. Java platform reflection)
    // Don't do this yourself!
    return (MySingleton.javaClass.declaredConstructors[0].apply { isAccessible = true } as Constructor<MySingleton>).newInstance()
}
```

The generated `hashCode()` function has behavior that is consistent with the `equals()` function, so that all runtime 
instances of a `data object` have the same hash code.

#### Differences between data objects and data classes

While `data object` and `data class` declarations are often used together and have some similarities, there are some 
functions that are not generated for a `data object`:

* No `copy()` function. Because a `data object` declaration is intended to be used as singleton objects, no `copy()` 
  function is generated. The singleton pattern restricts the instantiation of a class to a single instance, which would 
  be violated by allowing copies of the instance to be created.
* No `componentN()` function. Unlike a `data class`, a `data object` does not have any data properties. 
  Since attempting to destructure such an object without data properties would not make sense, no `componentN()` functions are generated.

#### Using data objects with sealed hierarchies

Data object declarations are particularly useful for sealed hierarchies like 
[sealed classes or sealed interfaces](sealed-classes.md), since they allow you to maintain symmetry with any data classes 
you may have defined alongside the object. In this example, declaring `EndOfFile` as a `data object` instead of a plain `object` 
means that it will get the `toString()` function without the need to override it manually:

```kotlin
sealed interface ReadResult
data class Number(val number: Int) : ReadResult
data class Text(val text: String) : ReadResult
data object EndOfFile : ReadResult

fun main() {
    println(Number(7)) // Number(number=7)
    println(EndOfFile) // EndOfFile
}
```
{kotlin-runnable="true" id="data-objects-sealed-hierarchies"}

### 伴生对象

类内部的对象声明可以用 `companion` 关键字标记：

```kotlin
class MyClass {
    companion object Factory {
        fun create(): MyClass = MyClass()
    }
}
```

该伴生对象的成员可通过只使用类名作为限定符来调用：

```kotlin
val instance = MyClass.create()
```

可以省略伴生对象的名称，在这种情况下将使用名称 `Companion`：

```kotlin
class MyClass {
    companion object { }
}

val x = MyClass.Companion
```

Class members can access the private members of the corresponding companion object.

其自身所用的类的名称（不是另一个名称的限定符）可用作对该类的伴生对象
（无论是否具名）的引用：

```kotlin
class MyClass1 {
    companion object Named { }
}

val x = MyClass1

class MyClass2 {
    companion object { }
}

val y = MyClass2
```

请注意，即使伴生对象的成员看起来像其他语言的静态成员，在运行时他们<!--
-->仍然是真实对象的实例成员，而且，例如还可以实现接口：

```kotlin
interface Factory<T> {
    fun create(): T
}

class MyClass {
    companion object : Factory<MyClass> {
        override fun create(): MyClass = MyClass()
    }
}

val f: Factory<MyClass> = MyClass
```

当然，在 JVM 平台，如果使用 `@JvmStatic` 注解，你可以将伴生对象的成员生成为真正的<!--
-->静态方法和字段。更详细信息请参见[Java 互操作性](java-to-kotlin-interop.md#静态字段)一节
。

### 对象表达式和对象声明之间的语义差异

对象表达式和对象声明之间有一个重要的语义差别：

* 对象表达式是在使用他们的地方*立即*执行（及初始化）的。
* 对象声明是在第一次被访问到时*延迟*初始化的。
* 伴生对象的初始化是在相应的类被加载（解析）时，与 Java 静态初始化器的语义相匹配
  。
