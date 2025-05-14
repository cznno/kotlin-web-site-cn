[//]: # (title: Kotlin/Native 开发动态库——教程)

You can create dynamic libraries to use Kotlin code from existing programs. This enables code sharing across
many platforms or languages, including JVM, Python, Android, and others.

> For iOS and other Apple targets, we recommend generating a framework. See the [Kotlin/Native as an Apple framework](apple-framework.md) tutorial.
> 
{style="tip"}

You can use the Kotlin/Native code from existing native applications or libraries. For this, you need to
compile the Kotlin code into a dynamic library in the `.so`, `.dylib`, or `.dll` format.

在这篇教程中，将会：

* [将 Kotlin 代码编译为动态库](#创建-kotlin-库)
* [生成 C 的头文件](#生成头文件)
* [在 C 中调用 Kotlin 动态库](#使用-c-中生成的头文件)
* [Compile and run the project](#compile-and-run-the-project)

You can use the command line to generate a Kotlin library, either directly or with a script file (such as `.sh` or `.bat` file).
However, this approach doesn't scale well for larger projects that have hundreds of files and libraries.
Using a build system simplifies the process by downloading and caching the Kotlin/Native
compiler binaries and libraries with transitive dependencies, as well as by running the compiler and tests.
Kotlin/Native can use the [Gradle](https://gradle.org) build system through the [Kotlin Multiplatform plugin](gradle-configure-project.md#targeting-multiple-platforms).

Let's examine the advanced C interop-related usages of Kotlin/Native and [Kotlin Multiplatform](gradle-configure-project.md#targeting-multiple-platforms) builds with Gradle.

> If you use a Mac and want to create and run applications for macOS or other Apple targets, you also need to install
> the [Xcode Command Line Tools](https://developer.apple.com/download/), launch it, and accept the license terms first.
>
{style="note"}

## 创建 Kotlin 库

Kotlin/Native 编译器可以将 Kotlin 代码编译为一个动态库。动态库常常带有一个 `.h`
头文件，可以通过它来调用编译后的 C 代码。

我们来创建一个 Kotlin 库，并在 C 程序中使用它。

> See the [Get started with Kotlin/Native](native-get-started.md#using-gradle) tutorial for detailed first steps
> and instructions on how to create a new Kotlin/Native project and open it in IntelliJ IDEA.
>
{style="tip"}

1. Navigate to the `src/nativeMain/kotlin` directory and create the `lib.kt` file with the following library contents:

   ```kotlin
   package example
    
   object Object { 
       val field = "A"
   }
    
   class Clazz {
       fun memberFunction(p: Int): ULong = 42UL
   }
    
   fun forIntegers(b: Byte, s: Short, i: UInt, l: Long) { }
   fun forFloats(f: Float, d: Double) { }
    
   fun strings(str: String) : String? {
       return "That is '$str' from C"
   }
    
   val globalString = "A global String"
   ```

2. Update your `build.gradle(.kts)` Gradle build file with the following:

    <tabs group="build-script">
    <tab title="Kotlin" group-key="kotlin">

    ```kotlin
    plugins {
        kotlin("multiplatform") version "%kotlinVersion%"
    }
    
    repositories {
        mavenCentral()
    }
    
    kotlin {
        macosArm64("native") {    // macOS on Apple Silicon
        // macosX64("native") {   // macOS on x86_64 platforms
        // linuxArm64("native") { // Linux on ARM64 platforms
        // linuxX64("native") {   // Linux on x86_64 platforms
        // mingwX64("native") {   // Windows
            binaries {
                sharedLib {
                    baseName = "native"       // macOS and Linux 
                    // baseName = "libnative" // Windows
                }
            }
        }
    }
    
    tasks.wrapper {
        gradleVersion = "%gradleVersion%"
        distributionType = Wrapper.DistributionType.ALL
    }
    ```

    </tab>
    <tab title="Groovy" group-key="groovy">

    ```groovy
    plugins {
        id 'org.jetbrains.kotlin.multiplatform' version '%kotlinVersion%'
    }
    
    repositories {
        mavenCentral()
    }
    
    kotlin {
        macosArm64("native") {    // Apple Silicon macOS
        // macosX64("native") {   // macOS on x86_64 platforms
        // linuxArm64("native") { // Linux on ARM64 platforms
        // linuxX64("native") {   // Linux on x86_64 platforms
        // mingwX64("native") {   // Windows
            binaries {
                sharedLib {
                    baseName = "native"       // macOS and Linux 
                    // baseName = "libnative" // Windows
                }
            }
        }
    }
    
    wrapper {
        gradleVersion = "%gradleVersion%"
        distributionType = "ALL"
    }
    ```

    </tab>
    </tabs>

    * The `binaries {}` block configures the project to generate a dynamic or shared library.
    * `libnative` is used as the library name, the prefix for the generated header file name. It also prefixes all
      declarations in the header file.

3. 在 IDE 中运行 `linkDebugSharedNative` Gradle 任务，或者在终端中使用以下控制台命令来<!--
   -->构建该库：

   ```bash
   ./gradlew linkDebugSharedNative
   ```

构建将会在 `build/bin/native/debugShared` 目录下生成以下库文件：

* macOS: `libnative_api.h` 与 `libnative.dylib`
* Linux: `libnative_api.h` 与 `libnative.so`
* Windows: `libnative_api.h`、`libnative.def` 以及 `libnative.dll

> You can also use the `linkNative` Gradle task to generate both `debug` and `release` variants of the library. 
> 
{style="tip"}

Kotlin/Native 编译器用相同的规则为所有平台生成 `.h` 文件。让我们来看看
Kotlin 库的 C 语言 API。

## 生成头文件

Let's examine how Kotlin/Native declarations are mapped to C functions.

In the `build/bin/native/debugShared` directory, open the `libnative_api.h` header file.
第一部分包含了标准的 C/C++ 头文件的首尾：

```c
#ifndef KONAN_LIBNATIVE_H
#define KONAN_LIBNATIVE_H
#ifdef __cplusplus
extern "C" {
#endif

/// 所生成的代码的其余部分

#ifdef __cplusplus
}  /* extern "C" */
#endif
#endif  /* KONAN_LIBNATIVE_H */
```

接下来，`libnative_api.h` 包含一个通用类型定义的块：

```c
#ifdef __cplusplus
typedef bool            libnative_KBoolean;
#else
typedef _Bool           libnative_KBoolean;
#endif
typedef unsigned short     libnative_KChar;
typedef signed char        libnative_KByte;
typedef short              libnative_KShort;
typedef int                libnative_KInt;
typedef long long          libnative_KLong;
typedef unsigned char      libnative_KUByte;
typedef unsigned short     libnative_KUShort;
typedef unsigned int       libnative_KUInt;
typedef unsigned long long libnative_KULong;
typedef float              libnative_KFloat;
typedef double             libnative_KDouble;
typedef float __attribute__ ((__vector_size__ (16))) libnative_KVector128;
typedef void*              libnative_KNativePtr;
``` 

Kotlin 在已创建的 `libnative_api.h` 文件中为所有的声明都添加了 `libnative_` 前缀。以下是完整的<!--
-->类型映射列表：

| Kotlin 定义。          | C 类型               |
|------------------------|----------------------|
| `libnative_KBoolean`   | `bool` 或 `_Bool`    |
| `libnative_KChar`      |  `unsigned short`    |
| `libnative_KByte`      |  `signed char`       |
| `libnative_KShort`     |  `short`             |
| `libnative_KInt`       |  `int`               |
| `libnative_KLong`      |  `long long`         |
| `libnative_KUByte`     |  `unsigned char`     |
| `libnative_KUShort`    |  `unsigned short`    |
| `libnative_KUInt`      |  `unsigned int`      |
| `libnative_KULong`     |  `unsigned long long`|
| `libnative_KFloat`     |  `float`             |
| `libnative_KDouble`    |  `double`            |
| `libnative_KVector128` | `float __attribute__ ((__vector_size__ (16))` |
| `libnative_KNativePtr` |  `void*`             |

`libnative_api.h` 文件的定义部分展示了如何将 Kotlin 的原生类型映射为 C 的原生类型。
The Kotlin/Native compiler generates these entries automatically for every library.
在这篇[从 C 语言中映射原生类型](mapping-primitive-data-types-from-c.md)教程中描述了反向映射。

After the automatically generated type definitions, you'll find the separate type definitions used in your library:

```c
struct libnative_KType;
typedef struct libnative_KType libnative_KType;

/// Automatically generated type definitions

typedef struct {
  libnative_KNativePtr pinned;
} libnative_kref_example_Object;
typedef struct {
  libnative_KNativePtr pinned;
} libnative_kref_example_Clazz;
```

In C, the `typedef struct { ... } TYPE_NAME` syntax declares the structure.

> See [this StackOverflow thread](https://stackoverflow.com/questions/1675351/typedef-struct-vs-struct-definitions) for
> more explanations of this pattern.
>
{style="tip"}

As you can see from these definitions, Kotlin types are mapped using the same pattern: `Object` is mapped to
`libnative_kref_example_Object`，而 `Clazz` 映射到了 `libnative_kref_example_Clazz`。所有结构体都没有包含任何内容，
只有一个带有指针的 `pinned` 字段。该字段类型 `libnative_KNativePtr` 在文件前面部分定义为 `void*`。

由于 C 语言不支持命名空间，所以 Kotlin/Native 编译器生成了长名称，以避免与现有<!--
-->原生项目中的其他符号发生任何可能的冲突。

### Service runtime functions

The `libnative_ExportedSymbols` structure defines all the functions provided by Kotlin/Native and your library.
It uses nested anonymous structures heavily to mimic packages. The `libnative_` prefix comes from the library name.

`libnative_ExportedSymbols` includes several helper functions in the header file:

```c
typedef struct {
  /* Service functions. */
  void (*DisposeStablePointer)(libnative_KNativePtr ptr);
  void (*DisposeString)(const char* string);
```

These functions deal with Kotlin/Native objects. `DisposeStablePointer` is called to release a reference to a Kotlin object,
and `DisposeString` is called to release a Kotlin string, which has the `char*` type in C.

The next part of the `libnative_api.h` file consists of structure declarations of runtime functions:

```c
libnative_KBoolean (*IsInstance)(libnative_KNativePtr ref, const libnative_KType* type);
libnative_KBoolean (*IsInstance)(libnative_KNativePtr ref, const libnative_KType* type);
libnative_kref_kotlin_Byte (*createNullableByte)(libnative_KByte);
libnative_KByte (*getNonNullValueOfByte)(libnative_kref_kotlin_Byte);
libnative_kref_kotlin_Short (*createNullableShort)(libnative_KShort);
libnative_KShort (*getNonNullValueOfShort)(libnative_kref_kotlin_Short);
libnative_kref_kotlin_Int (*createNullableInt)(libnative_KInt);
libnative_KInt (*getNonNullValueOfInt)(libnative_kref_kotlin_Int);
libnative_kref_kotlin_Long (*createNullableLong)(libnative_KLong);
libnative_KLong (*getNonNullValueOfLong)(libnative_kref_kotlin_Long);
libnative_kref_kotlin_Float (*createNullableFloat)(libnative_KFloat);
libnative_KFloat (*getNonNullValueOfFloat)(libnative_kref_kotlin_Float);
libnative_kref_kotlin_Double (*createNullableDouble)(libnative_KDouble);
libnative_KDouble (*getNonNullValueOfDouble)(libnative_kref_kotlin_Double);
libnative_kref_kotlin_Char (*createNullableChar)(libnative_KChar);
libnative_KChar (*getNonNullValueOfChar)(libnative_kref_kotlin_Char);
libnative_kref_kotlin_Boolean (*createNullableBoolean)(libnative_KBoolean);
libnative_KBoolean (*getNonNullValueOfBoolean)(libnative_kref_kotlin_Boolean);
libnative_kref_kotlin_Unit (*createNullableUnit)(void);
libnative_kref_kotlin_UByte (*createNullableUByte)(libnative_KUByte);
libnative_KUByte (*getNonNullValueOfUByte)(libnative_kref_kotlin_UByte);
libnative_kref_kotlin_UShort (*createNullableUShort)(libnative_KUShort);
libnative_KUShort (*getNonNullValueOfUShort)(libnative_kref_kotlin_UShort);
libnative_kref_kotlin_UInt (*createNullableUInt)(libnative_KUInt);
libnative_KUInt (*getNonNullValueOfUInt)(libnative_kref_kotlin_UInt);
libnative_kref_kotlin_ULong (*createNullableULong)(libnative_KULong);
libnative_KULong (*getNonNullValueOfULong)(libnative_kref_kotlin_ULong);
```

You can use the `IsInstance` function to check if a Kotlin object (referenced with its `.pinned` pointer)
is an instance of a type. The actual set of operations generated depends on actual usages.

> Kotlin/Native has its own garbage collector, but it doesn't manage Kotlin objects accessed from C. However,
> Kotlin/Native provides [interoperability with Swift/Objective-C](native-objc-interop.md),
> and the garbage collector is [integrated with Swift/Objective-C ARC](native-arc-integration.md).
>
{style="tip"}

### Your library functions

Let's take a look at the separate structure declarations used in your library. The `libnative_kref_example` field mimics
the package structure of your Kotlin code with a `libnative_kref.` prefix:

```c
typedef struct {
  /* User functions. */
  struct {
    struct {
      struct {
        struct {
          libnative_KType* (*_type)(void);
          libnative_kref_example_Object (*_instance)();
          const char* (*get_field)(libnative_kref_example_Object thiz);
        } Object;
        struct {
          libnative_KType* (*_type)(void);
          libnative_kref_example_Clazz (*Clazz)();
          libnative_KULong (*memberFunction)(libnative_kref_example_Clazz thiz, libnative_KInt p);
        } Clazz;
        const char* (*get_globalString)();
        void (*forFloats)(libnative_KFloat f, libnative_KDouble d);
        void (*forIntegers)(libnative_KByte b, libnative_KShort s, libnative_KUInt i, libnative_KLong l);
        const char* (*strings)(const char* str);
      } example;
    } root;
  } kotlin;
} libnative_ExportedSymbols;
```

这段代码使用了匿名的结构体定义。这里，`struct { ... } foo` 在外部结构体中声明了一个<!--
-->匿名结构体类型的字段，该类型没有名称。

由于 C 语言同样也不支持对象，因此使用函数指针来模仿对象语义。一个函数指针被声明为
`RETURN_TYPE (* FIELD_NAME)(PARAMETERS)`。

`libnative_kref_example_Clazz` 字段表示 Kotlin 中的 `Clazz`。`libnative_KULong`
可以使用 `memberFunction` 字段访问。唯一的区别是 `memberFunction` 接受 `thiz` 引用<!--
-->作为第一个参数。由于 C 语言不支持对象，因此明确传递了 `thiz` 指针。

`Clazz` 字段中有一个构造函数（又名 `libnative_kref_example_Clazz_Clazz`），它充当创建
`Clazz` 实例的构造函数。

Kotlin `object Object` 可作为 `libnative_kref_example_Object` 访问。`_instance` 函数可以获取到<!--
-->该对象的唯一实例。

属性会转换为函数。`get_` 与 `set_` 前缀分别用于命名 getter 以及 setter
函数。例如，Kotlin 中的只读属性 `globalString` 在 C 语言中会转换为 `get_globalString`
函数。

全局函数 `forFloats`、`forIntegers` 以及 `strings` 会转换为 `libnative_kref_example`
匿名结构体中的函数指针。

### 入口点

现在知道了 API 是如何创建的，初始化 `libnative_ExportedSymbols` 结构体是起点。
我们接着来看看 `libnative_api.h` 的最后部分：

```c
extern libnative_ExportedSymbols* libnative_symbols(void);
```

函数 `libnative_symbols` 让你可以在原生代码中打开通往 Kotlin/Native 库的通道。
This is the entry point for accessing the library. 该库名称用作函数名称的前缀。

> 可能有必要为每个线程托管返回的 `libnative_ExportedSymbols*` 指针。
>
{style="note"}

## 使用 C 中生成的头文件

Using the generated headers from C is straightforward. In the library directory, create the `main.c` file with the following code:

```c
#include "libnative_api.h"
#include "stdio.h"

int main(int argc, char** argv) {
  //获取调用 Kotlin/Native 函数的引用
  libnative_ExportedSymbols* lib = libnative_symbols();

  lib->kotlin.root.example.forIntegers(1, 2, 3, 4);
  lib->kotlin.root.example.forFloats(1.0f, 2.0);

  //使用 C 与 Kotlin/Native 的字符串
  const char* str = "Hello from Native!";
  const char* response = lib->kotlin.root.example.strings(str);
  printf("in: %s\nout:%s\n", str, response);
  lib->DisposeString(response);

  //创建 Kotlin 对象实例
  libnative_kref_example_Clazz newInstance = lib->kotlin.root.example.Clazz.Clazz();
  long x = lib->kotlin.root.example.Clazz.memberFunction(newInstance, 42);
  lib->DisposeStablePointer(newInstance.pinned);

  printf("DemoClazz returned %ld\n", x);

  return 0;
}
```

## Compile and run the project

### On macOS

如需将 C 代码编译并链接到动态库，请打开库目录并运行以下命令：

```bash
clang main.c libnative.dylib
```

The compiler generates an executable called `a.out`. Run it to execute the Kotlin code from the C library.

### On Linux

To compile the C code and link it with the dynamic library, navigate to the library directory and run the following command:

```bash
gcc main.c libnative.so
```

编译器生成一个名为 `a.out` 的可执行文件。运行它来从 C 库的执行 Kotlin 代码。在 Linux 上，
需要将 `.` 引入到 `LD_LIBRARY_PATH` 来使应用程序知晓从当前文件夹加载 `libnative.so`
库。

### On Windows

首先，需要安装一个支持 x64_64 目标平台的 Microsoft Visual C++ 编译器。

最简单的方法是在 Windows 机器上安装 Microsoft Visual Studio。 During installation,
select the necessary components to work with C++, for example, **Desktop development with C++**.

在 Windows 上，可以通过生成静态库包装器或手动<!--
-->通过 [LoadLibrary](https://learn.microsoft.com/en-gb/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibrarya)
或类似的 Win32API 函数来包含动态库。

我们来使用第一种选项并为 `libnative.dll` 生成静态包装库：

1. 使用工具链中的 `lib.exe` 来生成静态库包装器 `libnative.lib`，它可以在代码中自动使用 DLL
   ：

   ```bash
   lib /def:libnative.def /out:libnative.lib
   ```

2. 将 `main.c` 编译为可执行文件。将生成的 `libnative.lib` 包含到到构建命令并启动：

   ```bash
   cl.exe main.c libnative.lib
   ```

这行命令生成了 `main.exe` 文件可供执行。

## 下一步做什么

* [Learn more about interoperability with Swift/Objective-C](native-objc-interop.md)
* [Check out the Kotlin/Native as an Apple framework tutorial](apple-framework.md)
