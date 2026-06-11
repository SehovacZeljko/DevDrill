import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedJavaQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['java']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between == and .equals() in Java?',
      answer: `\`==\` compares **references** — whether two variables point to the same object in memory. \`.equals()\` compares **values** — what the objects represent.

\`\`\`java
String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);       // false (different objects)
System.out.println(a.equals(b));  // true (same content)

// String interning exception
String c = "hello";
String d = "hello";
System.out.println(c == d); // true (same interned literal)
\`\`\`

For primitives (\`int\`, \`boolean\`, etc.), \`==\` compares values directly. For objects, always use \`.equals()\` unless you explicitly want to check object identity. When overriding \`.equals()\`, also override \`.hashCode()\` to maintain the contract that equal objects have equal hash codes.`,
      difficulty: 1,
      tags: 'equality,string,java-basics',
    },
    {
      title: 'What are the four pillars of OOP?',
      answer: `**1. Encapsulation** — bundling data and methods, hiding internal state via access modifiers (\`private\`, \`protected\`).

**2. Abstraction** — exposing only essential details and hiding implementation complexity through interfaces and abstract classes.

**3. Inheritance** — a class acquiring properties and behavior from a parent class (\`extends\`), promoting code reuse.

**4. Polymorphism** — the ability to treat objects of different classes through a common interface. In Java: method overriding (runtime polymorphism) and method overloading (compile-time).

\`\`\`java
abstract class Shape {
    abstract double area(); // abstraction
}

class Circle extends Shape { // inheritance
    private double radius;   // encapsulation
    Circle(double radius) { this.radius = radius; }

    @Override
    double area() { return Math.PI * radius * radius; } // overriding
}

Shape shape = new Circle(5); // polymorphism
System.out.println(shape.area());
\`\`\``,
      difficulty: 1,
      tags: 'oop,pillars,java',
    },
    {
      title: 'What is the difference between an interface and an abstract class in Java?',
      answer: `**Interface:** A pure contract. All methods are implicitly \`public abstract\` (unless default/static). A class can implement multiple interfaces.

**Abstract class:** May have instance fields, constructors, and concrete methods. Supports single inheritance only.

\`\`\`java
interface Flyable {
    void fly();
    default String describe() { return "I can fly"; } // Java 8+
}

abstract class Animal {
    String name;
    Animal(String name) { this.name = name; }
    abstract void makeSound();
    void breathe() { System.out.println("breathing..."); } // concrete
}

class Bird extends Animal implements Flyable {
    Bird(String name) { super(name); }
    public void makeSound() { System.out.println("tweet"); }
    public void fly() { System.out.println(name + " is flying"); }
}
\`\`\`

**Rule of thumb:** Use interfaces to define capabilities (what something can do). Use abstract classes to share implementation among closely related classes (what something is).`,
      difficulty: 2,
      tags: 'interface,abstract-class,oop',
    },
    {
      title: 'What is the Java memory model — stack vs heap?',
      answer: `The JVM divides memory into two main areas:

**Stack:**
- Stores method frames, local variables, and references
- One stack per thread; automatically managed (push on call, pop on return)
- Fixed size; \`StackOverflowError\` if exceeded (e.g., infinite recursion)

**Heap:**
- Stores all objects and class instances
- Shared across threads; managed by the garbage collector
- Divided into Young Generation (Eden, Survivor spaces) and Old Generation

\`\`\`java
void method() {
    int x = 5;           // x lives on the stack
    String s = "hello";  // s (reference) on stack; String object on heap
    Person p = new Person("Ana"); // p on stack; Person object on heap
}
// When method returns, x, s, p are popped
// Person object may be GC'd if no other references exist
\`\`\`

\`OutOfMemoryError\` occurs when the heap is exhausted. Tune heap size with \`-Xms\` (initial) and \`-Xmx\` (maximum) JVM flags.`,
      difficulty: 2,
      tags: 'memory,stack,heap,jvm',
    },
    {
      title: 'What is the difference between checked and unchecked exceptions?',
      answer: `**Checked exceptions** must be either caught or declared in the method signature with \`throws\`. They represent recoverable conditions the caller should handle (e.g., \`IOException\`, \`SQLException\`).

**Unchecked exceptions** extend \`RuntimeException\` and don't need to be declared or caught. They represent programming errors (e.g., \`NullPointerException\`, \`IllegalArgumentException\`).

\`\`\`java
// Checked — compiler forces handling
public void readFile(String path) throws IOException {
    Files.readAllBytes(Paths.get(path));
}

// Unchecked — no declaration needed
public int divide(int a, int b) {
    if (b == 0) throw new IllegalArgumentException("Divisor cannot be zero");
    return a / b;
}

// Handling a checked exception
try {
    readFile("/missing.txt");
} catch (IOException e) {
    log.error("File not found", e);
}
\`\`\`

Modern Java style (and many frameworks) prefer unchecked exceptions for business logic errors and reserve checked exceptions for truly external, recoverable conditions like I/O.`,
      difficulty: 2,
      tags: 'exceptions,checked,runtime',
    },
    {
      title: 'How does garbage collection work in Java?',
      answer: `Java's garbage collector (GC) automatically reclaims heap memory for objects with no live references. Modern JVMs use **generational GC** based on the observation that most objects die young.

**Generations:**
- **Eden space** — new objects are allocated here
- **Survivor spaces (S0, S1)** — objects that survive minor GC are moved here
- **Old Generation (Tenured)** — long-lived objects promoted from Survivor spaces

**Process:**
1. Minor GC scans Eden + active Survivor; live objects are copied to the other Survivor or promoted
2. Major/Full GC scans the entire heap; more expensive, causes "stop-the-world" pauses

Common GC algorithms: G1GC (default since Java 9), ZGC (low latency, Java 15+), Shenandoah.

\`\`\`java
// Hint to GC (not guaranteed)
System.gc();

// Finalization (deprecated in Java 9) — avoid using
\`\`\`

Avoid memory leaks by clearing references you no longer need, especially in static fields and caches. Use tools like VisualVM or async-profiler to diagnose memory issues.`,
      difficulty: 3,
      tags: 'garbage-collection,jvm,memory',
    },
    {
      title: 'What are Java Streams and how do you use them?',
      answer: `Streams (Java 8+) provide a declarative, functional-style API for processing sequences of data. They support map, filter, reduce, and many other operations and can be parallelized easily.

\`\`\`java
List<String> names = List.of("Alice", "Bob", "Anna", "Charlie");

// Filter, transform, collect
List<String> result = names.stream()
    .filter(name -> name.startsWith("A"))
    .map(String::toUpperCase)
    .sorted()
    .collect(Collectors.toList());
// ["ALICE", "ANNA"]

// Reduce to a single value
int totalLength = names.stream()
    .mapToInt(String::length)
    .sum();

// Parallel stream for CPU-bound work
long count = veryLargeList.parallelStream()
    .filter(this::isExpensive)
    .count();
\`\`\`

Streams are lazy — intermediate operations (filter, map) are not executed until a terminal operation (collect, count, forEach) is called. They do not mutate the source collection.`,
      difficulty: 2,
      tags: 'streams,functional,java8',
    },
    {
      title: 'What does the final keyword do in Java?',
      answer: `The \`final\` keyword has three different meanings depending on context:

1. **Final variable** — can only be assigned once; acts like a constant.
2. **Final method** — cannot be overridden by subclasses.
3. **Final class** — cannot be subclassed (e.g., \`String\`, \`Integer\`).

\`\`\`java
// Final variable
final int MAX_SIZE = 100;
MAX_SIZE = 200; // Compile error

// Final field — must be assigned in constructor
class Circle {
    final double radius;
    Circle(double radius) { this.radius = radius; }
}

// Final class — immutable, secure
public final class SSN {
    private final String value;
    SSN(String value) { this.value = value; }
}

// Final method — prevents override
class Base {
    final void criticalOperation() { ... }
}
\`\`\`

Note: \`final\` on an object reference means the reference can't be reassigned, but the object itself can still be mutated. For true immutability, make all fields final and ensure no mutable state is exposed.`,
      difficulty: 1,
      tags: 'final,immutability,java',
    },
    {
      title: 'What is the difference between ArrayList and LinkedList?',
      answer: `Both implement the \`List\` interface but have different internal structures and performance characteristics.

| Operation | ArrayList | LinkedList |
|---|---|---|
| Random access (get) | O(1) | O(n) |
| Insert/delete at end | O(1) amortized | O(1) |
| Insert/delete at middle | O(n) | O(n) + O(1) with iterator |
| Memory overhead | Low | High (node pointers) |

\`\`\`java
// ArrayList — backed by a dynamic array
List<String> arrayList = new ArrayList<>();
arrayList.get(0);  // fast — direct index access

// LinkedList — doubly linked list; also implements Deque
LinkedList<String> linkedList = new LinkedList<>();
linkedList.addFirst("head");  // O(1)
linkedList.addLast("tail");   // O(1)
\`\`\`

**In practice:** Use \`ArrayList\` for almost everything — its cache-friendly memory layout makes it faster even for operations that appear to favor \`LinkedList\`. Use \`LinkedList\` only when you need a \`Deque\` (double-ended queue) or do frequent insertions/deletions at both ends.`,
      difficulty: 2,
      tags: 'collections,arraylist,linkedlist',
    },
    {
      title: 'What are Java generics and what is type erasure?',
      answer: `Generics allow classes, interfaces, and methods to operate on parameterized types, providing compile-time type safety without runtime overhead.

\`\`\`java
// Generic class
class Box<T> {
    private T value;
    void set(T value) { this.value = value; }
    T get() { return value; }
}

Box<String> box = new Box<>();
box.set("hello");
String s = box.get(); // no cast needed

// Bounded type parameter
<T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}
\`\`\`

**Type erasure:** Generic type parameters are removed at compile time and replaced with \`Object\` (or the upper bound). At runtime, \`List<String>\` and \`List<Integer>\` are both just \`List\`. This is why you can't do \`new T()\` or \`instanceof List<String>\`.

Wildcards: \`List<? extends Number>\` (producer — read-only), \`List<? super Integer>\` (consumer — write-only). Remember PECS: *Producer Extends, Consumer Super*.`,
      difficulty: 3,
      tags: 'generics,type-erasure,java',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
