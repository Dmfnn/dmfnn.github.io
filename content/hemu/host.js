Docs.page({
  project: 'hemu', section: 'host', id: 'embedding-host', order: 1, title: 'Embedding in an application',
  summary: 'Implementing Display, delivering input and running the device in your own program.',
  blocks: [
    D.p('Everything the device needs from its host is small: a place to show frames, a source of input events and a directory for the images.'),
    D.h2('Display'),
    D.p('`Display` is the screen of the device. Guest programs never see it; they draw through `Screen` or `Surface` and the result arrives here as a `Frame`.'),
    D.table(['Method', 'Meaning'], [
      ['`int width()`, `int height()`', 'Size of the screen in pixels, in the current orientation.'],
      ['`Orientation orientation()`', 'Current orientation.'],
      ['`void setOrientation(Orientation)`', 'The device asks the host to rotate.'],
      ['`int measureText(String, int size, int style)`', 'Width of a text, so guests can lay it out.'],
      ['`void present(Frame)`', 'Show a finished frame.']
    ]),
    D.p('`present` is called on the scheduler thread. An implementation that renders on another thread must hand the frame over itself (keeping only the newest is fine) and must not block. A `Frame` is a list of draw commands; `Frame.paint(painter)` replays them into any `DrawCommand.Painter`, which is how the Android view renders them.'),
    D.code('java', `
      public final class MyDisplay implements Display {
          public int width()  { return 360; }
          public int height() { return 640; }
          public Orientation orientation() { return Orientation.PORTRAIT; }
          public void setOrientation(Orientation o) { /* rotate your view */ }
          public int measureText(String text, int size, int style) { return text.length() * size / 2; }
          public void present(Frame frame) { latest.set(frame); view.postInvalidate(); }
      }`),
    D.p('`RecordingDisplay` is a ready implementation that records frames without drawing. It is meant for tests and headless runs.'),
    D.h3('Draw commands'),
    D.p('`clear`, `fillRect`, `strokeRect`, `line`, `fillCircle`, `strokeCircle`, `fillRoundRect`, `strokeRoundRect`, `gradient`, `radialGradient`, `fillTriangle`, `arc`, `text`, `setClip` and `resetClip`. Colors are 32-bit ARGB integers.'),
    D.h2('Input'),
    D.p('Publish events to the `InputHub`. Programs that hold `Events` see them as maps.'),
    D.table(['Factory', 'Guest event type'], [
      ['`InputEvent.touch(TOUCH_DOWN | TOUCH_MOVE | TOUCH_UP, pointer, x, y, time)`', '`touch_down`, `touch_move`, `touch_up` with `pointer`, `x`, `y`'],
      ['`InputEvent.key(KEY_DOWN | KEY_UP, code, time)`', '`key_down`, `key_up` with `key`'],
      ['`InputEvent.text(text, time)`', '`text` with `text`'],
      ['`InputEvent.screenResized(w, h, time)`', '`screen_resized` with the new size']
    ]),
    D.p('Every subscriber receives every event. Each queue holds up to 1024 events by default; when a program does not keep up, the oldest are dropped.'),
    D.h2('Output'),
    D.p('Pass a `HasmOutput` to `boot`. It delivers what programs print and runtime diagnostics to your listeners. See [Embedding the runtime](doc:hasm/embedding) for the channels.'),
    D.h2('Closing'),
    D.p('`close()` powers the device off: it stops every process and flushes and unmounts both images. Use `try`-with-resources.')
  ]
});

Docs.page({
  project: 'hemu', section: 'host', id: 'android-app', order: 2, title: 'The Android application',
  summary: 'The reference host: managing devices, flashing partitions and running one.',
  blocks: [
    D.p('The `app` module is an Android application that hosts devices. It is also the reference for writing your own host.'),
    D.table(['Package', 'Role'], [
      ['`hemu.android.device`', '`DeviceSession` owns a running `Simulator`; `AndroidDisplay` and `DeviceView` render frames and translate touches and keys into events; `DeviceActivity` shows the screen; `LogBuffer` keeps the output.'],
      ['`hemu.android.storage`', '`StorageController` and helpers to create and open devices, and to import and export files.'],
      ['`hemu.android.panel`', 'The control panel: disk browser, partitions, firmware and tools. Each panel works on a device that is not running.'],
      ['`hemu.android.ui`', 'Shared dialogs and view helpers.']
    ]),
    D.h2('The control panel'),
    D.ul([
      'Browse `disk.img` and `devices.img` and move files between them and the phone.',
      'Flash, export and erase partitions.',
      'Lock and unlock the bootloader and see the verified-boot status.',
      'Start the device and watch its output.'
    ]),
    D.p('The panel works with the same host objects you use from Java: `Partitions`, `VolumeFiles` and `Firmware`.'),
    D.h2('Building'),
    D.code('bash', `
      ./gradlew :app:assembleDebug`),
    D.p('The native HVFS library is built with CMake as part of the Android build; the Java core is a plain Java library with no Android dependencies, so it also runs on a desktop JVM.')
  ]
});

Docs.page({
  project: 'hemu', section: 'host', id: 'testing', order: 3, title: 'Building and testing',
  summary: 'How the repository is organised and how to run the test suites.',
  blocks: [
    D.table(['Directory', 'Content'], [
      ['`core`', 'The Java emulator core: `Simulator`, storage, firmware, input, screen, IPC, processes, packages, updates.'],
      ['`hvfs`', 'The C++ file system with JNI bindings, a shell tool and native tests.'],
      ['`app`', 'The Android application.'],
      ['`hasm`', 'The HASM language implementation that runs guest programs.'],
      ['`examples`', 'Sample guest programs.'],
      ['`tests`', 'Test suites, with guest programs compiled by the HASM compiler.']
    ]),
    D.h2('Running the tests'),
    D.code('bash', `
      HASM_LIBS=/path/to/libs tests/run_tests.sh`),
    D.p('The suite runs the emulator core on real HVFS images with guest programs. It knows nothing about any particular operating system; the guest programs use a small support library from `tests/stdlib`. `HASM_LIBS` is required and points to the Java libraries the build needs (see `tests/lib/env.sh`).'),
    D.p('The same device can be exercised end to end by suites that flash a complete operating system into the images and drive it with input events and screen frames.')
  ]
});
