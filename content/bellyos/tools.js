Docs.page({
  project: 'bellyos', section: 'tools', id: 'tools', order: 1, title: 'Command-line tools',
  summary: 'The shell, the built-in commands and the tools in /bin.',
  blocks: [
    D.lead('On the console the login shell `/bin/sh` runs on the whole screen; the Terminal application runs the same shell inside a window. It parses commands, runs builtins, starts programs as jobs and connects them in pipelines.'),
    D.h2('Builtins'),
    D.table(['Command', 'Effect'], [
      ['`help`', 'List the commands.'],
      ['`echo`, `clear`, `pwd`, `cd`, `ls`, `cat`', 'Print text, clear the screen, show and change the directory, list and show files.'],
      ['`mkdir`, `touch`, `rm`, `cp`, `mv`, `write`', 'Create, delete, copy, move and write files.'],
      ['`chmod`, `stat`', 'Change and show file modes.'],
      ['`whoami`, `id`', 'Current user and numeric ids.'],
      ['`df`, `uname`, `getprop`, `uptime`', 'Storage, system version, build properties and uptime.'],
      ['`ps`, `jobs`, `kill`', 'Processes and jobs.'],
      ['`rotate`', 'Rotate the screen.'],
      ['`exit`, `logout`, `shutdown`, `reboot`', 'End the session, power off or restart.']
    ]),
    D.h2('Programs in /bin'),
    D.table(['Command', 'Use'], [
      ['`pm`', '`pm list` · `pm install <file.hpk>` · `pm remove <name>` · `pm run <name> [argument]` · `pm open <action> <data>`'],
      ['`setting`', '`setting list [prefix]` · `setting get <key>` · `setting set <key> <value>` (device owner; `true`/`false` for switches, numbers otherwise)'],
      ['`hello`, `greet`', 'Small examples: a greeting, and one that asks for a name on standard input.'],
      ['`grep`, `wc`, `upper`', 'Filters that read standard input, for use in pipelines.'],
      ['`counter`', 'Example of a program that keeps running.'],
      ['`crash`', 'Ends with an error, to see how failures are reported.']
    ]),
    D.h2('Writing a tool'),
    D.p('A console tool is a program with an `@entry` function. It reads standard input and writes standard output. An error that nobody catches ends it with a failure, which the shell reports.'),
    D.code('hasm', `
      pkg demo.tools.Shout
      usingapi Stdio

      @entry
      func int main(list<string> args) {
          string line = Stdio.readLine()
          while line != null {
              Stdio.println(line + "!")
              line = Stdio.readLine()
          }
          return 0
      }`, 'Shout.hasm'),
    D.p('Build it like any other program (see [Your first application](doc:first-app)), place it in `/bin` or package it and run it with `pm run`.')
  ]
});
