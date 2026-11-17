Docs.page({
  project: 'hemu', section: 'concepts', id: 'architecture', order: 1, title: 'Architecture',
  summary: 'The parts of a Simulator and what each one owns.',
  blocks: [
    D.p('A `Simulator` is one device. Creating it opens the disk images, loads the firmware state, registers the guest API and starts the program scheduler. Closing it stops everything and unmounts the images.'),
    D.table(['Part', 'Accessor', 'Responsibility'], [
      ['Runtime', '`runtime()`', 'Runs guest programs cooperatively on one scheduler thread.'],
      ['Images', '`images()`', 'The two HVFS volumes, `devices.img` and `disk.img`.'],
      ['Partitions', '`partitions()`', 'Flashing and reading firmware partitions.'],
      ['Firmware', '`firmware()`', 'Bootloader lock, verified boot, wiping user data.'],
      ['Input', '`input()`', 'An event bus; every program that subscribes gets every event.'],
      ['API catalog', '`catalog()`', 'The named guest APIs and which of them a process is granted.']
    ]),
    D.h2('The first process'),
    D.p('`boot(output)` starts the program stored in the `boot` partition. It runs as **root** with every guest API connected. It is the only process created by the host; everything else is started by programs, through `Proc`.'),
    D.code('java', `
      HasmProcess boot = sim.boot(output);
      HasmProcess boot2 = sim.boot(output, input);   // with a standard input source`),
    D.h2('Processes and identity'),
    D.p('Each process has a pid and an identity (user id, group id, supplementary groups). Children inherit the identity of their parent at the moment they are spawned. Only a process running as root can change its identity. The file system checks every call against it, with the classic Unix rules.'),
    D.p('A parent chooses which APIs a child receives: a child can only be given APIs the parent holds itself. This is how a system hands a plain application a small set of capabilities while keeping the powerful ones for itself.'),
    D.h2('Inter-process messages'),
    D.p('`IPC` gives every process a mailbox addressed by its pid, and a directory of named services. A message is plain data: numbers, strings, `bytes`, lists and maps with string keys, nested up to 16 levels and at most 4 MiB; it is copied on send. The sender of a received message is filled in by the runtime and cannot be forged.'),
    D.p('A process **publishes** a name such as `window` or `system.window`, and others **find** it. Names that start with `system.` can only be published by privileged processes (user id below 10000). Names are released when the process ends. `receive` looks like a blocking call but only suspends the calling coroutine, so the scheduler keeps serving other processes.'),
    D.h2('Screen'),
    D.p('A program draws into **layers**: its own off-screen surfaces. A process that holds `Screen` can present to the display; a process that holds `Surface` can draw but not present. Whoever owns the screen composes the layers of everybody else. Layers are released automatically when their process ends.'),
    D.h2('Time and fairness'),
    D.p('Programs share one thread. A coroutine that waits, sleeps or reads an event costs nothing, and a long computation is sliced so that the scheduler can serve other processes. Blocking on the host thread from a guest API is avoided on purpose.'),
    D.h2('Threading rules for hosts'),
    D.ul([
      '`Display.present` is called on the scheduler thread. Hand the frame to your UI thread yourself and never block.',
      '`input().publish` can be called from any thread.',
      'Firmware changes (`lock`, `unlock`, flashing) are meant for a device that is not running.'
    ])
  ]
});
