[//]: # (title: 属性委托)

With some common kinds of properties, even though you can implement them manually every time you need them,
it is more helpful to implement them once, add them to a library, and reuse them later. For example:

* 延迟属性（*lazy* properties）: 其值只在首次访问时计算。
* 可观察属性（*observable* properties）: 监听器会收到有关此属性变更的通知。
* 把多个属性储存在一个映射（*map*）中，而不是每个存在单独的字段中。

为了涵盖这些（以及其他）情况，Kotlin 支持 _委托属性_:

```kotlin
class Example {
    var p: String by Delegate()
}
```

语法是： `val/var <属性名>: <类型> by <表达式>`。在 `by` 后面的表达式是该 _委托_，
因为属性对应的 `get()`（与 `set()`）会被委托给它的 `getValue()` 与 `setValue()` 方法。
属性的委托不必实现接口，但是需要提供一个 `getValue()` 函数（对于 `var` 属性还有 `setValue()`）。

例如:

```kotlin
import kotlin.reflect.KProperty

class Delegate {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        return "$thisRef, thank you for delegating '${property.name}' to me!"
    }
 
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println("$value has been assigned to '${property.name}' in $thisRef.")
    }
}
```

当从委托到一个 `Delegate` 实例的 `p` 读取时，将调用 `Delegate` 中的 `getValue()` 函数。
它的第一个参数是读出 `p` 的对象、第二个参数保存了对 `p` 自身的描述
（例如可以取它的名称)。

```kotlin
val e = Example()
println(e.p)
```

输出结果：

```
Example@33a17727, thank you for delegating 'p' to me!
```

类似地，当我们给 `p` 赋值时，将调用 `setValue()` 函数。前两个参数相同，
第三个参数保存将要被赋予的值：

```kotlin
e.p = "NEW"
```

输出结果：
 
```
NEW has been assigned to 'p' in Example@33a17727.
```

委托对象的要求规范可以在[下文](#属性委托要求)找到。

可以在函数或代码块中声明一个委托属性；它不一定是类的成员。
你可以在下文找到[其示例](#局部委托属性)。

## 标准委托

Kotlin 标准库为几种有用的委托提供了工厂方法。

### 延迟属性 Lazy properties

[`lazy()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/lazy.html) 是接受一个 lambda 并返回一个 `Lazy <T>` 实例的函数，返回的实例可以作为实现延迟属性的委托。
第一次调用 `get()` 会执行已传递给 `lazy()` 的 lambda 表达式并记录结果。
后续调用 `get()` 只是返回记录的结果。

```kotlin
val lazyValue: String by lazy {
    println("computed!")
    "Hello"
}

fun main() {
    println(lazyValue)
    println(lazyValue)
}
```
{kotlin-runnable="true"}

默认情况下，对于 lazy 属性的求值是*同步锁的（synchronized）*：该值只在一个线程中计算，但所有线程<!--
-->都会看到相同的值。如果初始化委托的同步锁不是必需的，这样可以让多个线程<!--
-->同时执行，那么将 `LazyThreadSafetyMode.PUBLICATION` 作为参数传给 `lazy()`。

如果你确定初始化将总是发生在与属性使用位于相同的线程，
那么可以使用 `LazyThreadSafetyMode.NONE` 模式。它不会有任何线程安全的保证以及相关的开销。

### 可观察属性 Observable properties

[`Delegates.observable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/observable.html)
接受两个参数：初始值与修改时处理程序（handler）。

每当我们给属性赋值时会调用该处理程序（在赋值*后*执行）。它有三个<!--
-->参数：被赋值的属性、旧值与新值：

```kotlin
import kotlin.properties.Delegates

class User {
    var name: String by Delegates.observable("<no name>") {
        prop, old, new ->
        println("$old -> $new")
    }
}

fun main() {
    val user = User()
    user.name = "first"
    user.name = "second"
}
```
{kotlin-runnable="true"}

如果你想截获赋值并*否决*它们，那么使用 [`vetoable()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.properties/-delegates/vetoable.html) 取代 `observable()`。
在属性被赋新值*之前*会调用传递给 `vetoable` 的处理程序。

## 委托给另一个属性

一个属性可以把它的 getter 与 setter 委托给另一个属性。这种委托<!--
-->对于顶层和类的属性（成员和扩展）都可用。该委托属性可以为：
- 顶层属性
- 同一个类的成员或扩展属性
- 另一个类的成员或扩展属性

为将一个属性委托给另一个属性，应在委托名称中使用 `::` 限定符，例如，`this::delegate` 或
`MyClass::delegate`。

```kotlin
var topLevelInt: Int = 0
class ClassWithDelegate(val anotherClassInt: Int)

class MyClass(var memberInt: Int, val anotherClassInstance: ClassWithDelegate) {
    var delegatedToMember: Int by this::memberInt
    var delegatedToTopLevel: Int by ::topLevelInt
    
    val delegatedToAnotherClass: Int by anotherClassInstance::anotherClassInt
}
var MyClass.extDelegated: Int by ::topLevelInt
```

这是很有用的，例如，当想要以一种向后兼容的方式重命名一个属性的时候：引入一个新的属性、
使用 `@Deprecated` 注解来注解旧的属性、并委托其实现。

```kotlin
class MyClass {
   var newName: Int = 0
   @Deprecated("Use 'newName' instead", ReplaceWith("newName"))
   var oldName: Int by this::newName
}
fun main() {
   val myClass = MyClass()
   // 通知：'oldName: Int' is deprecated.
   // Use 'newName' instead
   myClass.oldName = 42
   println(myClass.newName) // 42
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.4"}

## 将属性储存在映射中

一个常见的用例是在一个映射（map）里存储属性的值。
这经常出现在像解析 JSON 或者执行其他“动态”任务的应用中。
在这种情况下，你可以使用映射实例自身作为委托来实现委托属性。

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}
```

在这个例子中，构造函数接受一个映射参数：

```kotlin
val user = User(mapOf(
    "name" to "John Doe",
    "age"  to 25
))
```

Delegated properties take values from this map through string keys, which are associated with the names of properties:

```kotlin
class User(val map: Map<String, Any?>) {
    val name: String by map
    val age: Int     by map
}

fun main() {
    val user = User(mapOf(
        "name" to "John Doe",
        "age"  to 25
    ))
//sampleStart
    println(user.name) // Prints "John Doe"
    println(user.age)  // Prints 25
//sampleEnd
}
```
{kotlin-runnable="true"}

这也适用于 `var` 属性，如果把只读的 `Map` 换成 `MutableMap` 的话：

```kotlin
class MutableUser(val map: MutableMap<String, Any?>) {
    var name: String by map
    var age: Int     by map
}
```

## 局部委托属性

你可以将局部变量声明为委托属性。
例如，你可以使一个局部变量惰性初始化：

```kotlin
fun example(computeFoo: () -> Foo) {
    val memoizedFoo by lazy(computeFoo)

    if (someCondition && memoizedFoo.isValid()) {
        memoizedFoo.doSomething()
    }
}
```

`memoizedFoo` 变量只会在第一次访问时计算。
如果 `someCondition` 失败，那么该变量根本不会计算。

## 属性委托要求

对于一个*只读*属性（即 `val` 声明的），委托必须提供一个操作符函数 `getValue()`，该函数具有以下参数：

* `thisRef` 必须与*属性所有者*类型（对于扩展属性必须是被扩展的类型）相同或者是其超类型。
* `property`  必须是类型 `KProperty<*>` 或其超类型。

`getValue()` 必须返回与属性相同的类型（或其子类型）。

```kotlin
class Resource

class Owner {
    val valResource: Resource by ResourceDelegate()
}

class ResourceDelegate {
    operator fun getValue(thisRef: Owner, property: KProperty<*>): Resource {
        return Resource()
    }
}
```

对于一个**可变**属性（即 `var` 声明的），委托必须额外提供一个操作符函数 `setValue()`，
该函数具有以下参数：

* `thisRef` 必须与*属性所有者*类型（对于扩展属性必须是被扩展的类型）相同或者是其超类型。
* `property` 必须是类型 `KProperty<*>` 或其超类型。
* `value` 必须与属性类型相同（或者是其超类型）。

```kotlin
class Resource

class Owner {
    var varResource: Resource by ResourceDelegate()
}

class ResourceDelegate(private var resource: Resource = Resource()) {
    operator fun getValue(thisRef: Owner, property: KProperty<*>): Resource {
        return resource
    }
    operator fun setValue(thisRef: Owner, property: KProperty<*>, value: Any?) {
        if (value is Resource) {
            resource = value
        }
    }
}
```

`getValue()` 或/与 `setValue()` 函数可以通过委托类的成员函数提供或者由扩展函数提供。
当你需要委托属性到原本未提供的这些函数的对象时后者会更便利。
两函数都需要用 `operator` 关键字来进行标记。

You can create delegates as anonymous objects without creating new classes, by using the interfaces `ReadOnlyProperty` and `ReadWriteProperty` from the Kotlin standard library.
They provide the required methods: `getValue()` is declared in `ReadOnlyProperty`; `ReadWriteProperty`
extends it and adds `setValue()`. This means you can pass a `ReadWriteProperty` whenever a `ReadOnlyProperty` is expected.

```kotlin
fun resourceDelegate(resource: Resource = Resource()): ReadWriteProperty<Any?, Resource> =
    object : ReadWriteProperty<Any?, Resource> {
        var curValue = resource 
        override fun getValue(thisRef: Any?, property: KProperty<*>): Resource = curValue
        override fun setValue(thisRef: Any?, property: KProperty<*>, value: Resource) {
            curValue = value
        }
    }

val readOnlyResource: Resource by resourceDelegate()  // ReadWriteProperty as val
var readWriteResource: Resource by resourceDelegate()
```

## Translation rules for delegated properties

在底层，Kotlin 编译器会为某些类型的委托属性生成辅助属性并委托给它们。

> For optimization purposes, the compiler [_does not_ generate auxiliary properties in several cases](#optimized-cases-for-delegated-properties). 
> Learn about the optimization on the example of [delegating to another property](#translation-rules-when-delegating-to-another-property).
>
{style="note"}

例如，对于属性 `prop`，生成隐藏属性 `prop$delegate`，而访问器的代码只是<!--
-->简单地委托给这个附加属性：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 这段是由编译器生成的相应代码：
class C {
    private val prop$delegate = MyDelegate()
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

Kotlin 编译器在参数中提供了关于 `prop` 的所有必要信息：第一个参数 `this` 引用<!--
-->到外部类 `C` 的实例，而 `this::prop` 是 `KProperty` 类型的反射对象，该对象描述 `prop` 自身。

### Optimized cases for delegated properties

The `$delegate` field will be omitted if a delegate is:
* A referenced property:

  ```kotlin
  class C<Type> {
      private var impl: Type = ...
      var prop: Type by ::impl
  }
  ```

* A named object:

  ```kotlin
  object NamedObject {
      operator fun getValue(thisRef: Any?, property: KProperty<*>): String = ...
  }

  val s: String by NamedObject
  ```

* A final `val` property with a backing field and a default getter in the same module:

  ```kotlin
  val impl: ReadOnlyProperty<Any?, String> = ...

  class A {
      val s: String by impl
  }
  ```

* A constant expression, enum entry, `this`, `null`. The example of `this`:

  ```kotlin
  class A {
      operator fun getValue(thisRef: Any?, property: KProperty<*>) ...
 
      val s by this
  }
  ```

### Translation rules when delegating to another property

When delegating to another property, the Kotlin compiler generates immediate access to the referenced property.
This means that the compiler doesn't generate the field `prop$delegate`. This optimization helps save memory.

Take the following code, for example:

```kotlin
class C<Type> {
    private var impl: Type = ...
    var prop: Type by ::impl
}
```

Property accessors of the `prop` variable invoke the `impl` variable directly, skipping the delegated property's `getValue`and `setValue` operators, 
and thus the `KProperty` reference object is not needed.

For the code above, the compiler generates the following code:

```kotlin
class C<Type> {
    private var impl: Type = ...

    var prop: Type
        get() = impl
        set(value) {
            impl = value
        }
    
    fun getProp$delegate(): Type = impl // This method is needed only for reflection
}
```

## 提供委托

通过定义 `provideDelegate` 操作符，可以扩展创建属性实现所委托对象的逻辑。
如果 `by` 右侧所使用的对象将 `provideDelegate` 定义为成员或扩展函数，
那么会调用该函数来创建属性委托实例。

One of the possible use cases of `provideDelegate` is to check the consistency of the property upon its initialization.

例如，如需在绑定之前检测属性名称，可以这样写：

```kotlin
class ResourceDelegate<T> : ReadOnlyProperty<MyUI, T> {
    override fun getValue(thisRef: MyUI, property: KProperty<*>): T { ... }
}
    
class ResourceLoader<T>(id: ResourceID<T>) {
    operator fun provideDelegate(
            thisRef: MyUI,
            prop: KProperty<*>
    ): ReadOnlyProperty<MyUI, T> {
        checkProperty(thisRef, prop.name)
        // 创建委托
        return ResourceDelegate()
    }

    private fun checkProperty(thisRef: MyUI, name: String) { …… }
}

class MyUI {
    fun <T> bindResource(id: ResourceID<T>): ResourceLoader<T> { …… }

    val image by bindResource(ResourceID.image_id)
    val text by bindResource(ResourceID.text_id)
}
```

`provideDelegate` 的参数与 `getValue` 的相同：

* `thisRef` 必须与 _属性所有者_ 类型（对于扩展属性必须是被扩展的类型）相同或者是它的超类型；
* `property` 必须是类型 `KProperty<*>` 或其超类型。

在创建 `MyUI` 实例期间，为每个属性调用 `provideDelegate` 方法，并立即执行<!--
-->必要的验证。

如果没有这种拦截属性与其委托之间的绑定的能力，为了实现相同的功能，
你必须显式传递属性名，这不是很方便：

```kotlin
// 检测属性名称而不使用“provideDelegate”功能
class MyUI {
    val image by bindResource(ResourceID.image_id, "image")
    val text by bindResource(ResourceID.text_id, "text")
}

fun <T> MyUI.bindResource(
        id: ResourceID<T>,
        propertyName: String
): ReadOnlyProperty<MyUI, T> {
    checkProperty(this, propertyName)
   // 创建委托
}
```

在生成的代码中，会调用 `provideDelegate` 方法来初始化辅助的 `prop$delegate` 属性。
比较对于属性声明 `val prop: Type by MyDelegate()` 生成的代码与<!-- 
-->[上面](#translation-rules-for-delegated-properties)（当 `provideDelegate` 方法不存在时）生成的代码：

```kotlin
class C {
    var prop: Type by MyDelegate()
}

// 这段代码是当“provideDelegate”功能可用时
// 由编译器生成的代码：
class C {
    // 调用“provideDelegate”来创建额外的“delegate”属性
    private val prop$delegate = MyDelegate().provideDelegate(this, this::prop)
    var prop: Type
        get() = prop$delegate.getValue(this, this::prop)
        set(value: Type) = prop$delegate.setValue(this, this::prop, value)
}
```

请注意，`provideDelegate` 方法只影响辅助属性的创建，并不会影响<!--
-->为 getter 或 setter 生成的代码。

With the `PropertyDelegateProvider` interface from the standard library, you can create delegate providers without creating new classes.

```kotlin
val provider = PropertyDelegateProvider { thisRef: Any?, property ->
    ReadOnlyProperty<Any?, Int> {_, property -> 42 }
}
val delegate: Int by provider
```

