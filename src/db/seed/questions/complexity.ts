import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

interface ComplexityQuestion {
  title: string;
  answer: string;
  difficulty: number;
  tags: string;
}

const dataStructuresQuestions: ComplexityQuestion[] = [
  {
    title: 'Big O: what is O(1) constant time?',
    answer: `**O(1) — constant time.** The number of operations does not grow with the input size. There are **no loops** over the input; the work is a fixed number of steps regardless of whether n is 10 or 10 million.

\`\`\`js
// Array index access — one operation
function first(arr) {
  return arr[0];
}

// Hash map lookup — constant regardless of map size
function getUser(users, id) {
  return users.get(id);
}
\`\`\`

Typical O(1) operations: array indexing, hash map get/set, push/pop on a stack, arithmetic. Constant time does **not** mean "fast" — it means the cost stays flat as the input grows.`,
    difficulty: 1,
    tags: 'big-o,constant-time,complexity',
  },
  {
    title: 'Big O: what is O(log n) logarithmic time?',
    answer: `**O(log n) — logarithmic time.** Each step throws away a fraction (usually half) of the remaining input, so the work grows very slowly — doubling n adds just one more step. This shows up in searching algorithms over **sorted** data, like binary search.

\`\`\`js
// Binary search — halves the range each iteration (array must be sorted)
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;
  }
  return -1;
}
\`\`\`

Searching 1,000,000 sorted items takes only ~20 comparisons. Balanced BST operations and heap insert/remove are also O(log n) for the same halving reason.`,
    difficulty: 1,
    tags: 'big-o,logarithmic,binary-search,complexity',
  },
  {
    title: 'Big O: what is O(n) linear time?',
    answer: `**O(n) — linear time.** The work grows in direct proportion to the input: a single \`for\` or \`while\` loop that visits each of the n items once. Double the input, double the work.

\`\`\`js
// One pass over every element
function contains(arr, target) {
  for (const item of arr) {
    if (item === target) return true;
  }
  return false;
}
\`\`\`

Note: **iterating through only half a collection is still O(n)** — O(n/2) drops its constant and simplifies to O(n). Likewise two separate loops over the same array is O(2n) = O(n). Big O cares about the growth rate, not the exact count.`,
    difficulty: 1,
    tags: 'big-o,linear-time,complexity',
  },
  {
    title: 'Big O: what is O(n log n) log-linear time?',
    answer: `**O(n log n) — log-linear time.** A linear amount of work (n) done a logarithmic number of times (log n). This is the hallmark of efficient **sorting** algorithms — merge sort, heap sort, and quicksort's average case — which repeatedly split the data (log n levels) and do O(n) work merging or partitioning at each level.

\`\`\`js
// Merge sort — log n levels of splitting, O(n) merge work per level
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}
\`\`\`

O(n log n) is the best possible worst case for a general comparison-based sort. JavaScript's built-in \`Array.prototype.sort\` runs in O(n log n).`,
    difficulty: 2,
    tags: 'big-o,log-linear,sorting,complexity',
  },
  {
    title: 'Big O: what is O(n²) quadratic time?',
    answer: `**O(n²) — quadratic time.** Two **nested loops** over the same collection, so every element is compared against every other element. Work grows with the square of the input — 10 items is 100 operations, 1,000 items is 1,000,000.

\`\`\`js
// Nested loops — check every pair for a duplicate
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
// Better: O(n) using a Set
\`\`\`

Careful with **two separate collections**: looping over collection B *inside* a loop over collection A is **O(a · b)**, not O(n²), because the sizes are independent. Quadratic algorithms are common but often replaceable with a hash set/map to reach O(n).`,
    difficulty: 2,
    tags: 'big-o,quadratic,nested-loops,complexity',
  },
  {
    title: 'Big O: what is O(2ⁿ) exponential time?',
    answer: `**O(2ⁿ) — exponential time.** Each addition to the input roughly **doubles** the work. This comes from recursive algorithms that branch into multiple recursive calls to solve a problem of size n, re-solving the same subproblems repeatedly.

\`\`\`js
// Naive recursive Fibonacci — each call spawns two more calls
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
// fib(50) triggers over a billion calls
\`\`\`

Exponential algorithms become unusable even for modest n (fib(50) is already too slow). The fix is usually **memoization** or dynamic programming, which caches subproblem results to bring this down to O(n).`,
    difficulty: 2,
    tags: 'big-o,exponential,recursion,complexity',
  },
  {
    title: 'Big O: what is O(n!) factorial time?',
    answer: `**O(n!) — factorial time.** The worst common complexity. Work grows as n factorial (n × (n−1) × … × 1) — you effectively add another nested loop for every element. It appears when generating **all permutations** or orderings of a set.

\`\`\`js
// Generate every ordering of the input — n! results
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}
// 10 items = 3,628,800 permutations
\`\`\`

Factorial growth is astronomical — the brute-force traveling salesman problem is O(n!). These only work for very small n and are otherwise tackled with pruning (backtracking) or approximation.`,
    difficulty: 2,
    tags: 'big-o,factorial,permutations,complexity',
  },
];

const algorithmsQuestions: ComplexityQuestion[] = [
  {
    title: 'How do you reason about time and space complexity with Big O notation?',
    answer: `Big O describes how an algorithm's running time (or memory) grows as the input size **n** grows. It expresses the worst-case growth rate and ignores constants and lower-order terms, because those stop mattering as n gets large.

**The common classes, best to worst:**

| Big O | Name | What causes it |
|---|---|---|
| O(1) | Constant | No loops — a fixed number of steps regardless of n |
| O(log n) | Logarithmic | Halving the search space each step — searching a **sorted** input (binary search) |
| O(n) | Linear | A single loop over n items |
| O(n log n) | Log-linear | Efficient sorting (merge sort, heap sort) — a linear pass done log n times |
| O(n²) | Quadratic | Two nested loops — every element compared against every other |
| O(2ⁿ) | Exponential | Recursion that branches on each call (naive recursive Fibonacci) |
| O(n!) | Factorial | Adding a branch for every element — generating all permutations |

\`\`\`js
// O(1) — constant: no loop, one operation
function first(arr) { return arr[0]; }

// O(log n) — halve the range each step (input must be sorted)
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;
  }
  return -1;
}

// O(n) — one loop through n items
function sum(arr) {
  let total = 0;
  for (const x of arr) total += x;
  return total;
}

// O(n²) — every element compared to every other (two nested loops)
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
}
\`\`\`

**Rules that trip people up:**
- **Drop constants.** Iterating *half* a collection is still **O(n)** — O(n/2) simplifies to O(n). Two sequential loops over the same array is O(2n) = O(n).
- **Drop lower-order terms.** O(n² + n) becomes O(n²).
- **Two separate inputs get separate variables.** Looping over collection A then collection B is **O(a + b)**; looping over B *inside* A is **O(a · b)** — not O(n²), because they are different sizes.

**Space complexity** measures extra memory the algorithm allocates beyond the input, using the same notation:
- O(1) — a fixed number of variables (in-place swaps, two pointers).
- O(n) — a new array, hash set, or memo table sized to the input.
- O(log n) / O(n) — the recursion **call stack** counts as space: balanced recursion is O(log n) deep, linear recursion is O(n) deep.

Time and space often trade off — memoization spends O(n) memory to cut exponential time down to O(n).`,
    difficulty: 1,
    tags: 'big-o,complexity,time-complexity,space-complexity',
  },
];

function insertQuestions(
  db: QuickSQLiteConnection,
  slug: string,
  questions: ComplexityQuestion[],
): void {
  const categoryResult = db.execute('SELECT id FROM category WHERE slug = ?', [slug]);
  if (!categoryResult.rows || categoryResult.rows.length === 0) { return; }
  const categoryId = categoryResult.rows._array[0].id as number;

  const orderResult = db.execute(
    'SELECT COALESCE(MAX(sort_order), -1) AS max_order FROM question WHERE category_id = ?',
    [categoryId],
  );
  let sortOrder = (orderResult.rows?._array[0]?.max_order as number) + 1;

  questions.forEach(question => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, sortOrder, CREATED_AT],
    );
    sortOrder += 1;
  });
}

export function seedComplexityQuestions(db: QuickSQLiteConnection): void {
  insertQuestions(db, 'data-structures', dataStructuresQuestions);
  insertQuestions(db, 'algorithms', algorithmsQuestions);
}
