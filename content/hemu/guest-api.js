Docs.page({
  project: 'hemu', section: 'hal', id: "api-disk", order: 1, title: "Disk and Devices",
  summary: "Files and directories of the device's disks.",
  blocks: [
    D.p("Paths are absolute inside the volume. Every call is checked by HVFS against the identity of the calling process; failures surface in the guest as catchable errors whose message starts with the errno name (`\"ENOENT: open '/x': ...\"`). Descriptors belong to this view and are closed automatically when the process ends. Identity changes follow the Unix rule: only a process running as root may change its uid, gid or groups. Children inherit the identity of their parent at spawn time."),
    D.p('`Disk` is the system disk image (`disk.img`); `Devices` is the same API for the device image (`devices.img`), which holds the firmware partitions.'),
    D.module({
      kind: 'class', name: "Disk", pkg: "usingapi Disk",
      summary: "Files and directories of the device's disks.",
      groups: [{ title: 'Methods', fns: [
          ["func int open(string path, int flags, int mode)", "Opens a file; `flags` are the Linux `O_*` values, `mode` applies when creating."],
          ["func void close(int fd)", ""],
          ["func bytes read(int fd, int count)", "Reads up to `count` bytes from the current position; an empty result means end of file."],
          ["func int write(int fd, bytes data)", "Writes at the current position; may write fewer bytes than given when the volume is full."],
          ["func bytes pread(int fd, int count, long position)", ""],
          ["func int pwrite(int fd, bytes data, long position)", ""],
          ["func long seek(int fd, long offset, int whence)", "Moves the position (`whence`: 0 start, 1 current, 2 end) and returns the new one."],
          ["func void fsync(int fd)", ""],
          ["func void ftruncate(int fd, long size)", ""],
          ["func map<string,any> fstat(int fd)", ""],
          ["func int openCount()", "Number of descriptors this process has open on the volume."],
          ["func bytes readFile(string path)", "Reads a whole file."],
          ["func void writeFile(string path, bytes data, int mode)", "Creates or replaces a file with `data`; `mode` applies when the file is created."],
          ["func map<string,any> stat(string path)", "Metadata map: `kind` (file/dir/link), `mode`, `size`, `uid`, `gid`, times in ns."],
          ["func map<string,any> lstat(string path)", ""],
          ["func void mkdir(string path, int mode)", ""],
          ["func void rmdir(string path)", ""],
          ["func void unlink(string path)", ""],
          ["func void rename(string from, string to)", ""],
          ["func void link(string existing, string path)", ""],
          ["func void symlink(string target, string path)", ""],
          ["func string readlink(string path)", ""],
          ["func list<any> readdir(string path)", "Entry names of a directory (without `.` and `..`)."],
          ["func void truncate(string path, long size)", ""],
          ["func void chmod(string path, int mode)", ""],
          ["func void chown(string path, int uid, int gid)", ""],
          ["func bool access(string path, int mode)", "Whether the calling identity may access `path` with `mode` (4 read, 2 write, 1 execute, 0 exists)."],
          ["func map<string,any> statfs()", "Volume statistics: `blockSize, totalBlocks, freeBlocks, totalInodes, freeInodes, maxNameLen`."],
          ["func void sync()", "Flushes the volume to its image."],
          ["func int uid()", ""],
          ["func int gid()", ""],
          ["func list<any> groups()", ""],
          ["func void setuid(int uid)", "Switches user (root only)."],
          ["func void setgid(int gid)", ""],
          ["func void setgroups(list<any> groups)", ""]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-screen", order: 2, title: "Screen",
  summary: "Immediate-mode 2D drawing for guest programs, connected as `\"Screen\"`.",
  blocks: [
    D.p("A program issues primitives each frame (`fillRect`, `drawText`, ...) and then calls `present`, which hands everything drawn since the last `present` to the `Display` and starts a new frame. Terminals and simple GUIs are built on top of this in the guest. Coordinates are pixels from the top-left corner. Colors are `0xAARRGGBB`; use `rgb` to build one from components."),
    D.note('`Surface` offers the same drawing functions without access to the display: a program draws into layers of its own and whoever owns the screen composes them. Windowed applications get `Surface`.'),
    D.module({
      kind: 'class', name: "Screen", pkg: "usingapi Screen",
      summary: "Immediate-mode 2D drawing for guest programs, connected as `\"Screen\"`.",
      groups: [{ title: 'Methods', fns: [
          ["func int width()", "Width of what is drawn on: the display, or the layer chosen with `setTarget`."],
          ["func int height()", ""],
          ["func string orientation()", "Current orientation: `\"portrait\"` or `\"landscape\"`."],
          ["func void setOrientation(string name)", "Rotates the screen."],
          ["func int measureText(string text, int size)", ""],
          ["func int measureTextStyled(string text, int size, int style)", "Like `measureText` for a font `style`: 1 = bold, 2 = italic, 4 = proportional sans-serif (add them up)."],
          ["func int rgb(int r, int g, int b)", "Opaque color from 0..255 components."],
          ["func int rgba(int r, int g, int b, int a)", ""],
          ["func void clear(int color)", ""],
          ["func void fillRect(int x, int y, int w, int h, int color)", ""],
          ["func void drawRect(int x, int y, int w, int h, int thickness, int color)", ""],
          ["func void drawLine(int x1, int y1, int x2, int y2, int thickness, int color)", ""],
          ["func void fillCircle(int cx, int cy, int radius, int color)", ""],
          ["func void drawCircle(int cx, int cy, int radius, int thickness, int color)", ""],
          ["func void drawText(int x, int y, string text, int size, int color)", "Draws `text` with its top-left corner at `(x, y)`; `size` is the text height in pixels."],
          ["func void drawTextStyled(int x, int y, string text, int size, int color, int style)", "Like `drawText` with a font `style`: 1 = bold, 2 = italic, 4 = proportional sans-serif (add them up)."],
          ["func void fillRoundRect(int x, int y, int w, int h, int radius, int color)", "A filled rectangle with rounded corners; the radius is limited to half the shorter side when drawn."],
          ["func void drawRoundRect(int x, int y, int w, int h, int radius, int thickness, int color)", ""],
          ["func void fillGradientV(int x, int y, int w, int h, int top, int bottom)", "A rectangle blended from `top` to `bottom`."],
          ["func void fillGradientH(int x, int y, int w, int h, int left, int right)", "A rectangle blended from `left` to `right`."],
          ["func void fillRadialGradient(int cx, int cy, int radius, int inner, int outer)", "A disc fading from `inner` (centre) to `outer` (edge); use alpha 0 in `outer` for a soft glow."],
          ["func void fillTriangle(int x1, int y1, int x2, int y2, int x3, int y3, int color)", ""],
          ["func void drawArc(int cx, int cy, int radius, int startDegrees, int sweepDegrees, int thickness, int color)", "Part of a circle's outline (a progress ring, a clock hand's track)."],
          ["func void drawShadow(int x, int y, int w, int h, int radius, int spread, int color)", "A soft shadow around a rounded rectangle, fading out over `spread` pixels (at most {@value #MAX_SHADOW_SPREAD})."],
          ["func void setClip(int x, int y, int w, int h)", "Restricts drawing to a rectangle until `resetClip`."],
          ["func void resetClip()", ""],
          ["func void present()", "Shows everything drawn since the previous `present` and begins a new frame."],
          ["func void update()", "Like `present` for a layer, but the drawing is added to what the layer already holds (the oldest commands may drop out)."],
          ["func int createLayer(int width, int height)", "Creates an empty layer of this size owned by this process and returns its id (always above 0)."],
          ["func void resizeLayer(int id, int width, int height)", "Changes the size a layer is shown at; its content stays until the next `present`."],
          ["func void shareLayer(int id, int withPid)", "Lets another process (the window manager) draw this layer with `drawLayer`."],
          ["func void destroyLayer(int id)", ""],
          ["func void setTarget(int id)", "Chooses where this process draws: 0 for the display, or one of its own layers."],
          ["func bool drawLayer(int id, int x, int y)", "Draws a layer with its top-left corner at `(x, y)`, as it is at this moment."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-events", order: 3, title: "Events",
  summary: "Hardware input for guest programs, connected as `\"Events\"`.",
  blocks: [
    D.p("Events are maps; `type` is one of `touch_down`, `touch_move`, `touch_up` (with `pointer, x, y`), `key_down`, `key_up` (with `key`) and `text` (with `text`); all carry `time` in milliseconds. `next` waits for an event without blocking the scheduler: only the calling coroutine sleeps. The subscription lives as long as the process and is released when it ends."),
    D.module({
      kind: 'class', name: "Events", pkg: "usingapi Events",
      summary: "Hardware input for guest programs, connected as `\"Events\"`.",
      groups: [{ title: 'Methods', fns: [
          ["func map<string,any> poll()", "The next queued event, or `null` when there is none."],
          ["func map<string,any> next()", "Waits for the next event."],
          ["func int pending()", "Number of events waiting to be read."],
          ["func void clear()", "Discards queued events."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-device", order: 4, title: "Device",
  summary: "What the device says about itself, connected as `\"Device\"`: the hardware interface level an operating system can rely on, and the basic facts of the hardware.",
  blocks: [
    D.module({
      kind: 'class', name: "Device", pkg: "usingapi Device",
      summary: "What the device says about itself, connected as `\"Device\"`: the hardware interface level an operating system can rely on, and the basic facts of the hardware.",
      groups: [{ title: 'Methods', fns: [
          ["func int halLevel()", "The hardware interface level, see `Hal`."],
          ["func map<string,any> info()", "Facts about the device: `halLevel`, `model`, `screenWidth` and `screenHeight` (in the current orientation, pixels), `devicesBytes` (firmware storage) and `diskBytes` (user storage)."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-firmware", order: 5, title: "Firmware",
  summary: "What a bootloader written in HASM may learn about the firmware, connected as `\"Firmware\"`.",
  blocks: [
    D.p("It is read-only: changing the lock state and the partitions is the owner's business, done from the host side (the control panel), never from inside the device."),
    D.module({
      kind: 'class', name: "Firmware", pkg: "usingapi Firmware",
      summary: "What a bootloader written in HASM may learn about the firmware, connected as `\"Firmware\"`.",
      groups: [{ title: 'Methods', fns: [
          ["func string lockState()", "`\"locked\"` or `\"unlocked\"`."],
          ["func string bootState()", "`\"verified\"`, `\"unlocked\"` or `\"corrupt\"`."],
          ["func bool acceptsSigner(string signerId)", "Whether a system update signed by this signer (as reported by `Update.inspect`) may be installed on this device."],
          ["func void wipeUserData()", "Factory reset: erases the user's data and accounts; the firmware stays."],
          ["func map<string,any> tree()", "The state of the operating system's own files: `state` is `\"verified\"`, `\"modified\"` or `\"unprotected\"`; `problems` lists the files that differ from the signed list, each as `\"path: modified\"` or `\"path: missing\"`."],
          ["func string check(string name)", "How partition `name` compares with the signed description: `\"ok\"`, `\"modified\"`, `\"missing\"`, `\"unlisted\"` or `\"unsigned\"`."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-crypto", order: 6, title: "Crypto",
  summary: "Hashing and randomness for guest programs, connected as `\"Crypto\"`.",
  blocks: [
    D.module({
      kind: 'class', name: "Crypto", pkg: "usingapi Crypto",
      summary: "Hashing and randomness for guest programs, connected as `\"Crypto\"`.",
      groups: [{ title: 'Methods', fns: [
          ["func bytes sha256(bytes data)", "SHA-256 of `data`: 32 bytes."],
          ["func bytes random(int count)", "`count` bytes from a cryptographically strong source."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-pkg", order: 7, title: "Pkg",
  summary: "Reading signed packages for guest programs, connected as `\"Pkg\"`.",
  blocks: [
    D.p("A package is only ever handed out after its signature has been checked, so the installing program never parses untrusted bytes itself."),
    D.module({
      kind: 'class', name: "Pkg", pkg: "usingapi Pkg",
      summary: "Reading signed packages for guest programs, connected as `\"Pkg\"`.",
      groups: [{ title: 'Methods', fns: [
          ["func map<string,any> inspect(bytes data)", "The manifest of a package and who signed it: `name, label, versionCode, versionName, width, height, icon, color, permissions, handles` (lists of strings) and `signer`."],
          ["func bytes program(bytes data)", "The compiled program inside a valid package."],
          ["func map<string,any> resources(bytes data)", "The resource files of a valid package: path (`layout/main.xml`) to bytes."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-update", order: 8, title: "Update",
  summary: "Reading signed system updates for the recovery program, connected as `\"Update\"`.",
  blocks: [
    D.p("An update is only handed out after its signature has been checked. Whether the signer is trusted is a separate question (`Firmware.acceptsSigner`)."),
    D.module({
      kind: 'class', name: "Update", pkg: "usingapi Update",
      summary: "Reading signed system updates for the recovery program, connected as `\"Update\"`.",
      groups: [{ title: 'Methods', fns: [
          ["func map<string,any> inspect(bytes data)", "What the update contains: `apiLevel`, `versionName`, `signer` and `entries`, a list of maps `kind` (`\"partition\"` or `\"file\"`), `name`, `mode` and `size`."],
          ["func bytes content(bytes data, int index)", "The content of entry `index` (the position in `inspect`'s list)."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-ipc", order: 9, title: "IPC",
  summary: "Inter-process communication API for HASM — connected as `\"IPC\"`, it gives a running process a mailbox addressed by its PID, the ability to send to, and receive from, any other process on the same `IpcRouter`, and a directory of named services.",
  blocks: [
    D.p("Messages A message is plain data — `null`-free at the top level, otherwise numbers, strings, `bytes`, lists and maps with string keys, nested up to 16 levels and 4 MiB. It is copied on send, so the receiver owns what it gets. `lastSender` is filled in by the runtime and cannot be forged; `0` means the runtime itself. Services `publish` gives this process a name others can `find`. Names are lower-case, dot separated (`\"window\"`, `\"system.window\"`); those starting with `system.` may only be published by privileged processes (uid below {@value #FIRST_UNPRIVILEGED_UID}). Names are released when the process ends. Blocking `receive()` looks like a blocking call from HASM source, but never blocks the scheduler thread: when the mailbox is empty it suspends the calling coroutine and the scheduler goes on to other processes."),
    D.module({
      kind: 'class', name: "IPC", pkg: "usingapi IPC",
      summary: "Inter-process communication API for HASM — connected as `\"IPC\"`, it gives a running process a mailbox addressed by its PID, the ability to send to, and receive from, any other process on the same `IpcRouter`, and a directory of named services.",
      groups: [{ title: 'Methods', fns: [
          ["func int myPid()", "This process's own PID, for addressing replies."],
          ["func any getMailbox()", "This process's underlying mailbox — exposed so a host can register a `IpcMailbox.QueuedListener` to wake a daemon process when a message arrives while it isn't blocked in `receive()`."],
          ["func int send(int recipientPid, any message)", "Sends `message` to `recipientPid`."],
          ["func any tryReceive()", "The oldest queued message, or `null` when there is none — for a loop that also does other work."],
          ["func int lastSender()", "PID of the process that sent the message most recently returned by `receive()` or `tryReceive()`, `0` when it came from the runtime, or -1 when nothing was received yet."],
          ["func bool hasMessage()", "True if at least one message is currently queued, without consuming it."],
          ["func any receive()", "The oldest queued message, suspending the calling coroutine until one arrives if there is none."],
          ["func bool publish(string name)", "Publishes this process as the service `name`."],
          ["func bool retract(string name)", "Gives up a name this process published."],
          ["func int find(string name)", "Pid of the process that published `name`, or -1 when nobody did."],
          ["func bool watch(int target)", "Asks to be told when process `target` ends: a message `{type: \"ipc.exit\", pid, services`} arrives from the runtime (`lastSender` is 0)."]
      ] }]
    })
  ]
});

Docs.page({
  project: 'hemu', section: 'hal', id: "api-proc", order: 10, title: "Proc",
  summary: "Process management for guest programs, connected as `\"Proc\"`: lets a program (typically the operating system written in HASM) start other programs from raw binaries, wait for them and stop them.",
  blocks: [
    D.p("Capabilities A child receives exactly the APIs listed in `spawn`, and that list may only contain APIs the caller itself holds. A binary that needs anything outside the list fails to load, so authority can only be narrowed down a process tree, never widened. Ownership Only direct children can be joined or killed, and a child never outlives its parent. A finished child stays listed until it is reaped by `join`. Joining `join` suspends only the calling coroutine, so the scheduler keeps running everything else. It is called `join` rather than `wait` because `wait` is already a final method of `Object`. Identity A child runs as its parent does. A process running as root may start a child under another user and group (`spawnWith`, options `uid` and `gid`); everybody else gets `EPERM`. Every process the system starts is entered into the `ProcessTable`, from where `info` reports its user and label."),
    D.module({
      kind: 'class', name: "Proc", pkg: "usingapi Proc",
      summary: "Process management for guest programs, connected as `\"Proc\"`: lets a program (typically the operating system written in HASM) start other programs from raw binaries, wait for them and stop them.",
      groups: [{ title: 'Methods', fns: [
          ["func int self()", "This process's pid."],
          ["func int parent()", "Pid of the process that started this one; 0 when the host did."],
          ["func list<any> grants()", "Names of the APIs this process holds, i.e."],
          ["func int spawn(bytes binary, string name, list<any> args, list<any> apis)", "Starts a program."],
          ["func int spawn(bytes binary, string name, list<any> args, list<any> apis, bool capture)", "Like `spawn(byte[], String, List, List)`; with `capture` the child's standard streams are piped to this process: its output and error are kept for `output` and `errors`, and its input is fed with `writeInput` / `closeInput`."],
          ["func int spawnWith(bytes binary, string name, list<any> args, list<any> apis, map<string,any> options)", "Like `spawn(byte[], String, List, List, boolean)` with options in a map: `capture` (bool) — pipe the child's standard streams to this process; `uid`, `gid` (int) — start the child as another user (root only; supplementary groups are dropped); `label` (string) — what `info` reports as the child's label (an application id, say); `libpath` (list of absolute directories) — where the child, and by default its own children, look for the libraries it is dynamically linked against; needs the `Disk` API, and the files are read with the child's credentials."],
          ["func any join(int pid)", "Waits for a child to exit and reaps it."],
          ["func bool kill(int pid)", "Stops a child (and, with it, everything it started)."],
          ["func list<any> output(int pid)", "Lines the child wrote to standard output since the last call (empty when none)."],
          ["func list<any> errors(int pid)", "Lines the child wrote to standard error since the last call; see `output`."],
          ["func void writeInput(int pid, string text)", "Feeds text to the child's standard input (it reads it line by line)."],
          ["func void closeInput(int pid)", "Ends the child's standard input: after the text already written is read, it sees end of file."],
          ["func string state(int pid)", "State of a child: `RUNNING`, `TERMINATED`, `FAILED` or `KILLED`."],
          ["func list<any> children()", "Info maps (`pid, ppid, name, state`) for the direct children that have not been reaped."],
          ["func list<any> all()", "Info maps for every live process of the runtime, whoever started it."],
          ["func map<string,any> info(int pid)", "Describes any live process, whoever started it, or returns null when there is none with that pid."]
      ] }]
    })
  ]
});
