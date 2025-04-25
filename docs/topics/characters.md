[//]: # (title: 字符)

字符用 `Char` 类型表示。
字符字面值用单引号括起来: `'1'`。

> On the JVM, a character stored as primitive type: `char`, represents a 16-bit Unicode character.
>
{style="note"}

特殊字符可以以转义反斜杠 `\` 开始。
支持这几个转义序列： 

* `\t`——制表符
* `\b`——退格符
* `\n`——换行（LF）
* `\r`——回车（CR）
* `\'`——单引号
* `\"`——双引号
* `\\`——反斜杠
* `\$`——美元符

编码其他字符要用 Unicode 转义序列语法：`'\uFF00'`。

```kotlin
fun main() {
//sampleStart
    val aChar: Char = 'a'
 
    println(aChar)
    println('\n') // 输出一个额外的换行符
    println('\uFF00')
//sampleEnd
}
```
{kotlin-runnable="true" kotlin-min-compiler-version="1.3"}

如果字符变量的值是数字，那么可以使用 [`digitToInt()`](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/digit-to-int.html) 函数将其显式转换为 `Int` 数字。

> 在JVM 平台，当需要可空引用时字符会是装箱的 Java 类，类似于[数字](numbers.md#boxing-and-caching-numbers-on-the-java-virtual-machine)。
> 装箱操作不保留同一性。
>
{style="note"}