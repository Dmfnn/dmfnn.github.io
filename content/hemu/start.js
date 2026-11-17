Docs.page({
  project: 'hemu', section: 'start', id: 'overview', order: 1, title: 'Overview',
  summary: 'What HEMU simulates and how the pieces fit.',
  blocks: [
    D.lead('HEMU is a virtual device. It provides a screen, touch and key input, two persistent disks, a firmware with a lockable bootloader, and a process model. On top of that it runs operating systems whose programs are compiled to HASM binaries.'),
    D.cards([
      { icon: 'cpu', title: 'The device', text: 'One `Simulator` object is the whole machine.', href: 'doc:architecture' },
      { icon: 'database', title: 'Storage', text: 'Two journaled HVFS images: firmware and data.', href: 'doc:storage' },
      { icon: 'shield', title: 'Firmware', text: 'Bootloader lock, signed partitions and verified boot.', href: 'doc:firmware' },
      { icon: 'puzzle', title: 'Guest API', text: 'The classes a program on the device can call.', href: 'doc:api-disk' }
    ], { cols: 2 }),
    D.h2('What you get'),
    D.ul([
      'A **screen** made of layers that a program draws into and that the host composes and presents.',
      '**Input** as a stream of events: touches, keys and text.',
      'Two disk images with a real file system: Unix permissions, a journal and crash safety.',
      'A **firmware model** like a phone\'s: unlocked while you develop, locked and verified for a finished system.',
      '**Processes and IPC**: programs start children, run under user ids and talk through messages.',
      '**Signed packages and updates** that the guest can inspect.',
      'A host application for Android and a plain Java API for everything else.'
    ]),
    D.h2('What HEMU does not include'),
    D.p('HEMU ships no operating system of its own. The device boots whatever is flashed into the `boot` partition. Anything above that, such as an init program, a shell or a window manager, belongs to the system you put on it.'),
    D.h2('Layers'),
    D.code('text', `
      Host application (Android app, tests, your own tool)
          |   Display, input, flash, lock, update
          v
      Simulator ---- storage (HVFS images)  ---- firmware (lock, vbmeta, ostree)
          |
          +--- runtime ---- guest programs (HASM binaries), processes, IPC
                               |
                               +--- guest API: Disk, Devices, Screen, Events, Device,
                                    Firmware, Crypto, Pkg, Update, IPC, Proc`),
    D.p('Continue with [Quick start](doc:quick-start).')
  ]
});

Docs.page({
  project: 'hemu', section: 'start', id: 'quick-start', order: 2, title: 'Quick start',
  summary: 'Create a device, flash a program, boot it and watch its output.',
  blocks: [
    D.p('The simulator is an ordinary Java class. You supply a directory for the images and a `Display`; the rest is a few calls.'),
    D.code('java', `
      File dir = new File("device");
      try (Simulator sim = new Simulator(dir, new RecordingDisplay(320, 240))) {

          // 1. put a compiled program into the boot partition
          sim.flash(Simulator.BOOT_PARTITION, Files.readAllBytes(Paths.get("boot.bin")));

          // 2. start the device and collect what it prints
          HasmOutput output = new HasmOutput();
          output.addListener(m -> System.out.print(m.getText()));
          HasmProcess boot = sim.boot(output);

          // 3. wait until the first process ends
          sim.runtime().awaitTermination(boot, 10_000);
      }`, 'Main.java'),
    D.p('On first use the two images, \`devices.img\` and \`disk.img\`, are created and formatted inside the directory. They are ordinary files: copy them to move the device.'),
    D.h2('A minimal boot program'),
    D.code('hasm', `
      pkg demo.Boot
      usingapi Stdio
      usingapi Device

      @entry
      func void main() {
          Stdio.println("hello from the device, hardware level " + Device.halLevel())
      }`, 'boot.hasm'),
    D.p('The first process holds **every** guest API and runs as root. What it hands on to the programs it starts is the decision of the system running on the device.'),
    D.h2('Sending input'),
    D.code('java', `
      long now = System.currentTimeMillis();
      sim.input().publish(InputEvent.touch(InputEvent.Type.TOUCH_DOWN, 0, 120, 80, now));
      sim.input().publish(InputEvent.touch(InputEvent.Type.TOUCH_UP,   0, 120, 80, now + 60));`),
    D.h2('Next'),
    D.ul([
      '[Architecture](doc:architecture): the parts of a `Simulator`.',
      '[Storage](doc:storage): what the two images hold and how to read them from the host.',
      '[Firmware](doc:firmware): locking the device and verified boot.',
      '[Embedding](doc:embedding-host): implementing `Display`, driving input, running on Android.'
    ])
  ]
});
