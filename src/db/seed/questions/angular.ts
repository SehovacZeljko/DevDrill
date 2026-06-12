import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedAngularQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['angular']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is a component in Angular and how is it structured?',
      answer: `An Angular component is the building block of the UI. It consists of a TypeScript class decorated with \`@Component\`, an HTML template, and optional CSS styles.

\`\`\`typescript
@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent implements OnInit {
  @Input() userId!: number;
  @Output() userSelected = new EventEmitter<User>();

  user: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUser(this.userId).subscribe(u => (this.user = u));
  }

  select(): void {
    if (this.user) this.userSelected.emit(this.user);
  }
}
\`\`\`

**Key decorators:** \`@Input()\` for receiving data from parent, \`@Output()\` for emitting events. The selector (\`app-user-card\`) is how you embed the component in other templates. Angular 17+ also supports standalone components without NgModules.`,
      difficulty: 1,
      tags: 'components,decorators,angular',
    },
    {
      title: 'How does dependency injection work in Angular?',
      answer: `Angular has a built-in hierarchical DI system. Services are provided at module, component, or root level. When a class requests a dependency in its constructor, Angular's injector resolves and injects the correct instance.

\`\`\`typescript
// Service — provided at root (singleton)
@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
}

// Component — Angular injects AuthService automatically
@Component({ selector: 'app-nav' })
export class NavComponent {
  constructor(private auth: AuthService) {}

  logout(): void { this.auth.logout(); }
}

// Override for testing
TestBed.configureTestingModule({
  providers: [{ provide: AuthService, useValue: mockAuthService }],
});
\`\`\`

**Injection hierarchy:** root injector → module injector → component injector. \`providedIn: 'root'\` creates a single instance for the whole app. Providing in a component creates a new instance per component, useful for stateful services.`,
      difficulty: 2,
      tags: 'dependency-injection,services,angular',
    },
    {
      title: 'What are Angular directives and what are the three types?',
      answer: `Directives are classes that add behavior to DOM elements. There are three types:

**1. Component directives** — directives with a template (i.e., every \`@Component\`)

**2. Structural directives** — alter the DOM structure by adding or removing elements:
\`\`\`html
<div *ngIf="isLoggedIn">Welcome!</div>
<li *ngFor="let item of items; trackBy: trackById">{{ item.name }}</li>
<div [ngSwitch]="role">
  <span *ngSwitchCase="'admin'">Admin Panel</span>
  <span *ngSwitchDefault>Dashboard</span>
</div>
\`\`\`

**3. Attribute directives** — change the appearance or behavior of an element without altering structure:
\`\`\`typescript
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @Input() appHighlight = '';

  @HostListener('mouseenter') onEnter() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }

  constructor(private el: ElementRef) {}
}
\`\`\`

Built-in attribute directives: \`NgClass\`, \`NgStyle\`, \`NgModel\`. Angular 17 introduced new block syntax (\`@if\`, \`@for\`, \`@switch\`) as a preferred alternative to structural directives.`,
      difficulty: 2,
      tags: 'directives,structural,attribute',
    },
    {
      title: 'What is RxJS and how is it used in Angular?',
      answer: `RxJS is a library for reactive programming using Observables. Angular uses it pervasively for HTTP requests, form value changes, routing events, and component communication.

\`\`\`typescript
@Component({ ... })
export class SearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  results: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
  ) {}

  searchControl = new FormControl('');

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),           // wait 300ms after last keystroke
      distinctUntilChanged(),      // ignore duplicate values
      switchMap(query =>           // cancel previous request on new input
        this.productService.search(query ?? '')
      ),
      takeUntil(this.destroy$),    // auto-unsubscribe on destroy
    ).subscribe(results => (this.results = results));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
\`\`\`

Key operators: \`map\`, \`filter\`, \`switchMap\`, \`mergeMap\`, \`debounceTime\`, \`distinctUntilChanged\`, \`combineLatest\`, \`forkJoin\`. The \`async\` pipe in templates handles subscription and unsubscription automatically.`,
      difficulty: 3,
      tags: 'rxjs,observables,angular',
    },
    {
      title: 'What is the difference between ngOnInit and the constructor?',
      answer: `The **constructor** is a TypeScript/JavaScript class constructor — it runs when Angular instantiates the component. Its only job should be to set up DI by accepting service injections. No logic or data fetching should happen here.

**\`ngOnInit\`** is a lifecycle hook that runs after Angular has initialized all data-bound properties (\`@Input()\`). This is the right place to fetch data, subscribe to observables, and run initialization logic.

\`\`\`typescript
@Component({ selector: 'app-profile' })
export class ProfileComponent implements OnInit {
  @Input() userId!: number;
  user: User | null = null;

  constructor(private userService: UserService) {
    // Good: inject service
    // Bad: this.userId is undefined here — @Input not yet set
  }

  ngOnInit(): void {
    // Good: this.userId is now available
    this.userService.getUser(this.userId).subscribe(u => (this.user = u));
  }
}
\`\`\`

**Other lifecycle hooks:** \`ngOnChanges\` (input changes), \`ngAfterViewInit\` (view DOM ready), \`ngOnDestroy\` (cleanup). Never start subscriptions in the constructor.`,
      difficulty: 1,
      tags: 'lifecycle,oninit,constructor',
    },
    {
      title: 'What is the difference between template-driven and reactive forms?',
      answer: `**Template-driven forms** are defined in the HTML template using \`ngModel\`. The form model is inferred automatically. Simpler but harder to unit test.

\`\`\`html
<form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
  <input name="email" [(ngModel)]="email" required email />
  <button [disabled]="loginForm.invalid">Login</button>
</form>
\`\`\`

**Reactive forms** define the form model explicitly in the TypeScript class. More verbose but fully testable and predictable.

\`\`\`typescript
loginForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
});

// In template
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="email" />
  <button [disabled]="loginForm.invalid">Login</button>
</form>

// Access values
this.loginForm.get('email')?.value
this.loginForm.valueChanges.subscribe(...)
\`\`\`

Use reactive forms for complex validation, dynamic fields, and whenever you need to unit test form logic without rendering the component.`,
      difficulty: 2,
      tags: 'forms,reactive,template-driven',
    },
    {
      title: 'What is lazy loading in Angular and how do you set it up?',
      answer: `Lazy loading defers loading an Angular module (and its components) until the user navigates to a route that needs it. This reduces the initial bundle size and speeds up app startup.

\`\`\`typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard], // protect behind a guard
  },
];

// admin/admin-routing.module.ts
const adminRoutes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'users', component: UsersComponent },
];
\`\`\`

Angular CLI creates a separate JavaScript chunk for each lazy-loaded module. The chunk is downloaded only when the user visits that route. Use \`PreloadingStrategy\` (\`PreloadAllModules\` or custom) to preload lazy chunks in the background after the initial load. Angular 17 supports lazy standalone components directly without modules.`,
      difficulty: 2,
      tags: 'lazy-loading,routing,performance',
    },
    {
      title: 'What is change detection in Angular and what is OnPush?',
      answer: `Change detection is Angular's mechanism for keeping the UI in sync with component state. By default (\`ChangeDetectionStrategy.Default\`), Angular checks every component in the tree on every event (click, HTTP response, timer). This is simple but can be slow for large trees.

\`\`\`typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product!: Product;
}
\`\`\`

With **OnPush**, Angular only re-checks the component when:
1. An \`@Input\` reference changes (not just mutation)
2. The component or its children fire an event
3. An Observable emits via the \`async\` pipe
4. You call \`ChangeDetectorRef.markForCheck()\` manually

This makes OnPush components much more performant in large lists but requires immutable data patterns — mutating an array passed as input won't trigger re-render; you must replace the array.

Signals (Angular 17+) offer a finer-grained reactivity model that makes OnPush-style performance the default.`,
      difficulty: 3,
      tags: 'change-detection,onpush,performance',
    },
    {
      title: 'What are Angular pipes and how do you create a custom one?',
      answer: `Pipes transform displayed values in templates. They're applied with the \`|\` operator and can be chained.

\`\`\`html
{{ price | currency:'EUR':'symbol':'1.2-2' }}
{{ date | date:'mediumDate' }}
{{ text | uppercase | slice:0:50 }}
{{ items | async }}  <!-- unwraps Observable/Promise -->
\`\`\`

**Custom pipe:**
\`\`\`typescript
@Pipe({ name: 'truncate', pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 100, ellipsis = '...'): string {
    if (value.length <= limit) return value;
    return value.slice(0, limit) + ellipsis;
  }
}

// Usage
{{ article.body | truncate:200 }}
\`\`\`

**Pure vs impure pipes:** A pure pipe (\`pure: true\`, the default) is only re-evaluated when the input reference changes. An impure pipe runs on every change detection cycle — avoid it for performance-critical paths. Built-in impure pipes: \`async\`, \`keyvalue\`.`,
      difficulty: 2,
      tags: 'pipes,templates,transform',
    },
    {
      title: 'What are Angular signals and how do they improve reactivity?',
      answer: `Signals (Angular 16+) are a new reactive primitive that gives Angular fine-grained reactivity — components and computed values know exactly which signals they depend on, eliminating unnecessary checks.

\`\`\`typescript
@Component({
  template: \`
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">+</button>
  \`,
})
export class CounterComponent {
  count = signal(0);                          // writable signal
  double = computed(() => this.count() * 2); // derived signal

  increment(): void {
    this.count.update(n => n + 1);
    // or: this.count.set(this.count() + 1);
  }
}
\`\`\`

**Key concepts:**
- \`signal(initialValue)\` — creates a writable signal
- \`computed(() => ...)\` — creates a derived read-only signal
- \`effect(() => ...)\` — runs a side effect whenever a signal changes

Signals integrate with the existing \`@Input\`/\`@Output\` model via \`input()\` and \`output()\` (Angular 17.1+). They pave the way for a future without Zone.js (zoneless change detection).`,
      difficulty: 3,
      tags: 'signals,angular17,reactivity',
    },
    {
      title: 'What is Angular and what are its main benefits over plain JavaScript?',
      answer: `Angular is a full-featured **opinionated framework** maintained by Google for building large-scale single-page applications. Unlike React (a library), Angular provides routing, forms, HTTP, animations, and dependency injection out of the box.

**Main benefits:**
- **Opinionated structure** — enforces consistency across large teams
- **TypeScript-first** — full type safety, better IDE tooling
- **Dependency Injection** — built-in IoC container for services
- **RxJS integration** — reactive async patterns throughout
- **Angular CLI** — code generation, builds, testing configured from day one
- **Two-way data binding** — synchronizes model and view automatically

\`\`\`typescript
// Angular app entry point — everything declared, injected, routed
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule, HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
\`\`\`

Angular is best suited for enterprise applications where team consistency, long-term maintainability, and built-in tooling outweigh the learning curve.`,
      difficulty: 1,
      tags: 'angular,framework,spa,typescript,overview',
    },
    {
      title: 'How does an Angular application bootstrap from main.ts to the DOM?',
      answer: `Angular's startup sequence follows a chain of imports and decorators that ends with the root component being rendered into \`index.html\`.

\`\`\`
main.ts
  → platformBrowserDynamic().bootstrapModule(AppModule)
  → AppModule (@NgModule bootstrap: [AppComponent])
  → AppComponent selector: 'app-root'
  → index.html <app-root></app-root> replaced by component template
\`\`\`

\`\`\`typescript
// main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

// For standalone (Angular 17+)
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
bootstrapApplication(AppComponent, appConfig);
\`\`\`

During bootstrap, Angular: compiles components (JIT in dev, AOT in prod), initializes the DI tree, creates Zone.js, instantiates AppComponent, and renders it into the DOM node matching the root selector.`,
      difficulty: 2,
      tags: 'bootstrap,initialization,modules,startup,main',
    },
    {
      title: 'What is the difference between AngularJS and Angular?',
      answer: `AngularJS (Angular 1.x) and Angular (2+) share a name but are fundamentally different frameworks — Angular 2 was a complete rewrite.

| | **AngularJS (1.x)** | **Angular (2+)** |
|---|---|---|
| Language | JavaScript | TypeScript |
| Architecture | MVC, controllers | Component-based |
| Data binding | Two-way ($scope) | One-way + explicit events |
| DI | Simple, string-based | Hierarchical, typed |
| Change detection | Dirty checking ($digest) | Zone.js / OnPush / Signals |
| Performance | Slower for large apps | Much faster |
| Mobile | Limited | Angular Universal, PWA |

\`\`\`typescript
// AngularJS — controllers and $scope
app.controller('UserCtrl', function($scope, UserService) {
  $scope.user = UserService.getUser();
});

// Angular — components and DI
@Component({ selector: 'app-user' })
export class UserComponent {
  constructor(private userService: UserService) {}
}
\`\`\`

AngularJS reached end-of-life in December 2021. All new Angular projects should use Angular 2+.`,
      difficulty: 2,
      tags: 'angularjs,angular,comparison,migration,history',
    },
    {
      title: 'What is the Angular CLI and its key commands?',
      answer: `The Angular CLI (\`ng\`) is a command-line interface that scaffolds, builds, tests, and deploys Angular applications with zero configuration.

\`\`\`bash
# Create a new project
ng new my-app --routing --style=scss

# Generate artifacts
ng generate component features/user-profile  # component
ng generate service core/auth                # service
ng generate module features/admin --routing  # module with routing
ng generate guard core/auth                  # route guard
ng generate pipe shared/truncate             # pipe

# Development
ng serve                  # dev server with HMR at localhost:4200
ng serve --port 4201 --open

# Build
ng build                  # development build
ng build --configuration production  # production build (AOT, minification)

# Testing
ng test                   # unit tests with Karma/Jasmine
ng e2e                    # end-to-end tests with Cypress/Playwright

# Linting
ng lint                   # ESLint
\`\`\`

The CLI handles Webpack/Vite configuration internally. Angular 17+ uses Vite + esbuild by default for significantly faster builds.`,
      difficulty: 1,
      tags: 'cli,tooling,scaffolding,ng,commands',
    },
    {
      title: 'What is two-way data binding and how does ngModel implement it?',
      answer: `Two-way data binding keeps the template and component class in sync — changes in the UI update the model, and changes in the model update the UI. In Angular, it's implemented via \`[(ngModel)]\` (the "banana in a box" syntax).

\`\`\`typescript
// [(ngModel)] is syntactic sugar for:
// [ngModel]="value"          (property binding: model → view)
// (ngModelChange)="value=$event" (event binding: view → model)

@Component({
  template: \`
    <input [(ngModel)]="username" />
    <p>Hello, {{ username }}</p>

    <!-- Expanded equivalent: -->
    <input [ngModel]="username" (ngModelChange)="username = $event" />
  \`,
})
export class LoginComponent {
  username = '';
}
\`\`\`

\`ngModel\` requires importing \`FormsModule\` in the module (or \`NgModel\` directly in standalone components). It works via the \`ControlValueAccessor\` interface internally, which also powers custom form controls.

In **reactive forms**, use \`formControlName\` or \`[formControl]\` instead — they provide more predictability and testability.`,
      difficulty: 2,
      tags: 'data-binding,ngmodel,forms,two-way-binding,formsmodule',
    },
    {
      title: 'What is the difference between string interpolation and property binding?',
      answer: `Both render data in templates but work differently:

**String interpolation (\`{{ }}\`)** converts an expression to a string and inserts it as text content. It can only produce strings.

**Property binding (\`[property]="expr"\`)** sets a DOM property or component \`@Input\` directly. It can pass any type: boolean, object, array.

\`\`\`html
<!-- String interpolation — text content only -->
<h1>Welcome, {{ user.name }}</h1>
<p>Score: {{ score * 100 | number }}</p>

<!-- Property binding — DOM properties and @Inputs -->
<button [disabled]="isLoading">Submit</button>
<img [src]="user.avatarUrl" [alt]="user.name" />
<app-card [user]="currentUser" [showActions]="true"></app-card>

<!-- Difference: disabled attribute vs property -->
<input disabled="{{ isDisabled }}">  <!-- Always disabled — attr="true"/"false" -->
<input [disabled]="isDisabled">     <!-- Correct — sets the .disabled property -->
\`\`\`

**Attribute binding** (\`[attr.aria-label]="expr"\`) is needed for HTML attributes that don't have direct DOM property counterparts (ARIA attributes, \`colspan\`, \`data-*\`).`,
      difficulty: 1,
      tags: 'data-binding,interpolation,property-binding,templates',
    },
    {
      title: 'What is event binding in Angular?',
      answer: `Event binding attaches an event listener to a DOM element or child component output. The syntax is \`(eventName)="handler($event)"\`.

\`\`\`html
<!-- DOM events -->
<button (click)="handleClick()">Save</button>
<input (input)="onInput($event)" (keyup.enter)="onSubmit()" />
<form (submit)="onSubmit($event)">...</form>

<!-- Keyboard shortcuts — key filtering -->
<input (keyup.escape)="clear()" (keydown.space)="$event.preventDefault()" />

<!-- Component output events -->
<app-dialog (confirmed)="handleConfirm($event)" (dismissed)="closeModal()" />
\`\`\`

\`\`\`typescript
@Component({ template: \`<input (input)="onInput($event)" />\` })
export class SearchComponent {
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }
}
\`\`\`

Angular also supports **two-way custom bindings**: an \`@Input() value\` + \`@Output() valueChange = new EventEmitter()\` pair enables \`[(value)]="someVar"\` syntax on custom components.`,
      difficulty: 1,
      tags: 'event-binding,events,outputs,dom-events,interaction',
    },
    {
      title: 'What are Single Page Applications and how does Angular support them?',
      answer: `A **Single Page Application (SPA)** loads one HTML page and dynamically updates content without full page reloads. Navigation changes the URL but the browser never leaves the page.

Angular enables SPAs through:
- **Router** — maps URL segments to components and loads them dynamically
- **\`<router-outlet>\`** — placeholder in the template where route components render
- **History API** — \`BrowserRouter\` pushes URL states without HTTP requests
- **Lazy loading** — loads feature modules on demand, reducing initial bundle

\`\`\`typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: '**', component: NotFoundComponent },
];

// App template
@Component({
  template: \`
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/products">Products</a>
    </nav>
    <router-outlet></router-outlet>
  \`
})
export class AppComponent {}
\`\`\`

SPAs excel at app-like experiences but require SSR (Angular Universal) for SEO and fast initial paint.`,
      difficulty: 1,
      tags: 'spa,routing,architecture,browser-history,router-outlet',
    },
    {
      title: 'What is view encapsulation in Angular?',
      answer: `View encapsulation controls how component styles are scoped. Angular provides three modes:

**\`Emulated\` (default):** Angular adds unique attributes to elements and rewrites CSS selectors to target only this component's elements.

**\`None\`:** Styles are global — no encapsulation. Use for global overrides or third-party library theming.

**\`ShadowDom\`:** Uses the native Shadow DOM API for true browser-enforced isolation.

\`\`\`typescript
@Component({
  selector: 'app-card',
  template: \`<div class="card">{{ title }}</div>\`,
  styles: [\`.card { background: blue; }\`],
  encapsulation: ViewEncapsulation.Emulated, // default
})
export class CardComponent {}

// Emulated outputs something like:
// <div class="card" _ngcontent-xyz-123>...</div>
// .card[_ngcontent-xyz-123] { background: blue; }
\`\`\`

\`\`\`typescript
// Emulated   — pseudo-scoped, works everywhere
// ShadowDom  — true isolation, not supported in older browsers
// None       — global styles, use sparingly
\`\`\`

To style nested components from a parent with Emulated encapsulation, use \`::ng-deep\` (deprecated but still used widely).`,
      difficulty: 2,
      tags: 'view-encapsulation,styles,shadow-dom,emulated,scoping',
    },
    {
      title: 'What are all 8 Angular lifecycle hooks and when does each run?',
      answer: `Angular calls lifecycle hooks at specific points during component/directive creation, update, and destruction.

| Hook | When it runs |
|---|---|
| \`ngOnChanges\` | Before \`ngOnInit\` and whenever an \`@Input\` changes |
| \`ngOnInit\` | Once, after first \`ngOnChanges\` — initialization logic here |
| \`ngDoCheck\` | Every change detection cycle — custom change detection |
| \`ngAfterContentInit\` | Once, after projected content (\`<ng-content>\`) is initialized |
| \`ngAfterContentChecked\` | After every check of projected content |
| \`ngAfterViewInit\` | Once, after component's view and child views are initialized |
| \`ngAfterViewChecked\` | After every check of the component's view |
| \`ngOnDestroy\` | Just before destruction — cleanup subscriptions, timers |

\`\`\`typescript
@Component({ selector: 'app-example' })
export class ExampleComponent implements OnInit, OnDestroy, OnChanges {
  @Input() userId!: number;
  private sub!: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) { this.loadUser(changes['userId'].currentValue); }
  }

  ngOnInit(): void { this.sub = this.service.stream$.subscribe(this.handle); }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}
\`\`\``,
      difficulty: 2,
      tags: 'lifecycle,hooks,oninit,ondestroy,onchanges,components',
    },
    {
      title: 'What are HTTP interceptors and what are they used for?',
      answer: `Interceptors are middleware for \`HttpClient\` requests and responses. They implement \`HttpInterceptor\` and can modify requests before they go out and transform responses before they reach the component.

\`\`\`typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.getToken();
    if (!token) return next.handle(req);

    const authedReq = req.clone({
      headers: req.headers.set('Authorization', \`Bearer \${token}\`),
    });
    return next.handle(authedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) this.auth.logout();
        return throwError(() => error);
      }),
    );
  }
}

// Register in module providers
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
]
\`\`\`

**Common use cases:** Auth token injection, error handling, loading spinner toggling, response caching, request deduplication, logging, and retry logic.`,
      difficulty: 2,
      tags: 'interceptors,http,httpclient,auth,middleware',
    },
    {
      title: 'What are @ViewChild and @ContentChild and how do they differ?',
      answer: `Both query for a single child element, but from different sources.

**\`@ViewChild\`** queries the component's own **template** (elements in the component's HTML).

**\`@ContentChild\`** queries **projected content** — elements passed between opening/closing tags of the component (via \`<ng-content>\`).

\`\`\`typescript
@Component({
  selector: 'app-card',
  template: \`
    <div #container>
      <ng-content></ng-content> <!-- projected content goes here -->
    </div>
    <canvas #chart></canvas>  <!-- component's own template -->
  \`,
})
export class CardComponent implements AfterViewInit, AfterContentInit {
  @ViewChild('container') containerEl!: ElementRef;   // own template
  @ViewChild('chart') chartCanvas!: ElementRef;       // own template
  @ContentChild(HeaderComponent) header!: HeaderComponent; // projected

  ngAfterViewInit() {
    // containerEl and chartCanvas are ready here
    initChart(this.chartCanvas.nativeElement);
  }

  ngAfterContentInit() {
    // header (projected) is ready here
    console.log(this.header?.title);
  }
}
\`\`\`

Use \`@ViewChildren\` / \`@ContentChildren\` (plural) to query multiple matching elements as a \`QueryList\`.`,
      difficulty: 2,
      tags: 'viewchild,contentchild,querying,template,projection',
    },
    {
      title: 'What are deferrable views (@defer) in Angular 17+?',
      answer: `\`@defer\` is a built-in template block (Angular 17+) that lazily loads a component and its dependencies only when a trigger condition is met, without any manual dynamic imports or \`Intersection-Observer\` setup.

\`\`\`html
<!-- Defer until block enters viewport -->
@defer (on viewport) {
  <app-heavy-chart [data]="chartData" />
} @placeholder {
  <div class="chart-skeleton"></div>
} @loading (minimum 300ms) {
  <app-spinner />
} @error {
  <p>Failed to load chart</p>
}

<!-- Other triggers -->
@defer (on interaction) { <app-comments /> }
@defer (on idle) { <app-analytics-widget /> }
@defer (on timer(2s)) { <app-promo-banner /> }
@defer (when userScrolledPast) { <app-related-items /> }
\`\`\`

**Trigger types:** \`idle\`, \`viewport\`, \`interaction\`, \`hover\`, \`timer(delay)\`, \`when(condition)\`.

The Angular compiler creates a separate lazy chunk for the deferred component automatically — no \`loadComponent\` or \`import()\` needed. This is simpler than React's \`React.lazy\` + \`Suspense\` pattern.`,
      difficulty: 3,
      tags: 'defer,lazy-loading,angular17,performance,bundle-size',
    },
    {
      title: 'What are Angular route guards and what types exist?',
      answer: `Route guards control whether a user can navigate to, away from, or into a route. In Angular 14.1+, guards are typed as simple functions returning \`boolean | UrlTree | Observable | Promise\`.

**Types of guards:**
- \`canActivate\` — prevents access to a route
- \`canActivateChild\` — guards all child routes
- \`canDeactivate\` — prevents leaving a route (e.g., unsaved form)
- \`canMatch\` — determines if a route config matches (useful for feature flags)
- \`resolve\` — pre-fetches data before route activates

\`\`\`typescript
// Modern functional guard (Angular 14.1+)
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// canDeactivate guard
export const unsavedChangesGuard: CanDeactivateFn<EditFormComponent> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes. Leave anyway?');
  }
  return true;
};

// Route config
{ path: 'admin', component: AdminComponent, canActivate: [authGuard] }
\`\`\``,
      difficulty: 2,
      tags: 'guards,routing,canactivate,candeactivate,auth,navigation',
    },
    {
      title: 'What is NgRx and when should you choose it over Angular services?',
      answer: `NgRx is Angular's Redux-inspired state management library. It uses a single immutable store, pure reducer functions, typed actions, and selectors for derived state. Effects handle async operations.

\`\`\`typescript
// Action
export const loadProducts = createAction('[Products] Load Products');
export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: Product[] }>()
);

// Reducer
const reducer = createReducer(
  { products: [], loading: false },
  on(loadProducts, state => ({ ...state, loading: true })),
  on(loadProductsSuccess, (state, { products }) => ({ ...state, products, loading: false })),
);

// Effect
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadProducts),
    switchMap(() => this.api.getProducts().pipe(
      map(products => loadProductsSuccess({ products })),
    )),
  )
);
\`\`\`

**Choose NgRx when:**
- Multiple components across the app read and modify the same state
- Complex async flows with race conditions or rollback
- You need time-travel debugging or action replay
- Team > 5 engineers and predictability matters more than simplicity

**Use services + \`BehaviorSubject\` when:** state is simpler or scoped to one feature.`,
      difficulty: 3,
      tags: 'ngrx,state-management,redux,store,effects,selectors',
    },
    {
      title: 'What is Zone.js and what does zoneless Angular mean?',
      answer: `**Zone.js** is a library that monkey-patches browser APIs (\`setTimeout\`, \`fetch\`, \`addEventListener\`, Promises) to intercept async operations. Angular uses Zone.js to know when to run change detection — after any async event.

\`\`\`typescript
// Angular's zone triggers CD after every async operation:
setTimeout(() => {
  this.count++; // Zone.js detects this, triggers CD
}, 1000);
\`\`\`

**Problems with Zone.js:**
- 40KB bundle overhead
- Patches all async APIs globally
- Causes unnecessary CD runs for third-party library events

**Zoneless Angular (Angular 18+):** run the app without Zone.js by using \`provideExperimentalZonelessChangeDetection()\`. Change detection must be triggered explicitly via Signals, \`markForCheck()\`, or the \`async\` pipe.

\`\`\`typescript
// main.ts — zoneless
bootstrapApplication(AppComponent, {
  providers: [provideExperimentalZonelessChangeDetection()],
});
\`\`\`

Signals (Angular 16+) are the primary mechanism driving zoneless Angular — they notify the framework exactly which components to check.`,
      difficulty: 3,
      tags: 'zonejs,zoneless,change-detection,performance,angular18',
    },
    {
      title: 'What are signal-based input() and output() in Angular 17+?',
      answer: `Angular 17.1+ introduced \`input()\` and \`output()\` functions as signal-based alternatives to \`@Input()\` and \`@Output()\` decorators. \`input()\` returns a read-only Signal; changes flow through the signal graph without Zone.js.

\`\`\`typescript
import { input, output, computed } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: \`
    <h2>{{ fullName() }}</h2>
    <button (click)="follow()">Follow</button>
  \`,
})
export class UserCardComponent {
  // Signal-based inputs
  firstName = input.required<string>();       // required, throws if missing
  lastName  = input<string>('');             // optional with default
  age       = input<number>();               // optional, undefined by default

  // Signal-based output
  followed = output<{ userId: string }>();

  // Derived signal — recomputes when inputs change
  fullName = computed(() => \`\${this.firstName()} \${this.lastName()}\`);

  follow() {
    this.followed.emit({ userId: 'user-1' });
  }
}
\`\`\`

Signal inputs are always up-to-date (no need for \`ngOnChanges\`), support the signal graph for fine-grained reactivity, and work natively with zoneless Angular.`,
      difficulty: 2,
      tags: 'signals,input,output,angular17,reactivity,decorators',
    },
    {
      title: 'What is the Angular CDK and what does it provide?',
      answer: `The **Angular Component Dev Kit (CDK)** is a set of behavior primitives and utilities that Angular Material is built on. It provides the building blocks for custom UI components without imposing Material Design styling.

**Key CDK packages:**

- **\`@angular/cdk/overlay\`** — floating panels, tooltips, dropdowns
- **\`@angular/cdk/drag-drop\`** — drag-and-drop lists
- **\`@angular/cdk/virtual-scroll\`** — virtual scrolling for large lists
- **\`@angular/cdk/a11y\`** — focus trapping, live announcer, keyboard manager
- **\`@angular/cdk/portal\`** — render components outside the current DOM position
- **\`@angular/cdk/layout\`** — breakpoint observer, media queries

\`\`\`typescript
// Virtual scrolling — render only visible items
@Component({
  template: \`
    <cdk-virtual-scroll-viewport itemSize="56" class="list-viewport">
      <div *cdkVirtualFor="let item of items" class="list-item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  \`,
})
export class BigListComponent {
  items = Array.from({ length: 100000 }, (_, i) => ({ name: \`Item \${i}\` }));
}
\`\`\``,
      difficulty: 1,
      tags: 'cdk,accessibility,virtual-scroll,angular-material,components',
    },
    {
      title: 'What are standalone components and why were they introduced?',
      answer: `**Standalone components** (Angular 14+) can be used without declaring them in an \`NgModule\`. They import their own dependencies directly via the \`imports\` array in \`@Component\`.

\`\`\`typescript
// Traditional — must declare in NgModule
@NgModule({ declarations: [UserCardComponent], imports: [CommonModule] })
export class UserModule {}

// Standalone — self-contained
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe], // direct imports
  template: \`<div>{{ user.name }} joined {{ user.createdAt | date }}</div>\`,
})
export class UserCardComponent {
  @Input() user!: User;
}

// Use directly in another standalone component
@Component({
  standalone: true,
  imports: [UserCardComponent],
  template: \`<app-user-card [user]="currentUser" />\`,
})
export class ProfilePageComponent { ... }
\`\`\`

**Why introduced:**
- NgModules added complexity and boilerplate that hid component dependencies
- Standalone components make the dependency graph explicit and co-located
- Angular 17 makes standalone the default for all \`ng generate\` outputs
- Enables simpler lazy loading: \`loadComponent: () => import('./user-card').then(m => m.UserCardComponent)\``,
      difficulty: 2,
      tags: 'standalone,ngmodule,angular14,angular17,imports,boilerplate',
    },
    {
      title: 'What is Angular Universal (SSR) and why is it used?',
      answer: `**Angular Universal** is Angular's server-side rendering (SSR) solution. It runs the Angular app on a Node.js server, renders HTML, and sends it to the browser for fast initial paint and SEO.

\`\`\`bash
# Add SSR to existing project
ng add @angular/ssr
\`\`\`

\`\`\`typescript
// server.ts (generated)
import { CommonEngine } from '@angular/ssr';
import express from 'express';

const server = express();
const engine = new CommonEngine();

server.get('*', (req, res) => {
  engine.render({
    bootstrap: AppServerModule,
    documentFilePath: indexHtml,
    url: \`\${req.protocol}://\${req.headers.host}\${req.originalUrl}\`,
  }).then(html => res.send(html));
});
\`\`\`

**Benefits:**
- **SEO** — search engines receive fully rendered HTML
- **Social sharing** — og:tags fully rendered for link previews
- **Performance** — faster Time to First Contentful Paint
- **Core Web Vitals** — better LCP score

**SSR considerations:**
- No browser APIs (\`window\`, \`document\`) available on server — guard with \`isPlatformBrowser()\`
- Avoid \`localStorage\` in SSR contexts
- Use \`TransferState\` to pass server-fetched data to client, avoiding double-fetch`,
      difficulty: 2,
      tags: 'angular-universal,ssr,seo,performance,server-rendering',
    },
    {
      title: 'What is AOT (Ahead-of-Time) vs JIT (Just-in-Time) compilation?',
      answer: `Angular templates are compiled into JavaScript. When this compilation happens defines the two modes.

**JIT (Just-in-Time):** Templates are compiled in the browser at runtime during app startup. Used in development for faster rebuild cycles (prior to Angular 9).

**AOT (Ahead-of-Time):** Templates are compiled during the build step. The browser downloads pre-compiled JavaScript. Default since Angular 9.

\`\`\`bash
ng build                         # AOT (default in all environments)
ng build --aot=false             # JIT (rarely needed)
\`\`\`

**AOT advantages:**
- Faster rendering (no template compilation at startup)
- Smaller bundle (Angular compiler not shipped to browser)
- Earlier template error detection (build-time not runtime)
- Better security (pre-compiled templates resist injection)

\`\`\`typescript
// AOT catches errors like this at build time:
// Template: {{ user.nme }}  ← typo — TS compiler catches it
@Component({ template: \`{{ user.nme }}\` }) // Build error: Property 'nme' does not exist
export class ProfileComponent {
  user = { name: 'Alice' };
}
\`\`\``,
      difficulty: 2,
      tags: 'aot,jit,compilation,build,performance,angular',
    },
    {
      title: 'What is Angular Ivy and what are its benefits?',
      answer: `**Ivy** is Angular's third-generation compilation and rendering engine, which became the default in Angular 9. It replaced the legacy View Engine compiler.

**Key improvements:**

- **Smaller bundles:** Ivy uses tree-shaking more aggressively. Unused Angular features are eliminated.
- **Faster compilation:** Incremental compilation — only changed files recompile.
- **Better debugging:** Component instances are directly accessible in browser DevTools via \`ng\` global.
- **Improved type checking:** Strict template type checking enabled with \`strictTemplates: true\`.
- **Locality principle:** Each component compiled independently; no global "ngfactory" files needed.

\`\`\`typescript
// tsconfig.json — Ivy-enabled strict mode
{
  "angularCompilerOptions": {
    "strictTemplates": true,   // full template type checking
    "strictInjectionParameters": true
  }
}
\`\`\`

\`\`\`bash
# Debug in browser DevTools console
ng.getComponent($0)      // get Angular component from selected element
ng.applyChanges($0)      // trigger change detection manually
\`\`\`

Standalone components were made possible by Ivy's locality principle.`,
      difficulty: 2,
      tags: 'ivy,compilation,tree-shaking,bundle-size,rendering,angular9',
    },
    {
      title: 'What are pure vs impure pipes and which is better for performance?',
      answer: `**Pure pipes** (\`pure: true\`, the default) are only re-evaluated when the input reference changes (new primitive value or new object reference). They behave like pure functions.

**Impure pipes** run on **every change detection cycle**, regardless of whether the input changed. They are expensive and should be avoided or used carefully.

\`\`\`typescript
// Pure pipe — fast, only recalculates when reference changes
@Pipe({ name: 'filterActive', pure: true })
export class FilterActivePipe implements PipeTransform {
  transform(items: Item[]): Item[] {
    return items.filter(i => i.active);
  }
}

// Impure pipe — needed when input mutates without reference change
@Pipe({ name: 'filterActive', pure: false })
export class FilterActiveImpurePipe implements PipeTransform {
  transform(items: Item[]): Item[] { return items.filter(i => i.active); }
}
// Runs on EVERY CD cycle — very expensive in large lists
\`\`\`

**Best practice:** Keep pipes pure. If you need to react to internal array mutations, switch to an immutable pattern (replace the array instead of pushing) so the reference changes, enabling the pure pipe to trigger.`,
      difficulty: 2,
      tags: 'pipes,pure,impure,performance,change-detection',
    },
    {
      title: 'What is the PipeTransform interface?',
      answer: `\`PipeTransform\` is a TypeScript interface that custom Angular pipes must implement. It requires a single \`transform(value, ...args)\` method.

\`\`\`typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatBytes', standalone: true })
export class FormatBytesPipe implements PipeTransform {
  transform(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return \`\${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} \${sizes[i]}\`;
  }
}

// Usage in template
{{ fileSize | formatBytes }}        // '1.46 MB'
{{ fileSize | formatBytes:0 }}      // '1 MB'
\`\`\`

The \`@Pipe\` decorator requires at least a \`name\` property (the pipe identifier in templates). Add \`standalone: true\` for standalone component compatibility. Import the pipe class directly in the component's \`imports\` array for standalone usage.`,
      difficulty: 2,
      tags: 'pipes,pipetransform,interface,custom-pipes,angular',
    },
    {
      title: 'What are Angular animations and how do you implement them?',
      answer: `Angular animations use the \`@angular/animations\` package with a DSL built on the Web Animations API. Animations are declared in the component's \`animations\` metadata.

\`\`\`typescript
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-panel',
  template: \`
    <div [@expandCollapse]="isExpanded ? 'open' : 'closed'">
      <ng-content></ng-content>
    </div>
    <button (click)="isExpanded = !isExpanded">Toggle</button>
  \`,
  animations: [
    trigger('expandCollapse', [
      state('open',   style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '0', opacity: 0, overflow: 'hidden' })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
})
export class PanelComponent {
  isExpanded = true;
}
\`\`\`

Import \`BrowserAnimationsModule\` (or \`provideAnimations()\` for standalone). Use \`NoopAnimationsModule\` in tests to disable animations. Angular animations support keyframes, staggering list items (\`query\` + \`stagger\`), and route transition animations.`,
      difficulty: 2,
      tags: 'animations,transitions,ux,web-animations,trigger',
    },
    {
      title: 'What is RouterModule.forRoot() vs forChild() and why does it matter?',
      answer: `Both configure Angular's Router, but they serve different purposes and have different side effects.

**\`RouterModule.forRoot(routes)\`** — used **once** in the root \`AppModule\` (or root config). It registers the Router service, the \`RouterOutlet\`, \`RouterLink\`, all router guards, and the browser \`Location\` service as singletons.

**\`RouterModule.forChild(routes)\`** — used in **feature modules** (lazy or eager). It adds routes to the existing Router service without re-registering the singleton services.

\`\`\`typescript
// App root — once only
@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { enableTracing: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

// Feature module — can be imported multiple times
@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
\`\`\`

**Common mistake:** Calling \`forRoot\` in a lazy-loaded module creates a second Router instance, breaking navigation entirely. Always use \`forChild\` in feature modules.`,
      difficulty: 2,
      tags: 'routing,forroot,forchild,modules,configuration',
    },
    {
      title: 'What is the difference between path parameters and query parameters in Angular routing?',
      answer: `**Path parameters** are part of the URL path and identify a resource. **Query parameters** are appended after \`?\` and typically filter, sort, or configure a view.

\`\`\`typescript
// Route definition with path param
{ path: 'products/:categoryId/:productId', component: ProductDetailComponent }

// Component reads path param
@Component({ ... })
export class ProductDetailComponent implements OnInit {
  ngOnInit(): void {
    // Path params — from route snapshot
    const id = this.route.snapshot.paramMap.get('productId');

    // Path params — as Observable (re-subscribes on navigation)
    this.route.paramMap.subscribe(params => {
      this.loadProduct(params.get('productId')!);
    });

    // Query params — from snapshot
    const page = this.route.snapshot.queryParamMap.get('page') ?? '1';

    // Query params — as Observable
    this.route.queryParamMap.subscribe(params => {
      this.currentPage = Number(params.get('page') ?? 1);
    });
  }
}

// Navigate with both
this.router.navigate(['/products', catId, prodId], {
  queryParams: { page: 2, sort: 'price' },
});
// URL: /products/electronics/42?page=2&sort=price
\`\`\``,
      difficulty: 2,
      tags: 'routing,path-params,query-params,activatedroute,navigation',
    },
    {
      title: 'What is ActivatedRoute.snapshot vs observable paramMap?',
      answer: `\`ActivatedRoute\` provides two ways to read route parameters. The correct choice depends on whether the component can be **reused** without unmounting.

**\`snapshot\`** — a static one-time read at the moment the route is activated. Doesn't update if the user navigates to the same route with different params (same component reused).

**Observable \`paramMap\`** — emits every time params change, including when navigating between same-type routes.

\`\`\`typescript
@Component({ ... })
export class UserDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Snapshot — safe only if component always unmounts between navigations
    const id = this.route.snapshot.paramMap.get('userId')!;

    // Observable — correct for pagination links like Next/Prev
    this.route.paramMap.pipe(
      map(params => params.get('userId')!),
      distinctUntilChanged(),
      switchMap(id => this.userService.getUser(id)),
      takeUntil(this.destroy$),
    ).subscribe(user => (this.user = user));
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
\`\`\``,
      difficulty: 2,
      tags: 'routing,activatedroute,snapshot,parammap,observables',
    },
    {
      title: 'What is pathMatch: "full" and why is it important?',
      answer: `\`pathMatch\` controls how Angular matches the route's path against the current URL. The two values are \`'prefix'\` (default) and \`'full'\`.

- **\`'prefix'\`:** matches if the URL **starts with** the route path. The empty string \`''\` would match *every* URL.
- **\`'full'\`:** matches only when the URL **exactly equals** the route path.

\`\`\`typescript
const routes: Routes = [
  // Without pathMatch: 'full', this would redirect every URL to /home
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // only matches '/'

  { path: 'home', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
];
\`\`\`

**Common pitfall:**
\`\`\`typescript
// BAD: 'prefix' with empty path — infinite redirect loop
{ path: '', redirectTo: '/home' } // matches /products too → redirect /products to /home

// GOOD:
{ path: '', redirectTo: '/home', pathMatch: 'full' } // only '/' redirects
\`\`\`

Always use \`pathMatch: 'full'\` on empty-string redirects. For non-empty paths with \`redirectTo\`, consider which behavior you actually want.`,
      difficulty: 2,
      tags: 'routing,pathmatch,redirects,configuration,wildcard',
    },
    {
      title: 'What is a wildcard route and where should it be placed?',
      answer: `A wildcard route (\`path: '**'\`) matches any URL that hasn't been matched by previous routes. It's used for 404 pages, default redirects, or catch-all handling.

\`\`\`typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
  },
  // Wildcard MUST be last — Angular matches routes in order
  { path: '**', component: NotFoundComponent },
];
\`\`\`

**Why last:** Angular matches routes top-to-bottom and stops at the first match. If the wildcard appears before other routes, it would match everything and those routes would never activate.

**Using wildcard for redirects:**
\`\`\`typescript
// Redirect unknown routes to home
{ path: '**', redirectTo: '/', pathMatch: 'full' }
\`\`\`

In lazy-loaded feature modules, a \`**\` route inside the module only catches URLs within that module's path prefix — not the entire application.`,
      difficulty: 1,
      tags: 'routing,wildcards,404,not-found,order',
    },
    {
      title: 'What is a Route Resolver and when should it be used?',
      answer: `A **Resolver** pre-fetches data before a route activates, so the component always receives data immediately on render — no loading spinner inside the component.

\`\`\`typescript
// resolver
export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const id = route.paramMap.get('userId')!;

  return userService.getUser(id).pipe(
    catchError(() => {
      router.navigate(['/not-found']);
      return EMPTY; // cancel route activation
    }),
  );
};

// Route config
{
  path: 'users/:userId',
  component: UserDetailComponent,
  resolve: { user: userResolver },
}

// Component — data always available
@Component({ ... })
export class UserDetailComponent implements OnInit {
  ngOnInit(): void {
    this.user = this.route.snapshot.data['user'];
  }
}
\`\`\`

**When to use:** When showing an empty/loading state inside the component would be jarring (e.g., a detail page with no data). **Downside:** navigation appears delayed to the user — there's no feedback until data loads. Consider pairing with a global navigation progress indicator.`,
      difficulty: 2,
      tags: 'routing,resolvers,data-fetching,pre-fetching,navigation',
    },
    {
      title: 'What are child routes and how does nested <router-outlet> work?',
      answer: `Child routes render inside a parent component's \`<router-outlet>\`, creating nested layouts where part of the page changes based on the URL.

\`\`\`typescript
// Route definition
const routes: Routes = [
  {
    path: 'settings',
    component: SettingsLayoutComponent, // parent with its own <router-outlet>
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileSettingsComponent },
      { path: 'notifications', component: NotificationSettingsComponent },
      { path: 'billing', component: BillingSettingsComponent },
    ],
  },
];
\`\`\`

\`\`\`html
<!-- SettingsLayoutComponent template -->
<div class="settings-layout">
  <nav class="settings-sidebar">
    <a routerLink="profile">Profile</a>
    <a routerLink="notifications">Notifications</a>
    <a routerLink="billing">Billing</a>
  </nav>
  <main>
    <router-outlet></router-outlet>
    <!-- ProfileSettingsComponent renders here when on /settings/profile -->
  </main>
</div>
\`\`\`

Navigating to \`/settings/profile\` activates \`SettingsLayoutComponent\` in the app root outlet and renders \`ProfileSettingsComponent\` in the nested outlet.`,
      difficulty: 2,
      tags: 'routing,child-routes,nested-routes,router-outlet,layout',
    },
    {
      title: 'What is the difference between router.navigate() and navigateByUrl()?',
      answer: `Both navigate programmatically, but they differ in how they interpret the destination.

**\`router.navigate([commands], extras)\`:** takes an array of path segments. Supports relative navigation and relative query params.

**\`router.navigateByUrl(url, extras)\`:** takes a full URL string (absolute from root). Does not support relative navigation.

\`\`\`typescript
// navigate — preferred, explicit segments
this.router.navigate(['/users', userId, 'edit']);
this.router.navigate(['edit'], { relativeTo: this.route }); // relative to current

// navigateByUrl — full URL string
this.router.navigateByUrl('/users/42/edit');
this.router.navigateByUrl('/login?returnUrl=/dashboard');

// Navigation extras
this.router.navigate(['/login'], {
  queryParams: { returnUrl: '/admin' },
  fragment: 'form',
  replaceUrl: true,   // replace current history entry
  skipLocationChange: false,
});
\`\`\`

**Rule of thumb:** Use \`navigate\` for most cases — it's safer and supports relative routing. Use \`navigateByUrl\` when you already have a full URL string (e.g., from a redirect parameter).`,
      difficulty: 2,
      tags: 'routing,navigation,navigate,navigatebyurl,methods',
    },
    {
      title: 'What is routerLinkActive and how is active state handled?',
      answer: `\`routerLinkActive\` is a directive that adds one or more CSS classes to an element when its associated \`routerLink\` is active (matches the current URL).

\`\`\`html
<!-- Add 'active' class when route matches -->
<a routerLink="/home" routerLinkActive="active">Home</a>
<a routerLink="/about" routerLinkActive="active">About</a>

<!-- Multiple classes -->
<a routerLink="/products" routerLinkActive="active selected">Products</a>

<!-- Exact matching — only highlight /admin, not /admin/users -->
<a
  routerLink="/admin"
  routerLinkActive="active"
  [routerLinkActiveOptions]="{ exact: true }"
>
  Admin
</a>

<!-- Apply to parent element -->
<li routerLinkActive="active-li">
  <a routerLink="/settings">Settings</a>
</li>
\`\`\`

Without \`exact: true\`, \`/home\` would be active on both \`/home\` and \`/home/profile\`. The default behavior (prefix matching) is usually correct for non-root routes. For the root route (\`/\`), always use \`{ exact: true }\`.`,
      difficulty: 2,
      tags: 'routing,routerlinkactive,navigation,active-state,css',
    },
    {
      title: 'What is the inject() API in Angular and how does it improve DI?',
      answer: `\`inject()\` (Angular 14+) is a function that retrieves a dependency from the current injector context without constructor injection. It enables DI in **functional contexts** like guards, resolvers, and standalone utility functions.

\`\`\`typescript
// Old: constructor injection only possible in classes
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    return this.auth.isLoggedIn() || (this.router.navigate(['/login']), false);
  }
}

// New: functional guard with inject()
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/login']);
};

// In custom hooks / utility functions
export function withLogging<T>(source$: Observable<T>): Observable<T> {
  const logger = inject(LoggerService); // inject inside injection context
  return source$.pipe(tap(v => logger.log(v)));
}

// In component class — no constructor needed
@Component({ ... })
export class UserComponent {
  private userService = inject(UserService);
  private route       = inject(ActivatedRoute);
}
\`\`\``,
      difficulty: 2,
      tags: 'dependency-injection,inject-api,functional,guards,angular14',
    },
    {
      title: 'What is an InjectionToken and when would you use it?',
      answer: `An \`InjectionToken\` creates a unique DI token for values that aren't classes — like configuration objects, primitive values, or factory functions. It avoids collision that would occur if you used a string token.

\`\`\`typescript
import { InjectionToken, inject } from '@angular/core';

// Define the token
export interface AppConfig {
  apiUrl: string;
  featureFlags: Record<string, boolean>;
}
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

// Provide the value
@NgModule({
  providers: [
    {
      provide: APP_CONFIG,
      useValue: {
        apiUrl: 'https://api.example.com',
        featureFlags: { darkMode: true },
      },
    },
  ],
})
export class AppModule {}

// Inject anywhere
@Component({ ... })
export class HeaderComponent {
  private config = inject(APP_CONFIG);
  get apiUrl() { return this.config.apiUrl; }
}

// With tree-shakable provide
export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({ apiUrl: '/api', featureFlags: {} }),
});
\`\`\``,
      difficulty: 2,
      tags: 'dependency-injection,injection-token,configuration,providers',
    },
    {
      title: 'What are DI resolution modifiers @Optional, @Self, @SkipSelf?',
      answer: `These decorators modify how Angular's injector resolves a dependency, letting you control the resolution hierarchy.

- **\`@Optional()\`** — if the token isn't found, inject \`null\` instead of throwing
- **\`@Self()\`** — only look in the **current** component's injector, not parent injectors
- **\`@SkipSelf()\`** — skip the current injector, start resolution in the **parent** injector
- **\`@Host()\`** — stop resolution at the **host element** component

\`\`\`typescript
@Component({ ... })
export class MenuItemComponent {
  // Optional — works even without a MenuComponent parent
  private menu = inject(MenuComponent, { optional: true });

  // Self — only look in this component's injector
  private localService = inject(DataService, { self: true });

  // SkipSelf — get the parent's instance, not this component's
  private parentService = inject(DataService, { skipSelf: true });
}

// Old decorator syntax (equivalent)
constructor(
  @Optional() private menu: MenuComponent | null,
  @Self() private localService: DataService,
  @SkipSelf() private parentService: DataService,
) {}
\`\`\`

These are most useful when building component libraries where the same service token might be provided at different levels.`,
      difficulty: 3,
      tags: 'dependency-injection,optional,self,skipself,resolution',
    },
    {
      title: 'What is Renderer2 and why is direct DOM access discouraged in Angular?',
      answer: `\`Renderer2\` is Angular's abstraction layer for DOM manipulation. It delegates rendering to the correct platform implementation (browser, server, web worker) rather than calling \`document\` or \`element.style\` directly.

\`\`\`typescript
@Directive({ selector: '[appTooltip]' })
export class TooltipDirective {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  @HostListener('mouseenter') onEnter(): void {
    // BAD — breaks SSR and WebWorker rendering:
    // this.el.nativeElement.style.backgroundColor = 'yellow';

    // GOOD — platform-agnostic:
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', 'yellow');
    this.renderer.addClass(this.el.nativeElement, 'active');
    this.renderer.setAttribute(this.el.nativeElement, 'aria-expanded', 'true');
  }

  @HostListener('mouseleave') onLeave(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
    this.renderer.removeClass(this.el.nativeElement, 'active');
  }
}
\`\`\`

**Why avoid direct DOM access:**
- Angular Universal (SSR) runs on Node.js where \`document\` doesn't exist
- Web Worker rendering environments have no DOM
- Direct DOM mutations bypass Angular's change detection
- Security: \`Renderer2\` sanitizes values to prevent XSS`,
      difficulty: 2,
      tags: 'renderer2,dom,ssr,security,directives,angular-universal',
    },
    {
      title: 'How do you compare combineLatest, withLatestFrom, and forkJoin in RxJS?',
      answer: `All three combine multiple Observables, but they differ in emission behavior and use case.

**\`combineLatest([obs1, obs2])\`** — emits whenever **any** source emits, combining with the latest values of all others. Requires all sources to have emitted at least once.

**\`withLatestFrom(obs2)\`** — emits only when the **primary** Observable emits, pairing with the latest value from \`obs2\`. Does not emit if \`obs2\` hasn't emitted.

**\`forkJoin([obs1, obs2])\`** — waits for **all** Observables to **complete**, then emits an array of last values. Like \`Promise.all\`.

\`\`\`typescript
// combineLatest — live form calculations
combineLatest([price$, quantity$]).pipe(
  map(([price, qty]) => price * qty), // recalculates whenever either changes
).subscribe(total => this.total = total);

// withLatestFrom — augment a button click with current state
submitBtn$.pipe(
  withLatestFrom(formValues$),
  switchMap(([_, values]) => this.api.save(values)),
).subscribe();

// forkJoin — load required data before rendering
forkJoin([this.api.getUser(), this.api.getPermissions()]).subscribe(
  ([user, perms]) => this.init(user, perms),
);
\`\`\``,
      difficulty: 3,
      tags: 'rxjs,operators,combinelatest,withlatestfrom,forkjoin',
    },
    {
      title: 'How do you debug the "Expression has changed after it was checked" error?',
      answer: `This error occurs when Angular detects that a binding value changed **after** the current change detection cycle completed. It only appears in development (strict checking) and signals a real bug.

**Common causes:**
1. A lifecycle hook (\`ngAfterViewInit\`, \`ngAfterContentInit\`) modifies a template binding
2. A service or Observable emits synchronously inside a lifecycle hook
3. A getter returns a new object on each call

\`\`\`typescript
// BAD: modifying parent binding from ngAfterViewInit
@Component({ template: \`<h1>{{ title }}</h1>\` })
export class ParentComponent {
  title = 'initial';

  // WRONG: called after view is checked, parent's title binding already resolved
  @ViewChild(ChildComponent) child!: ChildComponent;
  ngAfterViewInit(): void {
    this.title = this.child.computedTitle; // Error!
  }
}

// FIX 1: setTimeout pushes update to next tick
ngAfterViewInit(): void {
  setTimeout(() => (this.title = this.child.computedTitle));
}

// FIX 2: schedule via ChangeDetectorRef
ngAfterViewInit(): void {
  this.cdr.detectChanges(); // forces a new CD cycle
  this.title = this.child.computedTitle;
}

// FIX 3: Move logic to ngOnInit if possible
\`\`\``,
      difficulty: 3,
      tags: 'debugging,change-detection,expressionchanged,lifecycle,errors',
    },
    {
      title: 'What is runOutsideAngular() and when do you use it for performance?',
      answer: `\`NgZone.runOutsideAngular(fn)\` executes code **outside Zone.js**, so Angular's change detection is not triggered by events within that block. Use it for high-frequency events that don't affect the view.

\`\`\`typescript
@Component({ ... })
export class CanvasComponent implements OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // BAD: triggers CD on every animation frame (60fps!)
    // requestAnimationFrame(() => this.animateLoop());

    // GOOD: run animation outside Angular — no CD triggered
    this.ngZone.runOutsideAngular(() => {
      this.animateLoop();
    });
  }

  private animateLoop(): void {
    this.draw();
    requestAnimationFrame(() => this.animateLoop());
  }

  // When a user interaction needs to update component state, re-enter Angular
  onUserInteraction(): void {
    this.ngZone.run(() => {
      this.score++; // triggers CD only when needed
    });
  }
}
\`\`\`

Common use cases: Canvas animations, \`requestAnimationFrame\` loops, WebSocket message handlers, heavy scroll/mousemove listeners.`,
      difficulty: 3,
      tags: 'ngzone,performance,change-detection,optimization,animations',
    },
    {
      title: 'What are the different binding types in Angular?',
      answer: `Angular has four main binding mechanisms for connecting template and component class.

**1. Property binding** — class → template (one-way, model to view):
\`\`\`html
<img [src]="imageUrl" />
<button [disabled]="isLoading">Save</button>
\`\`\`

**2. Event binding** — template → class (one-way, view to model):
\`\`\`html
<button (click)="save()">Save</button>
<input (blur)="validate($event)" />
\`\`\`

**3. Two-way binding** — both directions simultaneously:
\`\`\`html
<input [(ngModel)]="username" />
\`\`\`

**4. Interpolation** — string output only:
\`\`\`html
<p>Hello, {{ username }}</p>
\`\`\`

**5. Attribute binding** — for HTML attributes with no DOM property:
\`\`\`html
<td [attr.colspan]="columnSpan">...</td>
<div [attr.aria-label]="tooltip">...</div>
\`\`\`

**6. Class and style binding**:
\`\`\`html
<div [class.active]="isActive" [class]="classObject">
<div [style.color]="errorColor" [style]="styleObject">
\`\`\``,
      difficulty: 1,
      tags: 'data-binding,templates,property,event,two-way,interpolation',
    },
    {
      title: 'What are Angular modules and how do they organize an application?',
      answer: `An \`NgModule\` is a cohesive block of functionality defined with the \`@NgModule\` decorator. Modules declare components, direct imports from other modules, and provide services.

\`\`\`typescript
@NgModule({
  declarations: [
    ProductListComponent,    // components/pipes/directives OWNED by this module
    ProductCardComponent,
    PriceFilterPipe,
  ],
  imports: [
    CommonModule,            // import capabilities from other modules
    ReactiveFormsModule,
    ProductsRoutingModule,
  ],
  exports: [
    ProductCardComponent,    // expose to modules that import this one
  ],
  providers: [
    ProductService,          // services scoped to this module
  ],
})
export class ProductsModule {}
\`\`\`

**Module types:**
- **Root module** (\`AppModule\`) — bootstraps the app
- **Feature modules** — encapsulate a feature (lazy-loadable)
- **Shared modules** — export commonly used components (avoid providing services here)
- **Core module** — singleton services, imported once in AppModule

Angular 17+ pushes toward standalone components, making NgModules optional. New projects can be fully standalone.`,
      difficulty: 1,
      tags: 'modules,ngmodule,organization,architecture,declarations',
    },
    {
      title: 'How do you handle errors in Angular Observables?',
      answer: `Unhandled Observable errors complete the stream. Use RxJS error operators and Angular's global error handler to manage them gracefully.

\`\`\`typescript
// catchError — recover or rethrow
this.productService.getProducts().pipe(
  catchError((error: HttpErrorResponse) => {
    if (error.status === 404) return of([]); // recover with empty array
    return throwError(() => error);           // rethrow other errors
  }),
).subscribe(products => (this.products = products));

// retry — automatic retry on transient failures
this.api.getData().pipe(
  retry({ count: 3, delay: 1000 }), // retry 3 times with 1s delay
  catchError(err => of({ error: true, data: null })),
).subscribe();

// Global error handler for uncaught errors
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('Global error:', error);
    this.notificationService.showError('An unexpected error occurred');
  }
}

// Register in app
providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }]
\`\`\``,
      difficulty: 2,
      tags: 'observables,error-handling,rxjs,catcherror,retry',
    },
    {
      title: 'How do you implement reactive form validation in Angular?',
      answer: `Reactive forms use \`Validators\` attached to \`FormControl\` instances. Custom validators are functions returning \`null\` (valid) or a \`ValidationErrors\` object.

\`\`\`typescript
@Component({
  template: \`
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input formControlName="email" />
      <div *ngIf="email.invalid && email.touched">
        <span *ngIf="email.errors?.['required']">Email is required</span>
        <span *ngIf="email.errors?.['email']">Invalid email format</span>
      </div>
      <button [disabled]="form.invalid">Submit</button>
    </form>
  \`,
})
export class SignupComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), strongPassword]],
  }, { validators: passwordsMatch }); // cross-field validator

  get email() { return this.form.get('email')!; }

  constructor(private fb: FormBuilder) {}
}

// Custom validator
function strongPassword(control: AbstractControl): ValidationErrors | null {
  const hasNumber = /\\d/.test(control.value);
  return hasNumber ? null : { weakPassword: true };
}
\`\`\``,
      difficulty: 2,
      tags: 'reactive-forms,validation,validators,form-controls,forms',
    },
    {
      title: 'How do you share data between distant components using services?',
      answer: `When components are too far apart for prop passing or direct parent-child communication, a shared **singleton service** with a \`BehaviorSubject\` provides a reactive store.

\`\`\`typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this.itemsSubject.asObservable(); // read-only observable

  get itemCount(): number {
    return this.itemsSubject.getValue().length;
  }

  addItem(item: CartItem): void {
    const current = this.itemsSubject.getValue();
    this.itemsSubject.next([...current, item]);
  }

  removeItem(id: string): void {
    const updated = this.itemsSubject.getValue().filter(i => i.id !== id);
    this.itemsSubject.next(updated);
  }
}

// ProductComponent (anywhere in the tree)
export class ProductComponent {
  private cart = inject(CartService);
  addToCart(product: Product): void {
    this.cart.addItem({ id: product.id, name: product.name, price: product.price });
  }
}

// CartIcon (anywhere in the tree)
export class CartIconComponent {
  cartService = inject(CartService);
  // Template: {{ cartService.items$ | async | json }}
}
\`\`\``,
      difficulty: 2,
      tags: 'state-management,services,behaviorsubject,rxjs,communication',
    },
    {
      title: 'What is the Angular ErrorHandler class and how do you customize it?',
      answer: `Angular's default \`ErrorHandler\` logs errors to the console. By implementing a custom \`ErrorHandler\`, you can send errors to a monitoring service (Sentry, Datadog) or display user-friendly notifications.

\`\`\`typescript
import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private logger   = inject(LoggerService);
  private notifier = inject(NotificationService);

  handleError(error: unknown): void {
    // Extract useful info
    const message = error instanceof Error ? error.message : String(error);
    const stack   = error instanceof Error ? error.stack : undefined;

    // Log to monitoring service
    this.logger.captureException({ message, stack, timestamp: Date.now() });

    // Notify user for user-facing errors
    if (error instanceof HttpErrorResponse && error.status >= 500) {
      this.notifier.showError('Server error — please try again.');
    }

    // Don't swallow the error in development
    if (!environment.production) {
      console.error('[AppErrorHandler]', error);
    }
  }
}

// Provide in app
providers: [{ provide: ErrorHandler, useClass: AppErrorHandler }]
\`\`\``,
      difficulty: 2,
      tags: 'error-handling,global-handler,monitoring,services,providers',
    },
    {
      title: 'What is Angular\'s security model and how does it prevent XSS?',
      answer: `Angular's security model treats all user-supplied values as untrusted by default and **sanitizes** them before inserting into the DOM, preventing Cross-Site Scripting (XSS) attacks.

**Automatic sanitization:**
\`\`\`html
<!-- Angular sanitizes all interpolated and bound values -->
{{ userInput }}              <!-- HTML entities escaped -->
[innerHTML]="htmlContent"   <!-- HTML sanitized — scripts removed -->
[src]="imageUrl"            <!-- URL sanitized — javascript: blocked -->
\`\`\`

\`\`\`typescript
// Bypassing sanitization — use only when you know content is safe
import { DomSanitizer } from '@angular/platform-browser';

@Component({ template: \`<div [innerHTML]="safeHtml"></div>\` })
export class MarkdownComponent {
  private sanitizer = inject(DomSanitizer);
  // Only bypass if content comes from your own trusted markdown renderer
  safeHtml = this.sanitizer.bypassSecurityTrustHtml(renderedMarkdown);
}
\`\`\`

**Other security features:**
- \`Renderer2\` prevents direct DOM access that bypasses sanitization
- Angular HTTP client automatically adds XSRF tokens
- Template compilation prevents template injection (no \`eval\`-like behavior)
- AOT compilation eliminates the HTML parser at runtime — no opportunity for injection`,
      difficulty: 2,
      tags: 'security,xss,sanitization,domsanitizer,angular',
    },
    {
      title: 'What are @Input() / @Output() and EventEmitter?',
      answer: `\`@Input()\` declares a property that a parent component can set. \`@Output()\` exposes an \`EventEmitter\` that the parent can listen to. Together they form the public API of a component.

\`\`\`typescript
@Component({
  selector: 'app-rating',
  template: \`
    <div class="stars">
      @for (star of stars; track star) {
        <span
          [class.filled]="star <= value"
          (click)="onStarClick(star)"
        >★</span>
      }
    </div>
  \`,
})
export class RatingComponent {
  @Input() value = 0;          // receives current rating from parent
  @Input() max = 5;            // max stars
  @Output() valueChange = new EventEmitter<number>(); // enables [(value)] two-way binding

  stars = Array.from({ length: this.max }, (_, i) => i + 1);

  onStarClick(star: number): void {
    this.valueChange.emit(star);
  }
}

// Parent template
<app-rating [(value)]="productRating" [max]="5" />
// Equivalent to:
<app-rating [value]="productRating" (valueChange)="productRating = $event" [max]="5" />
\`\`\``,
      difficulty: 1,
      tags: 'inputs,outputs,event-emitter,component-communication,binding',
    },
    {
      title: 'What is @HostListener and @HostBinding?',
      answer: `These decorators let a directive interact with the **host element** — the element the directive is applied to.

**\`@HostListener(event)\`** — adds an event listener to the host element.

**\`@HostBinding(property)\`** — binds a directive class property to a host element DOM property or attribute.

\`\`\`typescript
@Directive({ selector: '[appDraggable]' })
export class DraggableDirective {
  private isDragging = false;

  @HostBinding('class.dragging')
  get dragClass() { return this.isDragging; } // adds/removes CSS class

  @HostBinding('attr.draggable')
  draggable = true; // sets the draggable HTML attribute

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    this.isDragging = true;
    event.dataTransfer?.setData('text/plain', 'dragging');
  }

  @HostListener('dragend')
  onDragEnd(): void {
    this.isDragging = false;
  }

  @HostListener('document:click', ['$event']) // listen to document events
  onDocumentClick(event: MouseEvent): void { /* ... */ }
}

// Usage: <div appDraggable>Drag me</div>
\`\`\``,
      difficulty: 2,
      tags: 'directives,hostlistener,hostbinding,host-element,decorators',
    },
    {
      title: 'What is trackBy in *ngFor and how does it improve rendering performance?',
      answer: `\`trackBy\` tells Angular how to identify items in a list. Without it, Angular recreates DOM nodes for every item on each change detection cycle when the array reference changes.

\`\`\`typescript
@Component({
  template: \`
    <!-- Without trackBy: rerenders entire list on any array change -->
    <li *ngFor="let user of users">{{ user.name }}</li>

    <!-- With trackBy: reuses existing DOM nodes, only changes what's different -->
    <li *ngFor="let user of users; trackBy: trackUserId">{{ user.name }}</li>
  \`,
})
export class UserListComponent {
  users: User[] = [];

  trackUserId(index: number, user: User): number {
    return user.id; // return unique, stable identifier
  }
}
\`\`\`

**Why it matters:** When you replace the array (e.g., after an API refresh), Angular sees new object references. Without \`trackBy\`, it destroys and recreates every DOM node. With \`trackBy\`, Angular matches items by the returned value — unchanged items keep their DOM nodes, only added/removed/changed items are updated.

Critical for large lists, lists with animations, or lists containing stateful child components (like expanded/collapsed state).`,
      difficulty: 2,
      tags: 'performance,ngfor,trackby,optimization,dom',
    },
    {
      title: 'How do you optimize an Angular production build?',
      answer: `Angular CLI's production build applies many optimizations automatically, but there are additional steps to minimize bundle size further.

\`\`\`bash
ng build --configuration production
# Applies: AOT, minification, tree-shaking, dead code elimination, source maps off
\`\`\`

**Additional optimizations:**

\`\`\`typescript
// 1. Lazy-load every feature module
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
}

// 2. OnPush everywhere
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })

// 3. Angular budgets — warns/errors on over-sized bundles
// angular.json
"budgets": [
  { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
  { "type": "anyComponentStyle", "maximumWarning": "2kb" }
]
\`\`\`

\`\`\`bash
# 4. Analyze bundle
npx source-map-explorer dist/my-app/main.*.js

# 5. Preload lazy chunks after initial load
RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
\`\`\`

Angular 17+ uses **esbuild** by default, which is significantly faster and produces smaller output than the legacy Webpack pipeline.`,
      difficulty: 3,
      tags: 'build-optimization,bundle-size,lazy-loading,onpush,performance',
    },
    {
      title: 'How do you implement custom preloading strategies for routes?',
      answer: `Angular's default preloading strategies are \`NoPreloading\` (none) and \`PreloadAllModules\` (all lazy chunks). Custom strategies let you preload selectively — e.g., only routes the user is likely to visit.

\`\`\`typescript
// Preload only routes with data: { preload: true }
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : EMPTY;
  }
}

// Route config
const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { preload: true }, // will be preloaded
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
    // no preload flag — loaded on demand only
  },
];

// Register strategy
RouterModule.forRoot(routes, {
  preloadingStrategy: SelectivePreloadingStrategy,
})
\`\`\``,
      difficulty: 3,
      tags: 'routing,preloading,lazy-loading,performance,strategy',
    },
    {
      title: 'What are common RxJS pitfalls that hurt Angular scalability?',
      answer: `RxJS is powerful but has sharp edges. These are the most common sources of bugs and memory leaks in Angular apps.

**1. Forgetting to unsubscribe:**
\`\`\`typescript
// BAD: subscription lives forever
ngOnInit() { this.service.data$.subscribe(d => this.data = d); }

// GOOD: takeUntilDestroyed (Angular 16+)
ngOnInit() {
  this.service.data$.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(d => this.data = d);
}
\`\`\`

**2. Using \`switchMap\` when \`mergeMap\` is needed (or vice versa):**
- \`switchMap\`: cancels previous — good for search (latest query wins)
- \`mergeMap\`: concurrent — good for independent operations (file uploads)
- \`concatMap\`: queue — good for ordered operations

**3. Creating nested subscribes:**
\`\`\`typescript
// BAD: nested subscribe
this.user$.subscribe(user => {
  this.orders$.subscribe(orders => { /* ... */ }); // new sub per emission!
});
// GOOD: use combineLatest or switchMap
\`\`\`

**4. Missing \`distinctUntilChanged\`** on form valueChanges causing duplicate API calls.

**5. Cold vs hot Observable confusion** — \`http.get()\` is cold (executes per subscriber); use \`shareReplay(1)\` to multicast.`,
      difficulty: 3,
      tags: 'rxjs,memory-leaks,subscriptions,scalability,anti-patterns',
    },
    {
      title: 'What is partial hydration in Angular and how does it improve SSR performance?',
      answer: `**Partial hydration** (Angular 17+) defers hydrating components until the user interacts with them, reducing the JavaScript executed on initial page load. Only a small runtime is hydrated upfront; the rest activates on demand.

\`\`\`typescript
// Defer hydration until component enters viewport
@Component({
  selector: 'app-product-list',
  template: \`
    @defer (on viewport; hydrate on viewport) {
      <app-product-card *ngFor="let p of products" [product]="p" />
    } @placeholder {
      <div class="skeleton" [style.height.px]="products.length * 80"></div>
    }
  \`,
})
export class ProductListComponent { ... }
\`\`\`

**How it works:**
1. Server renders full HTML (fast initial paint + SEO)
2. Browser downloads minimal hydration runtime
3. Components outside viewport remain as static HTML
4. As user scrolls or interacts, Angular downloads + hydrates that section

**Benefits:**
- Dramatically reduces Time to Interactive (TTI)
- Decreases JavaScript execution on mobile devices
- Better Core Web Vitals (INP, TBT)

This is Angular's equivalent of React's selective hydration and Astro's islands architecture.`,
      difficulty: 3,
      tags: 'hydration,ssr,partial-hydration,performance,angular17',
    },
    {
      title: 'What are the advantages of Angular over React and vice versa?',
      answer: `Neither is universally better — the right choice depends on team, project, and constraints.

**Angular advantages:**
- **Full framework** — routing, forms, HTTP, DI, animations all included
- **TypeScript-first** — deeper type integration throughout
- **Opinionated structure** — enforces consistency across large teams
- **Enterprise-ready** — built-in tooling, strict mode, extensive CLI
- **Long-term stability** — Google-backed, predictable release schedule
- **Built-in DI** — no need for a third-party IoC container

**React advantages:**
- **Smaller learning curve** — JSX is familiar JS, fewer concepts
- **Flexibility** — choose your own routing, state, forms
- **Larger ecosystem** — more third-party components and libraries
- **React Native** — same paradigm for mobile
- **React Server Components** — cutting-edge server-rendering model
- **Faster prototyping** — less boilerplate for small projects

**Choose Angular for:** large enterprise apps, teams needing strong conventions, full-stack TypeScript shops, apps with complex forms.

**Choose React for:** flexible architecture, startups, teams wanting control, cross-platform (web + mobile), projects leveraging Next.js.`,
      difficulty: 2,
      tags: 'comparison,angular,react,trade-offs,framework-selection',
    },
    {
      title: 'How does Angular Ivy improve the compilation pipeline?',
      answer: `Ivy replaced Angular's View Engine in v9, fundamentally changing how components compile and render.

**Locality principle:** Each component compiles independently using only its own metadata — no global compilation step required. This enables faster incremental builds and true tree-shaking.

**Tree-shakable instructions:** Ivy generates small instruction sets (\`ɵɵelement\`, \`ɵɵproperty\`) instead of monolithic NgFactory files. Unused Angular features are automatically removed from the bundle.

\`\`\`typescript
// Ivy-compiled component (simplified)
export class MyComponent {
  static ɵfac = () => new MyComponent();
  static ɵcmp = ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['app-my']],
    template: function(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, 'h1');
        ɵɵtext(1);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵadvance(1);
        ɵɵtextInterpolate(ctx.title);
      }
    }
  });
}
\`\`\`

**Concrete improvements:** ~25-40% smaller bundles for most apps, faster rebuild times, better debugging via \`ng\` DevTools API, and enablement of standalone components.`,
      difficulty: 2,
      tags: 'ivy,compilation,tree-shaking,performance,angular9,rendering',
    },
    {
      title: 'What is the MVVM architecture pattern in Angular?',
      answer: `MVVM (Model-View-ViewModel) is the design pattern Angular naturally implements:

- **Model:** Business data and logic (services, TypeScript interfaces, HTTP responses)
- **View:** The HTML template — what the user sees
- **ViewModel:** The component class — transforms Model data into View-ready properties and handles user events

\`\`\`typescript
// Model — data and domain logic
@Injectable({ providedIn: 'root' })
export class ProductService {
  getProducts(): Observable<Product[]> { return this.http.get<Product[]>('/api/products'); }
}

// ViewModel — component class
@Component({
  template: \`
    <div *ngFor="let vm of productViewModels">
      <h3>{{ vm.displayName }}</h3>
      <span [class]="vm.stockClass">{{ vm.stockLabel }}</span>
    </div>
  \`,
})
export class ProductListComponent implements OnInit {
  productViewModels: ProductViewModel[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products =>
      this.productViewModels = products.map(this.toViewModel) // model → viewmodel
    );
  }

  private toViewModel(p: Product): ProductViewModel {
    return {
      displayName: p.name.toUpperCase(),
      stockClass: p.stock > 0 ? 'in-stock' : 'out-of-stock',
      stockLabel: p.stock > 0 ? \`\${p.stock} left\` : 'Sold out',
    };
  }
}
\`\`\``,
      difficulty: 2,
      tags: 'architecture,mvvm,patterns,components,design',
    },
    {
      title: 'What are Signal effects in Angular and when should you use them?',
      answer: `\`effect()\` registers a reactive side effect that runs whenever any Signal it reads changes. Unlike \`computed()\`, an effect does not return a value — it exists purely for side effects.

\`\`\`typescript
import { signal, computed, effect } from '@angular/core';

@Component({ ... })
export class DarkModeComponent {
  theme = signal<'light' | 'dark'>('light');
  isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Effect runs whenever theme() changes
    effect(() => {
      document.body.classList.toggle('dark-mode', this.isDark());
      localStorage.setItem('theme', this.theme()); // sync to storage
    });
  }

  toggle(): void {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
\`\`\`

**When to use effects:**
- Syncing signal state to external systems (localStorage, DOM attributes, analytics)
- Logging signal changes for debugging
- Triggering imperative DOM operations based on reactive state

**When NOT to use effects:**
- Deriving state (use \`computed()\`)
- Updating other signals inside effects (creates unstable loops)
- Data fetching (use \`rxjs-interop\` \`toObservable\` instead)`,
      difficulty: 2,
      tags: 'signals,effects,reactivity,angular16,side-effects',
    },
    {
      title: 'What are Angular modules\' declarations and why can\'t you declare the same component twice?',
      answer: `The \`declarations\` array in \`@NgModule\` registers **ownership** of components, directives, and pipes. A declarable can only belong to **one module** — declaring it in two modules causes a compilation error.

\`\`\`typescript
// ERROR: UserCardComponent declared in two modules
@NgModule({ declarations: [UserCardComponent] })
export class UserModule {}

@NgModule({ declarations: [UserCardComponent] }) // compile error
export class AdminModule {}
\`\`\`

**Solution:** Create a shared module and export the component:
\`\`\`typescript
@NgModule({
  declarations: [UserCardComponent], // owned here
  exports: [UserCardComponent],      // made available to importers
})
export class SharedModule {}

// Both modules import SharedModule instead of re-declaring
@NgModule({ imports: [SharedModule] })
export class UserModule {}

@NgModule({ imports: [SharedModule] })
export class AdminModule {}
\`\`\`

With **standalone components**, this constraint disappears — standalone components declare their own dependencies via their \`imports\` array and can be used in any standalone or NgModule-based component without registering in a module.`,
      difficulty: 2,
      tags: 'modules,declarations,shared-module,exports,errors',
    },
    {
      title: 'What is HttpClientModule and how is it used?',
      answer: `\`HttpClientModule\` (or \`provideHttpClient()\` for standalone) registers Angular's \`HttpClient\` service and all related interceptor support into the DI system.

\`\`\`typescript
// NgModule-based setup
@NgModule({
  imports: [HttpClientModule],
})
export class AppModule {}

// Standalone setup (Angular 15+)
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch(), // use Fetch API instead of XHR (Angular 17+)
    ),
  ],
});

// Usage in a service
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUser(id: number): Observable<User> {
    return this.http.get<User>(\`/api/users/\${id}\`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>('/api/users', user);
  }

  updateUser(id: number, changes: Partial<User>): Observable<User> {
    return this.http.patch<User>(\`/api/users/\${id}\`, changes);
  }
}
\`\`\``,
      difficulty: 2,
      tags: 'http,httpclient,httpclientmodule,services,requests',
    },
    {
      title: 'How do you create dynamic components at runtime in Angular?',
      answer: `Use \`ViewContainerRef.createComponent()\` to dynamically instantiate and render a component programmatically — without placing its selector in the template.

\`\`\`typescript
@Component({
  selector: 'app-dialog-host',
  template: \`<ng-container #outlet></ng-container>\`,
})
export class DialogHostComponent {
  @ViewChild('outlet', { read: ViewContainerRef }) outlet!: ViewContainerRef;

  openDialog<T>(component: Type<T>, inputs: Partial<T>): ComponentRef<T> {
    this.outlet.clear();
    const ref = this.outlet.createComponent(component);

    // Set inputs on the component instance
    Object.assign(ref.instance as object, inputs);
    ref.changeDetectorRef.detectChanges();
    return ref;
  }
}

// Usage in a service
@Injectable({ providedIn: 'root' })
export class ModalService {
  private dialogHost = inject(DialogHostComponent);

  open(component: Type<unknown>, data: Record<string, unknown>): void {
    this.dialogHost.openDialog(component, data);
  }
}
\`\`\`

Angular 15+ supports signal-based input setting via \`ref.setInput('inputName', value)\` which respects the component's change detection properly.`,
      difficulty: 3,
      tags: 'dynamic-components,viewcontainerref,advanced,programmatic,angular',
    },
    {
      title: 'How do you internationalize an Angular application?',
      answer: `Angular provides built-in i18n through the \`@angular/localize\` package. Templates use \`i18n\` attributes; the Angular CLI extracts them to XLIFF/XMB files for translation.

\`\`\`html
<!-- Mark strings for extraction -->
<h1 i18n="Site header|Main page title@@siteHeader">Welcome to our app</h1>
<p i18n>Thank you for your purchase.</p>
<button i18n-title title="Add to cart">+</button>
\`\`\`

\`\`\`bash
# Extract messages to XLF file
ng extract-i18n --output-path src/locale

# Build for a specific locale
ng build --localize
# or
ng build --configuration=fr
\`\`\`

\`\`\`typescript
// angular.json — configure locales
"i18n": {
  "sourceLocale": "en-US",
  "locales": {
    "fr": { "translation": "src/locale/messages.fr.xlf" }
  }
}
\`\`\`

**For runtime translation (no rebuild per locale):**  Use **ngx-translate** or **transloco** which load translation JSON at runtime via HTTP and support lazy-loading per feature module.`,
      difficulty: 2,
      tags: 'i18n,localization,internationalization,angular-localize,translation',
    },
    {
      title: 'What is RouteReuseStrategy and when is it useful?',
      answer: `\`RouteReuseStrategy\` controls whether Angular destroys and recreates components on navigation or reuses the existing component instance and its DOM. The default strategy destroys and recreates on every navigation.

\`\`\`typescript
@Injectable()
export class CustomReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  // Should the outgoing route be stored?
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return !!route.data['reuse']; // only store routes with data: { reuse: true }
  }

  // Store the component's DOM subtree
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.storedRoutes.set(route.routeConfig!.path!, handle);
  }

  // Should we reattach a previously stored route?
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedRoutes.has(route.routeConfig!.path!);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.storedRoutes.get(route.routeConfig!.path!) ?? null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}

providers: [{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }]
\`\`\``,
      difficulty: 3,
      tags: 'routing,performance,route-reuse-strategy,advanced,caching',
    },
    {
      title: 'How do you subscribe to Router events in Angular?',
      answer: `\`Router.events\` is an Observable that emits navigation events throughout the router lifecycle. You can filter for specific event types to implement loading indicators, analytics, breadcrumbs, or auth checks.

\`\`\`typescript
@Component({ selector: 'app-root', template: \`<router-outlet />\` })
export class AppComponent implements OnInit {
  private router = inject(Router);
  isNavigating = false;

  ngOnInit(): void {
    this.router.events.pipe(
      takeUntilDestroyed(),
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      }
      if (event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError) {
        this.isNavigating = false;
      }
    });
  }
}

// Analytics: track page views
this.router.events.pipe(
  filter((e): e is NavigationEnd => e instanceof NavigationEnd),
).subscribe(event => {
  analytics.trackPageView(event.urlAfterRedirects);
});
\`\`\`

**Key Router event types:** \`NavigationStart\`, \`RoutesRecognized\`, \`GuardsCheckStart\`, \`GuardsCheckEnd\`, \`ResolveStart\`, \`ResolveEnd\`, \`NavigationEnd\`, \`NavigationCancel\`, \`NavigationError\`.`,
      difficulty: 2,
      tags: 'routing,events,navigation,observables,analytics',
    },
    {
      title: 'How would you plan a migration from RxJS streams to Signals?',
      answer: `Signals and RxJS coexist in Angular — the migration can be incremental. Use the \`rxjs-interop\` package to bridge between them.

\`\`\`typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({ ... })
export class ProductComponent {
  // Convert Observable → Signal (read-only)
  private products$ = this.productService.getProducts();
  products = toSignal(this.products$, { initialValue: [] });

  // Convert Signal → Observable (for RxJS operators)
  searchTerm = signal('');
  private searchTerm$ = toObservable(this.searchTerm);
  filteredProducts$ = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.productService.search(term)),
  );
  filteredProducts = toSignal(this.filteredProducts$, { initialValue: [] });
}
\`\`\`

**Migration strategy:**
1. **Don't rip-and-replace** — Signals and RxJS solve different problems
2. Replace simple \`BehaviorSubject\` service state with Signals
3. Keep RxJS for complex async pipelines (debounce, switchMap, combineLatest)
4. Use \`toSignal\` to consume HTTP observables in templates
5. Target: Signals for state, RxJS for async pipelines`,
      difficulty: 3,
      tags: 'migration,signals,rxjs,rxjs-interop,tosignal,toobservable',
    },
    {
      title: 'How do you break a monolithic Angular app into feature modules?',
      answer: `Feature modularization separates concerns, enables lazy loading, and enforces architectural boundaries. Apply it incrementally.

**Step 1 — Identify bounded contexts:**
Group by business domain: \`UserModule\`, \`ProductModule\`, \`OrderModule\`, not by type (\`ComponentsModule\`, \`ServicesModule\`).

**Step 2 — Create the module structure:**
\`\`\`bash
ng generate module features/orders --routing
# Creates: orders.module.ts, orders-routing.module.ts
\`\`\`

**Step 3 — Move declarations and update imports:**
\`\`\`typescript
@NgModule({
  declarations: [OrderListComponent, OrderDetailComponent, OrderStatusPipe],
  imports: [CommonModule, OrdersRoutingModule, SharedModule],
  providers: [OrderService], // scoped to this module
})
export class OrdersModule {}
\`\`\`

**Step 4 — Lazy-load in the root router:**
\`\`\`typescript
{ path: 'orders', loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule) }
\`\`\`

**Step 5 — Enforce boundaries with ESLint:**
Use \`@angular-eslint\` with import restriction rules or the **Sheriff** library to prevent cross-feature imports.`,
      difficulty: 3,
      tags: 'architecture,modularization,feature-modules,lazy-loading,refactoring',
    },
    {
      title: 'What are auxiliary routes (named outlets) in Angular?',
      answer: `Named outlets allow **multiple independent route configurations** to render simultaneously. Each named \`<router-outlet>\` can have its own active route, enabling things like a persistent sidebar or modal panel alongside the main content.

\`\`\`html
<!-- Template with named outlet -->
<router-outlet></router-outlet>            <!-- primary -->
<router-outlet name="sidebar"></router-outlet>  <!-- named -->
\`\`\`

\`\`\`typescript
// Routes for named outlet
const routes: Routes = [
  { path: 'products', component: ProductListComponent }, // primary
  { path: 'help', component: HelpPanelComponent, outlet: 'sidebar' }, // named
];

// Navigate to both outlets simultaneously
this.router.navigate([
  { outlets: { primary: ['products'], sidebar: ['help'] } }
]);

// URL: /products(sidebar:help)
// Clear named outlet
this.router.navigate([{ outlets: { sidebar: null } }]);
\`\`\`

**Use cases:** master-detail layouts, side panels, modal routes (chat windows that persist across navigation), secondary navigation bars. Be cautious — named outlets increase URL complexity and can confuse deep-linking.`,
      difficulty: 3,
      tags: 'routing,named-outlets,auxiliary-routes,advanced,sidebar',
    },
    {
      title: 'What are tree-shakable providers and how do they optimize bundle size?',
      answer: `A tree-shakable provider is registered directly on the service class with \`providedIn\`, rather than in an NgModule's \`providers\` array. This allows the bundler to eliminate the service from the bundle if it's never injected.

\`\`\`typescript
// NOT tree-shakable — always included in bundle because it's in the module
@NgModule({ providers: [ReportService] })
export class ReportModule {}

// TREE-SHAKABLE — removed if never injected anywhere
@Injectable({ providedIn: 'root' })
export class ReportService {
  generateReport(): void { /* ... */ }
}

// Scoped tree-shakable provider — only included if the feature module is loaded
@Injectable({ providedIn: ReportModule })
export class LegacyReportService { ... }

// Factory provider — also tree-shakable
export const LOGGER = new InjectionToken<Logger>('logger', {
  providedIn: 'root',
  factory: () => new ConsoleLogger(),
});
\`\`\`

When you use \`providedIn: 'root'\`, the compiler can prove at build time whether the service is ever referenced. If it's not injected by any component or service that is in the final bundle, the service code is eliminated entirely.`,
      difficulty: 2,
      tags: 'dependency-injection,tree-shaking,bundle-size,providers,optimization',
    },
    {
      title: 'How do you debug Angular applications using DevTools/Augury?',
      answer: `Angular provides multiple debugging tools for development.

**Angular DevTools (Chrome extension — official):**
\`\`\`
- Component tree explorer — inspect component hierarchy
- Profiler — record and replay change detection cycles
- Shows inputs/outputs for each component
- Identifies expensive CD cycles with flame graphs
\`\`\`

**Browser console (\`ng\` global — Ivy only):**
\`\`\`typescript
// Select element in DevTools → use $0 in console
ng.getComponent($0)      // get component instance
ng.getOwningComponent($0) // get closest component
ng.getContext($0)        // get context (for ngFor items)
ng.applyChanges($0)      // force change detection on component
ng.getDirectives($0)     // list directives on element
\`\`\`

**Debugging change detection:**
\`\`\`typescript
// Enable debug tools in main.ts
import { enableDebugTools } from '@angular/platform-browser';

platformBrowserDynamic().bootstrapModule(AppModule).then(appRef => {
  enableDebugTools(appRef.components[0]);
  // then in console: ng.profiler.timeChangeDetection()
});
\`\`\`

**RxJS debugging:** Use \`tap(console.log)\` to inspect Observable streams, or the \`rxjs-spy\` library for tagged stream monitoring.`,
      difficulty: 2,
      tags: 'debugging,devtools,angular-devtools,profiler,console',
    },
    {
      title: 'How do you unit test Angular components with Jasmine and TestBed?',
      answer: `\`TestBed\` is Angular's testing module that sets up a minimal Angular environment. It configures a testing module with declarations, imports, and providers, then creates the component for testing.

\`\`\`typescript
describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterComponent],
      // For standalone: imports: [CounterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // initial CD cycle
  });

  it('should start at 0', () => {
    expect(component.count).toBe(0);
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('0');
  });

  it('should increment on click', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges(); // apply state change to view
    expect(component.count).toBe(1);
  });

  it('should emit an event on reset', () => {
    spyOn(component.reset, 'emit');
    component.onReset();
    expect(component.reset.emit).toHaveBeenCalled();
  });
});
\`\`\``,
      difficulty: 2,
      tags: 'testing,unit-testing,jasmine,karma,testbed,angular',
    },
    {
      title: 'How do you test components that depend on HttpClient or routing?',
      answer: `Use \`HttpClientTestingModule\` and \`RouterTestingModule\` to provide mock HTTP and router infrastructure in TestBed.

\`\`\`typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('UserListComponent', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'users/:id', component: UserDetailComponent },
        ]),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserListComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify()); // ensure no unexpected requests

  it('should load users on init', () => {
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Alice' }]); // respond with mock data

    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Alice');
  });
});
\`\`\``,
      difficulty: 2,
      tags: 'testing,httpclienttestingmodule,routing,mocking,testbed',
    },
    {
      title: 'How do you add SSR to an existing Angular SPA with Angular Universal?',
      answer: `Angular 17+ ships SSR support built into the CLI via \`@angular/ssr\`.

\`\`\`bash
# Add SSR to existing project
ng add @angular/ssr

# This generates:
# - server.ts — Express server entry point
# - app.config.server.ts — server-side DI config
# - Updates angular.json with server target
\`\`\`

\`\`\`typescript
// app.config.server.ts
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
\`\`\`

**Guard browser-only code:**
\`\`\`typescript
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  getTheme(): string {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('theme') ?? 'light';
    }
    return 'light'; // default on server
  }
}
\`\`\`

Use \`TransferState\` to pass server-fetched data to the client, preventing double-fetching.`,
      difficulty: 3,
      tags: 'ssr,angular-universal,angular17,server-rendering,migration',
    },
    {
      title: 'What is the difference between providers and viewProviders in Angular?',
      answer: `Both configure dependency injection but differ in visibility to projected content.

**\`providers\`:** Services provided here are visible to the component **and all content projected into it** via \`<ng-content>\`.

**\`viewProviders\`:** Services provided here are visible only to the component's own template (view), **not** to projected content.

\`\`\`typescript
@Component({
  selector: 'app-card',
  template: \`
    <ng-content></ng-content>  <!-- projected content here -->
    <app-footer></app-footer>  <!-- own view template here -->
  \`,
  providers: [DataService],     // available to both projected content AND own view
  // viewProviders: [DataService], // only available to own view, NOT projected content
})
export class CardComponent {}

// If a component projected inside <app-card> injects DataService:
// - providers: succeeds (finds DataService)
// - viewProviders: fails (DataService not visible to projected content)
\`\`\`

This distinction matters when building reusable container components that accept projected slots. Use \`viewProviders\` to prevent projected components from accidentally accessing the host component's internal services.`,
      difficulty: 2,
      tags: 'dependency-injection,providers,viewproviders,projection,scope',
    },
    {
      title: 'What is the difference between a Component and a Directive in Angular?',
      answer: `Both are Angular class decorators, but they serve different purposes.

**Component (\`@Component\`)** has a template (HTML + styles) and a selector that creates a new custom DOM element. It always has a view.

**Directive (\`@Directive\`)** adds behavior to an **existing** element (attribute directive) or manipulates the DOM structure (structural directive). It has no template.

\`\`\`typescript
// Component — has a template, creates new UI
@Component({
  selector: 'app-badge',
  template: \`<span class="badge">{{ text }}</span>\`,
})
export class BadgeComponent {
  @Input() text = '';
}
// Usage: <app-badge text="New" />

// Directive — adds behavior to existing elements, no template
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @HostListener('mouseenter') onEnter() {
    this.el.nativeElement.style.background = 'yellow';
  }
  constructor(private el: ElementRef) {}
}
// Usage: <p appHighlight>Hover me</p>
\`\`\`

**Rule of thumb:** If you need a view (HTML), use a component. If you only need to add behavior or modify existing elements, use a directive. Every \`@Component\` is technically a directive with a template.`,
      difficulty: 1,
      tags: 'components,directives,comparison,decorators,angular',
    },
    {
      title: 'What is Angular Material and what does it provide?',
      answer: `**Angular Material** is the official UI component library for Angular, implementing Google's Material Design specification. It provides production-ready, accessible, and themeable components built on top of the Angular CDK.

\`\`\`bash
ng add @angular/material
\`\`\`

\`\`\`typescript
// Standalone component usage (Angular 17+)
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

@Component({
  standalone: true,
  imports: [MatButtonModule, MatInputModule, MatTableModule],
  template: \`
    <mat-form-field>
      <mat-label>Search</mat-label>
      <input matInput [(ngModel)]="query" />
    </mat-form-field>

    <mat-table [dataSource]="products">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let row">{{ row.name }}</mat-cell>
      </ng-container>
    </mat-table>

    <button mat-raised-button color="primary">Search</button>
  \`,
})
export class ProductSearchComponent { ... }
\`\`\`

**Components include:** buttons, inputs, autocomplete, datepicker, dialog, snackbar, tables with sorting/pagination, tabs, sidenav, chips, and more. Theme customization uses CSS custom properties and design tokens.`,
      difficulty: 1,
      tags: 'angular-material,ui-components,material-design,cdk,theming',
    },
    {
      title: 'How do you implement accessibility (a11y) best practices in Angular?',
      answer: `Angular and the CDK provide tools to build accessible applications that work with screen readers, keyboard navigation, and assistive technologies.

**1. Semantic HTML and ARIA attributes:**
\`\`\`html
<button (click)="openMenu()" [attr.aria-expanded]="isOpen" aria-haspopup="true">
  Menu
</button>
<nav [attr.aria-label]="'Main navigation'" role="navigation">
  <a *ngFor="let item of items" [routerLink]="item.path"
     [attr.aria-current]="isActive(item) ? 'page' : null">
    {{ item.label }}
  </a>
</nav>
\`\`\`

**2. CDK a11y tools:**
\`\`\`typescript
import { FocusTrap, FocusTrapFactory, LiveAnnouncer } from '@angular/cdk/a11y';

// Trap focus inside modal
const focusTrap = this.focusTrapFactory.create(this.modalEl.nativeElement);
focusTrap.focusFirstTabbableElement();

// Announce dynamic changes to screen readers
this.liveAnnouncer.announce('3 results found', 'polite');
\`\`\`

**3. Router focus management** — Angular Router sets focus after navigation:
\`\`\`typescript
RouterModule.forRoot(routes, { anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })
\`\`\`

**4. Always test** with axe-core (\`@axe-core/angular\`) and keyboard-only navigation.`,
      difficulty: 2,
      tags: 'accessibility,a11y,aria,cdk,screen-reader,keyboard',
    },
    {
      title: 'What are Angular template expressions and how do they differ from JavaScript?',
      answer: `Angular template expressions are evaluated in the context of the **component class**, not the global scope. They look like JavaScript but have important restrictions for security and performance.

**Allowed:** property access, method calls, ternary operators, arithmetic, string concatenation, nullish coalescing, optional chaining, logical operators.

**NOT allowed:** assignments (\`=\`, \`+=\`), \`new\` keyword, chained expressions with \`;\`, increment/decrement (\`++\`, \`--\`), bitwise operators, global access (\`window\`, \`document\`), \`typeof\`, \`instanceof\`.

\`\`\`html
<!-- Allowed -->
{{ user.name.toUpperCase() }}
{{ count > 10 ? 'many' : 'few' }}
{{ user?.address?.city ?? 'Unknown' }}
{{ getTotal() }}

<!-- NOT allowed — will error -->
{{ user.name = 'Bob' }}   <!-- assignment -->
{{ new Date() }}          <!-- new keyword -->
{{ window.location }}     <!-- global object -->
\`\`\`

**Why the restrictions:** Template expressions should be **pure and side-effect free**. They may run multiple times per change detection cycle. Assigning inside a template would cause the "expression changed after it was checked" error. For complex logic, always delegate to component methods.`,
      difficulty: 2,
      tags: 'templates,expressions,typescript,security,change-detection',
    },
    {
      title: 'What are Angular property, class, method, and parameter decorators?',
      answer: `Angular uses TypeScript decorators extensively at four levels:

**Class decorators** — define the type of Angular artifact:
\`\`\`typescript
@Component({ selector: 'app-root', template: '...' })
@Injectable({ providedIn: 'root' })
@NgModule({ declarations: [...] })
@Pipe({ name: 'truncate' })
\`\`\`

**Property decorators** — declare DI, inputs, outputs, queries:
\`\`\`typescript
@Input() title = '';
@Output() clicked = new EventEmitter<void>();
@ViewChild('btn') btnRef!: ElementRef;
@HostBinding('class.active') isActive = false;
\`\`\`

**Method decorators** — bind to host events:
\`\`\`typescript
@HostListener('click', ['$event'])
onClick(event: MouseEvent): void { ... }
\`\`\`

**Parameter decorators** — modify DI resolution:
\`\`\`typescript
constructor(
  @Inject(APP_CONFIG) private config: AppConfig,
  @Optional() private analyticsService: AnalyticsService | null,
  @Self() private localData: DataService,
) {}
\`\`\`

All Angular decorators are compile-time metadata that Ivy uses to generate component factories and DI instructions. They are TypeScript experimental decorators (Stage 3 proposal as of 2026).`,
      difficulty: 2,
      tags: 'decorators,metadata,typescript,di,angular,class-decorators',
    },
    {
      title: 'What are *ngIf and *ngFor structural directives?',
      answer: `Structural directives modify the DOM structure by adding or removing elements. They use the \`*\` prefix, which is syntactic sugar for \`<ng-template>\`.

**\`*ngIf\`** — conditionally renders an element:
\`\`\`html
<div *ngIf="isLoggedIn; else guestBlock">Welcome back!</div>
<ng-template #guestBlock><a routerLink="/login">Sign in</a></ng-template>

<!-- With then/else -->
<div *ngIf="user; then loggedInTpl; else loggedOutTpl"></div>
<ng-template #loggedInTpl>{{ user.name }}</ng-template>
<ng-template #loggedOutTpl>Please log in</ng-template>
\`\`\`

**\`*ngFor\`** — iterates over a collection:
\`\`\`html
<li *ngFor="let item of items; index as i; trackBy: trackById">
  {{ i + 1 }}. {{ item.name }}
</li>

<!-- Other exported variables -->
<div *ngFor="let item of items; first as isFirst; last as isLast; even as isEven">
  <span [class.first]="isFirst">{{ item.name }}</span>
</div>
\`\`\`

Angular 17+ provides equivalent block syntax (\`@if\`, \`@for\`) as the preferred alternative, with better type narrowing and performance.`,
      difficulty: 1,
      tags: 'directives,structural-directives,ngif,ngfor,dom,templates',
    },
    {
      title: 'How would you architect shared dashboard state in Angular?',
      answer: `For a dashboard with multiple widgets sharing state (selected filters, date range, refresh rate), the right architecture depends on complexity.

**Simple: shared service with Signals (Angular 17+):**
\`\`\`typescript
@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  dateRange   = signal<DateRange>({ start: startOfMonth(), end: new Date() });
  activeTab   = signal<string>('overview');
  isRefreshing = signal(false);

  filters = computed(() => ({
    start: this.dateRange().start,
    end: this.dateRange().end,
    tab: this.activeTab(),
  }));

  applyDateRange(range: DateRange): void {
    this.dateRange.set(range);
  }
}
\`\`\`

**Complex: NgRx for large teams with time-travel debugging:**
\`\`\`typescript
// Actions
export const setDateRange = createAction('[Dashboard] Set Date Range', props<{ range: DateRange }>());

// Selector
export const selectFilters = createSelector(selectDashboard, state => state.filters);

// Component
filters = this.store.selectSignal(selectFilters); // Signal from NgRx store
\`\`\`

Choose services + Signals for apps ≤ 5 developers or moderate complexity. Choose NgRx when you need strict unidirectional flow, action replay, or multiple developers modifying the same state domain.`,
      difficulty: 3,
      tags: 'state-management,architecture,signals,ngrx,services,dashboard',
    },
    {
      title: 'How do you configure CI/CD for an Angular application?',
      answer: `Angular CI/CD pipelines typically run lint, tests, and build on every PR, then deploy on merge to main.

**GitHub Actions example:**
\`\`\`yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }

      - run: npm ci
      - run: npx ng lint
      - run: npx ng test --watch=false --browsers=ChromeHeadless
      - run: npx ng build --configuration production

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npx ng build --configuration production
      - name: Deploy to Vercel
        run: npx vercel --prod --token=\${{ secrets.VERCEL_TOKEN }}
\`\`\`

**Key considerations:**
- Cache \`node_modules\` for faster runs
- Use \`--watch=false\` for Karma to exit after tests complete
- Enable \`--code-coverage\` and fail below a threshold
- Use \`ng build --configuration production\` to catch AOT errors in CI`,
      difficulty: 3,
      tags: 'cicd,deployment,github-actions,testing,automation,devops',
    },
    {
      title: 'How does Angular handle forms with FormArray for dynamic fields?',
      answer: `\`FormArray\` manages a collection of \`FormControl\`s or \`FormGroup\`s whose length can change dynamically — useful for "add another item" patterns.

\`\`\`typescript
@Component({
  template: \`
    <form [formGroup]="form">
      <div formArrayName="emails">
        @for (ctrl of emails.controls; track $index; let i = $index) {
          <div>
            <input [formControlName]="i" type="email" placeholder="Email" />
            <button type="button" (click)="removeEmail(i)">Remove</button>
          </div>
        }
      </div>
      <button type="button" (click)="addEmail()">+ Add email</button>
    </form>
  \`,
})
export class MultiEmailComponent {
  form = this.fb.group({
    emails: this.fb.array([this.fb.control('', Validators.email)]),
  });

  get emails(): FormArray {
    return this.form.get('emails') as FormArray;
  }

  addEmail(): void {
    this.emails.push(this.fb.control('', Validators.email));
  }

  removeEmail(index: number): void {
    this.emails.removeAt(index);
  }

  constructor(private fb: FormBuilder) {}
}
\`\`\``,
      difficulty: 2,
      tags: 'forms,formarray,reactive-forms,dynamic-forms,validation',
    },
    {
      title: 'What is the Angular DI hierarchy across lazy and eagerly loaded modules?',
      answer: `Angular's injector tree mirrors the module/component tree. Understanding it prevents duplicate service instances.

**Root injector** — created once at app startup. Services with \`providedIn: 'root'\` live here.

**Module injectors** — eagerly loaded module \`providers\` are merged into the root injector. Lazy-loaded modules get their **own child injector** — services provided there are only available within that lazy module.

\`\`\`typescript
// Eagerly loaded — service merged into root injector
@NgModule({ providers: [SharedService] })
export class SharedModule {} // SharedService is a root singleton

// Lazy loaded — gets its own injector
@NgModule({ providers: [CartService] }) // separate instance per lazy load!
export class CartModule {}

// To make a lazy service a root singleton, use providedIn: 'root':
@Injectable({ providedIn: 'root' })
export class CartService {} // always singleton regardless of module boundaries
\`\`\`

**Common pitfall:** Providing a service in both a lazy module's \`providers\` and a shared module imported by multiple lazy modules creates **multiple instances**. The components in each lazy chunk get different instances of the same service, causing state inconsistency.`,
      difficulty: 3,
      tags: 'dependency-injection,hierarchy,lazy-loading,modules,singleton',
    },
    {
      title: 'What is parameterized pipes and how do you pass multiple parameters?',
      answer: `Pipes accept additional arguments after the \`:\` separator in templates. Multiple parameters are separated by additional \`:\` characters.

\`\`\`typescript
// Custom parameterized pipe
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 100, ellipsis = '...'): string {
    if (!value || value.length <= limit) return value ?? '';
    return value.substring(0, limit) + ellipsis;
  }
}
\`\`\`

\`\`\`html
{{ article.body | truncate }}           <!-- default: 100 chars -->
{{ article.body | truncate:200 }}       <!-- limit: 200 -->
{{ article.body | truncate:50:'…' }}    <!-- limit: 50, ellipsis: '…' -->
\`\`\`

**Built-in parameterized pipes:**
\`\`\`html
{{ price | currency:'EUR':'symbol':'1.2-2' }}
{{ date | date:'longDate':'UTC':locale }}
{{ text | slice:0:50 }}
{{ 3.14159 | number:'1.1-2' }}  <!-- 1 integer, 1-2 decimal places -->
{{ 0.25 | percent:'1.0-0' }}    <!-- 25% -->
\`\`\`

Pipe parameters are evaluated as template expressions — you can pass component properties, not just literals.`,
      difficulty: 2,
      tags: 'pipes,parameters,formatting,templates,transform',
    },
    {
      title: 'What is the Angular Router\'s preloadingStrategy: PreloadAllModules?',
      answer: `After the initial app loads, \`PreloadAllModules\` downloads all lazy-loaded route chunks **in the background** during idle time. This combines the fast initial load of lazy loading with the fast subsequent navigation of eager loading.

\`\`\`typescript
// angular.json or AppRoutingModule
RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules,
})

// Standalone equivalent
provideRouter(routes, withPreloading(PreloadAllModules))
\`\`\`

\`\`\`typescript
// Custom selective preloading — only preload flagged routes
@Injectable({ providedIn: 'root' })
export class OptInPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] === true ? load() : EMPTY;
  }
}

const routes: Routes = [{
  path: 'dashboard',
  loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
  data: { preload: true }, // will be preloaded
}];
\`\`\`

**Timeline:**
1. Initial bundle loads → app is interactive
2. Idle time → lazy chunks download in background
3. User navigates to lazy route → instant (already cached)`,
      difficulty: 2,
      tags: 'routing,preloading,lazy-loading,performance,strategy',
    },
    {
      title: 'What are NgRx selectors and why are they important?',
      answer: `**Selectors** are pure functions that derive slices of state from the NgRx store. They are **memoized** — they recompute only when their input slices change.

\`\`\`typescript
import { createSelector, createFeatureSelector } from '@ngrx/store';

interface ProductsState { items: Product[]; loading: boolean; filter: string; }

// Feature selector — accesses the 'products' slice
const selectProductsFeature = createFeatureSelector<ProductsState>('products');

// Basic selectors
const selectAllProducts = createSelector(selectProductsFeature, s => s.items);
const selectFilter      = createSelector(selectProductsFeature, s => s.filter);
const selectLoading     = createSelector(selectProductsFeature, s => s.loading);

// Derived selector — memoized composition
const selectFilteredProducts = createSelector(
  selectAllProducts,
  selectFilter,
  (products, filter) => products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  ), // only recomputes when products or filter changes
);

// In component
@Component({ ... })
export class ProductListComponent {
  products   = this.store.selectSignal(selectFilteredProducts);
  isLoading  = this.store.selectSignal(selectLoading);
  constructor(private store: Store) {}
}
\`\`\`

Selectors keep components free of transformation logic, enable reuse across components, and prevent unnecessary re-renders via memoization.`,
      difficulty: 3,
      tags: 'ngrx,selectors,memoization,state-management,store',
    },
    {
      title: 'What is the Angular Router\'s NavigationExtras and its use cases?',
      answer: `\`NavigationExtras\` is the options object passed as the second argument to \`router.navigate()\` and \`router.navigateByUrl()\`. It controls how the navigation is recorded in history and what metadata is passed.

\`\`\`typescript
this.router.navigate(['/login'], {
  // Preserve or set query params
  queryParams: { returnUrl: '/admin', tab: 'settings' },
  queryParamsHandling: 'merge', // 'merge' | 'preserve' | '' (default: replace)

  // URL fragment (hash)
  fragment: 'section-3',

  // Replace current history entry instead of pushing
  replaceUrl: true,

  // Change URL without adding to history (for redirects)
  skipLocationChange: false,

  // Pass state data not visible in URL (cleared on refresh!)
  state: { fromPage: 'checkout', orderId: 42 },

  // Relative navigation
  relativeTo: this.activatedRoute,
});

// Read state in destination component
const nav = this.router.getCurrentNavigation();
const state = nav?.extras.state as { orderId: number };
// OR
const state = history.state as { orderId: number };
\`\`\`

\`state\` is useful for passing ephemeral data (like a just-created order ID) between routes without polluting the URL, but note it is lost on page refresh.`,
      difficulty: 2,
      tags: 'routing,navigationextras,navigation,state,queryparams',
    },
    {
      title: 'What is Angular\'s ng-template, ng-container, and ng-content?',
      answer: `Three special Angular template elements that serve different structural purposes.

**\`<ng-template>\`** — defines a block of HTML that is **not rendered by default**. Used with structural directives or referenced by \`ViewContainerRef\`.
\`\`\`html
<div *ngIf="isReady; else loadingTpl">Content ready</div>
<ng-template #loadingTpl><app-spinner /></ng-template>
\`\`\`

**\`<ng-container>\`** — a **zero-overhead grouping element** that renders its children without adding any DOM node. Useful for applying multiple structural directives or wrapping items without extra markup.
\`\`\`html
<ng-container *ngIf="user; let u">
  <h1>{{ u.name }}</h1>
  <p>{{ u.email }}</p>
</ng-container>
<!-- Renders h1 and p directly, no wrapping div in DOM -->
\`\`\`

**\`<ng-content>\`** — a **content projection slot**. Displays content passed between a component's opening and closing tags.
\`\`\`html
<!-- Parent: <app-card><p>Hello</p></app-card> -->
<!-- Component template: -->
<div class="card"><ng-content /></div>
<!-- Renders: <div class="card"><p>Hello</p></div> -->

<!-- Named slots: -->
<ng-content select="[slot=header]" />
<ng-content />
\`\`\``,
      difficulty: 2,
      tags: 'templates,ng-template,ng-container,ng-content,projection',
    },
    {
      title: 'What are common RxJS pitfalls in Angular and how do you avoid them?',
      answer: `**1. Not unsubscribing — causes memory leaks:**
\`\`\`typescript
// Problem
ngOnInit(): void {
  this.userService.getUser().subscribe(u => this.user = u); // leaks!
}

// Fix: use takeUntilDestroyed (Angular 16+)
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
constructor() {
  this.userService.getUser()
    .pipe(takeUntilDestroyed())
    .subscribe(u => this.user = u);
}
\`\`\`

**2. Nested subscriptions (subscribe inside subscribe):**
\`\`\`typescript
// Problem — leaks and race conditions
this.route.params.subscribe(p => {
  this.api.getItem(p['id']).subscribe(item => this.item = item);
});

// Fix: use switchMap
this.route.params.pipe(
  switchMap(p => this.api.getItem(p['id'])),
  takeUntilDestroyed(),
).subscribe(item => this.item = item);
\`\`\`

**3.** Using \`Subject\` instead of \`BehaviorSubject\` when late subscribers need the current value.
**4.** Forgetting \`catchError\` — an unhandled error terminates the stream, silently ignoring future events.
**5.** Re-creating observables in the template — use \`async\` pipe with \`shareReplay(1)\` to avoid multiple subscriptions per component.`,
      difficulty: 3,
      tags: 'rxjs,memory-leaks,subscriptions,best-practices,operators',
    },
    {
      title: 'What is partial hydration in Angular and how does it improve SSR performance?',
      answer: `**Full hydration** (Angular 17+): the server renders HTML, sends it to the client, then Angular reactivates the entire component tree — attaching event listeners, setting up change detection, and reconciling the DOM. This delays time-to-interactive on large pages.

**Partial hydration** (Angular 18+, via \`@defer\` + SSR): non-critical parts of the page stay as inert server-rendered HTML and hydrate lazily — only when scrolled into view, interacted with, or when the browser is idle.

\`\`\`html
<!-- Renders on the server; hydrates only when scrolled into view -->
@defer (on viewport; hydrate on viewport) {
  <app-comments [articleId]="id" />
}
@placeholder {
  <div class="comments-skeleton"></div>
}
\`\`\`

**Benefits:**
- Smaller JS execution on initial load — comment sections, footers, and sidebars are deferred
- Better Core Web Vitals (LCP, TTI, TBT)
- Above-the-fold components become interactive first

Combine with \`provideClientHydration(withEventReplay())\` (Angular 18) to buffer and replay events that fire before a component has hydrated.`,
      difficulty: 3,
      tags: 'hydration,ssr,angular18,performance,defer,partial-hydration',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
