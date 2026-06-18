import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What React Native Is and How It Renders to Native Views',
    content: `React Native lets you build mobile apps using React's component model and JavaScript, but instead of rendering to the DOM (as React does on the web), it renders to **actual native platform views** — a \`<View>\` becomes a real \`UIView\` on iOS or a real \`android.view.View\` on Android, not a webview wrapping HTML.

\`\`\`jsx
function Greeting() {
  return (
    <View style={{ padding: 16 }}>
      <Text>Hello, world!</Text>
    </View>
  );
}
\`\`\`

This is the central distinction from frameworks like Cordova/PhoneGap (which run a webview displaying actual HTML/CSS) or even most "hybrid" approaches — React Native apps feel native because the rendered UI genuinely *is* composed of native platform widgets, with native scrolling, native text rendering, and native gesture handling, while the application logic describing *what* to render is written in JavaScript and run on a separate JavaScript engine (historically JavaScriptCore; Hermes, an engine purpose-built for React Native, is now the default on most projects).

Historically, communication between the JavaScript side and the native side happened over an asynchronous, serialized **bridge** — JavaScript described UI changes as messages, batched and sent across the bridge to be applied natively. This architecture (still what most existing production apps run, including this one's underlying RN version unless explicitly migrated) works well for most apps, but introduces some inherent latency and serialization overhead for very high-frequency interactions (covered directly in the New Architecture advanced lesson, which replaces this bridge entirely).

The interview-relevant framing: React Native isn't "a web app in a native wrapper" — it's "your React component tree, rendered by real native UI components," which is exactly why performance characteristics, platform-specific behavior, and native API access all matter in ways that don't directly apply to web React, even though the component/JSX/hooks programming model is the same one this app's React lessons already cover.`,
  },
  {
    title: 'Core Components: View, Text, Image, and ScrollView',
    content: `React Native ships a small set of cross-platform primitive components that map directly to native UI building blocks — there's no HTML at all; every visual element is composed from these (and library-provided components built on top of them).

\`\`\`jsx
import { View, Text, Image, ScrollView } from 'react-native';

function ProfileCard() {
  return (
    <ScrollView>
      <View style={styles.card}>
        <Image source={{ uri: 'https://example.com/avatar.jpg' }} style={styles.avatar} />
        <Text style={styles.name}>Ada Lovelace</Text>
        <Text style={styles.bio}>Mathematician and writer.</Text>
      </View>
    </ScrollView>
  );
}
\`\`\`

\`View\` is the fundamental container — the equivalent of a \`<div>\`, but mapping to a real native view, supporting layout (via Flexbox, covered next) and styling, with no inherent visual appearance of its own. **All text must be wrapped in \`<Text>\`** — unlike the web, where raw text can appear directly inside any element, React Native requires text content to be inside a \`Text\` component, since native platforms render text through a distinct native text-rendering API rather than treating it as just another kind of view content.

\`Image\` requires either a \`source={{ uri: '...' }}\` for a remote/dynamic image or \`source={require('./local.png')}\` for a bundled local asset — and, notably, generally needs an **explicit width and height** (via style) to render at all for remote images, since React Native can't know a remote image's dimensions ahead of fetching it the way a browser's \`<img>\` tag's natural layout behavior might suggest.

\`ScrollView\` renders all of its children immediately, regardless of whether they're currently visible on screen — fine for a modest, bounded amount of content, but the wrong choice for a long or unbounded list, which is exactly the problem \`FlatList\` (covered in its own lesson) exists to solve by only rendering what's actually near the visible viewport.`,
  },
  {
    title: 'StyleSheet API and Flexbox Layout',
    content: `React Native has no CSS — styling is done with plain JavaScript objects, conventionally organized via \`StyleSheet.create()\`, and passed to a component's \`style\` prop. There's no cascading or inheritance the way CSS has; styles applied to a parent don't automatically apply to its children (with text-specific exceptions like \`color\`/\`fontSize\` inherited by nested \`<Text>\`).

\`\`\`jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

<View style={styles.container}>
  <View style={styles.row}>
    <Text>Left</Text>
    <Text>Right</Text>
  </View>
</View>
\`\`\`

\`StyleSheet.create()\` isn't strictly required (a plain object works identically at runtime) but is conventional because it allows React Native to validate styles once and reference them by an internal id rather than passing a fresh object on every render — a small but real performance benefit at scale, and the standard pattern this codebase already follows throughout its own components.

**Flexbox is the only layout system** — there's no grid, no absolute-positioning-as-a-default the way HTML/CSS has; every layout in React Native is built from nested \`View\`s using flex properties. One critical default differs from web CSS: \`flexDirection\` defaults to \`'column'\` in React Native (children stack vertically by default), versus \`'row'\` being CSS's flexbox default on the web — a frequent source of confusion for developers coming from web React who expect web flexbox's defaults to carry over directly.

\`\`\`jsx
// flex: 1 makes a child grow to fill available space along the main axis
<View style={{ flex: 1, flexDirection: 'row' }}>
  <View style={{ flex: 1, backgroundColor: 'red' }} />
  <View style={{ flex: 2, backgroundColor: 'blue' }} /> {/* takes twice the space of the red box */}
</View>
\`\`\`

The interview-relevant practical skill: being comfortable composing layouts purely from \`flexDirection\`, \`justifyContent\`, \`alignItems\`, and \`flex\` values on nested \`View\`s — since there's no fallback to absolute positioning, floats, or grid the way web layout sometimes reaches for those as an escape hatch.`,
  },
  {
    title: 'Handling Touch and Gestures: Pressable and TouchableOpacity',
    content: `React Native provides several components for making something tappable, since plain \`View\`/\`Text\` have no built-in press handling on their own. \`Pressable\` is the modern, recommended, most flexible option; \`TouchableOpacity\` and related \`Touchable*\` components are the older API, still extremely common in existing code (including this codebase's \`QuestionCard\` and \`CategoryCard\` components).

\`\`\`jsx
// TouchableOpacity — older API, dims opacity on press
<TouchableOpacity onPress={() => console.log('pressed')} activeOpacity={0.7}>
  <Text>Tap me</Text>
</TouchableOpacity>

// Pressable — newer, more flexible API
<Pressable
  onPress={() => console.log('pressed')}
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
>
  <Text>Tap me</Text>
</Pressable>
\`\`\`

\`Pressable\`'s style prop accepting a **function** of the current press state (shown above) is its key advantage over \`TouchableOpacity\` — it lets you express any visual press feedback (not just a fixed opacity change) directly through ordinary styles, and also exposes more granular callbacks (\`onPressIn\`, \`onPressOut\`, \`onLongPress\`) and configuration (\`delayLongPress\`, a custom \`hitSlop\` for expanding the tappable area beyond the visual bounds) in one consistent API.

\`hitSlop\` (available on both APIs) expands a component's tappable area without changing its visual size or layout — useful for small icons or buttons that are visually compact but should remain easy to tap reliably, a pattern this codebase already uses (the bookmark star icons use \`hitSlop\` to make their effective tap target larger than the visible glyph).

The interview-relevant practical guidance for new code: prefer \`Pressable\` going forward, since it's the actively maintained, more capable API — \`TouchableOpacity\` and its siblings (\`TouchableHighlight\`, \`TouchableWithoutFeedback\`) remain fully functional and extremely common in real codebases (this one included), but aren't where the React Native team is investing further capability, which is the same kind of "know both, default to the modern one for new code" judgment call as Angular's NgModules-versus-standalone-components distinction.`,
  },
  {
    title: 'Navigation in React Native: React Navigation Basics',
    content: `Unlike the web, where the browser provides built-in URL-based navigation, mobile apps need an explicit navigation library to manage screen transitions, back-button behavior, and the visual chrome (headers, tab bars) around each screen — **React Navigation** is the dominant library for this, and what this app's own \`RootNavigator.tsx\` is built on.

\`\`\`jsx
const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
\`\`\`

A **stack navigator** (used throughout this app) pushes new screens on top of a visual stack, with the platform's native back gesture/button popping the top screen off — each screen component receives a \`navigation\` prop (for triggering transitions: \`navigation.navigate('Detail', { id: 42 })\`) and a \`route\` prop (for reading the params the current screen was navigated to with: \`route.params.id\`), exactly the pattern this app's own \`FeedScreen\` and \`LessonDetailScreen\` already use.

Beyond stack navigators, React Navigation supports **tab navigators** (a persistent bottom or top tab bar switching between sibling screens, each potentially with its own stack) and **drawer navigators** (a slide-out side menu) — composable together, since a tab navigator's individual tabs can each contain their own stack navigator, a common real-world pattern for apps with several independent top-level sections.

The interview-relevant detail worth knowing: navigating with \`navigation.navigate('ScreenName')\` to a screen already on the stack (versus \`navigation.push\`, which always adds a new instance) behaves differently depending on whether that screen is already present — \`navigate\` will jump back to an existing instance of that screen rather than stacking a duplicate, which occasionally produces "why didn't my new params take effect" confusion if a developer expected a fresh screen instance instead of being routed back to an existing one.`,
  },
  {
    title: 'Lists: FlatList and Performance',
    content: `\`FlatList\` is React Native's component for rendering long or unbounded lists efficiently — unlike \`ScrollView\` (which renders every child immediately, regardless of visibility), \`FlatList\` only renders items near the current viewport, recycling and unmounting off-screen items as the user scrolls, which is essential for lists that could contain hundreds or thousands of items.

\`\`\`jsx
<FlatList
  data={questions}
  keyExtractor={item => String(item.id)}
  renderItem={({ item }) => <QuestionCard question={item} onReveal={handleReveal} onBookmarkToggle={onBookmarkToggle} />}
  onEndReached={loadNextPage}
  onEndReachedThreshold={0.4}
  ListEmptyComponent={EmptyState}
/>
\`\`\`

This exact API — \`data\`, \`renderItem\`, \`keyExtractor\`, \`onEndReached\` for infinite scroll pagination — is precisely how this app's own \`FeedScreen\` and \`LessonListScreen\` are built, and \`keyExtractor\` plays the identical role to the \`key\` prop in plain React's list rendering (covered in the React lessons): without a stable, unique key per item, \`FlatList\`'s internal recycling can mismatch state (scroll position, focus) to the wrong row exactly the way a missing/unstable React \`key\` causes the same class of bug on the web.

\`renderItem\` receives an object (\`{ item, index, separators }\`) rather than just the raw item — a detail easy to get wrong when first switching from plain \`.map()\` rendering, since destructuring \`{ item }\` (as shown above) rather than using the whole object directly is required to access the actual data.

For most apps' list sizes, \`FlatList\`'s defaults are sufficient — the deeper performance tuning props (\`getItemLayout\`, \`windowSize\`, \`maxToRenderPerBatch\`) matter specifically for very large or complex-item lists and are covered in the advanced Performance Optimization in Lists lesson; the interview-relevant first-pass knowledge is simply recognizing that \`FlatList\` (not \`ScrollView\`, not a plain \`.map()\` inside a \`View\`) is the correct default choice any time a list's length isn't small and bounded.`,
  },
  {
    title: 'Platform-Specific Code',
    content: `Despite React Native's "write once" pitch, some behavior genuinely needs to differ between iOS and Android — different platform conventions, different native APIs, different visual idioms (iOS's typical bottom-sheet modals versus Android's Material Design patterns, for instance). React Native provides a few mechanisms for branching on platform explicitly.

\`\`\`jsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // different default status bar heights
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 }, // Android uses a distinct shadow/elevation system
    }),
  },
});
\`\`\`

\`Platform.OS\` is a simple string check (\`'ios'\` or \`'android'\`); \`Platform.select()\` is a more structured way to pick an entire value (often a style object, as shown) based on platform, including an optional \`default\` key for any platform not explicitly listed.

For larger platform-specific implementations — not just a few conditional style properties, but genuinely different component logic or native module usage — React Native's bundler also supports **platform-specific file extensions**: \`Button.ios.tsx\` and \`Button.android.tsx\` are both automatically resolved by a plain \`import Button from './Button'\`, with the bundler picking the correct file for the platform being built, with no \`Platform.OS\` branching needed inside the component at all.

The interview-relevant judgment call: reach for \`Platform.select\`/\`Platform.OS\` for small, localized differences (a status bar height offset, a shadow-versus-elevation style difference); reach for separate \`.ios.tsx\`/\`.android.tsx\` files when the divergence is substantial enough that maintaining one shared component with many scattered platform branches would hurt readability more than two clearly-separated, platform-specific implementations would.`,
  },
  {
    title: 'Working with Images and Assets',
    content: `React Native distinguishes between **local, bundled assets** (images shipped inside the app itself) and **remote images** (fetched over the network at runtime), and the \`Image\` component's \`source\` prop is used differently for each.

\`\`\`jsx
<Image source={require('./assets/logo.png')} style={{ width: 100, height: 40 }} />

<Image
  source={{ uri: 'https://example.com/avatar.jpg' }}
  style={{ width: 64, height: 64 }}
/>
\`\`\`

\`require('./assets/logo.png')\` is resolved at **build time** — the bundler statically analyzes the require call, includes the asset in the compiled app bundle, and automatically picks the correct resolution variant if you provide \`@2x\`/\`@3x\` suffixed files alongside the base image (\`logo.png\`, \`logo@2x.png\`, \`logo@3x.png\`), matching the convention iOS/Android use for serving the right pixel density for a given device's screen — this is why \`require\`'s argument must be a static string literal, not a dynamically constructed path; the bundler can't resolve a runtime-computed asset path at build time.

Remote images (\`{ uri: '...' }\`) require an explicit \`width\`/\`height\` in style, as covered in the Core Components lesson, since React Native has no way to know a remote image's natural dimensions before it's fetched — omitting an explicit size typically renders nothing visible at all, a common early debugging confusion for developers used to the web's \`<img>\` sizing itself naturally to the loaded image's intrinsic dimensions.

The interview-relevant practical knowledge: bundled local assets are the right choice for icons, logos, and other static UI imagery that ships with the app (faster, no network dependency, works offline); remote images are necessary for genuinely dynamic, user-generated, or frequently-changing content (a user's uploaded avatar, product photos from an API) — and a thorough implementation handles the loading and error states a remote image fetch can produce (\`onLoadStart\`, \`onError\`), which a bundled local asset never needs to worry about.`,
  },
  {
    title: 'Forms and the Keyboard in React Native',
    content: `\`TextInput\` is React Native's text entry component — conceptually the same controlled-input pattern from the React lessons (value driven by state, updated via a callback), but with mobile-specific keyboard behavior and configuration that has no web equivalent.

\`\`\`jsx
function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <TextInput
      value={email}
      onChangeText={setEmail}              // NOT onChange — receives the string directly
      keyboardType="email-address"          // shows an @ key, optimized layout for email entry
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="next"
      placeholder="Email"
    />
  );
}
\`\`\`

The interview-relevant first gotcha: \`TextInput\` uses \`onChangeText\`, which receives the new string value directly as its argument — not \`onChange\` with an event object whose \`.target.value\` you'd extract on the web, a small but very commonly tripped-over API difference for developers moving between React web and React Native.

A genuinely mobile-specific challenge with no web equivalent: the on-screen keyboard can cover input fields near the bottom of the screen, and the OS doesn't automatically resize/scroll the layout to compensate the way a desktop browser never needs to worry about an on-screen keyboard at all. \`KeyboardAvoidingView\` wraps a screen's content and automatically adjusts (via padding, position, or height, configurable per platform) to keep focused inputs visible above the keyboard.

\`\`\`jsx
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
  <TextInput ... />
</KeyboardAvoidingView>
\`\`\`

\`Keyboard.dismiss()\` programmatically hides the keyboard (often wired to a "Done" button or a tap outside the input), and the \`Keyboard\` module's event listeners (\`keyboardDidShow\`/\`keyboardDidHide\`) let a component react to the keyboard's visibility changing — both worth knowing exist, since "the keyboard covers my input" and "I need to dismiss the keyboard on submit" are two of the most common early React Native form-handling issues a new mobile developer runs into that simply don't arise on the web.`,
  },
  {
    title: 'AsyncStorage and Local Persistence',
    content: `\`AsyncStorage\` (now shipped as the separate \`@react-native-async-storage/async-storage\` package, having been extracted from React Native core) provides simple, asynchronous, persistent key-value storage on the device — the mobile equivalent of the browser's \`localStorage\`, but asynchronous (every operation returns a Promise) since the underlying storage is a real file/database write, not an in-memory synchronous browser API.

\`\`\`jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

async function saveLastViewedCategory(categoryId: number) {
  await AsyncStorage.setItem('lastCategory', JSON.stringify(categoryId));
}

async function getLastViewedCategory(): Promise<number | null> {
  const value = await AsyncStorage.getItem('lastCategory');
  return value ? JSON.parse(value) : null;
}
\`\`\`

Every value stored is a **string** — storing structured data (an object, a number, an array) requires explicit \`JSON.stringify\`/\`JSON.parse\` on the way in and out, exactly as shown above; there's no automatic serialization the way some higher-level storage wrappers provide.

\`AsyncStorage\` is appropriate for small amounts of simple, persistent app state — user preferences, a remembered "last viewed" position, feature-flag-style toggles, an auth token. It is explicitly **not** designed for large datasets or anything resembling structured, queryable relational data — this app's own architecture is the clearest illustration of that boundary: CLAUDE.md's "SQLite is the source of truth" rule exists precisely because this app's actual content (questions, lessons, progress records) needs real querying, joins, and indexing that a flat key-value store like \`AsyncStorage\` was never designed to provide, which is why \`react-native-quick-sqlite\` — not \`AsyncStorage\` — is this app's persistence layer.

The interview-relevant judgment call: \`AsyncStorage\` for small, simple, unstructured key-value data; a real embedded database (SQLite via a library, or alternatives like Realm/WatermelonDB) for anything involving meaningful structure, relationships, or query patterns beyond "fetch this one value by its key."`,
  },
  {
    title: 'Permissions and Native APIs',
    content: `Accessing device hardware or sensitive data — camera, location, contacts, push notification registration, photo library — requires the user's **explicit permission**, requested at runtime (not just declared in a manifest file, though manifest declarations are also required as the first step on each platform) and the OS prompts the user with its own native permission dialog the app doesn't control the appearance of.

\`\`\`jsx
import { PermissionsAndroid, Platform } from 'react-native';

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS permission prompts are typically triggered automatically by the API call itself
}
\`\`\`

Permission handling differs meaningfully by platform: Android requires an explicit \`PermissionsAndroid.request()\` call before using a protected API, while iOS often triggers its permission prompt **automatically** the first time the relevant native API is actually called (the manifest equivalent — an \`Info.plist\` entry with a user-facing explanation string — is required on iOS regardless, and the prompt simply appears the first time, for example, \`react-native-geolocation\`'s location-fetching function is invoked).

A user who **denies** a permission doesn't get asked again automatically on iOS — the app must detect the denial and, if the feature is genuinely needed, direct the user to the system Settings app to manually re-enable it, since there's no programmatic way to re-trigger a previously-denied permission prompt. This is a frequently-overlooked real-world edge case: an app that only handles the "granted" and "first-time prompt" cases, with no fallback messaging or settings-deep-link for the "previously denied" case, leaves users with no path forward if they initially declined by mistake.

The interview-relevant principle, broader than any one specific permission API: native device capabilities are gated behind explicit user consent by design, on both platforms, and a complete implementation handles all three states — not yet asked, granted, and denied — rather than only the happy path of "the user said yes."`,
  },
  {
    title: 'Debugging React Native Apps',
    content: `React Native's debugging tooling spans both the JavaScript layer (the same kind of debugging as any React app) and the native layer (since real native code and native crashes exist underneath the JavaScript), and knowing which tool addresses which kind of problem matters for diagnosing issues efficiently.

\`\`\`bash
npx react-native log-ios       # stream native iOS device/simulator logs
npx react-native log-android   # stream native Android device/emulator logs (logcat)
\`\`\`

**React DevTools** (the same browser extension/standalone app used for web React) connects to a running React Native app and shows the component tree, props, and state — exactly the same tool and mental model as debugging web React, since the underlying React reconciliation and component model is identical regardless of what it's rendering to.

**Flipper** (and its successor tooling integrated into React Native's own dev tools in newer versions) provides a broader native-aware debugging surface: inspecting native layout/view hierarchy (not just the React component tree), network request monitoring, and AsyncStorage/database inspection — useful specifically for issues that live at the boundary between JavaScript and native code, which React DevTools alone can't see into.

\`console.log\` statements appear in the Metro bundler's terminal output during development (and this app's own \`useFeed\`/\`useProgress\` hooks already use this for basic tracing) — simple and immediate, though for anything beyond quick, throwaway tracing, the structured tools above (DevTools for component state, Flipper-style tools for native-boundary issues, platform log streams for native crashes) give far more targeted insight than scrolling through console output.

The interview-relevant triage skill: a bug confined to component logic/state/rendering is a React DevTools problem; a bug involving a native module, a crash with no JavaScript stack trace, or unexpected native view behavior is a native-log/Flipper-style problem — correctly routing to the right tool first saves significant time versus debugging native-layer issues by adding more \`console.log\` calls to JavaScript code that was never the actual source of the problem.`,
  },
  {
    title: 'App Lifecycle and AppState',
    content: `Unlike a website, where "the page is open" is essentially the only lifecycle state that matters, a mobile app has several distinct states the OS actively manages — **active** (in the foreground, visible, receiving touch input), **background** (not visible, but the process may still be running, briefly or for an extended period depending on the platform and what the app is doing), and **inactive**/terminated (the OS has fully stopped or killed the process, often to reclaim memory for other apps).

\`\`\`jsx
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', nextState => {
    if (nextState === 'active') {
      console.log('App returned to the foreground — good time to refresh data');
    } else if (nextState === 'background') {
      console.log('App moved to background — good time to pause expensive work, save state');
    }
  });

  return () => subscription.remove(); // cleanup, same pattern as any other subscription-based effect
}, []);
\`\`\`

\`AppState\` is the API for observing these transitions — a common real use case: pausing a video or polling interval when the app backgrounds (continuing to run expensive work while the user can't even see the screen wastes battery and resources for no benefit), and refreshing potentially-stale data when the app returns to the foreground after being backgrounded for a while (the user may have been away long enough that server-side data has changed, or local data needs re-validating).

A subtlety worth knowing: on iOS, an app moved to the background isn't necessarily fully suspended immediately — it may continue running briefly (and certain background modes, like audio playback or location tracking, can keep it running for extended periods with the right entitlements) before the OS fully suspends or eventually terminates it to reclaim memory; Android's process lifecycle has its own similarly nuanced set of states (and is, in practice, generally more willing to kill backgrounded apps to reclaim memory than iOS tends to be).

The interview-relevant connection to this app's own architecture: any app design relying on "the user will definitely complete this flow without the app ever backgrounding" is fragile on mobile in a way it simply isn't on the web — which is part of why this app's own pattern of writing progress to SQLite immediately on each interaction (rather than batching writes and flushing only on some explicit "save" action) is the safer default, since a backgrounded-then-killed app shouldn't lose in-progress state that was never actually persisted.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'The New Architecture: Fabric, TurboModules, and JSI',
    content: `React Native's "New Architecture" replaces the legacy asynchronous bridge (covered in the fundamentals "what React Native is" lesson) with a fundamentally different communication mechanism between JavaScript and native code, aimed at reducing latency and enabling capabilities the old bridge architecture couldn't support well.

**JSI (JavaScript Interface)** is the foundational piece — it allows JavaScript objects to hold **direct references to native C++ objects** and call methods on them synchronously, without serializing data into JSON-like messages and passing them across an asynchronous bridge queue. This is the core architectural shift: communication becomes direct function calls rather than message-passing.

\`\`\`text
Old (Bridge) architecture:
  JS  --[serialize, async message]-->  Bridge queue  --[deserialize]-->  Native
  (every native call: serialize, queue, async round-trip)

New Architecture (JSI):
  JS  <-->  direct synchronous calls via C++ host objects  <-->  Native
  (no serialization or async bridge queue needed for most calls)
\`\`\`

**Fabric** is the New Architecture's rendering system, replacing the old UIManager — it allows synchronous layout measurement and more efficient view updates, and is a prerequisite for certain advanced UI capabilities (synchronous, jank-free interactions tightly coupled to native gesture state, for instance) that were difficult or impossible to achieve reliably through the old asynchronous bridge.

**TurboModules** replace the old Native Modules system (covered in its own lesson) — native modules built as TurboModules are loaded lazily (only when actually used, improving startup time) and communicate via JSI's direct calls rather than the bridge's serialized messages, removing both the serialization overhead and a class of bugs caused by asynchronous bridge timing.

The interview-relevant practical framing: this is largely an **internal architectural change** that most app-level React Native code doesn't need to interact with directly — existing components and APIs continue working, often with measurable performance improvements "for free" once an app is migrated. The detail worth being able to name and explain at a high level: JSI's synchronous, direct-reference communication model is the root cause of essentially every other improvement (Fabric's synchronous layout, TurboModules' lazy loading and reduced overhead) — understanding that one underlying change makes the rest of the New Architecture's improvements make sense as consequences of it, rather than a list of unrelated features.`,
  },
  {
    title: 'Native Modules: Bridging Native Code',
    content: `A native module exposes native platform code (Swift/Objective-C on iOS, Kotlin/Java on Android) to JavaScript — necessary whenever a capability isn't available through React Native's core API or an existing third-party library, and custom native code must be written to access it.

\`\`\`swift
// iOS — Swift, exposed via the legacy bridge module system
@objc(DeviceInfoModule)
class DeviceInfoModule: NSObject {
  @objc
  func getBatteryLevel(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(UIDevice.current.batteryLevel)
  }
}
\`\`\`

\`\`\`typescript
// JavaScript side — calling the native module
import { NativeModules } from 'react-native';
const { DeviceInfoModule } = NativeModules;

const batteryLevel = await DeviceInfoModule.getBatteryLevel();
\`\`\`

Most apps never need to write a native module directly — the React Native ecosystem has mature, well-maintained libraries (camera access, biometric authentication, push notifications, secure storage) that already wrap the relevant native APIs behind a clean JavaScript interface, and reaching for an existing, well-tested library is almost always preferable to writing and maintaining custom native code, which introduces real maintenance burden (it must be kept compiling against new OS versions, tested on real devices, and understood by anyone who needs to modify it later).

Writing a native module becomes necessary specifically when: the required native capability has no existing, well-maintained library wrapping it; the app needs extremely fine-grained control over a native API that existing libraries don't expose; or there's a genuine, measured performance reason to bypass a library's abstraction and call the native API more directly.

The interview-relevant practical default, especially relevant for a project like this one (CLAUDE.md explicitly notes this app has no native module needs currently): always check for an established, actively-maintained library before considering a custom native module — and if a custom module genuinely is needed, recognize that maintaining native Swift/Kotlin code alongside the JavaScript codebase is a meaningfully larger ongoing commitment (build toolchain knowledge, platform API version tracking, native debugging skills) than typical React Native feature work, and should be a deliberate decision, not a default reach.`,
  },
  {
    title: 'Performance Optimization in Lists',
    content: `Beyond \`FlatList\`'s default windowing behavior (covered in the fundamentals lesson), several tuning props and patterns matter specifically for large or complex-item lists where the defaults aren't sufficient.

\`\`\`jsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => String(item.id)}
  getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
  windowSize={5}
  maxToRenderPerBatch={10}
  initialNumToRender={10}
  removeClippedSubviews
/>
\`\`\`

\`getItemLayout\` tells \`FlatList\` the exact size and position of every item **upfront**, without needing to actually render and measure them first — this is the single highest-impact optimization for lists with fixed-height items, since it lets \`FlatList\` jump directly to any scroll position (useful for \`scrollToIndex\`) and skip a measurement pass entirely; it's only usable when every item's size is known ahead of time (fixed height, or computable from the data without rendering).

\`windowSize\` controls how many "screens" worth of content are kept rendered above and below the visible viewport (as a multiplier of the viewport's own height) — a larger window means smoother scrolling through more pre-rendered content, at the cost of more memory and more components mounted at once; a smaller window reduces memory usage but risks a visible blank flash if the user scrolls faster than new items can render in time.

\`maxToRenderPerBatch\` and \`initialNumToRender\` control how many items render per batch and on first mount respectively — tuning these down can make the *initial* render of a list feel faster (less work before anything is visible), at the cost of needing more subsequent batches to fill in the rest of the window as the user starts scrolling.

The interview-relevant principle tying these together: every one of these props trades memory/render-work for scroll smoothness, or vice versa — there's no universally "more optimized" setting, only the right balance for a specific list's item complexity, typical scroll speed, and target device's available memory, which is why the practical advice is always "start with FlatList's defaults, profile with the actual content and a representative low-end target device, and only reach for these specific props once a measured, real scrolling-performance problem justifies the added complexity and the maintenance cost of getting the tuning right."`,
  },
  {
    title: 'Animations: the Animated API and Reanimated',
    content: `React Native's built-in \`Animated\` API drives animations by interpolating a value over time and mapping it onto style properties — this app's own \`QuestionCard\` component already uses it for the answer-reveal fade-in.

\`\`\`jsx
const opacity = useRef(new Animated.Value(0)).current;

Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // run the animation on the native side, not the JS thread
}).start();

<Animated.View style={{ opacity }}>...</Animated.View>
\`\`\`

\`useNativeDriver: true\` is a critical performance detail: without it, the animation's frame-by-frame value updates are computed on the JavaScript thread and sent across the bridge on every frame — if the JS thread is busy with anything else (a re-render, a network response being processed), frames can be dropped, producing visible jank. With it, the animation's interpolation runs entirely on the native side once started, independent of whatever the JS thread happens to be doing, for genuinely smooth 60fps animation even under JS-thread load — at the cost of only being able to animate a limited set of properties this way (transform and opacity are well-supported; layout properties like \`width\`/\`height\` generally are not, since those require triggering native layout recalculation that can't be safely offloaded the same way).

**Reanimated** (a third-party library, now broadly considered close to a de facto standard for any non-trivial animation work) goes further — animation logic itself (not just the final interpolated values) runs on a separate, dedicated UI thread via "worklets," enabling complex, gesture-driven animations that respond instantly to touch input without ever needing a round-trip to the JS thread at all, even for the *logic* deciding what the next frame's values should be.

\`\`\`jsx
const offset = useSharedValue(0);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));
\`\`\`

The interview-relevant judgment call: \`Animated\` with \`useNativeDriver: true\` is sufficient for most simple transitions (fades, simple transforms, the kind of reveal animation this app already uses) — Reanimated earns its added complexity and learning curve specifically for gesture-driven, highly interactive animations (drag-to-dismiss, swipeable cards, scroll-linked parallax effects) where the animation's *behavior*, not just its final values, needs to react instantly to continuous touch input.`,
  },
  {
    title: 'Gesture Handling with react-native-gesture-handler',
    content: `React Native's built-in touch handling (\`Pressable\`, the \`PanResponder\` API) is adequate for simple taps, but \`react-native-gesture-handler\` is the standard library for anything more sophisticated — swipes, pinch-to-zoom, pan gestures, and especially gestures that need to interact correctly with native scroll views and other gesture-recognizing components without conflicting.

\`\`\`jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

function SwipeableCard() {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate(event => { translateX.value = event.translationX; })
    .onEnd(() => { translateX.value = 0; }); // snap back, or trigger a dismiss action

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>...</Animated.View>
    </GestureDetector>
  );
}
\`\`\`

The library is frequently paired with Reanimated (as shown) specifically so the gesture's continuous updates can drive animated values entirely on the native/UI thread, with no per-frame round-trip to JavaScript — the same motivation covered in the Animations lesson, extended to gesture *input* rather than just animation *output*.

A core capability this library provides that the built-in \`PanResponder\` handles poorly: **gesture composition and conflict resolution** — deciding which gesture "wins" when multiple recognizers could plausibly claim the same touch (a horizontal swipe-to-dismiss gesture living inside a vertically-scrolling list needs to correctly let vertical scrolls pass through to the list while still capturing horizontal swipes for itself) — \`Gesture.Pan().activeOffsetX([...])\` and similar configuration options exist specifically to express these "only activate this gesture once movement clearly indicates the user's intent" rules.

The interview-relevant practical guidance: built-in \`Pressable\`/\`PanResponder\` for simple taps and basic single-direction drags; \`react-native-gesture-handler\` (typically combined with Reanimated) once a gesture needs to coexist correctly with scrolling, recognize multiple simultaneous gesture types, or feel genuinely native in its responsiveness — swipeable list rows, bottom sheets, and card-stack interfaces are the canonical real-world use cases that consistently require it.`,
  },
  {
    title: 'Deep Linking and Universal Links',
    content: `Deep linking lets a URL open the app directly to a specific screen, rather than just launching it to its default entry point — essential for notification taps, shared links, and marketing campaigns that need to land a user on a specific piece of content rather than forcing them to navigate there manually after opening the app.

\`\`\`jsx
// React Navigation's linking configuration maps URL patterns to screens/params
const linking = {
  prefixes: ['devdrill://', 'https://devdrill.app'],
  config: {
    screens: {
      LessonDetail: 'lessons/:lessonId',
      Feed: 'category/:categoryId',
    },
  },
};

<NavigationContainer linking={linking}>...</NavigationContainer>
\`\`\`

A custom URL scheme (\`devdrill://lessons/42\`) is the simplest form — registered in the app's native configuration (\`Info.plist\` on iOS, the manifest on Android), it works immediately but has a real limitation: if the app isn't installed, the link simply fails with no fallback, since the OS has no app registered to handle that scheme at all.

**Universal Links** (iOS) and **App Links** (Android) solve that gap by using ordinary \`https://\` URLs that the OS recognizes as belonging to your app (verified via a file hosted on your own domain, proving you control both the app and that domain) — tapping such a link opens the app directly if installed, or falls back gracefully to a normal web page (which can itself prompt to install the app) if it isn't, since the link is a real, always-valid web URL regardless of whether the app happens to be installed on that particular device.

The interview-relevant tradeoff: custom URL schemes are simpler to set up but provide a poor experience when the app isn't installed (the link just fails silently); Universal/App Links require additional setup (domain verification, hosting a specific verification file) but degrade gracefully, which is why they're the recommended approach for any link meant to be shared externally (notifications, marketing, shared content) rather than only used for in-app or internal-testing purposes where the app's presence can be assumed.`,
  },
  {
    title: 'Push Notifications',
    content: `Push notifications let an app alert a user even when it isn't currently open, delivered through each platform's own notification service — Apple Push Notification service (APNs) on iOS, Firebase Cloud Messaging (FCM) on Android — rather than any direct connection between your backend and the device.

\`\`\`text
Your server  -->  APNs / FCM (platform's push service)  -->  Device  -->  App (foreground/background/killed)
\`\`\`

The general flow: the app requests notification permission and registers with the platform's push service, receiving a unique **device token** identifying that specific app installation; your backend sends that token along with the notification payload to APNs/FCM, which handles the actual delivery to the device — your server never talks to the device directly, and has no guarantee of *when* a notification arrives, since the OS controls delivery timing (and can delay or batch notifications under certain conditions, like Low Power Mode).

\`\`\`jsx
import messaging from '@react-native-firebase/messaging';

async function registerForPushNotifications() {
  const authStatus = await messaging().requestPermission();
  if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    const token = await messaging().getToken();
    await sendTokenToBackend(token); // your server needs this to target this specific device
  }
}
\`\`\`

A notification's handling differs depending on the app's current state when it arrives: **foreground** notifications typically need to be displayed manually by the app itself (the OS doesn't automatically show a banner for an app the user is actively looking at, by default); **background** notifications are displayed by the OS automatically, and tapping one can deep-link into a specific screen (combining directly with the deep linking lesson — a notification payload commonly includes the same kind of URL/route data a deep link would); a notification arriving while the app is fully **killed** requires the app to register a specific background handler that runs even without the main app process being alive.

The interview-relevant practical reality worth naming explicitly: push notification delivery has no hard guarantee of timing or even eventual delivery (the platform's push service can drop notifications under various conditions — device offline for too long, payload exceeding size limits, rate limiting) — any feature relying on a push notification for genuinely critical, time-sensitive information needs a fallback (an in-app check on next open, a backend-side retry/escalation) rather than treating push delivery as guaranteed.`,
  },
  {
    title: 'Over-the-Air Updates',
    content: `Native app updates normally require a full app store review and user-initiated download — over-the-air (OTA) update systems (CodePush, historically; Expo's EAS Update is the modern, actively maintained equivalent) let you push **JavaScript and asset** changes directly to already-installed apps without going through app store review at all, since the JavaScript bundle can be downloaded and swapped in by the app itself at runtime.

\`\`\`text
Native code change (new native module, updated native dependency):
  -> requires a full app store build + review + user download — OTA cannot help here

JavaScript-only change (a bug fix in a screen's logic, a copy/content change, a style tweak):
  -> CAN be shipped via OTA — no app store review needed, often live within minutes
\`\`\`

This is the critical boundary to understand: OTA updates can only ship changes to the **JavaScript bundle** (and bundled JS-accessible assets) — they cannot update native code, add a new native dependency, or change anything requiring a native rebuild, since the underlying compiled native app binary itself isn't being replaced, only the JavaScript it loads and executes at runtime.

OTA updates are genuinely valuable for shipping urgent bug fixes without waiting for app store review (which can take anywhere from hours to days depending on platform and current review queue conditions) and for quickly iterating on JavaScript-only features without a full release cycle — but both Apple's and Google's app store guidelines place restrictions on what kinds of changes are acceptable to ship this way (changes that meaningfully alter the app's fundamental purpose or circumvent review entirely are generally not permitted, even if technically deliverable), and apps should be configured with a sensible fallback/rollback mechanism in case a pushed update introduces a bug, since a bad OTA update reaches users immediately, with no app-store-review safety net having caught it first.

The interview-relevant framing for "would you use CodePush/EAS Update for this app?": it's the right tool specifically for fast-iterating JavaScript-only fixes and content changes between full releases — not a replacement for the normal app store release process, and not usable at all for any change requiring native code modification.`,
  },
  {
    title: 'Testing React Native Apps',
    content: `React Native testing spans the same layers as the broader React testing landscape (unit tests for isolated logic, component tests for rendered behavior) plus an additional, mobile-specific layer: end-to-end tests that drive the actual compiled app on a real simulator/emulator or device.

\`\`\`jsx
// @testing-library/react-native — same behavior-first philosophy as web RTL
import { render, fireEvent, screen } from '@testing-library/react-native';

test('reveals the answer when tapped', () => {
  render(<QuestionCard question={mockQuestion} onReveal={jest.fn()} onBookmarkToggle={jest.fn()} />);

  fireEvent.press(screen.getByText('Tap to reveal answer'));

  expect(screen.getByText(mockQuestion.answer_markdown)).toBeTruthy();
});
\`\`\`

This component-level testing (covered briefly in the React advanced lessons too) verifies a component's rendered output and behavior in response to simulated interaction (\`fireEvent.press\`, the React Native equivalent of \`fireEvent.click\` on the web) — fast, runs in a Node.js test environment with no real device/simulator needed, and is the appropriate layer for testing most component logic, exactly the same testing philosophy and tradeoffs as web React component testing.

**Detox** and **Maestro** are the two leading end-to-end testing tools specifically for React Native, driving the actual compiled app on a real simulator/emulator (or physical device) — clicking real buttons, scrolling real lists, asserting on real rendered native UI — catching the class of bug that purely JavaScript-level component tests structurally cannot: native module integration issues, real navigation transitions, actual platform-specific rendering differences, and genuine end-to-end user flows spanning multiple screens.

\`\`\`yaml
# Maestro flow — a YAML-based end-to-end test description
appId: com.example.devdrill
---
- launchApp
- tapOn: "Lessons"
- tapOn: "Laravel"
- assertVisible: "Fundamentals"
\`\`\`

The interview-relevant testing-pyramid framing for mobile: many fast, isolated component/unit tests (Jest + Testing Library) form the broad base, with a smaller number of slower, more expensive but higher-confidence end-to-end tests (Detox/Maestro) reserved for critical user flows — mirroring the same "many fast unit tests, fewer slow end-to-end tests" pyramid shape used in web testing strategy, just with platform-specific tooling at the end-to-end layer to account for testing real native behavior, not just a browser DOM.`,
  },
  {
    title: 'App Size and Bundle Optimization',
    content: `App download size directly affects install conversion rates (users abandon downloads more readily as size grows, especially on constrained mobile data) and is influenced by several distinct factors worth understanding individually rather than treating "app size" as one undifferentiated number to reduce.

The **JavaScript bundle** itself can be reduced through standard web-style techniques that carry over directly: removing unused dependencies, enabling tree-shaking where the bundler supports it, and using Hermes (React Native's purpose-built JS engine, the default on most modern projects) — Hermes precompiles JavaScript to bytecode at build time rather than shipping raw JS source for parsing on-device at startup, reducing both app size and startup time simultaneously.

\`\`\`text
Image assets are frequently the largest contributor to overall app size —
shipping every @1x/@2x/@3x density variant of every image, in an uncompressed
format, for both platforms, adds up fast across a real app's full asset library.
\`\`\`

**Native dependencies** (third-party native libraries) each add their own compiled native code to the final binary — auditing which native libraries are actually still in use, and removing ones pulled in for a feature that was since removed or never shipped, is a frequently-overlooked but real source of avoidable size bloat over an app's lifetime.

Platform-specific build configuration also matters significantly: enabling **Android App Bundles** (\`.aab\`, versus a universal \`.apk\`) lets Google Play serve each device only the resources/native code for its actual CPU architecture and screen density, rather than bundling every variant into one file every user downloads regardless of their specific device — a substantial real-world size reduction with no code changes required, purely a build/distribution configuration change.

The interview-relevant framing for "how would you reduce this app's size?": treat it as several genuinely separate problems (JS bundle size, image/asset size, native dependency footprint, build/distribution configuration) rather than one undifferentiated target — each has its own specific tooling and tradeoffs, and the highest-leverage fix depends entirely on profiling which of those categories is actually contributing the most to a *specific* app's current size, rather than applying generic advice uniformly.`,
  },
  {
    title: 'Handling Different Screen Sizes and Safe Areas',
    content: `Mobile devices span a wide range of physical screen sizes, aspect ratios, and — critically — have non-rectangular "unsafe" regions (the iPhone's notch/Dynamic Island, the home indicator bar, Android's status bar and various cutout/punch-hole camera designs) that content needs to avoid overlapping, or risk being visually obscured or awkwardly cropped.

\`\`\`jsx
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

function Screen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Text>Content respects the safe area on every device</Text>
    </View>
  );
}
\`\`\`

\`react-native-safe-area-context\` is the standard library for this — \`useSafeAreaInsets()\` returns the exact inset values (top/bottom/left/right) needed to avoid a given device's specific unsafe regions, computed dynamically per-device rather than hardcoded, since a notch's exact size (or its complete absence on older or different devices) varies and hardcoding any specific value would be wrong on a meaningful fraction of real devices.

Beyond safe areas specifically, **responsive layout** across wildly different screen sizes (a small phone versus a large tablet) generally favors Flexbox's proportional, content-driven sizing (\`flex: 1\`, percentage-based widths) over fixed pixel dimensions wherever reasonably possible — exactly the same principle as responsive web design, just without media queries as the primary mechanism; React Native instead typically reaches for the \`Dimensions\`/\`useWindowDimensions\` API to read the current screen size and conditionally adjust layout for genuinely different size classes (a tablet rendering a two-column layout that a phone renders as a single column, for instance).

The interview-relevant practical default for this codebase specifically (per its own CLAUDE.md minimum targets, iOS 15+/Android API 26+): always test layouts against at least one device with a notch/Dynamic Island (most current iPhones) and one without, plus both a small phone and a large phone/tablet form factor if device support extends that far — safe-area and screen-size bugs are easy to miss entirely if development and testing only ever happens on one specific simulator/device, since the visual problems they cause often simply don't manifest on that one device's specific dimensions and safe-area insets.`,
  },
  {
    title: 'Publishing to App Stores',
    content: `Shipping a React Native app to real users requires building a signed, optimized release binary for each platform and submitting it through that platform's distinct review and publishing process — a meaningfully different (and slower, more involved) process than deploying a web app.

\`\`\`bash
# iOS — typically built and archived through Xcode, then uploaded via Transporter or
# command-line tooling, requiring an active Apple Developer Program membership and
# code-signing certificates/provisioning profiles configured correctly
npx react-native build-ios --mode Release

# Android — produces a signed release artifact (.aab is now the required format
# for new Google Play submissions, replacing the older universal .apk)
cd android && ./gradlew bundleRelease
\`\`\`

**Code signing** is required on both platforms — every release build must be cryptographically signed with a certificate/key proving the app's identity and authenticity, and losing access to the original signing key/keystore can be a serious problem for future updates (Android, in particular, generally requires every update to a published app to be signed with the same key the original submission used, though Google Play App Signing can manage this on your behalf to reduce that risk).

**App review** differs meaningfully between platforms: Apple's App Store review is a manual (though partially automated) human review process that can take anywhere from hours to several days, and can reject submissions for reasons ranging from technical guideline violations to more subjective design/content judgment calls; Google Play's review is generally faster and more automated, though it has tightened over time and can still flag and delay submissions for policy violations.

Beyond the binary itself, a real submission requires store listing assets (screenshots across required device sizes, an app description, a privacy policy URL — increasingly mandatory given both platforms' privacy-disclosure requirements around any data collection, even minimal analytics) and, for apps requesting sensitive permissions, clear justification text explaining why each permission is needed.

The interview-relevant practical takeaway for someone newer to mobile: budget meaningfully more lead time for a mobile release than a typical web deploy — review time is outside your control, certificate/provisioning issues are a common first-time stumbling block worth getting comfortable with well before a real deadline, and (tying back to the OTA Updates lesson) understanding *which* fixes can ship instantly via an OTA update versus which genuinely require going through this full native build-and-review cycle again is itself a practically valuable piece of release-planning knowledge.`,
  },
];

export function seedReactNativeLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['react-native']);
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
