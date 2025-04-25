[//]: # (title: Kotlin/Native 库)

## Kotlin 编译器细节

用 Kotlin/Native 编译器生成一个库，请使用 `-produce library` 或者 `-p library` 标志。例如：

```bash
$ kotlinc-native foo.kt -p library -o bar
```

这个命令会生成一个带有 `foo.kt` 编译后的内容的库 `bar.klib`。

链接到一个库请使用 `-library ﹤库名﹥` or `-l ﹤库名﹥` 标志。例如：

```bash
$ kotlinc-native qux.kt -l bar
```

这个命令会由 `qux.kt` 与 `bar.klib` 生成 `program.kexe`

## cinterop 工具细节

**cinterop** 工具为原生库生成 `.klib` 包装作为其主要输出。
例如，使用 Kotlin/Native 发行版中提供的简单 `libgit2.def` 原生库定义文件

```bash
$ cinterop -def samples/gitchurn/src/nativeInterop/cinterop/libgit2.def -compiler-option -I/usr/local/include -o libgit2
```

会得到 `libgit2.klib`。

更多详情请参见 [C Interop](native-c-interop.md).

## klib 实用程序

**klib** 库管理实用程序可以探查与安装库。

可以使用以下命令：

* `content` – list library contents:

  ```bash
$ klib contents ﹤库名﹥
  ```

* `info`——探查库的簿记细节

  ```bash
$ klib info ﹤库名﹥
  ```

* `install`——将库安装到默认位置，使用

  ```bash
$ klib install ﹤库名﹥
  ```

* `remove`——将库从默认存储库中删除，使用 

  ```bash
$ klib remove ﹤库名﹥
  ```

上述所有命令都接受一个额外的 `-repository ﹤目录﹥` 参数，用于指定与默认不同的存储库。

```bash
$ klib ﹤命令﹥ ﹤库名﹥ -repository ﹤目录﹥
```

## 几个示例

首先创建一个库。
将微型库的源代码写到 `kotlinizer.kt` 中：

```kotlin
package kotlinizer
val String.kotlinized
    get() = "Kotlin $this"
```

```bash
$ kotlinc-native kotlinizer.kt -p library -o kotlinizer
```

该库已在当前目录中创建：

```bash
$ ls kotlinizer.klib
kotlinizer.klib
```

现在来看看库的内容：

```bash
$ klib contents kotlinizer
```

可以将 `kotlinizer` 安装到默认存储库：

```bash
$ klib install kotlinizer
```

从当前目录中删除它的任何痕迹：

```bash
$ rm kotlinizer.klib
```

创建一个非常短的程序并写到 `use.kt` 中：

```kotlin
import kotlinizer.*

fun main(args: Array<String>) {
    println("Hello, ${"world".kotlinized}!")
}
```

现在编译该程序链接到刚刚创建的库：

```bash
$ kotlinc-native use.kt -l kotlinizer -o kohello
```

并运行该程序：

```bash
$ ./kohello.kexe
Hello, Kotlin world!
```

乐在其中！

## 高级主题

### 库搜索顺序

当给出  `-library foo` 标志时，编译器按照以下顺序搜索 `foo` 库：

* 当前编译目录或者一个绝对路径。
* 以 `-repo` 标志指定的所有存储库。
* 安装在默认存储库。

   > The default repository is `~/.konan`. You can change it by setting the `kotlin.data.dir` Gradle property.
   > 
   > Alternatively, you can use the `-Xkonan-data-dir` compiler option to configure your custom path to the directory 
   > via the `cinterop` and `konanc` tools.
   > 
   {style="note"}

* 安装在 `$installation/klib` 目录中的库。

### 库格式

Kotlin/Native 是包含预定义目录结构的 zip 文件，
具有以下布局：

当 `foo.klib` 解压为 `foo/` 时会有：

```text
  - foo/
    - $component_name/
      - ir/
        - 序列化的 Kotlin IR。
      - targets/
        - $platform/
          - kotlin/
            - Kotlin 编译为 LLVM 位码（bitcode）。
          - native/
            - 附加原生对象的位码文件。
        - $another_platform/
          - 可以有几个平台相关的 kotlin 与原生对。
      - linkdata/
        - 一组带有序列化的链接元数据的 ProtoBuf 文件。
      - resources/
        - 图像等普通资源。(尚未使用)。
    - manifest——描述库的 java 属性格式文件。
```

可以在安装的 `klib/stdlib` 目录中找到示例布局。

### Using relative paths in klibs

> Using relative paths in klibs is available since Kotlin 1.6.20.
> 
{style="note"}

A serialized IR representation of source files is [a part of](#库格式) a `klib` library. It includes paths of 
files for generating proper debug information. By default, stored paths are absolute.
With the `-Xklib-relative-path-base` compiler option, you can change the format and use only relative path in the 
artifact. To make it work, pass one or multiple base paths of source files as an argument:

<tabs group="build-script">
<tab title="Kotlin" group-key="kotlin">

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named<KotlinCompilationTask<*>>("compileKotlin").configure {
    // $base is a base path of source files
    compilerOptions.freeCompilerArgs.add("-Xklib-relative-path-base=$base")
}
```

</tab>
<tab title="Groovy" group-key="groovy">

```groovy
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask
// ...

tasks.named('compileKotlin', KotlinCompilationTask) {
    compilerOptions {
        // $base is a base path of source files
        freeCompilerArgs.add("-Xklib-relative-path-base=$base")
    }
}
``` 

</tab>
</tabs>