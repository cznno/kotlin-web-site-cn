---
type: doc
layout: reference
title: "函数式接口（SAM 接口）"
---

# 函数式（单一抽象方法）接口

只有一个抽象方法的接口称为函数式接口（_functional interface_）或SAM接口。函数式接口可以有多个非抽象成员，但只能有一个抽象成员。

可以用fun修饰符在Kotlin中声明函数式接口。

<div class="sample" markdown="1" theme="idea" data-highlight-only>

```kotlin
fun interface KRunnable {
   fun invoke()
}
```

</div>

## SAM转换

对于函数式接口，你可以[通过lambda表达式](lambdas.html#lambda-expressions-and-anonymous-functions)实现SAM转换，从而使代码更简洁、更有可读性。

你可以使用lambda表达式替代手动创建实现函数式接口的类。通过SAM转换，Kotlin可以将其签名与接口的单个抽象方法的签名匹配的任何lambda表达式转换为实现该接口的类的实例。

例如，有这样一个Kotlin函数式接口：

<div class="sample" markdown="1" theme="idea" data-highlight-only>

```kotlin
fun interface IntPredicate {
   fun accept(i: Int): Boolean
}
```

</div>

如果不使用SAM转换，则需要编写如下代码：

<div class="sample" markdown="1" theme="idea" data-highlight-only>

```kotlin
// Creating an instance of a class
val isEven = object : IntPredicate {
   override fun accept(i: Int): Boolean {
       return i % 2 == 0
   }
}
```

</div>

通过利用Kotlin的SAM转换，你可以改为以下等效代码：

<div class="sample" markdown="1" theme="idea" data-highlight-only>

```kotlin
// Creating an instance using lambda
val isEven = IntPredicate { it % 2 == 0 }
```

</div>

可以通过更短的lambda表达式替换所有不必要的代码。

<div class="sample" markdown="1" theme="idea" data-min-compiler-version="1.4-M1">

```kotlin
fun interface IntPredicate {
   fun accept(i: Int): Boolean
}

val isEven = IntPredicate { it % 2 == 0 }

fun main() {
   println("Is 7 even? - ${isEven.accept(7)}")
}
```

</div>

您也可以将[SAM转换用在Java接口上](java-interop.html#sam-conversions).

## 函数式接口与类型别名比较

功能接口和[类型别名](type-aliases.html) 具有不同的用途。类型别名只是现有类型的名称——它们不会创建新的类型，而功能接口却会创建新类型。

类型别名只能有一个成员，而函数式接口可以有多个非抽象成员和一个抽象成员。函数式接口还可以实现和扩展其他接口。

考虑到上述情况，函数式接口比类型别名更灵活并且提供了更多的功能。
