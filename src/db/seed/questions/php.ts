import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedPhpQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['php']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What are traits in PHP and when should you use them?',
      answer: `Traits are a mechanism for code reuse in single-inheritance languages. A trait is a group of methods you can include in any class without requiring inheritance. PHP classes can use multiple traits.

\`\`\`php
trait Timestamps {
    protected DateTime $createdAt;

    public function touch(): void {
        $this->createdAt = new DateTime();
    }
}

trait SoftDelete {
    protected ?DateTime $deletedAt = null;

    public function delete(): void {
        $this->deletedAt = new DateTime();
    }
}

class Post {
    use Timestamps, SoftDelete;
}
\`\`\`

Use traits when multiple unrelated classes share the same method implementations and you want to avoid duplicating code. Avoid overusing them — they make code harder to trace. If behavior belongs together, a base class or interface with a default implementation may be cleaner.`,
      difficulty: 2,
      tags: 'traits,php,reuse',
    },
    {
      title: 'What is the difference between == and === in PHP?',
      answer: `\`==\` performs **loose comparison** with type coercion. \`===\` performs **strict comparison** — both value and type must match.

\`\`\`php
0 == "foo"    // true in PHP 7 (string coerced to 0); false in PHP 8
0 == ""       // true in PHP 7; false in PHP 8
"1" == "01"   // true (both numeric)
100 == "1e2"  // true
null == false // true

0 === false   // false (different types)
"1" === 1     // false
null === false // false
\`\`\`

PHP 8 changed loose comparison behavior with non-numeric strings, making \`0 == "foo"\` return \`false\`. Always use \`===\` in comparisons to avoid subtle coercion bugs, especially when working with form inputs, database results, or JSON data.`,
      difficulty: 1,
      tags: 'comparison,php,types',
    },
    {
      title: 'What are PHP namespaces and why are they important?',
      answer: `Namespaces prevent name collisions between classes, functions, and constants from different libraries or parts of an application. They also improve code organization and autoloading.

\`\`\`php
namespace App\\Services;

use App\\Models\\User;
use Illuminate\\Support\\Facades\\Hash;

class UserService {
    public function create(string $email, string $password): User {
        return User::create([
            'email' => $email,
            'password' => Hash::make($password),
        ]);
    }
}
\`\`\`

Namespaces map directly to directory structure when using PSR-4 autoloading (via Composer). \`use\` imports a fully-qualified class name into the current scope. Without namespaces, large projects would require unique class names globally — a maintenance nightmare.`,
      difficulty: 1,
      tags: 'namespaces,psr4,autoloading',
    },
    {
      title: 'What are magic methods in PHP?',
      answer: `Magic methods are special methods with double-underscore prefixes that PHP calls automatically in certain situations.

\`\`\`php
class MagicExample {
    private array $data = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    public function __get(string $name): mixed {
        return $this->data[$name] ?? null;
    }

    public function __set(string $name, mixed $value): void {
        $this->data[$name] = $value;
    }

    public function __isset(string $name): bool {
        return isset($this->data[$name]);
    }

    public function __toString(): string {
        return json_encode($this->data);
    }

    public function __invoke(string $arg): string {
        return "Called with: {$arg}";
    }
}
\`\`\`

Common magic methods: \`__construct\`, \`__destruct\`, \`__get\`, \`__set\`, \`__call\`, \`__toString\`, \`__invoke\`, \`__clone\`. They enable fluent APIs, proxy objects, and ORM active-record patterns (like Eloquent's dynamic property access).`,
      difficulty: 2,
      tags: 'magic-methods,php,oop',
    },
    {
      title: 'What is PDO and why is it preferred over mysql_ functions?',
      answer: `PDO (PHP Data Objects) is a database abstraction layer that provides a consistent interface for accessing different databases (MySQL, PostgreSQL, SQLite, etc.) using the same API.

\`\`\`php
$pdo = new PDO(
    'mysql:host=localhost;dbname=app;charset=utf8mb4',
    'user',
    'secret',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// Prepared statement — prevents SQL injection
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
\`\`\`

**Why prefer PDO:**
- Supports prepared statements, which prevent SQL injection
- Works with 12+ database drivers via one API
- Supports transactions and stored procedures
- The deprecated \`mysql_*\` functions don't support prepared statements and were removed in PHP 7`,
      difficulty: 2,
      tags: 'pdo,sql-injection,database',
    },
    {
      title: 'What is dependency injection in PHP?',
      answer: `Dependency injection (DI) is a design pattern where a class receives its dependencies from the outside rather than creating them internally. This decouples classes and makes them easier to test.

\`\`\`php
// Without DI — hard to test, tightly coupled
class OrderService {
    private EmailService $emailService;

    public function __construct() {
        $this->emailService = new EmailService(); // direct instantiation
    }
}

// With DI — testable, loosely coupled
class OrderService {
    public function __construct(
        private readonly EmailServiceInterface $emailService,
        private readonly OrderRepository $orderRepository,
    ) {}

    public function placeOrder(Cart $cart): Order {
        $order = $this->orderRepository->create($cart);
        $this->emailService->sendConfirmation($order);
        return $order;
    }
}
\`\`\`

DI containers (like Laravel's service container) automatically resolve and inject dependencies. In tests you can inject mocks or fakes instead of real services.`,
      difficulty: 2,
      tags: 'dependency-injection,solid,testing',
    },
    {
      title: 'What are generators in PHP and when are they useful?',
      answer: `Generators are functions that can yield multiple values one at a time, pausing and resuming execution. They use the \`yield\` keyword and implement the \`Iterator\` interface without needing a class.

\`\`\`php
function readLargeFile(string $path): Generator {
    $file = fopen($path, 'r');
    while (!feof($file)) {
        yield fgets($file);
    }
    fclose($file);
}

foreach (readLargeFile('/var/log/huge.log') as $line) {
    process($line); // only one line in memory at a time
}
\`\`\`

Generators are ideal when working with large datasets that shouldn't be loaded entirely into memory, like reading CSV files, paginating database results, or generating sequences. They consume far less memory than returning a full array.`,
      difficulty: 3,
      tags: 'generators,yield,performance',
    },
    {
      title: 'What is the difference between abstract classes and interfaces in PHP?',
      answer: `**Interface:** A contract that defines method signatures. A class can implement multiple interfaces. All methods are implicitly public and abstract; no implementation is allowed (except constants).

**Abstract class:** A class that cannot be instantiated and may contain a mix of abstract methods (no body) and concrete methods (with body). A class can extend only one abstract class.

\`\`\`php
interface Serializable {
    public function serialize(): string;
    public function unserialize(string $data): void;
}

abstract class BaseModel {
    abstract public function validate(): bool;

    public function save(): void {
        if (!$this->validate()) throw new \\Exception('Invalid');
        // shared save logic
    }
}

class User extends BaseModel implements Serializable {
    public function validate(): bool { return !empty($this->name); }
    public function serialize(): string { return json_encode($this); }
    public function unserialize(string $data): void { /* ... */ }
}
\`\`\`

Use interfaces to define capabilities. Use abstract classes when you want to share implementation across related classes.`,
      difficulty: 2,
      tags: 'abstract,interface,oop',
    },
    {
      title: 'What is type hinting in PHP and what does strict_types do?',
      answer: `Type hints declare the expected types for function parameters and return values. PHP 8 supports scalar types (\`int\`, \`string\`, \`float\`, \`bool\`), nullable types (\`?string\`), union types (\`int|string\`), and \`mixed\`.

\`\`\`php
declare(strict_types=1);

function calculateTotal(float $price, int $quantity): float {
    return $price * $quantity;
}

calculateTotal('10.5', 2); // TypeError with strict_types=1
                           // works (with coercion) without it
\`\`\`

Without \`declare(strict_types=1)\`, PHP silently coerces types (e.g., the string \`'10.5'\` becomes \`10.5\`). With it, passing the wrong type throws a \`TypeError\` immediately. Always use strict types in new code — it catches bugs early and makes function contracts explicit.`,
      difficulty: 1,
      tags: 'type-hints,strict-types,php8',
    },
    {
      title: 'What are PHP fibers and how do they differ from coroutines?',
      answer: `PHP 8.1 introduced Fibers — a primitive for creating interruptible functions. A Fiber can be paused with \`Fiber::suspend()\` and resumed from the outside, enabling cooperative multitasking.

\`\`\`php
$fiber = new Fiber(function(): void {
    $value = Fiber::suspend('first');
    echo "Got: {$value}\\n";
    Fiber::suspend('second');
});

$result1 = $fiber->start();        // returns 'first'
$result2 = $fiber->resume('hello'); // prints "Got: hello", returns 'second'
\`\`\`

Fibers are lower-level than async/await — they don't automatically schedule or parallelize work. Event loop libraries like ReactPHP and AMPHP use Fibers as the foundation for their async abstractions, giving PHP true cooperative concurrency without threads. Unlike generators, Fibers can be suspended from any depth of the call stack.`,
      difficulty: 3,
      tags: 'fibers,php81,concurrency',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
