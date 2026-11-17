Docs.page({
  project: 'bellyos', section: 'system', id: 'boot', order: 1, title: 'Boot and recovery',
  summary: 'From the bootloader to a login session, verified boot and the recovery system.',
  blocks: [
    D.h2('The chain'),
    D.steps([
      { title: 'Bootloader (`/boot`)', text: 'Decides whether the device may start. Starts `/system`, and starts it again when it asks for a reboot.' },
      { title: 'Init (`/system`)', text: 'Prepares the disk layout on first boot, writes `/etc/build.prop`, starts the services and keeps a login shell running.' },
      { title: 'Services', text: 'The package manager, settings service and window manager are published under service names and talk over IPC.' },
      { title: 'Session', text: '`/bin/sh` on the console, or `/bin/wm` with the desktop, runs as the logged-in user.' }
    ]),
    D.h2('Exit codes'),
    D.p('The session program and init use exit codes to tell their parent what to do next.'),
    D.table(['Code', 'Meaning'], [
      ['`0`', 'Log out; start a new session.'],
      ['`1`', 'Shut down.'],
      ['`2`', 'Reboot.'],
      ['`3`', 'Reboot into the recovery.']
    ]),
    D.p('A session program that crashes is restarted, but not forever.'),
    D.h2('Verified boot'),
    D.p('The boot ROM has already checked the bootloader partition. The bootloader checks what it is about to start against the signed description of the firmware, and hands the verdict to the system as the arguments `boot.state=<verdict>` and `boot.lock=<lock state>`.'),
    D.table(['Verdict', 'Condition', 'Result'], [
      ['`verified`', 'Locked, and everything matches.', 'Starts without comment.'],
      ['`unlocked`', 'The bootloader is unlocked.', 'Warns for a moment, then starts.'],
      ['`corrupt`', 'Locked, and something differs.', 'Refuses to start. The owner must unlock the bootloader and flash again.']
    ]),
    D.p('Programs can read the result from `Build.bootState()` and `Build.isLocked()`.'),
    D.h2('Recovery'),
    D.p('The recovery system starts when `/system` is missing or crashes, when the system asks for it (exit code 3), and, on a device that reports corruption, when the owner touches the screen. It offers:'),
    D.table(['Action', 'Effect'], [
      ['Reboot system', 'Back to the normal start.'],
      ['Apply update', 'Installs `/cache/update.hup`, a signed update package.'],
      ['Wipe user data', 'Factory reset: homes, application data, caches and accounts. The firmware stays.'],
      ['Power off', 'Shuts down.']
    ]),
    D.p('An update is accepted when its signature is valid, the signer is one the device trusts, and it does not lower the API level. While an update is being installed the control block says `stage=installing`, so a power loss in the middle is continued at the next boot instead of leaving a half-updated system.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'system', id: 'filesystem', order: 2, title: 'File system layout',
  summary: 'Where the system, the applications and their data live.',
  blocks: [
    D.table(['Path', 'Content'], [
      ['`/system/lib/framework.bin`', 'The framework library that applications link to.'],
      ['`/system/app/<package>/`', 'System applications: `app.bin` and `res/`.'],
      ['`/bin/`', 'Low-level console tools, init helpers and services (`sh`, `pmd`, `wm`, `settingsd`, `pm`, `setting`, ...).'],
      ['`/data/app/<package>/`', 'Installed applications: `app.bin` and `res/`.'],
      ['`/data/data/<package>/`', 'Private data of an application, owned by its own user id and closed to others.'],
      ['`/data/system/`', 'System databases: `packages`, `settings`.'],
      ['`/etc/`', '`build.prop`, `passwd`, `system-packages`.'],
      ['`/home/<user>/`', 'A user\'s files. Personal settings are in `~/.belly-settings`.'],
      ['`/cache/`', 'Scratch space, including a pending `update.hup`.'],
      ['`/tmp/`', 'Temporary files.']
    ]),
    D.h2('Why resources are in the application\'s directory'),
    D.p('The interface files travel inside the signed package and are stored beside the program: `<app dir>/res/layout/main.xml`. When the application starts, the package manager hands it its own files, and `App.run` passes them to the program in the handoff under `res`. An update replaces the whole `res/` directory, so removed files do not linger.'),
    D.h2('Settings'),
    D.p('Device and user settings do not live in the data directory of any application. They are kept by the settings service. The personal ones are stored in `~/.belly-settings`.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'system', id: 'package-manager', order: 3, title: 'Package manager service',
  summary: 'The IPC protocol of /bin/pmd.',
  blocks: [
    D.p('`/bin/pmd` runs as root and is published as the service **`system.package`**. It owns the database of installed applications (`/data/system/packages`, readable by everybody), the programs with their interface files, and the private data directory of every application. It also starts applications: the window manager asks it to, and each one runs under the user id of its package with only the APIs its permissions allow.'),
    D.p('Requests are IPC maps with a `type` and an optional `id` that the answer repeats. Most programs use the `belly.Pm` client instead of speaking the protocol themselves.'),
    D.table(['Request', 'Answer', 'Allowed for'], [
      ['`{list}`', '`{result, packages}`', 'anybody'],
      ['`{install, data}`', '`{result, name, updated}`', 'device owner and root; `data` is a signed `.hpk`'],
      ['`{uninstall, name}`', '`{result}`', 'device owner and root'],
      ['`{run, app, argument}`', '`{result, output, errors, code}`', 'device owner and root; runs without a window for up to 10 seconds'],
      ['`{launch, app}`', '`{result}` on failure', 'the window manager only'],
      ['`{handoff, action, data, dataType}`', '`{result, package, pending}`', 'any program; starts the package that offers the action'],
      ['`{handoff, ..., package}`', '`{result, package}`', 'the window manager only: the user\'s choice'],
      ['`{kill, pid}`', 'nothing', 'the window manager only'],
      ['`{resources}`', '`{result, files}`', 'a program this service started: its own interface files, path to text']
    ]),
    D.p('Every failure is `{type: "result", ok: false, error}`. After a change the window manager hears `{packages_changed}`.'),
    D.h2('Handoff with several candidates'),
    D.p('When several packages offer an action for a data type, the desktop is asked to let the person choose; the answer then has `pending: true` and no package.'),
    D.h2('Package records'),
    D.p('`Pm.installed()` returns one map per package with these keys: `name`, `uid`, `versionCode`, `versionName`, `label`, `width`, `height`, `icon`, `color`, `permissions`, `signer` and `system`.')
  ]
});

Docs.page({
  project: 'bellyos', section: 'system', id: 'settings-service', order: 4, title: 'Settings service',
  summary: 'Typed device settings with a fixed schema.',
  blocks: [
    D.p('`/bin/settingsd` is published as **`system.settings`**. The settings live here, not in the programs that use them: one typed key/value store with a fixed schema (every key has a type, a range and a default), kept in `/data/system/settings`.'),
    D.table(['Key', 'Type', 'Range', 'Meaning'], [
      ['`ui.accent`', 'int', '0 to 7', 'Accent color of the palette.'],
      ['`ui.dark`', 'bool', '-', 'Dark mode.'],
      ['`ui.timezone`', 'int', '-12 to 14', 'Hours east of UTC.'],
      ['`ui.wallpaper`', 'int', '0 to 3', 'Wallpaper choice.']
    ]),
    D.h2('Protocol'),
    D.table(['Request', 'Answer', 'Allowed for'], [
      ['`{get, key}`', '`{result, key, value}`', 'anybody'],
      ['`{list, prefix}`', '`{result, values}`', 'anybody; defaults included'],
      ['`{set, key, value}`', '`{result}`', 'root, the device owner, or a package with the `settings` permission'],
      ['`{watch, prefix}`', '`{result}`; changes arrive as `{setting_changed, key, value}`', 'anybody'],
      ['`{unwatch, prefix}`', '`{result}`', 'anybody']
    ]),
    D.p('A value that does not fit its key\'s type or range is refused.'),
    D.h2('From a program'),
    D.code('hasm', `
      import belly.Settings as Settings

      any dark = Settings.get("ui.dark")
      map<string, any> all = Settings.all("ui.")
      Settings.set("ui.wallpaper", 2)`),
    D.p('A window program does not need this client: `Window.setSetting` asks for a change and the window manager pushes the result to every window as a `theme` event. See the [Settings reference](doc:api-settings).')
  ]
});

Docs.page({
  project: 'bellyos', section: 'system', id: 'versions', order: 5, title: 'Versions and updates',
  summary: 'API levels, build properties and compatibility rules.',
  blocks: [
    D.p('The current release is **0.5.0** with API level **4**. The API level only grows: it rises whenever the framework gains something, and never goes down.'),
    D.h2('Build properties'),
    D.p('`/etc/build.prop` is owned by root and rewritten by init at every boot, so a program can rely on it. `belly.Build` reads it and needs the `fs` permission for read access to `/etc`.'),
    D.table(['Key', 'Meaning'], [
      ['`ro.belly.version`', 'Release of the system, for example `0.5.0`.'],
      ['`ro.belly.api_level`', 'Level of the system API.'],
      ['`ro.hal.level`', 'Level of the hardware interface the device offers.'],
      ['`ro.boot.lock`', '`locked` or `unlocked`: state of the bootloader.'],
      ['`ro.boot.state`', '`verified`, `unlocked` or `corrupt`: verdict of verified boot.'],
      ['`ro.boot.tree`', 'The firmware tree the system started from.'],
      ['`ro.product.model`', 'Name of the device.']
    ]),
    D.code('hasm', `
      import belly.Build as Build

      if !Build.atLeast(4) {
          // fall back or tell the person to update
      }
      string model = Build.model()`),
    D.h2('Compatibility'),
    D.ul([
      'The file `api/current.api` is a snapshot of the public API. `ApiTool check` compares it with the sources and fails when they differ or when the declared level does not match.',
      '`ApiTool update` records a new surface: additions are accepted at the same level; a breaking change (a function changed or removed) is accepted only when the level has gone up.',
      'So a program written for level N keeps working on every system that has level N and a recorded surface that still contains what the program calls.',
      'Update packages cannot lower the API level of the system.'
    ]),
    D.h2('Updates'),
    D.p('A system update is a signed package, applied by the recovery system from `/cache/update.hup`. The device accepts it when the signature is valid, the signer is trusted (a locked device only trusts the key of its own owner) and the API level does not go down. The firmware itself is described by a signed record that the bootloader checks at every start.')
  ]
});
