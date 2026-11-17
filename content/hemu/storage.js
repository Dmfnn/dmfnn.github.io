Docs.page({
  project: 'hemu', section: 'storage', id: 'storage', order: 1, title: 'Storage',
  summary: 'The two disk images, their roles and how to reach them from the host.',
  blocks: [
    D.p('The device has two disks. Both are files in the directory you pass to the `Simulator`, and both are created and formatted on first use.'),
    D.table(['Image', 'Default size', 'Guest API', 'Content'], [
      ['`devices.img`', '16 MiB', '`Devices`', 'Firmware storage. Its root-level files (`/boot`, `/system`, `/recovery`, ...) are the executables the device boots from.'],
      ['`disk.img`', '64 MiB', '`Disk`', 'Free storage for the operating system and its users.']
    ]),
    D.p('Sizes are in KiB in the constructor `Simulator(dir, display, devicesKb, diskKb)` and only apply to images that do not exist yet.'),
    D.h2('Partitions'),
    D.p('A **partition** is just a root-level file of `devices.img`. `Partitions` is the host-side tool to manage them. Flashing always runs with root identity, and the compiler only produces the binaries.'),
    D.table(['Call', 'Effect'], [
      ['`flash(name, bytes)`, `flash(name, stream)`', 'Write a partition. Refused on a locked device.'],
      ['`read(name)`, `export(name, out)`', 'Read a partition.'],
      ['`exists(name)`, `list()`', 'Query.'],
      ['`erase(name)`', 'Delete a partition.']
    ]),
    D.p('A device needs at least `boot`, `system` and `recovery` to be complete. The `Simulator` convenience `flash(partition, bytes)` is the same operation.'),
    D.h2('Files'),
    D.p('`VolumeFiles` is host access to a mounted image, always as root. It is like managing the storage of a phone over a cable while the phone is switched off.'),
    D.code('java', `
      VolumeFiles disk = new VolumeFiles(sim.images().disk());
      disk.mkdir("/bin", 0755);
      disk.write("/bin/hello", Files.readAllBytes(Paths.get("hello.bin")), 0755);
      byte[] back = disk.readAll("/bin/hello");
      for (FileInfo f : disk.list("/bin")) System.out.println(f);
      VolumeUsage use = disk.usage();`),
    D.p('`Simulator.install(path, bytes)` puts a file onto `disk.img` like `adb push`: parent directories are created and the mode is `0755`. It is meant for the programs a freshly flashed system expects, such as its shell.'),
    D.note('Do not open an image from the host while a device is running on it. Each image is locked while it is mounted; a second mount fails with a busy error.')
  ]
});

Docs.page({
  project: 'hemu', section: 'storage', id: 'hvfs', order: 2, title: 'HVFS file system',
  summary: 'The journaled, Unix-style file system behind both images.',
  blocks: [
    D.lead('HVFS is a small file system written in C++ for disk images. It has Unix ownership and permissions, a journal for crash safety and a cache that keeps it fast.'),
    D.h2('Properties'),
    D.table(['Property', 'Detail'], [
      ['Block size', '4096 bytes'],
      ['Permissions', 'Classic owner, group and other bits. Root bypasses read and write checks; running a file still needs at least one execute bit.'],
      ['Identity', 'Each mounted view has credentials (uid, gid, groups). Host access is root; guest processes use their own identity.'],
      ['Directories', 'ext2-style variable-length records packed in blocks, with a lookup cache. `.` and `..` are real entries.'],
      ['Allocation', 'On-disk bitmap with next-fit allocation and a locality hint.'],
      ['Journal', 'Metadata is written through a redo journal. A torn write is detected by checksums and discarded.'],
      ['Data writes', 'Ordered mode: file data is flushed before the metadata that references it is committed.'],
      ['Cache', 'LRU block cache; default 4096 blocks (16 MiB) per mount.'],
      ['Mounting', 'An image is locked with `flock` while mounted, so a double mount fails.'],
      ['Concurrency', 'Thread-safe: every call takes one lock per mount.']
    ]),
    D.h2('Atomic operations'),
    D.p('Each file system operation is all-or-nothing in memory: when it fails half-way, every metadata block it touched is restored. After a power loss the journal is replayed on the next mount and the volume is clean again.'),
    D.h2('Components'),
    D.table(['Directory', 'Content'], [
      ['`hvfs/include`, `hvfs/src`', 'The C++ library.'],
      ['`hvfs/bindings/jni`, `hvfs/bindings/java`', 'JNI glue and the Java classes (`HvfsVolume`, `HvfsException`).'],
      ['`hvfs/tools`', '`hvfs_shell`: an interactive tool to browse an image on a development machine.'],
      ['`hvfs/tests`', 'Native test suite.']
    ]),
    D.p('Errors carry POSIX-like names. In a guest program a failed call raises an error whose message starts with the name, for example `ENOENT: open \'/x\'`.'),
    D.code('hasm', `
      try {
          bytes b = Disk.readFile("/missing")
      } catch (string e) {
          Stdio.println(e)      // ENOENT: ...
      }`)
  ]
});
