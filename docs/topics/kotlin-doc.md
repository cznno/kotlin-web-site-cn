[//]: # (title: 编写 Kotlin 代码文档：KDoc)

用来编写 Kotlin 代码文档的语言（相当于 Java 的 Javadoc）称为 **KDoc**。本质上 KDoc
是将 Javadoc 的块标签（block tags）语法（扩展为支持 Kotlin 的特定构造）和 Markdown 的<!--
-->内联标记（inline markup）结合在一起。

> Kotlin 的文档引擎：Dokka，理解 KDoc 并可以用于生成各种格式的文档。
> 更多信息请参阅 [Dokka 文档](dokka-introduction.md)。
>
{type="note"}

## KDoc 语法

像 Javadoc 一样，KDoc 注释也以 `/**` 开头、以 `*/` 结尾。注释的每一行可以以<!--
-->星号开头，该星号不会当作注释内容的一部分。

按惯例来说，文档文本的第一段（到第一行空白行结束）是该元素的<!--
-->总体描述，接下来的注释是详细描述。

每个块标签都以一个新行开始且以 `@` 字符开头。

以下是使用 KDoc 编写类文档的一个示例：

```kotlin
/**
 * 一组*成员*。
 *
 * 这个类没有有用的逻辑; 它只是一个文档示例。
 *
 * @param T 这个组中的成员的类型。
 * @property name 这个组的名称。
 * @constructor 创建一个空组。
 */
class Group<T>(val name: String) {
    /**
     * 将 [member] 添加到这个组。
     * @return 这个组的新大小。
     */
    fun add(member: T): Int { …… }
}
```

### 块标签

KDoc 目前支持以下块标签（block tags）：

### @param *名称*

用于函数的值参数或者类、属性或函数的类型参数。
为了更好地将参数名称与描述分开，如果你愿意，可以将参数的名称括在<!--
-->方括号中。因此，以下两种语法是等效的：

```none
@param name 描述。
@param[name] 描述。
```

### @return

用于函数的返回值。

### @constructor

用于类的主构造函数。

### @receiver

用于扩展函数的接收者。

### @property *名称*

用于类中具有指定名称的属性。这个标签可用于在<!--
-->主构造函数中声明的属性，当然直接在属性定义的前面放置 doc 注释会很<!--
-->别扭。

### @throws *类*、 @exception *类*

用于方法可能抛出的异常。因为 Kotlin 没有受检异常，所以<!--
-->也没有期望所有可能的异常都写文档，但是当它会为类的用户提供有用的信息时，
仍然可以使用这个标签。

### @sample *标识符*

将具有指定限定的名称的函数的主体嵌入到当前元素的文档中，
以显示如何使用该元素的示例。

### @see *标识符*

将到指定类或方法的链接添加到文档的**另请参见**块。

### @author

指定要编写文档的元素的作者。

### @since

指定要编写文档的元素引入时的软件版本。

### @suppress

从生成的文档中排除元素。可用于不是模块的官方 API 的一部分<!--
-->但还是必须在对外可见的元素。

> KDoc 不支持 `@deprecated` 这个标签。作为替代，请使用 `@Deprecated` 注解。
>
{type="note"}

## 内联标记

对于内联标记，KDoc 使用常规 [Markdown](https://daringfireball.net/projects/markdown/syntax) 语法，扩展<!--
-->了支持用于链接到代码中其他元素的简写语法。

### 链接到元素

要链接到另一个元素（类、方法、属性或参数），只需将其名称放在方括号中：

```none
为此目的，请使用方法 [foo]。
```

如果要为链接指定自定义标签（label），add it in another set of square brackets before the element link:

```none
为此目的，请使用[这个方法][foo]。
```

你还可以在元素链接中使用限定的名称。请注意，与 Javadoc 不同，限定的名称总是使用点字符<!--
-->来分隔组件，即使在方法名称之前：

```none
使用 [kotlin.reflect.KClass.properties] 来枚举类的属性。
```

元素链接中的名称与正写文档的元素内使用该名称使用相同的规则解析。
特别是，这意味着如果你已将名称导入当前文件，那么当你在 KDoc 注释中使用它时，
不需要再对其进行完整限定。

请注意 KDoc 没有用于解析链接中的重载成员的任何语法。 因为 Kotlin 的文档生成<!--
-->工具将一个函数的所有重载的文档放在同一页面上，标识一个特定的重载函数<!--
-->并不是链接生效所必需的。

### External links

To add an external link, use the typical Markdown syntax:

```none
For more information about KDoc syntax, see [KDoc](<example-URL>).
```

## 下一步做什么？

了解如何使用 Kotlin 的文档生成工具：[Dokka](dokka-introduction.md)。
