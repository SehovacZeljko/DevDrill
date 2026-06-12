import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedJavaScriptQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['javascript']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between var, let, and const?',
      answer: `\`var\` is function-scoped and hoisted to the top of its enclosing function, which means it can be accessed before its declaration (as \`undefined\`). \`let\` and \`const\` are block-scoped and are not initialized during hoisting, creating a "temporal dead zone." \`const\` additionally requires an initializer and prevents reassignment of the binding, though it does not make objects immutable.

\`\`\`js
var x = 1;
if (true) {
  var x = 2;   // same variable — overwrites outer x
  let y = 3;   // block-scoped — only visible here
  const z = 4; // block-scoped, can't be reassigned
}
console.log(x); // 2
console.log(y); // ReferenceError
\`\`\`

Prefer \`const\` by default, use \`let\` when reassignment is needed, and avoid \`var\` in modern code.`,
      difficulty: 1,
      tags: 'scoping,hoisting,es6',
    },
    {
      title: 'What is a closure and how is it used?',
      answer: `A closure is a function that retains access to its lexical scope even when executed outside of that scope. Every function in JavaScript forms a closure over the variables in scope at the time it was defined.

\`\`\`js
function makeCounter() {
  let count = 0;
  return function increment() {
    count += 1;
    return count;
  };
}
const counter = makeCounter();
counter(); // 1
counter(); // 2
\`\`\`

Closures are used for data encapsulation, partial application, factory functions, and maintaining state in callbacks. They are a fundamental mechanism behind module patterns and React hooks like \`useState\`.`,
      difficulty: 2,
      tags: 'closures,scope,functions',
    },
    {
      title: 'How does the JavaScript event loop work?',
      answer: `JavaScript is single-threaded. The event loop is the mechanism that allows it to perform non-blocking I/O by offloading operations to the browser or Node.js runtime and processing the results when the call stack is empty.

**Execution order:**
1. Synchronous code runs on the **call stack**
2. **Microtask queue** is drained completely after each task (Promises, \`queueMicrotask\`)
3. One task from the **macrotask queue** is processed (\`setTimeout\`, \`setInterval\`, I/O)
4. Repeat

\`\`\`js
console.log('1');
setTimeout(() => console.log('3'), 0);
Promise.resolve().then(() => console.log('2'));
// Output: 1, 2, 3
\`\`\`

Understanding this order is critical for predicting async code behavior.`,
      difficulty: 2,
      tags: 'async,event-loop,concurrency',
    },
    {
      title: 'What is prototypal inheritance in JavaScript?',
      answer: `Every JavaScript object has an internal \`[[Prototype]]\` link to another object. When a property lookup fails on an object, the engine traverses the prototype chain until it finds the property or reaches \`null\`.

\`\`\`js
const animal = { breathes: true };
const dog = Object.create(animal);
dog.bark = function() { return 'woof'; };

console.log(dog.breathes); // true — inherited from animal
console.log(Object.getPrototypeOf(dog) === animal); // true
\`\`\`

ES6 \`class\` syntax is syntactic sugar over this mechanism. Under the hood, \`class Dog extends Animal\` sets up the prototype chain between \`Dog.prototype\` and \`Animal.prototype\`.`,
      difficulty: 2,
      tags: 'prototype,inheritance,oop',
    },
    {
      title: 'What is the difference between == and === in JavaScript?',
      answer: `\`==\` performs **abstract equality comparison**, which coerces operands to the same type before comparing. \`===\` performs **strict equality comparison** — no coercion, both value and type must match.

\`\`\`js
0 == false   // true  (false coerced to 0)
0 === false  // false (different types)
'' == false  // true  (both coerced to 0)
null == undefined // true (special rule)
null === undefined // false
\`\`\`

Always prefer \`===\` to avoid subtle bugs from implicit coercion. The only common exception is \`value == null\`, which safely checks for both \`null\` and \`undefined\`.`,
      difficulty: 1,
      tags: 'equality,coercion,operators',
    },
    {
      title: 'How do Promises work and what problem do they solve?',
      answer: `A Promise represents the eventual result of an asynchronous operation. It solves callback hell by providing a chainable, composable abstraction for async code.

A Promise is in one of three states: **pending**, **fulfilled**, or **rejected**. Once settled it never changes state.

\`\`\`js
fetch('/api/user')
  .then(response => response.json())
  .then(user => console.log(user.name))
  .catch(err => console.error(err))
  .finally(() => setLoading(false));

// Composing multiple promises
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
]);
\`\`\`

Key static methods: \`Promise.all\` (fails fast), \`Promise.allSettled\` (waits for all), \`Promise.race\` (first settled wins), \`Promise.any\` (first fulfilled wins).`,
      difficulty: 2,
      tags: 'promises,async,es6',
    },
    {
      title: 'What is async/await and how does it relate to Promises?',
      answer: `\`async/await\` is syntactic sugar over Promises. An \`async\` function always returns a Promise. \`await\` pauses execution inside the async function until the awaited Promise settles, then resumes with the resolved value.

\`\`\`js
async function loadUser(id) {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) throw new Error('Not found');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
\`\`\`

Under the hood this is equivalent to chained \`.then()\` calls. Error handling uses standard \`try/catch\`. Avoid sequential \`await\` for independent operations — use \`Promise.all\` to keep them parallel.`,
      difficulty: 1,
      tags: 'async,await,promises',
    },
    {
      title: 'What is hoisting in JavaScript?',
      answer: `Hoisting is JavaScript's behavior of moving declarations to the top of their scope during the compilation phase, before code executes. Only declarations are hoisted — initializations are not.

\`\`\`js
console.log(x); // undefined (not ReferenceError)
var x = 5;

greet(); // works — function declarations are fully hoisted
function greet() { console.log('hello'); }

sayHi(); // ReferenceError — let/const are hoisted but not initialized
const sayHi = () => console.log('hi');
\`\`\`

\`var\` declarations are hoisted and initialized to \`undefined\`. \`let\`/\`const\` are hoisted but remain uninitialized in the temporal dead zone. Function declarations are hoisted with their full body; function expressions are not.`,
      difficulty: 1,
      tags: 'hoisting,scoping,var',
    },
    {
      title: 'What is the difference between null and undefined?',
      answer: `\`undefined\` means a variable has been declared but not yet assigned a value. It is the default value of uninitialized variables, missing function arguments, and absent object properties. \`null\` is an explicit assignment meaning "no value" — a deliberate empty state.

\`\`\`js
let a;
console.log(a);             // undefined
console.log(a === undefined); // true

const user = { name: 'Ana', address: null };
console.log(user.address);  // null — intentionally empty
console.log(user.phone);    // undefined — property doesn't exist

typeof null;      // 'object' (historic bug in JS)
typeof undefined; // 'undefined'
\`\`\`

Use \`null\` to explicitly reset a value. Never assign \`undefined\` manually — let the engine produce it naturally.`,
      difficulty: 1,
      tags: 'null,undefined,types',
    },
    {
      title: 'How do arrow functions differ from regular functions?',
      answer: `Arrow functions differ in four key ways:

1. **No own \`this\`** — they inherit \`this\` lexically from the enclosing scope. Regular functions bind \`this\` at call time.
2. **No \`arguments\` object** — use rest parameters (\`...args\`) instead.
3. **Cannot be used as constructors** — calling \`new ArrowFn()\` throws.
4. **No \`prototype\` property**.

\`\`\`js
class Timer {
  constructor() { this.seconds = 0; }

  start() {
    // arrow function captures 'this' from start()
    setInterval(() => {
      this.seconds += 1;
    }, 1000);
  }
}
\`\`\`

Use arrow functions for callbacks and short expressions where lexical \`this\` is desirable. Use regular functions for methods that need their own \`this\`, generators, or constructors.`,
      difficulty: 2,
      tags: 'arrow-functions,this,es6',
    },
    {
      title: 'What are the different data types in JavaScript?',
      answer: `JavaScript has two categories of types. **Primitive types** are immutable and stored by value: \`String\`, \`Number\`, \`BigInt\`, \`Boolean\`, \`Undefined\`, \`Null\`, and \`Symbol\`. **Non-primitive types** (objects) are mutable and stored by reference: plain objects, arrays, functions, and built-ins like \`Map\` and \`Set\`.

\`\`\`js
typeof 'hello'     // 'string'
typeof 42          // 'number'
typeof true        // 'boolean'
typeof undefined   // 'undefined'
typeof null        // 'object' (historic JS bug)
typeof {}          // 'object'
typeof []          // 'object'
typeof function(){} // 'function'
\`\`\`

Use \`Array.isArray()\` to distinguish arrays from plain objects, and \`instanceof\` or \`Object.prototype.toString\` for other checks. \`typeof null === 'object'\` is a well-known quirk that cannot be changed.`,
      difficulty: 1,
      tags: 'data-types,primitives,typeof',
    },
    {
      title: 'What is NaN and how do isNaN() and Number.isNaN() differ?',
      answer: `\`NaN\` (Not-a-Number) is a numeric value representing an invalid arithmetic result. Confusingly, \`typeof NaN === 'number'\`. \`NaN\` is the only value in JavaScript that is not equal to itself.

\`isNaN(value)\` coerces its argument to a number first, then checks — so \`isNaN('hello')\` returns \`true\` even though \`'hello'\` is a string, not \`NaN\`. \`Number.isNaN(value)\` (ES6) does **no coercion** and returns \`true\` only for the actual \`NaN\` value.

\`\`\`js
isNaN('hello')        // true  (coercion: Number('hello') → NaN)
Number.isNaN('hello') // false (no coercion)
Number.isNaN(NaN)     // true
NaN === NaN           // false — use Number.isNaN() or Object.is()
\`\`\`

Always prefer \`Number.isNaN()\` in modern code.`,
      difficulty: 1,
      tags: 'nan,type-checking,primitives',
    },
    {
      title: 'What is the difference between pass-by-value and pass-by-reference?',
      answer: `JavaScript is strictly **pass-by-value** for all types. For primitives, a copy of the value is passed. For objects, the value that is copied is the **reference** (memory address) — so it appears to be pass-by-reference, but it is actually passing the reference by value.

\`\`\`js
function mutatePrimitive(n) { n = 99; }
let x = 1;
mutatePrimitive(x);
console.log(x); // 1 — unchanged

function mutateObject(obj) { obj.name = 'changed'; }
let user = { name: 'Alice' };
mutateObject(user);
console.log(user.name); // 'changed' — same object in memory

function replaceObject(obj) { obj = {}; } // reassigning local reference
replaceObject(user);
console.log(user.name); // still 'changed' — original unchanged
\`\`\`

The key insight: reassigning the parameter inside a function never affects the caller's variable; mutating properties of an object does.`,
      difficulty: 2,
      tags: 'memory,pass-by-value,pass-by-reference',
    },
    {
      title: 'What is an IIFE and what problem does it solve?',
      answer: `An **IIFE** (Immediately Invoked Function Expression) is a function that is defined and called in a single expression. It creates a private scope, preventing variables from leaking into the outer (often global) scope.

\`\`\`js
(function () {
  var privateVar = 'hidden';
  console.log(privateVar); // 'hidden'
})();

console.log(typeof privateVar); // 'undefined' — not accessible outside

// Arrow function IIFE
(() => {
  const config = loadConfig();
  init(config);
})();
\`\`\`

IIFEs were the primary module pattern before ES6 modules. Today they're still useful for: isolating initialization logic, avoiding variable pollution in scripts loaded without a bundler, and wrapping async entry points (\`(async () => { await main(); })()\`).`,
      difficulty: 2,
      tags: 'iife,scope,functions',
    },
    {
      title: 'What is strict mode and what does it enforce?',
      answer: `Strict mode (\`"use strict"\`) enables a stricter variant of JavaScript that catches common bugs by turning silent errors into thrown errors and disabling some confusing features.

**Key restrictions:**
- Assigning to undeclared variables throws \`ReferenceError\`
- Deleting non-configurable properties throws \`TypeError\`
- Duplicate parameter names are forbidden
- \`this\` inside a plain function call is \`undefined\` (not the global object)
- \`with\` statement is forbidden

\`\`\`js
'use strict';
x = 5; // ReferenceError: x is not defined

function fn() { return this; }
fn(); // undefined (not window/global)
\`\`\`

ES6 modules and classes are always in strict mode automatically. For legacy scripts or functions, add the directive at the top of the file or function.`,
      difficulty: 1,
      tags: 'strict-mode,best-practices,errors',
    },
    {
      title: 'What are Higher Order Functions?',
      answer: `A higher-order function (HOF) is a function that **takes another function as an argument** and/or **returns a function**. They are the foundation of functional programming patterns in JavaScript.

\`\`\`js
// Takes a function as argument
[1, 2, 3].map(n => n * 2);       // [2, 4, 6]
[1, 2, 3].filter(n => n > 1);    // [2, 3]
[1, 2, 3].reduce((acc, n) => acc + n, 0); // 6

// Returns a function
function multiplier(factor) {
  return (n) => n * factor;
}
const double = multiplier(2);
const triple = multiplier(3);
double(5); // 10
triple(5); // 15
\`\`\`

HOFs enable abstraction, code reuse, and composition. Common examples: \`Array.prototype.map/filter/reduce\`, event listeners (\`addEventListener\` accepts a callback), middleware in Express, and React's \`useCallback\`.`,
      difficulty: 2,
      tags: 'functional-programming,higher-order-functions,callbacks',
    },
    {
      title: 'How does the "this" keyword work in JavaScript?',
      answer: `\`this\` refers to the object that is the current execution context. Its value is determined **at call time**, not definition time (except for arrow functions, which capture \`this\` lexically).

\`\`\`js
const obj = {
  name: 'Alice',
  greet() { return this.name; },     // this = obj
  greetArrow: () => this?.name,      // this = outer scope (undefined in module)
};

obj.greet();             // 'Alice'
const fn = obj.greet;
fn();                    // undefined (strict) or global (sloppy)
fn.call({ name: 'Bob' }); // 'Bob' — explicit binding
\`\`\`

**Rules (in priority order):** 1) \`new\` binding creates a new object. 2) Explicit binding via \`call\`/\`apply\`/\`bind\`. 3) Implicit binding — the object before the dot. 4) Default binding — global or \`undefined\` (strict). Arrow functions bypass all rules and use the lexical \`this\`.`,
      difficulty: 2,
      tags: 'this-keyword,context,binding',
    },
    {
      title: 'What is the difference between call(), apply(), and bind()?',
      answer: `All three explicitly set the \`this\` context of a function. They differ in when the function is invoked and how arguments are passed.

- \`call(thisArg, arg1, arg2, ...)\` — invokes immediately, arguments listed individually
- \`apply(thisArg, [arg1, arg2, ...])\` — invokes immediately, arguments as an array
- \`bind(thisArg, arg1, ...)\` — returns a **new function** with \`this\` permanently bound, does not call immediately

\`\`\`js
function greet(greeting, punctuation) {
  return \`\${greeting}, \${this.name}\${punctuation}\`;
}
const user = { name: 'Alice' };

greet.call(user, 'Hello', '!');      // 'Hello, Alice!'
greet.apply(user, ['Hi', '.']);      // 'Hi, Alice.'
const boundGreet = greet.bind(user, 'Hey');
boundGreet('?');                     // 'Hey, Alice?'
\`\`\`

Mnemonic: **C**all = **C**omma-separated, **A**pply = **A**rray. Use \`bind\` for creating callbacks with a fixed context (e.g., event handlers in class components).`,
      difficulty: 2,
      tags: 'call,apply,bind,context,functions',
    },
    {
      title: 'What is currying and how do you implement it?',
      answer: `Currying transforms a function that takes multiple arguments into a sequence of functions each taking one argument. It enables **partial application** — pre-filling some arguments to create specialized functions.

\`\`\`js
// Manual currying
function add(a) {
  return function (b) {
    return a + b;
  };
}
const add5 = add(5);
add5(3); // 8

// Generic curry helper
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
}

const multiply = curry((a, b, c) => a * b * c);
multiply(2)(3)(4); // 24
multiply(2, 3)(4); // 24
\`\`\`

Currying is common in functional libraries (lodash, Ramda). It helps build pipelines and reusable utility functions by locking in configuration before applying to data.`,
      difficulty: 2,
      tags: 'functional-programming,currying,partial-application',
    },
    {
      title: 'What is memoization and how do you implement it?',
      answer: `Memoization caches the return value of a pure function based on its arguments. On subsequent calls with the same arguments, it returns the cached result instead of recomputing, trading memory for speed.

\`\`\`js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalc = memoize((n) => {
  console.log('computing...');
  return n * n;
});

expensiveCalc(5); // computing... 25
expensiveCalc(5); // 25 (from cache, no log)
\`\`\`

Only memoize pure functions (same input always produces same output). React's \`useMemo\` and \`useCallback\` apply this concept within the component render cycle.`,
      difficulty: 2,
      tags: 'performance,caching,pure-functions',
    },
    {
      title: 'What is recursion and when should you use it?',
      answer: `Recursion is when a function calls itself until a base case is reached. It's natural for problems with **self-similar structure**: tree traversal, factorial, Fibonacci, parsing nested data.

\`\`\`js
function factorial(n) {
  if (n <= 1) return 1;       // base case
  return n * factorial(n - 1); // recursive case
}
factorial(5); // 120

// Flatten nested array (tree-like structure)
function flatten(arr) {
  return arr.reduce((acc, item) =>
    Array.isArray(item) ? acc.concat(flatten(item)) : acc.concat(item),
  []);
}
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
\`\`\`

**Pitfalls:** Deep recursion causes stack overflow. Iterative approaches or tail-call-optimized code can prevent this. For large trees, consider an explicit stack (iterative DFS). JavaScript's TCO (tail call optimization) is only reliably implemented in Safari as of 2026.`,
      difficulty: 2,
      tags: 'recursion,algorithms,stack',
    },
    {
      title: 'What is the DOM?',
      answer: `The **Document Object Model (DOM)** is a programming interface that represents an HTML or XML document as a tree of objects. Each HTML element, attribute, and text node becomes a **node** in the tree that can be read, created, modified, or deleted via JavaScript.

\`\`\`js
// Selecting elements
const btn = document.getElementById('submit');
const items = document.querySelectorAll('.list-item');

// Modifying the DOM
btn.textContent = 'Loading...';
btn.disabled = true;

// Creating nodes
const newDiv = document.createElement('div');
newDiv.className = 'card';
newDiv.innerHTML = '<h2>Title</h2>';
document.body.appendChild(newDiv);

// Removing
newDiv.remove();
\`\`\`

DOM manipulation is the way JavaScript makes web pages interactive. However, direct DOM access is slow because it can trigger layout reflow and repaint. Libraries like React abstract DOM updates through a virtual DOM to minimize expensive operations.`,
      difficulty: 1,
      tags: 'dom,web-apis,browser',
    },
    {
      title: 'What is event delegation?',
      answer: `Event delegation attaches a **single event listener to a parent element** instead of one per child. Events fire on the target and then bubble up through ancestors, so the parent handler can detect which child was clicked via \`event.target\`.

\`\`\`js
// Without delegation: 100 listeners for 100 items
items.forEach(item => item.addEventListener('click', handleClick));

// With delegation: 1 listener on the parent
document.getElementById('list').addEventListener('click', (event) => {
  const item = event.target.closest('li');
  if (!item) return;
  console.log('Clicked:', item.dataset.id);
});
\`\`\`

**Benefits:**
- Less memory usage (one listener vs. many)
- Works automatically for dynamically added children
- Simplifies attach/detach logic

Use \`event.target.closest(selector)\` to safely find the intended element even if the user clicks a nested child element.`,
      difficulty: 2,
      tags: 'event-delegation,performance,dom,bubbling',
    },
    {
      title: 'What is the difference between prototypal and classical inheritance?',
      answer: `**Classical inheritance** (Java, C++) is based on classes — a class defines a blueprint, and instances are created from it. Inheritance is achieved by subclassing.

**Prototypal inheritance** (JavaScript) is based on objects linking to other objects. When a property is not found on an object, the engine walks up the **prototype chain** until it finds it or reaches \`null\`.

\`\`\`js
// Prototypal (ES5 style)
const animal = { breathes: true, describe() { return 'I breathe'; } };
const dog = Object.create(animal); // dog's prototype = animal
dog.bark = () => 'woof';
dog.breathes; // true — found on animal

// ES6 class syntax (syntactic sugar over prototypal)
class Animal { describe() { return 'I breathe'; } }
class Dog extends Animal { bark() { return 'woof'; } }
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true
\`\`\`

Classical inheritance says "a Dog IS an Animal." Prototypal inheritance says "a dog DELEGATES to an animal prototype." JavaScript's \`class\` syntax is pure syntactic sugar — under the hood it still uses prototype chains.`,
      difficulty: 3,
      tags: 'inheritance,prototypes,oop,classical',
    },
    {
      title: 'What is the Temporal Dead Zone (TDZ)?',
      answer: `The **Temporal Dead Zone** is the period between the start of a block scope and the point where a \`let\` or \`const\` variable is declared. During this window the variable is hoisted (the engine knows it exists) but is **not initialized**, so any access throws a \`ReferenceError\`.

\`\`\`js
{
  // TDZ starts here for 'x'
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 5;      // TDZ ends here
  console.log(x); // 5
}

// var has NO TDZ — hoisted and initialized to undefined
console.log(y); // undefined
var y = 5;
\`\`\`

The TDZ exists to catch bugs caused by using variables before they are set up. Function declarations are fully hoisted (no TDZ). \`class\` declarations also have a TDZ, just like \`let\`/\`const\`.`,
      difficulty: 2,
      tags: 'tdz,hoisting,let-const,scope',
    },
    {
      title: 'What is a Generator function and how does yield work?',
      answer: `A generator function (declared with \`function*\`) returns an **iterator** — an object with a \`next()\` method. Each call to \`next()\` resumes execution from where it last paused at a \`yield\` expression. Generators maintain their internal state between calls.

\`\`\`js
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i; // pause and emit value
  }
}

const gen = range(1, 3);
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Use in for...of
for (const n of range(1, 5)) console.log(n); // 1 2 3 4 5
\`\`\`

Generators enable **lazy evaluation** (values on demand), infinite sequences, and are the foundation \`async/await\` is built upon internally. They're also useful for implementing custom iteration protocols.`,
      difficulty: 2,
      tags: 'generators,iterator,es6,lazy-evaluation',
    },
    {
      title: 'What is the difference between Map and WeakMap?',
      answer: `Both store key-value pairs but differ in key types, garbage collection, and available operations.

**\`Map\`:** Any value (including primitives) can be a key. Keys are held with **strong references** — the map keeps them alive. Iterable, has a \`size\` property.

**\`WeakMap\`:** Keys must be **objects**. Keys are held with **weak references** — if no other reference to the key object exists, it is garbage-collected and the entry silently disappears. Not iterable, no \`size\`.

\`\`\`js
let obj = { name: 'cache key' };
const weakMap = new WeakMap();
weakMap.set(obj, 'some data');
console.log(weakMap.get(obj)); // 'some data'

obj = null; // the key object can now be garbage collected
// weakMap entry is eventually removed automatically
\`\`\`

Use \`WeakMap\` for **caching data tied to object lifetime** (e.g., storing private class data, DOM node metadata) where automatic cleanup on object GC is desirable.`,
      difficulty: 2,
      tags: 'map,weakmap,memory,gc,collections',
    },
    {
      title: 'What are Proxy and Reflect?',
      answer: `A \`Proxy\` wraps an object and intercepts fundamental operations (property get, set, delete, function calls) through **traps**. \`Reflect\` provides the default implementations of those same operations, used inside traps to fall through to normal behavior.

\`\`\`js
const handler = {
  get(target, key, receiver) {
    console.log(\`Getting \${key}\`);
    return Reflect.get(target, key, receiver); // default behavior
  },
  set(target, key, value, receiver) {
    if (typeof value !== 'number') throw new TypeError('Numbers only');
    return Reflect.set(target, key, value, receiver);
  },
};

const nums = new Proxy({}, handler);
nums.x = 42;    // OK
nums.x;         // logs "Getting x", returns 42
nums.y = 'bad'; // TypeError: Numbers only
\`\`\`

Use cases: validation, logging, reactive data (Vue 3's reactivity is Proxy-based), access control, and mocking in tests. Proxies are powerful but add a small performance overhead on every intercepted operation.`,
      difficulty: 3,
      tags: 'proxy,reflect,metaprogramming,es6',
    },
    {
      title: 'What is Symbol and what problem does it solve?',
      answer: `\`Symbol()\` creates a **guaranteed-unique, immutable primitive**. No two Symbol calls return the same value, even with the same description. Symbols are primarily used as object property keys that will never clash with string keys or other symbols.

\`\`\`js
const id = Symbol('id');
const obj = { [id]: 123, name: 'Alice' };

obj[id];              // 123
Object.keys(obj);     // ['name'] — Symbol keys are hidden from enumeration
JSON.stringify(obj);  // '{"name":"Alice"}' — Symbols excluded

// Well-known symbols hook into language protocols
class EvenNumbers {
  [Symbol.iterator]() {
    let n = 0;
    return { next: () => ({ value: (n += 2), done: false }) };
  }
}
for (const n of new EvenNumbers()) { if (n > 6) break; console.log(n); } // 2 4 6
\`\`\`

Built-in symbols (\`Symbol.iterator\`, \`Symbol.toPrimitive\`, \`Symbol.hasInstance\`) let you customize how objects interact with language features.`,
      difficulty: 2,
      tags: 'symbol,es6,unique,iteration',
    },
    {
      title: 'What is the difference between for...of and for...in?',
      answer: `\`for...in\` iterates over all **enumerable string property keys** of an object, including inherited ones from the prototype chain. It's intended for plain objects.

\`for...of\` iterates over **iterable values** — arrays, strings, Maps, Sets, generators, or any object implementing \`Symbol.iterator\`. It gives you the values, not the keys.

\`\`\`js
const arr = [10, 20, 30];
for (const key in arr)   console.log(key);   // '0', '1', '2' (string keys)
for (const val of arr)   console.log(val);   // 10, 20, 30

const obj = { a: 1, b: 2 };
for (const key in obj)   console.log(key);   // 'a', 'b'
// for...of on plain object throws: obj is not iterable

// for...in includes prototype properties — usually guard with hasOwnProperty
for (const key in obj) {
  if (Object.hasOwn(obj, key)) console.log(key, obj[key]);
}
\`\`\`

**Rule of thumb:** Use \`for...of\` for sequences/arrays; use \`Object.keys/entries\` + \`for...of\` for objects.`,
      difficulty: 1,
      tags: 'for-of,for-in,iteration,loops',
    },
    {
      title: 'What are Rest parameters and how do they differ from the arguments object?',
      answer: `**Rest parameters** (\`...args\`) collect all remaining function arguments into a **real Array**. The **\`arguments\` object** is an array-like (but not an array) that contains all arguments passed to a non-arrow function.

\`\`\`js
function withRest(first, ...rest) {
  console.log(first); // 1
  console.log(rest);  // [2, 3, 4] — a real Array
  rest.map(n => n * 2); // works — it's an Array
}
withRest(1, 2, 3, 4);

function withArguments() {
  console.log(arguments);       // { 0:1, 1:2, 2:3 } — array-like
  // arguments.map(...)         // TypeError — not an Array
  Array.from(arguments).map(n => n * 2); // must convert first
}
\`\`\`

**Key differences:**
- Rest params are real arrays; \`arguments\` is array-like
- Rest params are available in arrow functions; \`arguments\` is not
- Rest params only collect the "rest"; \`arguments\` captures everything
- Rest params are cleaner and preferred in modern code`,
      difficulty: 1,
      tags: 'rest,spread,arguments,es6,functions',
    },
    {
      title: 'What is optional chaining (?.) and nullish coalescing (??) in ES2020?',
      answer: `**Optional chaining (\`?.\`)** short-circuits property access, method calls, and subscripts to \`undefined\` when the left side is \`null\` or \`undefined\`, instead of throwing a \`TypeError\`.

**Nullish coalescing (\`??\`)** returns the right operand only when the left is \`null\` or \`undefined\`. Unlike \`||\`, it does **not** treat \`0\`, \`''\`, or \`false\` as fallback triggers.

\`\`\`js
const user = null;
user?.profile?.name;       // undefined (no error)
user?.address?.city;       // undefined
user?.getAge?.();          // undefined (optional method call)

// ?? vs ||
const port = 0;
port || 3000;   // 3000 — treats 0 as falsy
port ?? 3000;   // 0    — only null/undefined triggers fallback

const config = { timeout: null };
config.timeout ?? 5000; // 5000
config.retries ?? 3;    // 3 (retries is undefined)
\`\`\`

Combining both: \`user?.profile?.name ?? 'Anonymous'\` safely traverses and provides a fallback.`,
      difficulty: 1,
      tags: 'optional-chaining,nullish-coalescing,es2020,null-safety',
    },
    {
      title: 'What is the difference between ES Modules and CommonJS?',
      answer: `**CommonJS (CJS)** is the Node.js module system: \`require()\`/\`module.exports\`. It is **synchronous**, resolved at runtime, and copies values at import time.

**ES Modules (ESM)** use \`import\`/\`export\`, are **static** (import paths must be string literals), resolved at parse time, and export **live bindings** (the consumer sees mutations to the exported value).

\`\`\`js
// CommonJS
const { readFile } = require('fs');
module.exports = { myFn };

// ES Module
import { readFile } from 'node:fs/promises';
export function myFn() {}
export default class MyClass {}
\`\`\`

**ESM advantages:** Static analysis enables tree-shaking (dead code elimination), top-level \`await\` is supported, and it's the browser-native standard. **CJS advantages:** Dynamic \`require()\` (conditional imports), broad legacy ecosystem compatibility.

Node.js supports both: use \`.mjs\` or \`"type": "module"\` in \`package.json\` for ESM. New code should use ESM.`,
      difficulty: 2,
      tags: 'esm,commonjs,modules,bundling,tree-shaking',
    },
    {
      title: 'What is destructuring and what are advanced patterns?',
      answer: `Destructuring extracts values from arrays or properties from objects into distinct variables with concise syntax.

\`\`\`js
// Object destructuring
const { name, age = 30, address: { city } } = user; // nested + default
const { name: firstName, ...rest } = user;           // rename + rest

// Array destructuring
const [first, , third] = [1, 2, 3];                 // skip elements
const [head, ...tail] = arr;                         // rest in arrays

// Function parameters
function display({ title, score = 0 }) { /* ... */ }

// Swapping variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1

// Dynamic property keys
const key = 'name';
const { [key]: value } = { name: 'Alice' }; // value = 'Alice'
\`\`\`

Destructuring reduces boilerplate in function parameters, import statements (\`import { useState } from 'react'\`), and when working with API responses.`,
      difficulty: 2,
      tags: 'destructuring,es6,spread,parameters',
    },
    {
      title: 'What are microtasks vs macrotasks? Give a real example.',
      answer: `The JavaScript event loop processes tasks in a specific priority order. **Microtasks** (Promise callbacks, \`queueMicrotask\`, \`MutationObserver\`) run **immediately after the current synchronous code** and before the browser paints or processes the next macrotask. **Macrotasks** (\`setTimeout\`, \`setInterval\`, I/O events, UI events) run one per event loop iteration, each separated by a microtask drain.

\`\`\`js
console.log('1 - sync');

setTimeout(() => console.log('4 - macrotask'), 0);

Promise.resolve()
  .then(() => console.log('2 - microtask 1'))
  .then(() => console.log('3 - microtask 2'));

console.log('1b - sync end');

// Output: 1 - sync, 1b - sync end, 2 - microtask 1, 3 - microtask 2, 4 - macrotask
\`\`\`

The microtask queue is fully drained after every task, so even a \`setTimeout(fn, 0)\` fires only after all pending Promise callbacks finish. This is why Promises resolve "sooner" than \`setTimeout\`.`,
      difficulty: 3,
      tags: 'event-loop,microtasks,macrotasks,async,promises',
    },
    {
      title: 'What is Object.freeze() vs Object.seal()?',
      answer: `Both restrict object mutation, but at different levels.

**\`Object.freeze(obj)\`:** Makes the object completely **immutable** — no properties can be added, removed, or changed. Nested objects are not frozen (shallow freeze only).

**\`Object.seal(obj)\`:** Prevents adding or deleting properties, but **allows modifying existing** property values. The object's shape is fixed, but values can change.

\`\`\`js
const frozen = Object.freeze({ x: 1, nested: { y: 2 } });
frozen.x = 99;         // silently fails (or TypeError in strict mode)
frozen.z = 3;          // silently fails
frozen.nested.y = 99;  // WORKS — nested not frozen

const sealed = Object.seal({ a: 1, b: 2 });
sealed.a = 10;         // allowed — modifying existing
sealed.c = 3;          // fails — can't add
delete sealed.a;       // fails — can't remove

Object.isFrozen(frozen); // true
Object.isSealed(sealed); // true
\`\`\`

For deep immutability, recursively freeze nested objects or use an immutability library like Immer.`,
      difficulty: 2,
      tags: 'immutability,objects,freeze,seal',
    },
    {
      title: 'What is the difference between map(), filter(), reduce(), and forEach()?',
      answer: `All four iterate over arrays but serve different purposes:

- \`forEach(fn)\` — executes \`fn\` for each element as a **side effect**, returns \`undefined\`
- \`map(fn)\` — returns a **new array** with each element transformed by \`fn\`
- \`filter(fn)\` — returns a **new array** with elements for which \`fn\` returns truthy
- \`reduce(fn, init)\` — **accumulates** all elements into a single output value

\`\`\`js
const nums = [1, 2, 3, 4, 5];

nums.forEach(n => console.log(n));        // logs each, returns undefined
nums.map(n => n * 2);                     // [2, 4, 6, 8, 10]
nums.filter(n => n % 2 === 0);            // [2, 4]
nums.reduce((acc, n) => acc + n, 0);      // 15

// Combining them
nums
  .filter(n => n > 2)  // [3, 4, 5]
  .map(n => n * 2)     // [6, 8, 10]
  .reduce((a, b) => a + b, 0); // 24
\`\`\`

Use \`map\` for transformations, \`filter\` for selection, \`reduce\` for aggregation, and \`forEach\` only for side effects (logging, mutations outside the array).`,
      difficulty: 1,
      tags: 'array-methods,functional-programming,iteration',
    },
    {
      title: 'How does garbage collection work in V8 (mark-and-sweep)?',
      answer: `V8 uses a **generational garbage collector**. Objects are allocated in the **young generation** (short-lived). Surviving objects after a few collections are promoted to the **old generation** (long-lived).

The core algorithm is **mark-and-sweep**: starting from GC roots (global variables, call stack, closures), the engine marks all **reachable** objects. Then it **sweeps** (frees) all unmarked (unreachable) memory. V8 also uses **incremental marking** and **concurrent sweeping** to avoid long pauses.

\`\`\`js
function createLeak() {
  const data = new Array(1000000).fill('*');
  // data is allocated in young gen
  return data; // returned → promoted to old gen if referenced
}

let leaked = createLeak(); // old gen: data stays alive
leaked = null;             // now unreachable → will be swept
\`\`\`

**Implications for developers:** Avoid holding references to large objects longer than needed. Closures capturing large arrays or DOM nodes can unintentionally prevent GC.`,
      difficulty: 3,
      tags: 'garbage-collection,v8,memory,generational',
    },
    {
      title: 'What causes memory leaks in JavaScript and how do you detect them?',
      answer: `Memory leaks occur when objects remain reachable (referenced) even after they are no longer needed, preventing garbage collection.

**Common causes:**
1. Forgotten \`setInterval\`/\`setTimeout\` that reference outer variables
2. Event listeners not removed when elements are destroyed
3. Closures holding references to large objects
4. Global variables accumulating data
5. Detached DOM nodes still referenced by JS variables

\`\`\`js
// Leak: interval never cleared
function startPolling() {
  const cache = new Map();
  setInterval(() => cache.set(Date.now(), fetchData()), 1000);
  // cache grows forever
}

// Fix: return a cleanup function
function startPolling() {
  const cache = new Map();
  const id = setInterval(() => cache.set(Date.now(), fetchData()), 1000);
  return () => clearInterval(id);
}
\`\`\`

**Detection:** Chrome DevTools → Memory tab → take heap snapshots over time; a growing heap indicates leaks. The "Detached elements" filter finds orphaned DOM nodes.`,
      difficulty: 3,
      tags: 'memory-leaks,debugging,performance,gc',
    },
    {
      title: 'What is event bubbling and capturing?',
      answer: `DOM events go through three phases: **capturing** (root → target), **target** (element itself), and **bubbling** (target → root). By default, listeners are added to the bubbling phase.

\`\`\`js
// Bubbling (default) — fires during bubble phase
element.addEventListener('click', handler);
element.addEventListener('click', handler, false); // same

// Capturing — fires as event travels DOWN to target
element.addEventListener('click', handler, true);
element.addEventListener('click', handler, { capture: true });

// Stop propagation
element.addEventListener('click', (e) => {
  e.stopPropagation();       // stops bubbling/capturing
  e.stopImmediatePropagation(); // also stops other listeners on same element
});
\`\`\`

**Bubbling** is the basis for **event delegation**. **Capturing** is rarely needed but useful for intercepting events before they reach deeply nested children. \`e.preventDefault()\` prevents the browser's default action (like link navigation) but does not stop propagation.`,
      difficulty: 2,
      tags: 'events,dom,propagation,bubbling,capturing',
    },
    {
      title: 'What are template literals and tagged templates?',
      answer: `**Template literals** use backtick delimiters, support multi-line strings, and embed expressions with \`\${...}\` syntax — avoiding messy string concatenation.

**Tagged templates** prefix a template literal with a function. The function receives an array of string parts and the interpolated values as separate arguments, enabling custom processing.

\`\`\`js
// Basic template literal
const name = 'Alice';
const msg = \`Hello, \${name}!
This is a multi-line string.\`;

// Tagged template
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) =>
    result + str + (values[i] !== undefined ? \`<b>\${values[i]}</b>\` : ''),
  '');
}
highlight\`User: \${name} logged in\`; // 'User: <b>Alice</b> logged in'

// Real-world: SQL injection prevention
sql\`SELECT * FROM users WHERE id = \${userId}\`;
\`\`\`

Tagged templates power libraries like styled-components (CSS-in-JS), GraphQL query building, and safe SQL/HTML interpolation.`,
      difficulty: 2,
      tags: 'es6,string-templates,tagged-templates',
    },
    {
      title: 'What is debouncing and throttling? Write a debounce function.',
      answer: `**Debouncing** delays invoking a function until a specified time has elapsed since the last call. Good for search inputs, resize handlers, and form validation — you only want to act after the user stops typing.

**Throttling** ensures a function runs at most once per interval. Good for scroll and mousemove handlers — you want regular updates, just not on every single event.

\`\`\`js
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const handleSearch = debounce((query) => fetchResults(query), 300);
input.addEventListener('input', (e) => handleSearch(e.target.value));

// Throttle
function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
\`\`\`

Both are performance patterns that limit the rate of expensive operations triggered by high-frequency events.`,
      difficulty: 2,
      tags: 'performance,debounce,throttle,events',
    },
    {
      title: 'What is the difference between a shallow copy and a deep copy?',
      answer: `A **shallow copy** duplicates only the top-level structure. Nested objects and arrays still share references with the original. A **deep copy** recursively duplicates every level, producing a completely independent clone.

\`\`\`js
const original = { a: 1, nested: { b: 2 } };

// Shallow copy — nested object is shared
const shallow = { ...original };
shallow.a = 99;             // original.a still 1
shallow.nested.b = 99;      // original.nested.b ALSO becomes 99!

// Deep copy with structuredClone (ES2022, recommended)
const deep = structuredClone(original);
deep.nested.b = 99;         // original.nested.b unchanged

// Other deep copy methods (with limitations)
JSON.parse(JSON.stringify(original)); // loses Date, Map, undefined, functions
\`\`\`

Use \`structuredClone()\` for modern deep cloning — it handles \`Date\`, \`Map\`, \`Set\`, \`RegExp\`, and circular references. Avoid the JSON round-trip hack for anything beyond plain data objects.`,
      difficulty: 2,
      tags: 'object-copying,memory,immutability,deep-copy',
    },
    {
      title: 'What are JavaScript classes and how do they differ from constructor functions?',
      answer: `ES6 \`class\` syntax provides a cleaner way to create objects and implement inheritance. It is **syntactic sugar** over constructor functions and prototype chains — no new runtime mechanism is introduced.

\`\`\`js
// Constructor function (ES5)
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() { return this.name + ' makes a sound'; };

// ES6 class (same result under the hood)
class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name + ' makes a sound'; }
  static create(name) { return new Animal(name); } // static method
}

class Dog extends Animal {
  speak() { return super.speak() + ': woof!'; }
}

new Dog('Rex').speak(); // 'Rex makes a sound: woof!'
\`\`\`

**Key differences from constructor functions:**
- Classes are NOT hoisted (TDZ applies)
- Class bodies always run in strict mode
- Methods are non-enumerable by default
- Must use \`new\` — calling a class without it throws`,
      difficulty: 2,
      tags: 'classes,es6,oop,prototypes',
    },
    {
      title: 'How do you handle errors in async/await with try/catch?',
      answer: `\`await\` unwraps a Promise. If the Promise rejects, the \`await\` expression throws, which a surrounding \`try/catch\` block can catch — just like synchronous error handling.

\`\`\`js
async function loadUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error('Failed to load user:', err);
    throw err; // re-throw if you can't recover here
  } finally {
    setLoading(false); // always runs
  }
}

// Multiple awaits — catch wraps all of them
async function multiStep() {
  try {
    const user = await fetchUser();
    const profile = await fetchProfile(user.id);
    return profile;
  } catch (err) { /* handles any rejection above */ }
}

// Alternatively: per-promise catch
const user = await fetchUser().catch(handleError);
\`\`\`

Avoid un-awaited Promises inside \`try\` blocks — the catch won't fire for them. Use \`Promise.allSettled\` when you need to handle multiple rejections independently.`,
      difficulty: 2,
      tags: 'async-await,promises,error-handling,try-catch',
    },
    {
      title: 'What is the difference between localStorage, sessionStorage, and cookies?',
      answer: `All three store data on the client, but they differ in lifetime, scope, capacity, and HTTP behavior.

| | **localStorage** | **sessionStorage** | **Cookie** |
|---|---|---|---|
| Lifetime | Permanent | Tab session | Configurable (expires/session) |
| Scope | Origin | Origin + tab | Origin + path |
| Capacity | ~5–10 MB | ~5 MB | ~4 KB |
| Sent with HTTP | No | No | Yes (adds request overhead) |

\`\`\`js
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');    // 'dark' — persists after close/reopen
localStorage.removeItem('theme');

sessionStorage.setItem('draft', JSON.stringify(formData));
// cleared when the tab/window is closed

document.cookie = 'token=abc; Secure; HttpOnly; SameSite=Strict; Max-Age=3600';
\`\`\`

Use \`localStorage\` for user preferences. Use \`sessionStorage\` for per-tab state (wizard steps, unsaved draft). Use cookies for authentication tokens that the server needs to read (\`HttpOnly\` prevents XSS access).`,
      difficulty: 1,
      tags: 'web-storage,client-side-storage,cookies,security',
    },
    {
      title: 'What is implicit type coercion in JavaScript?',
      answer: `JavaScript automatically converts values to the expected type in certain operations — this is **implicit type coercion**. It's a common source of subtle bugs.

\`\`\`js
// + operator: if either operand is a string, converts to string
'5' + 3       // '53' (number coerced to string)
5 + '3'       // '53'

// -, *, / always coerce to numbers
'5' - 3       // 2
'5' * '2'     // 10
null + 1      // 1 (null → 0)
undefined + 1 // NaN (undefined → NaN)

// Comparison with ==
'' == false    // true (both coerce to 0)
[] == false    // true
null == undefined // true (special case)
\`\`\`

**Truthy/falsy coercion in conditions:** \`0\`, \`''\`, \`null\`, \`undefined\`, \`NaN\`, and \`false\` are falsy; everything else is truthy.

Use \`===\` to avoid coercion surprises. Explicit conversion (\`Number(x)\`, \`String(x)\`, \`Boolean(x)\`) makes intent clear.`,
      difficulty: 2,
      tags: 'type-coercion,implicit-conversion,equality',
    },
    {
      title: 'What is the difference between function declarations and function expressions?',
      answer: `**Function declarations** are fully hoisted — you can call them before their definition in source code. **Function expressions** (including arrow functions assigned to variables) are not hoisted with their body; only the variable declaration is hoisted.

\`\`\`js
// Function declaration — works before definition
greet(); // 'Hello'
function greet() { return 'Hello'; }

// Function expression — only variable is hoisted, not the function
sayHi(); // TypeError: sayHi is not a function
var sayHi = function () { return 'Hi'; };

// Arrow function expression — same
greetArrow(); // ReferenceError (let/const TDZ)
const greetArrow = () => 'Hey';
\`\`\`

**Named function expressions** (e.g., \`const fn = function myFn() {}\`) allow self-reference (\`myFn()\` inside the body) and appear in stack traces by name. Anonymous functions make debugging harder. Prefer named function expressions or declarations for anything non-trivial.`,
      difficulty: 2,
      tags: 'functions,hoisting,declarations,expressions',
    },
    {
      title: 'What is lexical scoping?',
      answer: `Lexical scoping (also called static scoping) means that a function's scope is determined by **where it is defined in source code**, not where it is called. Inner functions have access to variables in their outer (enclosing) scopes at definition time.

\`\`\`js
const x = 'global';

function outer() {
  const x = 'outer';

  function inner() {
    const x = 'inner';
    console.log(x); // 'inner' — innermost scope wins
  }

  function middle() {
    console.log(x); // 'outer' — inner's x not visible; finds outer's x
  }

  inner();  // 'inner'
  middle(); // 'outer'
}

outer();
\`\`\`

This is how **closures** work: a function "closes over" its lexical scope. The scope chain is fixed when the function is created, not when it runs. Dynamic scoping (used in some other languages) would resolve variables based on the call stack instead.`,
      difficulty: 2,
      tags: 'scope,closures,lexical-scoping,functions',
    },
    {
      title: 'What are Promise combinators: all, allSettled, race, and any?',
      answer: `Promise combinators coordinate multiple async operations at once.

- **\`Promise.all(promises)\`** — resolves when all resolve; **rejects immediately** if any rejects. Returns all resolved values.
- **\`Promise.allSettled(promises)\`** — waits for all to settle (never rejects itself); returns an array of \`{status, value/reason}\` objects.
- **\`Promise.race(promises)\`** — resolves or rejects with the **first** promise that settles.
- **\`Promise.any(promises)\`** — resolves with the **first fulfillment**; rejects only if ALL reject (throws \`AggregateError\`).

\`\`\`js
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);

const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => r.status === 'fulfilled' ? use(r.value) : log(r.reason));

const fastest = await Promise.race([fetch('/cdn1/file'), fetch('/cdn2/file')]);

const firstWorking = await Promise.any([api1(), api2(), api3()]); // fallback chain
\`\`\`

Choose based on failure tolerance: \`all\` for "all must succeed", \`allSettled\` for partial results, \`race\` for timeouts, \`any\` for first-available fallback.`,
      difficulty: 2,
      tags: 'promises,async,concurrency,combinators',
    },
    {
      title: 'What is structuredClone() and how does it differ from JSON serialization?',
      answer: `\`structuredClone(obj)\` (available in browsers since 2022 and Node 17+) deep-clones an object using the **structured clone algorithm**. It correctly handles types that JSON cannot: \`Date\`, \`Map\`, \`Set\`, \`RegExp\`, \`ArrayBuffer\`, \`undefined\` values, and **circular references**.

\`\`\`js
const original = {
  date: new Date(),
  map: new Map([['a', 1]]),
  set: new Set([1, 2]),
};

// JSON round-trip — BROKEN
const jsonCopy = JSON.parse(JSON.stringify(original));
jsonCopy.date instanceof Date; // false — becomes a string
jsonCopy.map instanceof Map;   // false — becomes {}

// structuredClone — CORRECT
const clone = structuredClone(original);
clone.date instanceof Date;  // true
clone.map instanceof Map;    // true
clone.map === original.map;  // false — deep copy
\`\`\`

**Limitations of \`structuredClone\`:** Cannot clone functions, DOM nodes, class instances with prototypes (loses prototype chain), or Proxies. For those, use a library or a custom recursive clone.`,
      difficulty: 2,
      tags: 'cloning,deep-copy,structuredclone,es2022',
    },
    {
      title: 'What are private class fields (#) in ES2022?',
      answer: `Private class fields are declared with a \`#\` prefix and are **truly inaccessible** outside the class body — enforced by the JavaScript engine, not just a naming convention. They cannot be accessed via bracket notation, \`Object.keys\`, or even subclasses.

\`\`\`js
class BankAccount {
  #balance = 0;          // private field
  #transactionLog = [];  // private field

  deposit(amount) {
    this.#balance += amount;
    this.#transactionLog.push({ type: 'deposit', amount });
  }

  get balance() { return this.#balance; } // public getter

  #validate(amount) { // private method
    if (amount <= 0) throw new Error('Invalid amount');
  }
}

const account = new BankAccount();
account.deposit(100);
account.balance;    // 100
account.#balance;   // SyntaxError — not accessible outside class
\`\`\`

Before private fields, developers used WeakMap-based tricks or \`_prefix\` convention (not enforced). Private fields provide true encapsulation and are now the idiomatic approach.`,
      difficulty: 2,
      tags: 'classes,privacy,es2022,encapsulation',
    },
    {
      title: 'What are logical assignment operators (||=, &&=, ??=) in ES2021?',
      answer: `Logical assignment operators combine a logical check with assignment. They **short-circuit** — the right side only evaluates (and assignment only happens) when the condition is met.

\`\`\`js
// ||= assigns only if left side is falsy
let a = null;
a ||= 'default'; // a = 'default'
let b = 'existing';
b ||= 'default'; // b unchanged = 'existing'

// ??= assigns only if left side is null or undefined
let port = 0;
port ??= 3000; // port still 0 — 0 is not null/undefined
let host;
host ??= 'localhost'; // host = 'localhost'

// &&= assigns only if left side is truthy
let user = { name: 'Alice' };
user &&= { ...user, active: true }; // replaces user since user is truthy
let noUser = null;
noUser &&= { active: true }; // noUser stays null
\`\`\`

These are shorthand for the common pattern \`x = x || y\`, \`x = x && y\`, \`x = x ?? y\` but clearer and with proper short-circuit semantics.`,
      difficulty: 2,
      tags: 'logical-assignment,es2021,operators,short-circuit',
    },
    {
      title: 'What does this print? var vs let in a setTimeout loop.',
      answer: `This is a classic closure + scoping question. With \`var\`, all callbacks share the same \`i\` variable (function-scoped). By the time the timeouts fire, the loop has finished and \`i\` is \`3\`. With \`let\`, each iteration creates a **new block-scoped binding**, so each callback captures its own copy.

\`\`\`js
// var: prints 3, 3, 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

// let: prints 0, 1, 2
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}

// ES5 fix with IIFE:
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
\`\`\`

This demonstrates that closures capture **variable bindings**, not values at the time of closure creation. \`let\` creates a fresh binding per iteration, solving this problem cleanly.`,
      difficulty: 3,
      tags: 'closures,var-let,scope,async,setTimeout',
    },
    {
      title: 'How do you cancel a fetch request with AbortController?',
      answer: `\`AbortController\` provides a \`signal\` you pass to \`fetch()\`. Calling \`controller.abort()\` cancels the in-flight request; the Promise rejects with an \`AbortError\`. This prevents stale responses from updating state after a component unmounts or a new search term is entered.

\`\`\`js
// With a timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch('/api/data', { signal: controller.signal });
  clearTimeout(timeoutId);
  const data = await res.json();
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Request cancelled');
  }
}

// In React useEffect cleanup
useEffect(() => {
  const ctrl = new AbortController();
  fetch(\`/api/users/\${id}\`, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(e => { if (e.name !== 'AbortError') setError(e); });
  return () => ctrl.abort(); // cancel on unmount or id change
}, [id]);
\`\`\``,
      difficulty: 2,
      tags: 'fetch,abortcontroller,async,cleanup',
    },
    {
      title: 'What are immutable array methods toSorted, toReversed, toSpliced, and with?',
      answer: `ES2023 added four non-mutating counterparts to methods that previously mutated arrays in place. They return **new arrays** and leave the original unchanged — essential for immutable state patterns in React and other frameworks.

\`\`\`js
const arr = [3, 1, 2];
const frozen = Object.freeze([3, 1, 2]);

// Old mutating methods
arr.sort();    // mutates arr to [1, 2, 3]
arr.reverse(); // mutates arr to [3, 2, 1]

// New immutable methods
const sorted   = arr.toSorted();            // [1, 2, 3] — arr unchanged
const reversed = arr.toReversed();          // [3, 2, 1] — arr unchanged
const spliced  = arr.toSpliced(1, 1, 9);   // [3, 9, 2] — replaces index 1
const updated  = arr.with(0, 99);          // [99, 1, 2] — replaces index 0

// Works on frozen arrays
frozen.toSorted(); // [1, 2, 3] — no error
frozen.sort();     // TypeError
\`\`\`

These methods make it easy to write correct immutable update patterns without spreading and manually re-sorting.`,
      difficulty: 2,
      tags: 'arrays,immutability,es2023,toSorted',
    },
    {
      title: 'What is BigInt and when should you use it?',
      answer: `\`BigInt\` (ES2020) is a numeric primitive that can represent integers of **arbitrary precision**, beyond \`Number.MAX_SAFE_INTEGER\` (2⁓ - 1 = 9,007,199,254,740,991). Use it when integer precision beyond this limit matters.

\`\`\`js
// Regular Number loses precision above MAX_SAFE_INTEGER
9007199254740992 + 1 === 9007199254740992; // true (precision lost!)

// BigInt is exact
9007199254740992n + 1n === 9007199254740993n; // true

const big = BigInt('12345678901234567890');
typeof big; // 'bigint'

// Cannot mix BigInt and Number directly
42n + 1;   // TypeError — use explicit conversion
42n + 1n;  // 43n
Number(42n); // 42
\`\`\`

**Use cases:** 64-bit database IDs (Twitter snowflake IDs), cryptography, financial calculations requiring exact integer arithmetic, and working with native APIs that return 64-bit integers. Avoid \`BigInt\` for general math — it's slower than \`Number\`.`,
      difficulty: 2,
      tags: 'bigint,types,primitives,es2020,precision',
    },
    {
      title: 'What is dynamic import() and when would you use it?',
      answer: `Dynamic \`import()\` (ES2020) loads a module **on demand at runtime**, returning a Promise. Unlike static \`import\` (parsed at compile time), dynamic imports can appear anywhere in code and accept expressions as paths.

\`\`\`js
// Static import — always loaded at startup
import { formatDate } from './utils';

// Dynamic import — loaded only when needed
async function handleExport() {
  const { jsPDF } = await import('jspdf'); // loaded on demand
  const doc = new jsPDF();
  doc.save('report.pdf');
}

// Conditional import
if (userPreferences.darkMode) {
  const theme = await import('./themes/dark.js');
  applyTheme(theme.default);
}

// Route-based splitting (React example)
const AdminPage = React.lazy(() => import('./pages/Admin'));
\`\`\`

Bundlers (Webpack, Vite, Rollup) treat each \`import()\` as a **code-split boundary**, creating separate chunks downloaded only when the route/feature is first accessed. This is the primary mechanism for reducing initial bundle size.`,
      difficulty: 2,
      tags: 'modules,code-splitting,async,dynamic-import',
    },
    {
      title: 'How do you make a custom iterable with Symbol.iterator?',
      answer: `An object is **iterable** if it has a \`[Symbol.iterator]()\` method that returns an **iterator** — an object with a \`next()\` method returning \`{ value, done }\`. This enables the object to work with \`for...of\`, spread syntax, and destructuring.

\`\`\`js
class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  }
}

const range = new Range(1, 4);
for (const n of range) console.log(n); // 1, 2, 3, 4
console.log([...range]);               // [1, 2, 3, 4]
const [a, b] = new Range(10, 20);      // a=10, b=11
\`\`\`

Generator functions simplify this: just use \`*[Symbol.iterator]() { yield ... }\`.`,
      difficulty: 2,
      tags: 'iterables,symbol,iterator,protocols,generators',
    },
    {
      title: 'What is the difference between typeof and instanceof?',
      answer: `\`typeof\` returns a string describing the primitive type of a value. \`instanceof\` checks whether an object's prototype chain contains the \`prototype\` property of a constructor function.

\`\`\`js
typeof 42        // 'number'
typeof 'hello'   // 'string'
typeof true      // 'boolean'
typeof undefined // 'undefined'
typeof {}        // 'object'
typeof []        // 'object' (not 'array'!)
typeof null      // 'object' (historic bug)
typeof function(){} // 'function'

[] instanceof Array   // true
[] instanceof Object  // true (arrays inherit from Object)
'hello' instanceof String // false (primitives aren't instances)
new String('hello') instanceof String // true

// Reliable array check
Array.isArray([]);        // true — always use this for arrays
Object.prototype.toString.call([]); // '[object Array]'
\`\`\`

Use \`typeof\` for primitives, \`instanceof\` for class membership, and \`Array.isArray()\` specifically for arrays.`,
      difficulty: 1,
      tags: 'typeof,instanceof,types,checking,primitives',
    },
    {
      title: 'What is function composition?',
      answer: `Function composition combines multiple functions so the output of one becomes the input of the next. It's a core functional programming technique for building complex behavior from small, focused functions.

\`\`\`js
// Manual composition: compose(f, g)(x) = f(g(x))
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe    = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const trim       = (s) => s.trim();
const toLowerCase = (s) => s.toLowerCase();
const slugify    = (s) => s.replace(/\\s+/g, '-');

const toSlug = pipe(trim, toLowerCase, slugify);
toSlug('  Hello World  '); // 'hello-world'

// compose applies right-to-left; pipe applies left-to-right
const process = compose(slugify, toLowerCase, trim);
process('  Hello World  '); // same result
\`\`\`

\`pipe\` reads more naturally (left to right). Libraries like Ramda and lodash/fp provide these utilities. In modern JavaScript, the pipeline operator (\`|>\`) is a Stage 2 proposal aiming to make this syntax native.`,
      difficulty: 2,
      tags: 'functional-programming,composition,pipe,functions',
    },
    {
      title: 'What are Web Workers and when would you use them?',
      answer: `Web Workers run JavaScript in a **background thread** separate from the main thread, enabling **non-blocking computation**. They cannot access the DOM but can perform CPU-intensive work without freezing the UI.

\`\`\`js
// main.js
const worker = new Worker('worker.js');
worker.postMessage({ data: largeArray }); // send data to worker
worker.onmessage = (event) => {
  console.log('Result:', event.data.result);
};

// worker.js
self.onmessage = (event) => {
  const result = heavyComputation(event.data.data); // runs in background
  self.postMessage({ result });
};
\`\`\`

Communication is via \`postMessage\`/\`onmessage\` — data is **copied** (structured clone), not shared, except for \`SharedArrayBuffer\` and \`Transferable\` objects.

**Use cases:** Image/video processing, cryptography, data compression, complex sorting/filtering of large datasets, physics simulations, or any synchronous task exceeding ~16ms.`,
      difficulty: 2,
      tags: 'web-workers,threading,performance,background',
    },
    {
      title: 'What is Object.defineProperty() and when do you need it?',
      answer: `\`Object.defineProperty(obj, key, descriptor)\` defines a property with fine-grained control over its **property descriptor** — including whether it can be written, enumerated, configured, or whether it uses a getter/setter pair.

\`\`\`js
const config = {};

// Create a read-only, non-enumerable property
Object.defineProperty(config, 'MAX_SIZE', {
  value: 1000,
  writable: false,      // cannot reassign
  enumerable: false,    // hidden from for...in, Object.keys()
  configurable: false,  // cannot be redefined or deleted
});

config.MAX_SIZE = 2000; // silently fails (or throws in strict mode)
Object.keys(config);    // [] — MAX_SIZE is hidden

// Getter/setter
const obj = { _name: 'Alice' };
Object.defineProperty(obj, 'name', {
  get() { return this._name.toUpperCase(); },
  set(val) { this._name = val.trim(); },
});
obj.name; // 'ALICE'
\`\`\`

Used internally by Vue 2's reactivity system, Object.freeze, and libraries creating read-only APIs. In modern code you'd usually use \`class\` getters/setters or Proxy instead.`,
      difficulty: 2,
      tags: 'objects,properties,descriptors,getters,setters',
    },
    {
      title: 'How does class hoisting differ from function hoisting?',
      answer: `**Function declarations** are fully hoisted — you can call them before their definition. **Class declarations** are also hoisted, but like \`let\`/\`const\`, they are placed in the **Temporal Dead Zone** and cannot be accessed before their declaration.

\`\`\`js
// Function declaration — works
const dog = new Animal(); // OK
function Animal() { this.breathes = true; }

// Class declaration — throws
const cat = new Pet(); // ReferenceError: Cannot access 'Pet' before initialization
class Pet { constructor() { this.type = 'animal'; } }

// Class expression — only variable is hoisted (var)
const Bird = class { fly() {} }; // safe, reference is after definition
\`\`\`

This means you must always define a class **before** instantiating it. The rationale: unlike function hoisting (which was a pragmatic design decision), class hoisting with TDZ enforces cleaner, top-to-bottom code structure where dependencies are visible.`,
      difficulty: 2,
      tags: 'classes,hoisting,tdz,scope',
    },
    {
      title: 'What is fetch() and how does it differ from XMLHttpRequest?',
      answer: `\`fetch()\` is the modern Promise-based API for making HTTP requests. \`XMLHttpRequest (XHR)\` is the older event-driven API. Both are available in browsers, but \`fetch\` has cleaner syntax and better composability.

\`\`\`js
// fetch
const res = await fetch('/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1 }),
  signal: controller.signal, // cancellation
});
const data = await res.json();

// XHR (older pattern)
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data');
xhr.onload = () => JSON.parse(xhr.responseText);
xhr.onerror = () => handleError();
xhr.send();
\`\`\`

**Key differences:**
- \`fetch\` is Promise-based; XHR is event-driven
- \`fetch\` doesn't reject on HTTP errors (4xx/5xx) — you must check \`res.ok\`
- XHR supports upload progress events; fetch supports them via \`ReadableStream\`
- \`fetch\` supports streaming responses; XHR does not natively
- Both support \`AbortController\` for cancellation`,
      difficulty: 2,
      tags: 'fetch,http,xhr,async,network',
    },
    {
      title: 'What is event capturing?',
      answer: `Event capturing (also called the **trickling phase**) is when an event propagates from the **document root DOWN to the target element** before the target handles it. It is the first of three event phases: capturing → target → bubbling.

By default, \`addEventListener\` registers in the **bubbling phase**. To intercept during capturing, pass \`{ capture: true }\` or \`true\` as the third argument.

\`\`\`js
document.addEventListener('click', (e) => {
  console.log('document capturing');
}, { capture: true }); // fires BEFORE the child

document.querySelector('#child').addEventListener('click', (e) => {
  console.log('child target');
}); // fires AFTER capturing phase

// Capture output when clicking #child:
// 1. 'document capturing'
// 2. 'child target'
// (then bubbling would go back up)
\`\`\`

Capturing is rarely used in practice. Common use case: intercepting clicks globally before they reach a specific component (e.g., closing a modal when clicking outside it) without relying on bubbling reaching the root.`,
      difficulty: 2,
      tags: 'events,dom,propagation,capturing,bubbling',
    },
    {
      title: 'What is the difference between mouseenter and mouseover?',
      answer: `Both fire when the cursor enters an element, but they differ in **bubbling behavior**.

- **\`mouseover\`** bubbles — it fires on the element AND triggers again every time the cursor moves between child elements (even though the cursor hasn't left the parent).
- **\`mouseenter\`** does NOT bubble — it fires only once when the cursor first enters the element, ignoring child boundaries.

\`\`\`js
const parent = document.getElementById('parent');

// mouseover fires many times (once per child entered)
parent.addEventListener('mouseover', () => console.log('mouseover'));

// mouseenter fires once (when cursor enters parent)
parent.addEventListener('mouseenter', () => console.log('mouseenter'));

// Corresponding leave events:
// mouseleave — no bubbling
// mouseout   — bubbles
\`\`\`

Use \`mouseenter\`/\`mouseleave\` for hover effects on container elements to avoid jitter caused by child transitions. Use \`mouseover\`/\`mouseout\` when you need to track every child element transition.`,
      difficulty: 2,
      tags: 'events,dom,mouse-events,hover,bubbling',
    },
    {
      title: 'What are JavaScript decorators?',
      answer: `Decorators are a **Stage 3 TC39 proposal** (widely used via TypeScript and Babel) that attach reusable behavior to classes, methods, fields, or accessors using the \`@\` syntax. They are functions that receive the decorated target and return it (optionally modified).

\`\`\`js
// Method decorator example (TypeScript / Babel)
function log(target, context) {
  return function (...args) {
    console.log(\`Calling \${context.name} with\`, args);
    return target.apply(this, args);
  };
}

class UserService {
  @log
  getUser(id) { return fetch(\`/users/\${id}\`); }
}

// Field decorator
function readonly(target, context) {
  context.addInitializer(function () {
    Object.defineProperty(this, context.name, { writable: false });
  });
}
\`\`\`

Angular and NestJS make heavy use of decorators (\`@Component\`, \`@Injectable\`, \`@Get\`). TypeScript has supported experimental decorators since v5 (which aligns with the Stage 3 proposal). Native JS support will arrive when browsers ship the Stage 3 spec.`,
      difficulty: 3,
      tags: 'metaprogramming,classes,decorators,typescript',
    },
    {
      title: 'What is tail call optimization (TCO) and why do most engines not implement it?',
      answer: `A **tail call** is a function call in the **return position** of a function — the calling function has nothing more to do after the call. TCO allows the engine to reuse the current stack frame instead of creating a new one, preventing stack overflow in deep recursion.

\`\`\`js
// Tail call — last thing done is call factorial
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc); // tail position — TCO eligible
}

// NOT a tail call — multiplication happens after recursive call
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // n * (...) means work after call
}
\`\`\`

ES6 mandates TCO in strict mode, but **only Safari/JavaScriptCore implements it** as of 2026. V8 (Chrome, Node.js) and SpiderMonkey (Firefox) removed their implementations due to developer tooling concerns (TCO eliminates stack frames, making debugging harder). In practice, for deep recursion, use iteration or explicit stacks.`,
      difficulty: 3,
      tags: 'recursion,tail-call,optimization,performance,es6',
    },
    {
      title: 'What is Object.is() and how does it differ from ===?',
      answer: `\`Object.is(a, b)\` is like \`===\` but handles two edge cases correctly:

1. \`NaN === NaN\` is \`false\`, but \`Object.is(NaN, NaN)\` is \`true\`
2. \`+0 === -0\` is \`true\`, but \`Object.is(+0, -0)\` is \`false\`

\`\`\`js
NaN === NaN         // false (confusing)
Object.is(NaN, NaN) // true

+0 === -0           // true
Object.is(+0, -0)   // false

// All other comparisons behave the same as ===
Object.is(1, 1)     // true
Object.is('a', 'a') // true
Object.is({}, {})   // false (different references)
\`\`\`

React uses \`Object.is\` internally for comparing state values and hook dependencies (the polyfill is in React's source). For most everyday code, \`===\` is fine; use \`Object.is\` when you need correct \`NaN\` equality or must distinguish \`+0\` from \`-0\`.`,
      difficulty: 2,
      tags: 'operators,equality,comparison,nan,object-is',
    },
    {
      title: 'What is for await...of and when do you use it?',
      answer: `\`for await...of\` consumes **async iterables** — objects implementing \`Symbol.asyncIterator\`. It \`await\`s each value from the iterator before moving to the next, making sequential async iteration readable.

\`\`\`js
// Async generator producing values over time
async function* fetchPages(urls) {
  for (const url of urls) {
    const res = await fetch(url);
    yield await res.json();
  }
}

// Consume the async iterable
for await (const page of fetchPages(urlList)) {
  console.log(page.title);
}

// Node.js streams are async iterables
const { createReadStream } = require('fs');
const stream = createReadStream('large-file.txt', { encoding: 'utf8' });
for await (const chunk of stream) {
  process(chunk);
}
\`\`\`

Must be inside an \`async\` function. Use it when data arrives asynchronously over time: file streams, paginated APIs, WebSocket messages, or server-sent events. Unlike \`Promise.all\`, it processes values **sequentially**.`,
      difficulty: 3,
      tags: 'async-iteration,for-await-of,async-generators,streams',
    },
    {
      title: 'What are async generators?',
      answer: `Async generators combine \`async function*\` syntax — they can both \`await\` Promises and \`yield\` values. They return an async iterator consumed with \`for await...of\`. Ideal for lazy async data production, like streaming APIs or paginated data sources.

\`\`\`js
async function* paginatedFetch(baseUrl) {
  let page = 1;
  while (true) {
    const res = await fetch(\`\${baseUrl}?page=\${page}\`);
    const { data, hasNextPage } = await res.json();
    yield data; // yield each page of results
    if (!hasNextPage) break;
    page++;
  }
}

// Consumer gets each page lazily
for await (const pageData of paginatedFetch('/api/items')) {
  renderItems(pageData);
}
\`\`\`

Unlike regular async functions (single Promise) or sync generators (no await), async generators let you model streams of asynchronous data with natural backpressure — the producer only fetches the next page when the consumer calls \`next()\`.`,
      difficulty: 3,
      tags: 'generators,asynchronous,async-iteration,streams',
    },
    {
      title: 'What is the Intl internationalization API?',
      answer: `The \`Intl\` object provides language-sensitive formatting and comparison without external libraries. It handles numbers, dates, relative times, lists, and collation correctly for any locale.

\`\`\`js
// Numbers and currency
new Intl.NumberFormat('de-DE').format(1234567.89);
// '1.234.567,89'
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(99.5);
// '$99.50'

// Dates
new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date());
// '12 juin 2026'

// Relative time
new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day');
// 'yesterday'

// Pluralization
const pr = new Intl.PluralRules('en');
pr.select(1); // 'one'
pr.select(5); // 'other'

// List formatting
new Intl.ListFormat('en').format(['Alice', 'Bob', 'Carol']);
// 'Alice, Bob, and Carol'
\`\`\`

Always use \`Intl\` instead of hand-rolling locale logic. It uses CLDR data built into the engine and produces correct, locale-aware output for all supported locales.`,
      difficulty: 2,
      tags: 'internationalization,formatting,i18n,intl,localization',
    },
    {
      title: 'What is queueMicrotask() and why would you use it?',
      answer: `\`queueMicrotask(fn)\` schedules a function to run as a **microtask** — after the current synchronous code and any already-queued microtasks, but before any macrotasks (setTimeout, I/O). It avoids the overhead of creating a Promise just to schedule a microtask.

\`\`\`js
console.log('sync 1');

queueMicrotask(() => console.log('microtask'));

Promise.resolve().then(() => console.log('promise then'));

setTimeout(() => console.log('macrotask'), 0);

console.log('sync 2');

// Output: sync 1, sync 2, microtask, promise then, macrotask
\`\`\`

**Use cases:**
- Batch multiple synchronous updates and flush them as a microtask
- Deferring work until after the current synchronous code without using a full Promise
- Scheduling "end of current task" callbacks with less overhead than \`setTimeout(fn, 0)\`

Avoid using it excessively — infinite microtask loops can starve macrotasks and freeze the browser.`,
      difficulty: 2,
      tags: 'microtasks,async,event-loop,scheduling',
    },
    {
      title: 'What are Mixins and how are they implemented in JavaScript?',
      answer: `A **mixin** is a pattern for adding reusable behavior to classes without classical inheritance. JavaScript uses object composition — mixing methods from one object into another — rather than class hierarchies.

\`\`\`js
// Object-based mixin
const Serializable = {
  serialize() { return JSON.stringify(this); },
  deserialize(json) { return Object.assign(this, JSON.parse(json)); },
};

// Functional mixin (preferred)
const withLogging = (Base) => class extends Base {
  log(msg) { console.log(\`[\${this.constructor.name}] \${msg}\`); }
};

const withValidation = (Base) => class extends Base {
  validate() { return Object.values(this).every(v => v !== null); }
};

class User { constructor(name) { this.name = name; } }
class LoggingValidatingUser extends withLogging(withValidation(User)) {}

const u = new LoggingValidatingUser('Alice');
u.log('created'); // '[LoggingValidatingUser] created'
u.validate();     // true

// Applying to plain objects
Object.assign(UserClass.prototype, Serializable);
\`\`\`

Mixins favor **composition over inheritance** and avoid the fragile base class problem.`,
      difficulty: 2,
      tags: 'design-patterns,composition,mixins,inheritance',
    },
    {
      title: 'What is error.cause in ES2022?',
      answer: `\`error.cause\` lets you attach the **original error** when rethrowing or wrapping it, creating an explicit chain of causation. This preserves the original stack trace and diagnostic information without concatenating error messages.

\`\`\`js
async function fetchUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error('Bad response');
    return await res.json();
  } catch (originalError) {
    throw new Error(
      \`Failed to load user \${id}\`,
      { cause: originalError } // attach root cause
    );
  }
}

// Caller can inspect the full chain
try {
  await fetchUser(42);
} catch (err) {
  console.error(err.message);       // 'Failed to load user 42'
  console.error(err.cause?.message); // 'Bad response' (or network error)
}
\`\`\`

Before \`cause\`, developers concatenated messages (\`new Error('Failed: ' + originalError.message)\`) which lost stack frames. \`cause\` is now the idiomatic way to chain errors in JavaScript.`,
      difficulty: 2,
      tags: 'error-handling,es2022,error-cause,chaining',
    },
    {
      title: 'What are the new Set methods in ES2025?',
      answer: `ES2025 adds **set algebra methods** to \`Set\` — operations long available in other languages that previously required manual loops or library functions.

\`\`\`js
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);

a.union(b);              // Set {1, 2, 3, 4, 5, 6}
a.intersection(b);       // Set {3, 4}
a.difference(b);         // Set {1, 2} (in a but not b)
b.difference(a);         // Set {5, 6}
a.symmetricDifference(b); // Set {1, 2, 5, 6} (in either but not both)

// Predicate methods
a.isSubsetOf(new Set([1, 2, 3, 4, 5])); // true
a.isSupersetOf(new Set([1, 2]));         // true
a.isDisjointFrom(new Set([10, 11]));     // true (no common elements)
\`\`\`

These methods accept any **iterable** as the argument, not just other Sets. They return new Sets — the originals are not mutated. Available in all major browsers and Node.js 22+.`,
      difficulty: 2,
      tags: 'sets,es2025,set-algebra,collections',
    },
    {
      title: 'What is Object.groupBy() in ES2024?',
      answer: `\`Object.groupBy(iterable, keyFn)\` groups iterable elements by the return value of \`keyFn\`, returning a plain object where each key maps to an array of matching elements. \`Map.groupBy\` does the same but returns a \`Map\`, allowing any key type.

\`\`\`js
const products = [
  { name: 'Apple', category: 'fruit' },
  { name: 'Milk', category: 'dairy' },
  { name: 'Banana', category: 'fruit' },
  { name: 'Cheese', category: 'dairy' },
];

const byCategory = Object.groupBy(products, p => p.category);
// {
//   fruit: [{ name: 'Apple', ... }, { name: 'Banana', ... }],
//   dairy: [{ name: 'Milk', ... }, { name: 'Cheese', ... }]
// }

// Map.groupBy allows object keys
const byLength = Map.groupBy(products, p => p.name.length);
\`\`\`

Before \`Object.groupBy\`, this required \`reduce\` or \`lodash.groupBy\`. Available in all major browsers since late 2024 and Node.js 21+.`,
      difficulty: 2,
      tags: 'objects,grouping,es2024,array-methods',
    },
    {
      title: 'What is Array.fromAsync in ES2024?',
      answer: `\`Array.fromAsync(asyncIterable)\` converts an **async iterable** (or iterable of Promises) into an Array, awaiting each value in order. It is the async counterpart of \`Array.from()\`.

\`\`\`js
// From an async iterable (e.g., async generator)
async function* gen() {
  yield await fetchItem(1);
  yield await fetchItem(2);
  yield await fetchItem(3);
}
const items = await Array.fromAsync(gen()); // [item1, item2, item3]

// From an array of Promises (sequential, unlike Promise.all)
const pages = await Array.fromAsync([
  fetch('/page/1').then(r => r.json()),
  fetch('/page/2').then(r => r.json()),
]);

// With a map function
const doubled = await Array.fromAsync(gen(), x => x * 2);
\`\`\`

Unlike \`Promise.all\`, \`Array.fromAsync\` processes values **sequentially** (waits for each before requesting the next), which is appropriate for rate-limited APIs or streams with backpressure.`,
      difficulty: 2,
      tags: 'async,arrays,es2024,async-iteration',
    },
    {
      title: 'What are iterator helpers in ES2025?',
      answer: `ES2025 adds **lazy iterator methods** (analogous to array methods but lazy): \`.map\`, \`.filter\`, \`.take\`, \`.drop\`, \`.flatMap\`, \`.reduce\`, \`.toArray\`, \`.some\`, \`.every\`, \`.find\`. They work on any iterator (including generators) and process values **one at a time** without materializing intermediate arrays.

\`\`\`js
function* naturals() {
  let n = 0;
  while (true) yield ++n;
}

// Process an infinite sequence without allocating arrays
naturals()
  .filter(n => n % 2 === 0)  // lazy — doesn't run yet
  .map(n => n * n)           // lazy
  .take(5)                   // lazy
  .toArray();                // triggers: [4, 16, 36, 64, 100]

// Chaining is efficient — only processes needed elements
naturals().find(n => n > 1000); // stops at 1001 — no extra work
\`\`\`

Before iterator helpers, you had to convert to an array first (\`Array.from\`) which allocated memory. Lazy iteration is memory-efficient for large sequences and enables working with infinite generators.`,
      difficulty: 3,
      tags: 'iterators,lazy-evaluation,es2025,generators',
    },
    {
      title: 'What are TypedArrays and when would you use them?',
      answer: `TypedArrays provide array-like views over raw **binary memory** (\`ArrayBuffer\`). Each TypedArray type specifies a fixed element type and byte size: \`Uint8Array\`, \`Int32Array\`, \`Float64Array\`, etc.

\`\`\`js
// Create a buffer of 16 bytes
const buffer = new ArrayBuffer(16);

// Multiple views into the same buffer
const int32 = new Int32Array(buffer);   // 4 elements (4 bytes each)
const float64 = new Float64Array(buffer); // 2 elements (8 bytes each)

int32[0] = 42;
console.log(float64[0]); // reinterpreted bytes!

// Direct typed array creation
const pixels = new Uint8ClampedArray(width * height * 4); // RGBA
// Uint8ClampedArray clamps values to [0, 255] automatically

// WebGL vertex data
const vertices = new Float32Array([0, 0, 1, 0, 0.5, 1]);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
\`\`\`

**Use cases:** WebGL (vertex/index buffers), Web Audio (PCM samples), image processing (canvas pixel data), file reading (\`FileReader\`), binary protocol parsing, and shared memory via \`SharedArrayBuffer\`.`,
      difficulty: 3,
      tags: 'typedarrays,binary-data,performance,webgl,arraybuffer',
    },
    {
      title: 'How does the JavaScript engine (V8) optimize code?',
      answer: `V8 uses **Just-In-Time (JIT) compilation** to progressively optimize hot code paths:

1. **Parser** builds an AST from source code
2. **Ignition** (interpreter) generates bytecode and starts executing immediately
3. **TurboFan** (optimizing compiler) compiles hot functions to machine code based on observed types

**Key optimizations:**
- **Hidden classes (shapes):** V8 creates an internal shape for each object structure. Objects with the same shape share a class, making property lookup O(1)
- **Inline caching:** Caches the result of property lookups at call sites
- **Escape analysis:** Allocates short-lived objects on the stack instead of heap

\`\`\`js
// V8-friendly: consistent property shapes
function Point(x, y) { this.x = x; this.y = y; }
const p1 = new Point(1, 2);
const p2 = new Point(3, 4); // same hidden class → fast

// V8-unfriendly: dynamic properties break hidden classes
const obj = {};
obj.x = 1;  // shape 1
obj.y = 2;  // shape 2 (new shape)
\`\`\`

Write consistent, predictable code: same property addition order, monomorphic call sites, avoid mixing types in arrays.`,
      difficulty: 3,
      tags: 'optimization,v8,jit,hidden-classes,performance',
    },
    {
      title: 'What is the Singleton design pattern in JavaScript?',
      answer: `A **Singleton** ensures only one instance of an object is ever created and provides a global access point to it. Common for configuration, logging, database connections, and caches.

\`\`\`js
// Module-based singleton (ES6 modules are singletons by default)
// db.js
class Database {
  constructor() { this.connection = null; }
  connect(url) { this.connection = openConnection(url); }
}
export const db = new Database(); // single instance for the whole app

// Classic closure-based singleton
const Logger = (() => {
  let instance = null;
  class LoggerClass {
    log(msg) { console.log(\`[\${new Date().toISOString()}] \${msg}\`); }
  }
  return {
    getInstance() {
      if (!instance) instance = new LoggerClass();
      return instance;
    },
  };
})();

Logger.getInstance().log('App started');
Logger.getInstance() === Logger.getInstance(); // true
\`\`\`

In JavaScript, **ES modules are singletons** — the module is executed once and the same instance is returned on subsequent imports. This means you rarely need to implement the pattern explicitly.`,
      difficulty: 2,
      tags: 'design-patterns,singleton,classes,modules',
    },
    {
      title: 'What are "deopts" and what causes them in V8?',
      answer: `A **deoptimization (deopt)** occurs when V8's optimizing compiler (TurboFan) has to discard compiled machine code and fall back to the slower interpreter (Ignition) because its **type assumptions were violated**.

\`\`\`js
// V8 assumes the type stays consistent
function add(a, b) { return a + b; }
add(1, 2);      // V8 optimizes for number + number
add(1, 2);      // fast machine code
add('x', 'y'); // DEOPT — was optimized for numbers, now sees strings

// Avoid deopt triggers:
// 1. Don't mix types in arrays — [1, 'two', 3] deoptimizes
// 2. Don't add properties to objects after construction
// 3. Don't delete properties
// 4. Keep function argument types consistent across calls
function processArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    // if arr is sometimes dense, sometimes sparse — deopt
  }
}
\`\`\`

Check for deopts using Chrome's \`--trace-deopt\` flag or DevTools Performance panel. In most apps, deopts are invisible — only profile if you have a proven performance problem.`,
      difficulty: 3,
      tags: 'performance,deopts,v8,optimization,jit',
    },
    {
      title: 'How do you prevent expensive reflows and repaints in the browser?',
      answer: `**Reflow** (layout) recalculates element geometry. **Repaint** redraws pixels. Both are expensive, especially in animations. Triggering them inside loops causes **layout thrashing**.

\`\`\`js
// BAD: read-write interleaving forces repeated reflows
elements.forEach(el => {
  const height = el.offsetHeight; // forces reflow (read)
  el.style.height = height + 10 + 'px'; // causes reflow (write)
});

// GOOD: batch reads first, then writes
const heights = elements.map(el => el.offsetHeight); // batch reads
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // batch writes
});

// Use CSS transforms/opacity for animations — GPU composited
el.style.transform = 'translateX(100px)'; // no reflow
el.style.left = '100px';                  // CAUSES reflow
\`\`\`

**Best practices:**
- Use \`requestAnimationFrame\` for animation updates
- Use \`CSS containment\` (\`contain: layout\`) to limit reflow scope
- Prefer \`transform\` and \`opacity\` for animations (GPU composited)
- Use \`will-change: transform\` to hint the browser to promote elements to their own layer`,
      difficulty: 3,
      tags: 'performance,dom,reflow,repaint,rendering',
    },
    {
      title: 'What does String.prototype.replaceAll() do?',
      answer: `\`String.prototype.replaceAll(searchValue, replacement)\` (ES2021) replaces **every occurrence** of \`searchValue\` in a string. Before it, \`replace()\` with a string only replaced the first match — you needed a global regex (\`/pattern/g\`) to replace all.

\`\`\`js
const str = 'cat sat on the mat with another cat';

// Old approach — required global regex
str.replace(/cat/g, 'dog'); // 'dog sat on the mat with another dog'

// New approach — cleaner
str.replaceAll('cat', 'dog'); // 'dog sat on the mat with another dog'

// With a function as replacement
str.replaceAll('cat', (match) => match.toUpperCase());
// 'CAT sat on the mat with another CAT'

// Gotcha: replaceAll with a RegExp requires the /g flag (unlike string)
str.replaceAll(/cat/gi, 'dog'); // OK with global flag
str.replaceAll(/cat/i, 'dog');  // TypeError — must use /g with RegExp
\`\`\``,
      difficulty: 1,
      tags: 'strings,methods,es2021,replaceAll',
    },
    {
      title: 'What are Object.keys(), Object.values(), and Object.entries()?',
      answer: `These static methods return arrays of an object's **own enumerable** string-keyed properties, allowing easy iteration and transformation.

\`\`\`js
const user = { name: 'Alice', age: 30, role: 'admin' };

Object.keys(user);    // ['name', 'age', 'role']
Object.values(user);  // ['Alice', 30, 'admin']
Object.entries(user); // [['name', 'Alice'], ['age', 30], ['role', 'admin']]

// Common patterns
// Filter and reconstruct
const filtered = Object.fromEntries(
  Object.entries(user).filter(([key]) => key !== 'role')
);
// { name: 'Alice', age: 30 }

// Transform values
const uppercased = Object.fromEntries(
  Object.entries(user).map(([k, v]) => [k, String(v).toUpperCase()])
);

// Iterate
for (const [key, value] of Object.entries(user)) {
  console.log(\`\${key}: \${value}\`);
}
\`\`\`

Symbol-keyed and non-enumerable properties are excluded. Use \`Object.getOwnPropertyNames\` for non-enumerable keys or \`Reflect.ownKeys\` for symbols too.`,
      difficulty: 1,
      tags: 'objects,iteration,api,entries,keys,values',
    },
    {
      title: 'What is the difference between script, script async, and script defer?',
      answer: `HTML \`<script>\` loading strategy affects page performance significantly.

- **\`<script src="...">\`** — blocks HTML parsing, downloads and executes immediately
- **\`<script async>\`** — downloads in parallel with HTML parsing, executes as soon as downloaded (may interrupt parsing, order not guaranteed)
- **\`<script defer>\`** — downloads in parallel, executes **after HTML parsing completes**, in document order

\`\`\`html
<!-- Blocks parsing — avoid for large scripts in <head> -->
<script src="heavy.js"></script>

<!-- Good for independent analytics/tracking scripts -->
<script async src="analytics.js"></script>

<!-- Good for app scripts that need the full DOM but must run in order -->
<script defer src="app.js"></script>
<script defer src="plugin.js"></script>
<!-- Both execute after parse, in order: app.js then plugin.js -->
\`\`\`

**Rule of thumb:** Put \`defer\` scripts in \`<head>\` for early download start without blocking. Use \`async\` for scripts that are fully independent (tracking, ads). Modern bundlers/frameworks handle this automatically.`,
      difficulty: 2,
      tags: 'performance,html,scripts,loading,defer,async',
    },
    {
      title: 'What is the new.target meta-property?',
      answer: `\`new.target\` is a meta-property available inside functions and constructors. When a function is called with \`new\`, \`new.target\` refers to the constructor being called. When called normally (without \`new\`), \`new.target\` is \`undefined\`.

\`\`\`js
function Animal(name) {
  if (!new.target) {
    throw new Error('Animal must be called with new');
  }
  this.name = name;
}

new Animal('Dog'); // OK
Animal('Dog');     // Error: Animal must be called with new

// In ES6 classes — new.target is the actual class called (subclass-aware)
class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error('Shape is abstract — instantiate a subclass');
    }
  }
}

class Circle extends Shape {
  constructor(r) { super(); this.radius = r; }
}

new Circle(5);  // OK — new.target is Circle, not Shape
new Shape();    // Error — new.target is Shape
\`\`\`

Used to enforce abstract base classes, detect constructor invocation, and create factory functions that behave differently based on how they're called.`,
      difficulty: 2,
      tags: 'constructors,classes,metaprogramming,new-target',
    },
    {
      title: 'What is WeakSet and when would you use it?',
      answer: `\`WeakSet\` stores a collection of **objects** (no primitives) with **weak references** — if an object in the set has no other references, it can be garbage collected and is automatically removed from the set.

\`\`\`js
const visited = new WeakSet();

function processNode(node) {
  if (visited.has(node)) return; // already processed
  visited.add(node);
  // process node...
}

// When node is GC'd, the WeakSet entry disappears automatically
\`\`\`

**API:** Only \`add(obj)\`, \`has(obj)\`, \`delete(obj)\` — no iteration, no \`size\`, no \`clear\`.

**Use cases:**
- Tracking which DOM nodes have been processed without preventing their GC
- Marking objects as "seen" to prevent cycles in traversal
- Tagging private implementation details on objects without memory leaks

\`WeakSet\` vs \`Set\`: Use \`WeakSet\` when objects should be GC'd when they go out of scope. Use \`Set\` when you need iteration or non-object values.`,
      difficulty: 3,
      tags: 'weakset,collections,memory,gc,weak-references',
    },
    {
      title: 'What causes floating-point precision issues like 0.1 + 0.2 !== 0.3?',
      answer: `JavaScript uses **64-bit IEEE 754 double-precision floating-point** for all numbers. Most decimal fractions (like 0.1 and 0.2) cannot be represented exactly in binary — they are stored as the nearest representable binary fraction.

\`\`\`js
0.1 + 0.2;          // 0.30000000000000004
0.1 + 0.2 === 0.3;  // false

// Fix 1: epsilon comparison
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON; // true

// Fix 2: toFixed for display (not comparison)
(0.1 + 0.2).toFixed(1); // '0.3'

// Fix 3: integer arithmetic (scale up, compute, scale down)
function addMoney(a, b) {
  return (Math.round(a * 100) + Math.round(b * 100)) / 100;
}
addMoney(0.1, 0.2); // 0.3

// Fix 4: BigInt for exact integers
1n + 2n === 3n; // true, always exact
\`\`\`

For financial applications, store amounts as integer cents (e.g., \`150\` for \$1.50) or use libraries like \`decimal.js\` or \`big.js\` for arbitrary-precision arithmetic.`,
      difficulty: 2,
      tags: 'numbers,precision,floating-point,ieee754,math',
    },
    {
      title: 'What are service workers and what do they enable?',
      answer: `A **service worker** is a JavaScript file that runs in a background thread (like a Web Worker) and acts as a **network proxy** between the web app and the network. It intercepts fetch requests and can serve cached responses, enabling offline functionality.

\`\`\`js
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js — cache on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache =>
      cache.addAll(['/index.html', '/app.js', '/styles.css'])
    )
  );
});

// Intercept fetches — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ?? fetch(event.request)
    )
  );
});
\`\`\`

**Enables:** Offline access, background sync, push notifications, pre-caching assets for speed. **Requires:** HTTPS (except localhost). Service workers are the foundation of **Progressive Web Apps (PWAs)**.`,
      difficulty: 3,
      tags: 'service-workers,pwa,offline,caching,background',
    },
    {
      title: 'What is the Module Pattern and why was it important before ES modules?',
      answer: `The **Module Pattern** uses an **IIFE with a closure** to create private scope, exposing only a public API. It was the primary encapsulation mechanism in ES5 JavaScript before native modules existed.

\`\`\`js
const ShoppingCart = (function () {
  // Private state
  const items = [];
  let total = 0;

  // Private helper
  function recalculate() {
    total = items.reduce((sum, item) => sum + item.price, 0);
  }

  // Public API
  return {
    addItem(item) {
      items.push(item);
      recalculate();
    },
    removeItem(id) {
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) { items.splice(idx, 1); recalculate(); }
    },
    getTotal() { return total; },
    getItems() { return [...items]; }, // returns a copy
  };
})();

ShoppingCart.addItem({ id: 1, name: 'Book', price: 15 });
ShoppingCart.getTotal(); // 15
// items, total are private — not accessible outside
\`\`\`

Today, ES modules provide native encapsulation (each module has its own scope). The module pattern is now primarily seen in legacy codebases and libraries that must run without a bundler.`,
      difficulty: 2,
      tags: 'modules,encapsulation,module-pattern,iife,legacy',
    },
    {
      title: 'What is the difference between throw and Promise.reject()?',
      answer: `Both signal an error, but they operate in different contexts:

- **\`throw\`** works **synchronously** — it immediately unwinds the call stack until a \`try/catch\` intercepts it. If nothing catches it, it becomes an unhandled exception.
- **\`Promise.reject(reason)\`** returns a **rejected Promise** — the error is handled asynchronously via \`.catch()\` or \`await\` in a \`try/catch\`.

\`\`\`js
// throw in async function — caught by surrounding try/catch or .catch()
async function fetchData() {
  throw new Error('sync throw inside async'); // equivalent to Promise.reject
}

// These are equivalent inside async functions:
async function a() { throw new Error('x'); }
async function b() { return Promise.reject(new Error('x')); }

// Use throw in sync code or inside async functions
function validate(n) {
  if (n < 0) throw new RangeError('Must be positive'); // synchronous
}

// Use Promise.reject() in non-async contexts returning a Promise
function loadUser(id) {
  if (!id) return Promise.reject(new Error('id required'));
  return fetch(\`/users/\${id}\`);
}
\`\`\``,
      difficulty: 2,
      tags: 'error-handling,promises,throw,async',
    },
    {
      title: 'How do Promise.all() and Promise.allSettled() differ in practice?',
      answer: `Both run multiple Promises concurrently, but handle failures differently:

**\`Promise.all(promises)\`:** **Fails fast** — if any Promise rejects, the whole call rejects immediately and the rest are ignored. Use when all results are required and one failure means the operation should abort.

**\`Promise.allSettled(promises)\`:** **Always resolves** — waits for every Promise to finish and returns an array describing each outcome (\`{status: 'fulfilled', value}\` or \`{status: 'rejected', reason}\`). Use when you want to process partial results.

\`\`\`js
// Promise.all — if user fetch fails, posts never used
const [user, posts] = await Promise.all([
  fetchUser(id),  // if this rejects...
  fetchPosts(id), // ...this result is discarded
]);

// Promise.allSettled — process whatever succeeded
const results = await Promise.allSettled([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id),
]);
results.forEach(result => {
  if (result.status === 'fulfilled') displayData(result.value);
  else logError(result.reason);
});
\`\`\``,
      difficulty: 2,
      tags: 'promises,async,promise-all,allSettled,concurrency',
    },
    {
      title: 'What is String.prototype.matchAll() vs RegExp.exec() in a loop?',
      answer: `Both find all regex matches in a string, but \`matchAll()\` (ES2020) is cleaner and returns an **iterator of full match objects** including named capture groups.

\`\`\`js
const str = 'date: 2026-01-15, date: 2026-06-12';
const re = /date: (?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/g;

// Old approach: exec() in a loop (stateful, error-prone)
let match;
while ((match = re.exec(str)) !== null) {
  console.log(match.groups.year); // must use global regex
}

// Modern: matchAll() — clean, iterable, non-destructive
for (const match of str.matchAll(re)) {
  const { year, month, day } = match.groups;
  console.log(\`\${year}/\${month}/\${day}\`);
}

// Collect all matches
const dates = [...str.matchAll(re)].map(m => m.groups);
// [{ year: '2026', month: '01', day: '15' }, { year: '2026', month: '06', day: '12' }]
\`\`\`

\`matchAll\` requires a global (\`/g\`) regex and returns a fresh iterator each call — no shared state. Prefer it over the \`exec\` loop pattern.`,
      difficulty: 2,
      tags: 'regex,strings,matchAll,iteration,es2020',
    },
    {
      title: 'What are the differences between Map and plain objects as hash maps?',
      answer: `Both store key-value pairs, but \`Map\` has important advantages for use as a general-purpose hash map:

| | **Object** | **Map** |
|---|---|---|
| Key types | Strings + Symbols | Any value |
| Insertion order | Mostly maintained | Guaranteed |
| \`size\` property | Use \`Object.keys().length\` | \`.size\` |
| Iteration | \`Object.entries()\` | Directly iterable |
| Prototype collision | \`__proto__\`, \`toString\` | None |
| Performance (frequent add/delete) | Slower | Faster |

\`\`\`js
// Object — key collision risk
const obj = {};
obj['__proto__'] = 'danger'; // modifies prototype

// Map — safe for all key types
const map = new Map();
map.set({ id: 1 }, 'user data'); // object as key
map.set(42, 'number key');
map.set(true, 'boolean key');
map.size; // 3
for (const [key, val] of map) { /* ... */ }
\`\`\`

Use plain objects for static, string-keyed data (configs, records). Use \`Map\` for dynamic hash maps, non-string keys, or when insertion order and size matter.`,
      difficulty: 2,
      tags: 'collections,map,objects,hash-map,keys',
    },
    {
      title: 'What is the at() method on arrays and strings?',
      answer: `\`Array.prototype.at()\` and \`String.prototype.at()\` (ES2022) accept an integer index — including **negative integers** to count from the end — and return the element at that position. This is cleaner than the \`arr[arr.length - 1]\` pattern for last-element access.

\`\`\`js
const arr = [10, 20, 30, 40, 50];

arr.at(0);   // 10 (same as arr[0])
arr.at(-1);  // 50 (last element)
arr.at(-2);  // 40 (second to last)

// Old pattern (verbose)
arr[arr.length - 1]; // 50

const str = 'JavaScript';
str.at(0);   // 'J'
str.at(-1);  // 't' (last character)
str.at(-10); // 'J'
\`\`\`

\`at()\` returns \`undefined\` for out-of-bounds indices (like bracket notation). Unlike Python slice notation, there is no range syntax — for slices use \`slice()\`. The method is especially useful in chained expressions where you need the last element without a temporary variable.`,
      difficulty: 1,
      tags: 'arrays,strings,at-method,es2022,indexing',
    },
    {
      title: 'What is the difference between deep equality and reference equality?',
      answer: `**Reference equality** (\`===\`) checks whether two variables point to the **exact same object in memory**. **Deep equality** checks whether two objects have **identical structure and values** at every level.

\`\`\`js
const a = { x: 1, nested: { y: 2 } };
const b = { x: 1, nested: { y: 2 } };
const c = a;

a === b; // false — different objects in memory
a === c; // true  — same reference

// Deep equality — must be implemented (no native operator)
JSON.stringify(a) === JSON.stringify(b); // true (but brittle: key order, Date, etc.)

// Robust deep equal (recursive)
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => deepEqual(a[key], b[key]));
}
deepEqual(a, b); // true
\`\`\`

React, Immer, and testing frameworks (Jest's \`toEqual\`) all implement deep equality internally. Use \`structuredClone\` + \`===\` as a quick deep-equal trick (clones then compares) but prefer a proper implementation or library for production code.`,
      difficulty: 2,
      tags: 'comparison,objects,deep-equal,reference-equality',
    },
    {
      title: 'What are Object.assign() and spread for merging objects — how do they differ?',
      answer: `Both perform **shallow merging** of object properties, but they differ in syntax, return value, and prototype handling.

**\`Object.assign(target, ...sources)\`:** Mutates \`target\`, copies own enumerable string-keyed properties from sources into it, returns the mutated target.

**Spread (\`{...obj}\`):** Returns a **new object** without mutating anything. Slightly cleaner syntax, especially for multiple merges.

\`\`\`js
const defaults = { theme: 'light', lang: 'en', debug: false };
const overrides = { theme: 'dark', debug: true };

// Object.assign — mutates target
const merged1 = Object.assign({}, defaults, overrides);
// { theme: 'dark', lang: 'en', debug: true }

// Spread — new object
const merged2 = { ...defaults, ...overrides };
// { theme: 'dark', lang: 'en', debug: true } — same result

// Spread clone
const copy = { ...defaults }; // shallow copy, clean syntax

// Difference: Object.assign triggers setters; spread does not
\`\`\`

Neither handles nested objects — they copy the reference. For deep merging, use \`structuredClone\`, Lodash's \`mergeDeep\`, or Immer.`,
      difficulty: 1,
      tags: 'objects,copying,spread,object-assign,merging',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
