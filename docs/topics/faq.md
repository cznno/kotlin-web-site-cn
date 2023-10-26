[//]: # (title: FAQ)

### Kotlin 是什么？

Kotlin 是一门面向 JVM、Android、JavaScript、Wasm 以及原生平台的开源静态类型编程语言。 
它是由 [JetBrains](https://www.jetbrains.com) 开发的。该项目开始于 2010 年并且很早就已开源。
第一个官方 1.0 版发布于 2016 年 2 月。 

### Kotlin 的当前版本是多少？

目前发布的版本是 %kotlinVersion%，发布于 %kotlinReleaseDate%。  
可以[在 GitHub 上](https://github.com/jetbrains/kotlin)找到更多信息。

### Kotlin 是免费的吗？

是。Kotlin 是免费的，已经免费并会保持免费。它是遵循 Apache 2.0 许可证开发的，其源代码<!--
-->可以在 [GitHub](https://github.com/jetbrains/kotlin) 上获得。

### Kotlin 是面向对象还是函数式语言？

Kotlin 既具有面向对象又具有函数式结构。你既可以按 OO 风格也可以按 FP 风格使用，还可以混合使用两种风格。 
通过对诸如高阶函数、函数类型和 lambda 表达式等功能的一等支持，Kotlin 是一个很好的选择，
如果你正在进行或探索函数式编程的话。

### Kotlin 能给我超出 Java 语言的哪些优点？

Kotlin 更简洁。粗略估计显示，代码行数减少约 40％。
它也更安全，例如对不可空类型的支持使应用程序不易发生 NPE。
其他功能包括智能类型转换、高阶函数、扩展函数和带接收者的 lambda 表达式，提供了<!--
-->编写富于表现力的代码的能力以及易于创建 DSL 的能力。
 
### Kotlin 与 Java 语言兼容吗？

兼容。Kotlin 与 Java 语言可以 100％ 互操作，并且主要强调确保你现有的代码库<!--
-->可以与Kotlin 正确交互。你可以轻松地[在 Java 中调用 Kotlin 代码](java-to-kotlin-interop.md)以及[在 Kotlin
中调用 Java 代码](java-interop.md)。 这使得采用 Kotlin 更容易、风险更低。内置于
IDE 的自动化 [Java 到 Kotlin 转换器](mixing-java-kotlin-intellij.md#使用-j2k-将现有-java-文件转换为-kotlin-文件)可简化现有代码的迁移。

### 我可以用 Kotlin 做什么？

Kotlin 可用于任何类型的开发，无论是服务器端、客户端 Web 还是 Android。随着原生 Kotlin（Kotlin/Native）目前<!--
-->的进展，对其他平台（如嵌入式系统、macOS 和 iOS）的支持即将就绪。人们将 Kotlin 用于移动端<!--
-->和服务器端应用程序、使用 JavaScript 或 JavaFX的客户端、以及数据科学，仅举这几例。

### 我可以用 Kotlin 进行 Android 开发吗？

可以。Kotlin 已作为 Android 平台的一等语言而支持。已经有数百种应用程序在使用 Kotlin
用于 Android 开发，比如 Basecamp、Pinterest 等等。更多信息请查看 [Android 开发资源](android-overview.md)。

### 我可以用 Kotlin 进行服务器端开发吗？

可以。Kotlin 与 JVM 100％ 兼容，因此你可以使用任何现有的框架，如 Spring Boot、
vert.x 或 JSF。另外还有一些 Kotlin 写的特定框架，例如 [Ktor](https://ktor.kotlincn.net)。
更多信息请查看[服务器端开发资源](server-overview.md)。

### 我可以用 Kotlin 进行 web 开发吗？

可以。除了用于后端 Web，你还可以使用 Kotlin/Wasm 用于客户端 Web。 Learn how to [get started with Kotlin/Wasm](wasm-get-started.md).

### 我可以用 Kotlin 进行桌面开发吗？

可以。你可以使用任何 Java UI 框架如 JavaFx、Swing 或其他框架。
另外还有 Kotlin 特定框架，如 [TornadoFX](https://github.com/edvin/tornadofx)。

### 我可以用 Kotlin 进行原生开发吗？

可以。Kotlin/Native 是 Kotlin 项目的一部分。它将 Kotlin 编译成无需虚拟机（VM）即可运行的原生代码。
可以在主流的桌面与移动端平台甚至某些物联网（IoT）设备上试用。
更多详细信息请查阅 [Kotlin/Native 文档](native-overview.md)。

### 哪些 IDE 支持 Kotlin？

Kotlin 在 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/)、
[Android Studio](https://developer.android.com/kotlin/get-started) 与 [JetBrains Fleet](https://www.jetbrains.com/help/fleet/getting-started-with-kotlin-in-fleet.html)
中都有完整的开箱即用支持（内置 JetBrains 开发的官方 Kotlin 插件）。

其他 IDE 与源代码编辑器（例如 Eclipse、Visual Studio Code 与 Atom）有 Kotlin 社区支持的插件。

还可以尝试使用 [Kotlin Playground](https://play.kotlinlang.org) 在浏览器中编写、运行及共享
Kotlin 代码。

此外，还提供了[命令行编译器](command-line.md)，为编译与运行应用程序提供了直接的支持。
  
### 哪些构建工具支持 Kotlin？

在 JVM 端，主要构建工具包括 [Gradle](gradle.md)、[Maven](maven.md)、
[Ant](ant.md) 和 [Kobalt](https://beust.com/kobalt/home/index.html)。还有一些可用于构建客户端
JavaScript 的构建工具。

### Kotlin 会编译成什么？

当面向JVM 平台时，Kotlin 生成 Java 兼容的字节码。

当面向 JavaScript 时，Kotlin 会转译到 ES5.1，并生成与<!--
-->包括 AMD 和 CommonJS 在内的模块系统相兼容的代码。

当面向原生平台时，Kotlin 会（通过 LLVM）生成平台相关的代码。 

### Kotlin 面向哪些版本的 JVM？

Kotlin 会让你选择用于执行的 JVM 版本。默认情况下，Kotlin/JVM 编译器会生成兼容 Java 8 的字节码。
如果要利用 Java 新版本中提供的优化功能，可以将目标 Java
版本显式指定为 9 到 20。 请注意，这种情况下生成的字节码可能无法在较低版本中运行。
自 [Kotlin 1.5](whatsnew15.md#新的默认-jvm-目标-1-8)起，编译器不支持生成兼容低于 Java 8 版本的字节码。

### Kotlin 难吗？

Kotlin 是受 Java、C#、JavaScript、Scala 以及 Groovy 等现有语言的启发。我们已经努力确保
Kotlin 易于学习，
所以人们可以在几天之内轻松转向、阅读和编写 Kotlin。 
学习惯用的 Kotlin 和使用更多它的高级功能可能需要一点时间，但总体来说这不是一个复杂的语言。 
如需了解更多信息，请查阅[我们的学习资料](learning-materials-overview.md)。
 
### 哪些公司使用 Kotlin？
 
有太多使用 Kotlin 的公司可列，而有些更明显的公司已经公开宣布使用
Kotlin，分别通过博文、Github 版本库或者演讲宣布，包括
[Square](https://medium.com/square-corner-blog/square-open-source-loves-kotlin-c57c21710a17)、 [Pinterest](https://www.youtube.com/watch?v=mDpnc45WwlI)、
[Basecamp](https://m.signalvnoise.com/how-we-made-basecamp-3s-android-app-100-kotlin-35e4e1c0ef12) 以及 [Corda](https://docs.corda.net/releases/release-M9.2/further-notes-on-kotlin.html)。
 
### 谁开发 Kotlin？

Kotlin 主要由 [JetBrains 的一个工程师团队开发（目前团队规模为 100+）](https://www.jetbrains.com/)。
其首席语言设计师是 Michail Zarečenskij。除了核心团队，GitHub 上还有 250 多个外部贡献者。

### 在哪里可以了解关于 Kotlin 更多？

最好的起始地方好是[本网站](https://www.kotlincn.net)（原文是[英文官网](https://kotlinlang.org)）。从那里你可以[下载编译器](command-line.md)、
[在线尝试](https://play.kotlinlang.org)以及访问相关资源。

### 有没有关于 Kotlin 的图书？

有许多关于 Kotlin 的图书。其中一些我们已经审阅过并且可以推荐作为入门图书。 这些都列在了<!--
-->[图书](books.md)页。 如需了解更多图书，请参见 [kotlin.link](https://kotlin.link/) 上社区维护的列表。 

### Kotlin 有没有在线课程？

可以在学习 JetBrains Academy 的 [Kotlin 核心课程](https://hyperskill.org/tracks?category=4&utm_source=jbkotlin_hs&utm_medium=referral&utm_campaign=kotlinlang-docs&utm_content=button_1&utm_term=22.03.23)创建可工作应用程序的同时学习所有 Kotlin 基础知识。

可以选择的一些其他课程：
* [Pluralsight Course: Getting Started with Kotlin](https://www.pluralsight.com/courses/kotlin-getting-started)，作者：Kevin Jones
* [O'Reilly Course: Introduction to Kotlin Programming](https://www.oreilly.com/library/view/introduction-to-kotlin/9781491964125/)，作者：Hadi Hariri
* [Udemy Course: 10 Kotlin Tutorials for Beginneres](https://petersommerhoff.com/dev/kotlin/kotlin-beginner-tutorial/)，作者：Peter Sommerhoff

还可以在我们（官方）的 [YouTube 频道](https://www.youtube.com/c/Kotlin)上查看其他教程与内容。

### 有没有 Kotlin 社区？

有！Kotlin 有一个非常有活力的社区。Kotlin 开发人员常出现在 [Kotlin 论坛](https://discuss.kotlinlang.org)、
[StackOverflow](https://stackoverflow.com/questions/tagged/kotlin) 上并且更积极地活跃在 [Kotlin Slack](https://slack.kotlinlang.org)
（截至 2020 年 4 月有近 30000 名成员）上。

### 有没有 Kotlin 活动？
 
有！现在有很多用户组和集会组专注于 Kotlin。你可以[在网站上找到一个列表](https://kotlinlang.org/user-groups/user-group-list.html)。
此外，还有世界各地的社区组织的 [Kotlin 之夜](https://kotlinlang.org/community/events.html)活动。

### 有没有 Kotlin 大会？

有！ [KotlinConf](https://kotlinconf.com/) 是由 JetBrains 主办的年度大会，汇集了来自世界各地的开发者、爱好者<!-- 
-->与专家，分享他们的 Kotlin 知识与经验。

除了技术讲座与研讨会之外，KotlinConf 还提供联络机会、社区互动<!-- 
-->与社交活动，与会者可以与其他 Kotliner 联系并交流想法。
它是在 Kotlin 生态系统内促进协作与社区建设的一个平台。

Kotlin 也会在全球不同地方举行大会。你可以在
[官网上找到即将到来的会谈](https://kotlinlang.org/community/talks.html?time=upcoming)列表。

### Kotlin 上社交媒体吗？

上。
可以订阅 [Kotlin YouTube 频道](https://www.youtube.com/c/Kotlin)以及在 [Twitter 上](https://twitter.com/kotlin)关注 Kotlin。

### 其他在线 Kotlin 资源呢？

网站上有一堆[在线资源](https://kotlinlang.org/community/)，包括社区成员的 [Kotlin 文摘](https://kotlin.link)、
[通讯](http://kotlinweekly.net)、[播客](https://talkingkotlin.com)等等。

### 在哪里可以获得高清 Kotlin 徽标？

徽标可以在[这里](https://resources.jetbrains.com/storage/products/kotlin/docs/kotlin_logos.zip)下载。
使用该徽标时，请遵循压缩包中的 `guidelines.pdf` 以及 [Kotlin 品牌使用指南](https://kotlinfoundation.org/guidelines/) 中的简单规则。

如需了解更多信息，请查阅 [Kotlin 品牌素材](kotlin-brand-assets.md)页。
