Docs.page({
  project: 'hasm', section: 'language', id: 'functions', order: 5, title: 'Functions and coroutines',
  summary: 'Declaring functions, globals, the entry point and asynchronous functions.',
  blocks: [
    D.h2('Declaring a function'),
    D.code('hasm', `
      func int sign(int x) { return x < 0 ? -1 : (x == 0 ? 0 : 1) }

      func long fact(long n) {
          if n <= 1 { return 1L }
          return n * fact(n - 1L)
      }

      func void log(string message) { Stdio.println("[log] " + message) }`),
    D.p('A function names its return type after `func`. A function with a non-void return type must return a value on every path; the compiler reports "must return a value of type \'int\' on every path" otherwise. Calling a function with the wrong number of arguments is an error: "\'add\' takes 2 arguments but 1 was supplied".'),
    D.h2('The entry point'),
    D.p('A program starts at the function marked `@entry`. It takes either no parameters or a `list<string>` of command line arguments, and returns `void` or `int`.'),
    D.code('hasm', `
      @entry
      func int main(list<string> args) {
          Stdio.println("arguments: " + args)
          return 0
      }`),
    D.h2('Global variables'),
    D.p('`global` declares a module-level variable with an initial value. Functions of the module read and write it by name.'),
    D.code('hasm', `
      global int counter = 10
      global bool verbose = false

      func void bump() { counter++  counter += 2 }`),
    D.h2('Statements outside functions'),
    D.p('Only declarations are allowed at module level: functions, classes, interfaces, enums, `global` variables and the `pkg`, `import` and `usingapi` lines. Anything else is rejected with "Statements are not allowed outside of a function".'),
    D.h2('Asynchronous functions'),
    D.p('A function declared `async func` runs as a coroutine. `await` starts it and waits for the result without blocking other coroutines; `yield(value)` inside it hands control back to the scheduler (and reports progress) before continuing.'),
    D.code('hasm', `
      async func int slowSum(int n) {
          int total = 0
          for int i = 1; i <= n; i++ {
              total = total + i
              yield(i)
          }
          return total
      }

      @entry
      func void main() {
          int sum = await slowSum(10)
          Stdio.println("sum = " + sum)
      }`),
    D.p('Exceptions thrown inside an async function propagate to the `await` expression, so `try { int v = await work() } catch (string e) { ... }` works as expected. All coroutines of a process share one thread; a coroutine that never yields and never awaits blocks the others, so long loops should `yield` now and then.')
  ]
});

Docs.page({
  project: 'hasm', section: 'language', id: 'classes', order: 6, title: 'Classes, interfaces and enums',
  summary: 'Objects, constructors, inheritance, interfaces, static members and enumerations.',
  blocks: [
    D.h2('Classes'),
    D.code('hasm', `
      class Animal {
          string name
          int legs = 4

          ~Animal(string name) { self.name = name }

          func string speak() { return self.name + " makes a sound" }
          static func int count(list<Animal> xs) { return 3 }
      }

      @entry
      func void main() {
          Animal a = new Animal("Rex")
          Stdio.println(a.speak())
      }`),
    D.ul([
      'Fields are declared by type and name, with an optional initial value.',
      'The constructor is written `~ClassName(params) { ... }`; use `self` for the current object. A class without a constructor gets an implicit one that takes, in declaration order, the fields that have no initial value: `class P { int x  string s  int y = 7 }` is created with `new P(1, "q")`. Give every field an initial value and `new P()` works with no arguments.',
      'Objects are created with `new ClassName(args)`.',
      'Methods are `func` declarations inside the class; `static func` declares a method called on the class itself.',
      'Unknown members are compile errors: "Class \'Animal\' has no field \'age\'", "Type \'Animal\' has no method \'fly\'".'
    ]),
    D.h2('Inheritance'),
    D.p('A class extends at most one class. A subclass constructor calls the parent constructor with `super(...)`; an overridden method is marked `override` and can reach the parent version with `super.method()`. The compiler checks that `super(...)` supplies the parent\'s required arguments.'),
    D.code('hasm', `
      class Animal {
          string name
          ~Animal(string name) { self.name = name }
          func string speak() { return self.name + " makes a sound" }
      }

      class Dog extends Animal {
          int tricks
          ~Dog(string name, int tricks) { super(name)  self.tricks = tricks }
          override func string speak() { return self.name + " barks" }
          func string both() { return super.speak() + " / " + self.speak() }
      }`),
    D.h2('Interfaces'),
    D.p('An interface lists method signatures. A class that `implement`s it must provide every method; the compiler reports "does not implement" otherwise. A value of the class can be used wherever the interface type is expected.'),
    D.code('hasm', `
      interface Speaker { func string speak() }

      class Bird implement Speaker {
          func string speak() { return "tweet" }
      }

      @entry
      func void main() {
          Speaker s = new Bird()
          Stdio.println(s.speak())
      }`),
    D.p('A class can extend one class and implement interfaces: `class Dog extends Animal implement Speaker`.'),
    D.h2('Enums'),
    D.code('hasm', `
      enum Color { RED, GREEN = 5, BLUE }

      @entry
      func void main() {
          Color c = Color.GREEN
          switch c {
              case Color.RED { Stdio.println("red") }
              case Color.GREEN, Color.BLUE { Stdio.println("green or blue " + c) }
          }
      }`),
    D.p('Enum members take consecutive integer values starting at 0; `= n` sets a value and counting continues from it (`BLUE` is 6 above). Enums are used with `switch` and compare with `==`.'),
    D.h2('Classes in collections'),
    D.code('hasm', `
      class Animal {
          string name
          ~Animal(string name) { self.name = name }
          func string speak() { return self.name + " makes a sound" }
      }

      class Dog extends Animal {
          ~Dog(string name) { super(name) }
          override func string speak() { return self.name + " barks" }
      }

      @entry
      func void main() {
          list<Animal> zoo = [new Dog("Rex"), new Animal("Cat")]
          for Animal an : zoo { Stdio.println(an.speak()) }
      }`),
    D.note('There are no generics beyond the built-in `list<T>` and `map<K,V>`, and no visibility modifiers: every member is public.')
  ]
});

Docs.page({
  project: 'hasm', section: 'language', id: 'errors', order: 7, title: 'Errors and exceptions',
  summary: 'throw, try and catch, runtime errors and what happens when nothing catches them.',
  blocks: [
    D.h2('throw and catch'),
    D.p('`throw(value)` raises an error; the thrown value is a `string`. `try { ... } catch (string e) { ... }` handles it. Handlers nest, and only the nearest matching one fires; a handler can throw again.'),
    D.code('hasm', `
      func void thrower() { throw("late") }

      @entry
      func void main() {
          try { thrower() } catch (string e) { Stdio.println("caught: " + e) }
          try {
              try { thrower() } catch (string e) { throw("re:" + e) }
          } catch (string outer) { Stdio.println(outer) }
      }`),
    D.h2('Runtime errors are catchable'),
    D.p('The virtual machine turns its own failures into the same kind of error, so a program can recover from them. The message names the problem.'),
    D.table(['Situation', 'Example'], [
      ['Integer division by zero', '`1 / 0`'],
      ['List index out of range', '`xs[10]` on a three-element list'],
      ['Member access through `null`', '`nothing.val`'],
      ['A cast that cannot succeed', '`(int) "abc"`'],
      ['Stack overflow', 'unbounded recursion; caught instead of crashing the host'],
      ['Bad arguments to API calls', 'a negative size for `Bytes.alloc`, an out-of-range byte offset']
    ]),
    D.h2('Leaving a try block'),
    D.p('`return`, `break` and `continue` may leave a `try` block; the handler is discarded correctly and does not fire later.'),
    D.h2('Uncaught errors'),
    D.p('An error nobody catches ends the process with exit code `1` and a message on the error stream. `hasm run -q` reports that code as its own exit status. To end deliberately with another code call `Os.exit(code)` (or `SystemApi.exit(code)`).'),
    D.h2('Compile-time errors'),
    D.p('Type and name mistakes are found before the program runs. Typical diagnostics:'),
    D.table(['Message', 'Cause'], [
      ['`Mismatched types: expected \'int\', found \'string\'`', 'Assigning or passing the wrong type.'],
      ['`Undefined variable \'missing\'` / `Undefined function \'nope\'`', 'A name that is not declared.'],
      ['`already declared in this scope`', 'Declaring a variable twice in one block.'],
      ['`Unknown class \'Ghost\'`', 'Using a class that does not exist.'],
      ['`API \'FileApi\' has no method \'printn\'`', 'A misspelt API method.'],
      ['`Cannot find module \'no.such.Module\'`', 'An `import` that names a missing module.'],
      ['`Unterminated string literal`', 'A string without its closing quote.']
    ])
  ]
});

Docs.page({
  project: 'hasm', section: 'language', id: 'modules', order: 8, title: 'Modules, imports and APIs',
  summary: 'pkg, import, usingapi and how a program reaches the standard library and the host.',
  blocks: [
    D.h2('pkg'),
    D.p('Every source file begins with `pkg a.b.Name`. The name identifies the module: other files import it under that name. For library sources the directory layout follows the name (`std/math/Math.hasm` defines `std.math.Math`).'),
    D.h2('import'),
    D.code('hasm', `
      pkg demo.Main
      usingapi Stdio

      import std.math.Math as Math
      import std.string.Strings as Str

      @entry
      func void main() {
          Stdio.println(Math.gcd(12, 18))      // 6
          Stdio.println(Str.upper("hasm"))      // HASM
      }`),
    D.p('`import full.Module.Name as Alias` is the only import form. Functions of the module are called through the alias: `Alias.func()`. Classes defined by the module are used by their own name once the module is imported, for example `Stack s = new Stack()` after `import std.collections.Structures as Structures`. A module that cannot be found is a compile error.'),
    D.h2('usingapi'),
    D.p('`usingapi ClassName` declares that the program calls a Java API class provided by the host. Calls look like static calls: `FileApi.println("x")`. The declaration is recorded in the binary; when the program is loaded the host must have connected every declared class, otherwise loading fails with "This binary using unknown Java API". The compiler checks the method names and argument counts against the classes it knows about.'),
    D.code('hasm', `
      pkg demo.Io
      usingapi FileApi
      usingapi SystemApi

      @entry
      func void main() {
          FileApi.println("running on " + SystemApi.osName())
      }`),
    D.p('Standard API classes shipped with the language: `FileApi`, `Stdio`, `StringApi`, `ListApi`, `MapApi`, `MathApi`, `BytesApi`, `SystemApi`, `Util`. Hosts may add their own. See [API classes](doc:api-classes).'),
    D.h2('Library modules'),
    D.p('A module imported from another target (a library) is linked into your binary or loaded at run time, depending on the target\'s `link` section. See [Linking](doc:linking).')
  ]
});
