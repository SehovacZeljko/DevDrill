import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What React Is and the Virtual DOM',
    content: `React is a JavaScript library for building user interfaces out of composable, reusable components, created and maintained by Meta. Rather than manipulating the DOM directly, you describe *what* the UI should look like for a given state, and React figures out *how* to update the real DOM to match.

It does this through a **virtual DOM** — a lightweight in-memory representation of the UI tree. When state changes, React builds a new virtual tree, diffs it against the previous one (a process called **reconciliation**), and applies only the minimal set of real DOM mutations needed, instead of re-rendering the entire page.

\`\`\`jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

This declarative model is the core shift from older imperative UI code (\`document.getElementById(...).innerText = ...\`): you stop thinking about step-by-step DOM mutations and instead think about state and the UI that should result from it.

A strong interview answer goes beyond "it's a UI library" — emphasize that React's value is the mental model: UI as a pure function of state, with React handling the expensive, error-prone work of efficiently syncing that description to the actual browser DOM.`,
  },
  {
    title: 'JSX Syntax and Babel Compilation',
    content: `JSX is a syntax extension that lets you write markup-like code directly inside JavaScript. It isn't HTML — it's syntactic sugar that compiles (via Babel) into plain \`React.createElement()\` calls.

\`\`\`jsx
const element = <h1 className="title">Hello</h1>;

// Babel compiles the above to:
const element = React.createElement('h1', { className: 'title' }, 'Hello');
\`\`\`

Because JSX is just function calls under the hood, it can embed any JavaScript expression inside curly braces — variables, ternaries, function calls — but not statements like \`if\` or \`for\` directly (you reach for ternaries, \`&&\`, or \`.map()\` instead).

\`\`\`jsx
function List({ items }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.label}</li>)}
    </ul>
  );
}
\`\`\`

A few JSX quirks come up often in interviews: attributes use camelCase (\`className\` not \`class\`, \`onClick\` not \`onclick\`) since they map to DOM properties rather than HTML attribute names, and every JSX expression must return a single root element (or a \`Fragment\`, \`<>...</>\`) since \`createElement\` returns one tree node, not a list.`,
  },
  {
    title: 'Components: Function vs Class',
    content: `A React component is just a function (or, historically, a class) that returns JSX describing what to render. Modern React is overwhelmingly **function components** combined with **hooks**; class components are legacy and rarely written in new code, though you'll still encounter them in older codebases.

\`\`\`jsx
// Function component (modern, preferred)
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Class component (legacy)
class Counter extends React.Component {
  state = { count: 0 };
  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}
\`\`\`

Function components became dominant after **Hooks** (React 16.8) let them hold state and side effects without the verbosity of classes — no \`this\` binding issues, no constructor boilerplate, and logic that touches the same concern can live together instead of being split across lifecycle methods like \`componentDidMount\` and \`componentDidUpdate\`.

The interview-relevant nuance: there's no behavioral reason to choose a class component in new code today — hooks cover every use case classes once required (including the equivalents of lifecycle methods), and the React team has stated function components with hooks are the recommended approach going forward.`,
  },
  {
    title: 'Props and Component Composition',
    content: `Props (short for "properties") are how data flows from a parent component into a child — they're read-only from the child's perspective, which keeps data flow predictable: a component never mutates the props it receives.

\`\`\`jsx
function Avatar({ src, alt, size = 40 }) {
  return <img src={src} alt={alt} width={size} height={size} />;
}

function ProfileHeader({ user }) {
  return (
    <div>
      <Avatar src={user.avatarUrl} alt={user.name} size={64} />
      <h2>{user.name}</h2>
    </div>
  );
}
\`\`\`

Composition — building complex UIs by combining small, focused components — is React's primary tool for reuse, favored over inheritance. The \`children\` prop is the key mechanism for this: any JSX nested between a component's opening and closing tags is passed to it as \`props.children\`, letting you build generic wrapper components.

\`\`\`jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

<Card><Avatar src="..." alt="..." /><p>Bio text</p></Card>
\`\`\`

A common interview question is "how would you avoid prop drilling?" — passing the same prop through many layers of components that don't use it themselves. The answer is usually composition (passing the deeply-needed component as \`children\` or a render prop from a higher level) or, when the data is truly global, the Context API.`,
  },
  {
    title: 'State and useState',
    content: `State is data that a component owns and that can change over time, triggering a re-render when it does. The \`useState\` hook is the primary tool for local component state in function components.

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

\`useState\` returns a pair: the current value and a setter function. Calling the setter schedules a re-render with the new value — it does **not** mutate the variable in place, which is why you never write \`count++\` directly; React needs to be told about the change through the setter to know it should re-render.

A frequent interview gotcha: state updates inside event handlers are **batched** and the setter you call doesn't immediately update the variable in the current closure — calling \`setCount(count + 1)\` twice in a row in the same handler only increments once, because both calls read the same stale \`count\` from that render. The fix is the **updater function** form: \`setCount(prev => prev + 1)\`, which always receives the latest pending value, not whatever was captured in the closure when the handler was created.`,
  },
  {
    title: 'Handling Events in React',
    content: `React wraps native browser events in a cross-browser-consistent **SyntheticEvent** system, attached via camelCase JSX props like \`onClick\`, \`onChange\`, and \`onSubmit\` rather than \`addEventListener\` calls.

\`\`\`jsx
function SearchForm({ onSearch }) {
  const [query, setQuery] = useState('');

  function handleSubmit(event) {
    event.preventDefault(); // same API as native events
    onSearch(query);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button type="submit">Search</button>
    </form>
  );
}
\`\`\`

Event handlers receive a synthetic event object with the same interface as a native DOM event (\`preventDefault()\`, \`stopPropagation()\`, \`target\`), so existing DOM event knowledge transfers directly — the difference is just where you attach the handler (a JSX prop, not \`addEventListener\`).

Passing an inline arrow function (\`onClick={() => doSomething(id)}\`) creates a new function on every render, which is harmless for most components but worth knowing about for performance-sensitive lists — pulling the handler out and binding the id via a data attribute or a memoized callback avoids that per-render allocation when it actually matters (measured, not assumed).`,
  },
  {
    title: 'Conditional Rendering and Lists',
    content: `Because JSX is just JavaScript expressions, conditional rendering uses ordinary JavaScript control flow rather than special template directives — ternaries, \`&&\`, early returns, or just variables holding JSX.

\`\`\`jsx
function StatusBanner({ isOnline, isLoading }) {
  if (isLoading) return <Spinner />;

  return (
    <div>
      {isOnline ? <span>🟢 Online</span> : <span>🔴 Offline</span>}
      {isOnline && <p>Last seen: just now</p>}
    </div>
  );
}
\`\`\`

Rendering lists uses \`.map()\` to transform an array of data into an array of JSX elements, and every element produced this way needs a stable, unique \`key\` prop so React can track which item is which across re-renders.

\`\`\`jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
\`\`\`

A common interview trap is using the array **index** as the key for a list that can be reordered, filtered, or have items inserted in the middle — when items move but their index-based keys don't move with them, React can mismatch DOM nodes to the wrong data, causing stale state (like a focused input or a checkbox) to "stick" to the wrong row after a reorder. The fix is always a stable identifier from the data itself, like a database id.`,
  },
  {
    title: 'The Component Lifecycle (useEffect)',
    content: `\`useEffect\` lets function components run code in response to rendering — fetching data, subscribing to an external event, manually touching the DOM — anything that isn't part of computing the JSX output itself, known as a "side effect."

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchUser(userId).then(data => {
      if (!cancelled) setUser(data);
    });

    return () => { cancelled = true; }; // cleanup, runs before the next effect or unmount
  }, [userId]); // dependency array — effect re-runs only when userId changes

  return user ? <h1>{user.name}</h1> : <Spinner />;
}
\`\`\`

The **dependency array** is the part most candidates get wrong: omitting it runs the effect after *every* render; an empty array \`[]\` runs it once, on mount only; listing values runs it whenever any of those values change between renders. The cleanup function returned from the effect runs before the effect re-runs and on unmount — essential for cancelling stale requests, removing event listeners, and clearing intervals/timeouts to avoid memory leaks and "setState on an unmounted component" warnings.

A precise interview answer maps \`useEffect\` to the old class lifecycle methods it replaces: an effect with no dependency array behaves like \`componentDidMount\` + \`componentDidUpdate\` combined, and the cleanup function behaves like \`componentWillUnmount\` — but scoped per-effect rather than one method handling every concern at once.`,
  },
  {
    title: 'Forms and Controlled Inputs',
    content: `A **controlled** input is one whose value is driven entirely by React state — the input's \`value\` comes from state, and every keystroke updates that state via \`onChange\`, making React the single source of truth for what's displayed.

\`\`\`jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    login(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Log in</button>
    </form>
  );
}
\`\`\`

The alternative, an **uncontrolled** input, lets the DOM manage its own value internally, and you read it on demand via a \`ref\` instead of tracking every keystroke in state — simpler for forms where you only need the value at submit time, with less re-rendering on every keystroke.

A practical interview question: "why does my input feel unresponsive when typing fast?" often traces back to an expensive computation or large re-render happening inside the \`onChange\` handler itself, on every single keystroke — the fix is usually debouncing the expensive work, not the input's own re-render, which React handles efficiently on its own.`,
  },
  {
    title: 'Lifting State Up and Component Communication',
    content: `When two sibling components need to share or stay in sync with the same piece of state, the standard pattern is **lifting state up** — moving the state to their closest common parent, which then passes the value down as a prop and a setter function down as a callback prop.

\`\`\`jsx
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);

  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitDisplay value={celsius * 9 / 5 + 32} />
    </>
  );
}

function CelsiusInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    />
  );
}
\`\`\`

This is the same one-directional data flow principle React uses everywhere: data flows down through props, and changes flow up through callback functions passed down as props — never by a child reaching up and mutating a parent's state directly.

The interview-relevant tradeoff: lifting state up is the right default for closely related components, but lifting too aggressively (state living several levels above where it's actually used "just in case") creates unnecessary re-renders of everything in between and prop-drilling noise — at that point, Context or a dedicated state library becomes the better tool.`,
  },
  {
    title: 'Context API for Shared State',
    content: `Context lets you share a value across a whole subtree of components without manually passing it down as a prop through every intermediate layer — solving the "prop drilling" problem for genuinely global or widely-needed data like the current theme, logged-in user, or locale.

\`\`\`jsx
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <ThemedButton />; // doesn't need to receive or forward the theme prop
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
\`\`\`

Any component calling \`useContext(ThemeContext)\` anywhere beneath the \`Provider\` reads its current value, no matter how many layers deep, and automatically re-renders when the provider's value changes.

The interview-relevant caveat: Context is not a general-purpose state management replacement for something like Redux — every consumer of a context re-renders whenever the provided value changes, even if a given consumer only cares about part of that value, which can cause broad, hard-to-trace re-renders if a single large context object is used for many unrelated pieces of state. The common fix is splitting one big context into several smaller, focused ones, each updated independently.`,
  },
  {
    title: 'Keys and Reconciliation',
    content: `Reconciliation is the algorithm React uses to diff a new virtual DOM tree against the previous one and decide the minimal set of real DOM changes needed. For sibling elements of the same type, React's heuristic relies on the \`key\` prop to match up old and new elements correctly.

\`\`\`jsx
// Without a stable key, inserting at the front confuses React's diffing
{items.map((item, index) => (
  <Row key={index} data={item} /> // fragile — breaks on reorder/insert
))}

{items.map(item => (
  <Row key={item.id} data={item} /> // correct — stable identity
))}
\`\`\`

When keys are missing or unstable (like an array index for a reorderable list), React can't tell that an item moved versus being a brand-new element — it may reuse the wrong DOM node for the wrong data, which becomes visible as state that "sticks" to the wrong position (an input's focus, a checked checkbox, an open accordion) after items are added, removed, or reordered.

A subtler interview point: keys only need to be unique among **siblings**, not globally across the whole app — the same key value can safely repeat in a completely different list elsewhere in the tree, since reconciliation only compares keys within one set of siblings at a time, never across separate parents.`,
  },
  {
    title: 'Styling Approaches in React',
    content: `React itself is unopinionated about styling — there's no single "React way" to write CSS, and several common approaches coexist across the ecosystem, each with different tradeoffs.

\`\`\`jsx
// Inline styles — a plain JS object, camelCase properties
<div style={{ backgroundColor: 'tomato', padding: 16 }}>Hi</div>

// CSS Modules — scoped class names, no global collisions
import styles from './Card.module.css';
<div className={styles.card}>Hi</div>

// CSS-in-JS (e.g. styled-components)
const Card = styled.div\`
  background: tomato;
  padding: 16px;
\`;
\`\`\`

**Inline styles** are simplest but lose pseudo-classes (\`:hover\`), media queries, and don't get cached/deduplicated by the browser like a stylesheet does. **CSS Modules** give scoped class names at build time with zero runtime cost, closest to writing plain CSS. **CSS-in-JS** libraries let style definitions live next to the component and support dynamic styling based on props, at the cost of some runtime overhead (less of a concern with modern compile-time variants).

In React Native specifically — relevant for this app — there's no CSS at all; styling is done entirely through the \`StyleSheet\` API and plain JS objects passed to the \`style\` prop, which maps a constrained subset of CSS-like properties (flexbox layout, no cascading/inheritance) directly onto native view properties.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'useMemo and useCallback for Performance',
    content: `\`useMemo\` and \`useCallback\` are memoization hooks that skip recomputing a value or recreating a function on every render, recalculating only when their dependencies change — tools for performance, not correctness, and unnecessary in most components.

\`\`\`jsx
function ProductList({ products, filter }) {
  const filtered = useMemo(
    () => products.filter(p => p.category === filter),
    [products, filter],
  );

  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);

  return filtered.map(p => <Product key={p.id} data={p} onSelect={handleSelect} />);
}
\`\`\`

\`useMemo\` caches a **value** (the result of an expensive computation); \`useCallback\` caches a **function reference** itself — useful specifically when that function is passed as a prop to a child wrapped in \`React.memo\`, since a new function reference on every render would otherwise defeat the memoization by always looking like a "changed" prop.

The interview-relevant nuance most candidates miss: reaching for \`useMemo\`/\`useCallback\` everywhere "just in case" has its own cost (the memoization bookkeeping itself isn't free) and rarely pays off without a measured performance problem. The React team's own guidance is to write the simple, unmemoized version first, profile if there's an actual jank or slowness, and only then add memoization at the specific hot spot the profiler identifies.`,
  },
  {
    title: 'useRef and Imperative Access to the DOM',
    content: `\`useRef\` creates a mutable container that persists across re-renders without itself triggering a re-render when it changes — the key distinction from \`useState\`, which always re-renders on update.

\`\`\`jsx
function SearchInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // imperative DOM access, after mount
  }, []);

  return <input ref={inputRef} type="text" />;
}
\`\`\`

Refs are the escape hatch for the rare cases that need to step outside React's declarative model: focusing an input, measuring an element's size, integrating a non-React library (a chart, a map) that needs a real DOM node handed to it directly, or storing a value (like a previous prop, an interval id, or a "did this effect already run" flag) that needs to survive re-renders but should never cause one.

A common interview distinction: mutating \`ref.current\` does not cause a re-render and reading it during render doesn't reflect "the latest" value reliably in concurrent rendering scenarios — refs are explicitly for imperative, side-effect-style code (inside event handlers and effects), not for values that should drive what gets rendered. If a value needs to be reflected in the UI, it belongs in state, not a ref.`,
  },
  {
    title: 'Custom Hooks',
    content: `A custom hook is just a regular JavaScript function whose name starts with \`use\` that calls other hooks internally — a way to extract and reuse stateful logic between components without duplicating it or reaching for a higher-order component or render-prop wrapper.

\`\`\`jsx
function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (debouncedQuery) searchApi(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
\`\`\`

Each component calling a custom hook gets its **own independent state** — \`useDebouncedValue\` doesn't share a single debounced value across every component using it; calling a hook is just calling a function that happens to internally call \`useState\`/\`useEffect\`, scoped to that particular component instance.

The "Rules of Hooks" (only call hooks at the top level, never inside conditionals/loops, and only from React functions) apply identically to custom hooks — they exist because React tracks hook state by **call order** across renders, not by name, so a hook called conditionally would shift every subsequent hook's slot and corrupt state on the next render.`,
  },
  {
    title: 'useReducer for Complex State Logic',
    content: `\`useReducer\` is an alternative to \`useState\` for state whose update logic is complex enough that scattering it across many \`setState\` calls becomes hard to follow — it centralizes all the ways state can change into one function, the **reducer**, which takes the current state and an **action** and returns the next state.

\`\`\`jsx
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset': return { count: 0 };
    default: throw new Error(\`Unknown action: \${action.type}\`);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
\`\`\`

This is the same fundamental pattern Redux popularized (pure function, given current state + an action, returns next state) — \`useReducer\` brings that pattern into a single component without pulling in an external library.

A useful interview signal: knowing *when* to reach for \`useReducer\` over several \`useState\` calls — when multiple pieces of state update together in response to the same event (so they should change atomically, not via several separate setter calls that could be split across renders), or when the next state depends on several pieces of the previous state in a way that's awkward to express with independent \`useState\` setters.`,
  },
  {
    title: 'React.memo and Avoiding Unnecessary Re-renders',
    content: `By default, when a parent component re-renders, every child re-renders too, regardless of whether that child's own props actually changed — usually cheap and unnoticeable, but it can matter in large lists or expensive subtrees. \`React.memo\` wraps a component so it skips re-rendering when its props are shallowly equal to the previous render's props.

\`\`\`jsx
const Row = React.memo(function Row({ item, onSelect }) {
  console.log('rendering row', item.id);
  return <li onClick={() => onSelect(item.id)}>{item.label}</li>;
});
\`\`\`

\`React.memo\` does a **shallow comparison** of props — this is exactly why a new inline function or object passed as a prop on every parent render (\`onSelect={() => handleSelect(item.id)}\`) defeats the memoization: each render creates a *new* function reference, which a shallow comparison considers "changed," even though the logic is identical. That's the practical link between \`React.memo\` and \`useCallback\`/\`useMemo\` — the parent needs to pass stable references for memoization to actually skip work downstream.

The interview-relevant judgment call: wrapping every component in \`React.memo\` "defensively" adds comparison overhead to every render without necessarily preventing anything, since most components are cheap enough that re-rendering them costs less than the comparison itself. It earns its keep specifically on components that are expensive to render and receive props that are genuinely stable across many parent re-renders — confirmed with the Profiler, not assumed.`,
  },
  {
    title: 'Code Splitting and Lazy Loading',
    content: `Code splitting breaks a JavaScript bundle into smaller chunks that load on demand, rather than shipping the entire application's code on the very first page load — directly improving initial load time for large apps. React supports this for components via \`React.lazy\` paired with \`Suspense\`.

\`\`\`jsx
const SettingsPage = React.lazy(() => import('./SettingsPage'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
\`\`\`

\`React.lazy\` takes a function that returns a dynamic \`import()\` — the bundler (webpack, Metro, Vite) recognizes that syntax and automatically splits the imported module into its own chunk, fetched over the network only when that component is actually about to render for the first time.

\`Suspense\` is the mechanism that displays a fallback UI while the lazy component's chunk is still loading, then swaps in the real component once it resolves — the same \`Suspense\` boundary can also wrap multiple lazy components, showing one fallback until all of them are ready.

A practical interview-relevant pattern: route-based code splitting (lazy-loading each top-level page/screen) is the highest-value place to start, since users only ever need the code for the route they're currently on — loading every screen's code upfront defeats much of the benefit code splitting offers in the first place.`,
  },
  {
    title: 'Error Boundaries',
    content: `An error boundary is a component that catches JavaScript errors thrown anywhere in its child component tree during rendering, logs them, and displays a fallback UI instead of letting the error crash the entire application. They must currently be class components — there is no hook equivalent — because they rely on the lifecycle methods \`static getDerivedStateFromError\` and \`componentDidCatch\`.

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

<ErrorBoundary>
  <ProfilePage />
</ErrorBoundary>
\`\`\`

A precise interview answer needs to name what error boundaries **don't** catch: errors inside event handlers, errors in asynchronous code (a \`setTimeout\` callback, a rejected promise), errors during server-side rendering, and errors thrown in the error boundary itself. Event handler errors need ordinary \`try/catch\`; async errors need their own handling at the call site — error boundaries are specifically for errors thrown during the render phase of the component tree beneath them.

Placing boundaries strategically (around a whole page versus around individual widgets) is itself a design decision: a single top-level boundary means one broken widget can blank the entire screen, while several smaller boundaries let the rest of the UI keep working when one specific section fails.`,
  },
  {
    title: 'Portals',
    content: `A portal renders a child component into a DOM node that exists outside the parent component's normal DOM hierarchy — while still participating in React's component tree for purposes like context and event bubbling. The canonical use case is anything that needs to visually escape its parent's layout constraints: modals, tooltips, and dropdown menus that must render above everything else, unclipped by a parent's \`overflow: hidden\` or stacking context.

\`\`\`jsx
function Modal({ children }) {
  return ReactDOM.createPortal(
    <div className="modal-overlay">{children}</div>,
    document.getElementById('modal-root'), // a separate DOM node, often a sibling of #root
  );
}
\`\`\`

Even though the rendered DOM node lives elsewhere in the document, events fired inside the portal still bubble up through the **React tree**, not the DOM tree — a click inside a modal rendered via a portal still triggers an \`onClick\` handler on a logical ancestor in the component tree, even though that ancestor isn't a DOM ancestor of the modal's actual rendered position.

The React Native equivalent of this DOM-escaping problem is typically solved differently — there's no portal API in the same sense, since there's no DOM; instead, libraries render overlay content into a separate native layer (e.g. a root-level \`Modal\` component) — worth knowing if asked to translate this web concept to a React Native context, as this app's codebase is.`,
  },
  {
    title: 'Concurrent Rendering and useTransition',
    content: `Concurrent rendering, introduced with React 18, lets React interrupt, pause, or abandon an in-progress render in favor of a more urgent update — for example, deprioritizing a slow list re-filter so that the user's keystroke in the search box itself keeps rendering instantly, rather than the input feeling blocked while the list catches up.

\`\`\`jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  function handleChange(e) {
    setQuery(e.target.value); // urgent — keeps the input feeling instant

    startTransition(() => {
      setResults(filterLargeDataset(e.target.value)); // can be deprioritized
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  );
}
\`\`\`

\`useTransition\` lets you mark a state update as **non-urgent** — React will still render it, but it can interrupt that render if something more urgent (like the next keystroke) comes in, instead of finishing the slow update first and making the UI feel laggy.

This is a nuanced, fairly advanced interview topic — the key distinguishing point from older optimization tricks like debouncing is that transitions don't delay *starting* the work, they let React abandon and restart in-progress rendering work when something more important interrupts it, which only matters for state updates that are expensive enough to actually block rendering in the first place.`,
  },
  {
    title: 'Server Components vs Client Components',
    content: `React Server Components (RSCs), used by frameworks like Next.js's App Router, run exclusively on the server and send their *rendered output* to the client rather than shipping their JavaScript to the browser at all — reducing the amount of code the client needs to download and execute, since server components never need to be hydrated or re-rendered client-side.

\`\`\`jsx
// A Server Component (default in Next.js App Router) — runs only on the server
async function ProductPage({ id }) {
  const product = await db.products.findById(id); // direct DB access, no API layer needed
  return <ProductDetails product={product} />;
}

// A Client Component — needs interactivity, so it's explicitly opted in
'use client';
function AddToCartButton({ productId }) {
  const [pending, setPending] = useState(false);
  return <button onClick={() => addToCart(productId)}>Add to cart</button>;
}
\`\`\`

The dividing line is **interactivity and browser APIs**: anything using \`useState\`, \`useEffect\`, event handlers, or browser-only APIs must be a Client Component (marked with \`'use client'\`); anything that's purely about fetching and displaying data, with no client-side state or interaction, is better as a Server Component, since it ships zero JavaScript for that piece of UI.

This is a framework-level (Next.js-specific) concept rather than core React API, but it's frequently asked about in modern React interviews — the key thing to convey is that it's not "old React vs new React," it's a deliberate split of responsibility: server components for data-fetching and static structure, client components for interactivity, composed together in the same tree.`,
  },
  {
    title: 'Testing React Components',
    content: `React Testing Library (RTL) is the dominant tool for testing React components, and its guiding philosophy is testing components the way a user actually interacts with them — querying by visible text, labels, and roles, rather than reaching into implementation details like component state or internal method calls.

\`\`\`jsx
import { render, screen, fireEvent } from '@testing-library/react';

test('increments the counter when clicked', () => {
  render(<Counter />);

  const button = screen.getByRole('button', { name: /clicked 0 times/i });
  fireEvent.click(button);

  expect(screen.getByText(/clicked 1 times/i)).toBeInTheDocument();
});
\`\`\`

This "test behavior, not implementation" philosophy is deliberate: a test that queries by CSS class name or pokes at internal state breaks the moment you refactor the component's internals, even if the user-visible behavior hasn't changed at all — RTL's queries are designed to break only when something a real user would actually notice has changed.

For React Native specifically, the same library exists as \`@testing-library/react-native\`, with equivalent queries adapted for native components (\`getByText\`, \`getByRole\`, \`fireEvent.press\` instead of \`fireEvent.click\`) — the same behavior-first philosophy applies, which is directly relevant to testing this app's screens and components rather than reaching for shallow rendering or snapshot tests of internal structure.`,
  },
  {
    title: 'Performance Profiling and the React DevTools Profiler',
    content: `Before reaching for \`useMemo\`, \`useCallback\`, or \`React.memo\`, the React DevTools **Profiler** is the tool that tells you whether a performance problem actually exists and exactly where — recording a session of renders and showing how long each component took, and *why* it re-rendered (which prop or state changed).

\`\`\`jsx
import { Profiler } from 'react';

<Profiler id="ProductList" onRender={(id, phase, actualDuration) => {
  console.log(\`\${id} (\${phase}) took \${actualDuration}ms\`);
}}>
  <ProductList products={products} />
</Profiler>
\`\`\`

The Profiler's "ranked" and "flamegraph" views make it possible to see exactly which component in a deep tree is the slow one — a far more reliable starting point than guessing which component "feels" slow and memoizing it speculatively, which can add overhead without fixing the actual bottleneck if the guess is wrong.

A strong interview answer frames performance work as a measurement-first discipline, not a checklist of optimization hooks applied everywhere: profile to find the actual slow component or expensive computation, confirm the fix measurably helps in the Profiler, and avoid memoizing components that re-render rarely or cheaply, since the bookkeeping itself has a small but real cost that isn't free for components that didn't need it.`,
  },
];

export function seedReactLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['react']);
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
