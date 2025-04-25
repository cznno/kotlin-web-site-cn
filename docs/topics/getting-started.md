[//]: # (title: Kotlin 入门)

<tldr>
<p>Latest Kotlin release:<b> <a href="%kotlinLatestWhatsnew%">%kotlinVersion%</a></b></p>
</tldr>

Kotlin 是一门现代但已成熟的编程语言，旨在让开发人员更幸福快乐。
它简洁、安全、可与 Java 及其他语言互操作，并提供了多种方式在多个平台间复用代码，以实现高效编程。

首先，何不参加 Kotlin 之旅[^1]呢？ 该教程涵盖了 Kotlin 编程语言的基础知识 and can
be completed entirely within your browser.

<a href="kotlin-tour-welcome.md"><img src="start-kotlin-tour.svg" width="700" alt="Start the Kotlin tour" style="block"/></a>

## 安装 Kotlin

Kotlin 已包含在每个 [IntelliJ IDEA](https://www.jetbrains.com/idea/download/) 与 [Android Studio](https://developer.android.com/studio) 版本中了。  
可下载并安装这两个 IDE 之一来开始使用 Kotlin。

## Choose your Kotlin use case
 
<tabs>

<tab id="console" title="Console">

Here you'll learn how to develop a console application and create unit tests with Kotlin.

1. **[Create a basic JVM application with the IntelliJ IDEA project wizard](jvm-get-started.md).**

2. **[Write your first unit test](jvm-test-using-junit.md).**

</tab>

<tab id="backend" title="后端">

Here you'll learn how to develop a backend application with Kotlin server-side.

1. **创建第一个后端应用程序：**

     * [Create a RESTful web service with Spring Boot](jvm-get-started-spring-boot.md)
     * [Create HTTP APIs with Ktor](https://ktor.io/docs/creating-http-apis.html)

2. **[Learn how to mix Kotlin and Java code in your application](mixing-java-kotlin-intellij.md).**

</tab>

<tab id="cross-platform-mobile" title="跨平台">

在此可以了解到如何使用 [Kotlin 多平台](multiplatform-intro.md)开发跨平台应用程序。

1. **[搭建用于跨平台开发的环境](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-setup.html).**

2. **创建第一个用于 iOS 与 Android 应用程序：**

   * Create a cross-platform application from scratch and:
     * [Share business logic while keeping the UI native](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-create-first-app.html)
     * [Share business logic and UI](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-create-first-app.html)
   * [Make your existing Android application work on iOS](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-integrate-in-existing-app.html)
   * [Create a cross-platform application using Ktor and SQLdelight](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-ktor-sqldelight.html)

3. **Explore [sample projects](https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-samples.html)**.

</tab>

<tab id="android" title="Android">

* 如需开始使用 Kotlin 用于 Android 开发，请阅读 [谷歌对 Android 上 Kotlin 入门的建议](https://developer.android.com/kotlin/get-started)。

</tab>

<tab id="data-analysis" title="Data analysis">

From building data pipelines to productionizing machine learning models, Kotlin is a great choice for working with data and getting the most out of it.

1. **Create and edit notebooks seamlessly within the IDE:**

   * [Get started with Kotlin Notebook](get-started-with-kotlin-notebooks.md)

2. **Explore and experiment with your data:**

   * [DataFrame](https://kotlin.github.io/dataframe/overview.html) – a library for data analysis and manipulation.
   * [Kandy](https://kotlin.github.io/kandy/welcome.html) – a plotting tool for data visualization.

3. **Follow Kotlin for Data Analysis on Twitter:** [KotlinForData](http://twitter.com/KotlinForData).

</tab>

</tabs>

## Join the Kotlin community

Stay in the loop with the latest updates across the Kotlin ecosystem and share your experience.

* Join us on:
  * ![Slack](slack.svg){width=25}{type="joined"} Slack: [get an invite](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up).
  * ![StackOverflow](stackoverflow.svg){width=25}{type="joined"} StackOverflow: subscribe to the ["kotlin"](https://stackoverflow.com/questions/tagged/kotlin) tag.
* Follow Kotlin on ![YouTube](youtube.svg){width=25}{type="joined"} [Youtube](https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw), ![Twitter](twitter.svg){width=18}{type="joined"} [Twitter](https://twitter.com/kotlin), ![Bluesky](bsky.svg){width=18}{type="joined"} [Bluesky](https://bsky.app/profile/kotlinlang.org), and ![Reddit](reddit.svg){width=25}{type="joined"} [Reddit](https://www.reddit.com/r/Kotlin/).
* Subscribe to [Kotlin news](https://info.jetbrains.com/kotlin-communication-center.html).

If you encounter any difficulties or problems, report an issue in our [issue tracker](https://youtrack.jetbrains.com/issues/KT).

## 还缺少什么？

如果本页有任何遗漏或令人困惑之处，请[提交反馈](https://surveys.hotjar.com/d82e82b0-00d9-44a7-b793-0611bf6189df)。

---

[^1]: 译注：此处双关，“tour of Kotlin”字面意为“科特林岛之旅”，此处意为“Kotlin（入门）教程”。
