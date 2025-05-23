[//]: # (title: Kotlin/Native 开发 Apple framework——教程)

> The Objective-C libraries import is [Experimental](components-stability.md#stability-levels-explained).
> All Kotlin declarations generated by the cinterop tool from Objective-C libraries
> should have the `@ExperimentalForeignApi` annotation.
>
> Native platform libraries shipped with Kotlin/Native (like Foundation, UIKit, and POSIX)
> require opt-in only for some APIs.
>
{style="warning"}

Kotlin/Native 提供与 Swift/Objective-C 的双向互操作性。既可以在 Kotlin 代码中使用 Objective-C framework
与库，也可以在 Swift/Objective-C 代码中使用 Kotlin 模块。

Kotlin/Native comes with a set of pre-imported system frameworks; it's also possible to import an existing framework and
use it from Kotlin. 在本教程中，可学到如何创建自己的 framework 以及如何在 macOS 与 iOS 上的
Swift/Objective-C 应用程序中使用 Kotlin/Native 代码。

在本教程中会：

* [创建一个 Kotlin 库并将其编译为 framework](#创建一个-kotlin-库)
* [检查生成的 Swift/Objective-C API 代码](#生成的-framework-头文件)
* [在 Objective-C 中使用 framework](#在-objective-c-中使用代码)
* [在 Swift 中使用 framework](#在-swift-中使用代码)

你可以使用命令行来生成 Kotlin framework，可以直接生成，也可以通过脚本文件（例如 `.sh` 或 `.bat` 文件）生成。
不过，对于有数百个文件与库的大型项目来说，这种方法的可伸缩性不佳。
使用构建系统可以简化这个过程，它会下载并缓存 Kotlin/Native
编译器二进制文件与库（及其传递），并运行编译器和测试。
Kotlin/Native 可以通过 [Kotlin 多平台插件](gradle-configure-project.md#targeting-multiple-platforms) 使用 [Gradle](https://gradle.org) 构建系统。

> 如果使用 Mac 并且想要创建并运行 iOS 或其他 Apple 平台的应用程序，还需要<!--
> -->先安装 [Xcode Command Line Tools](https://developer.apple.com/download/)，然后启动它，并接受许可条款。
>
{style="note"}

## 创建一个 Kotlin 库

> 参见 [Kotlin/Native 入门](native-get-started.md#using-gradle)教程以了解详细的入门步骤
> 以及如何创建新的 Kotlin/Native 项目并在 IntelliJ IDEA 中打开的说明。
>
{style="tip"}

Kotlin/Native 编译器可以由 Kotlin 代码生产一个 macOS 与 iOS 适用的 framework。所创建的 framework 包含<!--
-->了在 Swift/Objective-C 中使用它所需的所有声明与二进制文件。

我们首先创建一个 Kotlin 库：

1. 在 `src/nativeMain/kotlin` 目录中，创建 `lib.kt` 文件，并在其中编写库的内容：
   ```kotlin
   package example
    
   object Object {
       val field = "A"
   }
    
   interface Interface {
       fun iMember() {}
   }
    
   class Clazz : Interface {
       fun member(p: Int): ULong? = 42UL
   }
    
   fun forIntegers(b: Byte, s: UShort, i: Int, l: ULong?) { }
   fun forFloats(f: Float, d: Double?) { }
    
   fun strings(str: String?) : String {
       return "That is '$str' from C"
   }
    
   fun acceptFun(f: (String) -> String?) = f("Kotlin/Native rocks!")
   fun supplyFun() : (String) -> String? = { "$it is cool!" }
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
        iosArm64("native") {
            binaries {
                framework {
                    baseName = "Demo"
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
        iosArm64("native") {
            binaries {
                framework {
                    baseName = "Demo"
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

   `binaries {}` 代码块配置项目生成动态或共享库。

    Kotlin/Native supports the `iosArm64`, `iosX64`, and `iosSimulatorArm64` targets for iOS, as well as `macosX64` and
    `macosArm64` targets for macOS. So, you can replace the `iosArm64()` with the respective Gradle function for your
    target platform:

    | 目标 平台/设备           | Gradle 函数      |
|------------------------|-----------------------|
    | macOS x86_64           | `macosX64()`          | 
    | macOS ARM64            | `macosArm64()`        |
    | iOS ARM64              | `iosArm64()`          | 
    | iOS Simulator (x86_64) | `iosX64()`            |
    | iOS Simulator (ARM64)  | `iosSimulatorArm64()` |

   For information on other supported Apple targets, see [Kotlin/Native target support](native-target-support.md).

3. 在 IDE 中运行 `linkDebugFrameworkNative` Gradle 任务，或者在终端中使用如下控制台命令来<!--
-->构建 framework：

   ```bash
   ./gradlew linkDebugFrameworkNative
   ```

构建生成的 framework 位于 `build/bin/native/debugFramework` 目录。

> You can also use the `linkNative` Gradle task to generate both `debug` and `release` variants of the framework.
>
{style="tip"}

## 生成的 Framework 头文件

每个 framework 变体都包含一个头文件。这些头文件不依赖目标平台。头文件包含<!--
-->你的 Kotlin 代码的定义以及一些 Kotlin 级的声明。Let's see what's inside.

### Kotlin/Native 运行时声明

In the `build/bin/native/debugFramework/Demo.framework/Headers` directory, open the `Demo.h` header file.
来看看 Kotlin 的运行时声明：

```objc
NS_ASSUME_NONNULL_BEGIN
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunknown-warning-option"
#pragma clang diagnostic ignored "-Wincompatible-property-type"
#pragma clang diagnostic ignored "-Wnullability"

#pragma push_macro("_Nullable_result")
#if !__has_feature(nullability_nullable_result)
#undef _Nullable_result
#define _Nullable_result _Nullable
#endif

__attribute__((swift_name("KotlinBase")))
@interface DemoBase : NSObject
- (instancetype)init __attribute__((unavailable));
+ (instancetype)new __attribute__((unavailable));
+ (void)initialize __attribute__((objc_requires_super));
@end

@interface DemoBase (DemoBaseCopying) <NSCopying>
@end

__attribute__((swift_name("KotlinMutableSet")))
@interface DemoMutableSet<ObjectType> : NSMutableSet<ObjectType>
@end

__attribute__((swift_name("KotlinMutableDictionary")))
@interface DemoMutableDictionary<KeyType, ObjectType> : NSMutableDictionary<KeyType, ObjectType>
@end

@interface NSError (NSErrorDemoKotlinException)
@property (readonly) id _Nullable kotlinException;
@end
```

Kotlin 类在 Swift/Objective-C 中拥有一个 `KotlinBase` 基类，该类在这里继承自 `NSObject` 类。
同样也有集合与异常的包装器。大多数的集合类型都映射到了 Swift/Objective-C 中<!--
-->相似的集合类型：

| Kotlin      | Swift               | Objective-C         |
|-------------|---------------------|---------------------|
| List        | Array               | NSArray             |
| MutableList | NSMutableArray      | NSMutableArray      |
| Set         | Set                 | NSSet               |
| MutableSet  | NSMutableSet        | NSMutableSet        |
| Map         | Dictionary          | NSDictionary        |
| MutableMap  | NSMutableDictionary | NSMutableDictionary |

### Kotlin 数值与 NSNumber

The next part of the `Demo.h` file contains type mappings between Kotlin/Native number types and `NSNumber`. The base
class is called `DemoNumber` in Objective-C and `KotlinNumber` in Swift. It extends `NSNumber`.

For each Kotlin number type, there is a corresponding predefined child class:

| Kotlin    | Swift           | Objective-C        | Simple type          |
|-----------|-----------------|--------------------|----------------------|
| `-`       | `KotlinNumber`  | `<Package>Number`  | `-`                  |
| `Byte`    | `KotlinByte`    | `<Package>Byte`    | `char`               |
| `UByte`   | `KotlinUByte`   | `<Package>UByte`   | `unsigned char`      |
| `Short`   | `KotlinShort`   | `<Package>Short`   | `short`              |
| `UShort`  | `KotlinUShort`  | `<Package>UShort`  | `unsigned short`     |
| `Int`     | `KotlinInt`     | `<Package>Int`     | `int`                |
| `UInt`    | `KotlinUInt`    | `<Package>UInt`    | `unsigned int`       |
| `Long`    | `KotlinLong`    | `<Package>Long`    | `long long`          |
| `ULong`   | `KotlinULong`   | `<Package>ULong`   | `unsigned long long` |
| `Float`   | `KotlinFloat`   | `<Package>Float`   | `float`              |
| `Double`  | `KotlinDouble`  | `<Package>Double`  | `double`             |
| `Boolean` | `KotlinBoolean` | `<Package>Boolean` | `BOOL/Bool`          |

每个数字类型都有一个类方法，用于从对应的简单类型创建新实例。此外，还有一个实例<!--
-->方法用于提取一个简单的值。原理上，所有这样的声明看起来像这样：

```objc
__attribute__((swift_name("Kotlin__TYPE__")))
@interface Demo__TYPE__ : DemoNumber
- (instancetype)initWith__TYPE__:(__CTYPE__)value;
+ (instancetype)numberWith__TYPE__:(__CTYPE__)value;
@end;
```

这里，`__TYPE__` 是简单类型的名称之一，而 `__CTYPE__` 是对应的 Objective-C 类型，
例如 `initWithChar(char)`。

这些类型用于将装箱的 Kotlin 数字类型映射到 Swift/Objective-C。
在 Swift 中，可以调用构造函数来创建一个实例，例如 `KotlinLong(value: 42)`。

### Kotlin 中的类与对象

我们来看看如何将 `class` 与 `object` 映射到 Swift/Objective-C。生成的 `Demo.h` 文件包含
`Class`、`Interface` 与 `Object` 的确切定义：

```objc
__attribute__((swift_name("Interface")))
@protocol DemoInterface
@required
- (void)iMember __attribute__((swift_name("iMember()")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Clazz")))
@interface DemoClazz : DemoBase <DemoInterface>
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (DemoULong * _Nullable)memberP:(int32_t)p __attribute__((swift_name("member(p:)")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Object")))
@interface DemoObject : DemoBase
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
+ (instancetype)object __attribute__((swift_name("init()")));
@property (class, readonly, getter=shared) DemoObject *shared __attribute__((swift_name("shared")));
@property (readonly) NSString *field __attribute__((swift_name("field")));
@end
```

这段代码中的 Objective-C attribute 有助于在 Swift 和 Objective-C
语言中使用该 framework。`DemoInterface`、`DemoClazz` 和 `DemoObject` 分别被创建为 `Interface`、`Clazz` 和 `Object`。

`Interface` 会转换为 `@protocol`，而 `class` 和 `object` 都以 `@interface` 表示。
`Demo` 前缀来自于 framework 的名称。可空的返回值类型 `ULong?` 会转换到 Objective-C 中的 `DemoULong`。

### Kotlin 中的全局声明

所有 Kotlin 中的全局函数都会转化为 Objective-C 中的 `DemoLibKt` 以及 Swift 中的 `LibKt`，
其中 `Demo` 是由 `kotlinc-native` 的 `-output` 参数设置的 framework 名称：

```objc
__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("LibKt")))
@interface DemoLibKt : DemoBase
+ (NSString * _Nullable)acceptFunF:(NSString * _Nullable (^)(NSString *))f __attribute__((swift_name("acceptFun(f:)")));
+ (void)forFloatsF:(float)f d:(DemoDouble * _Nullable)d __attribute__((swift_name("forFloats(f:d:)")));
+ (void)forIntegersB:(int8_t)b s:(uint16_t)s i:(int32_t)i l:(DemoULong * _Nullable)l __attribute__((swift_name("forIntegers(b:s:i:l:)")));
+ (NSString *)stringsStr:(NSString * _Nullable)str __attribute__((swift_name("strings(str:)")));
+ (NSString * _Nullable (^)(NSString *))supplyFun __attribute__((swift_name("supplyFun()")));
@end
```

Kotlin `String` 与 Objective-C `NSString*` 是透明映射的。类似地，Kotlin 的 `Unit` 类型会映射到 `void`。
原生类型直接映射。不可空的原生类型透明地映射。
可空的原生类型被映射到 `Kotlin<TYPE>*` 类型，如[表中](#kotlin-数值与-nsnumber)所示。
包括高阶函数 `acceptFunF` 与 `supplyFun` 都接收 Objective-C 块。

可以在 [Swift/Objective-C 互操作性](native-objc-interop.md#mappings) 中找到关于类型映射的更多信息。

## 垃圾回收与引用计数

Swift 与 Objective-C 使用自动引用计数（ARC）。Kotlin/Native 拥有自己的[垃圾回收](native-memory-manager.md#garbage-collector)，
它也[与 Swift/Objective-C ARC 相集成](native-arc-integration.md)。

Unused Kotlin objects are automatically removed. You don't need to take additional steps to control the lifetime of
Kotlin/Native instances from Swift or Objective-C.

## 在 Objective-C 中使用代码

我们来在 Objective-C 中调用 framework。在 framework 目录中，使用以下代码创建 `main.m` 文件：

```objc 
#import <Foundation/Foundation.h>
#import <Demo/Demo.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        [DemoObject.shared field];
        
        DemoClazz* clazz = [[ DemoClazz alloc] init];
        [clazz memberP:42];
        
        [DemoLibKt forIntegersB:1 s:1 i:3 l:[DemoULong numberWithUnsignedLongLong:4]];
        [DemoLibKt forIntegersB:1 s:1 i:3 l:nil];
        
        [DemoLibKt forFloatsF:2.71 d:[DemoDouble numberWithDouble:2.71]];
        [DemoLibKt forFloatsF:2.71 d:nil];
        
        NSString* ret = [DemoLibKt acceptFunF:^NSString * _Nullable(NSString * it) {
            return [it stringByAppendingString:@" Kotlin is fun"];
        }];
        
        NSLog(@"%@", ret);
        return 0;
    }
}
```

这里，您可以直接在 Objective-C 代码中调用 Kotlin 类。Kotlin 对象使用 `<对象名称>.shared` 类<!--
-->属性，这让你可以获取对象的唯一实例并在其上调用对象方法。

广泛使用的模式是用于创建 `Clazz` 类的实例。在
Objective-C 上调用 `[[ DemoClazz alloc] init]`。也可以使用<!--
-->没有参数的构造函数 `[DemoClazz new]`。

Kotlin 源中的全局声明的作用域位于 Objective-C 中的 `DemoLibKt` 类之下。
所有 Kotlin 函数都被转化为该类的类方法。

`strings` 函数转化为 Objective-C 中的 `DemoLibKt.stringsStr` 函数，因此可以<!--
-->给它直接传递 `NSString`。返回值也同样可见为 `NSString`。

## 在 Swift 中使用代码

生成的 framework 拥有辅助 attribute，使其在 Swift 中使用更加容易。Let's convert the [previous
Objective-C example](#在-objective-c-中使用代码) into Swift.

In the framework directory, create the `main.swift` file with the following code:

```swift
import Foundation
import Demo

let kotlinObject = Object.shared

let field = Object.shared.field

let clazz = Clazz()
clazz.member(p: 42)

LibKt.forIntegers(b: 1, s: 2, i: 3, l: 4)
LibKt.forFloats(f: 2.71, d: nil)

let ret = LibKt.acceptFun { "\($0) Kotlin is fun" }
if (ret != nil) {
    print(ret!)
}
``` 

There are some small differences between the original Kotlin code and its Swift version. In Kotlin, any object declaration
has only one instance. The `Object.shared` syntax is used to access this single instance.

Kotlin function and property names are translated as is. Kotlin's `String` is turned into Swift's `String`. Swift
hides `NSNumber*` boxing too. You can also pass a Swift closure to Kotlin and call a Kotlin lambda function from Swift. 

You can find more information about type mapping in [Interoperability with Swift/Objective-C](native-objc-interop.md#mappings).

## Connect the framework to your iOS project

Now you can connect the generated framework to your iOS project as a dependency. There are multiple ways to set it up
and automate the process, choose the method that suits you best:

<a href="https://www.jetbrains.com/help/kotlin-multiplatform-dev/multiplatform-ios-integration-overview.html"><img src="choose-ios-integration.svg" width="700" alt="Choose iOS integration method" style="block"/></a>

## 下一步做什么

* [Learn more about interoperability with Objective-C](native-objc-interop.md)
* [See how interoperability with C is implemented in Kotlin](native-c-interop.md)
* [Check out the Kotlin/Native as a dynamic library tutorial](native-dynamic-libraries.md)
