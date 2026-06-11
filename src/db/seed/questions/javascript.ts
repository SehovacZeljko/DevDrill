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
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
