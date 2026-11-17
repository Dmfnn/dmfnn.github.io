Docs.page({
  project: 'hemu', section: 'firmware', id: 'firmware', order: 1, title: 'Bootloader lock and verified boot',
  summary: 'Locking a device, what a locked device checks and how the guest sees it.',
  blocks: [
    D.p('The firmware model follows a phone. A new device is **unlocked**: it accepts any partition contents and starts whatever it is given, which is what development needs. A finished system is **locked**: the device then runs only what was signed.'),
    D.h2('Lock and unlock'),
    D.table(['Call', 'Effect'], [
      ['`firmware().lock()`', 'Describes the current partitions in a signed `/vbmeta` partition with the device\'s own key, trusts that key from now on and refuses further flashing. For an operating system built by its owner.'],
      ['`firmware().lock(publicKey)`', 'Locks to a vendor key: the `/vbmeta` that was flashed must be signed by that key and describe the partitions exactly as they are.'],
      ['`firmware().unlock()`', 'Releases the lock.'],
      ['`firmware().isLocked()`', 'Current state.']
    ]),
    D.p('Both `lock` and `unlock` change who may have written the data on the device, so both **erase the user data first**, as a phone does. A change that fails half-way leaves the device in its old state.'),
    D.p('Locking needs the three required partitions, `boot`, `system` and `recovery`. With a vendor key it also fails when a listed partition is missing, not covered or different from its description.'),
    D.h2('Verified boot'),
    D.steps([
      { title: 'Boot ROM', text: 'The host checks `/boot` before starting it. A locked device only starts a `/boot` that matches the signed description.' },
      { title: 'Bootloader', text: 'The program in `/boot` asks the `Firmware` API how the other partitions compare with the description and applies its own policy: refuse, fall back to recovery, or just warn.' },
      { title: 'System', text: 'The system can check its own files against the `ostree` partition, see below.' }
    ]),
    D.h3('Vbmeta'),
    D.p('`/vbmeta` lists, for every protected partition, its size and SHA-256, followed by an ECDSA (P-256, SHA-256) signature over everything before it.'),
    D.code('text', `
      HEMUVB 1
      boot 10130 3f2a...
      system 12583 91c0...
      sig 3045...`),
    D.p('Every partition is protected except `vbmeta` itself and the scratch partition `misc`.'),
    D.h3('Results'),
    D.table(['Question', 'Answers'], [
      ['`bootState()`', '`verified`, `unlocked` or `corrupt`.'],
      ['`check(name)`', '`ok`, `modified`, `missing`, `unlisted` or `unsigned`: how one partition compares with the description.'],
      ['`tree()`', '`state` is `verified`, `modified` or `unprotected`; `problems` lists files as `path: modified` or `path: missing`.']
    ]),
    D.h2('The operating system\'s own files'),
    D.p('The `ostree` partition lists the programs that ship with the system, one per line after a header, as `<path> <size> <sha256>`. It is flashed like any partition, so on a locked device the signed description covers it and, through it, every file it lists. The system verifies them before it starts anything from there. Files that are not listed, such as a program the user copied into `/bin`, are not checked.'),
    D.h2('From a guest program'),
    D.code('hasm', `
      usingapi Firmware

      string verdict = Firmware.bootState()     // "verified" | "unlocked" | "corrupt"
      map<string, any> tree = Firmware.tree()   // state + problems`),
    D.p('The API is read-only apart from factory reset. Locking, unlocking and flashing are the owner\'s business and happen on the host side. See the [Firmware reference](doc:api-firmware).')
  ]
});

Docs.page({
  project: 'hemu', section: 'firmware', id: 'updates', order: 2, title: 'System updates',
  summary: 'The signed .hup package and how a device accepts it.',
  blocks: [
    D.p('A system update is a signed package with the extension **`.hup`**: new firmware partitions and new system files. The recovery program installs it; the guest API `Update` lets that program inspect and apply it.'),
    D.h2('Format'),
    D.code('text', `
      "HUP1" | manifest length (int) | manifest (UTF-8 text) | payload length (int) | payload
             | key length (short) | signer's public key (X.509)
             | signature length (short) | signature (ECDSA P-256 / SHA-256 over everything before the key)`),
    D.p('The manifest lists `api_level=N`, `version_name=...` and one line for each entry in the order its content follows in the payload:'),
    D.code('text', `
      api_level=4
      version_name=0.6.0
      partition system 12583
      file /bin/sh 0755 4181`),
    D.h2('Rules'),
    D.ul([
      'The signature is verified before the manifest is read.',
      'Files may only go to the system\'s own directories, `/bin` and `/system`. The user\'s data is never touched by an update.',
      'A locked device accepts only packages signed by the key it trusts (`Firmware.acceptsSigner`).'
    ]),
    D.p('Whether to accept an update beyond that, for example refusing one that lowers the version of the system, is the policy of the operating system\'s recovery program. See the [Update reference](doc:api-update).')
  ]
});
