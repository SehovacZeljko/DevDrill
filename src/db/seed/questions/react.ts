import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedReactQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['react']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the virtual DOM and why does React use it?',
      answer: `The virtual DOM is a lightweight in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree and diffs it against the previous one (reconciliation). Only the minimal set of real DOM changes is then applied in a single batch.

**Why this matters:**
- Real DOM operations are expensive — layout reflow and repaint are slow
- Batching updates minimizes browser work
- Enables cross-platform rendering (React Native, React Three Fiber) because rendering is abstracted

\`\`\`jsx
// You write this
function Counter({ count }) {
  return <div className="counter">{count}</div>;
}

// React produces a virtual node like:
{ type: 'div', props: { className: 'counter', children: count } }
// Diffs on state change, patches only what changed in the real DOM
\`\`\`

React 18's concurrent rendering builds on this: it can interrupt, pause, and resume reconciliation work, keeping the UI responsive during heavy updates.`,
      difficulty: 2,
      tags: 'virtual-dom,reconciliation,rendering',
    },
    {
      title: 'What are React hooks and what rules govern their use?',
      answer: `Hooks are functions that let function components use React state and lifecycle features. They were introduced in React 16.8 to replace class components.

**Core hooks:** \`useState\`, \`useEffect\`, \`useContext\`, \`useRef\`, \`useMemo\`, \`useCallback\`, \`useReducer\`.

**The two rules of hooks:**
1. **Only call at the top level** — never inside loops, conditions, or nested functions
2. **Only call from React functions** — function components or custom hooks

\`\`\`jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchResults(query).then(data => {
      setResults(data);
      setLoading(false);
    });
  }, [query]); // re-runs only when query changes

  if (loading) return <Spinner />;
  return <List items={results} />;
}
\`\`\`

These rules exist so React can correctly track hook call order across renders. The ESLint plugin \`eslint-plugin-react-hooks\` enforces them automatically.`,
      difficulty: 1,
      tags: 'hooks,react,rules',
    },
    {
      title: 'When do you choose useReducer over useState?',
      answer: `Use \`useReducer\` when state logic is complex, involves multiple sub-values, or the next state depends on the previous one in non-trivial ways. It mirrors the Redux pattern and makes state transitions explicit and testable.

\`\`\`jsx
const initialState = { status: 'idle', data: null, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':  return { ...state, status: 'loading' };
    case 'FETCH_SUCCESS': return { status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR':  return { status: 'error', error: action.error, data: null };
    default: throw new Error('Unknown action');
  }
}

function DataFetcher() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await fetchData();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', error });
    }
  };
}
\`\`\`

The reducer is a pure function — easy to unit test without React. Prefer \`useState\` for independent, simple values.`,
      difficulty: 2,
      tags: 'useReducer,useState,state-management',
    },
    {
      title: 'How does useEffect work and what are its cleanup semantics?',
      answer: `\`useEffect\` runs after every render by default. The dependency array controls when it re-runs: empty \`[]\` means once on mount, a list of values means re-run when any value changes.

The optional cleanup function returned by the effect runs before the next effect invocation and on unmount — ideal for subscriptions, event listeners, and timers.

\`\`\`jsx
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  return () => controller.abort(); // cleanup: cancel in-flight request

}, [userId]); // re-fetch when userId changes

// Event listener example
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [handleResize]);
\`\`\`

A missing dependency causes stale closures; an overly broad dependency array causes infinite loops. The ESLint \`exhaustive-deps\` rule catches both.`,
      difficulty: 2,
      tags: 'useEffect,lifecycle,cleanup',
    },
    {
      title: 'What is prop drilling and how do you solve it?',
      answer: `Prop drilling is passing data through multiple layers of components that don't use it themselves — they only pass it down to a deeper child. It makes components tightly coupled and harder to refactor.

\`\`\`jsx
// Drilling theme through 3 layers that don't need it
<App theme="dark">
  <Layout theme="dark">
    <Sidebar theme="dark">
      <NavItem theme="dark" /> {/* only this needs it */}
    </Sidebar>
  </Layout>
</App>
\`\`\`

**Solutions:**
1. **React Context** — share data without passing props manually
2. **Component composition** — pass components as \`children\` or render props to skip intermediate layers
3. **State management** (Zustand, Jotai) — for large-scale sharing across distant components

\`\`\`jsx
const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Layout /> {/* Layout doesn't need theme prop */}
    </ThemeContext.Provider>
  );
}

function NavItem() {
  const theme = useContext(ThemeContext); // reads directly
}
\`\`\`

Context is best for "global" data that doesn't change often (theme, locale, auth). Avoid using it as a general state manager — it re-renders all consumers on every change.`,
      difficulty: 2,
      tags: 'prop-drilling,context,composition',
    },
    {
      title: 'What is the purpose of useMemo and useCallback?',
      answer: `Both are performance hooks that memoize (cache) values across renders to avoid unnecessary recomputation.

**\`useMemo\`** caches the result of an expensive calculation:
\`\`\`jsx
const sortedList = useMemo(() => {
  return [...items].sort((a, b) => a.price - b.price);
}, [items]); // recalculates only when items changes
\`\`\`

**\`useCallback\`** caches a function reference (equivalent to \`useMemo(() => fn, deps)\`):
\`\`\`jsx
const handleSubmit = useCallback((event) => {
  event.preventDefault();
  onSubmit(formData);
}, [formData, onSubmit]); // new reference only when deps change
\`\`\`

**When they matter:** A child component wrapped in \`React.memo\` receives a stable function reference via \`useCallback\`, avoiding unnecessary re-renders. Without it, a new function is created every render, breaking memo's referential equality check.

**Don't over-optimize:** both hooks have a cost (memory, diffing). Only add them after profiling shows a real performance problem.`,
      difficulty: 2,
      tags: 'useMemo,useCallback,performance',
    },
    {
      title: 'What are controlled vs uncontrolled components in React?',
      answer: `**Controlled component:** React state is the single source of truth for the input's value. Every keystroke updates state, and the input's value is driven by that state.

\`\`\`jsx
function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}
\`\`\`

**Uncontrolled component:** The DOM manages its own state. You read the value imperatively via a ref.

\`\`\`jsx
function UncontrolledInput() {
  const inputRef = useRef(null);
  const handleSubmit = () => console.log(inputRef.current.value);
  return <input ref={inputRef} defaultValue="initial" />;
}
\`\`\`

**Prefer controlled components** when you need to:
- Validate on every keystroke
- Conditionally disable submit buttons
- Format input on the fly

Use uncontrolled when integrating with non-React code or for simple forms where you only need the value on submit (react-hook-form uses uncontrolled inputs for performance).`,
      difficulty: 1,
      tags: 'controlled,uncontrolled,forms',
    },
    {
      title: 'What is React.memo and when does it help?',
      answer: `\`React.memo\` is a higher-order component that skips re-rendering a component if its props haven't changed (shallow comparison). It's the function component equivalent of \`PureComponent\`.

\`\`\`jsx
const ExpensiveList = React.memo(function ExpensiveList({ items, onSelect }) {
  console.log('rendering list');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onSelect(item)}>{item.name}</li>
      ))}
    </ul>
  );
});

function Parent() {
  const [count, setCount] = useState(0);
  const items = useMemo(() => fetchItems(), []); // stable reference
  const onSelect = useCallback(handleSelect, []);  // stable reference

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+{count}</button>
      <ExpensiveList items={items} onSelect={onSelect} />
    </>
  );
}
\`\`\`

Without \`useCallback\`, \`onSelect\` would be a new function on every render, causing \`React.memo\` to see a changed prop and re-render anyway. Profile before adding \`memo\` — it adds complexity and only helps when re-rendering is the actual bottleneck.`,
      difficulty: 2,
      tags: 'memo,optimization,performance',
    },
    {
      title: 'What are React keys and why are they critical in lists?',
      answer: `Keys are special props that help React identify which items in a list have changed, been added, or removed. Without stable keys, React may re-render or reorder DOM elements incorrectly.

\`\`\`jsx
// Wrong — index as key breaks when list is reordered or filtered
{items.map((item, index) => <Item key={index} data={item} />)}

// Correct — stable, unique identifier
{items.map(item => <Item key={item.id} data={item} />)}
\`\`\`

**Why index keys are dangerous:**
- When items are reordered, React reuses DOM nodes for wrong items
- Component state (like an input's value) gets attached to the wrong item
- Animations and transitions break

Keys must be unique **among siblings** (not globally). A common mistake is using the array index when the list supports deletion or reordering. If the data has no natural ID, generate a stable one when the data is created, not during render (avoid \`Math.random()\` as a key).`,
      difficulty: 1,
      tags: 'keys,lists,reconciliation',
    },
    {
      title: 'What is concurrent rendering in React 18?',
      answer: `Concurrent rendering allows React to prepare multiple versions of the UI simultaneously without blocking the browser. It can interrupt, pause, and resume rendering work, keeping the app responsive during heavy updates.

**Key APIs:**
- **\`startTransition\`** — marks a state update as non-urgent; React can interrupt it if a more urgent update (like a keypress) arrives
- **\`useDeferredValue\`** — defers re-rendering of a slow component until the browser is idle
- **\`useTransition\`** — like \`startTransition\` but exposes a \`isPending\` flag for loading UI

\`\`\`jsx
import { startTransition, useTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleInput(value) {
    setQuery(value); // urgent — update input immediately
    startTransition(() => {
      setResults(heavySearch(value)); // non-urgent — can be interrupted
    });
  }

  return (
    <>
      <input value={query} onChange={e => handleInput(e.target.value)} />
      {isPending ? <Spinner /> : <ResultList results={results} />}
    </>
  );
}
\`\`\`

Concurrent features require React 18 and a concurrent-capable root (\`createRoot\`).`,
      difficulty: 3,
      tags: 'concurrent,react18,transitions',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
