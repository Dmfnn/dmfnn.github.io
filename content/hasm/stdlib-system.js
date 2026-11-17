Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-bytes", order: 6, title: "Bytes",
  summary: "Fixed-size byte buffers: creation, text and hex conversion, multi-byte access and block operations.",
  blocks: [
    D.lead("A `bytes` value is a fixed-size mutable buffer. Single bytes can be read and written directly with `buf[i]` (values `0..255`). The functions below add multi-byte access: **U** means unsigned, **I** means sign-extended, **BE** and **LE** mean big and little endian. Offsets count bytes from the start of the buffer."),
    D.code('hasm', "import std.bytes.Bytes as Bytes", 'import'),
    D.module({
      name: "Bytes", pkg: "std.bytes.Bytes",
      summary: "Fixed-size byte buffers: creation, text and hex conversion, multi-byte access and block operations.",
      groups: [
        { title: "Creating and converting", fns: [
          ["func bytes alloc(int size)", "A zero-filled buffer of `size` bytes."],
          ["func bytes ofList(list<any> values)", "Buffer from a list of integers `0..255`."],
          ["func list<any> toList(bytes b)", "The bytes as a list of integers."],
          ["func bytes encode(string s)", "The UTF-8 encoding of `s`."],
          ["func string decode(bytes b)", "Interprets the whole buffer as UTF-8 text."],
          ["func string decodeRange(bytes b, int off, int len)", "Interprets `len` bytes starting at `off` as UTF-8 text."],
          ["func string hex(bytes b)", "Lower-case hexadecimal representation."],
          ["func bytes fromHex(string s)", "Buffer from a hexadecimal string."]
        ] },
        { title: "Single bytes", fns: [
          ["func int size(bytes b)", "Number of bytes."],
          ["func int get(bytes b, int index)", "Byte at `index` as `0..255`."],
          ["func void set(bytes b, int index, int v)", "Stores `v` at `index`."],
          ["func int getI8(bytes b, int off)", "Signed byte, `-128..127`."]
        ] },
        { title: "Reading numbers", fns: [
          ["func int getU16BE(bytes b, int off)", "Unsigned 16-bit, big endian."],
          ["func int getU16LE(bytes b, int off)", "Unsigned 16-bit, little endian."],
          ["func int getI16BE(bytes b, int off)", "Signed 16-bit, big endian."],
          ["func int getI16LE(bytes b, int off)", "Signed 16-bit, little endian."],
          ["func long getU32BE(bytes b, int off)", "Unsigned 32-bit, big endian."],
          ["func long getU32LE(bytes b, int off)", "Unsigned 32-bit, little endian."],
          ["func int getI32BE(bytes b, int off)", "Signed 32-bit, big endian."],
          ["func int getI32LE(bytes b, int off)", "Signed 32-bit, little endian."],
          ["func long getI64BE(bytes b, int off)", "Signed 64-bit, big endian."],
          ["func long getI64LE(bytes b, int off)", "Signed 64-bit, little endian."]
        ] },
        { title: "Writing numbers", fns: [
          ["func void setU16BE(bytes b, int off, int v)", "Writes a 16-bit value, big endian."],
          ["func void setU16LE(bytes b, int off, int v)", "Writes a 16-bit value, little endian."],
          ["func void setU32BE(bytes b, int off, long v)", "Writes a 32-bit value, big endian."],
          ["func void setU32LE(bytes b, int off, long v)", "Writes a 32-bit value, little endian."],
          ["func void setI64BE(bytes b, int off, long v)", "Writes a 64-bit value, big endian."],
          ["func void setI64LE(bytes b, int off, long v)", "Writes a 64-bit value, little endian."]
        ] },
        { title: "Blocks", fns: [
          ["func bytes slice(bytes b, int from, int to)", "New buffer with bytes from `from` up to, but not including, `to`."],
          ["func void copy(bytes src, int srcOff, bytes dst, int dstOff, int len)", "Copies `len` bytes from `src` at `srcOff` into `dst` at `dstOff`."],
          ["func void fill(bytes b, int from, int to, int v)", "Sets bytes `from` up to, but not including, `to` to `v`."],
          ["func bytes concat(bytes a, bytes b)", "New buffer with `a` followed by `b`."],
          ["func bytes resize(bytes b, int newSize)", "New buffer of `newSize` bytes holding the old content, cut or zero-extended."]
        ] },
        { title: "Comparing and searching", fns: [
          ["func bool equals(bytes a, bytes b)", "True when both buffers hold the same bytes."],
          ["func int compare(bytes a, bytes b)", "Lexicographic comparison: negative, zero or positive."],
          ["func int indexOf(bytes hay, bytes needle, int from)", "Position of the first occurrence of `needle` at or after `from`, or `-1`."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-console", order: 7, title: "Console",
  summary: "Printing text and reading lines from standard input.",
  blocks: [
    D.lead("The program's standard streams. `readLine` returns `null` at end of input."),
    D.code('hasm', "import std.io.Console as Console", 'import'),
    D.module({
      name: "Console", pkg: "std.io.Console",
      summary: "Printing text and reading lines from standard input.",
      groups: [
        { title: "Output", fns: [
          ["func void print(any v)", "Writes `v` without a line break."],
          ["func void println(any v)", "Writes `v` followed by a line break."],
          ["func void eprintln(any v)", "Writes `v` and a line break to the error stream."],
          ["func void printf(string pattern, list<any> args)", "Writes `pattern` formatted with `args`. See [Strings.format](doc:std-strings)."]
        ] },
        { title: "Input", fns: [
          ["func string readLine()", "Reads one line, or `null` at the end of input."],
          ["func string prompt(string message)", "Prints `message`, then reads a line."],
          ["func int promptInt(string message, int fallback)", "Asks until the user enters a whole number. Returns `fallback` at end of input."],
          ["func float promptFloat(string message, float fallback)", "Asks until the user enters a number. Returns `fallback` at end of input."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-files", order: 8, title: "Files",
  summary: "Reading, writing and managing files and directories.",
  blocks: [
    D.lead("Paths are strings. Text is read and written whole; for line-based work use `readLines` and `writeLines`. Failures (missing file, no permission) are thrown as string errors that you can catch."),
    D.code('hasm', "import std.io.Files as Files", 'import'),
    D.module({
      name: "Files", pkg: "std.io.Files",
      summary: "Reading, writing and managing files and directories.",
      groups: [
        { title: "Queries", fns: [
          ["func bool exists(string path)", "True when the path exists."],
          ["func bool isDirectory(string path)", "True when the path is a directory."],
          ["func long size(string path)", "File size in bytes."],
          ["func list<string> listDir(string dir)", "Names of the entries of a directory."]
        ] },
        { title: "Reading and writing", fns: [
          ["func string readText(string path)", "Whole file as text."],
          ["func void writeText(string path, string content)", "Replaces the file content with `content`."],
          ["func void appendText(string path, string content)", "Adds `content` at the end of the file, creating it when missing."],
          ["func list<string> readLines(string path)", "Lines of the file, without line terminators; a final empty line is dropped."],
          ["func void writeLines(string path, list<string> lines)", "Writes the lines, each followed by a newline."]
        ] },
        { title: "Managing", fns: [
          ["func void remove(string path)", "Deletes a file."],
          ["func void makeDir(string path)", "Creates a directory."],
          ["func void copy(string from, string to)", "Copies a file."],
          ["func void move(string from, string to)", "Moves or renames a file."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-os", order: 9, title: "Os",
  summary: "Process exit and environment.",
  blocks: [
    D.lead("Small helpers for the running process."),
    D.code('hasm', "import std.os.Os as Os", 'import'),
    D.module({
      name: "Os", pkg: "std.os.Os",
      summary: "Process exit and environment.",
      groups: [
        { title: "Process", fns: [
          ["func void exit(int code)", "Ends the program with the given exit code."],
          ["func string osName()", "Name of the operating system the host runs on."]
        ] },
        { title: "Environment", fns: [
          ["func string getenv(string name)", "Value of an environment variable, or `null`."],
          ["func string getenvOr(string name, string fallback)", "Value of an environment variable, or `fallback`."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-time", order: 10, title: "Time",
  summary: "Clocks, sleeping and a stopwatch.",
  blocks: [
    D.lead("`millis` is wall-clock time; `nanos` is a monotonic counter that is only meaningful for differences."),
    D.code('hasm', "import std.time.Time as Time", 'import'),
    D.module({
      kind: 'class', name: 'Stopwatch', pkg: 'std.time.Time',
      summary: 'Measures elapsed time. A new stopwatch starts running immediately.',
      groups: [{ title: 'Methods', fns: [
        ['func void restart()', 'Starts counting from zero again.'],
        ['func long elapsedMillis()', 'Milliseconds since creation or the last `restart`.'],
        ['func long elapsedNanos()', 'Nanoseconds since creation or the last `restart`.'],
        ['func float elapsedSeconds()', 'Seconds as a float.']
      ] }]
    }),
    D.module({
      name: "Time", pkg: "std.time.Time",
      summary: "Clocks, sleeping and a stopwatch.",
      groups: [
        { title: "Clocks", fns: [
          ["func long millis()", "Milliseconds since the Unix epoch."],
          ["func long nanos()", "Monotonic nanosecond counter."],
          ["func void sleep(int ms)", "Pauses the program for `ms` milliseconds."],
          ["func string formatDuration(long ms)", "Readable duration: `3725000` becomes `\"1h 2m 5s\"`, and under one second the result is in milliseconds."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-test", order: 11, title: "Test",
  summary: "Minimal unit-test helpers that print a summary and set the exit code.",
  blocks: [
    D.lead("Each check prints `[ok]` or `[FAIL]`. End the program with `finish()` so that a failure becomes exit code `1`, which build scripts and test runners can detect."),
    D.code('hasm', "import std.test.Test as Test", 'import'),
    D.code('hasm', `
      pkg demo.Tests
      import std.test.Test as Test

      @entry
      func void main() {
          Test.section("arithmetic")
          Test.assertEqInt("2+2", 4, 2 + 2)
          Test.finish()
      }`, 'usage'),
    D.module({
      name: "Test", pkg: "std.test.Test",
      summary: "Minimal unit-test helpers that print a summary and set the exit code.",
      groups: [
        { title: "Checks", fns: [
          ["func void check(string name, bool ok)", "Passes when `ok` is true."],
          ["func void assertTrue(string name, bool ok)", "Passes when `ok` is true."],
          ["func void assertFalse(string name, bool ok)", "Passes when `ok` is false."],
          ["func void assertEqInt(string name, long expected, long actual)", "Passes when the integers are equal."],
          ["func void assertEqStr(string name, string expected, string actual)", "Passes when the strings are equal."],
          ["func void assertEqBool(string name, bool expected, bool actual)", "Passes when the booleans are equal."],
          ["func void assertEqFloat(string name, float expected, float actual, float eps)", "Passes when the floats differ by at most `eps`."],
          ["func void assertNull(string name, any value)", "Passes when `value` is `null`."]
        ] },
        { title: "Reporting", fns: [
          ["func void section(string title)", "Prints a heading for the checks that follow."],
          ["func void pass(string name)", "Records a passed check by hand."],
          ["func void fail(string name, string detail)", "Records a failed check by hand."],
          ["func int failures()", "Number of failed checks so far."],
          ["func bool summary()", "Prints totals; returns true when everything passed."],
          ["func void finish()", "Prints totals and ends the program with exit code `1` when anything failed."]
        ] }
      ]
    })
  ]
});
