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
    {
      title: 'What is React and what are its main features?',
      answer: `React is an open-source JavaScript library (not a full framework) maintained by Meta for building user interfaces, particularly single-page applications. It focuses exclusively on the view layer.

**Main features:**
- **Component-based architecture** — UIs are built from isolated, reusable components
- **Declarative** — you describe *what* the UI should look like for a given state; React handles DOM updates
- **Virtual DOM** — efficient diffing minimizes real DOM operations
- **Unidirectional data flow** — props flow down, events flow up; makes data tracing predictable
- **Hooks** — enable functional components to use state and lifecycle features
- **React Server Components** (v19) — server-rendered components with zero client bundle contribution

\`\`\`jsx
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>; // declarative JSX
}
\`\`\`

React is intentionally "unopinionated" about routing, state, and fetching — the ecosystem fills those gaps (React Router, TanStack Query, Zustand, Redux).`,
      difficulty: 1,
      tags: 'fundamentals,components,library',
    },
    {
      title: 'What is JSX and how does it compile to React.createElement?',
      answer: `JSX (JavaScript XML) is a syntax extension that lets you write HTML-like markup inside JavaScript. It is **not HTML** — it compiles to \`React.createElement()\` calls via Babel or the React Compiler.

\`\`\`jsx
// JSX
const element = (
  <button className="primary" onClick={handleClick}>
    Submit
  </button>
);

// Compiled output (React 17+ automatic runtime avoids the import)
const element = React.createElement(
  'button',
  { className: 'primary', onClick: handleClick },
  'Submit'
);
\`\`\`

**Key JSX rules:**
- Must return a single root element (or \`<Fragment>\`)
- Attributes use camelCase (\`className\`, \`onClick\`, \`htmlFor\`)
- JS expressions go inside \`{}\`
- Self-closing tags must close: \`<img />\`
- \`class\` → \`className\`, \`for\` → \`htmlFor\`

Since React 17, you no longer need \`import React from 'react'\` in every JSX file — the new JSX transform injects the runtime automatically.`,
      difficulty: 1,
      tags: 'jsx,syntax,fundamentals,compilation',
    },
    {
      title: 'What are props in React and how do they differ from state?',
      answer: `**Props** (short for properties) are read-only inputs passed from a parent to a child component. **State** is mutable data managed *inside* a component. The key distinction: props are controlled from outside, state is controlled from inside.

\`\`\`jsx
// Props — parent controls the data
function Avatar({ name, imageUrl, size = 48 }) { // size has a default
  return <img src={imageUrl} alt={name} width={size} />;
}
<Avatar name="Alice" imageUrl="/alice.jpg" />

// State — component controls its own data
function Toggle() {
  const [isOn, setIsOn] = useState(false); // internal state
  return (
    <button onClick={() => setIsOn(prev => !prev)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
\`\`\`

**Rules:**
- Never mutate props (\`props.name = 'Bob'\` is forbidden)
- State changes trigger a re-render; prop changes also re-render if the parent re-renders
- If a child needs to update parent data, pass a callback prop (lifting state up)`,
      difficulty: 1,
      tags: 'props,state,fundamentals,communication',
    },
    {
      title: 'What is useState and when should you avoid it?',
      answer: `\`useState(initialValue)\` declares a state variable for a functional component. It returns a tuple of \`[value, setter]\`. Each setter call queues a re-render.

\`\`\`jsx
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);

// Functional update — safe when next state depends on previous
setCount(prev => prev + 1);

// Lazy initializer — expensive initial state computed once
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('cache') ?? 'null'));
\`\`\`

**Avoid useState when:**
- The value doesn't affect rendering (use \`useRef\` instead)
- Values can be derived from existing state or props (compute inline)
- Multiple related values change together (consider \`useReducer\`)
- The state needs to persist across route changes (use URL params or external store)

Excessive \`useState\` leads to multiple synchronous re-renders and stale closure bugs. Group related state and derive computed values.`,
      difficulty: 1,
      tags: 'hooks,state,usestate,functional-components',
    },
    {
      title: 'What are the differences between functional and class components?',
      answer: `**Functional components** are plain JavaScript functions returning JSX. They use hooks for state and lifecycle. **Class components** extend \`React.Component\` and manage state via \`this.state\`.

\`\`\`jsx
// Functional (modern — preferred)
function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);
  useEffect(() => { document.title = count; }, [count]);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Class (legacy)
class Counter extends React.Component {
  state = { count: this.props.initial ?? 0 };
  componentDidUpdate() { document.title = this.state.count; }
  render() {
    return (
      <button onClick={() => this.setState(s => ({ count: s.count + 1 }))}>
        {this.state.count}
      </button>
    );
  }
}
\`\`\`

**Why functional components won:**
- Less boilerplate (no \`this\`, no constructor)
- Hooks enable logic reuse without HOCs or render props
- Easier to test and reason about
- The React team's focus for new features (Hooks, Server Components) is functional-first`,
      difficulty: 2,
      tags: 'components,classes,hooks,migration,fundamentals',
    },
    {
      title: 'What is React Fiber?',
      answer: `React Fiber is the complete rewrite of React's reconciliation engine, introduced in React 16. It replaces the old stack-based algorithm with a linked-list tree of "fiber" nodes that can be paused, prioritized, reused, and discarded.

**Core capabilities Fiber unlocks:**
- **Incremental rendering** — split rendering work into chunks and spread it over multiple frames
- **Prioritization** — high-priority updates (user input) can interrupt low-priority ones (data fetching)
- **Concurrency** — the foundation of React 18's concurrent features (\`startTransition\`, \`Suspense\`)
- **Error boundaries** — per-subtree error catching

\`\`\`
A fiber = a unit of work, one per React element
  {
    type, key, stateNode,
    return (parent), child, sibling,
    pendingProps, memoizedProps, memoizedState,
    effectTag (Insert / Update / Delete),
    lanes (priority)
  }
\`\`\`

The work loop processes fibers in a double-buffering model: it builds the "work-in-progress" tree and swaps it to "current" atomically on commit. The commit phase (DOM mutations) is synchronous and cannot be interrupted.`,
      difficulty: 3,
      tags: 'fiber,internals,performance,architecture,reconciliation',
    },
    {
      title: 'What is reconciliation and React\'s diffing algorithm?',
      answer: `**Reconciliation** is the process React uses to determine what has changed between renders and apply the minimal set of DOM updates. React's diffing uses two heuristics to bring complexity from O(n³) to O(n):

1. **Elements of different types** produce entirely different trees (the old tree is destroyed)
2. **\`key\` prop** identifies stable elements across renders (lists)

\`\`\`jsx
// Type change — React unmounts Counter, mounts SearchInput fresh
{isSearch ? <SearchInput /> : <Counter />}

// Keyed list — React moves/reuses by key, not position
{users.map(u => <UserRow key={u.id} user={u} />)}

// Without keys — React matches by position, may corrupt state
{users.map((u, i) => <UserRow key={i} user={u} />)} // risky
\`\`\`

React diffs **same-level elements** only. The algorithm never compares nodes from different tree levels. For components with the same type and key, React updates props and re-renders. For DOM elements with the same type, React updates only changed attributes.`,
      difficulty: 2,
      tags: 'virtual-dom,reconciliation,algorithm,diffing',
    },
    {
      title: 'What is the difference between Shadow DOM and Virtual DOM?',
      answer: `They solve different problems and are unrelated technologies.

**Shadow DOM** is a browser-native API that creates an isolated DOM subtree. CSS and JavaScript from the main document cannot accidentally reach into a shadow root. Used by web components for true style encapsulation.

**Virtual DOM** is a React-specific JavaScript object tree representing the desired UI state. React compares (diffs) virtual trees to determine what DOM changes are needed, then applies them in batch.

\`\`\`js
// Shadow DOM — browser API, real encapsulation
const shadow = element.attachShadow({ mode: 'open' });
shadow.innerHTML = '<style>p { color: red; }</style><p>Isolated</p>';
// Styles in shadow root don't leak to main document

// Virtual DOM — React's JS object, not browser API
const vNode = { type: 'p', props: { children: 'Hello' } };
// React diffs vNodes, then patches the real DOM
\`\`\`

React does not use Shadow DOM (though React components can contain shadow roots if needed). Shadow DOM provides actual browser-enforced isolation; Virtual DOM provides a performance abstraction.`,
      difficulty: 2,
      tags: 'dom,shadow-dom,virtual-dom,web-standards',
    },
    {
      title: 'What are Pure Components and React.PureComponent?',
      answer: `A **Pure Component** skips re-rendering when props and state have not changed (shallow equality check). \`React.PureComponent\` is the class component equivalent of wrapping a functional component with \`React.memo\`.

\`\`\`jsx
// Class-based Pure Component
class ProductRow extends React.PureComponent {
  render() {
    return <li>{this.props.product.name}</li>;
  }
}
// re-renders only if this.props.product reference changes

// Functional equivalent
const ProductRow = React.memo(function ProductRow({ product }) {
  return <li>{product.name}</li>;
});

// Custom comparator
const ProductRow = React.memo(
  ({ product }) => <li>{product.name}</li>,
  (prev, next) => prev.product.id === next.product.id, // custom comparison
);
\`\`\`

**Shallow comparison** means it checks object references, not deep equality. A new object with the same values (\`{id: 1}\` vs a different \`{id: 1}\`) will still trigger a re-render. Use immutable data patterns to maximize effectiveness.`,
      difficulty: 2,
      tags: 'performance,optimization,purecomponent,memo,shallow-comparison',
    },
    {
      title: 'What is React.Fragment and why is it useful?',
      answer: `\`React.Fragment\` (or shorthand \`<></>\`) lets you return multiple elements from a component without adding an extra DOM node. React requires a single root element per render, but Fragments fulfill that requirement without polluting the HTML.

\`\`\`jsx
// Without Fragment — extra unnecessary div in DOM
function TableRow({ user }) {
  return (
    <div> {/* renders as invalid HTML — div inside tbody */}
      <td>{user.name}</td>
      <td>{user.email}</td>
    </div>
  );
}

// With Fragment — clean semantic HTML
function TableRow({ user }) {
  return (
    <>
      <td>{user.name}</td>
      <td>{user.email}</td>
    </>
  );
}

// Long-form needed when key is required (list of fragments)
items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </React.Fragment>
))
\`\`\`

The \`<></>\` shorthand cannot accept a \`key\` prop. Use \`<React.Fragment key={id}>\` when iterating.`,
      difficulty: 1,
      tags: 'jsx,fragment,best-practices,dom',
    },
    {
      title: 'What are Error Boundaries and how do you create one?',
      answer: `An Error Boundary is a class component that catches JavaScript errors in its child tree during rendering, in lifecycle methods, and in constructors. It displays a fallback UI instead of crashing the whole app.

\`\`\`jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to error reporting service
    logError(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
\`\`\`

**Cannot catch:** errors inside event handlers (use try/catch), async errors, and errors in the boundary itself. React 19 adds support for the \`react-error-boundary\` package which wraps this pattern with hooks.`,
      difficulty: 2,
      tags: 'error-handling,lifecycle,class-components,boundaries',
    },
    {
      title: 'What are React Portals and what are they used for?',
      answer: `A Portal renders children into a DOM node **outside the parent component's DOM hierarchy**, while keeping the React component tree intact. Events still bubble up through the React tree normally.

\`\`\`jsx
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root'), // target DOM node outside app root
  );
}
\`\`\`

**Use cases:** Modals and dialogs, tooltips, dropdown menus, notifications — any overlay that needs to escape CSS overflow:hidden or z-index stacking context of its parent.

Even though the portal renders in a different DOM position, \`onClick\` events still bubble up through the React component hierarchy (not the DOM hierarchy), so event delegation works as expected.`,
      difficulty: 2,
      tags: 'portals,dom,modal,event-bubbling',
    },
    {
      title: 'How does code-splitting work with React.lazy and Suspense?',
      answer: `\`React.lazy()\` lets you load a component lazily via dynamic \`import()\`. Bundlers (Webpack, Vite) create a separate chunk for the lazy component. \`Suspense\` shows a fallback while the chunk is loading.

\`\`\`jsx
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const UserProfile    = lazy(() => import('./UserProfile'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

**When the user navigates to /admin:**
1. React renders the \`Suspense\` fallback immediately
2. The \`admin-dashboard.[hash].js\` chunk downloads
3. React swaps in \`<AdminDashboard />\` when ready

Nest \`Suspense\` boundaries closer to lazy components for more granular loading UI. Avoid wrapping the entire app in a single Suspense — it causes a full-page spinner.`,
      difficulty: 2,
      tags: 'code-splitting,lazy,suspense,performance,bundling',
    },
    {
      title: 'What is forwardRef and when do you need it?',
      answer: `By default, a \`ref\` attached to a custom component only gives you the component instance (or nothing for function components). \`forwardRef\` lets you **pass a ref through a component to a DOM element inside it**.

\`\`\`jsx
const FancyInput = React.forwardRef(function FancyInput(props, ref) {
  return (
    <div className="fancy-input-wrapper">
      <input ref={ref} {...props} />
    </div>
  );
});

// Parent can now focus the underlying input
function Form() {
  const inputRef = useRef(null);
  return (
    <>
      <FancyInput ref={inputRef} placeholder="Name" />
      <button onClick={() => inputRef.current?.focus()}>
        Focus input
      </button>
    </>
  );
}
\`\`\`

**When you need it:** design system components exposing imperative DOM access (input focus/selection, scrolling), animation libraries, and accessibility tooling. In React 19, \`ref\` is a regular prop and \`forwardRef\` is no longer needed.`,
      difficulty: 2,
      tags: 'forwardref,ref,hooks,dom,accessibility',
    },
    {
      title: 'When and how should you write a custom hook?',
      answer: `Write a custom hook when you want to **extract and reuse stateful logic** across multiple components. A custom hook is just a function whose name starts with \`use\` that calls other hooks.

\`\`\`jsx
// Custom hook: encapsulates window resize listener
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// Consumer — no duplication of listener logic
function ResponsiveChart() {
  const { width } = useWindowSize();
  return <Chart columns={width > 768 ? 4 : 1} />;
}
\`\`\`

**Good candidates for custom hooks:** data fetching (\`useUser(id)\`), form handling (\`useForm()\`), local storage sync (\`useLocalStorage(key)\`), debounced values, media queries. Each hook should do one thing well and hide implementation details.`,
      difficulty: 2,
      tags: 'custom-hooks,reusability,separation-of-concerns,hooks',
    },
    {
      title: 'What is useRef beyond storing DOM refs?',
      answer: `\`useRef\` returns a mutable container (\`{ current: value }\`) that **persists across renders** and whose changes **do not trigger a re-render**. DOM refs are just one use case.

\`\`\`jsx
// Use 1: Hold the previous value without re-rendering
function Counter() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(count);
  useEffect(() => { prevCountRef.current = count; }); // after every render
  return <p>{prevCountRef.current} → {count}</p>;
}

// Use 2: Store a timer/interval ID
function Poller() {
  const intervalRef = useRef(null);
  const start = () => {
    intervalRef.current = setInterval(poll, 1000);
  };
  const stop = () => clearInterval(intervalRef.current);
}

// Use 3: Track mounted status (avoid setState after unmount)
function AsyncComponent() {
  const isMounted = useRef(true);
  useEffect(() => () => { isMounted.current = false; }, []);
  // ...then check isMounted.current before calling setState
}
\`\`\`

The rule: if a value change should cause a render → \`useState\`. If a value should survive renders but change silently → \`useRef\`.`,
      difficulty: 2,
      tags: 'useref,hooks,mutable,dom,side-effects',
    },
    {
      title: 'What is useLayoutEffect and how does it differ from useEffect?',
      answer: `Both accept the same signature, but they fire at different times in the rendering pipeline.

- **\`useEffect\`** fires **asynchronously after** the browser has painted — safe for most side effects (data fetching, subscriptions, logging)
- **\`useLayoutEffect\`** fires **synchronously after DOM mutations but before** the browser paints — safe for reading and immediately adjusting layout

\`\`\`jsx
// useLayoutEffect: measure DOM before paint to avoid flash of wrong layout
function Tooltip({ children, position }) {
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    const rect = tooltipRef.current.getBoundingClientRect();
    // Adjust tooltip position if it overflows the viewport
    // This happens synchronously — user never sees the wrong position
    if (rect.right > window.innerWidth) {
      tooltipRef.current.style.left = '-100px';
    }
  });

  return <div ref={tooltipRef}>{children}</div>;
}
\`\`\`

**Rule:** Use \`useEffect\` by default. Use \`useLayoutEffect\` only when you need to measure or mutate the DOM synchronously before the browser repaints (tooltips, animations, scroll restoration). \`useLayoutEffect\` causes a visible render delay and throws a warning during SSR.`,
      difficulty: 2,
      tags: 'uselayouteffect,useeffect,dom,paint,timing',
    },
    {
      title: 'What does React.StrictMode do?',
      answer: `\`React.StrictMode\` is a development-only wrapper that helps you find bugs by deliberately running certain behaviors **twice** and emitting extra warnings.

**What it enables in development:**
1. **Double-invokes** render functions, reducers, component bodies, and state initializers to expose impure code
2. Warns about **legacy API usage** (\`findDOMNode\`, legacy lifecycle methods)
3. Detects **unexpected side effects** — if a component is broken by rendering twice, it had impure render logic
4. In React 18+, also double-fires \`useEffect\` cleanup + setup once on mount to verify cleanup correctness

\`\`\`jsx
// In index.tsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
\`\`\`

**It does NOT affect production** — all extra checks and double-invocations are stripped. If your component breaks under StrictMode, it will likely break in production too under concurrent rendering. Fix the root cause rather than removing StrictMode.`,
      difficulty: 1,
      tags: 'strict-mode,development,debugging,purity,best-practices',
    },
    {
      title: 'What is useActionState in React 19?',
      answer: `\`useActionState\` (React 19) simplifies the pattern of managing loading/error/result state for form actions. It replaces the common \`[status, setStatus]\` + manual try/catch pattern when using React 19 form actions.

\`\`\`jsx
import { useActionState } from 'react';

async function submitForm(prevState, formData) {
  // Called on form submit with the previous state and new FormData
  try {
    await saveUser(formData.get('name'));
    return { success: true, error: null };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function SignupForm() {
  const [state, formAction, isPending] = useActionState(submitForm, {
    success: false,
    error: null,
  });

  return (
    <form action={formAction}>
      <input name="name" disabled={isPending} />
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p>Saved!</p>}
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
\`\`\``,
      difficulty: 3,
      tags: 'react19,useactionstate,forms,actions,async',
    },
    {
      title: 'What is the React Compiler and what problem does it solve?',
      answer: `The React Compiler (previously "React Forget") is an automatic memoization compiler that analyzes React components and hooks, then inserts \`useMemo\` and \`useCallback\` calls where needed — **without any manual annotations**.

**Problem it solves:** Developers must manually decide when to memoize, leading to either over-memoization (unnecessary complexity) or under-memoization (performance issues). Both require deep knowledge of React's re-render rules.

\`\`\`jsx
// Before compiler — manual optimization
const sortedItems = useMemo(() => [...items].sort(), [items]);
const handleClick = useCallback(() => select(item.id), [item.id]);

// After compiler — write naturally, compiler adds memoization
// The following is automatically optimized:
const sortedItems = [...items].sort();
const handleClick = () => select(item.id);
\`\`\`

The compiler is opt-in in React 19 (enabled via Babel plugin or Next.js 15 config). It requires strict adherence to React's rules (no direct state mutation) — if a component violates rules, the compiler skips it rather than generating incorrect code. This is the primary motivation for React's rules of hooks and purity requirements.`,
      difficulty: 3,
      tags: 'react19,compiler,memoization,optimization,performance',
    },
    {
      title: 'What are React Server Components?',
      answer: `React Server Components (RSC) are components that **render exclusively on the server** and send serialized output (not JavaScript) to the client. They can directly access databases, file systems, and environment variables without any API layer.

\`\`\`jsx
// ServerComponent.tsx — no 'use client' directive = server component
import { db } from '@/lib/db'; // direct DB access — impossible in client JS

async function ProductList() {
  const products = await db.select().from(productsTable).all(); // direct DB query
  return (
    <ul>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}
\`\`\`

**Key properties:**
- Zero client-side JavaScript for the component itself
- Can \`await\` data directly (no \`useEffect\` + fetch)
- Cannot use state, effects, or browser APIs
- Can compose Client Components as children

**Benefits:** Smaller bundles, faster initial load, direct data access. Currently available through Next.js 13+, Remix, and frameworks adopting the RSC spec.`,
      difficulty: 3,
      tags: 'react19,server-components,architecture,ssr,bundling',
    },
    {
      title: 'What is the difference between Server Components and Client Components?',
      answer: `The distinction is marked by the \`"use client"\` directive at the top of a file. Without it, components default to Server Components.

| | **Server Component** | **Client Component** |
|---|---|---|
| Rendering | Server only | Client (hydrated) |
| Bundle | No JS sent | JS included in bundle |
| State/Hooks | None | Full hooks API |
| Browser APIs | None | Available |
| Data access | Direct (DB, FS) | Via API/fetch |

\`\`\`jsx
// ServerComponent.tsx — fetches data, no interactivity
async function UserProfile({ userId }) {
  const user = await fetchUser(userId); // server-side
  return <ProfileCard user={user} onFollow={...} />;
}

// ProfileCard.tsx
'use client'; // marks as Client Component
function ProfileCard({ user, onFollow }) {
  const [following, setFollowing] = useState(false); // state works here
  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => { setFollowing(true); onFollow(); }}>
        Follow
      </button>
    </div>
  );
}
\`\`\`

Server Components can import and render Client Components, but **not vice versa** (a Client Component cannot import a Server Component).`,
      difficulty: 3,
      tags: 'react19,server-components,client-components,architecture',
    },
    {
      title: 'What is useOptimistic in React 19?',
      answer: `\`useOptimistic\` allows you to show an **optimistic (predicted) state** immediately while an async action is in progress, then seamlessly reconcile with the server result. This creates the perception of instant UI updates.

\`\`\`jsx
import { useOptimistic, useTransition } from 'react';

function LikeButton({ postId, likeCount }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likeCount,
    (currentCount, delta) => currentCount + delta,
  );

  const [, startTransition] = useTransition();

  function handleLike() {
    startTransition(async () => {
      addOptimisticLike(1); // show +1 immediately
      await likePost(postId); // actual server call
      // if server call fails, optimisticLikes reverts to likeCount
    });
  }

  return (
    <button onClick={handleLike}>❤️ {optimisticLikes}</button>
  );
}
\`\`\`

If the async action throws, React **automatically reverts** the optimistic state to the last confirmed value. This eliminates the error-prone pattern of manually rolling back optimistic updates.`,
      difficulty: 3,
      tags: 'react19,useoptimistic,hooks,ux,optimistic-ui',
    },
    {
      title: 'What is the use hook and how does it differ from useEffect + fetch?',
      answer: `\`use(promise)\` (React 19) suspends a component while a Promise resolves, unwrapping the value. Unlike \`useEffect\`, it integrates with \`Suspense\` and can be called **conditionally** (it is not subject to the rules of hooks).

\`\`\`jsx
import { use, Suspense } from 'react';

// Pass a promise as a prop (created outside the component, or via cache)
function UserProfile({ userPromise }) {
  const user = use(userPromise); // suspends until resolved
  return <h1>{user.name}</h1>;
}

function App() {
  const userPromise = fetchUser(1); // created here, passed down
  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
\`\`\`

**vs \`useEffect\` + fetch:** \`useEffect\` fetches after mount, causing a loading flash. \`use()\` integrates with Suspense for a waterfall-free experience. It also works with \`useContext\` — \`use(MyContext)\` is equivalent to \`useContext(MyContext)\` but can be called conditionally.`,
      difficulty: 3,
      tags: 'react19,use-hook,async,suspense,data-fetching',
    },
    {
      title: 'What is the difference between useTransition and useDeferredValue?',
      answer: `Both are React 18 concurrent features for keeping the UI responsive during expensive updates, but they operate at different layers.

**\`useTransition\`** wraps a **state update** as non-urgent. You control which update can be interrupted. Returns \`[isPending, startTransition]\`.

**\`useDeferredValue\`** wraps a **value** (usually a prop you don't control) that can lag behind. It returns a "deferred" copy that updates only when the browser is idle.

\`\`\`jsx
// useTransition — you own the state setter
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function onInput(val) {
    setQuery(val); // urgent
    startTransition(() => setResults(heavySearch(val))); // deferred
  }
  return <>{isPending && <Spinner />}<ResultList results={results} /></>;
}

// useDeferredValue — value comes from props/parent
function ResultList({ query }) {
  const deferredQuery = useDeferredValue(query); // lags behind when needed
  const results = heavySearch(deferredQuery);    // stale results during typing
  return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
\`\`\``,
      difficulty: 3,
      tags: 'react18,react19,concurrency,transitions,deferred,performance',
    },
    {
      title: 'How does the new <form action> prop work in React 19?',
      answer: `React 19 allows passing an **async function** to a form's \`action\` prop. React handles form submission, passes the \`FormData\` object to the function, and manages the pending/error state automatically via \`useFormStatus\`.

\`\`\`jsx
'use client';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;
}

async function saveProfile(formData) {
  'use server'; // marks as a Server Action
  const name = formData.get('name');
  await db.users.update({ name });
}

function ProfileForm({ user }) {
  return (
    <form action={saveProfile}>
      <input name="name" defaultValue={user.name} />
      <SubmitButton />
    </form>
  );
}
\`\`\`

**Server Actions** (marked \`'use server'\`) can be used as form \`action\` props. React serializes the FormData, sends it to the server, runs the function server-side, then re-renders with the result. No explicit API route needed.`,
      difficulty: 2,
      tags: 'react19,forms,server-actions,formdata,api',
    },
    {
      title: 'What is React hydration?',
      answer: `**Hydration** is the process of attaching React's event listeners and state to server-rendered HTML. The server sends static HTML for fast initial paint; then React "hydrates" it by matching the virtual DOM to the existing HTML and wiring up interactivity.

\`\`\`jsx
// Server: renders HTML string
const htmlString = ReactDOMServer.renderToString(<App />);
// Sends: <div id="root"><button>0</button></div>

// Client: hydrates existing HTML instead of creating new DOM
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
// React finds the <button>, attaches the click handler — no DOM replaced
\`\`\`

**Hydration mismatch:** If the server-rendered HTML doesn't match what client React renders (different data, conditional rendering based on \`window\`), React logs a warning and falls back to client-side rendering of the mismatched subtree.

React 18 introduced **selective hydration** — parts of the page can hydrate independently and user interactions on partially hydrated trees are queued and replayed.`,
      difficulty: 2,
      tags: 'ssr,hydration,server-rendering,react-dom,performance',
    },
    {
      title: 'What are Higher Order Components (HOCs)?',
      answer: `An HOC is a function that **takes a component and returns a new component** with additional behavior injected. It's a composition pattern for cross-cutting concerns.

\`\`\`jsx
// withAuth HOC — wraps any component with auth check
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <WrappedComponent {...props} currentUser={user} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);

// Another HOC: withLogging
function withLogging(WrappedComponent) {
  return function LoggedComponent(props) {
    useEffect(() => {
      console.log(\`Mounting: \${WrappedComponent.displayName}\`);
    }, []);
    return <WrappedComponent {...props} />;
  };
}

// Composition
const ProtectedLoggedDashboard = withLogging(withAuth(Dashboard));
\`\`\`

HOCs were the primary code-sharing pattern before hooks. They have drawbacks: prop name collisions, wrapper hell in DevTools, and opaque component trees. **Custom hooks are now preferred** for logic reuse.`,
      difficulty: 3,
      tags: 'patterns,hoc,reusability,composition,legacy',
    },
    {
      title: 'What are Render Props?',
      answer: `The render prop pattern passes a function as a prop that a component calls to produce JSX, letting the parent control what gets rendered while the component provides the logic/state.

\`\`\`jsx
// Mouse tracker using render prop
function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>
      {render(pos)} {/* consumer decides how to display */}
    </div>
  );
}

// Usage 1: show coordinates
<MouseTracker render={({ x, y }) => <p>({x}, {y})</p>} />

// Usage 2: move an image
<MouseTracker render={({ x, y }) => (
  <img src="/cursor.png" style={{ left: x, top: y, position: 'absolute' }} />
)} />

// Children as function (same pattern)
<MouseTracker>
  {({ x, y }) => <span>{x},{y}</span>}
</MouseTracker>
\`\`\`

Like HOCs, render props predated hooks for logic sharing. **Custom hooks** now handle most of these cases more cleanly, but render props are still valid for inversion of control in libraries.`,
      difficulty: 2,
      tags: 'patterns,render-props,composition,reusability',
    },
    {
      title: 'What is the presentational vs container component pattern?',
      answer: `This pattern separates **how things look** (presentational) from **how things work** (container). Presentational components receive all data via props and are pure UI; container components fetch data, hold state, and pass it down.

\`\`\`jsx
// Presentational — dumb, reusable, testable in isolation
function UserCard({ name, avatar, role, onFollow }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} />
      <h3>{name} <span>{role}</span></h3>
      <button onClick={onFollow}>Follow</button>
    </div>
  );
}

// Container — knows about data and behavior
function UserCardContainer({ userId }) {
  const [user, setUser] = useState(null);
  const follow = () => api.follow(userId);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return null;
  return <UserCard {...user} onFollow={follow} />;
}
\`\`\`

With hooks, the pattern is less strict — a custom hook (\`useUser(id)\`) replaces the container, keeping the file structure flat. Dan Abramov (pattern's author) has noted it's less important now, but the **separation of logic from UI** remains a good principle.`,
      difficulty: 2,
      tags: 'patterns,architecture,presentational,container,separation-of-concerns',
    },
    {
      title: 'What is the composition pattern in React?',
      answer: `React composition uses \`children\` and slot-like props to build flexible, generic components without tight coupling. Instead of configuring via dozens of props or subclassing, you pass JSX as children.

\`\`\`jsx
// Generic Card component — doesn't know what it contains
function Card({ header, children, footer }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Consumers compose into what they need
function ProductCard({ product }) {
  return (
    <Card
      header={<img src={product.image} alt={product.name} />}
      footer={<PriceTag price={product.price} />}
    >
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </Card>
  );
}
\`\`\`

This is the React way to avoid the "inheritance for code reuse" anti-pattern. The \`children\` prop is just JSX passed between opening and closing tags. Named slot props (\`header\`, \`footer\`) provide explicit layout regions.`,
      difficulty: 1,
      tags: 'patterns,composition,children,components,design',
    },
    {
      title: 'What is lifting state up and when is it necessary?',
      answer: `"Lifting state up" means moving state from a child component to the **closest common ancestor** so multiple siblings can share it. It's necessary when two components need to stay in sync.

\`\`\`jsx
// Problem: sibling components both need the same temperature value
function App() {
  const [celsius, setCelsius] = useState('');

  // State lives here — both siblings read from it
  return (
    <>
      <CelsiusInput
        value={celsius}
        onChange={setCelsius}
      />
      <FahrenheitInput
        value={celsius === '' ? '' : (Number(celsius) * 9) / 5 + 32}
        onChange={f => setCelsius(f === '' ? '' : ((Number(f) - 32) * 5) / 9)}
      />
    </>
  );
}
\`\`\`

**When to lift:** when two or more components need to read or affect the same piece of data. The trade-off: the ancestor re-renders when state changes. Over-lifting state (to a very high ancestor) makes performance worse. For widely-shared state across distant components, Context or an external store is a better fit.`,
      difficulty: 2,
      tags: 'state-management,patterns,props,lifting-state',
    },
    {
      title: 'What are common React anti-patterns to avoid?',
      answer: `**1. Setting state during render** — causes infinite loops or stale renders:
\`\`\`jsx
// BAD: triggered during render
if (!loaded) setLoaded(true); // triggers another render
\`\`\`

**2. Using array indices as keys** — breaks reconciliation on reorder/delete

**3. Storing derived state in useState** — creates sync bugs:
\`\`\`jsx
// BAD
const [fullName, setFullName] = useState(first + ' ' + last);
// GOOD
const fullName = first + ' ' + last; // derive inline
\`\`\`

**4. Over-using useEffect** for derived values or event-driven logic

**5. Direct state mutation**:
\`\`\`jsx
// BAD
state.items.push(newItem); setState(state); // mutates then assigns
// GOOD
setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
\`\`\`

**6. Creating components inside render functions** — causes unnecessary unmounts/remounts:
\`\`\`jsx
// BAD: new component type each render
function Parent() {
  const Child = () => <div />; // defined inside Parent
  return <Child />;
}
\`\`\`

These patterns lead to subtle bugs, performance issues, and confusing behavior.`,
      difficulty: 2,
      tags: 'best-practices,anti-patterns,common-mistakes,debugging',
    },
    {
      title: 'What is the Flux architecture pattern?',
      answer: `Flux is an application architecture pattern from Meta that enforces **unidirectional data flow**. It predates Redux and was the inspiration for it.

**Flux cycle:**
\`\`\`
Action → Dispatcher → Store → View → Action (user interaction)
\`\`\`

- **Action:** a plain object describing what happened (\`{ type: 'ADD_ITEM', payload: item }\`)
- **Dispatcher:** central hub that broadcasts actions to all registered stores
- **Store:** contains state and business logic; registers with the dispatcher; emits "change" events
- **View:** React components that listen to stores and re-render on change

\`\`\`js
// Simplified Flux flow
dispatcher.dispatch({ type: 'ADD_TODO', text: 'Learn React' });

// Store handler
dispatcher.register((action) => {
  if (action.type === 'ADD_TODO') {
    todos.push({ text: action.text, done: false });
    emit('change');
  }
});
\`\`\`

Redux simplified Flux by merging all stores into one and making the reducer a pure function. Modern React's Context + \`useReducer\` implements the same pattern natively. Understanding Flux helps explain why Redux's API was designed the way it was.`,
      difficulty: 2,
      tags: 'architecture,flux,state-management,unidirectional,patterns',
    },
    {
      title: 'How do you decide between React state, Context, and external state managers?',
      answer: `Choose the simplest tool that fits the scope of the state.

**React \`useState\`/\`useReducer\`:** for state that belongs to one component or a small, closely related subtree. Simplest, zero overhead.

**React Context:** for state that needs to be available to a large subtree but changes **infrequently** (theme, locale, auth status). Context re-renders all consumers on every value change, so it's a bad fit for frequently-updating data.

**External manager (Zustand, Jotai, Redux Toolkit):** for app-wide, frequently-changing state (cart, UI selections, complex async flows). They support selective subscriptions — components re-render only when the slice they subscribe to changes.

\`\`\`
State type           → Tool
──────────────────────────────
Local UI (toggle)    → useState
Form state           → useState or react-hook-form
Shared between 2-3   → lift up + props
App-wide, rare change→ Context
App-wide, frequent   → Zustand / Jotai / Redux
Server state         → TanStack Query / SWR
URL state            → React Router search params
\`\`\``,
      difficulty: 2,
      tags: 'state-management,architecture,context,redux,decision-making',
    },
    {
      title: 'What is React.createElement vs React.cloneElement?',
      answer: `**\`React.createElement(type, props, ...children)\`** creates a new React element from scratch. This is what JSX compiles to.

**\`React.cloneElement(element, extraProps, ...children)\`** clones an existing element and merges new props into it, optionally replacing children. Useful for injecting additional props into children you don't own.

\`\`\`jsx
// createElement — equivalent to <Button disabled />
const el = React.createElement(Button, { disabled: true }, 'Click me');

// cloneElement — add props to a child you received
function Toolbar({ children }) {
  return React.Children.map(children, child =>
    React.cloneElement(child, { className: 'toolbar-item' })
  );
}

// Usage
<Toolbar>
  <Button>Save</Button>   {/* receives className="toolbar-item" */}
  <Button>Cancel</Button> {/* receives className="toolbar-item" */}
</Toolbar>
\`\`\`

\`cloneElement\` is common in component libraries (tabs, radio groups) where a parent injects context into its children. It's implicit coupling though — prefer explicit composition or Context when possible.`,
      difficulty: 2,
      tags: 'api,createelement,cloneelement,elements,components',
    },
    {
      title: 'What are stateless vs stateful components?',
      answer: `**Stateless components** (also called "dumb" or presentational) hold no internal state — they are pure functions of their props and always render the same output for the same input.

**Stateful components** (also called "smart" or container) maintain state via \`useState\`, \`useReducer\`, or class-based \`this.state\`, and their output can vary based on internal data.

\`\`\`jsx
// Stateless — same input, same output, no side effects
function PriceTag({ amount, currency = 'USD' }) {
  return <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}</span>;
}

// Stateful — output depends on internal state (not just props)
function CartSummary({ items }) {
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const total = items.reduce((sum, i) => sum + i.price, 0) * (1 - discount);
  // ... discount application logic
  return <div>Total: {total}</div>;
}
\`\`\`

Prefer stateless components where possible — they are easier to test, reuse, and reason about. Stateful logic ideally lives in custom hooks or a higher layer, keeping UI components pure.`,
      difficulty: 1,
      tags: 'components,stateless,stateful,design-patterns,purity',
    },
    {
      title: 'What is useId and when should you use it?',
      answer: `\`useId()\` (React 18) generates a **stable, unique ID** that is consistent between server and client renders, avoiding hydration mismatches. It's designed for associating form labels with inputs via \`id\`/\`htmlFor\`.

\`\`\`jsx
function TextInput({ label }) {
  const id = useId(); // stable across server and client

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}

// Multiple IDs from one hook
function PasswordInput() {
  const baseId = useId();
  return (
    <div>
      <label htmlFor={\`\${baseId}-password\`}>Password</label>
      <input id={\`\${baseId}-password\`} type="password"
             aria-describedby={\`\${baseId}-hint\`} />
      <p id={\`\${baseId}-hint\`}>At least 8 characters</p>
    </div>
  );
}
\`\`\`

**Never use \`useId\` as a key in lists** — it generates one ID per component instance, not per list item. Use it only for DOM attribute associations. \`Math.random()\` or incrementing counters fail during SSR because server and client produce different values.`,
      difficulty: 1,
      tags: 'hooks,accessibility,ids,ssr,hydration',
    },
    {
      title: 'What is useImperativeHandle and when do you need it?',
      answer: `\`useImperativeHandle\` customizes what value a parent receives when using a \`ref\` on a child component. Instead of exposing the raw DOM node, you expose a controlled public API.

\`\`\`jsx
const FancyInput = React.forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    // Parent can't access inputRef.current directly — only these methods
  }));

  return <input ref={inputRef} {...props} />;
});

// Parent
function Form() {
  const fancyRef = useRef(null);
  return (
    <>
      <FancyInput ref={fancyRef} />
      <button onClick={() => fancyRef.current.focus()}>Focus</button>
      <button onClick={() => fancyRef.current.clear()}>Clear</button>
    </>
  );
}
\`\`\`

Use it sparingly — imperative code is harder to reason about than declarative. Good use cases: exposing \`focus()\`/\`blur()\`/\`scroll()\` on design system inputs, video player controls, and scroll containers.`,
      difficulty: 2,
      tags: 'hooks,refs,imperative,forwardref,encapsulation',
    },
    {
      title: 'What are the component lifecycle phases in class components?',
      answer: `Class component lifecycle has three main phases:

**Mounting:** component created and inserted into DOM
1. \`constructor()\` — setup, bind methods
2. \`static getDerivedStateFromProps()\` — update state from props
3. \`render()\` — return JSX
4. \`componentDidMount()\` — DOM ready, start data fetching, subscriptions

**Updating:** re-render triggered by props or state change
5. \`static getDerivedStateFromProps()\`
6. \`shouldComponentUpdate()\` — return false to skip render
7. \`render()\`
8. \`getSnapshotBeforeUpdate()\` — capture DOM state before update
9. \`componentDidUpdate(prevProps, prevState, snapshot)\`

**Unmounting:**
10. \`componentWillUnmount()\` — cleanup: cancel requests, remove listeners

\`\`\`jsx
class Timer extends React.Component {
  componentDidMount() {
    this.intervalId = setInterval(() => this.setState(s => ({ t: s.t + 1 })), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.intervalId); // cleanup
  }
  render() { return <p>{this.state.t}s</p>; }
}
\`\`\``,
      difficulty: 2,
      tags: 'lifecycle,class-components,phases,componentdidmount',
    },
    {
      title: 'What are the class lifecycle methods and their hook equivalents?',
      answer: `| Class lifecycle | Hook equivalent |
|---|---|
| \`constructor\` | \`useState\` initial value / function body |
| \`componentDidMount\` | \`useEffect(() => {}, [])\` |
| \`componentDidUpdate\` | \`useEffect(() => {}, [deps])\` |
| \`componentWillUnmount\` | \`useEffect(() => { return cleanup }, [])\` |
| \`shouldComponentUpdate\` | \`React.memo\` / \`useMemo\` |
| \`getDerivedStateFromProps\` | derive in render or \`useMemo\` |
| \`getSnapshotBeforeUpdate\` | \`useLayoutEffect\` (partial equivalent) |

\`\`\`jsx
// Class
componentDidMount() { this.fetch(); }
componentDidUpdate(prevProps) {
  if (prevProps.id !== this.props.id) this.fetch();
}
componentWillUnmount() { this.controller.abort(); }

// Hook equivalent
useEffect(() => {
  const controller = new AbortController();
  fetchData(id, controller.signal);
  return () => controller.abort();
}, [id]); // runs on mount and when id changes; cleans up before next run
\`\`\`

Hooks collapse mount + update + unmount into a single unified \`useEffect\` with dependency-driven re-execution.`,
      difficulty: 2,
      tags: 'lifecycle,class-components,hooks,migration,comparison',
    },
    {
      title: 'What are synthetic events in React?',
      answer: `Synthetic events are React's wrapper around native browser events. They normalize event behavior across browsers and provide a consistent API. React uses **event delegation** — it attaches one listener to the root and dispatches to components, not one per element.

\`\`\`jsx
function Form() {
  function handleSubmit(event) { // SyntheticEvent, not native Event
    event.preventDefault(); // works same as native
    console.log(event.type); // 'submit'
    console.log(event.target.elements.name.value);
  }

  function handleChange(event) {
    console.log(event.currentTarget.value); // current target available
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" onChange={handleChange} />
    </form>
  );
}
\`\`\`

**Key notes:**
- All \`on[EventName]\` props receive a \`SyntheticEvent\`
- In React 17+, synthetic events are no longer pooled (no more \`event.persist()\` needed)
- Native events are still accessible via \`event.nativeEvent\`
- Synthetic events support all standard DOM event properties and methods`,
      difficulty: 2,
      tags: 'events,synthetic-events,dom,api,cross-browser',
    },
    {
      title: 'How do you conditionally render elements in React?',
      answer: `React offers several patterns for conditional rendering, each with different trade-offs.

\`\`\`jsx
function Dashboard({ user, isLoading, hasError }) {
  // 1. if/else — clean for complex conditions
  if (isLoading) return <Spinner />;
  if (hasError) return <ErrorMessage />;

  // 2. Ternary — inline, good for either/or
  return (
    <div>
      {user ? <UserWelcome name={user.name} /> : <LoginPrompt />}

      {/* 3. && short-circuit — render or nothing */}
      {user.isAdmin && <AdminPanel />}
      {/* Warning: use !! for numbers — {0 && <X />} renders "0" */}
      {!!notifications.length && <Badge count={notifications.length} />}

      {/* 4. Nullish coalescing — undefined/null guard */}
      {user.avatar ?? <DefaultAvatar />}

      {/* 5. IIFE for complex inline logic */}
      {(() => {
        if (user.role === 'admin') return <AdminBadge />;
        if (user.role === 'mod') return <ModBadge />;
        return <UserBadge />;
      })()}
    </div>
  );
}
\`\`\`

Return \`null\` from a component to render nothing. Using \`&&\` with numbers can accidentally render \`0\` — always cast to boolean with \`!!\`.`,
      difficulty: 1,
      tags: 'rendering,conditionals,jsx,patterns,null',
    },
    {
      title: 'What are the different ways to style a React component?',
      answer: `React supports multiple styling approaches, each with different trade-offs.

**1. CSS Modules** — scoped styles, no class conflicts:
\`\`\`jsx
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>
\`\`\`

**2. CSS-in-JS (styled-components, Emotion)** — co-located, dynamic styles:
\`\`\`jsx
const Button = styled.button\`
  background: \${props => props.primary ? 'blue' : 'white'};
\`;
\`\`\`

**3. Inline styles** — dynamic, no class needed, limited features:
\`\`\`jsx
<div style={{ color: isDark ? 'white' : 'black', padding: 16 }} />
\`\`\`

**4. Utility-first CSS (Tailwind CSS)** — classes as styles:
\`\`\`jsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
\`\`\`

**5. Global CSS** — traditional stylesheets imported in root

**Trade-offs:** CSS Modules for simplicity; styled-components for dynamic theming; Tailwind for rapid iteration without naming friction; inline styles only for truly dynamic values.`,
      difficulty: 1,
      tags: 'styling,css-modules,styled-components,tailwind,css-in-js',
    },
    {
      title: 'How do you handle asynchronous data loading in React?',
      answer: `The modern approaches combine \`useEffect\` (or the \`use\` hook in React 19) with loading/error state, or delegate to a data-fetching library.

\`\`\`jsx
// Classic: useEffect + manual state
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchUser(userId, controller.signal)
      .then(setUser)
      .catch(e => { if (e.name !== 'AbortError') setError(e); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner error={error} />;
  return <Profile user={user} />;
}
\`\`\`

**Better: TanStack Query (formerly React Query)** handles caching, deduplication, background refetch, and retry automatically:
\`\`\`jsx
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  // ...
}
\`\`\``,
      difficulty: 2,
      tags: 'async,data-fetching,useeffect,loading-state,tanstack-query',
    },
    {
      title: 'How do you optimize a React context to reduce re-renders?',
      answer: `Every consumer of a context re-renders whenever the context value changes. Several strategies reduce unnecessary re-renders.

**1. Split contexts by update frequency:**
\`\`\`jsx
// BAD: one context for everything
const AppContext = createContext({ user, theme, notifications });

// GOOD: split by concern
const UserContext = createContext(user);     // changes rarely
const ThemeContext = createContext(theme);   // changes rarely
const NotifContext = createContext(notifs);  // changes often
\`\`\`

**2. Memoize the context value:**
\`\`\`jsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]); // stable object
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
\`\`\`

**3. Separate state from dispatch:**
\`\`\`jsx
const StateContext = createContext(state);
const DispatchContext = createContext(dispatch);
// Components that only dispatch never re-render on state changes
\`\`\`

**4. Use external state (Zustand/Jotai)** for frequently updating global state — they support selective subscriptions at the hook level.`,
      difficulty: 3,
      tags: 'context,performance,optimization,memoization,re-renders',
    },
    {
      title: 'What is Server-Side Rendering (SSR) and how does it differ from CSR?',
      answer: `**CSR (Client-Side Rendering):** The server sends a minimal HTML shell. The browser downloads JavaScript, executes React, and renders the full UI on the client. Good for app-like experiences; bad for initial load time and SEO.

**SSR (Server-Side Rendering):** The server executes React, generates full HTML, and sends it to the browser. The browser displays content immediately. React then "hydrates" the HTML with interactivity.

\`\`\`
CSR timeline:
[HTML shell] → [download JS] → [React renders] → [interactive]
    ^               ^                ^                ^
 ~10ms          ~500ms             ~1000ms          ~1000ms

SSR timeline:
[Full HTML] → [display content] → [download JS] → [hydrate]
    ^                ^                 ^              ^
  ~200ms           ~200ms            ~500ms         ~1000ms
\`\`\`

**SSR trade-offs:**
- Better Time to First Contentful Paint (FCP) and SEO
- Server bears rendering load
- Hydration mismatch bugs possible
- Works with frameworks: Next.js (\`getServerSideProps\`), Remix (\`loader\`)

**React 18 Streaming SSR** sends HTML in chunks as data loads, further improving perceived performance.`,
      difficulty: 3,
      tags: 'ssr,csr,rendering,performance,seo,next-js',
    },
    {
      title: 'How does React Router work and how do you implement dynamic routing?',
      answer: `React Router v6 uses a component-based API to map URL paths to components. Dynamic segments are defined with \`:\` syntax and accessed via the \`useParams\` hook.

\`\`\`jsx
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/:userId" element={<UserDetail />} />
        <Route path="/posts/:postId/comments/:commentId" element={<Comment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function UserDetail() {
  const { userId } = useParams();         // { userId: '42' }
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return user ? <UserCard user={user} /> : <Spinner />;
}
\`\`\`

Route matching is exclusive by default in v6 — the first match wins. The \`<Routes>\` component replaces v5's \`<Switch>\`.`,
      difficulty: 2,
      tags: 'routing,react-router,dynamic-routes,params,navigation',
    },
    {
      title: 'What changed between React Router v5 and v6?',
      answer: `React Router v6 (2021) was a major redesign. Key changes:

**1. \`<Switch>\` replaced by \`<Routes>\`** — routes are ranked by specificity, not first-match:
\`\`\`jsx
// v5
<Switch>
  <Route exact path="/users" component={UserList} />
  <Route path="/users/:id" component={UserDetail} />
</Switch>

// v6
<Routes>
  <Route path="/users" element={<UserList />} />
  <Route path="/users/:id" element={<UserDetail />} />
</Routes>
\`\`\`

**2. \`component\`/\`render\` → \`element\`** — pass JSX, not component reference

**3. Nested routes** are declared inside parent \`<Route>\` instead of in child components

**4. \`useHistory\` → \`useNavigate\`**:
\`\`\`jsx
const navigate = useNavigate();
navigate('/home');       // push
navigate(-1);            // go back
navigate('/login', { replace: true }); // replace
\`\`\`

**5. Relative links** — \`<Link to="edit">\` now relative to the route, not root

**6. \`<Outlet />\`** renders nested routes, replacing children-based nesting`,
      difficulty: 2,
      tags: 'routing,react-router,migration,v5,v6',
    },
    {
      title: 'How do you handle nested routes with <Outlet> in React Router v6?',
      answer: `\`<Outlet />\` is a placeholder in a parent layout component where the matched child route renders. It enables **shared layouts** (navigation bar, sidebar) without repeating them in every child.

\`\`\`jsx
// Route definition
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Overview />} />             {/* /dashboard */}
    <Route path="analytics" element={<Analytics />} /> {/* /dashboard/analytics */}
    <Route path="settings" element={<Settings />} />   {/* /dashboard/settings */}
  </Route>
</Routes>

// DashboardLayout.tsx — shared wrapper
function DashboardLayout() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <Outlet /> {/* child route renders here */}
      </main>
    </div>
  );
}
\`\`\`

The \`index\` route renders when the parent path matches exactly (no trailing path segment). Use \`useOutletContext()\` to pass data from the layout to child routes without prop drilling.`,
      difficulty: 2,
      tags: 'routing,nested-routes,outlet,layout,react-router',
    },
    {
      title: 'How do you navigate programmatically in React Router?',
      answer: `The \`useNavigate\` hook returns a \`navigate\` function for imperative navigation, replacing v5's \`useHistory\`.

\`\`\`jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');          // push to new route
    } catch (err) {
      setError(err.message);
    }
  }
}

// Navigation options
navigate('/home');                            // push
navigate(-1);                                 // go back
navigate(1);                                  // go forward
navigate('/login', { replace: true });        // replace (no back entry)
navigate('/profile', { state: { from: '/protected' } }); // pass state

// Read the passed state in destination
const location = useLocation();
const from = location.state?.from ?? '/';
\`\`\`

For accessibility, prefer \`<Link>\` components for user-visible navigation. Reserve \`useNavigate\` for form submissions, programmatic redirects, and post-action navigation.`,
      difficulty: 1,
      tags: 'routing,navigation,usenavigate,react-router,programmatic',
    },
    {
      title: 'How do you implement private/protected routes in React?',
      answer: `Protected routes redirect unauthenticated users to a login page. In React Router v6, this is typically done with a wrapper component that checks auth state.

\`\`\`jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ requiredRole }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />; // wait for auth check

  if (!user) {
    // Redirect to login, remember where user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />; // render child route
}

// Route config
<Routes>
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Route>
  <Route element={<ProtectedRoute requiredRole="admin" />}>
    <Route path="/admin" element={<AdminPanel />} />
  </Route>
</Routes>
\`\`\``,
      difficulty: 2,
      tags: 'routing,auth,protected-routes,navigation,security',
    },
    {
      title: 'How do you test React components with React Testing Library?',
      answer: `React Testing Library (RTL) tests components from the user's perspective — querying by accessible roles/text rather than CSS selectors. It encourages testing behavior, not implementation details.

\`\`\`jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  test('submits credentials and shows success', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ user: { name: 'Alice' } });
    render(<LoginForm onLogin={mockLogin} />);

    // Query by accessible role/label — as a user would see it
    await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret123',
    });
    await screen.findByText('Welcome, Alice'); // findBy waits for async
  });
});
\`\`\`

**Query priority:** \`getByRole\` > \`getByLabelText\` > \`getByPlaceholderText\` > \`getByText\` > \`getByTestId\` (last resort). Using \`getByRole\` also validates accessibility.`,
      difficulty: 2,
      tags: 'testing,rtl,jest,accessibility,best-practices',
    },
    {
      title: 'How do you mock API calls in React component tests?',
      answer: `**Option 1: Mock the module with Jest**
\`\`\`jsx
jest.mock('../api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'Alice', id: 1 }),
}));

test('displays user name', async () => {
  render(<UserProfile userId={1} />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
\`\`\`

**Option 2: MSW (Mock Service Worker) — intercept at the network level:**
\`\`\`jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) =>
    res(ctx.json({ name: 'Alice', id: req.params.id }))
  ),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays user name', async () => {
  render(<UserProfile userId={1} />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
\`\`\`

MSW is preferred for testing components that use \`fetch\` or Axios directly — it doesn't break if you refactor the API layer.`,
      difficulty: 2,
      tags: 'testing,mocking,jest,msw,api,network',
    },
    {
      title: 'What is automatic batching in React 18?',
      answer: `React 18 introduced **automatic batching** — multiple state updates triggered from the same event handler, timeout, Promise, or native event are now batched into a single re-render, regardless of where they originate.

\`\`\`jsx
// React 17: only batched inside React event handlers
// React 18: batched EVERYWHERE

// React 17 — setTimeout causes 2 renders
setTimeout(() => {
  setCount(c => c + 1); // render 1
  setFlag(f => !f);     // render 2
}, 1000);

// React 18 — same code = 1 render (automatically batched)
setTimeout(() => {
  setCount(c => c + 1); // queued
  setFlag(f => !f);     // queued → single re-render
}, 1000);

// Same for Promises
fetch('/api').then(() => {
  setCount(c => c + 1); // React 18: batched
  setData(newData);     // React 18: batched → 1 render
});

// Opt out if needed
import { flushSync } from 'react-dom';
flushSync(() => setCount(c => c + 1)); // forces immediate render
flushSync(() => setFlag(f => !f));     // second render
\`\`\``,
      difficulty: 2,
      tags: 'react18,batching,performance,state-updates,re-renders',
    },
    {
      title: 'What are the phases of a React render (render phase vs commit phase)?',
      answer: `React rendering has two distinct phases with different characteristics.

**Render phase (pure, interruptible):**
- React calls your component functions and hooks
- Computes the new virtual DOM tree
- Diffs against the previous tree (reconciliation)
- **No DOM mutations happen here**
- Can be paused, aborted, and restarted (concurrent mode)
- Must be **pure** — no side effects

**Commit phase (synchronous, non-interruptible):**
- React applies the computed changes to the actual DOM
- Calls \`useLayoutEffect\` cleanups and setups synchronously
- Schedules \`useEffect\` cleanups and setups for after paint
- **Cannot be interrupted**

\`\`\`
Component renders (pure)
    ↓ [render phase — can be interrupted]
React diffs virtual trees
    ↓ [commit phase — synchronous]
DOM mutations applied
    ↓
useLayoutEffect fires (synchronous)
    ↓
Browser paints
    ↓
useEffect fires (async, after paint)
\`\`\`

This two-phase model is why side effects must go in \`useEffect\`/\`useLayoutEffect\` and not directly in render logic.`,
      difficulty: 3,
      tags: 'internals,rendering,fiber,phases,commit,reconciliation',
    },
    {
      title: 'How does React.Suspense work as an orchestrator for loading states?',
      answer: `\`Suspense\` catches thrown Promises from its descendants and shows the \`fallback\` UI until all caught Promises resolve. This lets components "announce" that they're not ready without complex prop drilling.

\`\`\`jsx
// Suspense boundary wraps async content
function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UserDashboard />
    </Suspense>
  );
}

// Nested Suspense for granular loading states
function UserDashboard() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader /> {/* loads user data */}
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <ActivityFeed /> {/* loads feed data */}
      </Suspense>
    </div>
  );
}
\`\`\`

When \`UserHeader\` suspends, only the \`<HeaderSkeleton />\` shows — \`ActivityFeed\` loads independently. React 18 extends Suspense to work with SSR streaming, allowing server-rendered HTML to stream in chunks as Suspense boundaries resolve.`,
      difficulty: 2,
      tags: 'suspense,loading,ux,streaming,async,react18',
    },
    {
      title: 'What are Actions in React 19?',
      answer: `React 19 introduces **Actions** — async functions passed to form \`action\` props or used with \`useTransition\`. They automatically manage pending state, errors, and optimistic updates without manual state management.

\`\`\`jsx
'use client';
import { useTransition, useOptimistic } from 'react';

function AddItemForm({ onAdd }) {
  const [isPending, startTransition] = useTransition();
  const [, formAction] = useActionState(
    async (prevState, formData) => {
      await saveItem(formData.get('title'));
      return { success: true };
    },
    { success: false }
  );

  return (
    <form action={formAction}>
      <input name="title" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
\`\`\`

**Actions integrate with:**
- \`useActionState\` — manages action state + pending flag
- \`useFormStatus\` — reads pending state of the nearest \`action\` form
- \`useOptimistic\` — shows predicted state during action
- Server Actions — run the async function on the server directly`,
      difficulty: 3,
      tags: 'react19,actions,transitions,forms,async,mutations',
    },
    {
      title: 'What are the disadvantages or limitations of React?',
      answer: `React is powerful but has real trade-offs:

**1. View-only library** — no built-in routing, state management, or data fetching; requires choosing and integrating external libraries for every concern.

**2. JSX learning curve** — mixing HTML-like syntax in JavaScript confuses developers from templating backgrounds.

**3. Rapid ecosystem churn** — patterns and "best practices" change frequently (HOCs → render props → hooks → Server Components).

**4. SEO concerns** — pure CSR React requires SSR (Next.js, Remix) or static generation for search engine indexing.

**5. Bundle size** — even minimal React (React + ReactDOM) is ~45KB gzipped; adding a router, state manager, and form library adds significantly more.

**6. Boilerplate** — fetching data requires manual loading/error/data state management without a library like TanStack Query.

**7. Memoization complexity** — without the React Compiler, developers must manually apply \`memo\`, \`useMemo\`, and \`useCallback\` to avoid re-render issues.

**8. JavaScript-first** — business logic, templating, and styles all in JS; some teams prefer Angular's separation of concerns.`,
      difficulty: 1,
      tags: 'fundamentals,comparison,trade-offs,limitations',
    },
    {
      title: 'How do you pass data between sibling components in React?',
      answer: `Sibling components cannot communicate directly. The standard approaches in order of complexity:

**1. Lift state up to common parent:**
\`\`\`jsx
function Parent() {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <ListPanel onSelect={setSelected} />
      <DetailPanel item={selected} />
    </>
  );
}
\`\`\`

**2. Context** — when siblings are deeply nested or the data is broadly needed:
\`\`\`jsx
const SelectionContext = createContext(null);
function Parent() {
  const [selected, setSelected] = useState(null);
  return (
    <SelectionContext.Provider value={{ selected, setSelected }}>
      <DeepListPanel />
      <DeepDetailPanel />
    </SelectionContext.Provider>
  );
}
\`\`\`

**3. External state manager (Zustand, Jotai)** — when lifting state would require passing through many intermediate components.

**4. Custom event emitter** — rare, anti-pattern in React; use only for third-party integrations. Avoid direct sibling refs or DOM manipulation.`,
      difficulty: 2,
      tags: 'communication,state,siblings,props,lifting-state',
    },
    {
      title: 'What is the TestRenderer package and when is it deprecated in React 19?',
      answer: `\`react-test-renderer\` is a package that renders React components to pure JavaScript objects (not the DOM), without needing a DOM environment. It was useful for snapshot testing and environments where jsdom is unavailable.

\`\`\`jsx
// Old test-renderer usage
import TestRenderer from 'react-test-renderer';
const renderer = TestRenderer.create(<Button label="Click" />);
const tree = renderer.toJSON();
expect(tree).toMatchSnapshot();
// { type: 'button', props: {}, children: ['Click'] }
\`\`\`

**React 19 deprecation:** The \`react-test-renderer\` package is deprecated in React 19 and will be removed in a future version. The React team recommends migrating to:
- **React Testing Library** (\`@testing-library/react\`) for component testing
- **Vitest** or **Jest** with jsdom for the test environment

The deprecation motivation: \`react-test-renderer\` has a separate React renderer that diverges from browser behavior, leading to subtle test failures. RTL's user-centric approach produces more reliable and maintainable tests.`,
      difficulty: 2,
      tags: 'testing,legacy,react19,snapshots,test-renderer',
    },
    {
      title: 'What is React.memo and when does it help vs hurt?',
      answer: `\`React.memo\` wraps a component and skips re-rendering if props haven't changed (shallow equality). It only helps when: the component renders frequently, the render is expensive, and the props are stable.

\`\`\`jsx
const Row = React.memo(function Row({ item, onDelete }) {
  return <li>{item.name} <button onClick={() => onDelete(item.id)}>X</button></li>;
});

function List({ items }) {
  const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);
  // Without useCallback, onDelete is a new function each render → memo useless
  return items.map(item => <Row key={item.id} item={item} onDelete={handleDelete} />);
}
\`\`\`

**When it hurts:**
- The comparison itself costs more than just re-rendering
- Props change on every render anyway (new objects/functions without memoization)
- The component is fast to render (adds overhead for no benefit)
- Used as a premature optimization before profiling

Profile first with React DevTools' Profiler tab. Only add \`memo\` where you observe real re-render issues.`,
      difficulty: 2,
      tags: 'memo,optimization,re-renders,performance,profiling',
    },
    {
      title: 'What are the rules around key prop and why are array indices problematic?',
      answer: `The \`key\` prop must be a **stable, unique, string or number** among siblings. React uses it to match elements between renders.

**Why index keys break things:**
When a list is filtered, sorted, or items are added/removed at positions other than the end, indices change. React sees a key 0 and thinks the element is the same — it reuses the DOM node and component state, attaching old state to different data.

\`\`\`jsx
// State corruption with index keys
const list = ['Alice', 'Bob', 'Carol'];
// Each <Input key={0}>, <Input key={1}>, <Input key={2}> has local state

// Remove Alice → list = ['Bob', 'Carol']
// React sees key=0 still exists, keeps Bob in the input Alice was in
// Old input state (what user typed for Alice) stays in Bob's input!

// Fix: stable IDs
users.map(user => <Input key={user.id} name={user.name} />)
\`\`\`

**Acceptable uses of index keys:** static, non-reordered, non-filtered lists — e.g., rendering navigation items from a config array that never changes.

Keys must be unique among siblings only, not globally. Moving a component to a different list position won't cause a conflict.`,
      difficulty: 2,
      tags: 'lists,keys,reconciliation,performance,best-practices',
    },
    {
      title: 'How do you test asynchronous code in React components?',
      answer: `React Testing Library provides \`waitFor\`, \`findBy*\` queries, and \`act\` for handling async state updates in tests.

\`\`\`jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('loads and displays user after click', async () => {
  // Mock API
  jest.spyOn(api, 'fetchUser').mockResolvedValue({ name: 'Alice' });

  render(<UserLoader />);

  // Before fetch
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /load user/i }));

  // findBy* automatically waits (retries up to 1000ms by default)
  const name = await screen.findByText('Alice');
  expect(name).toBeInTheDocument();

  // waitFor for more complex assertions
  await waitFor(() => {
    expect(screen.getByRole('status')).toHaveTextContent('Loaded');
  });
});
\`\`\`

Use \`findBy*\` (returns Promise) for single async elements. Use \`waitFor\` when the assertion itself needs to retry. Avoid \`act()\` manually — RTL wraps interactions in \`act\` automatically.`,
      difficulty: 2,
      tags: 'testing,async,waitfor,findby,jest,rtl',
    },
    {
      title: 'How do you test React hooks with renderHook?',
      answer: `\`renderHook\` from \`@testing-library/react\` renders a custom hook in an isolated test component, giving you access to its return value and letting you test state updates.

\`\`\`jsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('increments counter', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => result.current.increment()); // wrap state updates in act
  expect(result.current.count).toBe(1);

  act(() => result.current.reset());
  expect(result.current.count).toBe(0);
});

// Test hook with props that change
test('resets when initial changes', () => {
  const { result, rerender } = renderHook(
    ({ initial }) => useCounter(initial),
    { initialProps: { initial: 5 } }
  );
  expect(result.current.count).toBe(5);

  rerender({ initial: 10 }); // simulate prop change
  act(() => result.current.reset());
  expect(result.current.count).toBe(10);
});
\`\`\``,
      difficulty: 2,
      tags: 'testing,hooks,renderhook,rtl,jest',
    },
    {
      title: 'How do you test components that use Context?',
      answer: `Wrap the component in the context Provider during testing. RTL's \`render\` accepts a \`wrapper\` option for reusable context setup.

\`\`\`jsx
// Simple: wrap directly
test('shows user name from context', () => {
  render(
    <UserContext.Provider value={{ name: 'Alice', role: 'admin' }}>
      <UserBadge />
    </UserContext.Provider>
  );
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('admin')).toBeInTheDocument();
});

// Reusable: custom render with all providers
function AllProviders({ children }) {
  return (
    <ThemeProvider theme="light">
      <UserContext.Provider value={mockUser}>
        {children}
      </UserContext.Provider>
    </ThemeProvider>
  );
}

function renderWithProviders(ui) {
  return render(ui, { wrapper: AllProviders });
}

// In tests
renderWithProviders(<Dashboard />);
expect(screen.getByRole('heading')).toBeInTheDocument();
\`\`\`

For context that dispatches (like \`useReducer\`), spy on the dispatch or test the rendered output after actions.`,
      difficulty: 2,
      tags: 'testing,context,providers,wrapper,rtl',
    },
    {
      title: 'Why does React recommend against mutating state directly?',
      answer: `React's re-render system depends on **referential inequality** to detect changes. When you mutate state in place, the reference stays the same — React cannot tell anything changed, so it skips the re-render and the UI stays stale.

\`\`\`jsx
// BAD: mutation — React sees same reference, no re-render
const [items, setItems] = useState([1, 2, 3]);
function addItem() {
  items.push(4);     // mutates the existing array
  setItems(items);   // same reference → React bails out
}

// GOOD: new reference
function addItem() {
  setItems([...items, 4]);  // new array → React re-renders
}

// BAD: mutating object in state
function updateUser() {
  user.name = 'Bob';  // mutation
  setUser(user);      // same reference → no re-render
}

// GOOD:
function updateUser() {
  setUser({ ...user, name: 'Bob' }); // new object
}
\`\`\`

Additionally, mutation makes debugging harder (can't compare prev/next state in DevTools), breaks time-travel debugging, and prevents React 18 concurrent features from working correctly (which may read old state from a paused render).`,
      difficulty: 2,
      tags: 'state,best-practices,immutability,re-renders,debugging',
    },
    {
      title: 'What are PropTypes and why are they deprecated in React 19?',
      answer: `\`PropTypes\` provided runtime type checking for React props in development. You'd attach a \`propTypes\` static property to a component describing expected prop types.

\`\`\`jsx
import PropTypes from 'prop-types';

function UserCard({ name, age, onFollow }) { /* ... */ }

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  onFollow: PropTypes.func.isRequired,
};
UserCard.defaultProps = { age: 0 };
\`\`\`

**Why deprecated in React 19:**
1. **TypeScript** and **Flow** provide compile-time type checking that is more accurate, catches errors earlier, and works across the whole codebase — not just at component boundaries
2. PropTypes only run in development and add bundle size
3. Maintaining both TS types and PropTypes is redundant
4. The React team removed the built-in PropTypes in React 19 (must install \`prop-types\` package separately)

**Migration path:** Use TypeScript interfaces/types for component props. \`defaultProps\` is also deprecated — use default parameter values instead.`,
      difficulty: 1,
      tags: 'type-checking,proptypes,typescript,deprecated,react19',
    },
    {
      title: 'What is React.Suspense for data fetching (beyond code-splitting)?',
      answer: `Beyond lazy loading, Suspense can orchestrate **data fetching** — a component throws a Promise when data isn't ready, Suspense catches it and shows the fallback, then re-renders when the Promise resolves.

\`\`\`jsx
// React 19: use() hook with Suspense
function UserProfile({ userPromise }) {
  const user = use(userPromise); // suspends if not resolved
  return <h1>{user.name}</h1>;
}

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={fetchUser(1)} />
    </Suspense>
  );
}

// TanStack Query integrates with Suspense:
function UserProfile({ userId }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  return <h1>{user.name}</h1>; // data is always defined here
}
\`\`\`

The benefit: components read data synchronously without \`if (isLoading)\` checks — loading states are handled by the nearest \`Suspense\` boundary. Error states are handled by the nearest Error Boundary.`,
      difficulty: 2,
      tags: 'suspense,data-fetching,async,use-hook,tanstack-query',
    },
    {
      title: 'What are common pitfalls when doing data fetching in React?',
      answer: `**1. Fetching inside render without memoization** runs a new request on every render:
\`\`\`jsx
function UserList() {
  const promise = fetch('/api/users'); // runs every render — BAD
}
\`\`\`

**2. Race conditions** — a slow earlier request overwrites a newer one:
\`\`\`jsx
useEffect(() => {
  let cancelled = false;
  fetchUser(id).then(user => { if (!cancelled) setUser(user); });
  return () => { cancelled = true; };
}, [id]);
\`\`\`

**3. Missing AbortController cleanup** — stale state update after unmount.

**4. Waterfall fetching** — sequential \`useEffect\` chains instead of parallel requests.

**5. Not handling loading and error states**, causing blank UIs on failure.

**6. Re-fetching on every render** instead of caching results.

The best solution is TanStack Query or SWR — they handle caching, deduplication, race conditions, background refresh, and loading/error states automatically:
\`\`\`jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
\`\`\``,
      difficulty: 2,
      tags: 'data-fetching,anti-patterns,async,race-conditions,useeffect',
    },
    {
      title: 'What is static site generation and when would you choose it over SSR?',
      answer: `**Static Site Generation (SSG)** pre-renders pages at **build time**. Resulting HTML is served from a CDN with no per-request server work. **SSR** renders HTML on the server on each request.

\`\`\`jsx
// Next.js SSG — fetched once during build
export async function getStaticProps() {
  const posts = await fetchBlogPosts();
  return { props: { posts }, revalidate: 3600 }; // ISR: hourly revalidation
}

// Next.js SSR — fetched on every request
export async function getServerSideProps({ req }) {
  const user = await getSessionUser(req.cookies.token);
  return { props: { user } };
}
\`\`\`

**Choose SSG when:**
- Content changes infrequently (blog, docs, marketing)
- Same HTML for all users (no personalization)
- Maximum CDN performance needed

**Choose SSR when:**
- Data changes per request (live data, real-time feeds)
- Content is personalized per user (cart, dashboard)

**ISR** (Incremental Static Regeneration, Next.js) is a hybrid: pages regenerate on a schedule or on-demand while still being served statically.`,
      difficulty: 3,
      tags: 'ssg,ssr,static-generation,nextjs,rendering,performance',
    },
    {
      title: 'What is the difference between BrowserRouter and HashRouter?',
      answer: `Both implement React Router, but differ in how they represent the location in the URL.

**\`BrowserRouter\`** uses the HTML5 History API. URLs look clean: \`/products/42\`. Requires the server to serve \`index.html\` for all paths — otherwise direct navigation returns 404.

**\`HashRouter\`** puts the path in the URL hash: \`/#/products/42\`. The server always serves \`index.html\`; JS reads the hash. No server config needed.

\`\`\`jsx
import { BrowserRouter } from 'react-router-dom';
// URL: https://example.com/products/42 (clean)
<BrowserRouter><App /></BrowserRouter>

import { HashRouter } from 'react-router-dom';
// URL: https://example.com/#/products/42
<HashRouter><App /></HashRouter>
\`\`\`

**Use BrowserRouter** for production deployments on servers you control (Nginx, Vercel, Netlify — configure \`try_files\` or catch-all rewrites). **Use HashRouter** for GitHub Pages, S3 static hosting, or any environment where you can't configure server-side routing.`,
      difficulty: 1,
      tags: 'routing,browserrouter,hashrouter,history-api,server-config',
    },
    {
      title: 'How do you handle 404 routes in React Router v6?',
      answer: `Use a wildcard route \`path="*"\` as the **last** route to catch all unmatched URLs and render a Not Found page.

\`\`\`jsx
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products/:id" element={<Product />} />
        {/* Wildcard — must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  const location = useLocation();
  return (
    <div>
      <h1>404 — Page Not Found</h1>
      <p>No match for <code>{location.pathname}</code></p>
      <Link to="/">← Home</Link>
    </div>
  );
}
\`\`\`

React Router v6 matches routes by specificity, not declaration order — but the \`*\` wildcard is always lowest priority and should still be placed last for readability. In nested route configs, add a \`path="*"\` inside nested \`<Routes>\` to catch unknown child paths.`,
      difficulty: 1,
      tags: 'routing,404,not-found,wildcard,react-router',
    },
    {
      title: 'How do you access query parameters with useSearchParams?',
      answer: `\`useSearchParams\` (React Router v6) reads and updates URL query strings reactively. It mirrors the \`URLSearchParams\` API.

\`\`\`jsx
import { useSearchParams } from 'react-router-dom';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page     = Number(searchParams.get('page') ?? '1');
  const sortBy   = searchParams.get('sort') ?? 'name';
  const category = searchParams.get('category') ?? '';

  function goToPage(n) {
    setSearchParams(prev => {
      prev.set('page', String(n));
      return prev; // preserves other params
    });
  }

  function applySort(sort) {
    setSearchParams({ sort, page: '1' }); // reset pagination on sort
  }

  // URL: /products?page=2&sort=price&category=books
  return (
    <>
      <SortBar value={sortBy} onChange={applySort} />
      <Grid category={category} sort={sortBy} page={page} />
      <Pagination current={page} onChange={goToPage} />
    </>
  );
}
\`\`\`

Always use the functional form of \`setSearchParams\` when updating one param while preserving others.`,
      difficulty: 1,
      tags: 'routing,query-params,usesearchparams,react-router,url',
    },
    {
      title: 'What is snapshot testing in React?',
      answer: `Snapshot testing captures the rendered output of a component into a \`.snap\` file. Future test runs compare against the stored snapshot and fail if the output changed unexpectedly.

\`\`\`jsx
import { render } from '@testing-library/react';

test('Button renders correctly', () => {
  const { asFragment } = render(<Button variant="primary">Save</Button>);
  expect(asFragment()).toMatchSnapshot();
  // First run: creates __snapshots__/Button.test.js.snap
  // Future runs: diff against the saved HTML tree
});
\`\`\`

**When snapshots are useful:**
- Pure presentational components with stable structure
- Detecting accidental regressions in design system components

**When snapshots hurt:**
- Components with frequent intentional changes (developers \`jest --updateSnapshot\` without reviewing)
- Dynamic content (dates, random IDs, server data)
- Behavior testing — snapshots test structure, not interaction

**General advice:** Prefer behavior tests with RTL (\`getByRole\`, \`userEvent\`). If using snapshots, keep them small and always review diffs before updating.`,
      difficulty: 1,
      tags: 'testing,snapshots,jest,regression,presentational',
    },
    {
      title: 'What is React Testing Library and why prefer it over Enzyme?',
      answer: `**React Testing Library (RTL)** queries the DOM as a user would — by accessible role, label, text. It intentionally hides component internals (state, instances, methods).

**Enzyme** exposes component internals: \`wrapper.state()\`, \`wrapper.find(Component)\`, \`wrapper.instance().method()\`. It was standard before RTL.

\`\`\`jsx
// Enzyme — testing implementation details
const wrapper = shallow(<Counter />);
expect(wrapper.state('count')).toBe(0);           // accesses internal state
wrapper.find('button').simulate('click');          // simulates by selector
expect(wrapper.instance().increment).toBeDefined(); // accesses method

// RTL — testing what the user experiences
render(<Counter />);
expect(screen.getByText('0')).toBeInTheDocument();
await userEvent.click(screen.getByRole('button', { name: /increment/i }));
expect(screen.getByText('1')).toBeInTheDocument();
\`\`\`

**Why RTL wins:** tests survive refactoring; accessible queries enforce accessibility; React team officially recommends it; Enzyme has limited React 17/18 support. The guiding principle: *"The more your tests resemble the way your software is used, the more confidence they can give you."*`,
      difficulty: 1,
      tags: 'testing,rtl,enzyme,best-practices,accessibility,tooling',
    },
    {
      title: 'How do you re-render a component when the browser window resizes?',
      answer: `Add a \`resize\` event listener in \`useEffect\` and update state when the window dimensions change. Wrap in a custom hook for reuse.

\`\`\`jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function onResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []); // mounts once, listener persists, cleans up on unmount

  return size;
}

// Optional: debounce to reduce render frequency
function useWindowSizeDebounced(delay = 150) {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setSize({ width: window.innerWidth, height: window.innerHeight }), delay);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
  }, [delay]);
  return size;
}

function Layout() {
  const { width } = useWindowSize();
  return <Grid columns={width > 768 ? 3 : 1} />;
}
\`\`\``,
      difficulty: 2,
      tags: 'hooks,custom-hooks,resize,responsive,events,window',
    },
    {
      title: 'When should you use a class component instead of a function component?',
      answer: `In 2026, the only legitimate reason to write a **new** class component is implementing an **Error Boundary** — \`componentDidCatch\` and \`getDerivedStateFromError\` have no hook equivalents.

\`\`\`jsx
// Still requires a class in React 19
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logError(error, info.componentStack); }
  render() {
    return this.state.hasError
      ? <p>Something went wrong.</p>
      : this.props.children;
  }
}
\`\`\`

**Practical solution:** use the \`react-error-boundary\` package, which wraps the class internally and gives you a hooks-friendly API:
\`\`\`jsx
import { ErrorBoundary } from 'react-error-boundary';
<ErrorBoundary fallback={<ErrorFallback />}><App /></ErrorBoundary>
\`\`\`

For all other cases — state, lifecycle, context, DOM refs, animations — function components with hooks are strictly better: less boilerplate, easier testing, better logic reuse, and better concurrent-mode compatibility. Migrate class components to functions opportunistically.`,
      difficulty: 2,
      tags: 'class-components,error-boundaries,migration,legacy,hooks',
    },
    {
      title: 'How does React.createContext and useContext work under the hood?',
      answer: `\`createContext(defaultValue)\` returns an object with \`Provider\` and \`Consumer\`. React stores context values on the fiber tree — the \`Provider\` pushes a value; consumers read the nearest one up the tree.

\`\`\`jsx
const ThemeContext = React.createContext('light');
// Returns: { Provider, Consumer, _currentValue, displayName }

function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={theme}>
      {/* Pushes 'dark' onto the context stack for this subtree */}
      <Child />
    </ThemeContext.Provider>
  );
}

function Child() {
  const theme = useContext(ThemeContext);
  // React walks up the fiber tree, finds ThemeContext.Provider, returns 'dark'
  // If no Provider found, returns defaultValue ('light')
  return <div className={theme}>Themed</div>;
}
\`\`\`

**Re-render behavior:** When the Provider's \`value\` prop changes (by reference), React marks all \`useContext(ThemeContext)\` consumers as dirty and re-renders them, regardless of tree depth. This is why memoizing the value object (\`useMemo\`) matters for performance: \`value={{ theme, setTheme }}\` creates a new object every render without it.`,
      difficulty: 2,
      tags: 'context,createcontext,usecontext,internals,provider,re-renders',
    },
    {
      title: 'What is the React Node, React Element, and React Component distinction?',
      answer: `These three terms describe different levels of React's abstraction hierarchy.

**React Component** — a function (or class) that accepts \`props\` and returns renderable content:
\`\`\`jsx
function Button({ onClick, children }) { // React Component
  return <button onClick={onClick}>{children}</button>;
}
\`\`\`

**React Element** — the plain JS object \`React.createElement\` returns (or JSX compiles to). It describes *what* to render:
\`\`\`jsx
const element = <Button onClick={fn}>Save</Button>;
// Same as: React.createElement(Button, { onClick: fn }, 'Save')
// { type: Button, props: { onClick: fn, children: 'Save' }, key: null }
\`\`\`

**React Node** — anything React can render. Includes: Element, string, number, array of nodes, Fragment, Portal, \`null\`, \`undefined\`, \`boolean\` (renders nothing).

\`\`\`jsx
// All valid React Nodes:
const node1 = 'plain text';
const node2 = 42;
const node3 = <Button>Save</Button>;
const node4 = null;
const node5 = [<li key="a" />, <li key="b" />];
const node6 = false; // renders nothing
\`\`\`

**Type signature:** \`React.FC<Props>\` returns \`React.ReactElement | null\`. Props' \`children\` type is \`React.ReactNode\` (the broadest).`,
      difficulty: 1,
      tags: 'fundamentals,elements,components,nodes,types,jsx',
    },
    {
      title: 'How do you handle global unhandled promise rejections in React apps?',
      answer: `React Error Boundaries only catch errors during render, not in async code or event handlers. Use the \`unhandledrejection\` window event to catch async errors globally.

\`\`\`jsx
// In main.tsx — global handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  errorMonitoring.captureException(event.reason);
  event.preventDefault(); // suppress default console error
});

// Event handlers must use try/catch — Error Boundaries won't help here
async function handleSubmit() {
  try {
    await saveData(formData);
    navigate('/success');
  } catch (err) {
    setError(err.message); // handle in component
  }
}

// useEffect async errors also need explicit handling
useEffect(() => {
  fetchData()
    .then(setData)
    .catch(err => { setError(err.message); }); // must catch manually
}, []);
\`\`\`

**Strategy:** Layer Error Boundaries (render errors) + \`unhandledrejection\` listener (async errors) + a monitoring service (Sentry, Datadog) that captures both. This ensures no silent failures reach production.`,
      difficulty: 2,
      tags: 'error-handling,async,promises,global-errors,monitoring',
    },
    {
      title: 'How do you localize a React app with react-intl?',
      answer: `\`react-intl\` (FormatJS) provides components and hooks for translating messages, formatting numbers, dates, and plurals based on the active locale.

\`\`\`jsx
import { IntlProvider, FormattedMessage, useIntl } from 'react-intl';

const translations = {
  en: { 'app.welcome': 'Hello, {name}!', 'cart.items': '{count, plural, one {# item} other {# items}}' },
  fr: { 'app.welcome': 'Bonjour, {name} !', 'cart.items': '{count, plural, one {# article} other {# articles}}' },
};

function App({ locale = 'en' }) {
  return (
    <IntlProvider locale={locale} messages={translations[locale]}>
      <ProductPage />
    </IntlProvider>
  );
}

function ProductPage() {
  const intl = useIntl();
  return (
    <div>
      <h1>{intl.formatMessage({ id: 'app.welcome' }, { name: 'Alice' })}</h1>
      <FormattedMessage id="cart.items" values={{ count: 3 }} /> {/* 3 items */}
      {intl.formatNumber(9.99, { style: 'currency', currency: 'EUR' })}
    </div>
  );
}
\`\`\`

Use \`formatjs extract\` CLI to pull all message IDs from source and generate translation files for a human translator.`,
      difficulty: 2,
      tags: 'i18n,localization,react-intl,formatting,internationalization',
    },
    {
      title: 'What are common performance anti-patterns beyond memoization?',
      answer: `**1. Defining components inside render** — creates a new component type each cycle, forcing full unmount/remount:
\`\`\`jsx
// BAD — new type each render
function Parent() { const Item = () => <li />; return <Item />; }
// GOOD — define outside
const Item = () => <li />;
\`\`\`

**2. Object/array literals directly in JSX** — new reference every render, breaks \`memo\`:
\`\`\`jsx
// BAD
<List style={{ color: 'red' }} items={[1,2,3]} />
// GOOD
const STYLE = { color: 'red' };
const ITEMS = [1, 2, 3];
\`\`\`

**3. Not virtualizing long lists** — rendering 10 000 DOM nodes at once; use TanStack Virtual or \`react-window\`

**4. Missing code-splitting** — entire application in one bundle downloaded upfront

**5. Triggering layout thrashing** — alternating DOM reads and writes in a loop forces repeated reflows

**6. Heavy computation in render** without \`useMemo\` or Web Worker offload

**7. Fetching in every component independently** instead of a shared cache (TanStack Query)

**Profile first** using React DevTools Profiler before optimizing — premature optimization increases complexity without guaranteed benefit.`,
      difficulty: 2,
      tags: 'performance,anti-patterns,optimization,rendering,best-practices',
    },
    {
      title: 'How do you use the key prop to force component reset?',
      answer: `Changing a component's \`key\` prop forces React to **unmount the old instance and mount a fresh one**. This is a clean pattern for resetting all local state when a prop changes, without \`useEffect\` juggling.

\`\`\`jsx
// BAD — useEffect trying to reset state when userId changes
function UserEditor({ userId }) {
  const [name, setName] = useState('');
  useEffect(() => { setName(''); }, [userId]); // clears name, but what about other state?
  return <input value={name} onChange={e => setName(e.target.value)} />;
}

// GOOD — key forces full remount with fresh state
function ProfilePage({ userId }) {
  return <UserEditor key={userId} userId={userId} />;
  // When userId changes, React unmounts old UserEditor, mounts a new one
  // All useState inside UserEditor starts fresh — no cleanup code needed
}
\`\`\`

**When to use this pattern:**
- Form that should reset when the selected item changes (switching between users in an admin panel)
- Component with multiple pieces of state all tied to a parent identifier
- Cleaning up internal subscriptions or refs on ID change

This is intentional and documented behavior, not a hack.`,
      difficulty: 2,
      tags: 'keys,state-reset,reconciliation,patterns,unmount',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
