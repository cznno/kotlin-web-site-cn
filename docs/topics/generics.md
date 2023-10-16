[//]: # (title: 泛型：in、out、where)

Kotlin 中的类可以有类型参数，与 Java 类似：

```kotlin
class Box<T>(t: T) {
    var value = t
}
```

创建这样类的实例只需提供类型参数即可：

```kotlin
val box: Box<Int> = Box<Int>(1)
```

但是如果类型参数可以推断出来，例如从构造函数的参数或者从其他途径，
就可以省略类型参数：

```kotlin
val box = Box(1) // 1 具有类型 Int，所以编译器推算出它是 Box<Int>
```

## 型变

Java 类型系统中最棘手的部分之一是通配符类型（参见 [Java Generics FAQ](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)）。
而 Kotlin 中没有。 相反，Kotlin 有声明处型变（declaration-site variance）与类型投影（type projections）。

我们来思考下为什么 Java 需要这些神秘的通配符。在
[《Effective Java》第三版](http://www.oracle.com/technetwork/java/effectivejava-136174.html) 很好地解释了该问题——
第 31 条：*利用有限制通配符来提升 API 的灵活性*。
首先，Java 中的泛型是*不型变的*，这意味着 `List<String>` 并*不是* `List<Object>` 的子类型。
如果 `List` 不是*不型变的*，它就没比 Java 的数组好到哪去，因为如下代码会<!--
-->通过编译但是导致运行时异常：

```java
// Java
List<String> strs = new ArrayList<String>();
List<Object> objs = strs; // ！！！此处的编译器错误让我们避免了之后的运行时异常。
objs.add(1); // 将一个整数放入一个字符串列表
String s = strs.get(0); // ！！！ ClassCastException：无法将整数转换为字符串
```

Java 禁止这样的事情以保证运行时的安全。但这样会有一些影响。例如，
考虑 `Collection` 接口中的 `addAll()` 方法。该方法的签名应该是什么？直觉上，
需要这样写：

```java
// Java
interface Collection<E> …… {
    void addAll(Collection<E> items);
}
```

但随后，就无法做到以下这样（完全安全的）的事：

```java
// Java
void copyAll(Collection<Object> to, Collection<String> from) {
    to.addAll(from);
  // ！！！对于这种简单声明的 addAll 将不能编译：
  // Collection<String> 不是 Collection<Object> 的子类型
}
```

（在 Java 中，你很可能艰难地学到了这个教训，参见[《Effective Java》第三版](http://www.oracle.com/technetwork/java/effectivejava-136174.html)，
第 28 条：*列表优先于数组*）

这就是为什么 `addAll()` 的实际签名是以下这样：

```java
// Java
interface Collection<E> …… {
    void addAll(Collection<? extends E> items);
}
```

*通配符类型参数* `? extends E` 表示此方法接受 `E`
*或者 `E` 的一个子类型*对象的集合，而不只是 `E` 自身。 这意味着我们可以安全地从其中
（该集合中的元素是 E 的子类的实例）*读取* `E`，但*不能写入*，
因为我们不知道什么对象符合那个未知的 `E` 的子类型。
反过来，该限制可以得到想要的行为：`Collection<String>` 表示为 `Collection<? extends Object>` 的子类型。
简而言之，带 *extends* 限定（*上界*）的通配符类型使得类型是*协变的（covariant）*。

理解为什么这能够工作的关键相当简单：如果只能从集合中获取元素，
那么使用 `String` 的集合， 并且从其中读取 `Object` 也没问题 。反过来，如果只能向集合中
_放入_ 元素 ， 就可以用 `Object` 集合并向其中放入 `String`：in Java there is
`List<? super String>`, which accepts `String`s or any of its supertypes.

后者称为*逆变性（contravariance）*，并且对于 `List <? super String>` 你只能调用接受 `String` 作为参数的方法
（例如，你可以调用 `add(String)` 或者 `set(int, String)`），如果调用函数返回 `List<T>` 中的 `T`，
你得到的并非一个 `String` 而是一个 `Object`。

Joshua Bloch 称那些你只能*从中读取*的对象为*生产者*，并称那些只能*向其写入*的对象为*消费者*。他建议：

> “为了灵活性最大化，在表示生产者或消费者的输入参数上使用通配符类型”，
> 并提出了以下助记符：
>
> _PECS 代表生产者-Extends、消费者-Super（Producer-Extends, Consumer-Super）。_
>
{type="tip"}

> 如果你使用一个生产者对象，如 `List<? extends Foo>`，在该对象上不允许调用 `add()` 或 `set()`，
> 但这并不意味着它是*不可变的*：例如，没有什么阻止你调用 `clear()`
> 从列表中删除所有元素，因为 `clear()` 根本无需任何参数。
>
> 通配符（或其他类型的型变）保证的唯一的事情是*类型安全*。不可变性完全是另一回事。
>
{type="note"}

### 声明处型变

假设有一个泛型接口 `Source<T>`，该接口中不存在任何以 `T` 作为参数的方法，只是方法返回 `T` 类型值：

```java
// Java
interface Source<T> {
    T nextT();
}
```

那么，在 `Source <Object>` 类型的变量中存储 `Source <String>` 实例的引用是极为安全的——
没有消费者-方法可以调用。但是 Java 并不知道这一点，并且仍然禁止这样操作：

```java
// Java
void demo(Source<String> strs) {
  Source<Object> objects = strs; // ！！！在 Java 中不允许
  // ……
}
```

为了修正这一点，我们必须声明对象的类型为 `Source<? extends Object>`。这么做毫无意义，
因为我们可以像以前一样在该对象上调用所有相同的方法，所以更复杂的类型并没有带来价值。
但编译器并不知道。

在 Kotlin 中，有一种方法向编译器解释这种情况。这称为*声明处型变*：
可以标注 `Source` 的*类型参数* `T` 来确保它仅从
`Source<T>` 成员中*返回*（生产），并从不被消费。
为此请使用 `out` 修饰符：

```kotlin
interface Source<out T> {
    fun nextT(): T
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs // 这个没问题，因为 T 是一个 out-参数
    // ……
}
```

一般原则是：当一个类 `C` 的类型参数 `T` 被声明为 `out` 时，它就只能出现在 `C` 的成员的*输出*-位置，
但回报是 `C<Base>` 可以安全地作为 `C<Derived>` 的超类。

简而言之，可以说类 `C` 是在参数 `T` 上是*协变的*，或者说 `T` 是一个*协变的*类型参数。
可以认为 `C` 是 `T` 的*生产者*，而不是 `T` 的*消费者*。

`out` 修饰符称为*型变注解*，并且由于它在类型参数声明处提供，
所以它提供了*声明处型变*。
这与 Java 的*使用处型变*相反，其类型用途通配符使得类型协变。

另外除了 `out`，Kotlin 又补充了一个型变注解：`in`。它使得一个类型参数*逆变*，即<!--
-->只可以消费而不可以生产。逆变类型的一个很好的例子是 `Comparable`：

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}

fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0 拥有类型 Double，它是 Number 的子类型
    // 因此，可以将 x 赋给类型为 Comparable <Double> 的变量
    val y: Comparable<Double> = x // OK！
}
```

_in_ 和 _out_ 两词看起来是自解释的（因为它们已经在 C# 中成功使用很长时间了），
因此上面提到的助记符不是真正需要的。可以将其改写为更高级的抽象：

**[存在性（The Existential）](https://zh.wikipedia.org/wiki/%E5%AD%98%E5%9C%A8%E4%B8%BB%E4%B9%89) 变换：消费者 in, 生产者 out\!** :-)

## 类型投影

### 使用处型变：类型投影

将类型参数 `T` 声明为 `out` 非常简单，并且能避免使用处子类型化的麻烦，
但是有些类实际上*不能*限制为只返回 `T`！
一个很好的例子是 `Array`：

```kotlin
class Array<T>(val size: Int) {
    operator fun get(index: Int): T { …… }
    operator fun set(index: Int, value: T) { …… }
}
```

该类在 `T` 上既不能是协变的也不能是逆变的。这造成了一些不灵活性。考虑下述函数：

```kotlin
fun copy(from: Array<Any>, to: Array<Any>) {
    assert(from.size == to.size)
    for (i in from.indices)
        to[i] = from[i]
}
```

这个函数应该将项目从一个数组复制到另一个数组。让我们尝试在实践中应用它：

```kotlin
val ints: Array<Int> = arrayOf(1, 2, 3)
val any = Array<Any>(3) { "" } 
copy(ints, any)
//   ^ 其类型为 Array<Int> 但此处期望 Array<Any>
```

这里我们遇到同样熟悉的问题：`Array <T>` 在 `T` 上是*不型变的*，因此 `Array <Int>` 与 `Array <Any>` 都不是<!--
-->另一个的子类型。为什么？ 再次重复，因为 `copy` *可能*有非预期行为，例如它可能尝试写一个 `String` 到 `from`，
并且如果我们实际上传递一个 `Int` 的数组，以后会抛 `ClassCastException` 异常。

To prohibit the `copy` function from _writing_ to `from`, you can do the following:

```kotlin
fun copy(from: Array<out Any>, to: Array<Any>) { …… }
```

这就是*类型投影*：意味着 `from` 不仅仅是一个数组，而是一个受限制的（*投影的*）数组。
只可以调用返回类型为类型参数 `T` 的方法，如上，这意味着只能调用 `get()`。
这就是*使用处型变*的用法，并且是对应于 Java 的 `Array<? extends Object>`、 但更简单。

你也可以使用 `in` 投影一个类型：

```kotlin
fun fill(dest: Array<in String>, value: String) { …… }
```

`Array<in String>` 对应于 Java 的 `Array<? super String>`，也就是说，你可以传递一个 `CharSequence` 数组<!--
-->或一个 `Object` 数组给 `fill()` 函数。

### 星投影

有时你想说，你对类型参数一无所知，但仍然希望以安全的方式使用它。
这里的安全方式是定义泛型类型的这种投影，该泛型类型的每个具体实例化<!--
-->都会是该投影的子类型。

Kotlin 为此提供了所谓的*星投影*语法：

 - 对于 `Foo <out T : TUpper>`，其中 `T` 是一个具有上界 `TUpper` 的协变类型参数，`Foo <*>`
 等价于 `Foo <out TUpper>`。 意味着当 `T` 未知时，你可以安全地从 `Foo <*>` *读取* `TUpper` 的值。
 - 对于 `Foo <in T>`，其中 `T` 是一个逆变类型参数，`Foo <*>` 等价于 `Foo <in Nothing>`。 意味着当 `T` 未知时，
 没有什么可以以安全的方式*写入* `Foo <*>`。
 - 对于 `Foo <T : TUpper>`，其中 `T` 是一个具有上界 `TUpper` 的不型变类型参数，`Foo<*>` 对于读取值时等价<!--
 -->于 `Foo<out TUpper>` 而对于写值时等价于`Foo<in Nothing>`。

如果泛型类型具有多个类型参数，则每个类型参数都可以单独投影。
例如，如果类型被声明为 `interface Function <in T, out U>`，可以使用以下星投影：

* `Function<*, String>` 表示 `Function<in Nothing, String>`。
* `Function<Int, *>` 表示 `Function<Int, out Any?>`。
* `Function<*, *>` 表示 `Function<in Nothing, out Any?>`。

> 星投影非常像 Java 的原始类型，但是安全。
>
{type="note"}

## 泛型函数

不仅类可以有类型参数。函数也可以有。类型参数要放在函数名称*之前*：

```kotlin
fun <T> singletonList(item: T): List<T> {
    // ……
}

fun <T> T.basicToString(): String { // 扩展函数
    // ……
}
```

要调用泛型函数，在调用处函数名*之后*指定类型参数即可：

```kotlin
val l = singletonList<Int>(1)
```

可以省略能够从上下文中推断出来的类型参数，所以以下示例同样适用：

```kotlin
val l = singletonList(1)
```

## 泛型约束

能够替换给定类型参数的所有可能类型的集合可以由*泛型约束*限制。

### 上界

最常见的约束类型是*上界*，与 Java 的 `extends` 关键字对应：

```kotlin
fun <T : Comparable<T>> sort(list: List<T>) {  …… }
```

冒号之后指定的类型是*上界*，表明只有 `Comparable<T>` 的子类型可以替代 `T`。 例如：

```kotlin
sort(listOf(1, 2, 3)) // OK。Int 是 Comparable<Int> 的子类型
sort(listOf(HashMap<Int, String>())) // 错误：HashMap<Int, String> 不是 Comparable<HashMap<Int, String>> 的子类型
```

默认的上界（如果没有声明）是 `Any?`。在尖括号中只能指定一个上界。
如果同一类型参数需要多个上界，需要一个单独的 *where*\-子句：

```kotlin
fun <T> copyWhenGreater(list: List<T>, threshold: T): List<String>
    where T : CharSequence,
          T : Comparable<T> {
    return list.filter { it > threshold }.map { it.toString() }
}
```

所传递的类型必须同时满足 `where` 子句的所有条件。在上述示例中，类型 `T` 必须
*既*实现了 `CharSequence` *也*实现了 `Comparable`。

## Definitely non-nullable types

To make interoperability with generic Java classes and interfaces easier, Kotlin supports declaring a generic type parameter
as **definitely non-nullable**. 

To declare a generic type `T` as definitely non-nullable, declare the type with `& Any`. For example: `T & Any`.

A definitely non-nullable type must have a nullable [upper bound](#上界).

The most common use case for declaring definitely non-nullable types is when you want to override a Java method that 
contains `@NotNull` as an argument. For example, consider the `load()` method:

```java
import org.jetbrains.annotations.*;

public interface Game<T> {
    public T save(T x) {}
    @NotNull
    public T load(@NotNull T x) {}
}
```

To override the `load()` method in Kotlin successfully, you need `T1` to be declared as definitely non-nullable:

```kotlin
interface ArcadeGame<T1> : Game<T1> {
    override fun save(x: T1): T1
    // T1 is definitely non-nullable
    override fun load(x: T1 & Any): T1 & Any
}
```

When working only with Kotlin, it's unlikely that you will need to declare definitely non-nullable types explicitly because 
Kotlin's type inference takes care of this for you.

## 类型擦除

Kotlin 为泛型声明用法执行的类型安全检测在编译期进行。
运行时泛型类型的实例不保留关于其类型实参的任何信息。
其类型信息称为被*擦除*。例如，`Foo<Bar>` 与 `Foo<Baz?>` 的实例都会被擦除为
`Foo<*>`。

### 泛型类型检测与类型转换

由于类型擦除，并没有通用的方法在运行时检测一个泛型类型的实例是否通过指定类型参数所创建
，并且编译器禁止这种 `is` 检测，例如
`ints is List<Int>` or `list is T` (type parameter). 当然，你可以对一个实例检测星投影的类型：

```kotlin
if (something is List<*>) {
    something.forEach { println(it) } // 每一项的类型都是 `Any?`
}
```

类似地，当已经让一个实例的类型参数（在编译期）静态检测，
就可以对涉及非泛型部分做 `is` 检测或者类型转换。请注意，
在这种情况下，会省略尖括号：

```kotlin
fun handleStrings(list: MutableList<String>) {
    if (list is ArrayList) {
        // `list` 智能转换为 `ArrayList<String>`
    }
}
```

省略类型参数的这种语法可用于不考虑类型参数的类型转换：`list as ArrayList`。

泛型函数调用的类型参数也同样只在编译期检测。在函数体内部，
类型参数不能用于类型检测，并且类型转换为类型参数（`foo as T`）也是非受检的。
The only exclusion is inline functions with [reified type parameters](inline-functions.md#具体化的类型参数),
which have their actual type arguments inlined at each call site. This enables type checks and casts for the type parameters.
However, the restrictions described above still apply for instances of generic types used inside checks or casts.
For example, in the type check `arg is T`, if `arg` is an instance of a generic type itself, its type arguments are still erased.

```kotlin
//sampleStart
inline fun <reified A, reified B> Pair<*, *>.asPairOf(): Pair<A, B>? {
    if (first !is A || second !is B) return null
    return first as A to second as B
}

val somePair: Pair<Any?, Any?> = "items" to listOf(1, 2, 3)


val stringToSomething = somePair.asPairOf<String, Any>()
val stringToInt = somePair.asPairOf<String, Int>()
val stringToList = somePair.asPairOf<String, List<*>>()
val stringToStringList = somePair.asPairOf<String, List<String>>() // Compiles but breaks type safety!
// Expand the sample for more details

//sampleEnd

fun main() {
    println("stringToSomething = " + stringToSomething)
    println("stringToInt = " + stringToInt)
    println("stringToList = " + stringToList)
    println("stringToStringList = " + stringToStringList)
    //println(stringToStringList?.second?.forEach() {it.length}) // This will throw ClassCastException as list items are not String
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

### 非受检类型转换

类型转换为带有具体类型参数的泛型类型，如 `foo as List<String>` 无法在运行时检测。
当高级程序逻辑隐含了类型转换的类型安全而无法直接通过编译器推断时，
可以使用这种非受检类型转换。 See the example below.

```kotlin
fun readDictionary(file: File): Map<String, *> = file.inputStream().use { 
    TODO("Read a mapping of strings to arbitrary elements.")
}

// 我们已将存有一些 `Int` 的映射保存到这个文件
val intsFile = File("ints.dictionary")

// Warning: Unchecked cast: `Map<String, *>` to `Map<String, Int>`
val intsDictionary: Map<String, Int> = readDictionary(intsFile) as Map<String, Int>
```
最后一行的类型转换会出现一个警告。编译器无法在运行时完全检测该类型转换，并且<!--
-->不能保证映射中的值是“Int”。

为避免未受检类型转换，可以重新设计程序结构。在上例中，可以使用具有类型安全实现的不同接口
`DictionaryReader<T>` 与 `DictionaryWriter<T>`。
可以引入合理的抽象，将未受检的类型转换从调用处移动到实现细节中。
正确使用[泛型型变](#型变)也有帮助。

对于泛型函数，使用[具体化的类型参数](inline-functions.md#具体化的类型参数)可以使<!-- 
-->形如 `arg as T` 这样的类型转换受检，除非 `arg` 对应类型的*自身*类型参数已被擦除。

可以通过在产生警告的语句或声明上用注解 `@Suppress("UNCHECKED_CAST")`
[标注](annotations.md)来禁止未受检类型转换警告：

```kotlin
inline fun <reified T> List<*>.asListOfType(): List<T>? =
    if (all { it is T })
        @Suppress("UNCHECKED_CAST")
        this as List<T> else
        null
```

>**对于 JVM 平台**：[数组类型](arrays.md)（`Array<Foo>`）会保留关于<!--
-->其元素被擦除类型的信息，并且类型转换为一个数组类型可以部分受检：
元素类型的可空性与类型实参仍然会被擦除。例如，
如果 `foo` 是一个保存了任何 `List<*>`（无论可不可空）的数组的话，类型转换 `foo as Array<List<String>?>` 都会成功。
>
{type="note"}

## Underscore operator for type arguments

The underscore operator `_` can be used for type arguments. Use it to automatically infer a type of the argument when other types are explicitly specified:

```kotlin
abstract class SomeClass<T> {
    abstract fun execute() : T
}

class SomeImplementation : SomeClass<String>() {
    override fun execute(): String = "Test"
}

class OtherImplementation : SomeClass<Int>() {
    override fun execute(): Int = 42
}

object Runner {
    inline fun <reified S: SomeClass<T>, T> run() : T {
        return S::class.java.getDeclaredConstructor().newInstance().execute()
    }
}

fun main() {
    // T is inferred as String because SomeImplementation derives from SomeClass<String>
    val s = Runner.run<SomeImplementation, _>()
    assert(s == "Test")

    // T is inferred as Int because OtherImplementation derives from SomeClass<Int>
    val n = Runner.run<OtherImplementation, _>()
    assert(n == 42)
}
```
