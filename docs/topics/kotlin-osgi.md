[//]: # (title: Kotlin 与 OSGi)

如果想要在项目中启用 Kotlin [OSGi](https://www.osgi.org/) 支持，需要引入 `kotlin-osgi-bundle` 而不是<!--
-->常规的 Kotlin 库。 建议删除 `kotlin-runtime`、 `kotlin-stdlib` 与 `kotlin-reflect` 依赖，
因为 `kotlin-osgi-bundle` 已经包含了所有这些。当引入外部 Kotlin 库时也应该注意。
大多数常规 Kotlin 依赖不是 OSGi-就绪的，所以不应该使用且应从项目中删除<!--
-->。

## Maven

将 Kotlin OSGi 包引入到 Maven 项目中：

```xml
<dependencies>
    <dependency>
        <groupId>org.jetbrains.kotlin</groupId>
        <artifactId>kotlin-osgi-bundle</artifactId>
        <version>${kotlin.version}</version>
    </dependency>
</dependencies>
```

从外部库中排除标准库（注意“星排除”只在 Maven 3 中有效）：

```xml
<dependency>
    <groupId>some.group.id</groupId>
    <artifactId>some.library</artifactId>
    <version>some.library.version</version>

    <exclusions>
        <exclusion>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## Gradle

将 `kotlin-osgi-bundle` 引入到 Gradle 项目中：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation(kotlin("osgi-bundle"))
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation "org.jetbrains.kotlin:kotlin-osgi-bundle:%kotlinVersion%"
}
```

</tab>
</tabs>

要排除作为传递依赖的默认 Kotlin 库，你可以使用以下方法：

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
dependencies {
    implementation("some.group.id:some.library:someversion") {
        exclude(group = "org.jetbrains.kotlin")
    }
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
dependencies {
    implementation('some.group.id:some.library:someversion') {
        exclude group: 'org.jetbrains.kotlin'
    }
}
```

</tab>
</tabs>

## FAQ

### 为什么不只是添加必需的清单选项到所有 Kotlin 库

尽管它是提供 OSGi 支持的最好的方式，遗憾的是现在做不到，是因为不能轻易消除的所谓的
[“包拆分”问题](https://docs.osgi.org/specification/osgi.core/7.0.0/framework.module.html#d0e5999)并且这么大的变化<!--
-->不可能现在规划。有 `Require-Bundle` 功能，但它也不是最好的选择，不推荐使用。
所以决定为 OSGi 做一个单独的构件。

