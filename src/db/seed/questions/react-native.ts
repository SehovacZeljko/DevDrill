import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedReactNativeQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['react-native']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'How does React Native differ from React?',
      answer: `React and React Native share the same component model, JSX syntax, and hooks API, but they target different rendering environments.

| | React (web) | React Native |
|---|---|---|
| Renders to | HTML DOM | Native views (UIKit / Android Views) |
| Layout | CSS (flexbox, block, grid) | Yoga flexbox only |
| Base components | div, span, input | View, Text, TextInput, Image |
| Styling | CSS / class names | StyleSheet API (JS objects) |
| Navigation | react-router, Next.js | react-navigation |

\`\`\`jsx
// React (web)
<div style={{ display: 'flex' }}>
  <span>Hello</span>
</div>

// React Native
<View style={{ flex: 1 }}>
  <Text>Hello</Text>
</View>
\`\`\`

React Native components compile to actual native UI elements, not a web view — this is what gives it near-native performance and look-and-feel. The business logic still runs in JavaScript on the Hermes engine.`,
      difficulty: 1,
      tags: 'react-native,differences,native',
    },
    {
      title: 'What was the old Bridge architecture and what replaced it?',
      answer: `The original React Native architecture used an asynchronous **Bridge** to communicate between the JavaScript thread and the Native thread. All data had to be serialized to JSON, passed over the bridge, and deserialized — creating a bottleneck for frequent interactions.

**Problems with the old bridge:**
- Async-only communication caused dropped frames during animations
- Large data transfers (e.g., long lists) could clog the bridge
- No direct memory sharing between JS and native

**New Architecture (JSI — JavaScript Interface):**
- JavaScript can hold direct references to C++ host objects
- Synchronous and asynchronous calls are both possible
- No JSON serialization overhead

New Architecture components:
- **JSI** — direct C++ ↔ JS communication
- **Fabric** — new renderer for the UI layer (synchronous layout)
- **TurboModules** — lazily-loaded native modules
- **Codegen** — type-safe bridge auto-generation from TypeScript specs

React Native 0.73+ ships with the new architecture available; 0.76+ enables it by default.`,
      difficulty: 3,
      tags: 'architecture,jsi,bridge',
    },
    {
      title: 'What is FlatList and why is it preferred over ScrollView for lists?',
      answer: `\`FlatList\` renders only the items currently visible on screen (plus a small buffer), recycling views as the user scrolls. \`ScrollView\` renders all its children at once.

\`\`\`jsx
<FlatList
  data={questions}
  keyExtractor={item => String(item.id)}
  renderItem={({ item }) => <QuestionCard question={item} />}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={5}
/>
\`\`\`

**FlatList performance knobs:**
- \`initialNumToRender\` — items rendered on first paint
- \`maxToRenderPerBatch\` — items added per scroll chunk
- \`windowSize\` — virtual window size (multiples of viewport height)
- \`getItemLayout\` — skip measurement for fixed-height items (big win)

Use \`ScrollView\` only for small, fixed-size content (settings screens, forms). For anything list-like with variable or unknown length, always use \`FlatList\` or \`SectionList\`.`,
      difficulty: 2,
      tags: 'flatlist,performance,scrollview',
    },
    {
      title: 'What is the difference between StyleSheet.create and inline styles?',
      answer: `\`StyleSheet.create\` registers styles with the native layer at module load time. On the old architecture, this sends style IDs (integers) over the bridge instead of JS objects on every render — a significant performance win. On the new architecture the difference is smaller, but \`StyleSheet.create\` still provides validation benefits.

\`\`\`jsx
// StyleSheet.create — preferred
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  text: { color: '#E8E8E8', fontSize: 16 },
});

function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
}

// Inline — new object on every render, no validation
<View style={{ flex: 1, backgroundColor: '#0F0F0F' }} />
\`\`\`

Additional benefits of \`StyleSheet.create\`:
- TypeScript type checking on style properties
- Dev-mode validation catches invalid property names
- Styles are co-located at the bottom of the file for readability

Use inline styles only for dynamic values that change per render (e.g., computed widths, animated colors).`,
      difficulty: 1,
      tags: 'stylesheet,performance,styles',
    },
    {
      title: 'What is the difference between Pressable and TouchableOpacity?',
      answer: `\`TouchableOpacity\` is an older component that reduces opacity on press. \`Pressable\` is the modern replacement (React Native 0.63+) with a richer, more flexible press detection API.

\`\`\`jsx
// TouchableOpacity — still works, simpler API
<TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
  <Text>Tap me</Text>
</TouchableOpacity>

// Pressable — preferred
<Pressable
  onPress={handlePress}
  onLongPress={handleLongPress}
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed, // dynamic style on press state
  ]}
  hitSlop={8} // extends touchable area beyond visual bounds
>
  {({ pressed }) => (
    <Text style={pressed ? styles.textPressed : styles.text}>
      Tap me
    </Text>
  )}
</Pressable>
\`\`\`

\`Pressable\` advantages:
- \`style\` and \`children\` can be functions receiving press state
- Configurable \`hitSlop\` and \`pressRetentionOffset\`
- Built-in \`onHoverIn\`/\`onHoverOut\` for web support
- No animation side effects — you control the feedback entirely`,
      difficulty: 1,
      tags: 'pressable,touchable,gestures',
    },
    {
      title: 'How does navigation work in React Native with react-navigation?',
      answer: `\`react-navigation\` is the standard navigation library. It provides stack, tab, and drawer navigators that manage a history stack and handle transitions, headers, and back gestures.

\`\`\`jsx
// RootNavigator.tsx
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Navigating
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
navigation.navigate('Detail', { itemId: 42 });

// Reading params
const { itemId } = useRoute<RouteProp<RootStackParamList, 'Detail'>>().params;
\`\`\`

\`createNativeStackNavigator\` uses native iOS (\`UINavigationController\`) and Android (\`Fragment\`) navigation primitives, giving platform-native transitions and performance. \`createStackNavigator\` is a JS-only fallback with more customization.`,
      difficulty: 2,
      tags: 'navigation,react-navigation,routing',
    },
    {
      title: 'What is Metro bundler and what does it do?',
      answer: `Metro is the JavaScript bundler developed by Meta for React Native. It transforms, resolves, and bundles JS and assets for the device.

**Key responsibilities:**
- **Resolution** — resolves \`import\`/\`require\` paths, including bare specifiers (node_modules) and platform extensions (\`.ios.ts\`, \`.android.ts\`)
- **Transformation** — transpiles TypeScript/Flow and modern JS via Babel
- **Serialization** — creates the final bundle (or serves it in dev via HTTP)
- **Incremental builds** — caches transformed modules; only rebuilds changed files

**Platform extensions:** Metro automatically picks the platform-specific file when both exist:
\`\`\`
Button.ios.tsx   ← used on iOS
Button.android.tsx ← used on Android
Button.tsx       ← fallback for both
\`\`\`

In development, Metro runs a local server (default port 8081) that the device/simulator connects to. Hot reloading sends module patches to the running app without a full restart. \`metro.config.js\` allows customizing resolvers, transformers, and serializers.`,
      difficulty: 2,
      tags: 'metro,bundler,build',
    },
    {
      title: 'How does flexbox in React Native differ from CSS flexbox?',
      answer: `React Native uses the Yoga layout engine, which implements a subset of CSS flexbox with some different defaults.

**Key differences:**

| Property | CSS default | React Native default |
|---|---|---|
| \`flexDirection\` | \`row\` | \`column\` |
| \`alignContent\` | \`stretch\` | \`flex-start\` |
| \`flexShrink\` | \`1\` | \`0\` |

\`\`\`jsx
// This centers content vertically AND horizontally
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  <Text>Centered</Text>
</View>

// flex: 1 means "take all available space" (like flex: 1 1 0% in CSS)
// In RN, flex only accepts a single number (no flex-grow/shrink/basis shorthand)
\`\`\`

**Not available in React Native:** \`float\`, \`display\` (only \`flex\` or \`none\`), \`position: fixed\`, CSS grid, CSS custom properties. All dimensions are density-independent pixels (dp), not CSS pixels.`,
      difficulty: 2,
      tags: 'flexbox,layout,yoga',
    },
    {
      title: 'How do you handle images in React Native?',
      answer: `React Native's \`Image\` component supports local assets, network images, and base64 data URIs.

\`\`\`jsx
// Local asset (bundled with the app)
<Image source={require('./assets/logo.png')} style={{ width: 100, height: 100 }} />

// Network image — must specify dimensions
<Image
  source={{ uri: 'https://example.com/photo.jpg' }}
  style={{ width: 300, height: 200 }}
  resizeMode="cover"
/>

// Provide multiple resolutions for local assets
// logo.png, logo@2x.png, logo@3x.png — Metro picks the right one
\`\`\`

**\`resizeMode\` options:** \`cover\`, \`contain\`, \`stretch\`, \`repeat\`, \`center\`.

For high-performance image loading with caching and placeholders, use \`react-native-fast-image\` — it replaces the built-in \`Image\` component and uses native cache (SDWebImage on iOS, Glide on Android).

Always provide explicit \`width\` and \`height\` for network images; React Native cannot infer dimensions from the network response at layout time.`,
      difficulty: 1,
      tags: 'images,assets,performance',
    },
    {
      title: 'What are the main performance pitfalls in React Native?',
      answer: `**1. JS thread overload** — heavy synchronous work (parsing, computation) blocks the JS thread, causing dropped frames. Move to \`InteractionManager.runAfterInteractions\` or a web worker via \`react-native-workers\`.

**2. Unnecessary re-renders** — wrap expensive components in \`React.memo\`, stabilize callbacks with \`useCallback\`, and memoize derived data with \`useMemo\`.

**3. FlatList not optimized** — provide \`keyExtractor\`, \`getItemLayout\` (for fixed-height rows), and keep \`renderItem\` referentially stable with \`useCallback\`.

**4. Inline styles** — create new objects every render, bypassing style caching. Use \`StyleSheet.create\`.

**5. Large images** — decode at display size, not original size. Use \`react-native-fast-image\` for network images.

**6. Overdraw / layout thrashing** — avoid deeply nested views; use \`View\` \`collapsable\` prop, flatten hierarchies.

\`\`\`jsx
// Profile with Flipper or the built-in Performance Monitor
// (Shake → Performance Monitor on device)

// For animations, always use Animated with useNativeDriver: true
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // runs on UI thread, never drops frames
}).start();
\`\`\``,
      difficulty: 3,
      tags: 'performance,optimization,profiling',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
