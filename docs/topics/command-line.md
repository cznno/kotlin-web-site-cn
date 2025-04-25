[//]: # (title: Kotlin 命令行编译器)

每个 Kotlin 版本都附带了一个独立版的编译器。 可以手动或者通过包管理器下载其最新版。

> 安装命令行编译器并不是使用 Kotlin 的必要步骤。
> 常见的做法是使用具有官方 Kotlin 支持的 IDE 或代码编辑器来编写 Kotlin 应用程序，
> 例如 [IntelliJ IDEA](https://www.jetbrains.com/idea/) 或者 [Android Studio](https://developer.android.com/studio)。
> 它们开箱即用地提供完整的 Kotlin 支持。
> 
> Learn how to [get started with Kotlin in an IDE](getting-started.md).
> 
{style="note"}

## 安装编译器

### 手动安装

To install the Kotlin compiler manually:

1. 在 [GitHub Releases](%kotlinLatestUrl%) 页下载最新版本（`kotlin-compiler-%kotlinVersion%.zip`）。
2. 将独立编译器解压缩到一个目录中，并可选择将其 `bin` 目录添加到系统路径。
`bin` 目录包含了在 Windows、macOS 与 Linux 上编译及运行 Kotlin 所需的脚本。

> If you want to use the Kotlin command-line compiler on Windows, we recommend installing it manually.
> 
{style="note"}

### SDKMAN!

An easier way to install Kotlin on UNIX-based systems, such as macOS, Linux, Cygwin, FreeBSD, and Solaris, is
[SDKMAN!](https://sdkman.io). It also works in Bash and ZSH shells. [Learn how to install SDKMAN!](https://sdkman.io/install).

To install the Kotlin compiler via SDKMAN!, run the following command in the terminal:

```bash
sdk install kotlin
```

### Homebrew

Alternatively, on macOS you can install the compiler via [Homebrew](https://brew.sh/):

```bash
brew update
brew install kotlin
```

### Snap 包

If you use [Snap](https://snapcraft.io/) on Ubuntu 16.04 or later, you can install the compiler from the command line:

```bash
sudo snap install --classic kotlin
```

## 创建并运行应用程序

1. Create a simple console JVM application in Kotlin that displays `"Hello, World!"`. 
   In a code editor, create a new file called `hello.kt` with the following code:

   ```kotlin
   fun main() {
       println("Hello, World!")
   }
   ```

2. Compile the application using the Kotlin compiler:

   ```bash
   kotlinc hello.kt -include-runtime -d hello.jar
   ```

   * The `-d` option indicates the output path for generated class files, which may be either a directory or a **.jar** file.
   * The `-include-runtime` option makes the resulting **.jar** file self-contained and runnable by including the Kotlin runtime
library in it.

   To see all available options, run:

   ```bash
   kotlinc -help
   ```

3. Run the application:

   ```bash
   java -jar hello.jar
   ```

## 编译库

If you're developing a library to be used by other Kotlin applications, you can build the **.jar** file without including
the Kotlin runtime:

```bash
kotlinc hello.kt -d hello.jar
```

Since binaries compiled this way depend on the Kotlin runtime, 
you should ensure that it is present in the classpath whenever your compiled library is used

You can also use the `kotlin` script to run binaries produced by the Kotlin compiler:

```bash
kotlin -classpath hello.jar HelloKt
```

`HelloKt` is the main class name that the Kotlin compiler generates for the file named `hello.kt`.

## 运行 REPL

You can run the compiler without parameters to have an interactive shell. In this shell, you can type any valid Kotlin code
and see the results.

<img src="kotlin-shell.png" alt="Shell" width="500"/>

## 运行脚本

You can use Kotlin as a scripting language.
A Kotlin script is a Kotlin source file (`.kts`) with top-level executable code.

```kotlin
import java.io.File

// Get the passed in path, i.e. "-d some/path" or use the current path.
val path = if (args.contains("-d")) args[1 + args.indexOf("-d")]
           else "."

val folders = File(path).listFiles { file -> file.isDirectory() }
folders?.forEach { folder -> println(folder) }
```

To run a script, pass the `-script` option to the compiler with the corresponding script file:

```bash
kotlinc -script list_folders.kts -- -d <path_to_folder_to_inspect>
```

Kotlin provides experimental support for script customization, such as adding external properties,
providing static or dynamic dependencies, and so on.
Customizations are defined by so-called _script definitions_ – annotated kotlin classes with the appropriate support code.
The script filename extension is used to select the appropriate definition.
Learn more about [Kotlin custom scripting](custom-script-deps-tutorial.md).

Properly prepared script definitions are detected and applied automatically when the appropriate jars are included
in the compilation classpath. Alternatively, you can specify definitions manually by passing the `-script-templates` option
to the compiler:

```bash
kotlinc -script-templates org.example.CustomScriptDefinition -script custom.script1.kts
```

For additional details, see the [KEEP-75](https://github.com/Kotlin/KEEP/blob/master/proposals/scripting-support.md).