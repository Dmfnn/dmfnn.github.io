Docs.page({
  project: 'hasm', section: 'build', id: 'build-json', order: 1, title: 'build.json reference',
  summary: 'Every field of the project file that drives the compiler.',
  blocks: [
    D.lead('A HASM project is a directory with a `build.json` at its root. The file lists one or more **targets**; each target turns a set of source files into one binary.'),
    D.code('json', `
      {
        "outDir": "build",
        "type": "release",
        "targets": [
          { "name": "app", "sources": ["src/**/*.hasm"], "main": "src/Main.hasm", "output": "app.bin" }
        ]
      }`, 'build.json'),
    D.h2('Project fields'),
    D.table(['Field', 'Type', 'Default', 'Meaning'], [
      ['`outDir`', 'string', '`"."`', 'Directory that receives the outputs. Relative paths are resolved against the project directory; `--out-dir` on the command line overrides it.'],
      ['`type`', '`debug` | `release`', '`release`', 'Default build type of every target. `debug` keeps symbols and line tables; `release` obfuscates names.'],
      ['`exportSymbols`', 'bool', '`true`', 'Default for targets: whether the binary lists its public symbols so other binaries can link to it.'],
      ['`targets`', 'array', 'required', 'The targets to build, in order.']
    ]),
    D.h2('Target fields'),
    D.table(['Field', 'Type', 'Default', 'Meaning'], [
      ['`name`', 'string', 'required', 'Unique name. Selected with `-t name`; referenced by `link.targets`.'],
      ['`kind`', '`executable` | `library`', '`executable`', 'A library has no entry point and can be linked into other targets.'],
      ['`sources`', 'string[]', 'required', 'Source files. Glob patterns (`*`, `**`, `?`) are accepted.'],
      ['`main`', 'string', 'auto', 'Source file holding `@entry`. Required only when several sources define one.'],
      ['`output`', 'string', 'name + `.bin`', 'Output path relative to `outDir`. Parent directories are created.'],
      ['`type`', '`debug` | `release`', 'project value', 'Overrides the project build type for this target.'],
      ['`exportSymbols`', 'bool', 'project value', 'Overrides the project setting for this target.'],
      ['`declarations`', 'string[]', '`[]`', '`.hdecl` files (globs allowed) describing modules that are provided by another binary.'],
      ['`sdk`', 'string', 'none', 'Libraries only: a directory that receives a generated `.hdecl` for the library, ready to be used as another target\'s `sdkPath`.'],
      ['`link`', 'object', 'none', 'How the target consumes libraries. See below.']
    ]),
    D.h2('The link object'),
    D.table(['Field', 'Type', 'Meaning'], [
      ['`mode`', '`static` | `dynamic`', 'Static copies the library\'s code into the binary; dynamic records a reference that is resolved when the program is loaded.'],
      ['`targets`', 'string[]', 'Names of library targets of the same project to link. They are built before the program automatically, even when you select only the program with `-t`.'],
      ['`files`', 'string[]', 'Library binaries (`.bin`) outside the project to link.'],
      ['`sdkPath`', 'string', 'Directory of `.hdecl` files that tell the compiler what the libraries export. Every file in it is read.']
    ]),
    D.p('Details and examples are on the [Linking](doc:linking) page.'),
    D.h2('Build types'),
    D.table(['', 'debug', 'release'], [
      ['Line tables', 'kept', 'dropped'],
      ['Symbol names', 'kept', 'obfuscated'],
      ['Intended for', 'development and tests', 'shipping']
    ]),
    D.h2('Configuration errors'),
    D.p('Problems in the file stop the build before any compilation starts. The message names the file or pattern at fault.'),
    D.table(['Message', 'Cause'], [
      ['`build.json not found in <dir>`', 'The directory passed to `hasm build` has no project file.'],
      ['`build.json: file is empty`', 'The file exists but has no content.'],
      ['`Unknown target \'x\' — available: ...`', '`-t` named a target that does not exist.'],
      ['`source \'x\' is not a .hasm file`', 'A listed source has another extension.'],
      ['`output \'x\' would overwrite a source file`', '`output` resolves to one of the target\'s own sources.'],
      ['`"main" \'x\' is not among the target\'s sources`', '`main` points outside `sources`.'],
      ['`cannot tell which of its N sources ...`', 'Several sources define `@entry` and `main` is not set.'],
      ['`... pattern \'p\' matched no files`', 'A glob in `sources`, `declarations` or `link.files` found nothing.'],
      ['`SDK directory not found: d`', '`link.sdkPath` does not exist.'],
      ['`link file not found: f`', 'An entry of `link.files` does not exist.']
    ])
  ]
});

Docs.page({
  project: 'hasm', section: 'build', id: 'linking', order: 2, title: 'Libraries and linking',
  summary: 'Building libraries, declaring their API with .hdecl files and linking statically or dynamically.',
  blocks: [
    D.lead('Code can be shared between programs as a **library**: a target with `"kind": "library"`. A program that imports a library module must be told what the module exports; that information is a `.hdecl` declaration file.'),
    D.h2('Declaration files'),
    D.p('A `.hdecl` file lists the signatures of a module without bodies. It starts with the module name and may name the binary that provides it.'),
    D.code('hasm', `
      pkg std.math.MathLib
      #module "mathlib.bin"

      func int abs(int n)
      func int pow(int base, int exp)

      class Accumulator {
          int    total
          string label

          ~Accumulator(string label, int start)

          func void add(int amount)
          func string describe()
          static func int triple(int n)
      }`, 'mathlib.hdecl'),
    D.p('The optional `#module "file"` line names the library binary; dynamic linking uses it to find the library at load time. You rarely write these files by hand: give the library an `sdk` directory and the compiler generates the file for you.'),
    D.h2('Static linking'),
    D.p('The library code is copied into the program. The result is a single self-contained binary. Declare what the library exports with `declarations` and name the library target in `link.targets`.'),
    D.code('json', `
      {
        "targets": [
          { "name": "mathlib", "kind": "library",
            "sources": ["mathlib.hasm"], "output": "mathlib.bin" },
          { "name": "app",
            "sources": ["main.hasm"],
            "declarations": ["mathlib.hdecl"],
            "output": "app.bin",
            "link": { "mode": "static", "targets": ["mathlib"] } }
        ]
      }`, 'build.json'),
    D.h2('Dynamic linking'),
    D.p('The program stores only a reference. The library is loaded from a separate `.bin` when the program starts, so a library can be updated without rebuilding its users. The library target writes its declarations to `sdk`, and the program reads them through `sdkPath`.'),
    D.code('json', `
      {
        "targets": [
          { "name": "mathlib", "kind": "library",
            "sources": ["mathlib.hasm"], "output": "mathlib.bin",
            "sdk": "sdk" },
          { "name": "app", "kind": "executable",
            "sources": ["main.hasm"], "output": "app.bin",
            "link": { "mode": "dynamic", "sdkPath": "sdk" } }
        ]
      }`, 'build.json'),
    D.code('hasm', `
      pkg demo.Main
      usingapi Stdio
      import std.math.MathLib as Math

      @entry
      func void main() {
          Stdio.println(Math.pow(2, 10))    // 1024
      }`, 'main.hasm'),
    D.h2('Where libraries are found at run time'),
    D.p('When a dynamically linked program starts, the runtime resolves each referenced library through a **library resolver**. The command-line tool searches the directories listed in `HASM_LIB_PATH` (colon-separated; by default `./lib` and `./libraries`) for the file named in the `#module` line. Embedding hosts can supply their own resolver; see [Embedding](doc:embedding).'),
    D.table(['', 'Static', 'Dynamic'], [
      ['Result', 'One binary', 'Program plus library files'],
      ['Library update', 'Rebuild the program', 'Replace the library file'],
      ['Needs at run time', 'Nothing', 'A resolver that can load the library'],
      ['Declarations from', '`declarations`', '`sdkPath`']
    ]),
    D.note('Declarations and library must describe the same API. Regenerate the `.hdecl` (through `sdk`) whenever the library\'s public functions or classes change.')
  ]
});
