Docs.page({
  project: 'bellyos', section: 'apps', id: 'app-model', order: 1, title: 'Application model',
  summary: 'The Program lifecycle, events, ticks and how a window is driven.',
  blocks: [
    D.lead('A windowed application is a class that implements `Program`. `App.run` opens the window, drives the program and closes it.'),
    D.code('hasm', `
      @entry
      func int main(list<string> args) {
          return App.run(new MyApp(), "Title", 300, 340, args)
      }`),
    D.h2('Lifecycle'),
    D.table(['Call', 'When', 'Return value'], [
      ['`begin(win, handoff)`', 'The window is open. `handoff` tells how the program was started.', '-'],
      ['`draw()`', 'After `begin`, whenever a call asked for it, and always after a theme or size change.', '-'],
      ['`handle(event)`', 'Once per event, in order.', '`true` when the window needs repainting.'],
      ['`tick()`', 'Every `pace()` milliseconds, unless the pace is `-1`.', '`true` when the window needs repainting.'],
      ['`pace()`', 'Asked before each wait.', 'Milliseconds between ticks, or `-1` to wake only for events.'],
      ['`end()`', 'The window is closing: save what must be kept.', '-']
    ]),
    D.p('An error that escapes a call ends the application. `end()` still runs and the process reports the failure. The event `close` is handled by `App.run` and never reaches `handle`.'),
    D.h2('Events'),
    D.p('Events are maps with a `type` key. The window manager sends:'),
    D.table(['Type', 'Other keys', 'Meaning'], [
      ['`touch_down`, `touch_move`, `touch_up`', '`pointer`, `x`, `y`', 'A finger or the pointer, in window coordinates.'],
      ['`key_down`, `key_up`', '`key`', 'A key.'],
      ['`text`', '`text`', 'Typed text.'],
      ['`focus`', '`focused`', 'The window gained or lost the keyboard.'],
      ['`screen_resized`', '`width`, `height`', 'The window size changed.'],
      ['`screen`', '`orientation`', 'The screen rotated.'],
      ['`theme`', '`accent`, `dark`, `tz`, `wallpaper`', 'Settings changed; the application should repaint.'],
      ['`close`', '-', 'The user closed the window.']
    ]),
    D.p('With the XML interface you rarely handle these yourself: `Scene.handle(event)` turns touches into taps and drags and calls `Listener.act`. See [Scene and events](doc:scene).'),
    D.h2('The handoff'),
    D.p('`begin` receives a map that describes how the program was started:'),
    D.table(['Key', 'Value'], [
      ['`package`', 'The package name. The private directory is `/data/data/<package>`.'],
      ['`action`', '`main` for a plain start from the menu, otherwise the action it was asked for, such as `view` or `edit`.'],
      ['`data`', 'What to act on, usually a file path. May be empty.'],
      ['`type`', 'The data type, for example `text/plain`. May be empty.'],
      ['`res`', 'The interface files of the package, passed on to `Scene.open`.']
    ]),
    D.p('Use `App.dataDir(handoff)` to get the private directory. Writing there needs the `fs` permission.'),
    D.h2('Programs without a window'),
    D.p('A console tool is just a program with an `@entry` function that reads standard input and writes standard output. It runs from the shell, or from `pm run`. See [Command-line tools](doc:tools).')
  ]
});

Docs.page({
  project: 'bellyos', section: 'apps', id: 'manifest', order: 2, title: 'Manifest',
  summary: 'The description of a package: name, version, window, icon, permissions and handled actions.',
  blocks: [
    D.p('The manifest is a text file of `key=value` lines, at most 8 KB. It is validated when the package is built and again when it is installed.'),
    D.code('text', `
      name=acme.notes
      label=Notes
      version_code=3
      version_name=1.2
      window=320x420
      icon=file
      color=5
      permissions=fs
      handles=view:text/*,edit:text/plain`),
    D.table(['Key', 'Rule', 'Meaning'], [
      ['`name`', '`author.tool`: lower case letters, digits, `_`, dots; at most 64 characters', 'Unique package name. `belly.` is reserved for the system.'],
      ['`label`', '1 to 32 printable characters', 'Name shown in the menu and the title bar.'],
      ['`version_code`', 'integer, at least 1', 'Grows with every release; updates must have a higher code.'],
      ['`version_name`', 'up to 32 printable characters', 'Version shown to people.'],
      ['`window`', '`WIDTHxHEIGHT`, each 40 to 4096', 'Initial window size.'],
      ['`icon`', 'lower case word, up to 24 characters', 'Name of a built-in vector icon.'],
      ['`color`', '0 to 255', 'Selects the tint of the icon tile.'],
      ['`permissions`', 'up to 32 comma-separated words', 'APIs the application asks for. See [Permissions](doc:permissions).'],
      ['`handles`', 'up to 32 entries `action:type`', 'Actions the application offers to other programs. See [Handoff](doc:handoff).']
    ])
  ]
});

Docs.page({
  project: 'bellyos', section: 'apps', id: 'permissions', order: 3, title: 'Permissions and identity',
  summary: 'Which APIs an application may use and which user it runs as.',
  blocks: [
    D.p('Every installed application runs under **its own user id**, starting at 10000. The package manager starts it with only the Java-level APIs its permissions stand for; calling anything else fails because the API is not connected to the process.'),
    D.h2('Always available'),
    D.p('Every application can use: `IPC`, `Stdio`, `StringApi`, `ListApi`, `MapApi`, `MathApi`, `BytesApi`, `Util`, `SystemApi` and `Surface`. Windows, packages and settings are reached over `IPC` through the framework, so a plain application needs no permission to open a window.'),
    D.h2('Permissions'),
    D.table(['Permission', 'Unlocks', 'Use'], [
      ['`fs`', '`Disk`', 'Read and write files. The private directory `/data/data/<package>` is the application\'s own; the rest is subject to ordinary file permissions.'],
      ['`proc`', '`Proc`', 'Start and manage child processes.'],
      ['`crypto`', '`Crypto`', 'Cryptographic functions of the device.'],
      ['`device`', '`Device`', 'Information about the hardware.'],
      ['`settings`', 'no API', 'The right to change device settings through `Settings.set`; the settings service checks it.']
    ]),
    D.p('Ask only for what you need. A manifest that names a permission the system does not know is refused: `unknown permission \'camera\'`.'),
    D.h2('Private data'),
    D.p('The package manager creates `/data/data/<package>` for every application. It belongs to the application\'s own user id and is closed to other applications. Removing the package removes the directory.'),
    D.p('Device-wide settings are not stored there. They live in the settings service and in `~/.belly-settings` of the user; see [Settings service](doc:settings-service).'),
    D.h2('System applications'),
    D.p('The applications that ship with the system (`belly.*`) are declared by init and cannot be removed. Each of them declares in `/etc/system-packages` whether it runs as the logged-in **user** or under an identity of its **own**.'),
    D.h2('Child processes'),
    D.p('With the `proc` permission a program can start children through `belly.Proc`. A child receives only the APIs named in the call, and only APIs the parent itself holds can be named. Children end together with their parent.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'apps', id: 'handoff', order: 4, title: 'Handoff',
  summary: 'Asking another application to open a file or show a folder.',
  blocks: [
    D.lead('Applications do not know each other. A program asks for an **action** on some data, and the package manager starts an application that offers it.'),
    D.h2('Offering an action'),
    D.p('Declare it in the manifest as `action:type`. The type may use a wildcard.'),
    D.code('text', 'handles=view:text/*,edit:text/plain'),
    D.p('The actions in use are `main` (a plain start), `view` (show the data) and `edit` (change it).'),
    D.h2('Asking for an action'),
    D.p('From a window, ask the window manager. From a console tool, use `Pm.handoff`.'),
    D.code('hasm', `
      // inside a window program
      win.handoff("view", "/home/user/todo.txt", "text/plain")

      // from a tool
      map<string, any> r = Pm.handoff("view", "/home/user/todo.txt", "text/plain")`),
    D.p('If one application offers the action it is started. If several do, the desktop asks the person to choose. If none does, the call fails with `no application can view text/plain`.'),
    D.h2('Receiving it'),
    D.p('The started program finds the request in its handoff map: `action`, `data` and `type`.'),
    D.code('hasm', `
      override func void begin(Window win, map<string, any> handoff) {
          if handoff["action"] == "view" {
              string path = handoff["data"]
              // open path
          }
      }`),
    D.p('Helpers in `belly.Handoff` build and read the argument lists: `of`, `encode`, `offers`, `covers` and `typeOf`. See the [Handoff reference](doc:api-handoff).')
  ]
});
