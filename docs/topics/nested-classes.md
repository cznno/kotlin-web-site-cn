[//]: # (title: 嵌套类与内部类)

类可以嵌套在其他类中：

```kotlin
class Outer {
    private val bar: Int = 1
    class Nested {
        fun foo() = 2
    }
}

val demo = Outer.Nested().foo() // == 2
```

还可以使用带有嵌套的接口。所有类与接口的组合都是可能的：可以将接口嵌套<!--
-->在类中、将类嵌套在接口中、将接口嵌套在接口中。

```kotlin
interface OuterInterface {
    class InnerClass
    interface InnerInterface
}

class OuterClass {
    class InnerClass
    interface InnerInterface
}
```

## 内部类

标记为 `inner` 的嵌套类能够访问其外部类的成员。内部类会带有一个对外部类的对象的引用：

```kotlin
class Outer {
    private val bar: Int = 1
    inner class Inner {
        fun foo() = bar
    }
}

val demo = Outer().Inner().foo() // == 1
```

参见[限定的 `this` 表达式](this-expressions.md)以了解内部类中的 `this` 的消歧义用法。

## 匿名内部类

使用[对象表达式](object-declarations.md#对象表达式)创建匿名内部类实例：

```kotlin
window.addMouseListener(object : MouseAdapter() {

    override fun mouseClicked(e: MouseEvent) { …… }

    override fun mouseEntered(e: MouseEvent) { …… }
})
```

> 对于 JVM 平台, 如果对象是函数式 Java 接口（即具有单个抽象方法的
> Java 接口）的实例，可以使用带接口类型前缀的 lambda 表达式创建它：
>
>```kotlin
> val listener = ActionListener { println("clicked") }
> ```
>
{style="note"}

