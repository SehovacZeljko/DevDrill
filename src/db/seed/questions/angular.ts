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
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
