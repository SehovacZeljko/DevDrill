import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'Variables, Scope, and Hoisting',
    content: `JavaScript has three ways to declare a variable, and the differences between them are a frequent interview probe: \`var\` is **function-scoped** (or globally scoped if declared outside any function) and is **hoisted** with its declaration initialized to \`undefined\` before any code in its scope runs; \`let\` and \`const\` are **block-scoped** (confined to the nearest \`{}\`) and are hoisted but left in an uninitialized state — the **temporal dead zone** — until the line where they're actually declared executes, which is why accessing them earlier throws a \`ReferenceError\` rather than returning \`undefined\`.

\`\`\`javascript
console.log(a); // undefined — var is hoisted and initialized to undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;

if (true) {
  var x = 'function-scoped';   // leaks outside the if-block
  let y = 'block-scoped';      // confined to this block
}
console.log(x); // 'function-scoped'
console.log(y); // ReferenceError: y is not defined
\`\`\`

\`const\` additionally prevents reassignment of the binding itself (not the value it points to — a \`const\` array or object can still have its contents mutated, just not be reassigned to a different array or object entirely). The interview-relevant practical guidance: modern JavaScript style defaults to \`const\` everywhere, falling back to \`let\` only when a variable genuinely needs reassignment, and avoids \`var\` entirely — its function-scoping and hoisting-to-\`undefined\` behavior are a well-documented source of bugs that block scoping was specifically introduced to eliminate.`,
  },
  {
    title: 'Closures',
    content: `A closure is a function that retains access to variables from its enclosing lexical scope even after that outer scope has finished executing — the inner function "closes over" those variables rather than losing access to them once the outer function returns.

\`\`\`javascript
function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2 — count persisted between calls, even though makeCounter() already returned
\`\`\`

Each call to \`makeCounter()\` creates a fresh, independent \`count\` variable and a fresh closure over it — calling \`makeCounter()\` again produces a completely separate counter starting from 0, since each invocation gets its own scope. This is the mechanism behind private state in JavaScript before classes had private fields: a closure variable is inaccessible from outside the function entirely, accessible only through whatever functions were defined within that same scope and returned.

A classic interview pitfall demonstrates closures capturing variables by reference, not by value at creation time:

\`\`\`javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // logs 3, 3, 3 — all three closures share the same \`i\`
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0); // logs 0, 1, 2 — \`let\` creates a new binding per iteration
}
\`\`\`

\`var\`'s function-scoping means all three callbacks close over the single, shared \`i\`, which has finished looping (and equals 3) by the time any \`setTimeout\` callback actually runs; \`let\`'s per-iteration block scoping gives each loop iteration its own \`j\`, so each closure captures a distinct value — understanding this distinction cold is one of the most common JavaScript interview checkpoints.`,
  },
  {
    title: 'The "this" Keyword and Binding Rules',
    content: `\`this\` in JavaScript is not statically tied to where a function is defined — it's determined by **how the function is called**, which is a major source of confusion coming from languages where \`this\`/\`self\` is always bound to the enclosing object lexically.

The four binding rules, from lowest to highest precedence: **default binding** (a plain function call — \`this\` is \`undefined\` in strict mode, or the global object otherwise); **implicit binding** (calling a function as a method on an object — \`obj.method()\` — binds \`this\` to \`obj\`); **explicit binding** (\`call\`, \`apply\`, or \`bind\` set \`this\` directly, regardless of how the function is later invoked); and **\`new\` binding** (calling a function with \`new\` binds \`this\` to the newly created object).

\`\`\`javascript
const obj = {
  name: 'Alice',
  greet() { return \`Hi, \${this.name}\`; },
};
const fn = obj.greet;
obj.greet();        // "Hi, Alice" — implicit binding, this = obj
fn();                // throws or "Hi, undefined" — this lost when called standalone
fn.call(obj);         // "Hi, Alice" — explicit binding restores this
const bound = fn.bind(obj);
bound();              // "Hi, Alice" — permanently bound, regardless of how it's called later
\`\`\`

**Arrow functions** don't have their own \`this\` at all — they capture \`this\` lexically from their enclosing scope at definition time, exactly like a regular variable, which is precisely why arrow functions are the standard fix for "losing \`this\`" when passing a method as a callback (e.g. inside \`setTimeout\` or an event handler) without needing an explicit \`.bind()\` call.`,
  },
  {
    title: 'Equality: == vs. ===',
    content: `\`===\` (strict equality) compares both value and type with no conversion — two values are only \`===\` if they're already the same type and have the same value. \`==\` (loose equality) performs **type coercion** before comparing, converting one or both operands to a common type according to a specific, occasionally surprising set of rules.

\`\`\`javascript
1 === 1;        // true
1 === '1';      // false — different types, no coercion
1 == '1';       // true  — '1' coerced to 1 before comparing
0 == false;     // true  — false coerced to 0
null == undefined; // true — special-cased to be loosely equal to each other only
null === undefined; // false
'' == 0;        // true  — '' coerced to 0
[] == false;    // true  — [] coerced to '' then to 0
\`\`\`

The coercion rules behind \`==\` are genuinely non-intuitive in edge cases (the empty array example above surprises most developers), which is why the near-universal style guidance is to always use \`===\`/\`!==\` and avoid \`==\`/\`!=\` entirely — eliminating an entire category of subtle bugs caused by unexpected coercion, at essentially no cost since explicit type conversion (\`Number(x)\`, \`String(x)\`) is always available when conversion is actually intended.

The one conventional exception some style guides allow: \`== null\`, which loosely matches both \`null\` and \`undefined\` in one check — a deliberate, narrow use of the coercion rule rather than a broad endorsement of \`==\`.`,
  },
  {
    title: 'Primitive Types and Type Coercion',
    content: `JavaScript has seven primitive types — \`string\`, \`number\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\`, and \`bigint\` — and everything else (objects, arrays, functions) is an object. Primitives are compared and copied **by value**; objects are compared and copied **by reference**.

\`\`\`javascript
let a = 5;
let b = a;
b = 10;
console.log(a); // 5 — primitives are copied by value, b is independent of a

let obj1 = { x: 5 };
let obj2 = obj1;
obj2.x = 10;
console.log(obj1.x); // 10 — obj1 and obj2 reference the same object
\`\`\`

JavaScript performs **implicit type coercion** in many operators, most notoriously \`+\`: if either operand is a string, \`+\` performs string concatenation rather than numeric addition; other arithmetic operators (\`-\`, \`*\`, \`/\`) always coerce both operands toward numbers.

\`\`\`javascript
1 + '1';   // '11' — string concatenation
1 - '1';   // 0    — '1' coerced to a number
'5' * '2'; // 10   — both coerced to numbers
true + 1;  // 2    — true coerced to 1
[] + [];   // ''   — arrays coerced to strings via toString()
\`\`\`

The interview-relevant discipline: rather than memorizing every coercion edge case, the practical takeaway is to coerce explicitly and predictably (\`Number(x)\`, \`String(x)\`, \`Boolean(x)\`, or template literals for string conversion) wherever a type isn't already guaranteed, rather than relying on JavaScript's implicit rules — which is also why TypeScript (covered in its own lesson set) exists largely to catch these coercion mismatches at compile time instead of runtime.`,
  },
  {
    title: 'Functions: Declarations, Expressions, and Arrow Functions',
    content: `JavaScript has several ways to define a function, with meaningfully different hoisting and \`this\`-binding behavior. A **function declaration** is fully hoisted — both its name and its implementation are available anywhere in the enclosing scope, even before the line where it's written. A **function expression** (assigning a function to a variable) is only hoisted as far as the variable declaration rules allow (\`var\`-hoisted to \`undefined\`, or in the temporal dead zone for \`let\`/\`const\`) — the function itself isn't callable until that line executes.

\`\`\`javascript
sayHi(); // works — function declarations are fully hoisted
function sayHi() { console.log('hi'); }

sayBye(); // TypeError: sayBye is not a function (still undefined at this point)
var sayBye = function () { console.log('bye'); };
\`\`\`

**Arrow functions** (\`(x) => x * 2\`) are always expressions, never hoisted as callable, and — as covered in the \`this\`-binding lesson — don't have their own \`this\`, \`arguments\`, or \`super\`, inheriting all of these lexically from the enclosing scope instead.

\`\`\`javascript
const double = (x) => x * 2;            // implicit return, single expression
const add = (x, y) => { return x + y; }; // explicit return needed with a block body
\`\`\`

The interview-relevant distinctions to keep straight: use function declarations when hoisting is genuinely useful (e.g. mutually recursive top-level functions); use arrow functions for callbacks where lexical \`this\` is desired or where conciseness matters; avoid arrow functions as object methods when the method needs its own dynamic \`this\` bound to the calling object, since an arrow function method would instead capture \`this\` from the surrounding scope at definition time — almost never what's intended for a method.`,
  },
  {
    title: 'Arrays and Common Array Methods',
    content: `JavaScript arrays are dynamically-sized, can hold mixed types, and come with a large standard library of higher-order methods that, in modern style, are strongly preferred over manual \`for\` loops for clarity and to avoid off-by-one and mutation bugs.

\`\`\`javascript
const nums = [1, 2, 3, 4, 5];
nums.map(n => n * 2);              // [2, 4, 6, 8, 10] — transform each element
nums.filter(n => n % 2 === 0);     // [2, 4] — keep elements matching a predicate
nums.reduce((sum, n) => sum + n, 0); // 15 — fold into a single accumulated value
nums.find(n => n > 3);              // 4 — first matching element, or undefined
nums.some(n => n > 4);              // true — at least one element matches
nums.every(n => n > 0);             // true — all elements match
nums.forEach(n => console.log(n));  // side-effect iteration, no return value
\`\`\`

A critical distinction interviewers probe: which methods **mutate the original array** versus return a **new array**. \`map\`, \`filter\`, \`slice\`, \`concat\` all return new arrays, leaving the original untouched; \`push\`, \`pop\`, \`splice\`, \`sort\`, \`reverse\` mutate the original array in place. Mixing these up — assuming \`sort()\` returns a new sorted array without affecting the original — is a frequent source of subtle bugs, especially when the same array reference is used elsewhere in the codebase and unexpectedly changes underneath another piece of code.

\`\`\`javascript
const original = [3, 1, 2];
const sorted = original.sort(); // mutates original AND returns the same reference
console.log(original); // [1, 2, 3] — original was mutated, not left alone
\`\`\``,
  },
  {
    title: 'Objects, Destructuring, and the Spread Operator',
    content: `JavaScript objects are unordered collections of key-value pairs (with one caveat: integer-like keys are iterated in numeric order before string keys, in insertion order) and form the basis of almost every non-primitive data structure in the language.

**Destructuring** extracts values from objects or arrays into individual variables concisely, with support for default values and renaming:

\`\`\`javascript
const user = { id: 1, name: 'Alice', role: 'admin' };
const { name, role: userRole = 'guest' } = user;
// name = 'Alice', userRole = 'admin' (renamed from "role", default unused since role exists)

const [first, second, ...rest] = [1, 2, 3, 4];
// first = 1, second = 2, rest = [3, 4]
\`\`\`

The **spread operator** (\`...\`) expands an iterable's elements (arrays, strings, or an object's own enumerable properties) in place — commonly used for creating shallow copies and merging:

\`\`\`javascript
const original = { a: 1, b: 2 };
const updated = { ...original, b: 3, c: 4 }; // { a: 1, b: 3, c: 4 } — later keys override earlier ones
const combined = [...arr1, ...arr2];          // concatenated array, new reference
\`\`\`

The interview-relevant caveat for both destructuring and spread: they only produce **shallow** copies — nested objects/arrays inside the copied structure are still shared by reference with the original, so mutating a nested object reached through a "copy" still mutates the original's nested data too. Deep cloning requires either a recursive copy, \`structuredClone()\` (a modern built-in), or a library — spread/destructuring alone are not deep-clone tools, a common misconception.`,
  },
  {
    title: 'Asynchronous JavaScript: Callbacks, Promises, async/await',
    content: `JavaScript is single-threaded but handles asynchronous operations (network requests, timers, file I/O in Node) without blocking that single thread, evolving through three syntactic generations that all ultimately compile down to the same underlying event loop mechanism.

**Callbacks** were the original pattern — pass a function to be invoked when an async operation completes — but deeply nested callbacks ("callback hell") become hard to read and error-handle correctly. **Promises** represent a value that will eventually resolve or reject, with \`.then()\`/\`.catch()\` chains replacing nested callbacks with a flatter, more composable structure.

\`\`\`javascript
fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

**async/await** (built on top of Promises, not a separate mechanism) lets asynchronous code be written and read like synchronous code, while still being fully non-blocking under the hood:

\`\`\`javascript
async function getData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
\`\`\`

An \`async\` function always returns a Promise (wrapping its return value, or its thrown error as a rejection), and \`await\` only pauses execution *within that async function* — it doesn't block the rest of the program, since the JavaScript engine is free to run other code while waiting for the awaited Promise to settle. The interview-relevant point: async/await is syntactic sugar over Promises, not a competing mechanism — understanding Promises underneath is necessary to correctly reason about error handling, parallel execution (\`Promise.all\`), and what's actually happening when multiple \`await\`s appear in sequence versus in parallel.`,
  },
  {
    title: 'The Event Loop',
    content: `JavaScript's single thread executes one call stack at a time, but achieves non-blocking concurrency through the **event loop** — a continuously running process that coordinates the call stack, a queue of pending callbacks, and the browser/Node APIs that perform actual async work outside the JavaScript thread (timers, network requests, file I/O).

\`\`\`text
Call Stack: executes synchronous code, one frame at a time
Web/Node APIs: timers, fetch, fs — run outside the JS thread, push callbacks into queues on completion
Microtask Queue: Promise .then/.catch callbacks, queue.microtask
Macrotask (Task) Queue: setTimeout, setInterval, I/O callbacks
\`\`\`

The event loop's core algorithm: run the call stack until empty, then drain the **entire microtask queue** (every Promise callback currently queued, including any new ones added while draining), and only then take a single task from the macrotask queue, push it onto the call stack, run it to completion, and repeat — this is why Promise callbacks always run before the next \`setTimeout\` callback, even if the timeout was scheduled first and with a delay of 0.

\`\`\`javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2 — synchronous code first, then ALL microtasks, then macrotasks
\`\`\`

The interview-relevant mental model: "asynchronous" in JavaScript doesn't mean "runs on another thread" — it means "runs later, after the current synchronous code and all pending microtasks finish," all on the same single thread — which is why a long-running synchronous computation (e.g. a tight loop with no awaits) blocks everything, including timers and UI rendering, until it completes.`,
  },
  {
    title: 'Prototypes and Prototypal Inheritance',
    content: `Every JavaScript object has an internal link to another object called its **prototype**, and property lookups that don't find a property on the object itself automatically continue up this **prototype chain** until the property is found or the chain ends at \`null\` — this is the actual mechanism behind inheritance in JavaScript, even when using the more familiar \`class\` syntax.

\`\`\`javascript
const animal = { eats: true };
const rabbit = Object.create(animal); // rabbit's prototype is animal
rabbit.jumps = true;

console.log(rabbit.jumps); // true — own property
console.log(rabbit.eats);  // true — found via the prototype chain, not an own property
console.log(Object.getPrototypeOf(rabbit) === animal); // true
\`\`\`

The \`class\` keyword (covered in its own lesson) is syntactic sugar over this same prototype mechanism — a class's methods are placed on the prototype object shared by every instance (not copied individually onto each instance), which is why methods defined in a class body are memory-efficient (one shared copy) compared to assigning a function directly to \`this\` inside a constructor (a separate copy per instance).

\`\`\`javascript
class Animal {
  constructor(name) { this.name = name; } // own property, per-instance
  speak() { return \`\${this.name} makes a sound\`; } // on Animal.prototype, shared by all instances
}
\`\`\`

The interview-relevant framing: JavaScript's object model is fundamentally prototypal, not classical — \`class\` syntax provides a more familiar, structured way to set up prototype chains, but understanding the underlying chain (and that property lookups walk up it, that \`hasOwnProperty\` distinguishes own vs. inherited properties) explains behavior that purely classical-inheritance intuition wouldn't predict.`,
  },
  {
    title: 'Template Literals and String Methods',
    content: `Template literals (backtick-delimited strings) support **interpolation** (\`\${expression}\`) and multi-line strings without explicit \`\\n\` characters, replacing the more verbose concatenation style for building dynamic strings.

\`\`\`javascript
const name = 'Alice';
const greeting = \`Hello, \${name}! You have \${1 + 2} new messages.\`;
// "Hello, Alice! You have 3 new messages." — any expression can be interpolated, not just variables

const multiLine = \`Line one
Line two\`; // preserves the literal newline, no \\n needed
\`\`\`

Common string methods worth fluency in: \`.includes()\`, \`.startsWith()\`, \`.endsWith()\` for substring checks (clearer than \`.indexOf() !== -1\`); \`.slice()\` for extracting substrings (supports negative indices counting from the end, unlike \`.substring()\`); \`.split()\`/\`.join()\` for converting between strings and arrays; \`.trim()\` for removing leading/trailing whitespace; and \`.padStart()\`/\`.padEnd()\` for fixed-width formatting.

\`\`\`javascript
'Hello'.includes('ell');     // true
'Hello'.slice(-3);           // 'llo' — negative index counts from the end
'a,b,c'.split(',');          // ['a', 'b', 'c']
['a', 'b', 'c'].join('-');   // 'a-b-c'
'5'.padStart(3, '0');        // '005'
\`\`\`

A subtlety worth noting: strings in JavaScript are **immutable** — every string method that appears to "modify" a string actually returns a new string, leaving the original unchanged, exactly analogous to the array-mutation distinction covered in the arrays lesson, just with no mutating methods at all on the string side.`,
  },
  {
    title: 'JSON: Serialization and Parsing',
    content: `JSON (JavaScript Object Notation) is a text-based data format for representing structured data, used pervasively for API request/response bodies, configuration files, and storage — \`JSON.stringify()\` converts a JavaScript value into a JSON string, and \`JSON.parse()\` converts a JSON string back into a JavaScript value.

\`\`\`javascript
const user = { id: 1, name: 'Alice', active: true, roles: ['admin', 'editor'] };
const json = JSON.stringify(user);
// '{"id":1,"name":"Alice","active":true,"roles":["admin","editor"]}'

const parsed = JSON.parse(json);
// back to a plain object — but note: parsed is NOT === user, it's a new object with equal contents
\`\`\`

JSON's type system is more limited than JavaScript's: it supports objects, arrays, strings, numbers, booleans, and \`null\`, but has **no representation for** \`undefined\`, functions, \`Symbol\`, \`Map\`/\`Set\`, or \`Date\` objects (a \`Date\` gets stringified to an ISO string, which then comes back as a plain string, not a \`Date\`, when parsed — a frequent real-world gotcha). \`JSON.stringify\` silently omits object properties with \`undefined\` values and converts \`undefined\` array elements to \`null\`.

\`\`\`javascript
JSON.stringify({ a: undefined, b: () => {}, c: 1 }); // '{"c":1}' — a and b silently dropped
JSON.stringify([undefined, 1]);                       // '[null,1]' — undefined becomes null in arrays
\`\`\`

A common, lazy-but-imperfect "deep clone" pattern — \`JSON.parse(JSON.stringify(obj))\` — works for plain data but silently loses or corrupts anything outside JSON's type system (functions vanish, \`Date\`s become strings, \`undefined\` values disappear), which is exactly why the interview-relevant guidance is to use \`structuredClone()\` or an explicit recursive clone for genuinely arbitrary data, reserving the JSON round-trip trick for data that's already known to be JSON-safe.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Execution Context and the Call Stack in Depth',
    content: `Every time a function is invoked, JavaScript creates a new **execution context** — containing the function's local variables, its own \`this\` binding, a reference to the outer (enclosing) scope, and the arguments passed in — and pushes it onto the **call stack**, a last-in-first-out structure tracking which function is currently executing and which functions are waiting for it to return.

\`\`\`javascript
function third() { console.log('in third'); }
function second() { third(); }
function first() { second(); }
first();
// Call stack grows: first() → second() → third()
// Then unwinds in reverse as each function returns: third() done → second() done → first() done
\`\`\`

A **stack overflow** occurs when the call stack exceeds its size limit, almost always from unbounded recursion (a recursive function with no correctly-terminating base case, or one whose base case is never reached due to a logic error) — each recursive call adds another execution context to the stack without any returning, until the engine's fixed stack size limit is hit.

The interview-relevant deeper point: JavaScript engines do **not**, in general, perform tail-call optimization in practice across most current engines (despite it being specified in ES2015) — meaning even a "properly" tail-recursive function written assuming TCO will eliminate stack growth can still overflow on deep recursion in real-world JavaScript environments, which is why iterative rewrites (using an explicit loop or an accumulator-based trampoline pattern) are the practical, portable fix for deep recursion in JavaScript, rather than relying on tail-call optimization the way one might in languages where it's reliably implemented.`,
  },
  {
    title: 'Memory Management and Garbage Collection',
    content: `JavaScript manages memory automatically via **garbage collection** — the engine periodically identifies objects no longer reachable from any root reference (global variables, currently executing function scopes) and frees their memory, so developers don't manually allocate and free memory as in C/C++.

The dominant algorithm in modern engines is **mark-and-sweep**: starting from root references, the garbage collector recursively marks every reachable object, then sweeps away (frees) every object that wasn't marked — critically, this means **reference cycles** (object A references object B, and B references A, but neither is reachable from any root) are correctly collected, unlike a naive reference-counting approach which would leak such cycles forever.

\`\`\`javascript
function createLeak() {
  let largeData = new Array(1000000).fill('x');
  someGlobalCache.push(() => console.log(largeData.length)); // closure keeps largeData alive
}
// largeData is NOT garbage collected as long as someGlobalCache holds a reference to the closure
// that closes over it — even though createLeak() itself has long since returned
\`\`\`

The most common practical source of memory leaks in long-running JavaScript applications (especially Node servers and single-page apps) isn't a missing manual \`free()\` call — it's **unintentionally retained references**: event listeners never removed, closures captured into a long-lived cache or global array, or detached DOM nodes still referenced by JavaScript variables even after being removed from the document — in every case, the garbage collector is working correctly, it's just that something is still holding a reference, so the object remains "reachable" and is never collected.

The interview-relevant debugging approach: browser/Node heap snapshot tools (Chrome DevTools' Memory tab, Node's \`--inspect\`) let you compare heap snapshots over time to find objects that keep growing in count or retained size, then trace their retaining references back to the actual leak source — understanding mark-and-sweep is what makes "what's still referencing this" the right question to ask, rather than looking for a missing deallocation call that JavaScript simply doesn't have.`,
  },
  {
    title: 'Promise Combinators: all, allSettled, race, any',
    content: `Beyond chaining a single Promise with \`.then()\`, JavaScript provides four static combinator methods for coordinating multiple Promises concurrently, each with distinct semantics for how it resolves, rejects, and handles partial failure.

\`\`\`javascript
Promise.all([p1, p2, p3]);
// resolves with an array of all results, IN ORDER, once every promise resolves
// rejects immediately with the first rejection reason if ANY promise rejects — others are abandoned

Promise.allSettled([p1, p2, p3]);
// always resolves (never rejects) with an array of { status, value } or { status, reason } per promise
// use when you need every result regardless of individual failures

Promise.race([p1, p2, p3]);
// settles (resolves or rejects) as soon as the FIRST promise settles, whatever its outcome

Promise.any([p1, p2, p3]);
// resolves with the first promise to FULFILL; only rejects if ALL promises reject
\`\`\`

The most consequential distinction for real-world use is \`Promise.all\` vs. \`Promise.allSettled\`: \`Promise.all\` is appropriate when every operation is required to succeed for the overall result to be meaningful (e.g. fetching a user and their required permissions — partial data isn't useful), while \`Promise.allSettled\` is appropriate when partial success is acceptable and you want to know which specific operations succeeded or failed (e.g. sending notifications to five independent services where one failing shouldn't prevent processing the other four's results).

A common mistake: using \`Promise.all\` when partial failure should be tolerated causes the *entire* batch to be treated as failed the moment any single item rejects, silently discarding the results of operations that actually succeeded — recognizing which combinator semantics match the actual requirement is the interview-relevant skill, not just knowing the four names exist.`,
  },
  {
    title: 'Debouncing and Throttling',
    content: `Debouncing and throttling are two distinct strategies for limiting how often a function executes in response to a rapidly-firing event (scroll, resize, keystroke, mousemove) — both improve performance by reducing redundant work, but with different timing guarantees.

**Debouncing** delays execution until a specified quiet period has passed with no further triggering calls — each new call resets the timer, so the function only actually runs once activity has fully stopped (e.g. a search-as-you-type input that waits until the user pauses typing before firing an API request, rather than firing on every keystroke).

\`\`\`javascript
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
const debouncedSearch = debounce(searchApi, 300);
// rapid calls reset the timer each time; searchApi only fires 300ms after the LAST call
\`\`\`

**Throttling** guarantees execution at most once per specified interval, regardless of how many times the triggering event fires — useful when you need periodic updates *during* continuous activity rather than only after it stops (e.g. updating a scroll-position indicator at most every 100ms while the user scrolls continuously, rather than only once scrolling fully stops).

\`\`\`javascript
function throttle(fn, interval) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn(...args);
    }
  };
}
\`\`\`

The interview-relevant decision: debounce when you only care about the *final* state after activity settles (search input, form validation while typing); throttle when you need *periodic* feedback throughout ongoing activity (scroll handlers, drag handlers, mousemove tracking) — picking the wrong one produces a function that either fires far too often (no debounce on a search box hammering an API on every keystroke) or feels unresponsive (throttling something that should only react once activity fully stops).`,
  },
  {
    title: 'Currying and Function Composition',
    content: `**Currying** transforms a function taking multiple arguments into a sequence of functions, each taking a single argument, returning a new function until all arguments have been supplied — enabling **partial application**, where a curried function can be invoked with fewer than its full argument list to produce a specialized function for later use.

\`\`\`javascript
const add = (a) => (b) => (c) => a + b + c;
add(1)(2)(3); // 6

const add5 = add(5); // partially applied — "remembers" a = 5
add5(10)(20); // 35 — equivalent to add(5)(10)(20)
\`\`\`

**Function composition** combines multiple single-argument functions into one, where the output of each becomes the input of the next — a fundamental pattern in functional-style JavaScript for building complex transformations out of small, individually testable pieces.

\`\`\`javascript
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const double = (x) => x * 2;
const increment = (x) => x + 1;
const doubleThenIncrement = compose(increment, double);
doubleThenIncrement(5); // 11 — double(5) = 10, then increment(10) = 11
\`\`\`

The interview-relevant practical value beyond academic interest: currying and composition encourage writing small, single-purpose, easily-testable functions and combining them declaratively rather than writing one large function handling every concern inline — a style heavily used in functional libraries (Lodash's \`curry\`, Ramda) and in patterns like Redux middleware, where composing several independent pieces of behavior into one pipeline is a recurring real-world need, not just a theoretical exercise.`,
  },
  {
    title: 'Generators and Iterators',
    content: `An **iterator** is any object implementing a \`next()\` method that returns \`{ value, done }\`, and an **iterable** is any object implementing \`Symbol.iterator\` (returning an iterator) — this is the protocol that powers \`for...of\`, spread syntax, and destructuring over arrays, strings, \`Map\`s, and \`Set\`s uniformly.

**Generator functions** (\`function*\`) provide a much simpler way to create iterators: calling a generator function doesn't run its body immediately — it returns a generator object (which is both an iterator and iterable), and each call to \`.next()\` resumes execution until the next \`yield\`, pausing again with that yielded value.

\`\`\`javascript
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

for (const n of range(1, 3)) {
  console.log(n); // 1, 2, 3 — for...of automatically drives the iterator protocol
}

const it = range(1, 3);
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }
\`\`\`

Generators are especially valuable for **lazily producing infinite or very large sequences** without computing the entire sequence upfront — a generator can yield values one at a time, on demand, computing each only when \`.next()\` is actually called, which is impossible with an eagerly-computed array for an infinite sequence.

\`\`\`javascript
function* naturalNumbers() {
  let n = 1;
  while (true) { yield n++; } // infinite, but only ever computes as many values as are consumed
}
\`\`\`

The interview-relevant connection worth knowing: \`async\`/\`await\` and async generators (\`async function*\`, consumed via \`for await...of\`) extend this same pause-and-resume model to asynchronous sequences (e.g. paginated API results, streaming data), and understanding plain generators first is what makes that extension intuitive rather than mysterious.`,
  },
  {
    title: 'The Proxy Object and Metaprogramming',
    content: `\`Proxy\` wraps a target object and lets you intercept and customize fundamental operations on it — property access, assignment, deletion, function calls — by supplying **trap** handlers, enabling metaprogramming patterns that aren't otherwise possible in plain JavaScript.

\`\`\`javascript
const target = { name: 'Alice' };
const proxy = new Proxy(target, {
  get(obj, prop) {
    console.log(\`Accessing property: \${String(prop)}\`);
    return prop in obj ? obj[prop] : \`No such property: \${String(prop)}\`;
  },
  set(obj, prop, value) {
    console.log(\`Setting \${String(prop)} = \${value}\`);
    obj[prop] = value;
    return true;
  },
});

proxy.name;       // logs "Accessing property: name", returns 'Alice'
proxy.age = 30;    // logs "Setting age = 30"
proxy.missing;     // logs the access, returns "No such property: missing" instead of undefined
\`\`\`

Real-world uses of \`Proxy\` include validation (intercept \`set\` to reject invalid values before they're written), reactive state systems (frameworks like Vue 3 use \`Proxy\` internally to detect when reactive state is read or mutated, triggering re-renders), default values for missing properties, and logging/debugging wrappers around object access without modifying the target object's own code.

\`Reflect\` is the companion built-in providing the default implementations of the same operations \`Proxy\` traps intercept (\`Reflect.get\`, \`Reflect.set\`, etc.) — trap handlers commonly call the corresponding \`Reflect\` method to delegate to default behavior after performing custom logic, rather than manually reimplementing it, which is why \`obj[prop] = value\` inside the \`set\` trap above could equivalently (and more robustly, especially with inheritance involved) be written as \`Reflect.set(obj, prop, value)\`.`,
  },
  {
    title: 'Symbols and Well-Known Symbols',
    content: `\`Symbol\` is a primitive type introduced to create guaranteed-unique property keys — every call to \`Symbol()\` produces a distinct value, even with the identical description string, making symbols useful for adding properties to an object that won't collide with any string-keyed property, including ones added later by other code.

\`\`\`javascript
const sym1 = Symbol('id');
const sym2 = Symbol('id');
sym1 === sym2; // false — always unique, regardless of description

const obj = { [sym1]: 'hidden value' };
Object.keys(obj);              // [] — symbol-keyed properties are excluded from normal enumeration
JSON.stringify(obj);            // '{}' — also excluded from JSON serialization
obj[sym1];                      // 'hidden value' — still accessible if you have the symbol reference
\`\`\`

**Well-known symbols** are built-in symbols the JavaScript engine itself uses to customize core language behavior — \`Symbol.iterator\` (covered in the generators/iterators lesson) is the most commonly encountered, but others include \`Symbol.toPrimitive\` (customizes how an object converts to a primitive value, e.g. in \`+\` or template literal interpolation) and \`Symbol.toStringTag\` (customizes what \`Object.prototype.toString.call(obj)\` reports).

\`\`\`javascript
class Money {
  constructor(amount) { this.amount = amount; }
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.amount;
    if (hint === 'string') return \`$\${this.amount.toFixed(2)}\`;
    return this.amount;
  }
}
const price = new Money(19.5);
\`Total: \${price}\`;  // "Total: $19.50" — string hint
+price;                // 19.5 — number hint
\`\`\`

The interview-relevant takeaway: symbols exist specifically to give the language (and library authors) a way to hook into object behavior or add non-colliding metadata without polluting or risking collisions in the normal string-keyed property namespace — a niche but occasionally essential tool, especially when implementing custom iterables or libraries meant to interoperate safely with arbitrary user code.`,
  },
  {
    title: 'WeakMap and WeakSet',
    content: `\`WeakMap\` and \`WeakSet\` are collections whose keys (for \`WeakMap\`) or values (for \`WeakSet\`) must be objects, and crucially, those references are **weak** — holding an object as a key in a \`WeakMap\` does not prevent that object from being garbage collected if no other strong reference to it exists elsewhere in the program.

\`\`\`javascript
let user = { name: 'Alice' };
const cache = new WeakMap();
cache.set(user, { lastAccessed: Date.now() });

user = null; // the only strong reference to the original object is gone
// the WeakMap entry for it can now be garbage collected automatically — no manual cleanup needed
\`\`\`

This makes \`WeakMap\` ideal for attaching auxiliary, private, or cached data to objects without risking a memory leak — a regular \`Map\` used the same way would keep every key object alive forever (since the \`Map\` itself holds a strong reference), even after the rest of the program has no other reason to keep that object around, which is exactly the kind of unintentional-retention memory leak covered in the garbage collection lesson.

\`WeakMap\`/\`WeakSet\` deliberately omit \`.size\`, iteration (\`.forEach\`, \`for...of\`), and \`.clear()\` — their contents can change unpredictably at any moment as garbage collection runs, so any operation that would expose "what's currently in here" could give inconsistent, GC-timing-dependent results, which is why the API surface is intentionally minimal: \`get\`, \`set\`, \`has\`, \`delete\` only.

A common real-world use case: a library wanting to associate metadata with DOM elements or objects passed in by user code, without preventing those elements/objects from being garbage collected once the user's own code drops its references to them — using a regular \`Map\` for this would silently leak memory for the lifetime of the page/process.`,
  },
  {
    title: 'Modules: ES Modules vs. CommonJS',
    content: `JavaScript has two competing module systems in widespread use: **CommonJS** (\`require\`/\`module.exports\`, Node.js's original system) and **ES Modules** (\`import\`/\`export\`, the language-standard system supported natively in browsers and modern Node).

\`\`\`javascript
// CommonJS
const fs = require('fs');
module.exports = { readConfig };

// ES Modules
import fs from 'fs';
export { readConfig };
export default someFunction;
\`\`\`

A fundamental structural difference: ES Module imports/exports are **statically analyzable** — the set of imports and exports is determined at parse time, before any code runs, which is what enables **tree-shaking** (bundlers can determine exactly which exports are actually used and exclude unused code from the final bundle) and **live bindings** (an imported value reflects updates to the original exported variable, not a one-time snapshot taken at import time). CommonJS's \`require()\` is a regular function call that can be conditional or dynamic, executed at runtime, which is more flexible but prevents the same static analysis.

\`\`\`javascript
// CommonJS — require can be conditional, evaluated at runtime
if (condition) {
  const mod = require('./moduleA');
} else {
  const mod = require('./moduleB');
}
// ES Modules — import statements must be static and top-level (dynamic import() exists separately)
\`\`\`

CommonJS modules are also **cached and evaluated synchronously** the first time they're required (subsequent \`require\` calls for the same module return the cached \`module.exports\` object without re-running the module body), while ES Modules support both static imports and an asynchronous \`import()\` expression for dynamic, on-demand loading. The interview-relevant practical reality: most modern JavaScript tooling and Node.js itself have converged on ES Modules as the standard going forward, with CommonJS interoperability layers existing mainly to support the large existing ecosystem of CommonJS packages during the transition.`,
  },
  {
    title: 'Strict Mode and Common Pitfalls It Prevents',
    content: `\`'use strict'\` (automatically applied inside ES Modules and \`class\` bodies, optional elsewhere) changes several pieces of JavaScript's default behavior to convert silent mistakes into thrown errors and remove some genuinely confusing legacy semantics.

\`\`\`javascript
'use strict';
x = 5; // ReferenceError: x is not defined (without strict mode, this silently creates a global)

function f() { console.log(this); }
f(); // undefined in strict mode (without it, this defaults to the global object)

const obj = Object.freeze({ a: 1 });
obj.a = 2; // throws in strict mode (silently fails, no error, without strict mode)

function dup(a, a) { } // SyntaxError in strict mode — duplicate parameter names are disallowed
\`\`\`

Each of these strict-mode changes targets a specific historical footgun: accidental global variable creation from a typo'd assignment (one of the most infamous sources of hard-to-trace bugs in non-strict code), \`this\` defaulting to the global object in a plain function call (a frequent source of accidentally polluting global state), and silent failures on operations that should clearly be errors (assigning to a frozen object, assigning to a read-only property) being surfaced immediately instead of failing invisibly somewhere else, much later.

The interview-relevant context: strict mode isn't an optional style preference to debate — virtually all modern JavaScript is strict mode by default (any code inside an ES Module, any code inside a \`class\` body, and the vast majority of code processed by modern bundlers/transpilers), so understanding what strict mode changes is really understanding the actual default behavior of the language as written today, with non-strict "sloppy mode" relevant mainly for explaining why certain old, non-modular scripts behave differently.`,
  },
  {
    title: 'Tagged Template Literals',
    content: `A **tagged template literal** lets a function intercept and process a template literal's parts before producing the final value — written by placing a function name directly before a template literal, the function receives the literal's string segments and interpolated values separately, rather than receiving a single already-concatenated string.

\`\`\`javascript
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? \`**\${values[i]}**\` : '';
    return result + str + value;
  }, '');
}

const name = 'Alice';
const age = 30;
highlight\`Name: \${name}, Age: \${age}\`;
// "Name: **Alice**, Age: **30**" — the tag function controls exactly how interpolated values are inserted
\`\`\`

\`strings\` (the first argument) is an array of the literal text segments between interpolations, plus a \`strings.raw\` property containing those same segments *without* escape sequences processed (e.g. \`\\n\` stays as the two literal characters backslash-n, rather than becoming an actual newline) — useful for tools that need the literal source text exactly as written, such as regex builders or templating systems.

Real-world uses include styled-components and similar CSS-in-JS libraries (the \`css\`/\`styled\` tag processes the template into actual stylesheet rules), GraphQL query builders (the \`gql\` tag parses the template into a query AST), and automatic HTML-escaping for safe interpolation into HTML strings (a tag function that escapes each interpolated value before inserting it, preventing injection if any interpolated value comes from untrusted input) — the interview-relevant takeaway is that tagged templates are the mechanism enabling several widely-used libraries' signature syntax, not just a rarely-used language curiosity.`,
  },
];

export function seedJavaScriptLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['javascript']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  FUNDAMENTALS_LESSONS.forEach((lesson, index) => {
    db.execute(
      'INSERT INTO lesson (category_id, level, title, content_markdown, sort_order, created_at) VALUES (?, 1, ?, ?, ?, ?)',
      [categoryId, lesson.title, lesson.content, index, CREATED_AT],
    );
  });

  ADVANCED_LESSONS.forEach((lesson, index) => {
    db.execute(
      'INSERT INTO lesson (category_id, level, title, content_markdown, sort_order, created_at) VALUES (?, 2, ?, ?, ?, ?)',
      [categoryId, lesson.title, lesson.content, index, CREATED_AT],
    );
  });
}
