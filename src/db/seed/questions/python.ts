import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedPythonQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['python']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is a list comprehension and when should you use it?',
      answer: `A list comprehension is a concise syntax for creating lists by applying an expression to each element of an iterable, optionally filtering with a condition.

\`\`\`python
# Traditional loop
squares = []
for x in range(10):
    if x % 2 == 0:
        squares.append(x ** 2)

# Equivalent list comprehension
squares = [x ** 2 for x in range(10) if x % 2 == 0]
# [0, 4, 16, 36, 64]

# Dict and set comprehensions follow the same pattern
word_lengths = {word: len(word) for word in ['hello', 'world']}
unique_chars = {char for char in 'mississippi'}
\`\`\`

Use comprehensions for simple, single-expression transformations — they're more readable and often faster than equivalent loops. Avoid them when the logic is complex enough to warrant a loop with comments or multiple statements.`,
      difficulty: 1,
      tags: 'comprehension,lists,pythonic',
    },
    {
      title: 'What are decorators in Python?',
      answer: `A decorator is a function that takes another function as input, wraps it with additional behavior, and returns the modified function. The \`@\` syntax is shorthand for \`func = decorator(func)\`.

\`\`\`python
import functools
import time

def timer(func):
    @functools.wraps(func)  # preserves __name__, __doc__
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
\`\`\`

Decorators are widely used for logging, authentication, caching (\`@functools.lru_cache\`), retrying, and input validation. They compose well — stacking multiple decorators applies them bottom-up.`,
      difficulty: 2,
      tags: 'decorators,higher-order,python',
    },
    {
      title: 'What are generators and the yield keyword in Python?',
      answer: `A generator is a function that uses \`yield\` to produce values one at a time, suspending its state between calls. Generators return an iterator without loading all values into memory.

\`\`\`python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci()
[next(gen) for _ in range(8)]  # [0, 1, 1, 2, 3, 5, 8, 13]

# Generator expression (lazy evaluation)
total = sum(x ** 2 for x in range(1_000_000))  # never builds a list
\`\`\`

Generators are ideal for large datasets, infinite sequences, and pipeline-style data processing. They are memory-efficient because they compute values on demand. \`yield from\` delegates to a sub-generator, useful for recursive generators.`,
      difficulty: 2,
      tags: 'generators,yield,memory',
    },
    {
      title: 'What is the GIL (Global Interpreter Lock) in Python?',
      answer: `The GIL is a mutex in CPython that ensures only one thread executes Python bytecode at a time, even on multi-core systems. It simplifies memory management (especially reference counting) but limits CPU-bound multi-threading.

**Impact by workload:**
- **CPU-bound** tasks (number crunching): threading gives no speedup; use \`multiprocessing\` or \`concurrent.futures.ProcessPoolExecutor\` to bypass the GIL
- **I/O-bound** tasks (network, disk): the GIL is released during I/O; threading works well, \`asyncio\` is even better

\`\`\`python
# CPU-bound — use processes, not threads
from concurrent.futures import ProcessPoolExecutor

with ProcessPoolExecutor() as executor:
    results = list(executor.map(heavy_computation, data))
\`\`\`

Python 3.13 introduced experimental free-threaded mode (PEP 703) that removes the GIL, but this is not yet the default. Alternative implementations like Jython and PyPy don't have a GIL.`,
      difficulty: 3,
      tags: 'gil,threading,concurrency',
    },
    {
      title: 'What is the difference between a shallow copy and a deep copy?',
      answer: `A **shallow copy** creates a new object but references the same nested objects as the original. A **deep copy** recursively copies all nested objects, creating a fully independent clone.

\`\`\`python
import copy

original = {'name': 'Alice', 'scores': [10, 20, 30]}

shallow = copy.copy(original)
shallow['scores'].append(99)
print(original['scores'])  # [10, 20, 30, 99] — mutated!

deep = copy.deepcopy(original)
deep['scores'].append(99)
print(original['scores'])  # [10, 20, 30] — unchanged
\`\`\`

Use \`copy.copy()\` when you want a new container but the contained objects can be shared. Use \`copy.deepcopy()\` when you need full independence, such as when implementing undo/redo or cloning mutable configuration objects. Note that deep copy can be slow for complex objects.`,
      difficulty: 2,
      tags: 'copy,shallow,deep,mutability',
    },
    {
      title: 'What are context managers and the with statement?',
      answer: `A context manager defines setup and teardown logic via \`__enter__\` and \`__exit__\` methods. The \`with\` statement ensures \`__exit__\` is called even if an exception occurs — equivalent to a try/finally block.

\`\`\`python
# Classic use case — file always closed
with open('data.csv', 'r') as file:
    content = file.read()

# Custom context manager using contextlib
from contextlib import contextmanager

@contextmanager
def timer(label: str):
    import time
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer("database query"):
    results = db.execute("SELECT ...")
\`\`\`

Common uses: file I/O, database transactions, acquiring/releasing locks, mocking in tests (\`unittest.mock.patch\`), and managing temporary directories. The \`contextlib\` module provides helpers like \`contextmanager\`, \`suppress\`, and \`ExitStack\`.`,
      difficulty: 2,
      tags: 'context-manager,with,resource-management',
    },
    {
      title: 'What is duck typing in Python?',
      answer: `Duck typing is the practice of checking an object's behavior (methods and properties) rather than its type. If an object has the right interface, it can be used regardless of its class. The name comes from "if it walks like a duck and quacks like a duck, it's a duck."

\`\`\`python
class Duck:
    def quack(self): return "Quack!"

class Person:
    def quack(self): return "I'm quacking like a duck!"

def make_it_quack(duck):
    print(duck.quack())  # works for any object with .quack()

make_it_quack(Duck())    # Quack!
make_it_quack(Person())  # I'm quacking like a duck!
\`\`\`

Python embraces duck typing through protocols (informal interfaces) and ABCs. Modern Python uses \`typing.Protocol\` for structural subtyping, letting you specify the interface a function requires without inheritance. This enables highly flexible, composable code.`,
      difficulty: 2,
      tags: 'duck-typing,protocol,dynamic-typing',
    },
    {
      title: 'What are *args and **kwargs?',
      answer: `\`*args\` collects positional arguments into a tuple. \`**kwargs\` collects keyword arguments into a dictionary. Both allow functions to accept a variable number of arguments.

\`\`\`python
def log(level, *args, **kwargs):
    message = ' '.join(str(a) for a in args)
    meta = ', '.join(f"{k}={v}" for k, v in kwargs.items())
    print(f"[{level}] {message} | {meta}")

log('INFO', 'User', 'logged in', user_id=42, ip='10.0.0.1')
# [INFO] User logged in | user_id=42, ip=10.0.0.1

# Unpacking when calling
def connect(host, port, timeout): ...

config = {'host': 'localhost', 'port': 5432, 'timeout': 30}
connect(**config)  # equivalent to connect(host=..., port=..., timeout=...)
\`\`\`

The names \`args\` and \`kwargs\` are conventions — what matters is the \`*\` and \`**\` prefixes. Use \`*args\` for variadic positional arguments and \`**kwargs\` for passing through options to underlying functions.`,
      difficulty: 1,
      tags: 'args,kwargs,functions',
    },
    {
      title: 'What is the difference between a list and a tuple in Python?',
      answer: `Lists and tuples are both ordered sequences, but they differ in mutability and intent:

| | List | Tuple |
|---|---|---|
| Mutability | Mutable | Immutable |
| Syntax | \`[1, 2, 3]\` | \`(1, 2, 3)\` |
| Use case | Homogeneous sequences | Heterogeneous records |
| Hashable | No | Yes (if elements are hashable) |
| Performance | Slightly slower | Slightly faster |

\`\`\`python
point = (3.0, 4.0)     # tuple — coordinates, a fixed record
names = ['Alice', 'Bob'] # list — a collection that may change

# Tuples can be dict keys; lists cannot
distances = {(0, 0): 0, (3, 4): 5.0}

# Named tuples add readability
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(3.0, 4.0)
print(p.x)  # 3.0
\`\`\`

Use tuples for data that should not change and when you need hashability. Use lists for collections you'll mutate.`,
      difficulty: 1,
      tags: 'list,tuple,data-structures',
    },
    {
      title: 'What is asyncio in Python and when should you use it?',
      answer: `\`asyncio\` is Python's standard library for writing concurrent I/O-bound code using coroutines, an event loop, and the \`async/await\` syntax. It runs in a single thread using cooperative multitasking.

\`\`\`python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.json()

async def main():
    urls = ['https://api.example.com/1', 'https://api.example.com/2']
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(*[fetch(session, url) for url in urls])
    return results

asyncio.run(main())
\`\`\`

Use \`asyncio\` for I/O-bound workloads where you're waiting on network calls, database queries, or file I/O. It won't help CPU-bound work (use \`multiprocessing\` instead). It shines in web servers, API clients, and any code making many concurrent external calls.`,
      difficulty: 3,
      tags: 'asyncio,async,concurrency',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
