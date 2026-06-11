import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedTypeScriptQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['typescript']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is TypeScript and why use it over plain JavaScript?',
      answer: `TypeScript is a statically typed superset of JavaScript that compiles to plain JavaScript. It adds optional type annotations, interfaces, enums, generics, and access modifiers on top of all valid JavaScript.

**Key benefits:**
- Catches type errors at compile time rather than runtime
- Provides rich IDE autocompletion and refactoring support
- Makes large codebases more maintainable by documenting intent in types
- Supports modern JavaScript features with polyfill-friendly compilation targets

\`\`\`ts
function greet(name: string): string {
  return \`Hello, \${name}\`;
}

greet(42); // Error: Argument of type 'number' is not assignable to type 'string'
\`\`\`

TypeScript doesn't add runtime overhead — all types are erased at compile time.`,
      difficulty: 1,
      tags: 'typescript,basics,types',
    },
    {
      title: 'What is the difference between interface and type in TypeScript?',
      answer: `Both \`interface\` and \`type\` describe object shapes, but they have key differences:

**Interface:**
- Can be extended with \`extends\` or merged via declaration merging
- Only describes object shapes and function signatures
- Slightly better error messages for object types

**Type alias:**
- Can represent any type: primitives, unions, intersections, tuples, mapped types
- Cannot be reopened to add new properties

\`\`\`ts
interface User { name: string; }
interface User { age: number; }  // OK — declaration merging

type Status = 'active' | 'inactive'; // union — only possible with type
type UserOrAdmin = User | Admin;      // union — only possible with type

// Prefer interface for public API shapes, type for everything else
\`\`\`

In practice: use \`interface\` for object shapes you'll extend or implement; use \`type\` for unions, intersections, and utility constructions.`,
      difficulty: 2,
      tags: 'interface,type,typescript',
    },
    {
      title: 'What are generics in TypeScript and when should you use them?',
      answer: `Generics allow you to write reusable code that works with multiple types while preserving type safety. They are TypeScript's equivalent of "type parameters."

\`\`\`ts
function identity<T>(value: T): T {
  return value;
}
identity<string>('hello'); // T = string
identity(42);              // T inferred as number

// Generic container
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchUser(): Promise<ApiResponse<User>> {
  // ...
}
\`\`\`

Use generics when you want a function, class, or interface to work with different types without sacrificing type information. Common in utility functions, data structures, and API wrappers. Avoid over-generifying simple functions that only ever handle one type.`,
      difficulty: 2,
      tags: 'generics,typescript,reusability',
    },
    {
      title: 'What is a union type and how does TypeScript narrow it?',
      answer: `A union type (\`A | B\`) means a value can be one of several types. TypeScript narrows the type within conditional blocks by analyzing control flow.

\`\`\`ts
type StringOrNumber = string | number;

function double(value: StringOrNumber): StringOrNumber {
  if (typeof value === 'string') {
    return value.repeat(2); // narrowed to string here
  }
  return value * 2;         // narrowed to number here
}
\`\`\`

**Discriminated unions** are a powerful pattern for modeling state machines:

\`\`\`ts
type LoadingState =
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; message: string };

function render(state: LoadingState) {
  if (state.status === 'success') {
    console.log(state.data); // TypeScript knows data exists here
  }
}
\`\`\``,
      difficulty: 2,
      tags: 'union,narrowing,typescript',
    },
    {
      title: 'What is the difference between unknown and any?',
      answer: `Both \`unknown\` and \`any\` represent a value whose type is not known, but they differ in safety:

- \`any\` **disables** type checking — you can call methods, access properties, and assign it anywhere without error.
- \`unknown\` requires a **type guard or assertion** before you can use the value in a typed way.

\`\`\`ts
let value: any = JSON.parse(input);
value.foo.bar.baz; // no error — but could throw at runtime

let safeValue: unknown = JSON.parse(input);
safeValue.foo; // Error: Object is of type 'unknown'

if (typeof safeValue === 'string') {
  console.log(safeValue.toUpperCase()); // OK after narrowing
}
\`\`\`

Prefer \`unknown\` over \`any\` whenever you receive data from an external source (API responses, JSON parsing, user input) and want to force explicit validation before use.`,
      difficulty: 2,
      tags: 'unknown,any,type-safety',
    },
    {
      title: 'What are TypeScript utility types and name common ones?',
      answer: `Utility types are built-in generic types that transform existing types. They eliminate the need to write repetitive mapped types manually.

\`\`\`ts
interface User { id: number; name: string; email: string; }

Partial<User>           // all properties optional
Required<User>          // all properties required
Readonly<User>          // all properties readonly
Pick<User, 'id'|'name'> // only selected properties
Omit<User, 'email'>     // all except specified
Record<string, User>    // dictionary type

// Function-related
ReturnType<typeof fetchUser>    // infer return type
Parameters<typeof fetchUser>    // infer parameter tuple
Awaited<ReturnType<typeof fetchUser>> // unwrap Promise

// Conditional
NonNullable<string | null | undefined> // string
\`\`\`

These are particularly useful for deriving form types, API request/response shapes, and creating partial update payloads from full entity types.`,
      difficulty: 2,
      tags: 'utility-types,typescript,generics',
    },
    {
      title: 'What is type narrowing in TypeScript?',
      answer: `Type narrowing is TypeScript's ability to refine a broad type to a more specific one based on runtime checks in the code. The compiler analyzes control flow to track how a type changes within branches.

\`\`\`ts
// typeof guard
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // string here
  }
  return value.toFixed(2);     // number here
}

// instanceof guard
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message); // Error here
  }
}

// User-defined type guard
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
\`\`\`

Type guards include \`typeof\`, \`instanceof\`, \`in\` operator, equality checks, and custom predicates with the \`value is Type\` return syntax.`,
      difficulty: 2,
      tags: 'narrowing,type-guards,typescript',
    },
    {
      title: 'What is the never type in TypeScript?',
      answer: `\`never\` represents a type that should never occur — a value that can never be assigned. It appears in two main contexts:

1. **Exhaustive checks** — a function that never returns (throws or infinite loops)
2. **Unreachable code** — the bottom of a discriminated union after all cases are handled

\`\`\`ts
function fail(message: string): never {
  throw new Error(message); // never returns
}

type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.side ** 2;
    default:
      // If a new shape is added without a case, TypeScript errors here
      const exhaustiveCheck: never = shape;
      return exhaustiveCheck;
  }
}
\`\`\`

Using \`never\` for exhaustive checks is a powerful compile-time safety net.`,
      difficulty: 3,
      tags: 'never,typescript,exhaustive-checks',
    },
    {
      title: 'What are keyof and typeof in TypeScript?',
      answer: `**\`keyof\`** produces a union of all key names of a type. It's used to create type-safe property accessor functions and mapped types.

\`\`\`ts
interface User { id: number; name: string; email: string; }

type UserKey = keyof User; // 'id' | 'name' | 'email'

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // fully type-safe
}

getProperty(user, 'name');   // string
getProperty(user, 'id');     // number
getProperty(user, 'missing'); // Error
\`\`\`

**\`typeof\`** in a type position extracts the TypeScript type of a runtime value — useful for inferring types from constants and functions rather than writing them manually.

\`\`\`ts
const config = { port: 3000, host: 'localhost' };
type Config = typeof config; // { port: number; host: string }

const colors = ['red', 'green', 'blue'] as const;
type Color = typeof colors[number]; // 'red' | 'green' | 'blue'
\`\`\``,
      difficulty: 3,
      tags: 'keyof,typeof,mapped-types',
    },
    {
      title: 'What are decorators in TypeScript?',
      answer: `Decorators are a stage-3 JavaScript proposal (stable in TypeScript 5) that allow you to annotate and modify classes, methods, accessors, properties, and parameters with reusable behavior.

\`\`\`ts
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    console.log(\`Calling \${key} with\`, args);
    return original.apply(this, args);
  };
  return descriptor;
}

class UserService {
  @log
  findById(id: number) {
    // ...
  }
}
\`\`\`

Decorators are heavily used in frameworks like NestJS (route handlers, dependency injection), Angular (components, services), and TypeORM (entity mapping). Enable them with \`"experimentalDecorators": true\` in \`tsconfig.json\` for legacy decorators or use TypeScript 5+ native decorators.`,
      difficulty: 3,
      tags: 'decorators,typescript,metadata',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
