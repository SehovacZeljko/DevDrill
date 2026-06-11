import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedAlgorithmsQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['algorithms']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is binary search and when can you use it?',
      answer: `Binary search finds a target in a **sorted** array in O(log n) by repeatedly halving the search space.

\`\`\`js
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2); // avoid overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1; // not found
}
\`\`\`

**Condition:** the array (or search space) must be sorted, or monotonic — a predicate that transitions from false to true (or vice versa) exactly once.

**Variations:**
- Find leftmost occurrence: adjust to \`right = mid - 1\` when found
- Find first position where condition is true: binary search on the predicate
- Search in rotated sorted array: determine which half is sorted, then apply normal search

**Beyond arrays:** binary search on answers — "find minimum speed such that all packages are delivered in D days" is a binary search on the answer space [1, max_weight].

Time: O(log n), Space: O(1) iteratively, O(log n) recursively (call stack).`,
      difficulty: 1,
      tags: 'binary-search,sorted,divide-and-conquer',
    },
    {
      title: 'What is dynamic programming and when should you use it?',
      answer: `Dynamic programming (DP) solves problems by breaking them into overlapping subproblems, solving each once, and storing the results (memoization or tabulation) to avoid recomputation.

**Two conditions for DP:**
1. **Optimal substructure** — optimal solution contains optimal solutions to subproblems
2. **Overlapping subproblems** — same subproblems are solved multiple times

\`\`\`js
// Fibonacci — classic overlapping subproblems

// Naive recursion: O(2^n)
function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }

// Top-down (memoization): O(n) time, O(n) space
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fib(n-1, memo) + fib(n-2, memo);
}

// Bottom-up (tabulation): O(n) time, O(1) space
function fib(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}
\`\`\`

**Classic DP problems:** longest common subsequence, knapsack, coin change, edit distance, matrix chain multiplication. Recognize DP by: choices at each step, overlapping work, and an ask for min/max/count of something.`,
      difficulty: 3,
      tags: 'dynamic-programming,memoization,optimization',
    },
    {
      title: 'What is the two-pointer technique?',
      answer: `The two-pointer technique uses two indices that move through an array (or other structure) to solve problems in O(n) time that would otherwise require O(n²) with nested loops.

**Pattern 1 — Opposite ends (sorted array):**
\`\`\`js
// Two sum in sorted array
function twoSum(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [];
}
\`\`\`

**Pattern 2 — Fast and slow (same direction):**
\`\`\`js
// Remove duplicates from sorted array in-place
function removeDuplicates(nums) {
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) nums[++slow] = nums[fast];
  }
  return slow + 1;
}

// Detect cycle in linked list (Floyd's algorithm)
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
\`\`\`

Common problems: container with most water, valid palindrome, three-sum, merge sorted arrays.`,
      difficulty: 2,
      tags: 'two-pointer,arrays,optimization',
    },
    {
      title: 'What is a sliding window algorithm?',
      answer: `The sliding window technique maintains a subset (window) of elements as you iterate through a sequence. The window grows or shrinks based on constraints, solving problems in O(n) instead of O(n²).

**Fixed-size window:**
\`\`\`js
// Maximum sum of k consecutive elements
function maxSum(arr, k) {
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // slide: add new, remove old
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
\`\`\`

**Variable-size window (expand/contract):**
\`\`\`js
// Longest substring without repeating characters
function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLen = 0, left = 0;

  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right]) >= left) {
      left = seen.get(s[right]) + 1; // contract: move left past duplicate
    }
    seen.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
\`\`\`

Common problems: minimum window substring, max consecutive ones, fruit in baskets, longest subarray with sum ≤ k.`,
      difficulty: 2,
      tags: 'sliding-window,strings,arrays',
    },
    {
      title: 'What is a greedy algorithm?',
      answer: `A greedy algorithm makes the locally optimal choice at each step, hoping to reach a globally optimal solution. It never reconsiders past choices.

**When greedy works:** the problem has the greedy choice property — a local optimum leads to a global optimum. Often proven by an "exchange argument."

\`\`\`js
// Activity selection: pick max number of non-overlapping intervals
function maxActivities(intervals) {
  intervals.sort((a, b) => a[1] - b[1]); // sort by end time (greedy choice)
  let count = 1, lastEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] >= lastEnd) { // no overlap
      count++;
      lastEnd = intervals[i][1];
    }
  }
  return count;
}

// Coin change (greedy works only for canonical coin systems)
function minCoins(coins, amount) {
  coins.sort((a, b) => b - a); // largest first
  let count = 0;
  for (const coin of coins) {
    count += Math.floor(amount / coin);
    amount %= coin;
  }
  return amount === 0 ? count : -1;
}
// Note: greedy fails for coins [1, 3, 4] and amount 6 — use DP instead
\`\`\`

**Classic greedy problems:** Dijkstra's shortest path, Huffman coding, Kruskal's MST, jump game.`,
      difficulty: 2,
      tags: 'greedy,algorithms,optimization',
    },
    {
      title: 'What is memoization and how does it differ from tabulation?',
      answer: `Both are DP caching techniques that trade memory for time by storing previously computed results.

**Memoization (top-down):** start with the original recursive function, add a cache, and return cached results before recomputing.
\`\`\`js
function coinChange(coins, amount, memo = {}) {
  if (amount === 0) return 0;
  if (amount < 0) return -1;
  if (amount in memo) return memo[amount];

  let min = Infinity;
  for (const coin of coins) {
    const result = coinChange(coins, amount - coin, memo);
    if (result !== -1) min = Math.min(min, result + 1);
  }
  return memo[amount] = min === Infinity ? -1 : min;
}
\`\`\`

**Tabulation (bottom-up):** build a table iteratively from base cases up.
\`\`\`js
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
\`\`\`

**Comparison:**
| | Memoization | Tabulation |
|---|---|---|
| Direction | Top-down | Bottom-up |
| Stack overhead | O(n) recursion | O(1) |
| Only needed states | Yes (skips irrelevant) | Computes all |
| Space optimization | Harder | Easier |`,
      difficulty: 2,
      tags: 'memoization,tabulation,dynamic-programming',
    },
    {
      title: 'What are the time complexities of common sorting algorithms?',
      answer: `| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | O(k) | Yes |
| Radix Sort | O(nk) | O(nk) | O(nk) | O(n+k) | Yes |

\`\`\`js
// Quick sort in-place — O(n log n) average, pivots matter
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low >= high) return;
  const pivot = partition(arr, low, high);
  quickSort(arr, low, pivot - 1);
  quickSort(arr, pivot + 1, high);
}
\`\`\`

**Practical notes:**
- Most language runtimes use Timsort (merge sort + insertion sort) — O(n log n) worst, stable, O(n) for nearly-sorted data
- Quick sort has best cache performance due to in-place operation despite O(n²) worst case — random pivot mitigates this
- Use counting/radix sort for bounded integer keys (e.g., sort 1M numbers in range 0–1000)`,
      difficulty: 2,
      tags: 'sorting,complexity,algorithms',
    },
    {
      title: 'What is backtracking?',
      answer: `Backtracking is an algorithmic technique for exploring all possible solutions by building candidates incrementally and abandoning (backtracking) as soon as the current candidate cannot lead to a valid solution.

\`\`\`js
// Permutations — generate all orderings of nums
function permute(nums) {
  const result = [];

  function backtrack(current, remaining) {
    if (remaining.length === 0) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      backtrack(current, [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
      current.pop(); // backtrack
    }
  }

  backtrack([], nums);
  return result;
}

// N-Queens: place N queens so none attack each other
function solveNQueens(n) {
  const solutions = [];
  const board = Array.from({ length: n }, () => '.'.repeat(n));

  function isValid(row, col, queens) {
    for (const [r, c] of queens) {
      if (c === col || Math.abs(r - row) === Math.abs(c - col)) return false;
    }
    return true;
  }

  function backtrack(row, queens) {
    if (row === n) { solutions.push(buildBoard(queens, n)); return; }
    for (let col = 0; col < n; col++) {
      if (isValid(row, col, queens)) {
        queens.push([row, col]);
        backtrack(row + 1, queens);
        queens.pop();
      }
    }
  }

  backtrack(0, []);
  return solutions;
}
\`\`\`

Backtracking = DFS + pruning. Common problems: sudoku, word search, combination sum, subsets.`,
      difficulty: 3,
      tags: 'backtracking,recursion,dfs',
    },
    {
      title: 'What is Dijkstra\'s algorithm?',
      answer: `Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph with non-negative edge weights. Time complexity: O((V + E) log V) with a min-heap.

\`\`\`js
function dijkstra(graph, source) {
  // graph: { node: [{ node, weight }, ...] }
  const distances = {};
  const visited = new Set();
  const minHeap = [[0, source]]; // [distance, node]

  for (const node in graph) distances[node] = Infinity;
  distances[source] = 0;

  while (minHeap.length) {
    const [dist, node] = minHeap.shift(); // use real min-heap in production
    if (visited.has(node)) continue;
    visited.add(node);

    for (const { node: neighbor, weight } of graph[node] ?? []) {
      const newDist = dist + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        minHeap.push([newDist, neighbor]);
        minHeap.sort((a, b) => a[0] - b[0]); // maintain heap order
      }
    }
  }
  return distances;
}
\`\`\`

**Why not BFS?** BFS assumes uniform edge weights. Dijkstra handles variable weights by always processing the unvisited node with the smallest known distance.

**Limitations:** doesn't handle negative edge weights (use Bellman-Ford for those). A* is Dijkstra with a heuristic for directed goal-seeking.`,
      difficulty: 3,
      tags: 'dijkstra,shortest-path,graphs',
    },
    {
      title: 'What is merge sort and why is it preferred for linked lists?',
      answer: `Merge sort is a divide-and-conquer algorithm: split the array in half, recursively sort each half, then merge the two sorted halves. O(n log n) in all cases.

\`\`\`js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
}
\`\`\`

**Why merge sort is ideal for linked lists:**
1. **No random access needed** — splitting and merging use only sequential traversal
2. **No extra space for arrays** — can merge in-place with pointer manipulation
3. Quick sort's partition step requires random access (bad for linked lists)

**Why quick sort is usually preferred for arrays:** merge sort needs O(n) extra space for the merge step; quick sort is in-place. However, merge sort is stable (preserves order of equal elements), which is often required when sorting objects by one key.`,
      difficulty: 2,
      tags: 'merge-sort,divide-and-conquer,stable',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
