import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What an Algorithm Is and How to Analyze One',
    content: `An algorithm is a precise, finite sequence of steps for solving a problem or computing a result — distinct from a data structure (which organizes data) in that an algorithm describes the *process* applied to that data. The same data structure can support many different algorithms, and the same algorithm can run over many different structures, often with different resulting performance.

Analyzing an algorithm means characterizing how its running time and memory usage scale as input size grows, almost always expressed in Big O notation (covered in depth in the Data Structures lessons). The analysis itself follows a consistent process: identify the dominant operations (comparisons, swaps, recursive calls), count how many times they execute as a function of input size \`n\`, and simplify to the term that dominates as \`n\` grows large.

\`\`\`typescript
function containsDuplicate(arr: number[]): boolean {  // O(n) time, O(n) space
  const seen = new Set<number>();
  for (const num of arr) {           // single loop over n elements
    if (seen.has(num)) return true;  // O(1) average set lookup
    seen.add(num);
  }
  return false;
}
\`\`\`

A complete interview-level analysis names both **time** and **space** complexity explicitly — a solution that's faster but uses significantly more memory (trading O(n²) time for O(n) time at the cost of O(n) extra space, as shown above) is a real, discussable tradeoff, not an unambiguous improvement, and a thorough answer states that tradeoff out loud rather than only celebrating the faster time complexity.

The throughline for this entire lesson track: algorithms aren't memorized recipes for specific problems — they're a small set of recurring *techniques* (search, sort, divide-and-conquer, greedy choice, dynamic programming, backtracking) that combine and adapt to solve a huge range of different-looking problems, and recognizing which technique a new, unfamiliar problem resembles is the actual skill being tested.`,
  },
  {
    title: 'Linear Search and Binary Search',
    content: `**Linear search** checks every element in sequence until it finds a match or exhausts the input — O(n) time, works on any collection regardless of order, and requires no precondition on the data.

\`\`\`typescript
function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}
\`\`\`

**Binary search** requires the input to already be sorted, but in exchange achieves O(log n) by repeatedly halving the search space — compare the target against the middle element, and discard the half that can't possibly contain it, recursing (or iterating) on the remaining half.

\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
\`\`\`

The precondition (sorted input) is the entire tradeoff: if the data isn't already sorted and you only need to search it once, sorting first (O(n log n)) just to binary search it (O(log n)) is strictly worse overall than a single O(n) linear search — binary search only pays off when the data is already sorted, or when you'll search it many times, amortizing the one-time sort cost across many fast searches.

A frequently tested variant in interviews is binary search adapted beyond plain "find this exact value" — finding the leftmost/rightmost occurrence of a value in a sorted array with duplicates, finding the insertion point for a value (\`lowerBound\`/\`upperBound\`), or searching a rotated sorted array — all built on the same halving principle but with a modified condition for which half to discard, which is why deeply understanding the *invariant* binary search maintains (not just memorizing the classic template) is what lets you adapt it correctly to these variants.`,
  },
  {
    title: 'Sorting Algorithms: Bubble, Selection, and Insertion Sort',
    content: `These three are the simplest sorting algorithms, all O(n²) in the average and worst case, all O(1) extra space (sorting in place) — rarely used in production for large datasets, but valuable for building intuition about how sorting algorithms work and for the small-input/educational cases where their simplicity outweighs their poor scaling.

**Bubble sort** repeatedly steps through the array, swapping adjacent elements that are out of order, until a full pass makes no swaps:

\`\`\`typescript
function bubbleSort(arr: number[]): void {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
}
\`\`\`

**Selection sort** repeatedly finds the minimum of the unsorted remainder and swaps it into place at the front:

\`\`\`typescript
function selectionSort(arr: number[]): void {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
}
\`\`\`

**Insertion sort** builds the sorted portion one element at a time, inserting each new element into its correct position among the already-sorted prefix — and is notably efficient (close to O(n)) on **nearly-sorted** input, since few shifts are needed when most elements are already near their correct position, which is the practical reason some hybrid sorting algorithms (covered in the Quicksort lesson) switch to insertion sort for small sub-arrays.

\`\`\`typescript
function insertionSort(arr: number[]): void {
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > current) { arr[j + 1] = arr[j]; j--; }
    arr[j + 1] = current;
  }
}
\`\`\`

The interview-relevant point isn't implementing these from memory under pressure — it's recognizing why O(n log n) algorithms (merge sort, quicksort, covered next) replace these for large inputs, while still knowing insertion sort's specific nearly-sorted-data advantage as a real, non-academic reason it still appears in practice.`,
  },
  {
    title: 'Merge Sort',
    content: `Merge sort is a divide-and-conquer sorting algorithm: split the array in half recursively until each piece has one element (trivially sorted), then merge sorted halves back together in sorted order — repeating the merge step up the recursion until the whole array is reassembled, sorted.

\`\`\`typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}
\`\`\`

Merge sort is O(n log n) in **every** case — best, average, and worst — because the divide step always splits evenly regardless of the input's existing order, and the merge step is always linear in the combined size of the two halves. This consistency (no worst-case degradation, unlike quicksort) is its key selling point, alongside being **stable** (equal elements retain their original relative order, which matters when sorting by one key while wanting to preserve a secondary, already-correct order).

The cost is space: merge sort as shown uses O(n) additional memory for the merge step's temporary arrays, unlike quicksort's typical in-place O(log n) (just recursion stack) space usage. This is the central merge-sort-versus-quicksort tradeoff covered in the next lesson — guaranteed O(n log n) and stability, at the cost of extra memory, versus typically faster in practice with less memory but a worst-case O(n²) risk.`,
  },
  {
    title: 'Quicksort',
    content: `Quicksort is also divide-and-conquer, but instead of always splitting in half, it picks a **pivot** element, partitions the array so everything smaller than the pivot ends up to its left and everything larger ends up to its right, then recursively sorts each side — the pivot itself ends up in its final sorted position after partitioning, needing no further work.

\`\`\`typescript
function quicksort(arr: number[], low = 0, high = arr.length - 1): void {
  if (low >= high) return;

  const pivotIndex = partition(arr, low, high);
  quicksort(arr, low, pivotIndex - 1);
  quicksort(arr, pivotIndex + 1, high);
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) { [arr[i], arr[j]] = [arr[j], arr[i]]; i++; }
  }
  [arr[i], arr[high]] = [arr[high], arr[i]];
  return i;
}
\`\`\`

Average-case time is O(n log n), matching merge sort, and quicksort is typically **faster in practice** despite the same asymptotic complexity, due to better cache locality (operates in place, on contiguous memory, with less overhead than merge sort's temporary array allocations). The catch is the **worst case**, O(n²) — happening when the chosen pivot is consistently the smallest or largest remaining element (already-sorted or reverse-sorted input, paired with a naive "always pick the last element" pivot strategy, is the classic trigger), causing maximally unbalanced partitions at every level.

The standard mitigation is **randomized pivot selection** (or "median of three": sampling the first, middle, and last elements and using their median) — this doesn't eliminate the theoretical worst case, but makes the specific adversarial inputs that trigger it vanishingly unlikely in practice, since the pivot choice no longer depends predictably on the input's existing structure.

The interview-relevant comparison most candidates should be able to give crisply: merge sort guarantees O(n log n) always, is stable, but needs O(n) extra space; quicksort is typically faster with O(log n) space, is not stable, and has an O(n²) worst case mitigated (not eliminated) by randomized pivots — naming this tradeoff explicitly, with the worst-case caveat, is the actual signal interviewers look for over reciting "quicksort is O(n log n)" without qualification.`,
  },
  {
    title: 'Recursion and the Call Stack',
    content: `Recursion solves a problem by expressing it in terms of smaller instances of the same problem, with a **base case** that stops the recursion. Every recursive call pushes a new frame onto the call stack (holding that call's local variables and where to resume after it returns) — which is also why deeply recursive code can throw a stack overflow if the recursion depth exceeds the stack's capacity.

\`\`\`typescript
function factorial(n: number): number {
  if (n <= 1) return 1;       // base case — stops the recursion
  return n * factorial(n - 1); // recursive case — smaller subproblem
}
\`\`\`

\`\`\`text
factorial(4)
  -> 4 * factorial(3)
       -> 3 * factorial(2)
            -> 2 * factorial(1)
                 -> returns 1 (base case)
            <- returns 2 * 1 = 2
       <- returns 3 * 2 = 6
  <- returns 4 * 6 = 24
\`\`\`

Every recursive function needs exactly two things to terminate correctly: a base case that's actually reachable, and a recursive case that's guaranteed to move strictly closer to that base case on every call (a smaller \`n\`, a smaller remaining substring, a smaller remaining subtree) — missing either one produces infinite recursion and an eventual stack overflow.

A common interview follow-up is "what's the space complexity of this recursive solution?" — easy to overlook, since the *call stack itself* uses space proportional to the maximum recursion depth, even if no explicit data structure is allocated in the function body. \`factorial(n)\` above uses O(n) space for the call stack alone, which matters when comparing a recursive solution against an iterative one that achieves the same result in O(1) space with an explicit loop — recursion's readability advantage (often closely mirroring the problem's own recursive definition) comes with this real, frequently-overlooked space cost.`,
  },
  {
    title: 'Two-Pointer Technique',
    content: `The two-pointer technique uses two index variables traversing a sequence (often from opposite ends, or both moving forward at different speeds) to solve problems in a single pass that would otherwise need nested loops — turning many O(n²) brute-force approaches into O(n).

\`\`\`typescript
// Find if a sorted array has two numbers summing to a target — O(n), not O(n²)
function twoSum(sorted: number[], target: number): [number, number] | null {
  let left = 0, right = sorted.length - 1;
  while (left < right) {
    const sum = sorted[left] + sorted[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;  // need a bigger sum, move the smaller pointer up
    else right--;               // need a smaller sum, move the larger pointer down
  }
  return null;
}
\`\`\`

This works specifically because the array is **sorted** — knowing that moving \`left\` forward only increases the sum, and moving \`right\` backward only decreases it, lets each pointer move monotonically in one direction without ever needing to backtrack, which is exactly what keeps the total work O(n) rather than the O(n²) of checking every pair.

A different two-pointer pattern uses both pointers moving in the **same** direction at different speeds — the classic "fast and slow pointer" (or "tortoise and hare") approach for detecting a cycle in a linked list: advance one pointer one step at a time and another two steps at a time; if there's a cycle, the fast pointer eventually laps the slow one and they meet; if there's no cycle, the fast pointer reaches the end first.

The interview-relevant signal for reaching for two pointers: the problem involves a sorted sequence (or one that can be sorted first) and asks about pairs/triplets satisfying some condition, or involves detecting a cycle/finding a midpoint in a linked structure — recognizing this shape before defaulting to a nested-loop brute force is the actual skill, since the two-pointer rewrite is often a small, mechanical change once the pattern is recognized.`,
  },
  {
    title: 'Sliding Window Technique',
    content: `The sliding window technique maintains a contiguous range ("window") over an array or string, expanding and shrinking it incrementally rather than recomputing a result from scratch for every possible window position — turning many O(n²) "check every substring/subarray" brute-force approaches into O(n).

\`\`\`typescript
// Longest substring without repeating characters — O(n), one pass
function longestUniqueSubstring(s: string): number {
  const seen = new Set<string>();
  let left = 0, maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {       // shrink the window from the left
      seen.delete(s[left]);
      left++;
    }
    seen.add(s[right]);                // expand the window to the right
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}
\`\`\`

The key insight that makes this O(n) rather than O(n²): the \`left\` pointer never moves backward — once a character is known to be a duplicate within the current window, shrinking past it (and only past it) is always the correct, minimal adjustment, so the window's boundaries each only ever move forward, for a combined total of O(n) pointer movements across the whole pass rather than recomputing each window independently.

A **fixed-size** variant of the same technique computes a value (sum, max, average) over every window of a constant size \`k\` as it slides across the array, updating the result incrementally (subtract the element leaving the window, add the element entering it) rather than re-summing the entire window at each position — turning an O(n·k) brute force into O(n).

\`\`\`typescript
function maxSumFixedWindow(arr: number[], k: number): number {
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // add new element, remove the one leaving the window
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
\`\`\`

The interview-relevant signal: any problem asking about a "substring," "subarray," or "contiguous range" satisfying some condition is a strong hint to consider sliding window before reaching for nested loops or recomputation from scratch at every position.`,
  },
  {
    title: 'Divide and Conquer',
    content: `Divide and conquer is the general technique behind merge sort, quicksort, and binary search: break a problem into smaller subproblems of the *same* type, solve each independently (often recursively), then combine their results into the solution for the original problem.

\`\`\`text
Divide:  split the problem into smaller, independent subproblems
Conquer: solve each subproblem (recursively, until trivially small)
Combine: merge the subproblems' solutions into the overall answer
\`\`\`

A classic example beyond sorting: finding the maximum subarray sum (the contiguous subarray with the largest sum) can be solved by dividing the array in half, recursively finding the best subarray entirely within the left half and entirely within the right half, then separately checking for the best subarray that *crosses* the midpoint — combining all three candidates for the final answer.

\`\`\`typescript
function maxCrossingSum(arr: number[], low: number, mid: number, high: number): number {
  let leftSum = -Infinity, sum = 0;
  for (let i = mid; i >= low; i--) { sum += arr[i]; leftSum = Math.max(leftSum, sum); }

  let rightSum = -Infinity; sum = 0;
  for (let i = mid + 1; i <= high; i++) { sum += arr[i]; rightSum = Math.max(rightSum, sum); }

  return leftSum + rightSum;
}
\`\`\`

Analyzing divide-and-conquer algorithms' complexity typically uses a **recurrence relation** — merge sort's recurrence is \`T(n) = 2T(n/2) + O(n)\` (two half-sized subproblems, plus O(n) work to combine/merge them), which the Master Theorem resolves to O(n log n); this same recurrence-and-Master-Theorem analysis pattern applies across most divide-and-conquer algorithms, making it worth recognizing even without memorizing the full theorem's formal conditions.

The interview-relevant signal for reaching for divide and conquer: the problem can be meaningfully split into smaller, structurally identical subproblems whose solutions combine cheaply — if combining the subproblems' answers is itself as expensive as solving the original problem directly, divide and conquer doesn't actually help and a different technique is needed.`,
  },
  {
    title: 'Greedy Algorithms',
    content: `A greedy algorithm builds a solution incrementally, at each step making the choice that looks best **right now**, without reconsidering earlier choices — simple and fast (typically O(n) or O(n log n)), but only produces a globally correct answer for problems that have the right mathematical structure (informally, where local optimal choices are guaranteed to lead to a global optimum).

\`\`\`typescript
// Classic correct greedy example: minimum number of coins for a given amount,
// for a coin system where greedy is provably optimal (e.g. standard US denominations)
function minCoins(amount: number, denominations: number[]): number {
  const sorted = [...denominations].sort((a, b) => b - a); // largest first
  let count = 0;
  for (const coin of sorted) {
    count += Math.floor(amount / coin);
    amount %= coin;
  }
  return count;
}
\`\`\`

A classic interval-scheduling example where greedy provably works: given a set of meetings with start/end times, to select the maximum number of non-overlapping meetings, sort by **end time** and greedily pick each meeting that doesn't conflict with the most recently picked one — this greedy choice is provably optimal for this specific problem (a fact requiring its own proof, not something true of greedy choices in general).

\`\`\`typescript
function maxNonOverlapping(intervals: [number, number][]): number {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]); // by end time
  let count = 0, lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) { count++; lastEnd = end; }
  }
  return count;
}
\`\`\`

The interview-relevant warning, and the most important thing to convey about greedy algorithms: they don't always produce the optimal answer — a notorious counterexample is using arbitrary coin denominations (not the standard ones) where greedily picking the largest coin first can produce a suboptimal total coin count, which is exactly the kind of problem that actually requires dynamic programming (covered in the advanced lessons) instead. A complete interview answer doesn't just propose "be greedy here" — it explains *why* the greedy choice is safe for this specific problem (ideally via the exchange-argument intuition: any optimal solution can be transformed into the greedy choice without making it worse), distinguishing genuine insight from a guess that happens to work on the given examples.`,
  },
  {
    title: 'Brute Force and Backtracking',
    content: `Brute force solves a problem by trying every possible option and checking each one — correct by construction, but often exponential or worse, making it valuable mainly as a correctness baseline and a starting point before optimizing, or as the only reasonable approach when the input is small enough that exponential time is actually fine.

**Backtracking** is a refinement of brute force: build a solution incrementally, and as soon as a partial solution is detected to be invalid or unable to lead anywhere useful, abandon it immediately ("prune") and try a different choice — avoiding the wasted work of brute force fully exploring branches that were already doomed.

\`\`\`typescript
// Generate all subsets of an array — backtracking with explicit choose/explore/un-choose
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = [];

  function backtrack(start: number): void {
    result.push([...current]);          // record the current partial solution
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);             // choose
      backtrack(i + 1);                  // explore
      current.pop();                     // un-choose (backtrack)
    }
  }

  backtrack(0);
  return result;
}
\`\`\`

The "choose, explore, un-choose" pattern shown above is the structural template behind nearly every backtracking solution: make a tentative choice, recurse to explore its consequences, then undo that choice before trying the next alternative — the explicit undo step is what distinguishes backtracking from plain recursive brute force, since it lets the same \`current\` array be reused across every branch of the exploration rather than allocating a fresh copy at each step.

The pruning aspect is what makes backtracking meaningfully better than naive brute force in practice, even though both share the same worst-case complexity in the absolute worst case: a Sudoku solver that immediately abandons a branch the moment a placed number violates a row/column/box constraint explores dramatically fewer states than one that fills the entire board before checking validity — the interview-relevant skill is identifying the **earliest possible point** at which a partial solution can be proven invalid, since that's exactly where pruning saves the most wasted exploration.`,
  },
  {
    title: 'Recursion vs Iteration and Tail Calls',
    content: `Any recursive algorithm can, in principle, be rewritten iteratively using an explicit loop and (if needed) an explicit stack to replace what the call stack was doing implicitly — the two approaches are equivalent in what they can compute, but differ in clarity, space usage, and risk of stack overflow on deep recursion.

\`\`\`typescript
// Recursive: clear, mirrors the mathematical definition, O(n) call-stack space
function sumRecursive(n: number): number {
  if (n === 0) return 0;
  return n + sumRecursive(n - 1);
}

// Iterative: O(1) space, no recursion depth limit, slightly less "obviously correct" at a glance
function sumIterative(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}
\`\`\`

A **tail call** is a recursive call that is the very last operation in a function — nothing happens after it returns except passing its result straight back up. Some languages (and some JavaScript engines, in specific strict-mode conditions, though support is inconsistent in practice) perform **tail-call optimization**, reusing the current stack frame for the tail call instead of pushing a new one, effectively turning tail-recursive code into a loop under the hood with O(1) stack space.

\`\`\`typescript
// Tail-recursive form: the recursive call is the LAST thing that happens
function sumTailRecursive(n: number, accumulator = 0): number {
  if (n === 0) return accumulator;
  return sumTailRecursive(n - 1, accumulator + n); // nothing left to do after this call returns
}
\`\`\`

Compare this to \`sumRecursive\` above, which is **not** tail-recursive — \`n + sumRecursive(n - 1)\` still has an addition to perform *after* the recursive call returns, so that frame can't be discarded until the addition happens, which is exactly why it needs O(n) stack space regardless of any tail-call optimization a runtime might support.

The interview-relevant practical point: don't assume tail-call optimization will save a deeply recursive JavaScript/TypeScript solution from a stack overflow — engine support is inconsistent and not something to rely on in production code (most JS engines, including V8/Node, don't implement it despite it being in the ECMAScript spec) — if recursion depth could plausibly reach into the thousands or more on real input, an explicit iterative rewrite (or an explicit stack-based simulation of the recursion) is the safer, more portable choice.`,
  },
  {
    title: 'Time and Space Tradeoffs',
    content: `Many algorithmic improvements aren't free speedups — they trade memory for time (or vice versa), and recognizing and articulating that tradeoff explicitly is a core interview skill, not a side note to mention only if asked.

\`\`\`typescript
// O(n²) time, O(1) space — check every pair
function hasPairSumNaive(arr: number[], target: number): boolean {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) return true;
    }
  }
  return false;
}

// O(n) time, O(n) space — trade memory for speed using a hash set
function hasPairSumFast(arr: number[], target: number): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(target - num)) return true;
    seen.add(num);
  }
  return false;
}
\`\`\`

**Memoization** (caching the results of expensive function calls, keyed by their inputs, so repeated calls with the same input return instantly) is one of the most common manifestations of this tradeoff — directly relevant to the dynamic programming lessons ahead, where the entire technique is built on systematically trading memory (a cache of subproblem results) for an exponential-to-polynomial time improvement.

\`\`\`typescript
function fibMemo(n: number, cache = new Map<number, number>()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!;
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
} // O(n) time with memoization, vs O(2ⁿ) for naive recursive Fibonacci — at the cost of O(n) cache space
\`\`\`

The interview-relevant framing for any "can you make this faster?" follow-up question: the honest answer is rarely "yes, strictly better in every dimension" — it's almost always "yes, by spending more memory" (caching, precomputed lookup structures) or occasionally the reverse ("yes, using less memory, at the cost of more time," e.g. recomputing a value instead of storing it). Naming which resource you're spending to buy the improvement in the other is what separates a complete answer from an incomplete one that only celebrates the speedup without acknowledging what it cost.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'Dynamic Programming: Memoization and Tabulation',
    content: `Dynamic programming (DP) solves a problem by breaking it into overlapping subproblems, solving each subproblem only **once**, and reusing those results — the key distinguishing feature from plain divide-and-conquer, where subproblems are typically independent and never recomputed. DP applies specifically when a problem has **overlapping subproblems** (the same smaller input recurs many times across the naive recursive call tree) and **optimal substructure** (the optimal solution can be built from optimal solutions to its subproblems).

\`\`\`typescript
// Naive recursive Fibonacci: O(2ⁿ) — recomputes the same subproblems exponentially many times
function fibNaive(n: number): number {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}
\`\`\`

**Memoization** (top-down DP) keeps the natural recursive structure but caches each subproblem's result the first time it's computed, returning the cached value on any later repeat call:

\`\`\`typescript
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!;
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
} // O(n) time, O(n) space
\`\`\`

**Tabulation** (bottom-up DP) instead builds a table of subproblem results iteratively, starting from the smallest base cases and working up to the final answer, with no recursion at all:

\`\`\`typescript
function fibTabulation(n: number): number {
  if (n <= 1) return n;
  const table = new Array(n + 1);
  table[0] = 0; table[1] = 1;
  for (let i = 2; i <= n; i++) table[i] = table[i - 1] + table[i - 2];
  return table[n];
} // O(n) time, O(n) space — and can often be reduced to O(1) space here, tracking only the last two values
\`\`\`

The interview-relevant tradeoff between the two styles: memoization is often more natural to write (it directly mirrors the recursive problem definition, and only computes the subproblems actually needed for the specific input) but carries recursion's call-stack overhead and risk of stack overflow on deep inputs; tabulation avoids recursion entirely (no stack overflow risk, often easier to further optimize the space usage, as shown above reducing O(n) to O(1) by only keeping the last two values) but requires figuring out the correct iteration order upfront, and may compute some subproblems that memoization would have skipped.`,
  },
  {
    title: 'Classic DP Problems: Knapsack, LCS, and Edit Distance',
    content: `A handful of canonical dynamic programming problems recur constantly in interviews, each illustrating a distinct DP pattern worth recognizing by shape, not just by name.

**0/1 Knapsack:** given items with weights and values, and a weight capacity, maximize total value without exceeding capacity, where each item is either fully included or excluded (no partial items). The DP table tracks, for each prefix of items and each possible remaining capacity, the best achievable value.

\`\`\`typescript
function knapsack(weights: number[], values: number[], capacity: number): number {
  const dp = Array.from({ length: weights.length + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= weights.length; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // option: exclude item i
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]); // option: include it
      }
    }
  }
  return dp[weights.length][capacity];
}
\`\`\`

**Longest Common Subsequence (LCS):** given two strings, find the length of the longest sequence of characters appearing in both, in the same relative order (not necessarily contiguous). The recurrence: if the current characters match, extend the LCS found so far by one; otherwise, take the best of skipping a character from either string.

\`\`\`typescript
function lcs(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
\`\`\`

**Edit Distance:** the minimum number of insertions, deletions, and substitutions to transform one string into another — solved with the same 2D table shape as LCS, but the recurrence considers all three operations at each step rather than just matching/skipping.

The interview-relevant pattern recognition across all three: each is solved with a table whose dimensions correspond to "prefixes of each input," and the recurrence at each cell expresses the answer for that cell in terms of a small number of already-computed neighboring cells — once you can identify what the table's dimensions and recurrence should be for a new, unfamiliar problem, the rest of the DP solution follows mechanically from that setup.`,
  },
  {
    title: "Dijkstra's Algorithm",
    content: `Dijkstra's algorithm finds the shortest path from a single source node to every other node in a **weighted graph with non-negative edge weights** — repeatedly selecting the closest not-yet-finalized node, finalizing its shortest distance, and relaxing (potentially improving) its neighbors' tentative distances, using a min-heap/priority queue to always pick the next-closest node efficiently.

\`\`\`typescript
function dijkstra(graph: Map<string, [string, number][]>, source: string): Map<string, number> {
  const distances = new Map<string, number>();
  for (const node of graph.keys()) distances.set(node, Infinity);
  distances.set(source, 0);

  const visited = new Set<string>();
  const pq = new MinPriorityQueue<string>(); // priority = current known shortest distance
  pq.enqueue(source, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();
    if (visited.has(current)) continue;
    visited.add(current);

    for (const [neighbor, weight] of graph.get(current) ?? []) {
      const newDist = distances.get(current)! + weight;
      if (newDist < distances.get(neighbor)!) {
        distances.set(neighbor, newDist);
        pq.enqueue(neighbor, newDist);
      }
    }
  }
  return distances;
}
\`\`\`

With a binary heap-backed priority queue, Dijkstra's runs in O((V + E) log V) — each node is dequeued once, and each edge can trigger at most one heap insertion. The **non-negative weight requirement is essential, not incidental**: the algorithm's correctness relies on the fact that once a node is finalized (dequeued), no future relaxation through a longer, not-yet-explored path could possibly produce a shorter distance to it — a negative edge weight breaks this assumption entirely, since a path through a "more expensive" intermediate node could still end up shorter overall via a later negative edge.

The interview-relevant connection to the Data Structures lessons: this is the BFS algorithm's shortest-path idea (covered there for *unweighted* graphs) generalized to weighted graphs by swapping the plain queue for a priority queue ordered by current known distance — recognizing this relationship (BFS is essentially Dijkstra's on a graph where every edge weight is 1) demonstrates the kind of connected understanding interviewers value over memorizing each algorithm in isolation.`,
  },
  {
    title: 'Bellman-Ford and Negative Weights',
    content: `Bellman-Ford solves the same single-source shortest-path problem as Dijkstra's, but correctly handles graphs with **negative edge weights** — at the cost of being slower, O(V·E) instead of Dijkstra's O((V + E) log V).

\`\`\`typescript
function bellmanFord(
  edges: [string, string, number][], // [from, to, weight]
  nodes: string[],
  source: string,
): Map<string, number> | null {
  const distances = new Map<string, number>();
  for (const node of nodes) distances.set(node, Infinity);
  distances.set(source, 0);

  for (let i = 0; i < nodes.length - 1; i++) {       // relax every edge, V-1 times
    for (const [from, to, weight] of edges) {
      if (distances.get(from)! + weight < distances.get(to)!) {
        distances.set(to, distances.get(from)! + weight);
      }
    }
  }

  for (const [from, to, weight] of edges) {           // one more pass detects negative cycles
    if (distances.get(from)! + weight < distances.get(to)!) {
      return null; // a negative-weight cycle exists — no well-defined shortest path
    }
  }
  return distances;
}
\`\`\`

The \`V - 1\` relaxation passes are not an arbitrary tuning constant — they're the proven upper bound on how many edges a shortest path between any two nodes could possibly contain in a graph with \`V\` vertices (a simple path visits each vertex at most once, so at most \`V - 1\` edges), guaranteeing every shortest path has been fully propagated by the time the main loop finishes.

The extra final pass serves a distinct purpose: if any edge can *still* be relaxed after the guaranteed-sufficient number of passes, that's proof a **negative-weight cycle** exists somewhere reachable from the source — a cycle whose total weight is negative means a path could loop through it indefinitely, decreasing total distance every time, making "shortest path" undefined (it approaches negative infinity). Bellman-Ford's ability to *detect* this case (returning that no valid answer exists) rather than silently producing a wrong number is itself a meaningful capability Dijkstra's algorithm doesn't have at all, since it isn't designed to handle negative weights in the first place.

The interview-relevant choice: use Dijkstra's whenever weights are guaranteed non-negative (the common case — most real-world distance/cost graphs), and reach for Bellman-Ford specifically when negative weights are possible (financial arbitrage detection, currency exchange graphs, certain network routing protocols) or when negative-cycle detection itself is the actual goal.`,
  },
  {
    title: "Minimum Spanning Trees: Kruskal's and Prim's",
    content: `A minimum spanning tree (MST) of a connected, weighted, undirected graph is a subset of its edges that connects every vertex, contains no cycles, and has the minimum possible total edge weight — the cheapest way to keep every node connected to every other node (directly or transitively).

**Kruskal's algorithm** sorts all edges by weight and greedily adds each one (cheapest first) as long as it doesn't create a cycle, using Union-Find (covered in the Data Structures lessons) to efficiently check "would adding this edge connect two nodes already in the same connected component?"

\`\`\`typescript
function kruskal(edges: [string, string, number][], nodes: string[]): [string, string, number][] {
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const uf = new UnionFind(nodes); // as covered in the Data Structures lessons
  const mst: [string, string, number][] = [];

  for (const [a, b, weight] of sorted) {
    if (uf.find(a) !== uf.find(b)) {  // adding this edge would NOT create a cycle
      uf.union(a, b);
      mst.push([a, b, weight]);
    }
  }
  return mst;
}
\`\`\`

**Prim's algorithm** instead grows a single tree from an arbitrary starting node, at each step adding the cheapest edge that connects the current tree to any node not yet included — structurally similar to Dijkstra's, using a priority queue to always pick the next-cheapest connecting edge.

The interview-relevant comparison: Kruskal's is typically easier to reason about and implement (sort once, then a single pass with Union-Find) and works well on **sparse** graphs since its cost is dominated by sorting the edge list (O(E log E)); Prim's, implemented with a priority queue, is O(E log V) and tends to be preferred on **dense** graphs where the number of edges is large relative to vertices — both are correct, greedy algorithms whose optimality is provable, but they build the spanning tree in fundamentally different orders (edge-by-globally-cheapest for Kruskal's, versus tree-grows-outward-one-node-at-a-time for Prim's).

A practical real-world framing worth naming in an interview: MST algorithms model the literal problem of laying the cheapest possible network of cables/roads/pipes to connect a set of locations, with no redundant (cycle-creating) connections — a concrete, intuitive use case that makes the abstract graph-theory problem easy to motivate when asked "why would anyone need this?"`,
  },
  {
    title: 'Topological Sorting',
    content: `A topological sort orders the vertices of a **directed acyclic graph (DAG)** such that for every directed edge from \`u\` to \`v\`, \`u\` appears before \`v\` in the ordering — a valid topological order only exists if the graph has no cycles, since a cycle would create a contradictory ordering requirement (each node in the cycle would need to come before the next, looping back on itself).

\`\`\`typescript
// Kahn's algorithm: repeatedly remove nodes with no remaining incoming edges
function topologicalSort(graph: Map<string, string[]>): string[] | null {
  const inDegree = new Map<string, number>();
  for (const node of graph.keys()) inDegree.set(node, 0);
  for (const neighbors of graph.values()) {
    for (const n of neighbors) inDegree.set(n, (inDegree.get(n) ?? 0) + 1);
  }

  const queue = [...inDegree.entries()].filter(([, deg]) => deg === 0).map(([node]) => node);
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }

  return order.length === graph.size ? order : null; // null signals a cycle was detected
}
\`\`\`

Kahn's algorithm (shown above) repeatedly removes nodes whose in-degree (number of incoming edges) has dropped to zero — meaning every prerequisite for that node has already been placed in the order — and is itself a useful **cycle-detection** mechanism: if the final order doesn't include every node, some nodes never reached in-degree zero, which can only happen if they're part of a cycle.

The canonical real-world application, and the most intuitive way to explain why this matters: scheduling tasks with dependencies (a build system compiling files in dependency order, a course catalog's prerequisite chains, a package manager resolving install order) — topological sort is exactly the algorithm that answers "in what order can these tasks run, respecting every dependency constraint?", and detecting a cycle in that same process is exactly how a build system or package manager reports "circular dependency detected" rather than hanging or producing an arbitrary, possibly wrong order.`,
  },
  {
    title: 'Backtracking in Depth: N-Queens and Sudoku',
    content: `Building on the backtracking fundamentals lesson, two canonical problems illustrate the technique at full strength: a search space far too large to brute-force exhaustively in practice, made tractable specifically through aggressive, early pruning.

**N-Queens:** place N queens on an N×N chessboard so that no two attack each other (no shared row, column, or diagonal). Placing queens one row at a time and immediately checking conflicts against already-placed queens — rather than placing all N queens randomly and checking the entire board afterward — prunes invalid branches as early as possible.

\`\`\`typescript
function solveNQueens(n: number): number[][] {
  const solutions: number[][] = [];
  const placement: number[] = []; // placement[row] = column of the queen in that row

  function isValid(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      const c = placement[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) return false; // column or diagonal conflict
    }
    return true;
  }

  function backtrack(row: number): void {
    if (row === n) { solutions.push([...placement]); return; }
    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        placement.push(col);
        backtrack(row + 1);
        placement.pop(); // undo before trying the next column
      }
    }
  }

  backtrack(0);
  return solutions;
}
\`\`\`

**Sudoku** follows the identical structural pattern — try a digit in the next empty cell, check it against that row/column/3x3-box's existing constraints, recurse if valid, undo and try the next digit if the recursion fails to find a solution further down — but the search space (9^81 naive possibilities) makes the constraint-checking-at-each-step pruning even more essential to making the problem solvable in reasonable time at all, rather than just a performance nicety.

The interview-relevant generalization across both problems: backtracking's actual performance in practice (as opposed to its theoretical worst case) depends heavily on **how early** invalid states are detected and pruned — checking validity incrementally as each piece is placed (as shown) prunes vastly more aggressively than placing everything first and validating only the complete arrangement at the end, even though both approaches are "backtracking" in the loose sense and share the same absolute worst-case bound.`,
  },
  {
    title: 'NP-Completeness and P vs NP',
    content: `**P** is the class of problems solvable in polynomial time (an algorithm exists whose running time is bounded by some polynomial function of the input size — O(n), O(n²), O(n³ log n), all qualify; O(2ⁿ) does not). **NP** is the class of problems whose solution, *once given*, can be **verified** in polynomial time, even if no polynomial-time algorithm is known to *find* that solution from scratch.

\`\`\`text
P:         can SOLVE in polynomial time (sorting, shortest path, many DP problems)
NP:        can VERIFY a given solution in polynomial time (even if solving is hard)
P ⊆ NP:    every problem solvable in polynomial time is trivially also verifiable that fast
\`\`\`

A problem is **NP-complete** if it's in NP, and every other problem in NP can be transformed ("reduced") into it in polynomial time — meaning an NP-complete problem is, in a precise sense, at least as hard as *every* problem in NP; a polynomial-time algorithm for any single NP-complete problem would immediately imply a polynomial-time algorithm for all of them. The Boolean satisfiability problem (SAT), the Traveling Salesman Problem (decision version), and graph coloring are classic NP-complete problems.

**P vs NP** asks whether P actually equals NP — whether every problem whose solution can be quickly *verified* can also be quickly *found*. This is one of the most famous open problems in computer science; the strong, widely-held (but unproven) belief is that P ≠ NP, meaning some problems are genuinely harder to solve than to verify.

The interview-relevant practical takeaway, separate from the deep theory: **recognizing** that a problem you're asked to solve is NP-complete (or closely resembles one — the Traveling Salesman Problem, Knapsack's general/unbounded variant, graph coloring, the Hamiltonian path problem) is itself valuable information to surface explicitly — it tells you not to spend interview time hunting for a polynomial-time exact solution that almost certainly doesn't exist, and instead steers the conversation toward approximation algorithms, heuristics, or restricting to special cases of the input where an exact polynomial solution *does* exist (the next lesson covers this directly).`,
  },
  {
    title: 'String Matching Algorithms: KMP and Rabin-Karp',
    content: `Naively searching for a pattern of length \`m\` inside a text of length \`n\` by checking every starting position is O(n·m) in the worst case — both KMP and Rabin-Karp improve on this for genuinely large texts/patterns, using different ideas to avoid redundant comparison work.

**Rabin-Karp** computes a rolling hash of the pattern and of each length-\`m\` window of the text, comparing hashes instead of raw characters at each position — a hash mismatch immediately rules out that position with O(1) work, and the hash only needs full character-by-character verification (to rule out hash collisions, since different substrings can theoretically hash to the same value) on the rare positions where the hashes actually match.

\`\`\`typescript
function rabinKarpSearch(text: string, pattern: string): number[] {
  const matches: number[] = [];
  const m = pattern.length;
  const patternHash = simpleHash(pattern);

  for (let i = 0; i <= text.length - m; i++) {
    const windowHash = simpleHash(text.slice(i, i + m)); // in practice, computed incrementally (rolling)
    if (windowHash === patternHash && text.slice(i, i + m) === pattern) {
      matches.push(i); // verify on hash match to rule out a collision
    }
  }
  return matches;
}
\`\`\`

**KMP (Knuth-Morris-Pratt)** takes a different approach: precompute, for the pattern itself, how much of a partial match can be reused after a mismatch — avoiding the naive approach's wasted re-checking of characters already known to match, by never re-examining a text character that's already been compared, achieving guaranteed O(n + m) regardless of input.

The interview-relevant comparison: Rabin-Karp is conceptually simpler and generalizes naturally to searching for *multiple* patterns simultaneously (compare against a set of pattern hashes instead of one), but its worst-case time can degrade if hash collisions are frequent (mitigated with a well-chosen hash function, but not eliminated in the absolute worst case); KMP guarantees O(n + m) unconditionally, with no collision-dependent risk, at the cost of a less intuitive preprocessing step (the "failure function") that takes more effort to implement correctly from scratch. In practice, most languages' built-in string search (\`.indexOf\`, \`.includes\`) is already well-optimized — these algorithms matter most for understanding *why* naive nested-loop string search is avoidable, and for the rarer cases (custom search over a massive corpus, searching for many patterns at once) where reaching for one of these explicitly actually pays off.`,
  },
  {
    title: 'Bit Manipulation Techniques',
    content: `Working directly with a number's binary representation enables a set of constant-time tricks frequently tested in interviews, both because they're genuinely useful for certain problems and because they test comfort with low-level representation that many candidates haven't exercised recently.

\`\`\`typescript
n & 1                    // check if n is odd (lowest bit is 1)
n & (n - 1)               // clears the lowest set bit — used to count set bits efficiently
n | (1 << k)              // set bit k
n & ~(1 << k)             // clear bit k
n ^ (1 << k)              // toggle bit k
n & -n                    // isolates the lowest set bit (useful in Fenwick trees, covered earlier)
\`\`\`

\`\`\`typescript
function countSetBits(n: number): number {
  let count = 0;
  while (n !== 0) {
    n &= n - 1; // clears the lowest set bit each iteration
    count++;
  }
  return count; // runs in O(number of set bits), not O(total bits) — faster than checking every bit
}
\`\`\`

A frequent interview problem solved elegantly with XOR: "find the single number that appears once in an array where every other number appears exactly twice" — XOR-ing every element together cancels out every pair (since \`x ^ x = 0\` and XOR is commutative/associative), leaving only the unpaired value.

\`\`\`typescript
function findSingleNumber(nums: number[]): number {
  return nums.reduce((acc, n) => acc ^ n, 0);
} // O(n) time, O(1) space — no hash set needed at all
\`\`\`

Bitmasks are also a compact way to represent a **set of boolean flags or a subset of a small, fixed universe** — a single integer's bits each represent membership of one element, enabling set operations (union via \`|\`, intersection via \`&\`, difference via \`& ~\`) at O(1) per operation instead of O(n) for an explicit set data structure, which is why dynamic programming over subsets (common in problems involving a small number of items, like the Traveling Salesman Problem on a modest number of cities) often represents "which items are included" as a single integer bitmask rather than an array or set.

The interview-relevant signal for reaching for bit manipulation: the problem involves a fixed, small number of binary flags or a small universe of items where subset representation matters, or explicitly mentions wanting O(1) extra space where a hash set would otherwise be the obvious (but less space-efficient) choice.`,
  },
  {
    title: 'Randomized Algorithms and Reservoir Sampling',
    content: `A randomized algorithm makes random choices during its execution, and its correctness or performance guarantee is expressed in terms of probability rather than being deterministic — the random pivot choice in quicksort (covered earlier) is a simple example: it doesn't change the algorithm's worst-case behavior in the absolute worst case, but it makes that worst case overwhelmingly unlikely for any specific input.

**Reservoir sampling** solves a deceptively tricky problem: select a uniformly random sample of \`k\` items from a stream of unknown or very large total size, without knowing the total count in advance and without storing the entire stream in memory.

\`\`\`typescript
function reservoirSample<T>(stream: Iterable<T>, k: number): T[] {
  const reservoir: T[] = [];
  let i = 0;

  for (const item of stream) {
    if (i < k) {
      reservoir.push(item); // fill the reservoir with the first k items unconditionally
    } else {
      const j = Math.floor(Math.random() * (i + 1));
      if (j < k) reservoir[j] = item; // replace a random existing element with decreasing probability
    }
    i++;
  }
  return reservoir;
}
\`\`\`

The correctness argument worth being able to sketch: the \`i\`-th item (0-indexed) is included in the final reservoir with probability \`k/(i+1)\` at the moment it's considered, and a careful inductive argument shows every item that has ever streamed through ends up with exactly \`k/n\` probability of being in the final reservoir of size \`k\`, regardless of \`n\` (the eventual total stream length) — achieved with O(k) space and a single pass, never needing to know \`n\` in advance.

This is the standard real-world technique behind sampling a random row from a massive or actively-growing log file/database table without a separate \`COUNT(*)\` pass first, or selecting a uniformly random subset of items from a live, unbounded stream (analytics sampling, A/B test cohort selection from a continuously arriving user stream) — the interview-relevant signal for recognizing this problem shape: "pick a fair random sample from a stream whose total size you don't know ahead of time and can't store entirely" is specifically what reservoir sampling exists to solve, as opposed to the much simpler problem of sampling from an array whose full size is already known.`,
  },
  {
    title: 'Approximation Algorithms and Heuristics',
    content: `For NP-complete problems (covered in an earlier lesson) where no known polynomial-time algorithm finds the exact optimal answer, an **approximation algorithm** instead guarantees a solution provably within some bounded factor of optimal, in polynomial time — trading guaranteed exact optimality for a guaranteed, quantifiable closeness to it, computed efficiently.

A classic example: for the metric Traveling Salesman Problem (distances satisfy the triangle inequality), building a minimum spanning tree and then traversing it via a depth-first walk produces a tour guaranteed to be **at most twice** the length of the true optimal tour — a 2-approximation, computable in polynomial time, versus the exponential time an exact solution would require for large inputs.

\`\`\`text
Exact TSP solution:        guaranteed optimal, but exponential time for large inputs
2-approximation via MST:   guaranteed ≤ 2x optimal, polynomial time
\`\`\`

A **heuristic** is a looser cousin of an approximation algorithm — a strategy that tends to produce good (often near-optimal) results in practice, but with **no formal guarantee** on how close to optimal it actually is in the worst case. The "nearest neighbor" heuristic for TSP (always travel to the closest unvisited city next) is simple and fast, and produces reasonable tours on typical inputs, but has no proven worst-case approximation ratio the way the MST-based approach does — it can perform arbitrarily poorly on adversarially constructed inputs.

\`\`\`text
Approximation algorithm:  proven mathematical bound on how far from optimal it can be
Heuristic:                 no proven bound — "usually works well," validated empirically, not by proof
\`\`\`

The interview-relevant distinction worth stating precisely when this topic comes up: an approximation algorithm comes with a *proof*; a heuristic comes with *empirical evidence and intuition*, but no guarantee. Both are legitimate, valuable tools for problems where exact optimal solutions are computationally infeasible at the scale the problem actually needs to run — and explicitly distinguishing which kind of guarantee (if any) a proposed solution offers, rather than presenting a heuristic as if it were a proven bound, is exactly the kind of precision that separates a strong answer on a hard, "no perfect solution exists" interview question from a hand-wavy one.`,
  },
];

export function seedAlgorithmsLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['algorithms']);
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
