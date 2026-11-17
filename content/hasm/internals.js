Docs.page({
  project: 'hasm', section: 'internals', id: 'binary-format', order: 1, title: 'Binary format',
  summary: 'What a compiled .bin file contains and how versions are checked.',
  blocks: [
    D.lead('The compiler turns each target into one binary file that the virtual machine can load directly, from a file or from memory.'),
    D.h2('Header'),
    D.table(['Offset', 'Size', 'Content'], [
      ['0', '4 bytes', 'Magic: the ASCII text `HASM`.'],
      ['4', '1 byte', 'Format version. The current version is `5`.'],
      ['5', '1 byte', 'Flags.']
    ]),
    D.table(['Flag', 'Value', 'Meaning'], [
      ['Debug', '`0x01`', 'Built with `"type": "debug"`: symbol names and line tables are present.'],
      ['Library', '`0x02`', 'A library module: no entry point and no start-up code.']
    ]),
    D.p('A binary whose version differs from the one the toolchain expects is rejected with a message saying which version it has and which is expected. Recompile the source with the current compiler.'),
    D.h2('Sections'),
    D.p('After the header the file holds sections for the code and data of the program and for the information the loader needs:'),
    D.table(['Section', 'Purpose'], [
      ['`IMPORT`', 'Modules and libraries the binary needs, including the Java API classes named by `usingapi`.'],
      ['`EXPORT`', 'Public symbols that other binaries can link to (see `exportSymbols`).'],
      ['`DYNAMIC`', 'References to dynamically linked libraries.'],
      ['`DEBUG`', 'Symbols and line tables of a debug build.'],
      ['`STRUCT`', 'Layout of classes.']
    ]),
    D.h2('Debug information'),
    D.p('Debug builds record symbols as short tagged strings: functions (`F`), globals (`G`), classes and their fields (`C`), interfaces (`I`), virtual tables (`V`), readable method names (`M`), implemented interfaces (`IC`) and the package name (`P`). The runtime uses them for stack traces; the bundled disassembler prints them.'),
    D.note('Release builds obfuscate names. A host that needs to call a function by address, for example with `deliverExternalEvent`, should resolve the address from a debug build or from the exported symbols.')
  ]
});

Docs.page({
  project: 'hasm', section: 'internals', id: 'virtual-machine', order: 2, title: 'Virtual machine',
  summary: 'The register machine, coroutines and how programs share time.',
  blocks: [
    D.h2('Register machine'),
    D.p('The machine executes register-based bytecode. The machine has 256 registers; instructions read and write registers directly, so there is no operand stack. Values are typed at run time: integers, longs, floats, doubles, booleans, strings, byte buffers, lists, maps and objects.'),
    D.h2('Coroutines'),
    D.p('A program runs as a set of **coroutines**. The entry point is the first one. `async` functions create more, `await` waits for a result and `yield` gives other coroutines a turn. Coroutines of a process share one thread and switch only at these points and at blocking operations such as `sleep`.'),
    D.h2('Sharing the processor'),
    D.p('A long-running loop is not allowed to monopolise the host. The machine counts loop iterations and calls and suspends a coroutine when its time slice is spent, so other coroutines and other processes continue. `sleep` never blocks the thread; the coroutine is parked until its deadline passes.'),
    D.h2('Calling the host'),
    D.p('A call such as `FileApi.println(x)` finds the connected Java object by name, converts the arguments and invokes the method by reflection. Results are converted back to HASM values. Errors thrown by the host method surface as catchable string errors in the program.'),
    D.h2('Loading'),
    D.ol([
      'The header is checked: magic and format version.',
      'Declared Java API classes are matched against the classes the host connected; a missing one stops loading.',
      'Dynamically linked libraries are requested from the library resolver.',
      'Start-up code initialises globals, then the entry point runs with the argument list.'
    ]),
    D.h2('Termination'),
    D.table(['Event', 'Exit code'], [
      ['Entry point returns', '`0`. The returned value of `main` is available to a host as the process result, but it is not the exit code.'],
      ['Uncaught error', '`1`, and the message is written to the error stream.'],
      ['`Os.exit(n)`', '`n`.']
    ])
  ]
});
