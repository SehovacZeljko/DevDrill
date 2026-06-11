import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedVueQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['vue']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'How does Vue\'s reactivity system work?',
      answer: `Vue 3's reactivity system uses ES Proxy to intercept property access and mutation on reactive objects. When a component reads a reactive property during rendering, Vue tracks the dependency. When the property changes, Vue schedules a re-render for all components that depend on it.

\`\`\`javascript
import { reactive, ref, watchEffect } from 'vue';

const state = reactive({ count: 0 });
const name = ref('Alice'); // ref wraps primitives in { value }

watchEffect(() => {
  // automatically tracks state.count and name.value
  console.log(\`\${name.value} clicked \${state.count} times\`);
});

state.count++; // triggers the watchEffect
name.value = 'Bob'; // also triggers it
\`\`\`

Vue 2 used \`Object.defineProperty\` which had limitations (couldn't detect new properties or array index mutations). Vue 3's Proxy-based system removes those limitations and is faster. Under the hood, \`reactive()\` creates a Proxy; \`ref()\` wraps the value in a Proxy'd object with a \`.value\` getter/setter.`,
      difficulty: 3,
      tags: 'reactivity,proxy,vue3',
    },
    {
      title: 'What is the difference between the Composition API and Options API?',
      answer: `**Options API** (Vue 2 style) organizes component code by option type — data, methods, computed, lifecycle hooks. Logic belonging to the same feature is split across multiple options.

**Composition API** (Vue 3) organizes code by logical concern. Related code lives together in \`setup()\` or \`<script setup>\`, making it easier to extract and reuse logic across components.

\`\`\`vue
<!-- Options API -->
<script>
export default {
  data() { return { count: 0 } },
  computed: { double() { return this.count * 2 } },
  methods: { increment() { this.count++ } },
}
</script>

<!-- Composition API (preferred in Vue 3) -->
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const double = computed(() => count.value * 2);
const increment = () => count.value++;
</script>
\`\`\`

The Composition API enables **composables** — reusable functions containing reactive state and logic, equivalent to React custom hooks. The Options API still works in Vue 3 and is not deprecated.`,
      difficulty: 2,
      tags: 'composition-api,options-api,vue3',
    },
    {
      title: 'What is the difference between computed properties and watch?',
      answer: `**Computed properties** are derived, cached values that update automatically when their reactive dependencies change. They should be pure — no side effects.

**Watch** is for running side effects in response to reactive changes (API calls, DOM manipulation, logging).

\`\`\`vue
<script setup>
import { ref, computed, watch, watchEffect } from 'vue';

const firstName = ref('Alice');
const lastName = ref('Smith');

// computed — cached, re-evaluates only when firstName or lastName changes
const fullName = computed(() => \`\${firstName.value} \${lastName.value}\`);

// watch — side effect when a specific source changes
watch(firstName, (newValue, oldValue) => {
  console.log(\`Name changed from \${oldValue} to \${newValue}\`);
  saveToServer(newValue); // side effect OK here
});

// watchEffect — runs immediately, auto-tracks dependencies
watchEffect(() => {
  document.title = fullName.value; // runs whenever fullName changes
});
</script>
\`\`\`

**Rule of thumb:** if you want a value derived from other values, use \`computed\`. If you want to perform an action when something changes, use \`watch\`.`,
      difficulty: 2,
      tags: 'computed,watch,reactivity',
    },
    {
      title: 'What are Vue lifecycle hooks?',
      answer: `Vue lifecycle hooks let you run code at specific stages of a component's life. In the Composition API they are prefixed with \`on\`.

\`\`\`vue
<script setup>
import {
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted,
} from 'vue';

onMounted(() => {
  // DOM is available — good place to fetch data, set up event listeners
  fetchData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // Cleanup before the component is destroyed
  window.removeEventListener('resize', handleResize);
});

onUpdated(() => {
  // Runs after every reactive update causes a re-render
  // Avoid modifying state here — causes infinite loops
});
</script>
\`\`\`

**Key hooks:** \`onMounted\` (DOM ready, fetch data), \`onUnmounted\` (cleanup subscriptions/timers), \`onUpdated\` (post-render inspection). The \`setup()\` function itself runs synchronously before \`onBeforeMount\` — use it for synchronous initialization.`,
      difficulty: 1,
      tags: 'lifecycle,hooks,vue',
    },
    {
      title: 'What are Vue directives and how do you create a custom one?',
      answer: `Directives are special attributes prefixed with \`v-\` that apply reactive transformations to DOM elements.

**Built-in directives:** \`v-bind\` (\`:\`), \`v-on\` (\`@\`), \`v-model\`, \`v-if\`, \`v-for\`, \`v-show\`, \`v-slot\`, \`v-html\`, \`v-text\`.

**Custom directive:**
\`\`\`javascript
// Global registration
app.directive('focus', {
  mounted(el) {
    el.focus(); // called when the element is inserted into the DOM
  },
});

// With modifiers and value
app.directive('tooltip', {
  mounted(el, binding) {
    el.title = binding.value;
    if (binding.modifiers.bottom) { /* position tooltip below */ }
  },
  updated(el, binding) {
    el.title = binding.value;
  },
});
\`\`\`

\`\`\`html
<input v-focus />
<span v-tooltip.bottom="'Click to save'">Save</span>
\`\`\`

Directive lifecycle hooks: \`beforeMount\`, \`mounted\`, \`beforeUpdate\`, \`updated\`, \`beforeUnmount\`, \`unmounted\`. The \`el\` argument is the native DOM element; \`binding.value\` is the directive's value.`,
      difficulty: 2,
      tags: 'directives,v-model,custom',
    },
    {
      title: 'What are slots in Vue and what is the difference between named and scoped slots?',
      answer: `Slots are Vue's content distribution mechanism — they let a parent component inject template content into a child component's layout.

**Default slot:**
\`\`\`vue
<!-- Card.vue -->
<template>
  <div class="card">
    <slot /> <!-- injected content goes here -->
  </div>
</template>

<!-- Usage -->
<Card><p>Hello!</p></Card>
\`\`\`

**Named slots** — multiple injection points:
\`\`\`vue
<template>
  <div class="layout">
    <slot name="header" />
    <slot /> <!-- default slot -->
    <slot name="footer" />
  </div>
</template>

<Layout>
  <template #header><h1>Title</h1></template>
  <p>Body content</p>
  <template #footer><small>Footer</small></template>
</Layout>
\`\`\`

**Scoped slots** — child exposes data back to the parent's template:
\`\`\`vue
<!-- DataTable.vue -->
<slot name="row" :item="item" :index="index" />

<!-- Parent uses the exposed data -->
<DataTable :items="users">
  <template #row="{ item, index }">
    <td>{{ index + 1 }}. {{ item.name }}</td>
  </template>
</DataTable>
\`\`\``,
      difficulty: 2,
      tags: 'slots,composition,templates',
    },
    {
      title: 'What is v-model and how does it work under the hood?',
      answer: `\`v-model\` is syntactic sugar for binding a value and listening to an update event. It creates a two-way binding between a parent prop and a form element or child component.

On native inputs, \`v-model\` expands to:
\`\`\`html
<!-- This: -->
<input v-model="text" />

<!-- Compiles to: -->
<input :value="text" @input="text = $event.target.value" />
\`\`\`

On components (Vue 3), it expands to:
\`\`\`html
<!-- This: -->
<MyInput v-model="username" />

<!-- Compiles to: -->
<MyInput :modelValue="username" @update:modelValue="username = $event" />
\`\`\`

**Implementing v-model in a component:**
\`\`\`vue
<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
\`\`\`

Vue 3.4+ introduces \`defineModel()\` macro which handles all of this automatically.`,
      difficulty: 2,
      tags: 'v-model,two-way-binding,forms',
    },
    {
      title: 'What are composables in Vue 3?',
      answer: `Composables are functions that encapsulate and reuse stateful reactive logic. They're the Vue 3 equivalent of React custom hooks.

\`\`\`javascript
// useMousePosition.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useMousePosition() {
  const x = ref(0);
  const y = ref(0);

  function update(event) {
    x.value = event.clientX;
    y.value = event.clientY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// In a component
<script setup>
import { useMousePosition } from './useMousePosition';
const { x, y } = useMousePosition();
</script>

<template>Mouse: {{ x }}, {{ y }}</template>
\`\`\`

Composables replace mixins (which had implicit dependencies and naming conflicts) and renderless components. They're composable — one composable can call others. Convention: prefix with \`use\` and place in a \`composables/\` directory.`,
      difficulty: 2,
      tags: 'composables,composition-api,reuse',
    },
    {
      title: 'What is Pinia and how does it differ from Vuex?',
      answer: `Pinia is the official Vue state management library (replacing Vuex as of Vue 3). It's simpler, has full TypeScript support, and works with the Composition API.

\`\`\`javascript
// stores/useAuthStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isLoggedIn = computed(() => !!user.value);

  async function login(credentials) {
    user.value = await authService.login(credentials);
  }

  function logout() {
    user.value = null;
  }

  return { user, isLoggedIn, login, logout };
});

// In a component
<script setup>
const auth = useAuthStore();
auth.login({ email, password });
</script>
\`\`\`

**Pinia vs Vuex:**
- No mutations — actions can directly modify state
- No namespacing boilerplate — each store is self-contained
- Full TypeScript inference without extra types
- DevTools and SSR support built-in
- Modular by default — no single root store

Pinia stores are plain functions; you can call one store inside another.`,
      difficulty: 2,
      tags: 'pinia,state-management,vuex',
    },
    {
      title: 'What is Vue Router and how do you use navigation guards?',
      answer: `Vue Router is the official routing library for Vue. It maps URL paths to components and supports nested routes, dynamic segments, lazy loading, and navigation guards.

\`\`\`javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'users', component: UserList },
        { path: 'users/:id', component: UserDetail, props: true },
      ],
    },
    {
      path: '/settings',
      component: () => import('./views/Settings.vue'), // lazy
    },
  ],
});

// Global guard — runs before every navigation
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } };
  }
});
\`\`\`

**Guard types:** \`beforeEach\` (global), \`beforeEnter\` (per-route), \`beforeRouteEnter/Leave\` (in-component). Return \`false\` to cancel navigation, return a route location to redirect.`,
      difficulty: 2,
      tags: 'vue-router,navigation-guards,routing',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
