import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What Angular Is and Its Architecture',
    content: `Angular is a full-featured, opinionated front-end framework maintained by Google, built entirely in TypeScript. Unlike libraries that only handle rendering, Angular ships with routing, forms, HTTP, dependency injection, and a CLI all as first-party, integrated parts of the framework — the goal is fewer architectural decisions left up to each team, with a consistent shape across Angular codebases.

An Angular application is a tree of **components**, each pairing a TypeScript class (logic and state) with an HTML template (view) and optional CSS (style), composed together to build the UI.

\`\`\`typescript
@Component({
  selector: 'app-greeting',
  template: '<h1>Hello, {{ name }}!</h1>',
})
export class GreetingComponent {
  name = 'World';
}
\`\`\`

Angular's defining architectural commitment — relative to React or Vue — is being a complete, batteries-included framework rather than a rendering library you compose with separate routing/state/HTTP libraries. This tradeoff means more structure and consistency out of the box, at the cost of more concepts to learn upfront (modules, decorators, dependency injection, RxJS) before writing your first real feature.

A strong interview answer distinguishes Angular from "just a templating library": its dependency injection system and RxJS-based reactivity are core architectural pillars, not optional add-ons — most non-trivial Angular code touches both.`,
  },
  {
    title: 'TypeScript and Angular CLI',
    content: `Angular is written in and designed around TypeScript — every Angular API ships with full type definitions, and the framework's decorators (\`@Component\`, \`@Injectable\`, \`@Input\`) rely on TypeScript's metadata and class syntax to work.

\`\`\`typescript
interface User {
  id: number;
  name: string;
}

@Component({ selector: 'app-user', template: '...' })
export class UserComponent {
  @Input() user!: User; // non-null assertion: set by Angular before use
}
\`\`\`

The Angular CLI (\`ng\`) is the standard way to create, build, and scaffold an Angular app, and is treated as part of the framework rather than an optional convenience:

\`\`\`bash
ng new my-app
ng generate component user-profile   # or: ng g c user-profile
ng generate service user             # or: ng g s user
ng serve                              # dev server with live reload
ng build --configuration production
ng test                               # runs unit tests via Karma/Jest
\`\`\`

A practical interview point: the CLI's generators don't just save typing — they enforce Angular's conventions (file naming, folder structure, boilerplate decorators) consistently across a team, which is part of why Angular codebases tend to look recognizably similar to each other across companies, more so than typical React codebases where structure is a team-by-team choice.`,
  },
  {
    title: 'Components and Templates',
    content: `A component is the fundamental building block of an Angular UI: a TypeScript class decorated with \`@Component\`, which declares a CSS selector, an HTML template (inline or in a separate file), and optional styles.

\`\`\`typescript
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product!: { name: string; price: number };
}
\`\`\`

\`\`\`html
<!-- product-card.component.html -->
<div class="card">
  <h3>{{ product.name }}</h3>
  <p>\${{ product.price.toFixed(2) }}</p>
</div>
\`\`\`

Components compose into a tree by using each other's selectors as custom HTML elements directly in a template — \`<app-product-card [product]="item"></app-product-card>\` — the same composition principle as nesting function components in React, expressed through HTML-like tags instead of JSX function calls.

The interview-relevant nuance is Angular's separation of template and logic into genuinely separate files (by convention, though inline templates are valid) — this was a deliberate design choice for tooling support (HTML/CSS syntax highlighting, dedicated template type-checking) and for keeping markup readable without JSX's embedded-JavaScript-in-markup style.`,
  },
  {
    title: 'Data Binding: Interpolation, Property, Event, and Two-Way',
    content: `Angular templates support several distinct binding syntaxes, each serving a different direction of data flow between the component class and the DOM.

\`\`\`html
<!-- Interpolation: component property -> text content -->
<h1>{{ title }}</h1>

<!-- Property binding: component property -> DOM/element property -->
<img [src]="imageUrl" [alt]="imageAlt" />

<!-- Event binding: DOM event -> component method -->
<button (click)="onSave()">Save</button>

<!-- Two-way binding: combines property + event binding -->
<input [(ngModel)]="username" />
\`\`\`

\`[(ngModel)]\` is syntactic sugar — under the hood it's exactly \`[ngModel]="username" (ngModelChange)="username = $event"\` combined, which is worth knowing because it demystifies "two-way binding" as just bound property + bound event rather than a separate, special mechanism.

A frequent interview distinction: \`{{ }}\` interpolation and \`[property]\` binding both read from the component into the view, but interpolation always produces a string (coercing the bound value), while property binding can pass any type directly — which is why binding a boolean to \`[disabled]\` uses property binding (\`[disabled]="isLoading"\`), not interpolation, since interpolating a boolean would produce the literal string \`"true"\`/\`"false"\` rather than actually toggling the attribute.`,
  },
  {
    title: 'Directives: Structural and Attribute',
    content: `Directives are classes that attach behavior to DOM elements. Angular distinguishes two practical categories: **structural directives**, which add or remove elements from the DOM entirely (prefixed with \`*\`), and **attribute directives**, which change the appearance or behavior of an existing element without adding/removing it.

\`\`\`html
<!-- Structural directives -->
<div *ngIf="isLoggedIn">Welcome back!</div>
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>

<!-- Attribute directives -->
<div [ngClass]="{ active: isActive, disabled: isDisabled }">...</div>
<div [ngStyle]="{ color: textColor }">...</div>
\`\`\`

Modern Angular (v17+) introduces a new, more efficient **control flow syntax** as a built-in alternative to \`*ngIf\`/\`*ngFor\`, compiled directly rather than relying on the structural directive mechanism:

\`\`\`html
@if (isLoggedIn) {
  <p>Welcome back!</p>
} @else {
  <p>Please log in.</p>
}

@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
\`\`\`

The interview-relevant detail about \`*ngFor\`'s \`trackBy\` (or the new \`@for\`'s mandatory \`track\` expression) mirrors React's \`key\` prop exactly — without a stable tracking identity, Angular's change detection may destroy and recreate DOM nodes unnecessarily on reorders instead of reusing and patching them, causing the same kind of "stuck state" bugs (focus, scroll position) that missing React keys cause.`,
  },
  {
    title: 'Pipes',
    content: `Pipes transform a value for display directly inside a template, using a simple \`|\` syntax — a clean alternative to calling a formatting function from the component class every time a value needs to be displayed differently than it's stored.

\`\`\`html
<p>{{ price | currency:'USD' }}</p>
<p>{{ createdAt | date:'medium' }}</p>
<p>{{ description | uppercase }}</p>
<p>{{ items | slice:0:5 }}</p>
\`\`\`

Pipes can be chained, and accept arguments after a colon, as shown above. Writing a **custom pipe** is a single decorated class implementing a \`transform\` method:

\`\`\`typescript
@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50): string {
    return value.length > limit ? value.slice(0, limit) + '...' : value;
  }
}
\`\`\`

\`\`\`html
<p>{{ post.body | truncate:100 }}</p>
\`\`\`

The interview-relevant distinction is **pure vs impure pipes**. By default, pipes are pure — Angular only re-runs them when the bound input reference changes, which is efficient but means a pipe that depends on something *outside* its declared input (the current time, a mutated array's contents without a new array reference) won't update automatically. Marking a pipe \`pure: false\` makes it re-evaluate on every change detection cycle, which is more correct for those cases but considerably more expensive, since it runs far more often.`,
  },
  {
    title: 'Services and Dependency Injection',
    content: `A service is a plain TypeScript class, typically decorated with \`@Injectable\`, that encapsulates logic or data not tied to a specific view — API calls, shared state, business logic — making it reusable across many components without duplicating that logic in each one.

\`\`\`typescript
@Injectable({ providedIn: 'root' }) // a single shared instance app-wide
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number) {
    return this.http.get<User>(\`/api/users/\${id}\`);
  }
}

@Component({ selector: 'app-profile', template: '...' })
export class ProfileComponent {
  constructor(private userService: UserService) {} // injected automatically
}
\`\`\`

Angular's dependency injection (DI) container resolves \`UserService\` automatically when it sees the constructor parameter type — the component never calls \`new UserService()\` itself, exactly the same inversion-of-control principle as Laravel's service container or constructor injection in any DI framework.

\`providedIn: 'root'\` registers the service as a singleton at the application root, so every component injecting \`UserService\` shares the exact same instance and its internal state — useful for things like a shared cache or an in-memory session, but worth being deliberate about, since unintentionally sharing mutable state across unrelated components through a singleton service is a common source of subtle bugs.`,
  },
  {
    title: 'Modules (NgModules) and Standalone Components',
    content: `Historically, every Angular component, directive, and pipe had to be declared inside an \`NgModule\` — a class decorated with \`@NgModule\` that groups related pieces together and declares what's imported from elsewhere and exported for other modules to use.

\`\`\`typescript
@NgModule({
  declarations: [ProfileComponent, AvatarComponent],
  imports: [CommonModule, RouterModule],
  exports: [ProfileComponent],
})
export class ProfileModule {}
\`\`\`

Modern Angular (v17+) defaults to **standalone components**, which eliminate the NgModule requirement entirely — a component declares its own dependencies directly via an \`imports\` array on the \`@Component\` decorator itself.

\`\`\`typescript
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '...',
})
export class ProfileComponent {}
\`\`\`

The interview-relevant context: standalone components are now the default for new Angular projects and significantly reduce the boilerplate and indirection NgModules required for simple cases, but NgModules remain fully supported and common in existing codebases — recognizing both patterns, and understanding *why* Angular moved toward standalone (simpler mental model, less ceremony for small/medium apps), is more valuable than memorizing NgModule decorator options.`,
  },
  {
    title: 'Component Lifecycle Hooks',
    content: `Angular components go through a well-defined lifecycle, and you hook into specific points by implementing interfaces with corresponding methods — \`ngOnInit\`, \`ngOnChanges\`, \`ngOnDestroy\`, among others.

\`\`\`typescript
@Component({ selector: 'app-timer', template: '{{ seconds }}' })
export class TimerComponent implements OnInit, OnDestroy {
  seconds = 0;
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.intervalId = setInterval(() => this.seconds++, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId); // cleanup, mirrors a useEffect cleanup function
  }
}
\`\`\`

\`ngOnInit\` runs once, after Angular has set the component's initial \`@Input\` bindings — this is why initialization logic that depends on inputs belongs in \`ngOnInit\`, not the constructor, since inputs aren't guaranteed to be set yet when the constructor runs. \`ngOnChanges\` fires whenever a bound \`@Input\` value changes, receiving a \`SimpleChanges\` object describing the previous and current values. \`ngOnDestroy\` is the cleanup hook, called just before Angular removes the component — the correct place to unsubscribe from observables, clear intervals, and remove manually-added event listeners.

A common interview question is "constructor vs ngOnInit" — the constructor is for dependency injection only (declaring what the class needs); \`ngOnInit\` is for the component's actual initialization logic, once Angular has finished wiring everything up.`,
  },
  {
    title: 'Routing Basics',
    content: `Angular's Router maps URL paths to components, enabling single-page-application navigation without full page reloads. Routes are configured as an array of path-to-component mappings.

\`\`\`typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }, // wildcard, catches unmatched routes
];
\`\`\`

\`\`\`html
<!-- In a template -->
<a routerLink="/products/42">View product</a>
<router-outlet></router-outlet> <!-- matched component renders here -->
\`\`\`

\`\`\`typescript
// Reading a route parameter inside a component
constructor(private route: ActivatedRoute) {
  this.route.paramMap.subscribe(params => {
    this.productId = params.get('id');
  });
}
\`\`\`

Route parameters are exposed as an **Observable** (\`paramMap\`) rather than a plain value, because the same component instance can be reused across navigations to different parameter values (navigating from \`/products/1\` to \`/products/2\` doesn't necessarily destroy and recreate \`ProductDetailComponent\`) — subscribing is what lets the component react to a parameter changing without a full re-render of the route, which is a frequently misunderstood detail in interviews: forgetting this means a component that only reads the parameter once (in \`ngOnInit\`, ignoring future emissions) silently breaks when navigating between two routes matching the same component.`,
  },
  {
    title: 'Forms: Template-Driven vs Reactive',
    content: `Angular supports two distinct approaches to building forms. **Template-driven forms** use directives (\`ngModel\`, \`ngForm\`) directly in the template, with most of the form's structure implicit in the markup — simpler for small forms.

\`\`\`html
<form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm.value)">
  <input name="email" ngModel required email />
  <button type="submit" [disabled]="loginForm.invalid">Log in</button>
</form>
\`\`\`

**Reactive forms** define the form's structure explicitly in the component class as a tree of \`FormControl\`/\`FormGroup\` objects, giving you direct, synchronous, type-safe access to validation state and values without relying on template directives to manage it.

\`\`\`typescript
loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', Validators.required),
});

onSubmit() {
  if (this.loginForm.valid) {
    this.auth.login(this.loginForm.value);
  }
}
\`\`\`

\`\`\`html
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="email" />
  <input formControlName="password" type="password" />
</form>
\`\`\`

The interview-relevant guidance: reactive forms are generally preferred for anything beyond the simplest form, since the form's state lives in testable, synchronous TypeScript rather than being implicitly derived from template directive state — easier to unit test, easier to add dynamic fields to, and easier to compose custom validators against.`,
  },
  {
    title: 'HTTP Client and Observables',
    content: `Angular's \`HttpClient\` service makes HTTP requests and returns **Observables** (from RxJS) rather than Promises — a deliberate choice that gives you cancellation, retry, and composition operators that Promises don't support natively.

\`\`\`typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }
}

// In a component
this.productService.getProducts().subscribe(products => {
  this.products = products;
});
\`\`\`

Crucially, an \`HttpClient\` Observable does nothing until something **subscribes** to it — calling \`getProducts()\` alone does not send the HTTP request; only \`.subscribe()\` triggers it. This trips up developers coming from Promise-based fetch APIs, where calling the function immediately starts the network call.

\`\`\`html
<!-- The async pipe subscribes automatically and unsubscribes on destroy -->
<div *ngFor="let product of products$ | async">{{ product.name }}</div>
\`\`\`

The \`async\` pipe is the idiomatic way to consume an Observable directly in a template — it subscribes when the template renders and automatically unsubscribes when the component is destroyed, eliminating an entire category of manual-unsubscribe memory leak bugs that come from forgetting to call \`.unsubscribe()\` in \`ngOnDestroy\`.`,
  },
  {
    title: 'Component Communication: @Input and @Output',
    content: `\`@Input\` and \`@Output\` are how parent and child components communicate — the same one-directional data flow principle as React props and callback props, expressed through decorators instead of JSX attributes.

\`\`\`typescript
@Component({ selector: 'app-rating', template: '...' })
export class RatingComponent {
  @Input() value = 0;                              // parent -> child
  @Output() valueChange = new EventEmitter<number>(); // child -> parent

  setRating(stars: number) {
    this.value = stars;
    this.valueChange.emit(stars); // notify the parent of the change
  }
}
\`\`\`

\`\`\`html
<!-- Parent template -->
<app-rating [value]="productRating" (valueChange)="onRatingChanged($event)"></app-rating>
\`\`\`

This \`[input]\`/\`(output)\` pairing is exactly what \`[(ngModel)]\` two-way binding sugar is built on — if you name an output \`xChange\` to match an input named \`x\`, Angular lets you combine them into \`[(x)]\` banana-in-a-box syntax for your own custom components too, not just \`ngModel\`.

A common interview question is how to communicate between components that **aren't** in a direct parent-child relationship — siblings, or distant ancestors/descendants. The answer is the same as Angular's general DI-based pattern: a shared service (often with a \`BehaviorSubject\` to hold the current value reactively) injected into both components, rather than @Input/@Output chains relayed manually through every intermediate level.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'RxJS and Reactive Programming in Angular',
    content: `RxJS (Reactive Extensions for JavaScript) is the library Angular builds much of its async API surface on — Observables represent a stream of values over time, and RxJS provides operators to transform, filter, and combine those streams declaratively.

\`\`\`typescript
this.searchInput$
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.api.search(query)), // cancels the previous in-flight request
  )
  .subscribe(results => (this.results = results));
\`\`\`

\`switchMap\` is the operator most interview questions probe — it maps each emitted value to a new Observable (here, an HTTP call) and automatically **unsubscribes from the previous inner Observable** when a new value arrives, which is exactly the right behavior for a search-as-you-type box: if the user types again before the previous request resolves, that stale request's result is discarded rather than racing with the new one and potentially overwriting fresher results.

Other operators worth being able to explain on demand: \`mergeMap\` (runs all inner Observables concurrently, doesn't cancel), \`concatMap\` (runs them strictly in sequence, one at a time), and \`combineLatest\` (emits whenever any of several source Observables emits, combining their latest values).

The interview-relevant mental model shift from Promises: an Observable can emit zero, one, or many values over time and can be cancelled mid-stream; a Promise resolves exactly once and can't be cancelled — which is precisely why Angular's \`HttpClient\`, reactive forms, and router all use Observables, where cancellation (a user navigating away mid-request) and incremental values (a form's value changing many times) are first-class concerns.`,
  },
  {
    title: 'Change Detection and OnPush',
    content: `Angular's default change detection strategy checks every component in the tree on every detected event (a click, an HTTP response, a timer) — walking the whole tree and comparing each template binding's current value to its previous one, updating the DOM wherever they differ. This is simple to reason about but can become a performance bottleneck in large component trees, since even components whose data hasn't changed still get checked.

\`\`\`typescript
@Component({
  selector: 'app-product-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '...',
})
export class ProductRowComponent {
  @Input() product!: Product;
}
\`\`\`

With \`OnPush\`, Angular skips checking a component unless one of its \`@Input\` bindings receives a **new reference** (not just a mutated property of the same object), an event originates from within that component's own template, or the component is explicitly marked for check (\`ChangeDetectorRef.markForCheck()\`).

This is the Angular equivalent of \`React.memo\`'s shallow comparison, and shares the exact same pitfall: mutating an array or object in place (\`this.products.push(newProduct)\`) and passing the *same reference* down as an \`@Input\` means an \`OnPush\` child never notices the change, since the reference didn't change — the fix is the same immutable-update discipline React encourages (\`this.products = [...this.products, newProduct]\`), which is why \`OnPush\` performance work and immutable data patterns go hand in hand in Angular, just as they do in React.`,
  },
  {
    title: 'Dependency Injection Hierarchy and Providers',
    content: `Angular's DI system is hierarchical — services can be provided at the root (app-wide singleton), at a specific NgModule, or at an individual component, and where a service is provided determines the scope and lifetime of the instance(s) created.

\`\`\`typescript
@Injectable({ providedIn: 'root' }) // one instance, shared by the whole app
export class AuthService {}

@Component({
  selector: 'app-shopping-cart',
  providers: [CartService], // a fresh instance, scoped to this component subtree
  template: '...',
})
export class ShoppingCartComponent {}
\`\`\`

Providing a service at a component level (rather than root) means every instance of that component (and its descendants) gets its **own** instance of the service, rather than sharing one app-wide instance — useful when state genuinely needs to be scoped per-feature, like a multi-step wizard's in-progress form state that shouldn't leak between two open instances of the same wizard component.

Angular also supports **injection tokens** for providing values that aren't classes (configuration objects, primitive values, or to support multiple interchangeable implementations behind one interface) — \`new InjectionToken<AppConfig>('APP_CONFIG')\` paired with \`{ provide: APP_CONFIG, useValue: {...} }\`. This is the same swappable-implementation pattern as Laravel's container \`bind()\` calls: code depends on an abstract token, and what's actually injected is decided by configuration, making it trivial to substitute a fake/mock implementation in tests.`,
  },
  {
    title: 'Custom Directives and Structural Directives',
    content: `Beyond the built-in directives, Angular lets you write your own — an **attribute directive** modifies the host element's appearance or behavior, while a **structural directive** controls whether and how the element (and its content) appears in the DOM at all.

\`\`\`typescript
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
\`\`\`

A custom structural directive uses \`TemplateRef\` and \`ViewContainerRef\` to conditionally insert/remove the templated content — this is exactly the mechanism \`*ngIf\` itself is built on internally:

\`\`\`typescript
@Directive({ selector: '[appUnless]' })
export class UnlessDirective {
  constructor(private templateRef: TemplateRef<unknown>, private vcr: ViewContainerRef) {}

  @Input() set appUnless(condition: boolean) {
    this.vcr.clear();
    if (!condition) this.vcr.createEmbeddedView(this.templateRef);
  }
}
\`\`\`

The interview-relevant insight: \`*ngIf\` isn't special-cased framework magic — it's an ordinary structural directive using the exact \`TemplateRef\`/\`ViewContainerRef\` APIs available to your own custom directives, which is a useful thing to be able to articulate when asked "how does \`*ngIf\` actually work under the hood?"`,
  },
  {
    title: 'Content Projection and ng-content',
    content: `Content projection lets a component accept and render arbitrary markup passed in by its parent — the Angular equivalent of React's \`children\` prop, but with the ability to project into multiple distinct named slots, not just one.

\`\`\`typescript
@Component({
  selector: 'app-card',
  template: \`
    <div class="card">
      <header><ng-content select="[card-title]"></ng-content></header>
      <div class="body"><ng-content></ng-content></div>
    </div>
  \`,
})
export class CardComponent {}
\`\`\`

\`\`\`html
<app-card>
  <h2 card-title>Order Summary</h2>
  <p>Your order will arrive in 3-5 business days.</p>
</app-card>
\`\`\`

The unlabeled \`<ng-content></ng-content>\` catches anything not matched by a more specific \`select\` slot, mirroring how a single \`{children}\` works in React — but the \`select\` attribute lets a single component expose several distinct projection points (a title slot, a footer slot, a default body) where React typically needs separate named props (\`title\`, \`footer\`) each holding a piece of JSX instead.

A practical interview distinction: content projection only *displays* the parent-provided content inside the child's template — it doesn't give the child component a way to mutate or directly inspect that content's internal component instances the way passing a full React element as a prop sometimes does; for that level of programmatic control, Angular reaches for \`ContentChild\`/\`ContentChildren\` queries instead.`,
  },
  {
    title: 'Route Guards and Resolvers',
    content: `Guards are functions that control whether navigation to (or away from) a route is allowed to proceed — used for authentication checks, unsaved-changes confirmation, and permission gating, run by the router before activating or deactivating a route.

\`\`\`typescript
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};

const routes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
];
\`\`\`

A **resolver** pre-fetches data *before* a route activates, so the component never renders in a loading state at all — the router waits for the resolver's Observable/Promise to complete before navigating.

\`\`\`typescript
export const productResolver: ResolveFn<Product> = (route) => {
  const productService = inject(ProductService);
  return productService.getProduct(route.params['id']);
};

// In the component, the resolved data arrives ready via the route's data:
this.route.data.subscribe(({ product }) => (this.product = product));
\`\`\`

The interview-relevant tradeoff: resolvers eliminate in-component loading spinners for that data, but they also block navigation entirely until the resolver completes — a slow API call means the user sees no visual feedback (not even the new URL) until it finishes, whereas fetching inside the component's own \`ngOnInit\` lets the route transition happen immediately with a loading state shown after.`,
  },
  {
    title: 'Lazy Loading Modules',
    content: `Lazy loading splits an Angular application's JavaScript bundle so that a feature's code is only downloaded when the user actually navigates to a route that needs it — directly analogous to \`React.lazy\` + \`Suspense\`, but configured declaratively in the route definitions themselves.

\`\`\`typescript
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES),
  },
];
\`\`\`

\`loadComponent\` lazy-loads a single standalone component; \`loadChildren\` lazy-loads an entire set of child routes (and, historically with NgModules, an entire feature module) as one bundle chunk, fetched the first time the user navigates into that section of the app.

The interview-relevant payoff is the same as any code-splitting strategy: users only download the code for the parts of the app they actually visit, which matters most for large applications with many distinct feature areas (an admin section most users never open, a reports module behind a permission check) — the initial bundle stays small, and subsequent route navigations fetch additional chunks on demand, usually fast enough on a reasonable connection that the user doesn't perceive a meaningful delay.`,
  },
  {
    title: 'Angular Signals',
    content: `Signals are a newer reactive primitive in Angular (stabilized in v17+) that hold a value and notify consumers when it changes — a more fine-grained, simpler-to-reason-about alternative to relying on Zone.js-driven change detection or RxJS Observables for simple component state.

\`\`\`typescript
@Component({
  selector: 'app-counter',
  template: \`
    <button (click)="increment()">{{ count() }}</button>
    <p>Doubled: {{ doubled() }}</p>
  \`,
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2); // recomputes only when count() changes

  increment() {
    this.count.update(c => c + 1); // or this.count.set(newValue)
  }

  constructor() {
    effect(() => console.log('count changed to', this.count())); // reactive side effect
  }
}
\`\`\`

Reading a signal's value requires calling it as a function (\`count()\`), which is what lets Angular track exactly which signals a given template binding or \`computed\`/\`effect\` actually depends on — enabling much more precise, granular change detection than the default "check the whole tree" strategy, without manually opting every component into \`OnPush\` and carefully managing reference equality.

The interview-relevant framing: signals are Angular's answer to the same problem React's fine-grained reactivity proposals and frameworks like Solid/Vue 3 address — moving from "re-check broad swaths of the tree" toward "update exactly the DOM that depends on this specific piece of state," and they're expected to gradually become the default way to manage component state in new Angular code.`,
  },
  {
    title: 'State Management: NgRx and the Service-with-Subject Pattern',
    content: `For state shared across many unrelated components, Angular applications typically reach for one of two patterns. The lighter-weight approach is a service holding a \`BehaviorSubject\` (an Observable that remembers and replays its latest value to new subscribers):

\`\`\`typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  addItem(item: CartItem) {
    this.itemsSubject.next([...this.itemsSubject.value, item]);
  }
}
\`\`\`

For larger applications, **NgRx** brings a Redux-style architecture to Angular: a single immutable store, pure reducer functions, and actions dispatched to trigger state changes — with strict unidirectional data flow and time-travel debugging via Redux DevTools.

\`\`\`typescript
export const addItem = createAction('[Cart] Add Item', props<{ item: CartItem }>());

export const cartReducer = createReducer(
  initialState,
  on(addItem, (state, { item }) => ({ ...state, items: [...state.items, item] })),
);

// In a component
this.store.dispatch(addItem({ item }));
this.items$ = this.store.select(selectCartItems);
\`\`\`

The interview-relevant judgment call mirrors the React/Redux decision exactly: a service-with-Subject is simpler and sufficient for most apps' shared state needs; NgRx's added structure (actions, reducers, selectors, effects for async logic) pays off specifically when state changes are complex enough, or involve enough different features touching the same data, that NgRx's strict discipline and tooling (time-travel debugging, clear action audit trail) outweigh its considerably higher boilerplate.`,
  },
  {
    title: 'Testing Angular Components with TestBed',
    content: `Angular's testing utilities center on \`TestBed\`, which configures a small Angular testing module so a component can be instantiated with its real (or mocked) dependencies and rendered for inspection, typically run via Karma or Jest.

\`\`\`typescript
describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CounterComponent] });
    fixture = TestBed.createComponent(CounterComponent);
  });

  it('increments when the button is clicked', () => {
    fixture.detectChanges(); // triggers initial render

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges(); // re-run change detection after the click

    expect(button.textContent).toContain('1');
  });
});
\`\`\`

\`fixture.detectChanges()\` is the detail most candidates forget — Angular doesn't automatically re-render after a simulated DOM event in a test the way the real app does on a live change-detection cycle; you must explicitly trigger it after any interaction or async operation completes, or assertions will see stale, pre-update DOM content.

For components with service dependencies, \`TestBed\` lets you override providers with fakes/mocks (\`{ provide: UserService, useValue: fakeUserService }\`), the same dependency-substitution pattern DI containers enable everywhere — letting tests run fast and deterministically without hitting a real backend.`,
  },
  {
    title: 'Performance Optimization: trackBy, Pure Pipes, and Zone.js',
    content: `Several Angular-specific levers exist for reducing unnecessary rendering work, beyond the broader \`OnPush\`/signals story. **\`trackBy\` functions** (for \`*ngFor\`) and the \`track\` expression (for the newer \`@for\`) tell Angular how to identify list items across re-renders, letting it reuse and patch existing DOM nodes instead of destroying and recreating them on every list update — the same role React's \`key\` prop plays.

\`\`\`html
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>
\`\`\`

\`\`\`typescript
trackById(index: number, item: Item) { return item.id; }
\`\`\`

**Pure pipes** (the default) only re-run when their input reference changes, avoiding redundant recomputation on every change detection cycle — but as covered earlier, marking a pipe impure (\`pure: false\`) trades that efficiency for correctness when the underlying data can change without a new reference.

Under the hood, Angular's default change detection is triggered by **Zone.js**, which monkey-patches browser async APIs (\`setTimeout\`, \`addEventListener\`, Promise callbacks) so Angular automatically knows when *something* might have changed and re-checks the tree. Recent Angular versions support running **zoneless**, relying instead on signals to know precisely when something changed, avoiding Zone.js's broader "something happened somewhere, recheck everything" triggering model entirely.

The interview-relevant throughline across all of these: each technique narrows down *how much* and *how often* Angular re-evaluates the tree — from "recheck everything on every async event" (default, Zone.js-driven) toward "recheck only what's provably affected" (OnPush, trackBy, signals, zoneless) — and picking the right tool depends on profiling a real, measured slowdown rather than applying all of them preemptively.`,
  },
];

export function seedAngularLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['angular']);
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
