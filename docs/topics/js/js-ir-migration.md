[//]: # (title: 将 Kotlin/JS 项目迁移到 IR 编译器)

We replaced the old Kotlin/JS compiler with [the IR-based compiler](js-ir-compiler.md) in order to unify
Kotlin's behavior on all platforms and to make it possible to implement new JS-specific optimizations, among other reasons.
You can learn more about the internal differences between the two compilers in the blog post
[Migrating our Kotlin/JS app to the new IR compiler](https://dev.to/kotlin/migrating-our-kotlin-js-app-to-the-new-ir-compiler-3o6i)
by Sebastian Aigner.

Due to the significant differences between the compilers, switching your Kotlin/JS project from the old backend to the new one
may require adjusting your code. On this page, we've compiled a list of known migration issues along with suggested solutions.

> Install the [Kotlin/JS Inspection pack](https://plugins.jetbrains.com/plugin/17183-kotlin-js-inspection-pack/) plugin 
> to get valuable tips on how to fix some of the issues that occur during migration.
>
{style="tip"}

Note that this guide may change over time as we fix issues and find new ones. Please help us keep it complete –
report any issues you encounter when switching to the IR compiler by submitting them to our issue tracker [YouTrack](https://kotl.in/issue)
or filling out [this form](https://surveys.jetbrains.com/s3/ir-be-migration-issue).

## Convert JS- and React-related classes and interfaces to external interfaces

**Issue**: Using Kotlin interfaces and classes (including data classes) that derive from pure JS classes, such as React's `State` and
`Props`, can cause a `ClassCastException`. Such exceptions appear because the compiler attempts to work with instances of
these classes as if they were Kotlin objects, when they actually come from JS.

**Solution**: convert all classes and interfaces that derive from pure JS classes to [external interfaces](js-interop.md#external-接口):

```kotlin
// Replace this
interface AppState : State { }
interface AppProps : Props { }
data class CustomComponentState(var name: String) : State
```

```kotlin
// With this
external interface AppState : State { }
external interface AppProps : Props { }
external interface CustomComponentState : State {
   var name: String
}
```

In IntelliJ IDEA, you can use these [structural search and replace](https://www.jetbrains.com/help/idea/structural-search-and-replace.html)
templates to automatically mark interfaces as `external`:
* [Template for `State`](https://gist.github.com/SebastianAigner/62119536f24597e630acfdbd14001b98)
* [Template for `Props`](https://gist.github.com/SebastianAigner/a47a77f5e519fc74185c077ba12624f9)

## Convert properties of external interfaces to var

**Issue**: properties of external interfaces in Kotlin/JS code can't be read-only (`val`) properties because their values can be
assigned only after the object is created with `js()` or `jso()` (a helper function from [`kotlin-wrappers`](https://github.com/JetBrains/kotlin-wrappers)):

```kotlin
import kotlinx.js.jso

val myState = jso<CustomComponentState>()
myState.name = "name"
```

**Solution**: convert all properties of external interfaces to `var`:

```kotlin
// Replace this
external interface CustomComponentState : State {
   val name: String
}
```

```kotlin
// With this
external interface CustomComponentState : State {
   var name: String
}
```

## Convert functions with receivers in external interfaces to regular functions

**Issue**: external declarations can't contain functions with receivers, such as extension functions or properties with corresponding
functional types.

**Solution**: convert such functions and properties to regular functions by adding the receiver object as an argument:

```kotlin
// Replace this
external interface ButtonProps : Props {
   var inside: StyledDOMBuilder<BUTTON>.() -> Unit
}
```

```kotlin
external interface ButtonProps : Props {
   var inside: (StyledDOMBuilder<BUTTON>) -> Unit
}
```

## Create plain JS objects for interoperability

**Issue**: properties of a Kotlin object that implements an external interface are not _enumerable_. This means that they are not
visible for operations that iterate over the object's properties, for example:
* `for (var name in obj)`
* `console.log(obj)`
* `JSON.stringify(obj)`

Although they are still accessible by the name: `obj.myProperty`

```kotlin
external interface AppProps { var name: String }
data class AppPropsImpl(override var name: String) : AppProps
fun main() {
   val jsApp = js("{name: 'App1'}") as AppProps // plain JS object
   println("Kotlin sees: ${jsApp.name}") // "App1"
   println("JSON.stringify sees:" + JSON.stringify(jsApp)) // {"name":"App1"} - OK

   val ktApp = AppPropsImpl("App2") // Kotlin object
   println("Kotlin sees: ${ktApp.name}") // "App2"
   // JSON sees only the backing field, not the property
   println("JSON.stringify sees:" + JSON.stringify(ktApp)) // {"_name_3":"App2"}
}
```

**Solution 1**: create plain JavaScript objects with `js()` or `jso()` (a helper function from [`kotlin-wrappers`](https://github.com/JetBrains/kotlin-wrappers)):

```kotlin
external interface AppProps { var name: String }
data class AppPropsImpl(override var name: String) : AppProps
```

```kotlin
// Replace this
val ktApp = AppPropsImpl("App1") // Kotlin object
```

```kotlin
// With this
val jsApp = js("{name: 'App1'}") as AppProps // or jso {}
```

**Solution 2**: create objects with `kotlin.js.json()`:

```kotlin
// or with this
val jsonApp = kotlin.js.json(Pair("name", "App1")) as AppProps
```

## Replace toString() calls on function references with .name

**Issue**: in the IR backend, calling `toString()` on function references doesn't produce unique values.

**Solution**: use the `name` property instead of `toString()`.

## Explicitly specify binaries.executable() in the build script

**Issue**: the compiler doesn't produce executable `.js` files. 

This may happen because the default compiler produces JavaScript executables by default while the IR compiler needs an
explicit instruction to do this. Learn more in the [Kotlin/JS project setup instruction](js-project-setup.md#执行环境).

**Solution**: add the line `binaries.executable()` to the project's `build.gradle(.kts)`.

```kotlin
kotlin {
    js(IR) {
        browser {
        }
        binaries.executable()
    }
}
```

## Additional troubleshooting tips when working with the Kotlin/JS IR compiler

These hints may help you when troubleshooting problems in your projects using the Kotlin/JS IR compiler.

### Make boolean properties nullable in external interfaces

**Issue**: when you call `toString` on a `Boolean` from an external interface, you're getting an error like `Uncaught TypeError: Cannot read properties of undefined (reading 'toString')`. JavaScript treats the `null` or `undefined` values of a boolean variable as `false`. If you rely on calling `toString` on a `Boolean` that may be `null` or `undefined` (for example when your code is called from JavaScript code you have no control over), be aware of this:

```kotlin
external interface SomeExternal {
    var visible: Boolean
}

fun main() {
    val empty: SomeExternal = js("{}")
    println(empty.visible.toString()) // Uncaught TypeError: Cannot read properties of undefined (reading 'toString')
}
```

**Solution**: you can make your `Boolean` properties of external interfaces nullable (`Boolean?`):

```kotlin
// Replace this
external interface SomeExternal {
    var visible: Boolean
}
```

```kotlin
// With this
external interface SomeExternal {
    var visible: Boolean?
}
```
