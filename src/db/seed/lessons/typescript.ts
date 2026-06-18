import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What TypeScript Is and How It Relates to JavaScript',
    content: `TypeScript is a **superset** of JavaScript that adds a static type system, compiling (more precisely, "transpiling") down to plain JavaScript before it runs — every valid JavaScript file is already valid TypeScript, and TypeScript's types exist purely at compile time, fully erased from the emitted JavaScript with no runtime cost or behavior change.

\`\`\`typescript
function add(a: number, b: number): number {
  return a + b;
}
add(1, '2'); // compile-time error: Argument of type 'string' is not assignable to parameter of type 'number'
\`\`\`

This compile-time-only nature is a frequently misunderstood point worth stating precisely: TypeScript's type checker catches the mistake above *before* the code ever runs, but the compiled JavaScript output contains no trace of the type annotations at all — \`function add(a, b) { return a + b; }\` — meaning TypeScript provides zero runtime type safety on its own; a value arriving from outside the type-checked codebase (an API response, \`JSON.parse\` result, user input) can still violate a declared type at runtime with no automatic protection, which is why validating data at system boundaries (covered in a later lesson) remains necessary even in a fully-typed codebase.

The core value proposition interviewers expect articulated: catching an entire category of bugs (passing the wrong type, accessing a property that doesn't exist, forgetting to handle a \`null\` case) during development and in the editor via autocomplete/inline errors, rather than discovering them at runtime — shifting feedback as early as possible in the development cycle, which compounds significantly in larger codebases and larger teams where a function's actual expected inputs aren't always obvious from its name alone.`,
  },
  {
    title: 'Basic Types and Type Annotations',
    content: `TypeScript's basic types mirror JavaScript's primitives, with explicit syntax for declaring a variable or parameter's expected type — though in most cases, **type inference** (covered in its own lesson) makes explicit annotations on local variables unnecessary, with annotations being most valuable on function signatures (parameters and return types) where there's no initializing expression for the compiler to infer from.

\`\`\`typescript
let age: number = 30;
let name: string = 'Alice';
let isActive: boolean = true;
let tags: string[] = ['admin', 'editor'];        // array of strings
let coords: [number, number] = [10, 20];          // tuple — fixed length, fixed types per position
let id: number | string = 'abc123';               // union type — either type is acceptable
let anything: unknown = fetchSomeValue();          // unknown — type-safe alternative to any
\`\`\`

\`any\` opts a value entirely out of type checking — assigning it, calling arbitrary methods on it, anything goes, with no compiler error, ever. \`unknown\` is the type-safe counterpart: it accepts any value (like \`any\`), but the compiler refuses to let you do anything with an \`unknown\` value until you've **narrowed** it (via a type guard, \`typeof\` check, or assertion) to a more specific type first.

\`\`\`typescript
let a: any = fetchValue();
a.toUpperCase(); // no compile error, even if a is actually a number — crashes at runtime

let u: unknown = fetchValue();
u.toUpperCase(); // compile error: Object is of type 'unknown' — forces a check first
if (typeof u === 'string') {
  u.toUpperCase(); // fine — narrowed to string within this block
}
\`\`\`

The interview-relevant rule: prefer \`unknown\` over \`any\` for genuinely unknown values (e.g. a parsed JSON response, a catch block's error parameter) — \`any\` should be treated as an explicit, deliberate escape hatch used sparingly, not a default fallback whenever a type is inconvenient to express, since each \`any\` silently disables type checking for everything that value touches.`,
  },
  {
    title: 'Interfaces and Type Aliases',
    content: `Both \`interface\` and \`type\` describe the shape of an object, and for plain object shapes their capabilities overlap heavily — the practical differences matter mainly at the edges.

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string; // optional property
}

type UserAlias = {
  id: number;
  name: string;
  email?: string;
};
\`\`\`

Key differences: **interfaces support declaration merging** — defining the same interface name twice in the same scope merges their members into one combined interface, which is occasionally useful for extending third-party library types, but can also happen accidentally and confusingly; **type aliases can name anything**, not just object shapes — unions, tuples, primitives, mapped types (\`type ID = string | number;\`), whereas a plain \`interface\` is restricted to object-like shapes; and **interfaces extend other interfaces** with \`extends\`, while type aliases compose via intersection (\`&\`) — both achieve a similar combining effect with different syntax.

\`\`\`typescript
interface Admin extends User {
  permissions: string[];
}

type AdminAlias = UserAlias & { permissions: string[] };
\`\`\`

The interview-relevant practical guidance most style guides converge on: use \`interface\` for object shapes that represent things like component props, API response shapes, or class contracts (especially anything that might need to be extended later), and reach for \`type\` when you need a union, a tuple, or a type derived from another type via mapped/conditional types — the choice rarely matters for simple object shapes, but knowing the actual capability differences (not just "they're basically the same") is what interviewers are checking for.`,
  },
  {
    title: 'Functions: Parameter Types, Return Types, and Optional Parameters',
    content: `TypeScript lets you annotate function parameters and return types explicitly, and supports optional parameters, default parameters, and rest parameters with full type checking on each.

\`\`\`typescript
function greet(name: string, greeting: string = 'Hello'): string {
  return \`\${greeting}, \${name}!\`;
}
greet('Alice');              // 'Hello, Alice!' — greeting defaults
greet('Alice', 'Hi');         // 'Hi, Alice!'

function describe(name: string, age?: number): string {
  return age !== undefined ? \`\${name} is \${age}\` : name;
}
describe('Bob');              // age is undefined, valid — optional parameter
describe('Bob', 25);

function sum(...nums: number[]): number {
  return nums.reduce((total, n) => total + n, 0); // rest parameter, typed as number[]
}
\`\`\`

A subtlety worth knowing: **optional parameters (\`?\`) must come after required parameters** in the parameter list — TypeScript enforces this at the type level since a required parameter can't meaningfully follow an omittable one positionally. Default parameters are technically optional too (callers may omit them), and TypeScript infers the parameter's type from the default value if no explicit annotation is given.

Function **return type annotations** are optional (TypeScript infers the return type from the function body), but explicitly annotating them on exported/public functions is widely recommended practice — it catches a class of bugs where a function's implementation accidentally changes to return a different type than originally intended, since the annotation acts as an explicit contract the compiler checks the implementation against, rather than passively inferring whatever the body happens to currently produce.`,
  },
  {
    title: 'Union and Intersection Types',
    content: `A **union type** (\`A | B\`) describes a value that could be *either* type — the value's actual type is narrowed at specific points in the code via type guards, and the compiler only permits operations valid across *every* member of the union unless narrowed first. An **intersection type** (\`A & B\`) describes a value that satisfies *all* the combined types simultaneously — typically used to combine multiple object shapes into one that has every property from each.

\`\`\`typescript
type Status = 'pending' | 'active' | 'archived'; // a "string literal union" — exactly these three values
function setStatus(status: Status) { /* ... */ }
setStatus('active');     // fine
setStatus('deleted');    // compile error: not assignable to type 'Status'

function printId(id: number | string) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase()); // narrowed to string here — toUpperCase is safe
  } else {
    console.log(id.toFixed(2));    // narrowed to number here
  }
}

type HasName = { name: string };
type HasAge = { age: number };
type Person = HasName & HasAge; // must have BOTH name and age
const p: Person = { name: 'Alice', age: 30 };
\`\`\`

**String literal union types** (the \`Status\` example) are a particularly high-value TypeScript pattern — they restrict a value to an exact, exhaustive set of allowed strings, catching typos (\`'pendng'\`) at compile time that a plain \`string\` type would never catch, and they pair naturally with a \`switch\` statement that the compiler can verify is **exhaustive** (every possible value handled) when combined with discriminated unions, covered in the advanced lessons.

The interview-relevant mental model: unions represent "could be any of these" (requiring narrowing before type-specific operations are safe), while intersections represent "is definitely all of these simultaneously" (every property from every combined type is available immediately, no narrowing needed).`,
  },
  {
    title: 'Type Inference',
    content: `TypeScript can determine a variable, parameter, or return type automatically from context, without an explicit annotation — **type inference** is what makes TypeScript practical to write without annotating literally everything, since the compiler is often able to deduce the same type a human would have written by hand.

\`\`\`typescript
let count = 5;          // inferred as number
let name = 'Alice';     // inferred as string
let list = [1, 2, 3];   // inferred as number[]

function double(x: number) {
  return x * 2;          // return type inferred as number, no annotation needed
}

const user = { id: 1, name: 'Bob' }; // inferred as { id: number; name: string }
\`\`\`

Inference also flows through generic functions and library APIs — calling \`Array.prototype.map\` with a callback that returns a string infers the resulting array as \`string[]\` without any explicit type argument, and a well-typed third-party library often makes annotating your own calling code entirely unnecessary, since the library's own type definitions carry the necessary information through.

A common point of confusion is **contextual typing**, where inference flows the *other direction* — from an expected type into an expression — such as inferring a callback's parameter types from the function signature it's being passed to:

\`\`\`typescript
const numbers = [1, 2, 3];
numbers.forEach((n) => console.log(n.toFixed(2))); // n inferred as number from forEach's signature, no annotation needed
\`\`\`

The interview-relevant practical guidance: lean on inference for local variables and straightforward expressions (annotating \`let count: number = 5\` is redundant noise), but annotate explicitly at boundaries where inference would be ambiguous or where you want to lock in an intentional contract — function parameters (never inferred from the call site, since a function's parameter types must be specified or annotated, not inferred from usage) and exported function return types being the most important cases.`,
  },
  {
    title: 'Type Narrowing and Type Guards',
    content: `**Narrowing** is the process by which TypeScript refines a broader type (often a union) to a more specific one within a particular code branch, based on a runtime check — this is what lets code safely use type-specific operations after confirming which member of a union it's actually dealing with.

\`\`\`typescript
function process(value: string | number | string[]) {
  if (typeof value === 'string') {
    value.toUpperCase();          // narrowed to string
  } else if (Array.isArray(value)) {
    value.join(', ');             // narrowed to string[]
  } else {
    value.toFixed(2);             // narrowed to number, by elimination
  }
}
\`\`\`

Common narrowing techniques: \`typeof\` checks (for primitives), \`Array.isArray()\` (distinguishing arrays from other object types), \`instanceof\` (for class instances), \`in\` checks (testing whether a specific property exists, useful for distinguishing between object shapes without a common discriminant property), and equality/truthiness checks (\`if (value)\` narrows away \`null\`/\`undefined\` from a union).

\`\`\`typescript
interface Cat { meow(): void; }
interface Dog { bark(): void; }
function makeSound(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow(); // narrowed to Cat
  } else {
    animal.bark(); // narrowed to Dog
  }
}
\`\`\`

Custom **user-defined type guards** let you encapsulate a narrowing check into a reusable function, using the \`value is Type\` return type predicate syntax — the compiler trusts the function's declared predicate and narrows accordingly wherever it's called as a condition, which is essential for narrowing logic more complex than a single \`typeof\`/\`instanceof\` check:

\`\`\`typescript
function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal;
}
if (isCat(animal)) { animal.meow(); } // narrowed via the custom guard
\`\`\``,
  },
  {
    title: 'Enums and Literal Types',
    content: `\`enum\` defines a named set of constant values, primarily used for representing a fixed set of related options with meaningful names rather than raw strings or numbers scattered through the code.

\`\`\`typescript
enum Status {
  Pending,   // 0
  Active,    // 1
  Archived,  // 2
}
let s: Status = Status.Active; // s === 1, but typed and named meaningfully

enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE',
}
\`\`\`

Numeric enums (the default, without explicit values) auto-increment from 0 unless given explicit values, and compile to a real runtime object (not erased like most TypeScript constructs) — meaning enums have an actual runtime footprint and can be inspected/iterated at runtime, unlike type aliases or interfaces which vanish entirely after compilation.

A widely-discussed alternative is using a **string literal union** instead of an enum for the same purpose:

\`\`\`typescript
type Status = 'pending' | 'active' | 'archived'; // no runtime object at all — pure compile-time type
const s: Status = 'active';
\`\`\`

The interview-relevant tradeoff: string literal unions have zero runtime cost (fully erased, like other types) and serialize naturally to JSON as their literal string value, while enums provide a named, importable runtime value and (for numeric enums) two-way mapping between name and value — many style guides today (including TypeScript's own team in some contexts) lean toward string literal unions for simple fixed-option scenarios specifically because of the zero runtime footprint, reserving full \`enum\` usage for cases where the runtime object itself (e.g. iterating all enum values, or needing the reverse numeric-to-name lookup) is genuinely needed.`,
  },
  {
    title: 'Classes and Access Modifiers',
    content: `TypeScript extends JavaScript's \`class\` syntax with access modifiers (\`public\`, \`private\`, \`protected\`) and a constructor parameter shorthand that declares and assigns a property in one step — purely compile-time enforcement, since (prior to native private fields) these modifiers compile away entirely, providing no runtime protection on their own.

\`\`\`typescript
class BankAccount {
  private balance: number;
  protected accountId: string;
  public owner: string;

  constructor(owner: string, accountId: string, initialBalance: number) {
    this.owner = owner;
    this.accountId = accountId;
    this.balance = initialBalance;
  }

  deposit(amount: number): void {
    this.balance += amount; // fine — within the class
  }
}
const acc = new BankAccount('Alice', 'acc-1', 100);
acc.balance; // compile error: 'balance' is private and only accessible within class 'BankAccount'
\`\`\`

\`public\` (the default) is accessible anywhere; \`private\` is accessible only within the declaring class itself; \`protected\` is accessible within the declaring class and its subclasses, but not from outside the class hierarchy entirely. The **constructor parameter shorthand** eliminates repetitive declare-then-assign boilerplate:

\`\`\`typescript
class Point {
  constructor(public x: number, public y: number) {} // declares AND assigns x, y in one line
}
const p = new Point(3, 4); // p.x === 3, p.y === 4, no explicit assignment statements needed
\`\`\`

For genuine *runtime* privacy (not just compile-time, since TypeScript's \`private\` can still be bypassed via type assertions or by accessing the compiled JavaScript directly), native JavaScript **private fields** (\`#balance\`) are the stronger option — they're enforced by the JavaScript engine itself at runtime, not just by the TypeScript compiler, and are genuinely inaccessible from outside the class under any circumstance, including from TypeScript code using type-system tricks to bypass \`private\`.`,
  },
  {
    title: 'Generics: The Basics',
    content: `Generics let a function, interface, or class be written once and work with multiple types while preserving the specific type relationship between inputs and outputs — rather than using \`any\` (which discards type information entirely) or writing near-duplicate functions for each concrete type.

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}
identity<string>('hello'); // T inferred/specified as string, returns string
identity(42);                // T inferred as number, returns number — explicit <T> often unnecessary

function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}
firstElement([1, 2, 3]);        // T = number, returns number | undefined
firstElement(['a', 'b']);        // T = string, returns string | undefined
\`\`\`

The key value generics provide over \`any\`: the relationship between the input type and output type is preserved and checked — \`firstElement\` with \`any\` would compile but provide no guarantee about what comes back; with a generic \`<T>\`, the compiler knows precisely that calling it with \`number[]\` returns \`number | undefined\`, and any code using that result is checked against that specific, accurate type.

Generic interfaces and classes follow the same principle for stateful or structured generic types:

\`\`\`typescript
interface Box<T> {
  value: T;
}
const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: 'hello' };

class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
\`\`\`

The interview-relevant framing: generics are TypeScript's tool for writing reusable code *without* sacrificing type safety — recognizing "this function's behavior is the same regardless of the specific type, but the type should flow through from input to output" is the signal that a generic, rather than \`any\` or a union of every possible concrete type, is the right tool.`,
  },
  {
    title: 'Array and Object Type Patterns',
    content: `Beyond basic \`T[]\` array typing, TypeScript provides several patterns for precisely typing array and object structures that come up constantly in real application code.

\`\`\`typescript
type ReadonlyNumbers = readonly number[]; // cannot be mutated — push/pop/sort are compile errors
const nums: ReadonlyNumbers = [1, 2, 3];
nums.push(4); // compile error: Property 'push' does not exist on type 'readonly number[]'

interface ApiResponse {
  data: Record<string, unknown>; // an object with string keys and unknown-typed values
}

type Coordinates = [x: number, y: number, z?: number]; // labeled, partially-optional tuple
const point: Coordinates = [1, 2]; // z omitted, fine — it's optional
\`\`\`

\`Record<K, V>\` is a built-in utility type representing an object type with keys of type \`K\` and values of type \`V\` — frequently used for dictionaries/maps where the value type is consistent across all keys, e.g. \`Record<string, number>\` for a tally of counts keyed by name, more precise than a plain \`{ [key: string]: number }\` index signature though functionally similar.

\`\`\`typescript
const scoresByPlayer: Record<string, number> = { alice: 95, bob: 87 };

type Theme = 'light' | 'dark';
const themeLabels: Record<Theme, string> = { light: 'Light Mode', dark: 'Dark Mode' };
// Record<Theme, string> ALSO enforces that every Theme value has a corresponding entry —
// omitting "dark" here would be a compile error, unlike a generic string-keyed object
\`\`\`

The interview-relevant point about that last example: combining \`Record\` with a union type (rather than a plain \`string\`) gives you compiler-enforced exhaustiveness for free — a powerful, frequently underused pattern for things like per-status labels, per-locale translations, or per-enum-value configuration objects, where forgetting an entry should be a compile error, not a runtime \`undefined\`.`,
  },
  {
    title: 'tsconfig.json and Compiler Strictness',
    content: `\`tsconfig.json\` configures how the TypeScript compiler behaves — which files to include, what JavaScript version to target, module resolution strategy, and critically, how strict the type checking itself is, which has an outsized effect on how much real protection a TypeScript codebase actually gets.

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "noUnusedLocals": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
\`\`\`

\`"strict": true\` is a single flag that enables a whole bundle of individually-toggleable stricter checks, the most consequential being \`strictNullChecks\` — without it, \`null\` and \`undefined\` are silently assignable to *every* type (meaning a declared \`string\` parameter could actually be \`null\` at runtime with zero compiler warning), which defeats much of the practical value of static typing for catching the extremely common "cannot read property of undefined" class of runtime errors.

\`\`\`typescript
// without strictNullChecks:
function greet(name: string) { return name.toUpperCase(); }
greet(null); // compiles fine without strictNullChecks — crashes at runtime

// with strictNullChecks:
greet(null); // compile error: Argument of type 'null' is not assignable to parameter of type 'string'
\`\`\`

The interview-relevant practical guidance: \`"strict": true\` should be the default for any new TypeScript project — disabling it (or individual strict flags) trades away exactly the safety guarantees that are TypeScript's main reason for existing, and a codebase that's "TypeScript" without strict null checks in particular provides meaningfully weaker protection than most developers assume when they see \`.ts\` file extensions, which is a genuinely common and consequential misconception worth being able to name explicitly.`,
  },
  {
    title: 'Type Assertions and the Non-Null Assertion Operator',
    content: `A **type assertion** (\`as Type\`) tells the compiler to treat a value as a specific type without performing any actual runtime conversion or check — unlike a function call, it has zero runtime effect at all; it only changes what the compiler believes about the value's type from that point forward, which makes it fundamentally different from type coercion or validation.

\`\`\`typescript
const input = document.getElementById('email') as HTMLInputElement;
input.value; // compiles — HTMLInputElement has .value, but getElementById's actual return type is broader

const data: unknown = JSON.parse(jsonString);
const user = data as { id: number; name: string }; // asserts the shape, doesn't verify it at runtime
\`\`\`

Because an assertion provides no runtime guarantee, asserting an incorrect type compiles successfully and then fails unpredictably wherever the mismatched assumption is actually used — assertions should be reserved for cases where you have information the compiler genuinely can't infer (e.g. you know a DOM query will find an \`<input>\` element specifically), not as a routine way to silence a type error you don't want to actually resolve.

The **non-null assertion operator** (\`!\`) is a narrower, specific case of the same idea — asserting that a value isn't \`null\` or \`undefined\` even though its declared type includes them:

\`\`\`typescript
function getElement(id: string): HTMLElement | null {
  return document.getElementById(id);
}
const el = getElement('app')!; // asserts non-null — but if it actually IS null, this crashes downstream, not here
el.textContent = 'Hello';
\`\`\`

The interview-relevant caution: both forms of assertion are deliberate opt-outs from the type checker's protection, accepted by the compiler at face value with no verification — overusing them (especially \`!\` to silence \`strictNullChecks\` errors reflexively rather than actually handling the \`null\` case) reintroduces exactly the runtime "cannot read property of X of null" bugs that strict null checking exists to catch, just moved one step later and harder to trace back to its source.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Generic Constraints and Default Type Parameters',
    content: `A generic type parameter can be **constrained** with \`extends\` to require that whatever type is substituted for it satisfies a minimum shape — this lets a generic function safely access specific properties or methods that an unconstrained \`<T>\` wouldn't guarantee exist.

\`\`\`typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length; // safe — T is guaranteed to have a "length" property
}
getLength('hello');        // string has .length — fine
getLength([1, 2, 3]);       // array has .length — fine
getLength(42);               // compile error: number doesn't satisfy { length: number }

function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // K constrained to actual keys of T — can't pass a nonexistent key
}
pluck({ name: 'Alice', age: 30 }, 'name'); // returns string, correctly inferred
pluck({ name: 'Alice', age: 30 }, 'email'); // compile error: 'email' is not a key of the object
\`\`\`

\`keyof T\` (used in \`pluck\` above) produces a union of all of \`T\`'s property names as string literal types — combined with a constrained generic, this is the mechanism behind fully type-safe "get a property by dynamic key name" utilities, where the return type is correctly inferred as specifically the type of that particular property, not a generic catch-all.

**Default type parameters** let a generic specify a fallback type used when the caller doesn't explicitly provide one:

\`\`\`typescript
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}
function fetchData(): ApiResponse { /* T defaults to unknown */ }
function fetchUser(): ApiResponse<User> { /* T explicitly User */ }
\`\`\`

The interview-relevant skill being tested with constraints specifically: recognizing when a generic function's body needs to rely on some property/method existing on the generic type, and reaching for \`extends\` to encode that requirement in the signature itself — rather than either over-constraining to one concrete type (losing genericity) or under-constraining with a bare \`<T>\` and then needing unsafe casts inside the function body to access properties the compiler can't otherwise verify exist.`,
  },
  {
    title: 'Conditional Types',
    content: `A **conditional type** chooses between two types based on a type-level condition, using syntax that mirrors a ternary expression but operates on types rather than values — \`T extends U ? X : Y\` resolves to \`X\` if \`T\` is assignable to \`U\`, otherwise \`Y\`.

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<42>;       // false

type ExtractArrayType<T> = T extends (infer U)[] ? U : T;
type C = ExtractArrayType<string[]>; // string
type D = ExtractArrayType<number>;   // number (unchanged — not an array)
\`\`\`

The \`infer\` keyword (used in \`ExtractArrayType\`) captures a type within the condition for reuse on the "true" branch — this is exactly the mechanism behind several built-in utility types, including \`ReturnType<T>\` (extracts a function's return type) and \`Parameters<T>\` (extracts a function's parameter types as a tuple):

\`\`\`typescript
type MyReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;
function getUser() { return { id: 1, name: 'Alice' }; }
type User = MyReturnType<typeof getUser>; // { id: number; name: string }
\`\`\`

Conditional types **distribute over unions** automatically when the checked type is a "naked" generic type parameter — applying a conditional type to a union type applies the condition to each member individually and unions the results, a behavior worth knowing explicitly since it's the source of some of the more surprising/powerful conditional type behavior:

\`\`\`typescript
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[] — distributed over the union members
\`\`\`

The interview-relevant takeaway: conditional types (along with \`infer\`) are what let TypeScript's type system express genuinely complex, derived relationships between types — most application code never needs to *write* conditional types directly, but understanding them explains how many of TypeScript's built-in utility types actually work under the hood, which matters when debugging a confusing type error originating from one of them.`,
  },
  {
    title: 'Mapped Types',
    content: `A **mapped type** transforms an existing type's properties uniformly, iterating over its keys with \`[K in keyof T]\` syntax to produce a new type — this is the mechanism implementing several of TypeScript's most-used built-in utility types.

\`\`\`typescript
type Readonly2<T> = { readonly [K in keyof T]: T[K] };
type Partial2<T> = { [K in keyof T]?: T[K] };
type Required2<T> = { [K in keyof T]-?: T[K] }; // the "-?" removes optionality

interface User { id: number; name: string; email?: string; }
type ReadonlyUser = Readonly2<User>; // every property becomes readonly
type PartialUser = Partial2<User>;    // every property becomes optional
\`\`\`

These hand-written examples mirror TypeScript's actual built-in utility types — \`Readonly<T>\`, \`Partial<T>\`, and \`Required<T>\` are implemented using exactly this mapped-type mechanism in TypeScript's own standard library definitions, not special-cased compiler magic, which is why understanding mapped types explains *how* those familiar utilities actually work rather than treating them as unexplainable built-ins.

\`\`\`typescript
type Pick2<T, K extends keyof T> = { [P in K]: T[P] }; // select a subset of keys
type Omit2<T, K extends keyof T> = Pick2<T, Exclude<keyof T, K>>; // Omit built from Pick + Exclude

type UserPreview = Pick<User, 'id' | 'name'>; // { id: number; name: string }
type UserWithoutEmail = Omit<User, 'email'>;   // everything except email
\`\`\`

**Key remapping** (a more advanced mapped-type feature using \`as\`) lets a mapped type also transform the property *names*, not just their value types — e.g. building a type where every property is prefixed with \`on\` and turned into an event-handler function, a pattern that appears in real-world UI library type definitions for derived prop types:

\`\`\`typescript
type EventHandlers<T> = { [K in keyof T as \`on\${Capitalize<string & K>}\`]: (value: T[K]) => void };
type UserHandlers = EventHandlers<User>; // { onId: (value: number) => void; onName: (value: string) => void; ... }
\`\`\`

The interview-relevant takeaway: mapped types are the general-purpose tool for "derive a new type from an existing one, transforming every property the same way" — recognizing this pattern explains a large fraction of TypeScript's standard library utility types and is the foundation for writing your own reusable type transformations rather than manually duplicating a type with small variations.`,
  },
  {
    title: 'Discriminated Unions and Exhaustiveness Checking',
    content: `A **discriminated union** is a union of object types that share a common, literally-typed property (the "discriminant" or "tag") whose specific value identifies which member of the union a given value actually is — combined with narrowing on that discriminant, this is the standard, type-safe pattern for representing "one of several distinct variants" in TypeScript.

\`\`\`typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;       // narrowed to the circle variant
    case 'rectangle': return shape.width * shape.height;       // narrowed to the rectangle variant
    case 'triangle': return (shape.base * shape.height) / 2;   // narrowed to the triangle variant
  }
}
\`\`\`

Checking \`shape.kind\` in each \`case\` branch narrows \`shape\` to exactly that variant within the branch — accessing \`shape.radius\` is only valid inside the \`'circle'\` case, and attempting it inside the \`'rectangle'\` case (where \`shape\` is narrowed to a type that doesn't have \`radius\`) is a compile error, exactly the protection a plain object type without a discriminant couldn't provide.

**Exhaustiveness checking** uses the \`never\` type to make the compiler flag a switch statement that doesn't handle every union member — adding a new variant to \`Shape\` without updating every switch over it then produces a compile error rather than a silently-skipped case at runtime:

\`\`\`typescript
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    default:
      const _exhaustive: never = shape; // compile error if any Shape variant isn't handled above
      throw new Error(\`Unhandled shape kind\`);
  }
}
\`\`\`

The interview-relevant value: this pattern converts "did I forget to handle a case" from a runtime bug discovered later (or never) into an immediate compile-time error the moment a new variant is added anywhere the union is used — a substantial real-world safety net any time a codebase models distinct variants (API response types, Redux actions, state machine states) as a discriminated union rather than a loosely-typed object with optional fields.`,
  },
  {
    title: 'Type-Safe API Boundaries: Validating External Data',
    content: `TypeScript's type system is purely compile-time and fully trusts type annotations — when data crosses a true runtime boundary (an HTTP response, \`JSON.parse\`, user input, a database query result), TypeScript provides **no actual guarantee** that the data matches the declared type, since nothing about an HTTP response inherently knows or enforces the shape a TypeScript interface claims it has.

\`\`\`typescript
interface User { id: number; name: string; }
async function getUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json(); // TypeScript trusts this is a User — but it's actually "any" at runtime
}
// if the API actually returns { id: "1", username: "alice" }, TypeScript won't catch the mismatch —
// the code compiles fine and fails unpredictably wherever the mismatched fields are later used
\`\`\`

The standard fix is **runtime validation libraries** (Zod, io-ts, Yup, and others) that define a schema once and derive both a runtime validator *and* a static TypeScript type from the same single source of truth — eliminating the risk of the type annotation and the actual runtime check silently drifting out of sync with each other over time.

\`\`\`typescript
import { z } from 'zod';
const UserSchema = z.object({ id: z.number(), name: z.string() });
type User = z.infer<typeof UserSchema>; // TypeScript type derived directly from the schema

async function getUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return UserSchema.parse(data); // throws at runtime if the actual shape doesn't match — fails loudly and immediately, not silently
}
\`\`\`

The interview-relevant principle, a direct continuation of the fundamentals lesson on TypeScript's compile-time-only nature: type annotations describe an *assumption*, not a *guarantee*, anywhere external data enters the system — validating at exactly those boundaries (and trusting the type system everywhere else, inside the already-validated, fully type-checked portion of the codebase) is the practical way real production TypeScript codebases reconcile compile-time types with the reality of untrusted runtime data.`,
  },
  {
    title: 'Declaration Files and Typing Untyped JavaScript',
    content: `A \`.d.ts\` **declaration file** contains only type information — no actual implementation code — describing the shape of values, functions, and modules for code the TypeScript compiler otherwise has no type information about, most commonly a JavaScript library with no built-in types.

\`\`\`typescript
// my-library.d.ts
declare module 'my-untyped-library' {
  export function doSomething(value: string): number;
  export interface Options {
    verbose?: boolean;
  }
}
\`\`\`

Many popular JavaScript libraries ship their own \`.d.ts\` files (or have community-maintained ones published separately under the \`@types/\` npm scope, e.g. \`@types/lodash\`) — when neither exists for a given untyped dependency, a project can either write its own minimal declaration file (as above, describing just enough of the API surface actually used) or fall back to a blunt \`declare module 'my-untyped-library';\` with no members specified, which makes every import from that module typed as \`any\` — type-safe nowhere, but at least compiles without error.

When TypeScript compiles a library *of its own*, it can automatically emit matching \`.d.ts\` files for consumers (via the \`declaration: true\` compiler option) — this is how published TypeScript-authored npm packages provide types to consumers without consumers needing any separate \`@types\` package: the published package includes its own generated declaration files describing its actual public API.

The interview-relevant practical skill: recognizing when a type error or missing type ("Cannot find module 'x' or its corresponding type declarations") stems from a genuinely untyped dependency, and knowing the available remedies in order of preference — check for an official or \`@types/\` package first, write a minimal targeted declaration file second, and fall back to a blanket \`any\`-typed module declaration only as a last resort, since that last option silently reintroduces exactly the lack of type safety TypeScript exists to prevent for any code touching that dependency.`,
  },
  {
    title: 'Structural Typing and Type Compatibility',
    content: `TypeScript uses **structural typing** (sometimes called "duck typing" at the type level) — two types are considered compatible if their *shapes* match, regardless of how (or whether) they were explicitly declared to be related, in sharp contrast to **nominal typing** (used by languages like Java or C#), where compatibility requires an explicit, named inheritance or interface-implementation relationship.

\`\`\`typescript
interface Point2D { x: number; y: number; }
interface Vector { x: number; y: number; }

function printPoint(p: Point2D) { console.log(\`\${p.x}, \${p.y}\`); }

const v: Vector = { x: 1, y: 2 };
printPoint(v); // compiles fine — Vector and Point2D are never related by name, but have the same shape

const literal = { x: 5, y: 10, z: 15 };
printPoint(literal); // ALSO compiles — has at least the required x and y properties (extra ones are fine)
\`\`\`

This has a notable asymmetry worth knowing precisely: structural compatibility generally requires the *target* type's properties to be present (extra properties on the source are usually fine, as in the \`literal\` example), but **object literals assigned directly** are checked more strictly via "excess property checking" — passing an object literal (not stored in a variable first) with a property the target type doesn't declare is flagged as a likely typo, even though the same value via a variable would be accepted:

\`\`\`typescript
printPoint({ x: 1, y: 2, z: 3 }); // compile error: 'z' does not exist in type 'Point2D' — excess property check
const obj = { x: 1, y: 2, z: 3 };
printPoint(obj); // compiles fine — structural compatibility applies once it's not a literal being checked directly
\`\`\`

The interview-relevant consequence of structural typing broadly: TypeScript classes and interfaces don't need any explicit \`implements\` relationship for compatibility to hold — a class is assignable to an interface type purely because its instances happen to have the right shape, which is a deliberate, foundational design choice (distinct from nominally-typed languages) that makes TypeScript's type system feel closer to JavaScript's own dynamic, shape-based nature, at the cost of occasionally surprising compatibility between types that were never intentionally designed to be related.`,
  },
  {
    title: 'Variance: Covariance and Contravariance in Function Types',
    content: `**Variance** describes how subtyping relationships between two types affect the subtyping relationship between compound types built from them (arrays of those types, or functions taking/returning those types) — TypeScript function parameter types behave **contravariantly** while return types behave **covariantly**, a distinction that explains some otherwise-confusing type errors involving callback parameters.

\`\`\`typescript
class Animal { name = 'animal'; }
class Dog extends Animal { breed = 'labrador'; }

type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handleAnimal: AnimalHandler = (animal) => console.log(animal.name);
let handleDog: DogHandler = handleAnimal; // OK — a function that can handle ANY Animal can certainly handle a Dog

let handleDogOnly: DogHandler = (dog) => console.log(dog.breed);
let handleAnyAnimal: AnimalHandler = handleDogOnly; // unsound, and flagged by default under strict settings —
                                                       // a function expecting only Dog can't safely handle an arbitrary Animal
\`\`\`

This is **contravariance** in parameter position: a function accepting the *more general* type (\`Animal\`) can be used wherever a function accepting the *more specific* type (\`Dog\`) is expected, because handling every \`Animal\` necessarily covers handling every \`Dog\` too — but not the reverse. **Return types**, by contrast, are covariant in the intuitive direction: a function returning a more specific type (\`Dog\`) can be used wherever a function returning a more general type (\`Animal\`) is expected, since any caller expecting an \`Animal\` back is satisfied by receiving a \`Dog\` (a \`Dog\` *is* an \`Animal\`).

\`\`\`typescript
type AnimalFactory = () => Animal;
let makeDog: () => Dog = () => new Dog();
let makeAnimal: AnimalFactory = makeDog; // OK — covariant return: a Dog-returning function satisfies an Animal-returning contract
\`\`\`

The interview-relevant practical relevance: this is exactly the reasoning behind why a callback parameter typed as accepting a *broader* type than strictly necessary is the safer, more flexible choice when designing an API that accepts user-supplied callbacks (e.g. an event handler system) — and it explains otherwise-mysterious compiler complaints when a more narrowly-typed callback is passed somewhere a broader one was expected, which is TypeScript correctly enforcing contravariant parameter safety rather than an arbitrary restriction.`,
  },
  {
    title: 'Utility Types Deep Dive',
    content: `Beyond \`Partial\`, \`Required\`, \`Pick\`, and \`Omit\` (covered alongside mapped types), TypeScript's standard library includes several other utility types that solve recurring, specific type-transformation needs worth knowing by name and behavior.

\`\`\`typescript
type Status = 'pending' | 'active' | 'archived' | 'deleted';
type ActiveStatus = Exclude<Status, 'archived' | 'deleted'>; // 'pending' | 'active'
type ArchivedOrDeleted = Extract<Status, 'archived' | 'deleted'>; // 'archived' | 'deleted'

type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>; // User — strips out null and undefined

function getUser(id: number) { return { id, name: 'Alice' }; }
type UserReturn = ReturnType<typeof getUser>; // { id: number; name: string }
type GetUserParams = Parameters<typeof getUser>; // [id: number]

class Repository {
  constructor(private connectionString: string) {}
  find(id: number) { return { id }; }
}
type RepositoryInstance = InstanceType<typeof Repository>; // the instance type a "new Repository(...)" produces
\`\`\`

\`Exclude\`/\`Extract\` operate on union types specifically (removing or selecting members matching a pattern), while \`Pick\`/\`Omit\` operate on object property keys — a common point of confusion since both pairs sound similar but apply to fundamentally different kinds of types (unions of values vs. sets of object keys). \`ReturnType\`/\`Parameters\` are particularly valuable for deriving a type from an existing function's signature *without* manually re-declaring it — keeping the derived type automatically in sync if the original function's signature changes, rather than risking the two silently drifting apart.

The interview-relevant practical value across all of these: reaching for a built-in utility type to *derive* a needed type from an existing one (rather than manually re-typing a slightly-modified duplicate by hand) keeps related types connected and automatically consistent — a duplicated, hand-written type has to be remembered and updated manually every time the original changes, which is exactly the kind of synchronization bug class that deriving types programmatically eliminates.`,
  },
  {
    title: 'Module Augmentation and Global Type Extensions',
    content: `TypeScript allows extending an *existing* module's or global scope's types from elsewhere in a codebase — a pattern frequently needed when a library's existing types need a project-specific addition (e.g. adding a custom property to an Express \`Request\` object that a custom middleware attaches) without modifying the library's own source.

\`\`\`typescript
// express-augmentation.d.ts
import 'express';
declare module 'express' {
  interface Request {
    user?: { id: number; role: string }; // augments the existing Express Request interface
  }
}

// now, anywhere in the project:
app.use((req, res, next) => {
  req.user = { id: 1, role: 'admin' }; // compiles fine — Request now includes "user" everywhere
  next();
});
\`\`\`

This relies on **interface declaration merging** (covered briefly in the interfaces lesson) — declaring the same interface name within the same module produces a single, merged interface combining both declarations' members, rather than one overriding the other or causing a conflict, as long as no property is declared with conflicting, incompatible types across the merged declarations.

**Global augmentation** follows the same principle for ambient global types, such as adding a custom property to the global \`Window\` object in browser code interfacing with a third-party script that attaches itself globally:

\`\`\`typescript
declare global {
  interface Window {
    analyticsTracker?: { track: (event: string) => void };
  }
}
window.analyticsTracker?.track('page_view'); // typed, even though Window doesn't natively declare this property
\`\`\`

The interview-relevant caution alongside the technique: augmentation is powerful but should be scoped narrowly and used sparingly — broadly or carelessly augmenting widely-used global or library types can make a codebase's actual type contracts harder to discover (a developer reading the original library's types has no way to know a project has silently extended them elsewhere), so the practice is best reserved for genuinely necessary, well-documented integration points rather than a general-purpose way to avoid writing a properly-scoped local type.`,
  },
  {
    title: 'Template Literal Types',
    content: `Template literal types apply the same interpolation syntax as JavaScript template literals, but at the type level — combining literal string types and unions to produce new, more precise string literal types, rather than widening to a plain \`string\`.

\`\`\`typescript
type Direction = 'top' | 'bottom' | 'left' | 'right';
type Margin = \`margin-\${Direction}\`;
// 'margin-top' | 'margin-bottom' | 'margin-left' | 'margin-right' — every combination, generated automatically

type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type ClickEvent = EventName<'click'>; // 'onClick'
\`\`\`

When a template literal type interpolates a *union* of literal types (as in \`Margin\` above), the result distributes across every combination, similar to how conditional types distribute over unions — producing the full cross-product of possible literal strings as a precise union type, computed entirely by the compiler rather than manually enumerated.

This pairs naturally with mapped type key remapping (covered in the mapped types lesson) for deriving consistently-named related properties or function names from a base set of identifiers:

\`\`\`typescript
type CSSProperties = 'color' | 'fontSize' | 'margin';
type CSSVariables = { [K in CSSProperties as \`--\${K}\`]: string };
// { '--color': string; '--fontSize': string; '--margin': string }
\`\`\`

Real-world libraries use template literal types to provide precise autocomplete and validation for structured string formats that would otherwise just be a plain, unchecked \`string\` — CSS-in-JS libraries typing valid CSS property combinations, routing libraries typing valid route path parameter patterns (e.g. extracting \`:id\` from \`/users/:id\` as a known parameter name), and event-name conventions like the \`EventName\` example above. The interview-relevant takeaway: template literal types let TypeScript express "a string matching this specific pattern" rather than settling for either an exact literal or an unconstrained \`string\`, closing a real gap in precision that came up frequently before this feature existed.`,
  },
  {
    title: 'Branded Types for Nominal-Style Typing',
    content: `Because TypeScript uses structural typing (covered in its own lesson), two type aliases with the same underlying primitive type are fully interchangeable by default — \`type UserId = string\` and \`type ProductId = string\` provide no actual protection against accidentally passing a \`ProductId\` where a \`UserId\` is expected, since structurally they're both just \`string\`.

\`\`\`typescript
type UserId = string;
type ProductId = string;
function getUser(id: UserId) { /* ... */ }
const productId: ProductId = 'prod-123';
getUser(productId); // compiles fine — no error, even though this is almost certainly a bug
\`\`\`

**Branded types** (also called nominal typing emulation) solve this by attaching a unique, otherwise-unused phantom property to an otherwise-identical type, making two branded aliases structurally distinct even though their actual runtime values are unchanged:

\`\`\`typescript
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };

function getUser(id: UserId) { /* ... */ }
function toUserId(id: string): UserId { return id as UserId; } // explicit, deliberate conversion point

const productId = 'prod-123' as ProductId;
getUser(productId); // compile error now — ProductId is not assignable to UserId, despite both being strings
getUser(toUserId('user-456')); // fine — went through the explicit conversion function
\`\`\`

The \`__brand\` property never actually exists at runtime (it's erased like all TypeScript types) — it exists purely to make the compiler treat these two otherwise-identical \`string\`-based types as incompatible, forcing any conversion between them through an explicit function rather than allowing silent, accidental interchangeability.

The interview-relevant use case: branded types are the standard answer for "how do you get nominal-typing-like safety in a structurally-typed language" — valuable specifically when multiple distinct *kinds* of values share the same underlying primitive representation (various ID types, currency amounts in different units, validated vs. unvalidated strings) where structural equivalence is technically true but semantically meaningless, and accidentally mixing them up is a real, costly class of bug that plain type aliases provide zero protection against.`,
  },
];

export function seedTypeScriptLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['typescript']);
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
