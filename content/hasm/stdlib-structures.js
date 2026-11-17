Docs.page({
  project: 'hasm', section: 'stdlib', id: 'std-structures', order: 5, title: 'Structures',
  summary: 'Stack, Queue, Set and StringBuilder.',
  blocks: [
    D.lead('Four ready-made data structures. They are classes, so you create them with `new` and call methods on the object.'),
    D.code('hasm', `
      pkg demo.Main
      usingapi Stdio
      import std.collections.Structures as Structures

      @entry
      func void main() {
          Stack s = new Stack()
          s.push(1)
          s.push(2)
          Stdio.println(s.pop())          // 2

          StringBuilder sb = new StringBuilder()
          sb.append("a")
          sb.append("b")
          Stdio.println(sb.toString())    // ab
      }`, 'usage'),
    D.note('Elements are of type `any`. Assigning a value taken from a structure to a typed variable converts it implicitly. Operations that need an element on an empty structure throw a string error.'),
    D.module({
      kind: 'class', name: "Stack", pkg: 'std.collections.Structures',
      summary: "Last-in, first-out stack.",
      groups: [{ title: 'Methods', fns: [
        ["func void push(any v)", "Puts `v` on top."],
        ["func any pop()", "Removes and returns the top element. Throws `\"pop from an empty Stack\"` when empty."],
        ["func any peek()", "Returns the top element without removing it. Throws `\"peek on an empty Stack\"` when empty."],
        ["func int size()", "Number of elements."],
        ["func bool isEmpty()", "True when there are no elements."],
        ["func void clear()", "Removes all elements."]
      ] }]
    }),
    D.module({
      kind: 'class', name: "Queue", pkg: 'std.collections.Structures',
      summary: "First-in, first-out queue; enqueue and dequeue run in amortised constant time.",
      groups: [{ title: 'Methods', fns: [
        ["func void enqueue(any v)", "Adds `v` at the back."],
        ["func any dequeue()", "Removes and returns the front element. Throws `\"dequeue from an empty Queue\"` when empty."],
        ["func any peek()", "Returns the front element without removing it. Throws `\"peek on an empty Queue\"` when empty."],
        ["func int size()", "Number of elements."],
        ["func bool isEmpty()", "True when there are no elements."],
        ["func void clear()", "Removes all elements."]
      ] }]
    }),
    D.module({
      kind: 'class', name: "Set", pkg: 'std.collections.Structures',
      summary: "Insertion-ordered set of unique values.",
      groups: [{ title: 'Methods', fns: [
        ["func bool add(any v)", "Adds `v`; returns whether it was new."],
        ["func bool has(any v)", "True when `v` is in the set."],
        ["func bool remove(any v)", "Removes `v`; returns whether it was present."],
        ["func list<any> items()", "The members in insertion order."],
        ["func int size()", "Number of members."],
        ["func bool isEmpty()", "True when the set is empty."],
        ["func void clear()", "Removes all members."]
      ] }]
    }),
    D.module({
      kind: 'class', name: "StringBuilder", pkg: 'std.collections.Structures',
      summary: "Assembles a long string from many pieces without repeated copying.",
      groups: [{ title: 'Methods', fns: [
        ["func void append(string s)", "Adds `s` at the end."],
        ["func void appendLine(string s)", "Adds `s` followed by a newline."],
        ["func int length()", "Total number of characters appended so far."],
        ["func string toString()", "The assembled text."],
        ["func void clear()", "Discards the content."]
      ] }]
    })
  ]
});
