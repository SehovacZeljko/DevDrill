import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What Data Structures Are and Why They Matter',
    content: `A data structure is a way of organizing data in memory so that specific operations — lookup, insertion, deletion, traversal — can be performed efficiently. The "right" data structure isn't universal; it depends entirely on which operations a given problem performs most often and how large the data gets.

\`\`\`text
Need fast lookup by key?        -> Hash table
Need sorted order maintained?   -> Balanced tree / sorted array
Need FIFO/LIFO processing?      -> Queue / Stack
Need "closest match" queries?   -> Tree-based structure
\`\`\`

Choosing the wrong structure doesn't just cost a few milliseconds — it can change an algorithm's complexity class entirely. Searching an unsorted array for a value is O(n); the same lookup in a hash table is O(1) on average; the same lookup maintaining sorted order in a balanced tree is O(log n). The performance difference between these at scale (a million records) is the difference between milliseconds and a noticeable delay.

A strong interview answer frames data structure choice as an explicit tradeoff analysis, not memorized trivia: "what operations does this problem need, how often does each happen, and which structure makes the *most frequent* operation cheap, even if it makes a rarer operation more expensive?" — that framing is what separates someone reciting Big O tables from someone who can actually pick the right tool under pressure.`,
  },
  {
    title: 'Arrays',
    content: `An array is a contiguous block of memory holding elements of the same type, accessed by index. Because the memory is contiguous and each element has a fixed size, the address of any element can be computed directly from its index — which is why array access is O(1): no traversal needed, just arithmetic.

\`\`\`text
Index:   0    1    2    3    4
Array: [10,  25,   7,  42,  16]
\`\`\`

- **Access by index:** O(1) — direct address computation
- **Search for a value:** O(n) — no shortcut without additional structure (sorting, indexing)
- **Insert/delete at the end:** O(1) amortized (if there's spare capacity)
- **Insert/delete at the start or middle:** O(n) — every subsequent element must shift to make or close the gap

\`\`\`text
Insert 99 at index 1: [10, 99, 25, 7, 42, 16]
                        ^    every element after index 1 shifted right by one
\`\`\`

Most high-level languages provide a **dynamic array** (JavaScript's \`Array\`, Python's \`list\`, Java's \`ArrayList\`) — one that automatically reallocates a larger underlying block and copies elements over when it runs out of capacity, giving the *appearance* of unbounded growth while keeping append operations O(1) amortized (occasional expensive resizes, averaged out, are cheap per-operation overall).

The interview-relevant nuance: "insert at the end is O(1)" is only true *amortized* — any individual append that triggers a resize is actually O(n) for that one operation, copying every existing element into the new, larger block. Being able to explain *why* it still averages out to O(1) (each element is only ever copied a bounded number of times across all the resizes it experiences) demonstrates real understanding, not memorization.`,
  },
  {
    title: 'Linked Lists',
    content: `A linked list stores elements as a chain of nodes, each holding a value and a pointer/reference to the next node — unlike an array, the elements aren't contiguous in memory, so there's no way to jump directly to the nth element; you must traverse from the head.

\`\`\`text
[10] -> [25] -> [7] -> [42] -> null
 head
\`\`\`

\`\`\`typescript
class Node<T> {
  value: T;
  next: Node<T> | null = null;
  constructor(value: T) { this.value = value; }
}
\`\`\`

- **Access by index:** O(n) — must walk from the head
- **Insert/delete at the head:** O(1) — just repoint the head pointer, no shifting
- **Insert/delete at the tail:** O(n) for a singly linked list (must traverse to find it), O(1) if you maintain a tail pointer and it's a **doubly** linked list (each node also points to its previous node)
- **Search for a value:** O(n)

The key tradeoff against arrays: linked lists make insertion/deletion at arbitrary positions cheap (O(1) once you have a reference to the node, no shifting required) but give up O(1) random access entirely, and have worse memory locality (each node is a separate allocation, scattered in memory, which hurts CPU cache performance compared to an array's contiguous layout — a practical, often-overlooked reason arrays frequently outperform linked lists in real benchmarks despite linked lists' better theoretical insertion complexity).

A common interview question is "when would you actually choose a linked list over a dynamic array?" — a genuinely good answer names a specific access pattern (frequent insertion/removal at arbitrary positions, with references already held to the relevant nodes, such as implementing certain queue/cache structures) rather than reflexively defaulting to one or the other.`,
  },
  {
    title: 'Stacks',
    content: `A stack is a Last-In-First-Out (LIFO) structure: the most recently added element is the first one removed. It supports exactly two core operations — \`push\` (add to the top) and \`pop\` (remove from the top) — both O(1).

\`\`\`text
push(1) push(2) push(3)         pop() -> 3
[1]     [1,2]   [1,2,3]         [1,2]
\`\`\`

Stacks naturally model "undo" history, the call stack of function invocations in any programming language runtime, and depth-first traversal (explicitly, when not using recursion, which implicitly uses the language's own call stack as a stack).

\`\`\`typescript
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
}
\`\`\`

A classic interview problem solved cleanly with a stack: checking whether brackets in a string are balanced — push every opening bracket, and on each closing bracket, check that it matches the most recently pushed (still-unmatched) opening bracket, popping it off; unbalanced input is detected either by a mismatch or a non-empty stack at the end.

The interview-relevant insight worth being able to articulate: any problem requiring you to process the "most recent unresolved thing first" — matching nested structures, tracking function call returns, an undo stack in an editor — is a strong signal that a stack is the natural structure, even before working out the exact algorithm.`,
  },
  {
    title: 'Queues',
    content: `A queue is a First-In-First-Out (FIFO) structure: the earliest-added element is the first one removed — the opposite ordering discipline from a stack. The two core operations are \`enqueue\` (add to the back) and \`dequeue\` (remove from the front), both O(1) with a proper implementation.

\`\`\`text
enqueue(1) enqueue(2) enqueue(3)      dequeue() -> 1
[1]        [1,2]      [1,2,3]        [2,3]
\`\`\`

A naive array-based queue (\`array.shift()\` to dequeue) is O(n) per dequeue, since every remaining element must shift left to fill the gap — a circular buffer or a linked list with head/tail pointers gives true O(1) enqueue and dequeue.

\`\`\`typescript
class Queue<T> {
  private items: T[] = [];
  enqueue(item: T) { this.items.push(item); }
  dequeue(): T | undefined { return this.items.shift(); } // O(n) — naive, for illustration only
}
\`\`\`

Queues model task scheduling, breadth-first traversal, and any "process things in the order they arrived" scenario — a request queue, a print job queue, a message queue between services. A **priority queue** (covered separately, typically backed by a heap) is a related but distinct structure where elements are dequeued by priority rather than strict arrival order.

The interview-relevant practical point: be explicit about *which* concrete implementation you're proposing and its actual complexity — claiming "a queue" gives O(1) operations is only true for the right underlying implementation (circular buffer, doubly linked list with both ends tracked), not for a naive array with \`shift()\`, which silently degrades to O(n) per dequeue.`,
  },
  {
    title: 'Hash Tables',
    content: `A hash table stores key-value pairs and provides average-case O(1) lookup, insertion, and deletion by computing a **hash function** of the key to determine which "bucket" (slot in an underlying array) the entry belongs to — instead of searching through every entry to find a match.

\`\`\`text
hash("apple")  -> 3   -> bucket[3] = [("apple", 1.50)]
hash("banana") -> 1   -> bucket[1] = [("banana", 0.75)]
\`\`\`

When two different keys hash to the same bucket (a **collision**), the table needs a strategy to handle it — the two common approaches are **chaining** (each bucket holds a small list of entries that collided, scanned linearly within that one bucket) and **open addressing** (probe to a different bucket according to a fixed rule until an empty slot is found).

\`\`\`typescript
const cache = new Map<string, number>();
cache.set('apple', 150);
cache.get('apple'); // O(1) average
\`\`\`

The "average-case O(1)" qualifier is the single most important nuance to articulate in interviews: with a poor hash function or enough collisions, lookups degrade toward O(n) in the worst case (every key colliding into one bucket turns it into a linear scan). A good hash function distributes keys roughly uniformly across buckets, and most hash tables also automatically **resize** (rehashing every entry into a larger underlying array) once the load factor — entries divided by bucket count — crosses a threshold, to keep collisions rare as the table grows.

A frequently asked interview question is "why can't you use a mutable object as a hash table key reliably?" — if the key's hash value can change after insertion (because the object it's derived from was mutated), the entry effectively becomes unfindable, since a later lookup with the same (now-different) hash will check the wrong bucket.`,
  },
  {
    title: 'Big O Notation and Time/Space Complexity',
    content: `Big O notation describes how an algorithm's running time (or memory usage) grows as the input size \`n\` grows — not the exact number of operations, but the **growth rate**, which is what actually matters for predicting behavior on inputs far larger than what you tested.

\`\`\`text
O(1)        constant     — array index access
O(log n)    logarithmic  — binary search
O(n)        linear       — scanning every element once
O(n log n)  log-linear   — efficient sorting (merge sort, quicksort average case)
O(n²)       quadratic    — nested loops over the same input (naive duplicate detection)
O(2ⁿ)       exponential  — brute-force subsets/combinations
\`\`\`

Big O describes the **worst case** by convention unless stated otherwise (you'll also see Big Omega for best case and Big Theta for tight bounds, but Big O dominates everyday usage). Constants and lower-order terms are dropped — an algorithm that does \`3n + 100\` operations is still O(n), since the constant factor and additive constant don't change how the running time *scales* as n grows arbitrarily large.

\`\`\`typescript
function hasDuplicate(arr: number[]): boolean {
  const seen = new Set<number>();      // O(n) space
  for (const num of arr) {             // O(n) time
    if (seen.has(num)) return true;    // O(1) average lookup
    seen.add(num);
  }
  return false;
}
\`\`\`

The interview-relevant skill is being able to derive complexity from code, not just recite definitions: identify the loops and their bounds, identify what each iteration costs (a hash lookup is O(1), a nested scan is O(n) per outer iteration), and combine them — nested loops over the same input multiply to O(n²); sequential, independent loops add (which Big O simplifies to whichever term dominates, since lower-order terms vanish at scale).`,
  },
  {
    title: 'Binary Trees',
    content: `A binary tree is a hierarchical structure where each node has at most two children, conventionally called **left** and **right**. Unlike a binary *search* tree (covered separately), a plain binary tree imposes no ordering constraint on where values are placed.

\`\`\`text
        8
      /   \\
     3     10
    / \\      \\
   1   6      14
\`\`\`

\`\`\`typescript
class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;
  constructor(value: T) { this.value = value; }
}
\`\`\`

The three standard depth-first traversal orders, each visiting every node exactly once (O(n)) but in a different sequence: **in-order** (left, node, right — produces sorted output specifically for a *binary search* tree), **pre-order** (node, left, right — useful for copying/serializing a tree, since the root is processed before its children), and **post-order** (left, right, node — useful for deletion, since children are fully processed before their parent).

\`\`\`typescript
function inOrder<T>(node: TreeNode<T> | null, visit: (v: T) => void): void {
  if (!node) return;
  inOrder(node.left, visit);
  visit(node.value);
  inOrder(node.right, visit);
}
\`\`\`

A tree's **height** (the longest path from root to a leaf) determines the cost of many operations — for a tree with \`n\` nodes, height ranges from O(log n) (a balanced tree) to O(n) (a completely lopsided tree degenerating into something resembling a linked list). This is precisely why balance matters so much for trees used as search structures, a theme that carries directly into binary search trees and self-balancing trees.`,
  },
  {
    title: 'Binary Search Trees',
    content: `A binary search tree (BST) is a binary tree with an ordering invariant: for every node, every value in its left subtree is smaller, and every value in its right subtree is larger. This invariant is what makes search efficient — at each node, you can discard an entire half of the remaining tree based on a single comparison.

\`\`\`text
        8
      /   \\
     3     10
    / \\      \\
   1   6      14

search(6): 8 -> go left (6 < 8) -> 3 -> go right (6 > 3) -> 6, found
\`\`\`

\`\`\`typescript
function search<T>(node: TreeNode<T> | null, target: T): boolean {
  if (!node) return false;
  if (target === node.value) return true;
  return target < node.value ? search(node.left, target) : search(node.right, target);
}
\`\`\`

For a **balanced** BST, search, insertion, and deletion are all O(log n) — each comparison roughly halves the remaining search space, the same logic as binary search on a sorted array, but maintained dynamically as the structure grows and shrinks.

The interview-relevant catch: an *unbalanced* BST degrades to O(n) in the worst case. Inserting values in already-sorted order into a plain BST (1, 2, 3, 4, 5...) produces a tree that's really just a linked list in disguise — every node has only a right child, height equals node count, and every operation becomes a linear scan. This exact failure mode is the entire motivation for self-balancing trees (AVL, red-black), covered in the advanced lessons, which guarantee O(log n) height regardless of insertion order by automatically rebalancing after each modification.`,
  },
  {
    title: 'Heaps and Priority Queues',
    content: `A heap is a tree-based structure satisfying the **heap property**: in a min-heap, every parent is smaller than or equal to its children (so the minimum value is always at the root); in a max-heap, every parent is greater than or equal to its children. Unlike a BST, a heap makes no guarantee about ordering between siblings or across the whole tree — only between a node and its direct children.

\`\`\`text
Min-heap:
        2
      /   \\
     5     4
    / \\
   8   9
\`\`\`

This weaker invariant is exactly what makes heaps cheap to maintain: \`insert\` and \`extract-min\`/\`extract-max\` are both O(log n) — far better than re-sorting, since a heap only needs to "bubble" the changed element up or down one path to the root or a leaf, not reorganize the whole structure.

\`\`\`typescript
class MinHeap {
  private items: number[] = [];

  insert(value: number): void {
    this.items.push(value);
    this.bubbleUp(this.items.length - 1);
  }

  extractMin(): number | undefined {
    const min = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }
  // bubbleUp/bubbleDown swap with a parent/child while the heap property is violated
}
\`\`\`

A **priority queue** is the abstract concept (dequeue by priority, not arrival order); a heap is the standard concrete implementation of it. Heaps are also the basis of **heapsort** and the classic interview problem "find the k largest/smallest elements in a stream," solved efficiently by maintaining a heap of size k rather than re-sorting the entire dataset on every new element — an approach worth naming explicitly, since reaching for "sort everything" when only a heap of bounded size is needed is a common missed optimization.`,
  },
  {
    title: 'Graphs: Representation Basics',
    content: `A graph is a set of **nodes** (vertices) connected by **edges**, used to model relationships that aren't strictly hierarchical — social networks, road networks, dependency graphs, web page links. Graphs can be **directed** (an edge has a direction, like "A follows B") or **undirected** (a symmetric relationship, like "A is friends with B"), and **weighted** (edges carry a cost/distance) or **unweighted**.

The two standard representations, each with different tradeoffs:

\`\`\`text
Adjacency list (typical default — efficient for sparse graphs):
A -> [B, C]
B -> [A, D]
C -> [A]
D -> [B]

Adjacency matrix (efficient for dense graphs, or O(1) edge-existence checks):
    A  B  C  D
A [ 0, 1, 1, 0 ]
B [ 1, 0, 0, 1 ]
C [ 1, 0, 0, 0 ]
D [ 0, 1, 0, 0 ]
\`\`\`

\`\`\`typescript
const graph = new Map<string, string[]>([
  ['A', ['B', 'C']],
  ['B', ['A', 'D']],
  ['C', ['A']],
  ['D', ['B']],
]);
\`\`\`

An adjacency list uses O(V + E) space (vertices plus edges) and is the standard choice for **sparse** graphs (relatively few edges compared to the maximum possible) — most real-world graphs. An adjacency matrix uses O(V²) space regardless of how many edges actually exist, making it wasteful for sparse graphs but giving O(1) "is there an edge between A and B" checks, which an adjacency list can't do without scanning a node's full neighbor list.

The interview-relevant first step on almost any graph problem: explicitly state which representation you're using and why, since it directly determines the complexity of the traversal algorithms (BFS/DFS, covered in the advanced lessons) you'll build on top of it.`,
  },
  {
    title: 'Sets',
    content: `A set is a collection that stores **unique** values with no inherent order and no associated values (unlike a hash table's key-value pairs) — the core operations are membership testing, insertion, and deletion, almost always backed by the exact same hashing mechanism a hash table uses internally.

\`\`\`typescript
const seen = new Set<number>();
seen.add(5);
seen.add(5);          // no-op, already present
seen.has(5);          // true, O(1) average
seen.delete(5);       // O(1) average
seen.size;             // 1
\`\`\`

Because a set's membership check is O(1) average (versus O(n) for checking array membership via \`.includes()\`), converting a list to a set is a frequent, simple optimization for any problem that repeatedly asks "have I seen this value before?" — deduplicating a list, or detecting a cycle by tracking visited nodes.

\`\`\`typescript
function findDuplicates(nums: number[]): number[] {
  const seen = new Set<number>();
  const duplicates: number[] = [];
  for (const num of nums) {
    if (seen.has(num)) duplicates.push(num);
    seen.add(num);
  }
  return duplicates;
}
\`\`\`

Sets also support classic mathematical operations — union, intersection, difference — which come up directly in interview problems framed around comparing two collections (\`"find common elements between two arrays"\` is a one-line set intersection once both arrays are converted to sets). The interview-relevant habit: recognizing "I need fast membership testing with no associated value" as the specific signal that a set (not an array, not a hash map) is the right tool, rather than reaching for a hash map and ignoring its unused values.`,
  },
  {
    title: 'Strings as a Data Structure',
    content: `A string is, at the storage level, typically an array (or array-like sequence) of characters — which means many array algorithms and complexity intuitions (linear scans are O(n), nested scans are O(n²)) transfer directly to string problems, with a few language-specific caveats worth knowing.

\`\`\`typescript
function isPalindrome(s: string): boolean {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++; right--;
  }
  return true;
} // O(n) time, O(1) extra space — the two-pointer technique
\`\`\`

A critical, frequently-tested detail: strings are **immutable** in most high-level languages (JavaScript, Java, Python) — every "modification" (concatenation, slicing) actually allocates a brand-new string rather than mutating the original in place. Building a string by repeated concatenation in a loop (\`result += char\`) is therefore O(n²) overall, not O(n), since each \`+=\` copies the entire accumulated string so far into a new allocation; the standard fix is accumulating into a mutable array and joining once at the end (\`O(n)\` overall).

\`\`\`typescript
// O(n²) — repeated string concatenation
let result = '';
for (const char of chars) { result += char; }

// O(n) — accumulate in an array, join once
const parts: string[] = [];
for (const char of chars) { parts.push(char); }
const result2 = parts.join('');
\`\`\`

Common string-specific interview techniques worth recognizing by name: the **two-pointer** technique (shown above, for palindromes and reversal), the **sliding window** technique (for substring problems — finding the longest substring without repeating characters, for example), and using a hash map/array of character counts for anagram-related problems, since two strings are anagrams exactly when their character frequency counts match.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Balanced Trees: AVL and Red-Black Trees',
    content: `A plain binary search tree's O(log n) operations degrade to O(n) on adversarial or simply unlucky insertion orders (as covered in the fundamentals lesson on BSTs) — self-balancing trees solve this by automatically restructuring after each insertion/deletion to guarantee height stays O(log n) regardless of insertion order.

An **AVL tree** maintains the invariant that for every node, the heights of its left and right subtrees differ by at most 1 — checked and corrected via **rotations** after every insertion/deletion that violates it.

\`\`\`text
Unbalanced (right-heavy, violates AVL invariant):    After a left rotation:
    1                                                      2
     \\                                                   /   \\
      2                                                 1     3
       \\
        3
\`\`\`

A **red-black tree** maintains balance through a different, looser invariant (a coloring scheme with rules about consecutive red nodes and equal black-height on every path), which permits somewhat less strict balance than an AVL tree but requires fewer rotations on average — the practical reason red-black trees are the more common choice in standard library implementations (Java's \`TreeMap\`, C++'s \`std::map\`) despite AVL trees offering marginally faster lookups due to stricter balance.

The interview-relevant comparison most candidates can't articulate precisely: AVL trees are more rigidly balanced (better for lookup-heavy workloads), while red-black trees rebalance more cheaply on insertion/deletion (better for write-heavy workloads) — both guarantee O(log n) for search, insert, and delete, but they sit at different points on the same lookup-speed-versus-rebalancing-cost tradeoff curve. You're rarely asked to implement the rotation logic from scratch in an interview, but being able to explain *why* self-balancing trees exist and what specific failure mode they prevent is the actual signal being tested.`,
  },
  {
    title: 'Tries',
    content: `A trie (prefix tree) is a tree structure specialized for storing and querying strings, where each path from the root represents a prefix, and each node has up to one child per possible next character — shared prefixes between stored strings share the same path through the tree, rather than each string being stored as an independent, fully separate sequence.

\`\`\`text
Storing "cat", "car", "card":

root
 └─ c
     └─ a
         ├─ t (end of "cat")
         └─ r (end of "car")
              └─ d (end of "card")
\`\`\`

\`\`\`typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
}

function insert(root: TrieNode, word: string): void {
  let node = root;
  for (const char of word) {
    if (!node.children.has(char)) node.children.set(char, new TrieNode());
    node = node.children.get(char)!;
  }
  node.isEndOfWord = true;
}
\`\`\`

Lookups and insertions are O(L) where L is the length of the word being searched/inserted — independent of how many other words are stored, which is the trie's key advantage over a hash set of strings for **prefix**-based queries: finding all words starting with a given prefix is a direct tree traversal from the prefix's final node, whereas a hash set would require scanning every stored string to check which ones start with that prefix.

Tries are the standard structure behind autocomplete, spell-checkers, and IP routing tables (where prefixes determine routing decisions). The interview-relevant signal for reaching for a trie specifically: the problem is about strings *and* prefixes matter (autocomplete, "does any word in this dictionary start with this sequence") — a plain hash set is the better, simpler choice if you only ever need exact-match lookups with no prefix semantics involved.`,
  },
  {
    title: 'Graph Traversal: BFS and DFS',
    content: `Breadth-First Search (BFS) and Depth-First Search (DFS) are the two fundamental algorithms for visiting every reachable node in a graph, differing in *order*: BFS explores level by level (all neighbors of the start node, then all of *their* unvisited neighbors, and so on), using a **queue**; DFS dives as deep as possible down one path before backtracking, using a **stack** (often implicitly, via recursion).

\`\`\`typescript
function bfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set([start]);
  const queue = [start];
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}
\`\`\`

\`\`\`typescript
function dfs(graph: Map<string, string[]>, node: string, visited = new Set<string>()): string[] {
  visited.add(node);
  const order = [node];
  for (const neighbor of graph.get(node) ?? []) {
    if (!visited.has(neighbor)) order.push(...dfs(graph, neighbor, visited));
  }
  return order;
}
\`\`\`

Both run in O(V + E) time (every vertex and edge visited once) and require O(V) space for the visited set, but they answer different questions well: BFS is the natural choice for **shortest path in an unweighted graph** (the first time you reach a node via BFS is guaranteed to be via the fewest edges, since it explores in order of distance from the start), while DFS is natural for **exhaustive exploration** problems — detecting cycles, topological sorting, finding connected components, or any "explore every possibility down a branch before trying another" backtracking-style problem.

The single most common interview mistake: forgetting the \`visited\` set entirely, which causes infinite loops on any graph containing a cycle — both BFS and DFS absolutely require tracking visited nodes unless the graph is guaranteed acyclic (a tree, or a DAG being processed in a way that can't revisit a node).`,
  },
  {
    title: 'Union-Find (Disjoint Set)',
    content: `Union-Find (also called Disjoint Set Union) tracks a collection of elements partitioned into disjoint groups, supporting two operations efficiently: \`find\` (which group does this element belong to?) and \`union\` (merge two groups into one) — the canonical structure for any problem about connectivity or grouping that evolves incrementally.

\`\`\`typescript
class UnionFind {
  private parent: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i); // each element starts as its own group
  }

  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); // path compression
    return this.parent[x];
  }

  union(a: number, b: number): void {
    const rootA = this.find(a), rootB = this.find(b);
    if (rootA !== rootB) this.parent[rootA] = rootB;
  }
}
\`\`\`

With two key optimizations — **path compression** (shown above: flatten the tree toward the root every time \`find\` is called) and **union by rank/size** (always attach the smaller tree under the larger tree's root) — both \`find\` and \`union\` run in amortized nearly-O(1) time (technically O(α(n)), where α is the inverse Ackermann function, which for any input size that could ever exist in practice is effectively a small constant).

This structure is the standard tool behind Kruskal's minimum spanning tree algorithm, detecting cycles in an undirected graph (a new edge connecting two nodes already in the same group means a cycle), and "number of connected components" style problems. The interview-relevant signal for reaching for Union-Find specifically: the problem involves groups that **merge over time** as you process a sequence of connections, rather than a graph that's fully known upfront and traversed once — that incremental-merging shape is what Union-Find is purpose-built for.`,
  },
  {
    title: 'Segment Trees and Fenwick Trees',
    content: `Both structures answer the same class of problem efficiently: "given an array, support range queries (sum, min, max over a range) **and** point updates, both faster than the naive O(n) per query or O(n) per update."

A **Fenwick tree** (Binary Indexed Tree) is the simpler of the two, typically used for prefix sums — it represents the array implicitly using a clever indexing scheme based on the binary representation of indices, supporting both point updates and prefix-sum queries in O(log n).

\`\`\`typescript
class FenwickTree {
  private tree: number[];
  constructor(size: number) { this.tree = new Array(size + 1).fill(0); }

  update(i: number, delta: number): void {
    for (; i < this.tree.length; i += i & -i) this.tree[i] += delta;
  }

  prefixSum(i: number): number {
    let sum = 0;
    for (; i > 0; i -= i & -i) sum += this.tree[i];
    return sum;
  }
}
\`\`\`

A **segment tree** is more general — a binary tree where each node represents the answer (sum, min, max, or any associative combination) over a range of the original array, letting you query *any* arbitrary subrange (not just a prefix) in O(log n), and supports a wider variety of operations (range min/max, not just sum) that Fenwick trees alone don't naturally handle.

\`\`\`text
Array:        [1, 3, 5, 7, 9, 11]
Segment tree (sums):
                       36
                  /          \\
                9              27
              /   \\          /    \\
             4      5       16     11
            / \\           /  \\
           1   3         7    9
\`\`\`

The interview-relevant signal: these are advanced, fairly specialized structures — almost never needed unless a problem explicitly demands **repeated range queries interleaved with updates** on the same dataset (a static array needing one-time range sums can just use prefix sums precomputed once, O(n) total, no tree needed at all). Reaching for a segment/Fenwick tree on a problem that doesn't actually need repeated updates is itself a sign of overengineering worth catching before writing the code.`,
  },
  {
    title: 'LRU Cache Design',
    content: `An LRU (Least Recently Used) cache evicts the least-recently-accessed item when it reaches capacity — a frequent system-design-adjacent interview question because it requires combining two data structures to hit the target complexity, rather than being solvable by one structure alone.

The combination: a **hash map** for O(1) lookup by key, and a **doubly linked list** to maintain access order, with the map storing direct references to linked list nodes so any node can be removed/repositioned in O(1) without traversal.

\`\`\`typescript
class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>(); // JS Maps preserve insertion order, used here as the ordering structure

  constructor(capacity: number) { this.capacity = capacity; }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value); // re-insert to mark as most recently used
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value; // first key = least recently used
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}
\`\`\`

A hash map alone gives O(1) lookup but no way to know access order; a linked list alone gives ordering but O(n) lookup by key. Neither alone hits O(1) for both \`get\` and \`put\` — that's exactly why the textbook solution combines them (or, as shown, leans on a language's \`Map\` that already preserves insertion order internally, re-inserting on access to keep that order meaningful).

The interview-relevant skill this problem specifically tests: recognizing that some requirements (fast lookup *and* fast reordering) can't be satisfied by any single textbook structure, and that combining two simpler structures — each handling the part it's naturally good at — is itself the core technique, not a workaround.`,
  },
  {
    title: 'Skip Lists',
    content: `A skip list is a linked-list-based structure augmented with multiple "levels" of shortcuts, giving expected O(log n) search, insertion, and deletion — a simpler-to-implement probabilistic alternative to balanced trees (AVL, red-black) that achieves similar average-case performance through randomization rather than strict rebalancing rules.

\`\`\`text
Level 2:  1 --------------------> 9
Level 1:  1 --------> 5 --------> 9 --------> 12
Level 0:  1 -> 3 -> 5 -> 7 -> 9 -> 10 -> 12 -> 15
\`\`\`

Searching starts at the topmost level and moves right until the next node would overshoot the target, then drops down a level and continues — each level skipped roughly halves the remaining nodes to check, the same intuition as binary search, but achieved through extra "express lane" pointers layered on top of an ordinary sorted linked list rather than a tree shape.

Each node's height (how many levels it participates in) is determined randomly at insertion time, typically with each level having roughly half the probability of the level below it — this randomization is what gives the expected O(log n) behavior without needing the careful, deterministic rebalancing logic (rotations) that AVL/red-black trees require.

The interview-relevant context: skip lists are less commonly asked about than BSTs or heaps, but they're worth recognizing by name since they're the structure underlying Redis's sorted sets — a practical real-world example of choosing simplicity of implementation (no rotation logic) over the deterministic worst-case guarantees a balanced tree provides, accepting a probabilistic guarantee instead, in a system where average-case performance and implementation simplicity mattered more than eliminating every theoretical worst case.`,
  },
  {
    title: 'B-Trees and Database Indexing Structures',
    content: `A B-tree is a self-balancing tree generalized from a binary search tree to allow many children per node (not just two) — specifically designed to minimize the number of disk reads needed for a lookup, which is why it's the structure underlying most relational database indexes (covered earlier in the SQL lessons) rather than a binary search tree.

\`\`\`text
A B-tree node with multiple keys and children:

        [ 10 | 20 | 30 ]
       /     |     |     \\
   <10    10-20  20-30   >30
\`\`\`

The key insight: disk I/O is dramatically slower than in-memory comparisons, so the cost that actually matters for an on-disk index is the **number of disk pages read**, not the number of comparisons performed. A binary tree with a million entries has height ~20 (log₂ of a million) — twenty disk reads per lookup. A B-tree with a branching factor of, say, 100 has height ~3 for the same million entries — only three disk reads, since each node holds far more keys and is sized to match a single disk page, packing far more useful comparisons into each expensive read.

This is precisely why database indexes use B-trees (or the closely related B+ trees, which additionally chain leaf nodes together for efficient range scans) rather than binary search trees: the relevant cost model for in-memory structures (minimize comparisons) is different from the relevant cost model for disk-backed structures (minimize page reads), and B-trees are shaped specifically to optimize the latter.

The interview-relevant connective tissue: this lesson directly explains *why* the SQL lessons' coverage of indexes describes them as B-trees rather than binary search trees — a detail that demonstrates you understand the underlying data structure decision, not just that "databases use indexes for speed."`,
  },
  {
    title: 'Bloom Filters',
    content: `A Bloom filter is a space-efficient probabilistic structure that answers "might this element be in the set?" — with no false negatives (if it says "definitely not present," that's always correct) but a tunable rate of false positives (it can occasionally say "might be present" for something that actually isn't).

\`\`\`text
Insert "apple": compute k hash functions, set those k bit positions to 1
                hash1("apple")=3, hash2("apple")=7, hash3("apple")=11
                bits: [0,0,0,1,0,0,0,1,0,0,0,1,0,...]

Check "banana": compute the same k hashes for "banana" — if ANY bit is 0, definitely absent;
                if ALL bits are 1, probably present (could be a false positive from other insertions)
\`\`\`

\`\`\`typescript
class BloomFilter {
  private bits: Uint8Array;
  constructor(private size: number, private hashFns: ((s: string) => number)[]) {
    this.bits = new Uint8Array(size);
  }

  add(item: string): void {
    for (const hash of this.hashFns) this.bits[hash(item) % this.size] = 1;
  }

  mightContain(item: string): boolean {
    return this.hashFns.every(hash => this.bits[hash(item) % this.size] === 1);
  }
}
\`\`\`

The space savings come precisely from accepting that tradeoff: a Bloom filter uses a small, fixed bit array regardless of how many elements are inserted (unlike a hash set, which grows with the number of stored elements), at the cost of never being able to remove an element (clearing bits could falsely make a *different*, still-present element appear absent) and occasionally returning a false positive.

The interview-relevant use case to name: a fast, cheap **pre-check** before an expensive operation — checking a Bloom filter before querying a slow database or disk-backed index to skip the expensive lookup entirely for the (common) case where the item definitely isn't present, only falling through to the real, authoritative check when the Bloom filter says "maybe." Chrome's Safe Browsing and many database systems (to skip disk reads for keys that definitely don't exist) use exactly this pattern.`,
  },
  {
    title: 'Amortized Analysis',
    content: `Amortized analysis evaluates an operation's **average** cost over a worst-case sequence of operations, rather than the worst-case cost of any single operation in isolation — necessary whenever an occasional expensive operation is balanced out by many cheap ones, and analyzing only the expensive outlier in isolation would give a misleadingly pessimistic picture.

The canonical example is a dynamic array's \`push\` (covered in the Arrays lesson): most pushes are O(1) (there's spare capacity), but occasionally a push triggers a resize, copying every existing element into a new, larger array — an O(n) operation for that one push. Naively, you might say "push is sometimes O(n), so it's O(n) in the worst case" — but amortized analysis asks a different, more useful question: across a sequence of n pushes from empty, what's the *total* cost, divided by n?

\`\`\`text
Doubling strategy: resize happens at sizes 1, 2, 4, 8, 16, ...
Total copying work across n pushes: 1 + 2 + 4 + ... + n/2 ≈ n (a geometric series sums to roughly 2n)
Total cost for n pushes: O(n) total copying + O(n) for the pushes themselves = O(n) overall
Amortized cost per push: O(n) / n = O(1)
\`\`\`

The standard technique for proving this rigorously is the **accounting method**: imagine charging each push a small constant "fee" beyond its immediate cost, banked as credit, and showing that the banked credit is always enough to pay for the next expensive resize when it occurs — formalizing the intuition that cheap operations "pre-pay" for the occasional expensive one.

The interview-relevant distinction worth being explicit about: "amortized O(1)" is not the same claim as "worst-case O(1)" — if a single specific operation's individual timing matters (a real-time system with a hard per-operation deadline), an amortized guarantee isn't sufficient, since *some* individual operation in the sequence really does take O(n); the guarantee is only about the average cost smoothed across many operations, not any single one of them.`,
  },
  {
    title: 'Choosing the Right Data Structure for the Problem',
    content: `The most consistently tested interview skill isn't reciting a structure's complexity table from memory — it's mapping a problem's actual requirements onto the structure that satisfies them, which means first identifying *which operations* the problem performs, and *how often* each one happens.

\`\`\`text
"Find the kth largest element repeatedly as a stream arrives"
  -> need: efficient insert + efficient "get current max/min"
  -> a heap of bounded size k, not a sort-everything-each-time approach

"Check if a number has been seen before, many times, no need to recall order"
  -> need: O(1) membership testing only
  -> a hash set, not an array with .includes()

"Maintain a sliding window's sum/min/max efficiently as it moves"
  -> need: efficient insert/remove at both ends, sometimes ordered access
  -> a deque (double-ended queue), not a plain array shifted repeatedly

"Autocomplete suggestions by prefix"
  -> need: efficient prefix-based lookup
  -> a trie, not a hash set scanned linearly for prefix matches
\`\`\`

A consistently useful interview habit is explicitly stating the requirement before naming the structure: "this needs O(1) lookups but I also need to evict the oldest entry, so I need both a hash map and an ordering mechanism" — narrating the reasoning, not just announcing the answer, is what distinguishes pattern-matching a memorized problem from demonstrating the underlying judgment interviewers are actually trying to assess.

The broader takeaway tying together every lesson in this track: every structure covered here exists because it makes a specific operation cheap by deliberately making some other operation more expensive, or by accepting a probabilistic/amortized guarantee instead of a strict one — there is no universally "best" structure, only the one whose tradeoffs match what a specific problem actually needs.`,
  },
  {
    title: 'Immutable / Persistent Data Structures',
    content: `A persistent (or immutable) data structure never modifies itself in place — every "update" produces a new version while leaving all previous versions intact and still fully usable, rather than mutating shared state. This matters far beyond a stylistic preference: it eliminates an entire category of bugs caused by unexpected mutation of data another part of a program still holds a reference to.

The naive way to make any structure persistent — copy the entire thing on every update — is correct but wasteful, O(n) per update regardless of how small the actual change is. Real persistent structures avoid this with **structural sharing**: a new version reuses as much of the previous version's internal structure as possible, copying only the small path that actually changed.

\`\`\`text
Persistent linked list "prepend" — genuinely O(1), no copying at all:
Original: [2, 3, 4]
New:  1 -> [2, 3, 4]   (the new node just points at the existing, unmodified list)
\`\`\`

\`\`\`text
Persistent tree "update a leaf" — O(log n), only the path to that leaf is copied:
        root                    root'
       /    \\                  /    \\
      A      B        ->      A      B'   (only B's path is copied; A is shared, unchanged)
     / \\                     / \\
    C   D                   C   D'
\`\`\`

This is the structural-sharing technique React's reconciliation and libraries like Immutable.js rely on internally, and the same principle behind why "comparing object references" is a meaningful, fast way to detect whether something changed (covered earlier in the React lessons on \`useMemo\`/\`React.memo\`) — if an update always produces a structurally-shared new reference whenever (and only whenever) something actually changed, a cheap reference-equality check reliably tells you whether to re-render, without needing an expensive deep comparison of the entire structure's contents.

The interview-relevant throughline: this lesson connects data structure theory directly back to a real, practical performance pattern used throughout modern UI frameworks — immutability isn't just a functional-programming preference, it's the specific mechanism that makes fast, cheap change-detection possible at all.`,
  },
];

export function seedDataStructuresLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['data-structures']);
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
