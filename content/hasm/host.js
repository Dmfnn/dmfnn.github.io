Docs.page({
  project: 'hasm', section: 'host', id: 'embedding', order: 1, title: 'Embedding the runtime',
  summary: 'Running HASM binaries inside a Java application: processes, output, API classes and library loading.',
  blocks: [
    D.lead('Besides the command-line tool, HASM can be used as a library. A Java application starts a **runtime**, spawns programs as **processes** and decides which Java API classes each process may use.'),
    D.h2('The pieces'),
    D.table(['Class', 'Package', 'Role'], [
      ['`HasmRuntime`', '`hasm.process`', 'Scheduler and process table. One background thread runs all processes cooperatively.'],
      ['`HasmProcess`', '`hasm.process`', 'A running program: pid, state, result, exit listeners.'],
      ['`HasmOutput`', '`hasm.io`', 'Output bus: program output, error output and diagnostics, delivered to listeners.'],
      ['`VirtualMachine`', '`hasm`', 'Executes one binary. Receives API classes through `connectClass`.'],
      ['`LibraryResolver`', '`hasm.loader`', 'Supplies library binaries for dynamically linked programs.'],
      ['`ApiCatalog`', '`hasm.process`', 'Named API factories and per-process grants.']
    ]),
    D.h2('Running a program'),
    D.code('java', `
      HasmRuntime runtime = new HasmRuntime();
      runtime.start();

      HasmOutput output = new HasmOutput();
      output.addListener(m -> {
          if (m.getChannel() == HasmOutput.Channel.STDOUT) System.out.print(m.getText());
      });

      HasmRuntime.ApiConnector apis = (vm, out, pid) -> {
          vm.connectClass("FileApi", new FileApi(out));
          vm.connectClass("SystemApi", new SystemApi(vm));
      };

      byte[] binary = Files.readAllBytes(Paths.get("app.bin"));
      HasmProcess process = runtime.spawn(binary, "app", new Object[] { "first-arg" }, apis, output);

      process.addExitListener((p, state, result) -> System.out.println("exit: " + state));
      runtime.awaitTermination(process, 10_000);
      runtime.shutdown(1_000);`, 'Main.java'),
    D.h2('The scheduler'),
    D.p('A single thread sweeps all registered processes and lets each run its queued coroutines until they all wait or finish, then moves to the next. A CPU-bound process therefore cannot starve a short one that was started later, and a process that sleeps costs nothing while it waits. `spawn`, `spawnDaemon`, `kill`, `getProcess` and `listProcesses` may be called from any thread; exit notifications arrive on the scheduler thread.'),
    D.h2('Processes'),
    D.table(['Method', 'Meaning'], [
      ['`spawn(path or bytes, name, args, connector, output)`', 'Starts a **task**: it ends when its entry point returns or fails. The binary comes from a file path or from memory. Returns immediately.'],
      ['`spawnDaemon(...)`', 'Starts a **daemon**: it stays alive after its entry point returns, waiting for events, until `kill`.'],
      ['`spawnChild(parentPid, binary, ...)`', 'Starts a task owned by a running process; it is killed together with its parent.'],
      ['`kill(pid)`', 'Terminates a process. Returns whether it was running.'],
      ['`getProcess(pid)`, `listProcesses()`', 'Look up processes.'],
      ['`awaitTermination(process, ms)`', 'Blocks until the process ends or the time runs out.'],
      ['`shutdown(ms)`', 'Stops the scheduler.']
    ]),
    D.p('`HasmRuntime.HOST_PID` (`0`) is the parent pid reported for processes started by the host.'),
    D.h3('Process states'),
    D.table(['State', 'Meaning'], [
      ['`CREATED`', 'Constructed, not yet running.'],
      ['`RUNNING`', 'Not yet exited. A daemon waiting for events is still `RUNNING`.'],
      ['`TERMINATED`', 'The entry point returned normally.'],
      ['`FAILED`', 'The program ended with an error; `getFailureCause()` tells why.'],
      ['`KILLED`', 'Stopped by `kill` or because its parent ended.']
    ]),
    D.h3('Delivering events to a daemon'),
    D.p('`process.deliverExternalEvent(name, address, args)` queues a call of the function at a bytecode address inside the process. A daemon whose entry point has returned uses this to react to messages, timers or user input from the host. It throws `IllegalStateException` once the process has ended.'),
    D.h2('Output'),
    D.p('Everything a process prints goes to its `HasmOutput`. Each message has a channel: `STDOUT`, `STDERR` or `DIAGNOSTIC` (runtime notes such as a failed background coroutine), a text and a timestamp. `HasmOutput.console()` creates a bus that prints to the Java console.'),
    D.h2('Connecting API classes'),
    D.p('A program can call only the API classes that the host connected before the binary was loaded. The connector callback runs once per spawn with the new `VirtualMachine`, the output bus and the process id; the pid lets an API class register per-process state. See [API classes](doc:api-classes) for writing your own.'),
    D.h3('Catalogs and grants'),
    D.p('`ApiCatalog` names the APIs a host offers. Register a factory per name, then create a connector for a set of **grants**:'),
    D.code('java', `
      ApiCatalog catalog = new ApiCatalog()
          .register("FileApi", ctx -> new FileApi(ctx.output()))
          .register("SystemApi", ctx -> new SystemApi(ctx.vm()));

      HasmRuntime.ApiConnector connector =
          catalog.connector(runtime, Set.of("FileApi"));   // SystemApi not granted`),
    D.p('A binary that declares `usingapi` for something outside its grants fails to load. A process can hand a subset of its own grants to the children it starts, which gives a capability-style permission model.'),
    D.h2('Dynamic libraries'),
    D.p('Implement `LibraryResolver` to tell the machine where library binaries live. `load(moduleName)` receives the name from the `#module` line (for example `"mathlib.bin"`) and returns the bytes, `null` when the library does not exist, or throws `IOException` when it exists but cannot be read.'),
    D.code('java', `
      vm.setLibraryResolver(name -> {
          Path file = libraryDir.resolve(name);
          return Files.exists(file) ? Files.readAllBytes(file) : null;
      });`),
    D.p('`FileLibraryResolver` is the ready-made implementation used by the command-line tool. It searches the directories of `HASM_LIB_PATH`, or `./lib` and `./libraries` when the variable is not set.'),
    D.h2('Loading without the scheduler'),
    D.p('For a single run without a runtime, create a `VirtualMachine`, connect classes and call `execute(path or bytes, argList)`, or `load(...)` followed by pumping the machine yourself. The runtime is the recommended route because it also handles scheduling, sleeping and process bookkeeping.')
  ]
});

Docs.page({
  project: 'hasm', section: 'host', id: 'api-classes', order: 2, title: 'API classes',
  summary: 'How a program reaches Java code, how to write your own API class and the reference of the standard ones.',
  blocks: [
    D.lead('An **API class** is an ordinary Java object whose public methods a HASM program can call. The program names it with `usingapi`; the host provides the object with `connectClass`.'),
    D.h2('Writing an API class'),
    D.code('java', `
      public final class Clock {
          public long now() { return System.currentTimeMillis(); }
          public String format(long millis, String pattern) { ... }
          public void sleep(int ms) { ... }
      }

      // when spawning
      vm.connectClass("Clock", new Clock());`, 'Clock.java'),
    D.code('hasm', `
      pkg demo.Main
      usingapi Clock

      @entry
      func void main() {
          long t = Clock.now()
      }`, 'main.hasm'),
    D.p('The name given to `connectClass` must equal the name after `usingapi`. If a program declares a class the host did not connect, loading fails with `This binary using unknown Java API: \'Clock\'`.'),
    D.h2('Type mapping'),
    D.table(['HASM', 'Java'], [
      ['`int`', '`int`, `short`, `byte`'],
      ['`long`', '`long`'],
      ['`float`, `double`', '`float`, `double`'],
      ['`bool`', '`boolean`'],
      ['`string`', '`String`'],
      ['`bytes`', '`byte[]`'],
      ['`list<T>`', '`java.util.List`'],
      ['`map<K,V>`', '`java.util.Map`'],
      ['`list<string>`', '`String[]` returned from a method'],
      ['`any`', '`Object` and anything else']
    ]),
    D.h2('Errors'),
    D.p('A method that throws `VMException` produces an error whose message is the exception text; the program can `catch (string e)` it. A checked exception is wrapped into a `VMException` with its message. Throw `VMException` for every failure you want programs to handle. Methods are looked up by name and matched against the argument values, so overloads are allowed.'),
    D.h2('Compile-time checking'),
    D.p('The compiler checks method names and argument counts for the standard classes (`hasm.api.*`) by reflection. A class it cannot find at build time is accepted unchecked, so a host class works without any declaration; mistakes in it show up when the program runs.'),
    D.h2('Standard classes'),
    D.p('These ship with the language. Most programs use them through the [library modules](doc:std-strings), which add a friendlier layer.'),
    D.module({
      kind: 'class', name: "StringApi", pkg: 'hasm.api',
      summary: "Wrapped by the library module std.string.Strings.",
      groups: [{ title: 'Methods', fns: [
        ["func int length(string str)", ""],
        ["func string charAt(string str, int index)", "Single character at `index` as a string; \"\" when out of range."],
        ["func int charCodeAt(string str, int index)", "Unicode code unit at `index`; 0 when out of range."],
        ["func string fromCharCode(int code)", ""],
        ["func list<any> chars(string str)", "All characters of the string as a list of one-character strings."],
        ["func bool contains(string str, string pattern)", ""],
        ["func bool startsWith(string str, string prefix)", ""],
        ["func bool endsWith(string str, string suffix)", ""],
        ["func list<any> split(string str, string delimiter)", "Splits on a literal delimiter (not a regex)."],
        ["func string join(list<any> parts, string separator)", ""],
        ["func string substring(string str, int start, int end)", ""],
        ["func string toLowerCase(string str)", ""],
        ["func string toUpperCase(string str)", ""],
        ["func string trim(string str)", ""],
        ["func string replace(string str, string target, string replacement)", ""],
        ["func int indexOf(string str, string pattern)", ""],
        ["func int lastIndexOf(string str, string pattern)", ""],
        ["func string repeat(string str, int times)", ""],
        ["func string reverse(string str)", ""],
        ["func bool isBlank(string str)", ""],
        ["func int compare(string a, string b)", "Lexicographic comparison: negative, zero or positive."],
        ["func string format(string pattern, list<any> args)", "printf-style formatting: `format(\"%5.2f|%s\", [3.14159, \"x\"])`."]
      ] }]
    }),
    D.module({
      kind: 'class', name: "ListApi", pkg: 'hasm.api',
      summary: "Wrapped by the library module std.collections.Lists.",
      groups: [{ title: 'Methods', fns: [
        ["func int size(list<any> list)", ""],
        ["func bool isEmpty(list<any> list)", ""],
        ["func any get(list<any> list, int index)", ""],
        ["func void add(list<any> list, any value)", ""],
        ["func void insert(list<any> list, int index, any value)", ""],
        ["func any remove(list<any> list, int index)", "Removes and returns the element at `index`."],
        ["func bool removeValue(list<any> list, any value)", "Removes the first element equal to `value`; returns whether one was removed."],
        ["func void clear(list<any> list)", ""],
        ["func bool contains(list<any> list, any value)", ""],
        ["func int indexOf(list<any> list, any value)", ""],
        ["func list<any> copy(list<any> list)", ""],
        ["func list<any> slice(list<any> list, int from, int to)", ""],
        ["func list<any> concat(list<any> a, list<any> b)", ""],
        ["func void addAll(list<any> target, list<any> source)", ""],
        ["func void reverse(list<any> list)", ""],
        ["func void sort(list<any> list)", "Sorts in place (ascending)."],
        ["func void sortDescending(list<any> list)", ""],
        ["func void shuffle(list<any> list)", ""]
      ] }]
    }),
    D.module({
      kind: 'class', name: "MapApi", pkg: 'hasm.api',
      summary: "Wrapped by the library module std.collections.Maps.",
      groups: [{ title: 'Methods', fns: [
        ["func int size(map<any,any> map)", ""],
        ["func bool isEmpty(map<any,any> map)", ""],
        ["func void put(map<any,any> map, any key, any value)", ""],
        ["func any get(map<any,any> map, any key)", "Value for `key`, or null when absent."],
        ["func any getOr(map<any,any> map, any key, any fallback)", ""],
        ["func bool has(map<any,any> map, any key)", ""],
        ["func any remove(map<any,any> map, any key)", "Removes `key`; returns the previous value or null."],
        ["func void clear(map<any,any> map)", ""],
        ["func list<any> keys(map<any,any> map)", ""],
        ["func list<any> values(map<any,any> map)", ""],
        ["func map<any,any> copy(map<any,any> map)", ""],
        ["func void putAll(map<any,any> target, map<any,any> source)", ""]
      ] }]
    }),
    D.module({
      kind: 'class', name: "MathApi", pkg: 'hasm.api',
      summary: "Wrapped by the library module std.math.Math.",
      groups: [{ title: 'Methods', fns: [
        ["func float sqrt(float x)", ""],
        ["func float cbrt(float x)", ""],
        ["func float pow(float base, float exp)", ""],
        ["func float exp(float x)", ""],
        ["func float log(float x)", ""],
        ["func float log10(float x)", ""],
        ["func float sin(float x)", ""],
        ["func float cos(float x)", ""],
        ["func float tan(float x)", ""],
        ["func float asin(float x)", ""],
        ["func float acos(float x)", ""],
        ["func float atan(float x)", ""],
        ["func float atan2(float y, float x)", ""],
        ["func float floor(float x)", ""],
        ["func float ceil(float x)", ""],
        ["func float round(float x)", ""],
        ["func bool isNaN(float x)", ""],
        ["func bool isInfinite(float x)", ""],
        ["func float random()", "Uniform float in [0, 1)."],
        ["func int randomInt(int min, int max)", "Uniform int in [min, max] (inclusive)."],
        ["func void seed(long seed)", ""]
      ] }]
    }),
    D.module({
      kind: 'class', name: "BytesApi", pkg: 'hasm.api',
      summary: "Wrapped by the library module std.bytes.Bytes.",
      groups: [{ title: 'Methods', fns: [
        ["func bytes alloc(int size)", "A zero-filled buffer of `size` bytes."],
        ["func bytes ofList(list<any> values)", "Builds a buffer from a list of ints, each in `0..255`."],
        ["func list<any> toList(bytes b)", "The buffer as a list of ints in `0..255`."],
        ["func bytes encode(string s)", "UTF-8 encoding of `s`."],
        ["func string decode(bytes b)", "UTF-8 decoding of the whole buffer (malformed input is replaced with U+FFFD)."],
        ["func string decodeRange(bytes b, int off, int len)", "UTF-8 decoding of `len` bytes starting at `off`."],
        ["func string hex(bytes b)", "Lower-case hex, two digits per byte, no separators."],
        ["func bytes fromHex(string s)", "Parses hex produced by {."],
        ["func int size(bytes b)", ""],
        ["func int get(bytes b, int index)", ""],
        ["func void set(bytes b, int index, int value)", ""],
        ["func int getI8(bytes b, int off)", ""],
        ["func int getU16BE(bytes b, int off)", ""],
        ["func int getU16LE(bytes b, int off)", ""],
        ["func int getI16BE(bytes b, int off)", ""],
        ["func int getI16LE(bytes b, int off)", ""],
        ["func long getU32BE(bytes b, int off)", ""],
        ["func long getU32LE(bytes b, int off)", ""],
        ["func int getI32BE(bytes b, int off)", ""],
        ["func int getI32LE(bytes b, int off)", ""],
        ["func long getI64BE(bytes b, int off)", "64-bit value; values above `2^63-1` come back as negative numbers (two's complement)."],
        ["func long getI64LE(bytes b, int off)", ""],
        ["func void setU16BE(bytes b, int off, int value)", ""],
        ["func void setU16LE(bytes b, int off, int value)", ""],
        ["func void setU32BE(bytes b, int off, long value)", ""],
        ["func void setU32LE(bytes b, int off, long value)", ""],
        ["func void setI64BE(bytes b, int off, long value)", ""],
        ["func void setI64LE(bytes b, int off, long value)", ""],
        ["func bytes slice(bytes b, int from, int to)", "A copy of `[from, to)`."],
        ["func void copy(bytes src, int srcOff, bytes dst, int dstOff, int len)", "Copies `len` bytes between buffers; overlapping ranges of the same buffer are handled correctly."],
        ["func void fill(bytes b, int from, int to, int value)", "Sets every byte of `[from, to)` to `value`."],
        ["func bytes concat(bytes a, bytes b)", ""],
        ["func bytes resize(bytes b, int newSize)", "A new buffer of `newSize` bytes: the old content, truncated or zero-padded."],
        ["func bool equals(bytes a, bytes b)", ""],
        ["func int compare(bytes a, bytes b)", "Unsigned lexicographic comparison: negative, zero or positive."],
        ["func int indexOf(bytes hay, bytes needle, int from)", "Index of the first occurrence of `needle` at or after `from`, or -1."]
      ] }]
    }),
    D.module({
      kind: 'class', name: "FileApi", pkg: 'hasm.api',
      summary: "Wrapped by the library module std.io.Console and std.io.Files.",
      groups: [{ title: 'Methods', fns: [
        ["func void println(any value)", ""],
        ["func void print(any value)", ""],
        ["func void eprintln(any value)", "Writes to the error stream (diagnostics channel), followed by a newline."],
        ["func string readLine()", ""],
        ["func bool fileExists(string path)", ""],
        ["func string readFile(string path)", ""],
        ["func void writeFile(string path, string content)", ""],
        ["func void deleteFile(string path)", ""],
        ["func void createDir(string path)", ""],
        ["func void copyFile(string from, string to)", ""],
        ["func void moveFile(string from, string to)", ""],
        ["func list<string> listFiles(string path)", ""],
        ["func long getFileSize(string path)", ""],
        ["func long getDirectorySize(string path)", ""],
        ["func bool isDirectory(string path)", ""]
      ] }]
    }),
    D.module({
      kind: 'class', name: "Stdio", pkg: 'hasm.api',
      summary: "Standard input and output of the process; the library module Console uses FileApi instead.",
      groups: [{ title: 'Methods', fns: [
        ["func void println(any value)", ""],
        ["func void print(any value)", ""],
        ["func void eprintln(any value)", ""],
        ["func void eprint(any value)", ""],
        ["func string readLine()", "The next line of input without its line break; `null` at end of input."],
        ["func string pollLine()", "The next line if one is available right now, otherwise `null` (see {."],
        ["func bool eof()", "True once the input is closed and fully read."]
      ] }]
    }),
    D.module({
      kind: 'class', name: "SystemApi", pkg: 'hasm.api',
      summary: "Wrapped by the library module std.os.Os and std.time.Time.",
      groups: [{ title: 'Methods', fns: [
        ["func void exit(int code)", "Terminates the whole program with the given exit code."],
        ["func string getenv(string name)", "Environment variable, or null when unset."],
        ["func long currentTimeMillis()", ""],
        ["func long nanoTime()", ""],
        ["func void sleep(int millis)", "Pauses the calling program for `millis` milliseconds; other programs keep running."],
        ["func string osName()", ""],
        ["func string lineSeparator()", ""]
      ] }]
    }),
    D.module({
      kind: 'class', name: "Util", pkg: 'hasm.api',
      summary: "Small conversion helpers.",
      groups: [{ title: 'Methods', fns: [
        ["func string intToString(int value)", ""],
        ["func string floatToString(float value)", ""],
        ["func string boolToString(bool value)", ""],
        ["func string longToString(long value)", ""],
        ["func int stringToInt(string str)", ""],
        ["func float stringToFloat(string str)", ""],
        ["func string concat(string a, string b)", ""],
        ["func int strlen(string str)", ""],
        ["func string substring(string str, int start, int end)", ""],
        ["func long getCurrentTimeStamp()", ""],
        ["func long getNanoTime()", ""]
      ] }]
    })
  ]
});
