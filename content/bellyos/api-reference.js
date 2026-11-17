Docs.page({
  project: 'bellyos', section: 'api', id: "api-app", order: 1, title: "App",
  summary: "The life of a windowed application.",
  blocks: [
    D.code("hasm", "import belly.App as App", "import"),
    D.p("An application is a class that implements Program; App.run() opens its window, drives it and ends it:"),
    D.code("hasm", "class Clock implement Program {\n    override func void begin(Window win, map<string,any> handoff) { ... }   // the window is open\n    override func int pace()  { return 100 }                                // -1: wake only for events\n    override func bool tick() { ... return true }                           // time passed; true = repaint\n    override func bool handle(map<string,any> event) { ... return true }    // an event; true = repaint\n    override func void draw() { ... win.present() }\n    override func void end() { }                                            // the window is closing\n}\n@entry func int main(list<string> args) { return App.run(new Clock(), \"Clock\", 300, 340, args) }", "example"),
    D.p("Order of calls: begin, draw, then until the window closes: handle (once per event, in order), tick (when the pace is not -1), draw (when handle or tick asked for it, and always after a theme or size change), and finally end. An error that escapes a call ends the application: end() still runs and the process reports the failure. Events are the maps of belly.Gui (touch_*, key_*, text, focus, ...); \"close\" is handled here and never reaches handle."),
    D.module({
      name: "App", pkg: "belly.App",
      summary: "The life of a windowed application.",
      groups: [
        { title: "Functions", fns: [
          ["func bool changedByEnvironment(string kind)", ""],
          ["func int loop(Program program, Window win)", ""],
          ["func int run(Program program, string title, int w, int h, list<string> args)", "Opens the window, runs the program until it closes and returns the exit code for main."],
          ["func string dataDir(map<string, any> handoff)", "Where the program may keep its own files: its private directory (needs the \"fs\" permission)."]
        ] },
        { title: "interface Program", fns: [
          ["func bool handle(map<string, any> event)", "One event. Returns true when the window needs repainting."],
          ["func bool tick()", "Time has passed. Returns true when the window needs repainting."],
          ["func int pace()", "Milliseconds between ticks; -1 when the program only reacts to events."],
          ["func void begin(Window win, map<string, any> handoff)", "The window is open. 'handoff' tells how the program was started (see belly.Handoff)."],
          ["func void draw()", "Paints the window and presents it."],
          ["func void end()", "The window is closing: save what must be kept."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-build", order: 2, title: "Build",
  summary: "Properties of the running system: what /etc/build.prop says. The file belongs to root and is written by init at every boot, so a program may rely on it. It needs the Disk API (read access to /etc).",
  blocks: [
    D.code("hasm", "import belly.Build as Build", "import"),
    D.code("hasm", "import belly.Build as Build\nif !Build.atLeast(2) { ... }        // the system is older than the API level this program needs", "example"),
    D.p("Keys:  ro.belly.version       release of the system, e.g. \"0.2.0\""),
    D.code("hasm", "     ro.belly.api_level     level of the system API: grows when the API gains something, never goes down\n     ro.hal.level         level of the hardware interface the device offers (see Device.halLevel)\n     ro.boot.lock         \"locked\" or \"unlocked\": state of the bootloader\n     ro.boot.state        \"verified\", \"unlocked\" or \"corrupt\": verdict of verified boot\n     ro.product.model     name of the device", "example"),
    D.module({
      name: "Build", pkg: "belly.Build",
      summary: "Properties of the running system: what /etc/build.prop says. The file belongs to root and is written by init at every boot, so a program may rely on it. It needs the Disk API (read access to /etc).",
      groups: [
        { title: "Functions", fns: [
          ["func bool atLeast(int level)", "True when the system offers at least API level 'level'."],
          ["func bool isLocked()", ""],
          ["func int apiLevel()", ""],
          ["func int getInt(string key, int fallback)", ""],
          ["func int halLevel()", ""],
          ["func map<string, any> all()", "Every property, key → value. Empty when the file cannot be read."],
          ["func string bootState()", ""],
          ["func string file()", ""],
          ["func string get(string key, string fallback)", ""],
          ["func string model()", ""],
          ["func string version()", ""]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-canvas", order: 3, title: "Canvas",
  summary: "What a program draws on and listens to, independent of where it runs: the whole screen (ScreenSurface) or a window of the window manager (Gui). A program written against these interfaces runs in both.",
  blocks: [
    D.p("Colors are 0xAARRGGBB ints (rgb() / rgba() build them). Text styles are bit sets: 1 bold, 2 italic, 4 proportional sans-serif (0 is the monospaced regular font); see belly.Ui for the named constants."),
    D.module({
      name: "Canvas", pkg: "belly.Canvas",
      summary: "What a program draws on and listens to, independent of where it runs: the whole screen (ScreenSurface) or a window of the window manager (Gui). A program written against these interfaces runs in both.",
      groups: [
        { title: "interface Canvas", fns: [
          ["func int charWidth(int size)", "Width of one character of the monospaced font at the given text height."],
          ["func int height()", ""],
          ["func int rgb(int r, int g, int b)", ""],
          ["func int rgba(int r, int g, int b, int a)", ""],
          ["func int textWidth(string text, int size, int style)", "Width of a string at the given text height in the given style (an estimate in a window, exact on the screen)."],
          ["func int width()", ""],
          ["func string orientation()", ""],
          ["func void clear(int color)", ""],
          ["func void drawArc(int cx, int cy, int r, int startDegrees, int sweepDegrees, int thickness, int color)", "Part of a circle's outline; degrees, 0 = 3 o'clock, positive sweep = clockwise."],
          ["func void drawCircle(int cx, int cy, int r, int thickness, int color)", ""],
          ["func void drawLine(int x1, int y1, int x2, int y2, int thickness, int color)", ""],
          ["func void drawRect(int x, int y, int w, int h, int thickness, int color)", ""],
          ["func void drawRoundRect(int x, int y, int w, int h, int radius, int thickness, int color)", ""],
          ["func void drawShadow(int x, int y, int w, int h, int radius, int spread, int color)", "A soft shadow around a rounded rectangle that fades out over 'spread' pixels (1..32)."],
          ["func void drawText(int x, int y, string text, int size, int color)", ""],
          ["func void drawTextStyled(int x, int y, string text, int size, int color, int style)", ""],
          ["func void fillCircle(int cx, int cy, int r, int color)", ""],
          ["func void fillGradientH(int x, int y, int w, int h, int left, int right)", ""],
          ["func void fillGradientV(int x, int y, int w, int h, int top, int bottom)", ""],
          ["func void fillRadialGradient(int cx, int cy, int radius, int inner, int outer)", ""],
          ["func void fillRect(int x, int y, int w, int h, int color)", ""],
          ["func void fillRoundRect(int x, int y, int w, int h, int radius, int color)", ""],
          ["func void fillTriangle(int x1, int y1, int x2, int y2, int x3, int y3, int color)", ""],
          ["func void present()", "Shows everything drawn since the last present()."],
          ["func void resetClip()", ""],
          ["func void setClip(int x, int y, int w, int h)", "Restricts drawing to a rectangle until resetClip()."],
          ["func void setOrientation(string name)", ""]
        ] },
        { title: "interface EventSource", fns: [
          ["func map<string, any> poll()", "The next event, or null when there is none."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-fsflags", order: 4, title: "FsFlags",
  summary: "Constants for the Disk / Devices file APIs.",
  blocks: [
    D.code("hasm", "import belly.FsFlags as Flags", "import"),
    D.module({
      name: "FsFlags", pkg: "belly.FsFlags",
      summary: "Constants for the Disk / Devices file APIs.",
      groups: [
        { title: "Functions", fns: [
          ["func int append()", "O_WRONLY | O_CREAT | O_APPEND."],
          ["func int canExec()", ""],
          ["func int canRead()", ""],
          ["func int canWrite()", ""],
          ["func int exists()", "Access() masks."],
          ["func int modeDir()", "0755 rwxr-xr-x."],
          ["func int modeExec()", "0755."],
          ["func int modeFile()", "Permission modes 0644 rw-r--r--."],
          ["func int modePrivate()", "0600 rw-------."],
          ["func int readOnly()", "Open() flags O_RDONLY."],
          ["func int readWrite()", "O_RDWR."],
          ["func int seekCurrent()", ""],
          ["func int seekEnd()", ""],
          ["func int seekStart()", "Seek() origins."],
          ["func int writeNew()", "O_WRONLY | O_CREAT | O_TRUNC."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-gui", order: 5, title: "Gui",
  summary: "Client side of the window manager. A program opens a window, draws into it like on a screen and receives the events meant for it; it never touches the screen or the hardware input itself.",
  blocks: [
    D.code("hasm", "import belly.Gui as Gui", "import"),
    D.code("hasm", "import belly.Gui as Gui\nWindow win = Gui.open(\"Clock\", 240, 120)           // finds the window manager by its service name\n... win.fillRect(...)  win.present()  map<string,any> e = win.poll()   (or win.next(), which waits)", "example"),
    D.p("Protocol 2 (IPC v2 messages — maps with a \"type\"; the window manager checks the verified sender pid):"),
    D.code("hasm", "client -> wm   {hello, proto, title, width, height} | {layer, id, layer} | {frame, id} | {title, id, text} | {orient, name}\n               | {bye, id} | {toast, text}\nwm -> client   {welcome, proto, id, width, height, metric, orientation, accent, dark, tz, wallpaper, sansWidths, boldWidths}\n               | {refused, proto, reason}\n               | events: {touch_down|touch_move|touch_up, pointer, x, y} | {key_down|key_up, key} | {text, text}\n               | {screen_resized, width, height} | {focus, focused} | {screen, orientation}\n               | {theme, accent, dark, tz, wallpaper} | {close}\npackage manager -> client   {handoff_result, ok, error} (the answer to a handoff the window asked for)\n               (sansWidths/boldWidths: advance widths of the characters 32..126 at size 100)", "example"),
    D.p("A window's picture lives in a layer (the retained surface of the Surface API): after the welcome the program creates a layer of the window's size, shares it with the window manager and announces it with {layer}. From then on the program draws straight into the layer and present() commits it; {frame} only tells the window manager that the picture changed. The window manager never replays a program's drawing — the system composes the layers."),
    D.module({
      name: "Gui", pkg: "belly.Gui",
      summary: "Client side of the window manager. A program opens a window, draws into it like on a screen and receives the events meant for it; it never touches the screen or the hardware input itself.",
      groups: [
        { title: "Functions", fns: [
          ["func Window open(string title, int w, int h)", "Opens a window with a content area of w x h (the window manager may shrink it to fit the screen)."],
          ["func int protocol()", ""],
          ["func string serviceName()", "The name the window manager is published under, and the protocol version this library speaks."]
        ] },
        { title: "class Window", fns: [
          ["new Window(int wm)", ""],
          ["func bool isClosed()", ""],
          ["func int atLeast1(int v)", ""],
          ["func int nn(int v)", "The window's own code may be careless with sizes; the screen is strict. Out-of-range values are brought into range here, as the window manager used to do when it replayed a window's drawing."],
          ["func map<string, any> decode(any raw)", "Takes one message from the window manager and returns the event it carries; null for anything that is not an event for the program (a message from somebody else, or bookkeeping the window handles itself)."],
          ["func map<string, any> next()", "Waits for the next event."],
          ["func void applyConfig(int accent, bool dark, int tz, int wallpaper)", "Takes over the user's settings from the window manager."],
          ["func void attachLayer()", "Creates the layer the window is drawn in, hands it to the window manager and draws into it from now on."],
          ["func void changed()", "The picture has a new content: the window manager composes the screen again."],
          ["func void close()", "Closes the window (the program should then exit)."],
          ["func void handoff(string action, string data, string dataType)", "Asks the package manager to hand work to another program: \"view\" a text file, \"edit\" it ... (see belly.Handoff for the actions and data types). It starts a program that offers the action; the answer comes later as a {handoff_result, ok, error} event (ok is false when no program offers the action)."],
          ["func void request(map<string, any> m)", "Sends a request to the window manager."],
          ["func void setSetting(string key, any value)", "Asks the settings service to change a setting (see belly.Settings for the keys). Needs the \"settings\" permission (or the device owner); the desktop then tells every window with a {theme} event."],
          ["func void setTitle(string title)", ""],
          ["func void toast(string text)", "Shows a short notification on the desktop."],
          ["func void update()", "Like present(), but what was drawn is added to the picture instead of replacing it (for drawing programs; the system keeps only the most recent drawing operations)."],
          ["theme", "`Theme` field. Colors for the current accent and light/dark choice; rebuilt when the settings change."],
          ["closed", "`bool` field."],
          ["dark", "`bool` field."],
          ["accent", "`int` field."],
          ["h", "`int` field."],
          ["id", "`int` field."],
          ["layer", "`int` field. The window's picture (see the header)."],
          ["metric", "`int` field."],
          ["tz", "`int` field. Hours east of UTC."],
          ["w", "`int` field."],
          ["wallpaper", "`int` field."],
          ["wm", "`int` field."],
          ["sansBold", "`list<int>` field."],
          ["sansRegular", "`list<int>` field."],
          ["orient", "`string` field."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-handoff", order: 6, title: "Handoff",
  summary: "Handing work from one program to another: \"open this file\", \"show this folder\". A program offers actions in its package manifest (handles=view:text/*,edit:text/plain), another asks for one by action and data type, and the package manager starts a program that offers it.",
  blocks: [
    D.code("hasm", "import belly.Handoff as Handoff", "import"),
    D.p("A started program learns how it was started from its arguments, which the package manager fills with \"key=value\" strings; of() turns them into a map:"),
    D.code("hasm", "package  its own package name (its private directory is /data/data/<package>)\naction   what it was asked to do: \"main\" for a plain start from the menu, otherwise e.g. \"view\"\ndata     what to act on, usually a file path (may be empty)\ntype     the data type, e.g. \"text/plain\" (may be empty)", "example"),
    D.p("The actions in use: main (start), view (show data), edit (change data)."),
    D.module({
      name: "Handoff", pkg: "belly.Handoff",
      summary: "Handing work from one program to another: \"open this file\", \"show this folder\". A program offers actions in its package manifest (handles=view:text/*,edit:text/plain), another asks for one by action and data type, and the package manager starts a program that offers it.",
      groups: [
        { title: "Functions", fns: [
          ["func bool covers(string pattern, string type)", "Does the type pattern of a manifest (\"text/*\", \"*/*\", \"text/plain\") cover this data type? An empty type is covered only by \"*/*\"."],
          ["func bool offers(string entry, string action, string type)", "Does a manifest entry (\"view:text/*\") offer this action for this data type?"],
          ["func list<string> encode(string packageName, string action, string data, string type)", "The key=value arguments the package manager passes."],
          ["func map<string, any> of(list<string> args)", "How a program was started, from its arguments. Arguments that are not key=value pairs of this kind are ignored."],
          ["func string directoryType()", ""],
          ["func string typeOf(string path)", "The data type a file name suggests."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-pm", order: 7, title: "Pm",
  summary: "Client side of the package manager (/bin/pmd, the service \"system.package\").",
  blocks: [
    D.code("hasm", "import belly.Pm as Pm", "import"),
    D.p("Every call sends one request and waits for the answer; messages from anybody else that arrive meanwhile are dropped, so use it from programs that do not serve a window (a command line tool, a worker).  A refusal throws the package manager's reason as an error.  Needs the \"IPC\" API."),
    D.code("hasm", "list<any> all = Pm.installed()                maps {name, uid, versionCode, versionName, label, width, height,\n                                                      icon, color, permissions, signer, system}\nmap<string,any> r = Pm.install(bytes)           {name, versionCode, updated}\nPm.uninstall(\"author.tool\")\nmap<string,any> r = Pm.run(\"author.tool\", arg)  {output, errors, state, code}\nmap<string,any> r = Pm.handoff(\"view\", path, type)   {package}", "example"),
    D.module({
      name: "Pm", pkg: "belly.Pm",
      summary: "Client side of the package manager (/bin/pmd, the service \"system.package\").",
      groups: [
        { title: "Functions", fns: [
          ["func list<any> installed()", ""],
          ["func map<string, any> call(map<string, any> request)", ""],
          ["func map<string, any> handoff(string action, string data, string dataType)", "Hands work to a program that offers the action for the data type (see belly.Handoff); returns {package}."],
          ["func map<string, any> install(any packageBytes)", ""],
          ["func map<string, any> run(string name, string argument)", ""],
          ["func string serviceName()", ""],
          ["func void uninstall(string name)", ""]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-proc", order: 8, title: "Proc",
  summary: "Process management.",
  blocks: [
    D.code("hasm", "import belly.Proc as Procs", "import"),
    D.p("A child gets only the APIs named in 'apis', and only APIs the caller itself holds may be named. Only direct children can be joined or killed; children die with their parent."),
    D.module({
      name: "Proc", pkg: "belly.Proc",
      summary: "Process management.",
      groups: [
        { title: "Functions", fns: [
          ["func any joinResult(int pid)", "Waits for the child and returns its result; throws if it failed or was killed."],
          ["func bool kill(int pid)", ""],
          ["func int parent()", ""],
          ["func int self()", ""],
          ["func int spawn(any image, string name, list<any> args, list<any> apis)", "Starts 'image' (a compiled program) as a child and returns its pid."],
          ["func int spawnCaptured(any image, string name, list<any> args, list<any> apis)", "Like spawn, but the child's output is kept for output(pid) instead of going to this process's output."],
          ["func int spawnWith(any image, string name, list<any> args, list<any> apis, map<string, any> options)", "Like spawn, with options (a map; an unknown key is an error): \"capture\" bool    keep the child's output for output(pid), see spawnCaptured \"uid\", \"gid\" int  run the child as another user (only a root process may; supplementary groups are dropped) \"label\" string    what info() reports as the child's label, e.g. an application id \"libpath\" list    directories (absolute) where the child looks for the libraries it is dynamically linked against; its own children inherit it unless they are given another. Needs the Disk API."],
          ["func list<any> all()", ""],
          ["func list<any> children()", "Info maps {pid, ppid, name, state}: own unreaped children / every process."],
          ["func list<any> errors(int pid)", ""],
          ["func list<any> grants()", "APIs this process holds (the most it can hand down)."],
          ["func list<any> output(int pid)", "Streams of a captured child. Output is read as lines since the last call (read before join: a reaped child's output is gone); input is fed as text, and closeInput makes the child see end of input."],
          ["func map<string, any> info(int pid)", ""],
          ["func map<string, any> join(int pid)", "Waits for the child and returns {state, result, error}; the child is reaped."],
          ["func string state(int pid)", ""],
          ["func void closeInput(int pid)", ""],
          ["func void writeInput(int pid, string s)", ""]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-res", order: 9, title: "Res",
  summary: "The interface files of the running package (res/layout/*.xml, res/values/*.xml).",
  blocks: [
    D.code("hasm", "import belly.Res as Res", "import"),
    D.p("They travel inside the signed package and are installed with it; the package manager hands a program its own files. App.run fetches them before the window opens and passes them on in the handoff map under \"res\", so a program normally does not call load() itself: belly.Scene.open(win, handoff, \"main\", listener) is the way in."),
    D.module({
      name: "Res", pkg: "belly.Res",
      summary: "The interface files of the running package (res/layout/*.xml, res/values/*.xml).",
      groups: [
        { title: "Functions", fns: [
          ["func Resources load()", "Asks the package manager for the files of the calling package. A program that is not an installed package (or runs without a package manager) gets none."],
          ["func Resources of(map<string, any> handoff)", "The resources App.run put into the handoff map."]
        ] },
        { title: "class Resources", fns: [
          ["new Resources(map<string, any> files)", ""],
          ["func XmlNode layout(string name)", "The layout res/layout/<name>.xml."],
          ["func XmlNode xml(string path)", ""],
          ["func bool has(string path)", ""],
          ["func string text(string path)", ""],
          ["files", "`map<string,any>` field. \"layout/main.xml\" -> text."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-scene", order: 10, title: "Scene",
  summary: "A screen described in XML, alive in a window.",
  blocks: [
    D.code("hasm", "import belly.Scene as Scenes", "import"),
    D.code("hasm", "class Counter implement Program, Listener {\n    Scene scene\n    override func void begin(Window win, map<string,any> handoff) {\n        self.scene = Scenes.open(win, handoff, \"main\", self)      // res/layout/main.xml\n    }\n    override func bool handle(map<string,any> e) { return self.scene.handle(e) }\n    override func void draw() { self.scene.draw() }\n    override func void act(string id, int index) { if id == \"plus\" { ... self.scene.setText(\"value\", \"...\") } }\n    ...\n}", "example"),
    D.p("The scene lays the tree out whenever something changed (a setter, the window's size, the theme), draws it and presents the window, turns touches into taps, drags and presses, and keeps a Field's text. What the program must do: react to Listener.act, change the elements through the setters, return true from handle() when it changed something."),
    D.module({
      name: "Scene", pkg: "belly.Scene",
      summary: "A screen described in XML, alive in a window.",
      groups: [
        { title: "Functions", fns: [
          ["func Scene open(Window win, map<string, any> handoff, string layout, Listener listener)", "Builds the scene of res/layout/<layout>.xml (with the base styles and the package's res/values/styles.xml) for a window. 'handoff' is what Program.begin received."]
        ] },
        { title: "class Scene", fns: [
          ["new Scene(Window win, View root, Listener listener)", ""],
          ["func Theme theme()", ""],
          ["func View controlOf(View v)", "The control a touch on 'v' belongs to: v itself or the nearest container that responds to touches."],
          ["func View find(string id)", ""],
          ["func View need(string id)", ""],
          ["func View scrollerOf(View v)", ""],
          ["func bool handle(map<string, any> e)", "Feeds one window event (see belly.Gui) to the scene. Returns true when the screen needs repainting."],
          ["func bool handleKey(int code)", ""],
          ["func bool handleText(string text)", ""],
          ["func bool isChecked(string id)", ""],
          ["func bool touchDown(int x, int y)", ""],
          ["func bool touchMove(int x, int y)", ""],
          ["func bool touchUp(int x, int y)", ""],
          ["func string textOf(string id)", ""],
          ["func void activate(View control)", ""],
          ["func void arrange()", ""],
          ["func void blur()", "Takes the keyboard from the Field that has it."],
          ["func void draw()", "Paints the screen and presents the window."],
          ["func void focusOn(string id)", "Gives the keyboard to a Field."],
          ["func void invalidate()", "The data of a Rows list (or anything else the program changed behind the scene's back) changed."],
          ["func void scrollToTop(string id)", "Scrolls a Scroll or Rows to the top."],
          ["func void set(string id, string key, string value)", "Changes any attribute by name, e.g. set(\"title\", \"ink\", \"@danger\")."],
          ["func void setAdapter(string id, Adapter adapter)", ""],
          ["func void setChecked(string id, bool on)", ""],
          ["func void setEnabled(string id, bool on)", ""],
          ["func void setPainter(string id, Painter painter)", ""],
          ["func void setPercent(string id, int percent)", ""],
          ["func void setText(string id, string text)", ""],
          ["func void setVisible(string id, bool on)", ""],
          ["listener", "`Listener` field."],
          ["captured", "`View` field. The Paint the touch belongs to."],
          ["focus", "`View` field. The Field with the keyboard."],
          ["root", "`View` field."],
          ["scrolling", "`View` field. The Scroll or Rows under the touch."],
          ["target", "`View` field. The control a touch started on."],
          ["win", "`Window` field."],
          ["dirty", "`bool` field."],
          ["laidDark", "`bool` field."],
          ["laidAccent", "`int` field."],
          ["laidH", "`int` field."],
          ["laidW", "`int` field."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-settings", order: 11, title: "Settings",
  summary: "Client side of the settings service (/bin/settingsd, the service \"system.settings\").",
  blocks: [
    D.code("hasm", "import belly.Settings as Settings", "import"),
    D.p("Every call sends one request and waits for the answer; messages from anybody else that arrive meanwhile are dropped, so use it from programs that do not serve a window (a command line tool, a worker, a window manager while it starts). A window program changes a setting with Window.setSetting and hears about changes as {theme} events instead. A refusal throws the service's reason as an error. Needs the \"IPC\" API."),
    D.code("hasm", "any dark = Settings.get(\"ui.dark\")                    the value, or the default when nothing was stored\nmap<string,any> all = Settings.all(\"ui.\")             every key with that prefix\nSettings.set(\"ui.wallpaper\", 2)                       root, the device owner or a package with the \"settings\" permission", "example"),
    D.p("Keys: ui.accent (0..7), ui.dark (bool), ui.timezone (-12..14, hours east of UTC), ui.wallpaper (0..3)."),
    D.module({
      name: "Settings", pkg: "belly.Settings",
      summary: "Client side of the settings service (/bin/settingsd, the service \"system.settings\").",
      groups: [
        { title: "Functions", fns: [
          ["func any get(string key)", ""],
          ["func map<string, any> all(string prefix)", ""],
          ["func map<string, any> call(map<string, any> request)", ""],
          ["func string serviceName()", ""],
          ["func void set(string key, any value)", ""],
          ["func void watch(string prefix)", "Asks to be told about changes of keys starting with the prefix: {setting_changed, key, value} messages follow. For programs that read their own mailbox; a window program does not need it."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-sheet", order: 12, title: "Sheet",
  summary: "Style sheets and colors of the XML interface.",
  blocks: [
    D.code("hasm", "import belly.Sheet as Sheets", "import"),
    D.p("A style sheet is a set of named styles; a style is a set of attributes that elements take over. The framework brings a base sheet (base()); an application adds its own (res/values/styles.xml) on top of it:"),
    D.code("hasm", "<Styles>\n    <Style name=\"Tap\" radius=\"14\"/>                           the style named like an element applies to every such element\n    <Style name=\"warning\" parent=\"primary\" fill=\"@warn\"/>     any other style is used by name: <Tap style=\"warning\" .../>\n</Styles>", "example"),
    D.p("Later definitions of a name change only the attributes they mention. 'parent' names a style to start from."),
    D.p("Colors in attributes: \"#rrggbb\", \"#aarrggbb\", \"none\", a theme token (\"@accent\", \"@surface\", ... see token()) and \"mix:<color>:<color>:<percent>\" (the first color blended towards the second)."),
    D.module({
      name: "Sheet", pkg: "belly.Sheet",
      summary: "Style sheets and colors of the XML interface.",
      groups: [
        { title: "Functions", fns: [
          ["func Sheet base()", "A sheet holding the framework's styles."],
          ["func int color(Canvas c, Theme t, string spec)", "The color a specification names; 0 (transparent) for \"\" and \"none\"."],
          ["func int token(Canvas c, Theme t, string name)", "The theme colors a style may name with \"@\"."],
          ["func string baseSource()", "The framework's own styles: what every element looks like without an application's styles."]
        ] },
        { title: "class Sheet", fns: [
          ["new Sheet()", ""],
          ["func bool has(string name)", ""],
          ["func map<string, any> resolved(string name)", "The attributes of a style with its parents' underneath; empty for an unknown name."],
          ["func map<string, any> resolvedAt(string name, int depth)", ""],
          ["func void add(XmlNode root, string source)", "Adds the styles of a <Styles> document. A name that exists already is changed attribute by attribute."],
          ["styles", "`map<string,any>` field. Name -> map of attributes (as written, 'parent' included)."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-ui", order: 13, title: "Ui",
  summary: "A small widget toolkit for BellyOS programs: a theme (colors derived from an accent color and a light/dark choice), drawing helpers for common controls and a set of vector icons. Everything draws on a Canvas, so it works on the whole screen and inside a window alike.",
  blocks: [
    D.code("hasm", "import belly.Ui as Ui", "import"),
    D.code("hasm", "import belly.Ui as Ui\nTheme t = new Theme(win, accent, true)\nUi.button(win, t, 10, 10, 120, 40, \"Save\", 1, false)\nUi.icon(win, \"folder\", 40, 80, 32, t.text)", "example"),
    D.module({
      name: "Ui", pkg: "belly.Ui",
      summary: "A small widget toolkit for BellyOS programs: a theme (colors derived from an accent color and a light/dark choice), drawing helpers for common controls and a set of vector icons. Everything draws on a Canvas, so it works on the whole screen and inside a window alike.",
      groups: [
        { title: "Functions", fns: [
          ["func int bold()", ""],
          ["func int channel(int color, int shift)", ""],
          ["func int italic()", ""],
          ["func int luminance(int color)", "Perceived brightness 0..255."],
          ["func int mix(Canvas c, int a, int b, int percent)", "Blends 'a' towards 'b'; 'percent' is how much of 'b' (0..100). The result is opaque."],
          ["func int parseHex(string digits, int fallback)", "The value of a string of hexadecimal digits (up to 8, so \"ffe4b0c8\" is a color), or 'fallback' when it is empty, too long or holds anything else."],
          ["func int sans()", ""],
          ["func int ui()", "The regular and the bold face of the proportional UI font."],
          ["func int uiBold()", ""],
          ["func int withAlpha(Canvas c, int color, int alpha)", "The same color with another opacity (0..255)."],
          ["func list<int> accents(Canvas c)", "The accent colors offered in the settings."],
          ["func list<int> spokeX()", "A direction as per-mille unit vectors, for icons made of spokes."],
          ["func list<int> spokeY()", ""],
          ["func string fit(Canvas c, string text, int size, int style, int maxWidth)", "Shortens 'text' with \"..\" until it fits into 'maxWidth' pixels."],
          ["func string sizeText(long size)", "\"12 B\", \"3.4 KiB\", \"1.2 MiB\" for a byte count."],
          ["func void arrowHead(Canvas c, int x, int y, int dx, int dy, int size, int color)", "An arrow head at (x, y) pointing along the per-mille direction (dx, dy)."],
          ["func void bar(Canvas c, Theme t, int x, int y, int w, int h, int percent, int color)", "A progress bar; 'percent' is 0..100."],
          ["func void button(Canvas c, Theme t, int x, int y, int w, int h, string label, int kind, bool pressed)", "Fills for button kinds: 0 neutral, 1 primary (accent), 2 danger, 3 flat (no fill unless pressed)."],
          ["func void card(Canvas c, Theme t, int x, int y, int w, int h)", "A rounded panel with a hairline border."],
          ["func void centerText(Canvas c, int cx, int y, string text, int size, int color, int style)", "Draws text centered on the vertical line x = cx; y is the top of the text."],
          ["func void divider(Canvas c, Theme t, int x, int y, int w)", "A horizontal divider line."],
          ["func void field(Canvas c, Theme t, int x, int y, int w, int h, string value, string placeholder, bool focused, bool caret)", "A single-line text field; 'caret' draws the cursor when the field has focus."],
          ["func void floating(Canvas c, Theme t, int x, int y, int w, int h, int radius)", "A raised panel with a shadow beneath it (menus, dialogs)."],
          ["func void icon(Canvas c, string name, int cx, int cy, int size, int color)", "Draws the icon 'name' centered at (cx, cy) inside a square of 'size' pixels, in one color. Names: folder file note terminal clock palette calc gear chart apps close minimize maximize restore power rotate reboot logout up back chevron plus trash save check pause monitor user."],
          ["func void iconButton(Canvas c, Theme t, int x, int y, int s, string name, int kind, bool pressed)", "A square button showing an icon."],
          ["func void rightText(Canvas c, int right, int y, string text, int size, int color, int style)", "Draws text ending at x (right-aligned)."],
          ["func void scrollbar(Canvas c, Theme t, int x, int y, int h, int total, int visible, int offset)", "A thin scroll indicator along the right edge of a list: 'total' items/pixels, 'visible' of them shown, 'offset' scrolled."],
          ["func void tile(Canvas c, Theme t, int x, int y, int s, string name, int color)", "A rounded square in 'color' with an icon in white-ish ink: how applications appear in the launcher and the dock."],
          ["func void toggle(Canvas c, Theme t, int x, int y, bool on)", "A switch, 44 x 24 pixels at (x, y)."]
        ] },
        { title: "class Scroller", fns: [
          ["new Scroller()", ""],
          ["func bool move(int x, int y)", "Returns true while the touch is a drag (and the offset changed)."],
          ["func bool release(int x, int y)", "Returns true when the touch was a tap."],
          ["func void clamp()", ""],
          ["func void press(int x, int y)", ""],
          ["func void scrollTo(int value)", ""],
          ["func void setContent(int total, int visible)", "'total' pixels of content shown through a window 'visible' pixels high."],
          ["down", "`bool` field."],
          ["dragging", "`bool` field."],
          ["downX", "`int` field."],
          ["downY", "`int` field."],
          ["maxOffset", "`int` field."],
          ["offset", "`int` field."],
          ["startOffset", "`int` field."]
        ] },
        { title: "class Theme", fns: [
          ["new Theme(Canvas c, int accent, bool dark)", ""],
          ["dark", "`bool` field."],
          ["accent", "`int` field."],
          ["accentDim", "`int` field. The accent while pressed."],
          ["bg", "`int` field. Desktop / window background."],
          ["border", "`int` field."],
          ["danger", "`int` field."],
          ["dim", "`int` field."],
          ["ok", "`int` field."],
          ["onAccent", "`int` field. Text on the accent."],
          ["scrim", "`int` field."],
          ["shadow", "`int` field."],
          ["surface", "`int` field. Cards."],
          ["surfaceHigh", "`int` field. Controls, raised surfaces."],
          ["text", "`int` field."],
          ["warn", "`int` field."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-view", order: 14, title: "View",
  summary: "The elements of the XML interface: what they are, how they are laid out and how they are drawn.",
  blocks: [
    D.code("hasm", "import belly.View as Views", "import"),
    D.p("An application describes its screens in XML (res/layout/<name>.xml) and a Scene (belly.Scene) turns the description into a tree of View objects. Nobody computes coordinates: containers place their children."),
    D.p("Elements"),
    D.code("hasm", "Column, Row   place children one below the other / side by side\nCard          a Column with the look of a card (surface color, border, rounded corners)\nGrid          children in equal columns ('cols'); a child may take several ('span')\nScroll        one child, taller than the box, scrolled by dragging\nRows          a scrolling list of equal rows; the single child element is the template of a row, filled by an Adapter\nText          a line of text\nTap           a button: 'text' and/or 'glyph'\nGlyph         a vector icon ('glyph' names it)\nSwitch        an on/off switch\nMeter         a progress bar ('percent')\nRule          a thin dividing line\nSpacer        empty space (give it a 'weight' to push neighbors apart)\nField         a one-line text input\nDot           a round color choice with a ring when 'checked'\nSwatch        a rectangular choice (solid or gradient) with an accent border when 'checked'\nPaint         an area the program draws itself (a Painter), also receiving touches", "example"),
    D.p("Attributes (all optional; sizes are in pixels)"),
    D.code("hasm", "id\nwidth, height   fit (the content, default) | fill (what the parent leaves; in a Column/Row along its direction: a share of\n                the free space) | a number\nweight          the share of the free space along the container's direction (default 1 for 'fill', else none)\nmargin, marginX, marginY, marginLeft, marginTop, marginRight, marginBottom    space around the element\npad, padX, padY, padLeft, padTop, padRight, padBottom                         space inside it\ngap             space between the children of a container\nalign           containers: where children sit across the direction (start | center | end);\n                Text, Tap: where the text sits (start | center | end)\npack            containers: what to do with free space along the direction (start | center | end | between)\ntext, hint, glyph, size (text height, icon size, dot diameter), face (regular | bold | italic | bolditalic), mono\nink, fill, fill2 (with fill: a vertical gradient), border, borderWidth, radius, shadow\nchecked, enabled, visible (false: the element takes no space), percent\ncols, span, itemHeight, tap (make a container respond to touches)\nstyle           a style of the style sheet (belly.Sheet); the sheet's style named like the element applies first", "example"),
    D.p("What reaches the program: Listener.act(id, index) when a control is activated (index: the row, -1 outside a Rows list). Scroll and Rows scroll one at a time: do not nest them."),
    D.module({
      name: "View", pkg: "belly.View",
      summary: "The elements of the XML interface: what they are, how they are laid out and how they are drawn.",
      groups: [
        { title: "Functions", fns: [
          ["func View build(XmlNode node, Sheet sheet, map<string, any> ids, string source)", "Builds the views of an element and everything below it. 'ids' collects the ids (they must be unique); 'source' names the resource in error messages (\"layout/main.xml:12: ...\")."],
          ["func bool flag(string v, string what)", ""],
          ["func int atLeast(int v, int low)", ""],
          ["func int number(string v, string what)", ""],
          ["func string choice(string v, string what, string allowed)", ""],
          ["func string kinds()", ""]
        ] },
        { title: "class View", fns: [
          ["new View(string kind)", ""],
          ["func View find(string name)", ""],
          ["func View hit(int px, int py)", "The innermost visible element at a point, or null."],
          ["func bool contains(int px, int py)", ""],
          ["func bool flexes(bool inColumn)", "Does the element take a share of the free space of a Column (vertical) or Row?"],
          ["func bool insert(string s)", "Typed text goes in at the cursor (one line: line breaks are dropped). Returns true when the text changed."],
          ["func bool interactive()", ""],
          ["func bool linear()", ""],
          ["func bool vertical()", ""],
          ["func int editKey(int code)", "A key in a Field: backspace, delete, the arrows. Returns 0 when the key means nothing to a field, 1 when the field changed and 2 when Enter was pressed."],
          ["func int fontStyle()", ""],
          ["func int hPad()", ""],
          ["func int inkColor(Canvas c)", ""],
          ["func int outerH()", ""],
          ["func int outerW()", ""],
          ["func int rowIndex()", "The row index of a view in a Rows list, or -1."],
          ["func int rowsTotal()", ""],
          ["func int shade(Canvas c, Theme t, int color)", ""],
          ["func int share()", ""],
          ["func int spanWidth(View child)", ""],
          ["func int vPad()", ""],
          ["func void configure(map<string, any> attrs)", "Applies a set of attributes. The general ones (\"pad\", \"margin\") go first so that the specific ones refine them."],
          ["func void draw(Canvas c, Theme t)", ""],
          ["func void drawBackground(Canvas c, Theme t)", ""],
          ["func void drawDot(Canvas c, Theme t)", ""],
          ["func void drawScrolling(Canvas c, Theme t)", ""],
          ["func void drawSwatch(Canvas c, Theme t)", ""],
          ["func void drawText(Canvas c, string s, int ink)", ""],
          ["func void measure(Canvas c, Theme t, int aw, int ah, int fw, int fh)", "Works out the size (w, h) of the element. 'aw' and 'ah' say how much room there is for it (-1: as much as it wants); 'fw' and 'fh' force a size (-1: no)."],
          ["func void measureContent(Canvas c, Theme t, int iw, int ih, bool definiteW, bool definiteH)", ""],
          ["func void measureGrid(Canvas c, Theme t, int iw, int ih, bool definiteH)", ""],
          ["func void measureLinear(Canvas c, Theme t, int iw, int ih, bool definiteW, bool definiteH)", ""],
          ["func void measureScroll(Canvas c, Theme t, int iw)", ""],
          ["func void place(int ax, int ay)", "Puts the element at (ax, ay) and its children where they belong."],
          ["func void placeGrid()", ""],
          ["func void placeLinear()", ""],
          ["func void placeRows()", "Brings the visible rows of a Rows list up to date: binds them to their items and puts them in place."],
          ["func void placeScroll()", ""],
          ["func void resolve(Canvas c, Theme t)", "Converts the color specifications for this theme (this element and everything below it)."],
          ["func void set(string key, string v)", "Sets one attribute from its text; throws a message that names the attribute when the value is not acceptable."],
          ["func void setExtent(bool horizontal, string v)", ""],
          ["adapter", "`Adapter` field."],
          ["ctx", "`Canvas` field."],
          ["painter", "`Painter` field."],
          ["scroller", "`Scroller` field. Scroll and Rows."],
          ["sheet", "`Sheet` field. The sheet the element was built with (a Rows list builds its rows from it)."],
          ["look", "`Theme` field."],
          ["parent", "`View` field."],
          ["template", "`XmlNode` field. Rows: the element a row is built from."],
          ["checked", "`bool` field."],
          ["enabled", "`bool` field."],
          ["focused", "`bool` field."],
          ["mono", "`bool` field."],
          ["pressed", "`bool` field."],
          ["shadow", "`bool` field."],
          ["tap", "`bool` field."],
          ["visible", "`bool` field."],
          ["border", "`int` field."],
          ["borderWidth", "`int` field."],
          ["caret", "`int` field. Field: the cursor position in the text."],
          ["cellW", "`int` field. Grid."],
          ["cols", "`int` field."],
          ["contentH", "`int` field."],
          ["contentW", "`int` field."],
          ["face", "`int` field."],
          ["fill", "`int` field."],
          ["fill2", "`int` field."],
          ["gap", "`int` field."],
          ["gridCol", "`int` field."],
          ["gridRow", "`int` field."],
          ["gridSpan", "`int` field."],
          ["h", "`int` field."],
          ["hMode", "`int` field."],
          ["hValue", "`int` field."],
          ["index", "`int` field. The root of a row in a Rows list: which item it shows."],
          ["ink", "`int` field."],
          ["itemHeight", "`int` field."],
          ["mB", "`int` field."],
          ["mL", "`int` field."],
          ["mR", "`int` field."],
          ["mT", "`int` field."],
          ["pB", "`int` field."],
          ["pL", "`int` field."],
          ["pR", "`int` field."],
          ["pT", "`int` field."],
          ["percent", "`int` field."],
          ["radius", "`int` field."],
          ["size", "`int` field."],
          ["span", "`int` field."],
          ["w", "`int` field."],
          ["wMode", "`int` field. 0 fit, 1 fill, 2 a number."],
          ["wValue", "`int` field."],
          ["weight", "`int` field."],
          ["x", "`int` field."],
          ["y", "`int` field."],
          ["children", "`list<View>` field."],
          ["pool", "`list<View>` field. Rows: row views, reused while scrolling."],
          ["shown", "`list<View>` field."],
          ["rowHeights", "`list<int>` field. Grid."],
          ["align", "`string` field."],
          ["borderSpec", "`string` field."],
          ["fill2Spec", "`string` field."],
          ["fillSpec", "`string` field."],
          ["glyph", "`string` field."],
          ["hint", "`string` field."],
          ["id", "`string` field."],
          ["inkSpec", "`string` field."],
          ["kind", "`string` field."],
          ["pack", "`string` field."],
          ["text", "`string` field."]
        ] },
        { title: "interface Adapter", fns: [
          ["func int count()", ""],
          ["func void bind(int index, View row)", "Fills the row view for item 'index': find the template's elements by id and set their text, colors and state."]
        ] },
        { title: "interface Listener", fns: [
          ["func bool key(int code)", "A key arrived and no Field wanted it. Returns true when the screen needs repainting."],
          ["func bool typed(string text)", "Typed text arrived and no Field wanted it. Returns true when the screen needs repainting."],
          ["func void act(string id, int index)", "A control was activated: a Tap pressed, a Switch flipped, a Dot or Swatch chosen, a tappable container touched, Enter pressed in a Field. 'index' is the row of a Rows list the control sits in, otherwise -1."]
        ] },
        { title: "interface Painter", fns: [
          ["func bool touch(string phase, int x, int y)", "A touch inside the box; 'phase' is \"down\", \"move\" or \"up\", (x, y) is relative to the box. Returns true when the screen needs repainting."],
          ["func void paint(Canvas c, Theme t, int x, int y, int w, int h)", "Draws into the box (x, y, w, h) of the canvas; everything drawn is clipped to it."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'bellyos', section: 'api', id: "api-xml", order: 15, title: "Xml",
  summary: "A small XML reader for interface resources.",
  blocks: [
    D.code("hasm", "import belly.Xml as Xml", "import"),
    D.code("hasm", "XmlNode root = Xml.parse(text, \"layout/main.xml\")\nfor XmlNode child : root.children { ... child.attr(\"width\", \"fit\") ... }", "example"),
    D.p("Supported: elements, attributes in single or double quotes, self-closing elements, text content, comments, the <?xml ?> prolog and the five predefined entities (&lt; &gt; &amp; &quot; &apos;) plus numeric character references. Not supported (and refused with an error that names the line): namespaces' meaning (a \"ns:name\" is just a name), DOCTYPE and CDATA sections. Any malformed input throws \"<source>:<line>: <what is wrong>\"."),
    D.module({
      name: "Xml", pkg: "belly.Xml",
      summary: "A small XML reader for interface resources.",
      groups: [
        { title: "Functions", fns: [
          ["func XmlNode parse(string text, string source)", "Reads a document. 'source' names it in error messages."],
          ["func string entity(string name)", ""]
        ] },
        { title: "class XmlNode", fns: [
          ["new XmlNode(string tag, int line)", ""],
          ["func XmlNode child(string name)", "The first child element with this tag, or null."],
          ["func bool has(string name)", ""],
          ["func string attr(string name, string fallback)", ""],
          ["line", "`int` field. Where it starts."],
          ["children", "`list<XmlNode>` field."],
          ["attrs", "`map<string,any>` field."],
          ["tag", "`string` field."],
          ["text", "`string` field. The element's own text, trimmed."]
        ] },
        { title: "class XmlReader", fns: [
          ["new XmlReader(string text, string source)", ""],
          ["func XmlNode document()", ""],
          ["func XmlNode element()", ""],
          ["func bool at(string text)", "Does the input continue with this text?"],
          ["func bool atEnd()", ""],
          ["func string decode(string raw)", "Replaces character and entity references."],
          ["func string name()", ""],
          ["func string peek()", ""],
          ["func string value()", ""],
          ["func void advance()", ""],
          ["func void expect(string text)", ""],
          ["func void fail(string message)", ""],
          ["func void misc()", "Comments, whitespace and the prolog before and after the root element."],
          ["func void skipPast(string end)", "Skips up to and including 'end'."],
          ["func void space()", ""],
          ["line", "`int` field."],
          ["pos", "`int` field."],
          ["chars", "`list<string>` field."],
          ["source", "`string` field."]
        ] }
      ]
    })
  ]
});
