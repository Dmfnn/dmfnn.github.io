Docs.page({
  project: 'bellyos', section: 'start', id: 'overview', order: 1, title: 'Overview',
  summary: 'What BellyOS is made of and what an application can rely on.',
  blocks: [
    D.custom('screens', { items: [
      { src: 'assets/img/bellyos-settings.png', alt: 'BellyOS desktop with the Settings and Calculator windows open', caption: 'The BellyOS desktop: windows, taskbar and the Settings application. Captured from the running system.' },
      { src: 'assets/img/bellyos-launcher.png', alt: 'BellyOS application launcher', caption: 'The launcher.' },
      { src: 'assets/img/bellyos-calculator.png', alt: 'Calculator application', caption: 'An application window.' }
    ] }),
    D.lead('BellyOS is a compact operating system written in HASM. It has a boot chain, a package manager, a settings service, a window manager and a framework library that applications link against.'),
    D.cards([
      { icon: 'layers', title: 'Declarative interface', text: 'Screens are XML files in `res/` and travel inside the signed package.', href: 'doc:xml-layout' },
      { icon: 'box', title: 'Signed packages', text: 'Applications ship as `.hpk` packages with a manifest, a program and resources.', href: 'doc:packaging' },
      { icon: 'shield', title: 'Permissions', text: 'Each application runs under its own identity with only the APIs it asked for.', href: 'doc:permissions' },
      { icon: 'code', title: 'API reference', text: 'Every function of the framework, generated from the API snapshot.', href: 'doc:api-app' }
    ], { cols: 2 }),
    D.h2('Building blocks'),
    D.table(['Part', 'Where', 'Role'], [
      ['Bootloader', '`/boot`', 'Checks the firmware, then starts the system. Falls back to recovery.'],
      ['Init', '`/system`', 'Prepares the disk, starts the services and keeps a login session running.'],
      ['Package manager', '`/bin/pmd`', 'Installs, removes and starts applications. Service `system.package`.'],
      ['Settings service', '`/bin/settingsd`', 'Typed device settings. Service `system.settings`.'],
      ['Window manager', '`/bin/wm`', 'Owns the screen and the input; composes the windows of applications. Service `system.window`.'],
      ['Framework', '`/system/lib/framework.bin`', 'The library applications call: windows, XML interface, drawing, settings, packages.'],
      ['Recovery', '`/recovery`', 'Applies updates and wipes user data.']
    ]),
    D.h2('The shape of an application'),
    D.steps([
      { title: 'Describe the screen in XML', text: 'Layouts and styles live in `res/layout/` and `res/values/`.' },
      { title: 'Write the behaviour in HASM', text: 'Implement `Program` and `Listener`; react to taps in `act`.' },
      { title: 'Pack and install', text: 'Sign the package with your key and install it with the package manager.' }
    ]),
    D.p('Continue with [Building the system](doc:build-system) or go straight to [your first application](doc:first-app).'),
    D.h2('API levels'),
    D.p('The framework is versioned by an **API level** that only grows. The level of this documentation is **4**. A program can ask the system what it runs on, and adapt:'),
    D.code('hasm', `
      import belly.Build as Build

      if !Build.atLeast(4) {
          // the system is older than the level this program needs
      }`),
    D.p('See [Versions and updates](doc:versions) for the rules.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'start', id: 'build-system', order: 2, title: 'Building the system',
  summary: 'Compile BellyOS with the HASM tool and see what comes out.',
  blocks: [
    D.p('BellyOS is built from plain sources with the HASM command-line tool. The `build.sh` script in the project root runs the compiler, then copies the interface files of the system applications next to their programs.'),
    D.code('bash', `
      ./build.sh            # output in ./out
      ./build.sh /tmp/os    # output elsewhere`),
    D.p('Two environment variables adjust the script: `HASM_HOME` points at the HASM project and `HASM_CMD` replaces the command that runs the tool.'),
    D.h2('Output'),
    D.table(['File', 'Purpose'], [
      ['`boot.bin`, `system.bin`, `recovery.bin`', 'Firmware partitions.'],
      ['`bin/<name>.bin`', 'Session, services and console tools; installed as `/bin/<name>`.'],
      ['`system/lib/framework.bin`', 'The framework library.'],
      ['`system/app/<package>/app.bin` and `res/`', 'System applications with their interface files.']
    ]),
    D.p('The build also regenerates `sdk/`: one declaration file per public framework module. Application projects use that directory as their `sdkPath`; see [Your first application](doc:first-app).'),
    D.h2('How the project is organised'),
    D.code('text', `
      build.json        targets: the framework library, the firmware, services, tools, applications
      os/               boot, init, recovery, services, console tools and system applications
      stdlib/belly/     the framework library sources
      res/<package>/    interface files of the system applications
      sdk/              generated declarations for application builds
      api/current.api   snapshot of the public API`),
    D.p('`build.json` is an ordinary HASM project file; the framework is a library target with an `sdk` directory and every program links to it dynamically. See [build.json reference](doc:hasm/build-json).')
  ]
});

Docs.page({
  project: 'bellyos', section: 'start', id: 'first-app', order: 3, title: 'Your first application',
  summary: 'A counter with a screen in XML, built, packed and installed.',
  blocks: [
    D.lead('This walkthrough builds a counter: three buttons and a number. The screen is XML, the logic is HASM.'),
    D.h2('1. Project layout'),
    D.code('text', `
      counter/
        build.json
        Counter.hasm
        manifest.txt
        res/
          layout/main.xml
          values/styles.xml      (optional)`),
    D.h2('2. The screen'),
    D.code('xml', `
      <Column width="fill" height="fill" pad="16" gap="12" align="center">
          <Text id="value" size="48" face="bold" text="0"/>
          <Row gap="8">
              <Tap id="minus" style="primary" text="-"/>
              <Tap id="plus" style="primary" text="+"/>
          </Row>
          <Tap id="reset" text="Reset"/>
      </Column>`, 'res/layout/main.xml'),
    D.p('Elements with an `id` can be found and changed from the program. See [XML layouts](doc:xml-layout) for every element and attribute.'),
    D.h2('3. The program'),
    D.code('hasm', `
      pkg demo.counter.Counter

      import belly.App as App
      import belly.Scene as Scenes
      import belly.View as Views

      class CounterApp implement Program, Listener {
          Scene scene = null
          int value = 0

          override func void begin(Window win, map<string, any> handoff) {
              self.value = 0
              self.scene = Scenes.open(win, handoff, "main", self)
          }

          override func int pace() { return -1 }
          override func bool tick() { return false }
          override func bool handle(map<string, any> event) { return self.scene.handle(event) }
          override func void draw() { self.scene.draw() }
          override func void end() { }

          override func void act(string id, int index) {
              if id == "plus" { self.value += 1 }
              else if id == "minus" { self.value -= 1 }
              else if id == "reset" { self.value = 0 }
              self.scene.setText("value", "" + self.value)
          }

          override func bool key(int code) { return false }
          override func bool typed(string text) { return false }
      }

      @entry
      func int main(list<string> args) {
          return App.run(new CounterApp(), "Counter", 260, 220, args)
      }`, 'Counter.hasm'),
    D.ul([
      '`Program` is the lifecycle: `begin` when the window is open, `handle` for every event, `draw` to paint, `end` when the window closes. See [Application model](doc:app-model).',
      '`Listener.act` is called when a control is activated. Setters such as `setText` mark the scene as changed and it repaints itself.',
      '`pace()` returns `-1` because the program only reacts to events. Return a number of milliseconds to receive `tick()` calls.'
    ]),
    D.note('A class without a constructor gets one that takes its fields that have no initial value. Giving the fields initial values, as above, keeps `new CounterApp()` argument-free.'),
    D.h2('4. Build'),
    D.p('Link against the SDK that the system build produced. The framework is loaded at run time, so the program stays small.'),
    D.code('json', `
      {
        "type": "release",
        "targets": [
          {
            "name": "counter",
            "sources": ["Counter.hasm"],
            "output": "counter.bin",
            "link": { "mode": "dynamic", "sdkPath": "../bellyos/sdk" }
          }
        ]
      }`, 'build.json'),
    D.code('bash', 'hasm build .'),
    D.h2('5. The manifest'),
    D.code('text', `
      name=demo.counter
      label=Counter
      version_code=1
      version_name=1.0
      window=260x220
      icon=calc
      color=3
      permissions=
      handles=`, 'manifest.txt'),
    D.p('Every field is described on the [Manifest](doc:manifest) page.'),
    D.h2('6. Pack and install'),
    D.code('bash', `
      java hemu.pkg.PackTool manifest.txt counter.bin developer.key counter.hpk res`),
    D.p('The key file is created on first use and identifies you as the author of the package. Put the package on the device and install it with the package manager:'),
    D.code('bash', 'pm install /home/user/counter.hpk'),
    D.p('The application appears in the menu of the desktop. More about packages on the [Packaging](doc:packaging) page.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'start', id: 'packaging', order: 4, title: 'Packaging',
  summary: 'The .hpk package: contents, limits, signing and installing.',
  blocks: [
    D.p('An application is distributed as an **`.hpk`** package. It holds a manifest, the compiled program, the interface files and a signature made with the author\'s key.'),
    D.h2('PackTool'),
    D.code('bash', `
      PackTool <manifest> <program.bin> <key file> <out.hpk> [<resource dir>]`),
    D.table(['Argument', 'Meaning'], [
      ['`manifest`', 'Text file with `key=value` lines. See [Manifest](doc:manifest).'],
      ['`program.bin`', 'The compiled program.'],
      ['`key file`', 'Two lines of hexadecimal: private key and public key. Created when it does not exist.'],
      ['`out.hpk`', 'The package to write.'],
      ['`resource dir`', 'Optional. One level of directories (`layout/`, `values/`); everything in it is packed.']
    ]),
    D.p('On success the tool prints `packed <name> <version>`; on a problem it prints `error: ...` and exits with code 1.'),
    D.h2('Limits'),
    D.table(['Item', 'Limit'], [
      ['Manifest', '8 KB'],
      ['Resource files', '64 files, 128 KB each, 512 KB in total'],
      ['Resource path', '`group/name.xml`: both parts lower case letters, digits and `_`, starting with a letter']
    ]),
    D.h2('Signing and identity'),
    D.p('The signature covers the whole package. The author is identified by the public key. A package can only be updated by the same author: installing a package whose name is already installed but whose signer differs is refused. Names that start with `belly.` are reserved for the system.'),
    D.h2('Installing'),
    D.table(['Command', 'Meaning'], [
      ['`pm install <file.hpk>`', 'Install or update.'],
      ['`pm remove <name>`', 'Remove the package and its data.'],
      ['`pm list`', 'List installed packages.'],
      ['`pm run <name> [argument]`', 'Run a package without a window and show its output (up to 10 seconds).'],
      ['`pm open <action> <data>`', 'Hand data to an application that offers the action.']
    ]),
    D.p('Only the device owner and root may install, remove and run packages. An update must have a higher `version_code` than the installed package.'),
    D.h3('Install errors'),
    D.table(['Message', 'Cause'], [
      ['`signature does not match`', 'The package was changed after signing.'],
      ['`package names starting with \'belly.\' belong to the system`', 'Choose another name.'],
      ['`unknown permission \'x\'`', 'The manifest asks for a permission that does not exist.'],
      ['`<name> is installed from a different signer; remove it first`', 'Another author owns the name.'],
      ['`version N is not newer than the installed M`', 'Raise `version_code`.'],
      ['`<name> is a system package`', 'System packages cannot be replaced.']
    ]),
    D.h2('From the host'),
    D.p('A host that embeds the device can place a package on its disk with `Simulator.install(path, bytes)` and then run `pm install` in the shell. Building a package in code uses `Hpk.build(manifest, programBytes, resources, keyPair)`.')
  ]
});
