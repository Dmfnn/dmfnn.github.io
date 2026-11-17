Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-strings", order: 1, title: "Strings",
  summary: "String inspection, searching, slicing, padding, character classes and parsing.",
  blocks: [
    D.lead("Strings are immutable. Positions are zero-based and `substring` end positions are exclusive. Functions never modify their argument; they return a new string."),
    D.code('hasm', "import std.string.Strings as Strings", 'import'),
    D.module({
      name: "Strings", pkg: "std.string.Strings",
      summary: "String inspection, searching, slicing, padding, character classes and parsing.",
      groups: [
        { title: "Inspection", fns: [
          ["func bool isEmpty(string s)", "True when `s` is `null` or has no characters."],
          ["func bool isBlank(string s)", "True when `s` has no characters other than white space."],
          ["func int length(string s)", "Number of characters."]
        ] },
        { title: "Case and trimming", fns: [
          ["func string upper(string s)", "Upper-case copy."],
          ["func string lower(string s)", "Lower-case copy."],
          ["func string trim(string s)", "Copy without leading and trailing white space."],
          ["func string capitalize(string s)", "Upper-cases the first character and keeps the rest unchanged."]
        ] },
        { title: "Searching", fns: [
          ["func bool contains(string s, string part)", "True when `part` occurs in `s`."],
          ["func bool startsWith(string s, string prefix)", "True when `s` begins with `prefix`."],
          ["func bool endsWith(string s, string suffix)", "True when `s` ends with `suffix`."],
          ["func int indexOf(string s, string part)", "Position of the first occurrence of `part`, or `-1`."],
          ["func int lastIndexOf(string s, string part)", "Position of the last occurrence of `part`, or `-1`."],
          ["func int count(string s, string part)", "Number of non-overlapping occurrences of `part`. An empty `part` gives `0`."]
        ] },
        { title: "Slicing and rewriting", fns: [
          ["func string substring(string s, int start, int end)", "Characters from `start` up to, but not including, `end`."],
          ["func string tail(string s, int start)", "Everything from `start` to the end of the string."],
          ["func string replace(string s, string target, string replacement)", "Replaces every occurrence of `target` with `replacement`."],
          ["func string reverse(string s)", "The characters in reverse order."],
          ["func string repeat(string s, int n)", "`s` repeated `n` times."],
          ["func string truncate(string s, int max, string ellipsis)", "Shortens `s` to at most `max` characters; when it is cut, the result ends with `ellipsis` and still fits in `max`."]
        ] },
        { title: "Splitting and joining", fns: [
          ["func list<string> split(string s, string sep)", "Pieces of `s` separated by `sep`."],
          ["func string join(list<any> parts, string sep)", "Joins the elements of `parts`, converted to text, with `sep` between them."],
          ["func list<string> chars(string s)", "One-character strings, one per character."],
          ["func list<string> lines(string s)", "Lines of `s`; both `\\n` and `\\r\\n` end a line."],
          ["func list<string> words(string s)", "Non-empty pieces of `s` separated by spaces."]
        ] },
        { title: "Formatting", fns: [
          ["func string format(string pattern, list<any> args)", "Formats `args` according to `pattern`, using Java `String.format` conversions: `Strings.format(\"%d of %s\", [3, \"x\"])`. A bad pattern throws."],
          ["func string padLeft(string s, int width, string pad)", "Pads on the left with `pad` (one character) to exactly `width` characters; longer input is cut from the left."],
          ["func string padRight(string s, int width, string pad)", "Pads on the right with `pad` to `width` characters."],
          ["func string center(string s, int width, string pad)", "Centers `s` in `width` characters; the extra pad character goes to the right side."]
        ] },
        { title: "Characters", fns: [
          ["func bool isDigit(string c)", "True for a one-character string `0` to `9`."],
          ["func bool isUpper(string c)", "True for a one-character string `A` to `Z`."],
          ["func bool isLower(string c)", "True for a one-character string `a` to `z`."],
          ["func bool isAlpha(string c)", "True for an ASCII letter."],
          ["func bool isAlnum(string c)", "True for an ASCII letter or digit."],
          ["func bool isSpace(string c)", "True for space, tab, newline or carriage return."],
          ["func int code(string c)", "Character code of the first character."],
          ["func string fromCode(int code)", "The one-character string with the given code."]
        ] },
        { title: "Parsing", fns: [
          ["func int parseInt(string s, int fallback)", "Converts `s` to an integer, or returns `fallback` when it is not a number."],
          ["func float parseFloat(string s, float fallback)", "Converts `s` to a float, or returns `fallback` when it is not a number."],
          ["func bool isInt(string s)", "True when `s` converts to an integer."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-lists", order: 2, title: "Lists",
  summary: "Operations on `list<T>`: queries, copies, ordering, generation and numeric summaries.",
  blocks: [
    D.lead("The functions that change a list (`insert`, `sort`, ...) work in place and return nothing. Those that return a list (`sorted`, `slice`, `take`, ...) leave the original untouched. Ranges are half-open: the end index is exclusive."),
    D.code('hasm', "import std.collections.Lists as Lists", 'import'),
    D.module({
      name: "Lists", pkg: "std.collections.Lists",
      summary: "Operations on `list<T>`: queries, copies, ordering, generation and numeric summaries.",
      groups: [
        { title: "Queries", fns: [
          ["func int size(list<any> xs)", "Number of elements."],
          ["func bool isEmpty(list<any> xs)", "True when the list has no elements."],
          ["func bool contains(list<any> xs, any v)", "True when an element equals `v`."],
          ["func int indexOf(list<any> xs, any v)", "Index of the first element equal to `v`, or `-1`."],
          ["func int count(list<any> xs, any v)", "How many elements equal `v`."],
          ["func any first(list<any> xs)", "The first element. Throws `\"first() of an empty list\"` on an empty list."],
          ["func any last(list<any> xs)", "The last element. Throws `\"last() of an empty list\"` on an empty list."]
        ] },
        { title: "Copies and sub-lists", fns: [
          ["func list<any> copy(list<any> xs)", "Shallow copy."],
          ["func list<any> slice(list<any> xs, int from, int to)", "Elements from `from` up to, but not including, `to`."],
          ["func list<any> take(list<any> xs, int n)", "The first `n` elements, or all of them when the list is shorter."],
          ["func list<any> drop(list<any> xs, int n)", "Everything after the first `n` elements."],
          ["func list<any> concat(list<any> a, list<any> b)", "A new list with the elements of `a` followed by those of `b`."],
          ["func list<any> unique(list<any> xs)", "Copy without duplicates; the first occurrence of each value stays in place."],
          ["func string join(list<any> xs, string sep)", "Elements converted to text and joined with `sep`."]
        ] },
        { title: "Modifying in place", fns: [
          ["func void insert(list<any> xs, int index, any v)", "Inserts `v` before position `index`."],
          ["func any removeAt(list<any> xs, int index)", "Removes and returns the element at `index`."],
          ["func bool removeValue(list<any> xs, any v)", "Removes the first element equal to `v`; returns whether one was found."],
          ["func void sort(list<any> xs)", "Sorts ascending."],
          ["func void sortDescending(list<any> xs)", "Sorts descending."],
          ["func void reverseInPlace(list<any> xs)", "Reverses the order."],
          ["func void shuffle(list<any> xs)", "Randomises the order."]
        ] },
        { title: "Ordered copies", fns: [
          ["func list<any> sorted(list<any> xs)", "Ascending copy; the original is unchanged."],
          ["func list<any> reversed(list<any> xs)", "Reversed copy; the original is unchanged."]
        ] },
        { title: "Generating", fns: [
          ["func list<int> range(int start, int end)", "The integers `start` up to, but not including, `end`."],
          ["func list<int> rangeStep(int start, int end, int step)", "Integers from `start` towards `end` in steps of `step`, which may be negative. A step of `0` throws."],
          ["func list<any> fill(int n, any v)", "A list of `n` copies of `v`."]
        ] },
        { title: "Numeric lists", fns: [
          ["func int sum(list<int> xs)", "Sum of an integer list."],
          ["func float fsum(list<float> xs)", "Sum of a float list."],
          ["func int maxOf(list<int> xs)", "Largest integer."],
          ["func int minOf(list<int> xs)", "Smallest integer."],
          ["func float fmaxOf(list<float> xs)", "Largest float."],
          ["func float fminOf(list<float> xs)", "Smallest float."],
          ["func float average(list<float> xs)", "Arithmetic mean of a float list."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-maps", order: 3, title: "Maps",
  summary: "Operations on `map<K,V>`. Maps keep insertion order.",
  blocks: [
    D.lead("You can also read and write maps with `m[key]`. A missing key reads as `null`; use `getOr` when you need a default."),
    D.code('hasm', "import std.collections.Maps as Maps", 'import'),
    D.module({
      name: "Maps", pkg: "std.collections.Maps",
      summary: "Operations on `map<K,V>`. Maps keep insertion order.",
      groups: [
        { title: "Access", fns: [
          ["func int size(map<any,any> m)", "Number of entries."],
          ["func bool isEmpty(map<any,any> m)", "True when the map has no entries."],
          ["func bool has(map<any,any> m, any key)", "True when `key` is present."],
          ["func any get(map<any,any> m, any key)", "The value for `key`, or `null`."],
          ["func any getOr(map<any,any> m, any key, any fallback)", "The value for `key`, or `fallback` when the key is missing."]
        ] },
        { title: "Changing", fns: [
          ["func void put(map<any,any> m, any key, any value)", "Adds or replaces an entry."],
          ["func any remove(map<any,any> m, any key)", "Removes `key` and returns its value (or `null`)."],
          ["func void clear(map<any,any> m)", "Removes all entries."]
        ] },
        { title: "Views and copies", fns: [
          ["func list<any> keys(map<any,any> m)", "The keys, in insertion order."],
          ["func list<any> values(map<any,any> m)", "The values, in insertion order."],
          ["func map<any,any> copy(map<any,any> m)", "Shallow copy."],
          ["func map<any,any> merge(map<any,any> a, map<any,any> b)", "New map holding the entries of `a` and then those of `b`; `b` wins on conflicts."]
        ] }
      ]
    })
  ]
});

Docs.page({
  project: 'hasm', section: 'stdlib', id: "std-math", order: 4, title: "Math",
  summary: "Integer helpers, floating-point functions, rounding and random numbers.",
  blocks: [
    D.lead("Integer functions (`abs`, `gcd`, `pow`, ...) stay exact. Floating-point functions work on `float`. Rounding functions return an `int`."),
    D.code('hasm', "import std.math.Math as Math", 'import'),
    D.module({
      name: "Math", pkg: "std.math.Math",
      summary: "Integer helpers, floating-point functions, rounding and random numbers.",
      groups: [
        { title: "Constants", fns: [
          ["func float pi()", "The constant π."],
          ["func float e()", "Euler's number."],
          ["func float tau()", "2π."]
        ] },
        { title: "Integers", fns: [
          ["func int abs(int x)", "Absolute value."],
          ["func int sign(int x)", "`-1`, `0` or `1`."],
          ["func int min(int a, int b)", "Smaller of two values."],
          ["func int max(int a, int b)", "Larger of two values."],
          ["func int clamp(int v, int lo, int hi)", "Limits `v` to the range `lo` to `hi`."],
          ["func long pow(long base, int exp)", "Integer power as a `long`."],
          ["func int gcd(int a, int b)", "Greatest common divisor."],
          ["func int lcm(int a, int b)", "Least common multiple."],
          ["func long factorial(int n)", "n! as a `long`."],
          ["func bool isPrime(int n)", "True for a prime number."],
          ["func int isqrt(int n)", "Integer square root, rounded down."],
          ["func bool isEven(int n)", "True when divisible by 2."],
          ["func bool isOdd(int n)", "True when not divisible by 2."]
        ] },
        { title: "Floating point", fns: [
          ["func float fabs(float x)", "Absolute value."],
          ["func float fmin(float a, float b)", "Smaller of two values."],
          ["func float fmax(float a, float b)", "Larger of two values."],
          ["func float fclamp(float v, float lo, float hi)", "Limits `v` to the range `lo` to `hi`."],
          ["func float lerp(float a, float b, float t)", "Linear interpolation: `a + (b - a) * t`."],
          ["func bool approxEq(float a, float b, float eps)", "True when the values differ by at most `eps`."],
          ["func float sqrt(float x)", "Square root."],
          ["func float cbrt(float x)", "Cube root."],
          ["func float fpow(float b, float x)", "`b` raised to the power `x`."],
          ["func float exp(float x)", "e raised to `x`."],
          ["func float ln(float x)", "Natural logarithm."],
          ["func float log10(float x)", "Base-10 logarithm."],
          ["func float log2(float x)", "Base-2 logarithm."],
          ["func float hypot(float x, float y)", "Length of the hypotenuse, `sqrt(x*x + y*y)`."]
        ] },
        { title: "Trigonometry", fns: [
          ["func float sin(float x)", "Sine of an angle in radians."],
          ["func float cos(float x)", "Cosine."],
          ["func float tan(float x)", "Tangent."],
          ["func float asin(float x)", "Arc sine."],
          ["func float acos(float x)", "Arc cosine."],
          ["func float atan(float x)", "Arc tangent."],
          ["func float atan2(float y, float x)", "Angle of the point `(x, y)`."],
          ["func float toRadians(float deg)", "Degrees to radians."],
          ["func float toDegrees(float rad)", "Radians to degrees."]
        ] },
        { title: "Rounding", fns: [
          ["func int floor(float x)", "Largest integer not above `x`."],
          ["func int ceil(float x)", "Smallest integer not below `x`."],
          ["func int round(float x)", "Nearest integer."],
          ["func float roundTo(float x, int places)", "Rounds to `places` decimal places and returns a float."]
        ] },
        { title: "Random numbers", fns: [
          ["func float random()", "A float in the range 0 (inclusive) to 1 (exclusive)."],
          ["func int randomInt(int lo, int hi)", "A random integer from `lo` to `hi`, both inclusive. Throws when `lo` is greater than `hi`."],
          ["func void seed(long s)", "Makes the sequence repeatable."]
        ] }
      ]
    })
  ]
});
