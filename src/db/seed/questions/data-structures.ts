import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedDataStructuresQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['data-structures']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the difference between a stack and a queue?',
      answer: `Both are linear data structures, but they differ in the order elements are removed.

**Stack — LIFO (Last In, First Out):** The last element added is the first removed. Like a stack of plates.

\`\`\`js
class Stack {
  #data = [];
  push(item)    { this.#data.push(item); }
  pop()         { return this.#data.pop(); }      // removes last
  peek()        { return this.#data.at(-1); }
  isEmpty()     { return this.#data.length === 0; }
}
\`\`\`

**Queue — FIFO (First In, First Out):** The first element added is the first removed. Like a checkout line.

\`\`\`js
class Queue {
  #data = [];
  enqueue(item) { this.#data.push(item); }
  dequeue()     { return this.#data.shift(); }    // removes first
  front()       { return this.#data[0]; }
  isEmpty()     { return this.#data.length === 0; }
}
\`\`\`

**Stack use cases:** function call stack, undo/redo, expression evaluation, DFS.
**Queue use cases:** BFS, task scheduling, print queues, rate limiters.

Note: \`Array.shift()\` is O(n). For a production queue, use a linked list or a circular buffer for O(1) dequeue.`,
      difficulty: 1,
      tags: 'stack,queue,lifo,fifo',
    },
    {
      title: 'What is a linked list and when would you use it over an array?',
      answer: `A linked list is a sequence of nodes where each node holds a value and a pointer to the next node. There's no contiguous memory allocation.

\`\`\`js
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Build: 1 → 2 → 3
const head = new ListNode(1, new ListNode(2, new ListNode(3)));

// Traverse
let current = head;
while (current) {
  console.log(current.val);
  current = current.next;
}
\`\`\`

| Operation | Array | Linked List |
|---|---|---|
| Access by index | O(1) | O(n) |
| Insert/delete at start | O(n) | O(1) |
| Insert/delete at end | O(1) amortized | O(n) / O(1) with tail |
| Insert/delete at middle | O(n) | O(1) with pointer |
| Memory | Cache-friendly | Pointer overhead |

**Choose linked lists when:** you need O(1) insertions/deletions at the front and don't need random access. In practice (JS/Python), built-in arrays/lists are almost always faster due to CPU cache behavior. Linked lists shine as the underlying structure for stacks, queues, and LRU caches.`,
      difficulty: 2,
      tags: 'linked-list,nodes,pointers',
    },
    {
      title: 'What is a hash table and how does it handle collisions?',
      answer: `A hash table maps keys to values using a hash function that converts keys to array indices. Average-case O(1) for insert, lookup, and delete.

\`\`\`
key → hash(key) → index → value
"alice" → hash → 3 → bucket[3] → { email: "alice@..." }
\`\`\`

**Collision:** two keys hash to the same index. Resolution strategies:

**1. Chaining** — each bucket holds a linked list of entries:
\`\`\`
bucket[3] → [("alice", ...), ("bob", ...)]  // collision resolved
\`\`\`

**2. Open addressing** — probe for the next open slot:
- Linear probing: check bucket+1, bucket+2, ...
- Quadratic probing: check bucket+1², bucket+2², ...
- Double hashing: use a second hash function for step size

**Load factor** = number of entries / number of buckets. Most implementations resize (rehash) when the load factor exceeds ~0.75 to maintain O(1) performance.

JavaScript objects and \`Map\` are hash tables. Python's \`dict\` uses open addressing with a compact table. Java's \`HashMap\` uses chaining. In interviews, know that worst-case hash table is O(n) when all keys collide — real implementations use cryptographic-quality hash functions to prevent this.`,
      difficulty: 2,
      tags: 'hash-table,collision,hashing',
    },
    {
      title: 'What is a binary tree and what are its traversal orders?',
      answer: `A binary tree is a tree where each node has at most two children (left and right). It has no inherent ordering constraint (unlike a BST).

\`\`\`js
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val; this.left = left; this.right = right;
  }
}

//        1
//       / \\
//      2   3
//     / \\
//    4   5

// Inorder: left → root → right → [4, 2, 5, 1, 3]
function inorder(node) {
  if (!node) return [];
  return [...inorder(node.left), node.val, ...inorder(node.right)];
}

// Preorder: root → left → right → [1, 2, 4, 5, 3]
function preorder(node) {
  if (!node) return [];
  return [node.val, ...preorder(node.left), ...preorder(node.right)];
}

// Postorder: left → right → root → [4, 5, 2, 3, 1]
function postorder(node) {
  if (!node) return [];
  return [...postorder(node.left), ...postorder(node.right), node.val];
}

// Level order (BFS) → [[1], [2, 3], [4, 5]]
function levelOrder(root) {
  const result = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (node) { level.push(node.val); queue.push(node.left, node.right); }
    }
    if (level.length) result.push(level);
  }
  return result;
}
\`\`\``,
      difficulty: 2,
      tags: 'binary-tree,traversal,dfs,bfs',
    },
    {
      title: 'What is a binary search tree (BST)?',
      answer: `A BST is a binary tree with the ordering property: for every node, all values in its left subtree are less than the node, and all values in the right subtree are greater.

\`\`\`
       5
      / \\
     3   7
    / \\ / \\
   2  4 6  8
\`\`\`

This gives O(log n) search, insert, and delete in a **balanced** BST.

\`\`\`js
function search(node, target) {
  if (!node) return null;
  if (target === node.val) return node;
  if (target < node.val) return search(node.left, target);
  return search(node.right, target);
}

function insert(node, val) {
  if (!node) return new TreeNode(val);
  if (val < node.val) node.left = insert(node.left, val);
  else if (val > node.val) node.right = insert(node.right, val);
  return node;
}
\`\`\`

**Problem — unbalanced trees:** inserting sorted data (1, 2, 3, 4...) creates a linear tree with O(n) operations. Self-balancing BSTs (AVL tree, Red-Black tree) maintain O(log n) by rotating nodes. Java's \`TreeMap\`, C++'s \`std::set\`, and many DB indexes use Red-Black trees.

**Inorder traversal of a BST returns values in sorted order** — a key interview insight.`,
      difficulty: 2,
      tags: 'bst,binary-search-tree,balanced',
    },
    {
      title: 'What is a heap data structure?',
      answer: `A heap is a complete binary tree that satisfies the heap property:
- **Max-heap:** every parent ≥ its children (root is the maximum)
- **Min-heap:** every parent ≤ its children (root is the minimum)

Heaps are efficiently stored in arrays — for index \`i\`: left child = \`2i+1\`, right child = \`2i+2\`, parent = \`⌊(i-1)/2⌋\`.

\`\`\`
Min-heap: [1, 3, 5, 4, 8, 7, 6]
          1
        /   \\
       3     5
      / \\   / \\
     4   8 7   6
\`\`\`

**Operations:** insert O(log n), remove-min/max O(log n), peek O(1), heapify O(n).

**Use cases:**
- Priority queues (Dijkstra's algorithm, A*, task schedulers)
- Heap sort (O(n log n))
- Finding top-K elements efficiently
- Median tracking (two-heap technique: max-heap for lower half, min-heap for upper half)

Most languages provide a built-in priority queue backed by a heap (Python's \`heapq\`, Java's \`PriorityQueue\`, C++'s \`priority_queue\`).`,
      difficulty: 2,
      tags: 'heap,priority-queue,min-heap',
    },
    {
      title: 'What is a graph and how do you represent it?',
      answer: `A graph is a collection of **vertices (nodes)** and **edges (connections)** between them. Edges can be directed or undirected, weighted or unweighted.

**Two common representations:**

**1. Adjacency List** — maps each vertex to its neighbors:
\`\`\`js
// Undirected graph: 0--1--2, 0--2
const graph = {
  0: [1, 2],
  1: [0, 2],
  2: [0, 1],
};

// Weighted
const weighted = {
  A: [{ node: 'B', weight: 4 }, { node: 'C', weight: 2 }],
  B: [{ node: 'D', weight: 5 }],
};
\`\`\`
Space: O(V + E). Efficient for sparse graphs.

**2. Adjacency Matrix** — V×V matrix where \`matrix[i][j] = 1\` if edge exists:
\`\`\`js
const matrix = [
  [0, 1, 1],  // vertex 0 connects to 1, 2
  [1, 0, 1],  // vertex 1 connects to 0, 2
  [1, 1, 0],  // vertex 2 connects to 0, 1
];
\`\`\`
Space: O(V²). Efficient for dense graphs and O(1) edge existence checks.

**Adjacency list is preferred for most interview problems** because real-world graphs are sparse.`,
      difficulty: 2,
      tags: 'graph,adjacency-list,adjacency-matrix',
    },
    {
      title: 'What is the difference between BFS and DFS?',
      answer: `Both are graph/tree traversal algorithms that visit all reachable nodes.

**BFS (Breadth-First Search):** explores level by level using a queue. Finds the shortest path in unweighted graphs.

\`\`\`js
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}
\`\`\`

**DFS (Depth-First Search):** explores as far as possible before backtracking, using a stack (or recursion).

\`\`\`js
function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
}
\`\`\`

| | BFS | DFS |
|---|---|---|
| Data structure | Queue | Stack / recursion |
| Shortest path (unweighted) | Yes | No |
| Memory | O(width) | O(depth) |
| Use cases | Level order, shortest path | Cycle detection, topological sort, connected components |`,
      difficulty: 2,
      tags: 'bfs,dfs,graph-traversal',
    },
    {
      title: 'What is a trie (prefix tree)?',
      answer: `A trie is a tree data structure optimized for string prefix operations. Each node represents a character; paths from root to nodes spell out strings or prefixes.

\`\`\`js
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return true;
  }
}
\`\`\`

**Time complexity:** O(m) for insert and search where m = word length — independent of dictionary size.

**Use cases:** autocomplete, spell checking, IP routing tables (radix tree), prefix-based search. Tradeoff: memory-intensive for large vocabularies. Compressed tries (Patricia/radix trees) reduce memory usage.`,
      difficulty: 3,
      tags: 'trie,prefix-tree,strings',
    },
    {
      title: 'What is Big O notation and how do you analyze time complexity?',
      answer: `Big O describes the upper bound of an algorithm's resource usage (time or space) as input size (n) grows. It expresses the worst-case growth rate, ignoring constants.

**Common complexities (best to worst):**

| Complexity | Example |
|---|---|
| O(1) | Hash table lookup, array index |
| O(log n) | Binary search, BST operations |
| O(n) | Linear scan, single loop |
| O(n log n) | Merge sort, heap sort |
| O(n²) | Nested loops, bubble sort |
| O(2ⁿ) | Recursive Fibonacci (naive) |
| O(n!) | Permutations |

\`\`\`js
// O(1) — constant
function getFirst(arr) { return arr[0]; }

// O(n) — linear
function contains(arr, target) {
  for (const item of arr) if (item === target) return true;
  return false;
}

// O(n²) — nested loops over same array
function hasDuplicates(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
}
// Better: O(n) with a Set
\`\`\`

**Rules:** drop constants (O(3n) = O(n)), drop lower-order terms (O(n² + n) = O(n²)). For recursive algorithms, use the recurrence relation (Master Theorem).`,
      difficulty: 1,
      tags: 'big-o,complexity,time-complexity',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
