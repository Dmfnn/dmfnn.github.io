Docs.page({
  project: 'hasm', section: 'start', id: 'overview', order: 1, title: 'Overview',
  summary: 'What HASM is, what it is good for and how a program travels from source text to a running process.',
  blocks: [
    D.lead('HASM (Hybrid Assembly) is a small, statically typed programming language with classes, interfaces, enums, lists, maps and coroutines. Programs compile to a compact binary format that a lightweight virtual machine runs; the machine is a plain Java library, so any Java program can host it.'),
    D.cards([
      { title: 'Statically typed', text: 'Every expression has a type the compiler checks. Narrowing conversions need an explicit cast.', icon: 'shield' },
      { title: 'Object oriented', text: 'Classes with single inheritance, interfaces, static members and enums.', icon: 'cube' },
      { title: 'Cooperative concurrency', text: 'async functions, yield and await run as coroutines on one scheduler.', icon: 'bolt' },
      { title: 'Embeddable', text: 'The host connects the Java classes a program may call; nothing else is reachable.', icon: 'puzzle' },
      { title: 'Linkable', text: 'Libraries link statically into a binary, or dynamically through a generated SDK.', icon: 'link' },
      { title: 'Self-hosted library', text: 'The standard library is written in HASM on top of a few Java API classes.', icon: 'layers' }
    ]),
    D.h2('The toolchain'),
    D.table(['Piece', 'What it does'], [
      ['`hasm build`', 'Reads `build.json`, compiles the listed targets and writes `.bin` files (and optionally `.hdecl` SDK files).'],
      ['`hasm run`', 'Loads a compiled binary and executes it on the virtual machine.'],
      ['Standard library', 'The `std.*` modules in `stdlib/`, compiled together with your sources when you import them.'],
      ['Runtime (Java)', 'The virtual machine, the process scheduler and the API classes a host connects. See [Embedding](doc:embedding).']
    ]),
    D.h2('From source to process'),
    D.steps([
      { title: 'Write sources', text: 'Files with the `.hasm` extension. Each starts with a `pkg` line naming its module.' },
      { title: 'Describe the build', text: 'A `build.json` lists targets: which files to compile, where the output goes, how to link. See [build.json](doc:build-json).' },
      { title: 'Compile', text: 'The compiler parses, type checks and emits one binary per target. Errors point at the source line.' },
      { title: 'Run', text: 'The virtual machine verifies the binary header, resolves libraries and the Java APIs the program declared with `usingapi`, then runs the `@entry` function.' }
    ]),
    D.note('The binary format is versioned. A binary built by one format version is refused by a toolchain that expects another; just recompile. The current version is 5.', 'Binary compatibility')
  ]
});

Docs.page({
  project: 'hasm', section: 'start', id: 'command-line', order: 2, title: 'Command line',
  summary: 'The hasm tool: building projects and running binaries.',
  blocks: [
    D.p('The command line tool has four commands. Every command also has a one-letter alias.'),
    D.table(['Command', 'Alias', 'Purpose'], [
      ['`hasm build <project_dir> [-t <target>]... [--out-dir <dir>]`', '`b`, `compile`, `c`', 'Builds the targets of the project\'s `build.json`.'],
      ['`hasm run [-q] <binary> [args...]`', '`r`', 'Runs a compiled binary.'],
      ['`hasm version`', '`v`', 'Prints the tool and Java versions.'],
      ['`hasm help`', '`h`, `-h`, `--help`', 'Prints the built-in help, including a `build.json` summary.']
    ]),
    D.h2('Building'),
    D.code('bash', `
      hasm build ./myproject
      hasm build ./myproject -t app --out-dir ./out`),
    D.p('Without `-t` every target is built, in dependency order. With one or more `-t` options only those targets are built, plus the library targets they link against. `--out-dir` replaces `outDir` from `build.json`.'),
    D.p('The compiler stops at the first failing target and prints diagnostics with the file, line and a caret under the offending token. Set the environment variable `HASM_DEBUG` to get a Java stack trace for unexpected failures.'),
    D.h2('Running'),
    D.code('bash', `
      hasm run ./app.bin
      hasm run ./app.bin first second
      hasm run -q ./app.bin`),
    D.p('Arguments after the binary are passed to the `@entry` function as a `list<string>`. With `-q` (`--quiet`) only the program\'s own output is printed and the tool\'s exit code is the program\'s: the value given to `Os.exit` / `SystemApi.exit`, or `1` after an uncaught runtime error.'),
    D.h2('Environment'),
    D.table(['Variable', 'Meaning'], [
      ['`HASM_STDLIB`', 'Directory that holds the standard library (`std/...`). Also settable as the Java property `-Dhasm.stdlib`. By default the compiler looks next to itself and in the working directory.'],
      ['`HASM_LIB_PATH`', 'Directories (separated like `PATH`) searched for dynamically linked libraries when a program runs. Default: `./lib` and `./libraries`.'],
      ['`HASM_DEBUG`', 'When set, failures print a Java stack trace.']
    ])
  ]
});

Docs.page({
  project: 'hasm', section: 'start', id: 'first-program', order: 3, title: 'Your first program',
  summary: 'Create a project, compile it and run it.',
  blocks: [
    D.steps([
      { title: 'Create the sources', blocks: [
        D.p('A project is a directory with a `build.json` and your `.hasm` files.'),
        D.code('hasm', `
          pkg demo.Hello

          import std.string.Strings as Str
          usingapi FileApi

          @entry
          func void main(list<string> args) {
              string who = "world"
              if Str.length(who) > 0 {
                  FileApi.println("Hello, " + Str.capitalize(who) + "!")
              }
          }`, 'main.hasm')] },
      { title: 'Describe the build', blocks: [
        D.code('json', `
          {
            "type": "debug",
            "targets": [
              { "name": "hello", "sources": ["main.hasm"], "output": "hello.bin" }
            ]
          }`, 'build.json')] },
      { title: 'Build and run', blocks: [
        D.code('bash', `
          hasm build .
          hasm run hello.bin`),
        D.code('text', 'Hello, World!', 'output')] }
    ]),
    D.h2('What the first lines mean'),
    D.dl([
      ['`pkg demo.Hello`', 'Names the module this file defines. Every source file starts with it.'],
      ['`import std.string.Strings as Str`', 'Makes the functions of a module available under a short name.'],
      ['`usingapi FileApi`', 'Declares a Java API class the program calls. The host must provide it, or the binary is refused at load time.'],
      ['`@entry`', 'Marks the function the machine starts with. A program has exactly one.']
    ]),
    D.note('`FileApi.println` is the console output of the standard API set; the standard library wraps it as `Console.println` and `Stdio.println`. See [Standard library](doc:std-console).')
  ]
});
