import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

const FUNDAMENTALS_LESSONS = [
  {
    title: 'What Laravel Is and Its Key Features',
    content: `Laravel is an open-source PHP web application framework created by Taylor Otwell in 2011, built to make common web development tasks — routing, sessions, caching, authentication — expressive and pleasant rather than repetitive boilerplate. It follows the MVC pattern and sits on top of several Symfony components, giving it a solid, battle-tested foundation while layering on its own developer-friendly conventions.

What sets Laravel apart from writing raw PHP is the amount of infrastructure it gives you for free: an ORM (Eloquent) for working with your database as objects, a templating engine (Blade) for views, a queue system for deferring slow work, a scheduler for cron-style tasks, and a service container that manages how classes are constructed and wired together.

\`\`\`php
// A minimal Laravel route — no boilerplate, no manual dispatching
Route::get('/welcome', function () {
    return view('welcome');
});
\`\`\`

**Key features that define Laravel:**
- **Eloquent ORM** — expressive ActiveRecord-style database access
- **Blade** — a lightweight templating engine with template inheritance
- **Artisan** — a CLI for code generation, migrations, and maintenance tasks
- **Service Container** — automatic dependency resolution and injection
- **Queues & Scheduler** — built-in tools for background work and cron jobs
- **Ecosystem** — first-party packages like Sanctum, Passport, Horizon, and Nova

In an interview, the strongest answer goes beyond "it's a PHP framework" — emphasize that Laravel's real value is convention over configuration: it gives every Laravel codebase a recognizable shape, so developers can move between projects without relearning architecture decisions.`,
  },
  {
    title: 'MVC Architecture in Laravel',
    content: `Laravel structures applications around the Model-View-Controller pattern, which separates an application into three responsibilities: **Models** represent and manage data (typically Eloquent classes mapped to database tables), **Views** render the presentation layer (Blade templates), and **Controllers** sit in between, receiving HTTP requests, coordinating with models, and returning a view or response.

\`\`\`php
// app/Http/Controllers/PostController.php
class PostController extends Controller
{
    public function show(int $id)
    {
        $post = Post::with('comments')->findOrFail($id);

        return view('posts.show', ['post' => $post]);
    }
}
\`\`\`

The benefit of this separation is testability and maintainability: business logic doesn't leak into templates, and templates don't need to know how data was fetched. In larger Laravel apps, you'll often see the pattern extended — for example, moving complex business logic out of controllers into dedicated **Service** or **Action** classes, keeping controllers thin and focused only on translating HTTP input into a response.

A common interview follow-up is "where does validation belong?" — the answer is Form Request classes (\`php artisan make:request\`), which keep validation rules out of the controller body while still running before the controller method executes.`,
  },
  {
    title: 'Composer and Dependency Management',
    content: `Composer is PHP's dependency manager — it resolves, downloads, and autoloads third-party packages, and Laravel itself is distributed and bootstrapped through it. Every Laravel project has a \`composer.json\` listing required packages and their version constraints, and a \`composer.lock\` file pinning the exact versions installed, which keeps every environment (local, staging, production) running identical dependency trees.

\`\`\`bash
composer require laravel/sanctum   # add a new package
composer install                  # install exactly what composer.lock specifies
composer update                   # resolve newer versions within constraints
composer dump-autoload             # regenerate the autoload class map
\`\`\`

Composer also powers PSR-4 autoloading: classes are loaded automatically based on namespace-to-directory mapping declared in \`composer.json\`, which is why you never need to manually \`require\` a class file in a Laravel app — \`use App\\Models\\Post;\` is enough.

In interviews, a good way to demonstrate depth is explaining **why \`composer.lock\` is committed to version control**: without it, two developers running \`composer install\` at different times could get different minor/patch versions of a dependency, leading to "works on my machine" bugs that are hard to trace back to a dependency drift.`,
  },
  {
    title: 'The Artisan CLI',
    content: `Artisan is Laravel's built-in command-line interface, included with every installation via the \`artisan\` file in the project root. It automates the tasks developers do constantly — generating boilerplate, running migrations, clearing caches, and inspecting the application — so you spend less time hand-writing repetitive files.

\`\`\`bash
php artisan make:model Product -mfs   # model + migration + factory + seeder
php artisan make:controller ProductController --resource
php artisan migrate
php artisan route:list
php artisan tinker                    # interactive REPL against your app
php artisan queue:work
\`\`\`

Artisan commands are themselves just classes (\`Illuminate\\Console\\Command\`), and you can write your own with \`php artisan make:command\` — useful for one-off maintenance scripts, scheduled jobs, or data backfills that need to run inside the full Laravel application context (with the container, config, and database connections already booted).

A frequently asked interview question is the difference between \`php artisan migrate\` and \`php artisan migrate:fresh\` — the former runs only pending migrations, while the latter drops every table and re-runs all migrations from scratch, which is destructive and should never run against production data.`,
  },
  {
    title: 'Routing Basics',
    content: `Routes map an incoming HTTP request (a method + URI) to the code that should handle it. In Laravel, routes are defined in \`routes/web.php\` (browser-facing, with session/CSRF middleware) and \`routes/api.php\` (stateless, token-based, prefixed with \`/api\`).

\`\`\`php
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']); // route model binding
Route::post('/posts', [PostController::class, 'store'])->middleware('auth');

Route::resource('posts', PostController::class); // generates all 7 RESTful routes
\`\`\`

Route parameters like \`{post}\` support **implicit model binding** — Laravel automatically resolves the \`Post\` model by its route key (usually \`id\`) and injects it directly into the controller method, throwing a 404 automatically if no matching record exists, instead of you writing \`Post::findOrFail()\` manually in every method.

Routes can be grouped to share attributes:

\`\`\`php
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
});
\`\`\`

A strong interview answer distinguishes route caching (\`php artisan route:cache\`) as a production optimization — it compiles all routes into a single file for faster lookup, but it does **not** support closures as route handlers, only controller class references, which is why production apps should avoid \`Route::get('/x', function () {...})\` style routes for cached routes.`,
  },
  {
    title: 'Controllers and Request Handling',
    content: `Controllers group related request-handling logic into a single class instead of scattering closures across route files. Laravel resolves controller dependencies automatically through the service container, so type-hinting a dependency in the constructor or method signature is enough to receive a working instance.

\`\`\`php
class PostController extends Controller
{
    public function store(Request $request, PostRepository $posts)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body'  => 'required|string',
        ]);

        $post = $posts->create($validated);

        return redirect()->route('posts.show', $post)->with('status', 'Post created!');
    }
}
\`\`\`

The injected \`Request $request\` gives access to input, files, headers, and the current user, while \`PostRepository $posts\` is resolved by the container without the controller needing to know how it's constructed — that's dependency injection in action, not just a buzzword.

For complex validation, **Form Request** classes (\`php artisan make:request StorePostRequest\`) move the \`validate()\` call and rules array out of the controller entirely; Laravel runs the request's \`authorize()\` and \`rules()\` methods automatically before the controller method ever executes, which keeps controllers focused purely on orchestration.`,
  },
  {
    title: 'The Blade Templating Engine',
    content: `Blade is Laravel's templating engine. Unlike many template languages, Blade templates are compiled down to plain PHP and cached, so there's effectively no runtime performance cost compared to writing raw PHP in your views — and you still get clean, readable syntax.

\`\`\`blade
@extends('layouts.app')

@section('content')
  <h1>{{ $post->title }}</h1>

  @if ($post->comments->isNotEmpty())
    <ul>
      @foreach ($post->comments as $comment)
        <li>{{ $comment->body }}</li>
      @endforeach
    </ul>
  @else
    <p>No comments yet.</p>
  @endif
@endsection
\`\`\`

\`{{ }}\` automatically escapes output through \`htmlspecialchars\`, which is Blade's default protection against XSS — use \`{!! !!}\` only when you explicitly trust the content and need raw HTML output. Blade also supports **components** (\`<x-alert type="error">...</x-alert>\`) for reusable UI pieces, and **layout inheritance** via \`@extends\`/\`@section\`/\`@yield\`, which avoids duplicating headers and navigation across every page.

A good interview talking point: Blade directives like \`@auth\`, \`@can\`, and \`@csrf\` aren't magic — they're just thin wrappers Laravel registers around common PHP conditionals and helper calls, and you can register your own custom directives with \`Blade::directive()\`.`,
  },
  {
    title: 'Database Configuration and Migrations',
    content: `Laravel abstracts database connection details into \`config/database.php\`, populated from environment variables in \`.env\` — meaning the same codebase can point at a local SQLite file in development and a MySQL or PostgreSQL cluster in production without code changes, only configuration changes.

Migrations are version control for your database schema: each migration is a timestamped PHP class with \`up()\` (apply the change) and \`down()\` (reverse it), letting a team evolve the schema together without manually running SQL on each other's machines.

\`\`\`php
// database/migrations/2024_01_01_000000_create_posts_table.php
public function up(): void
{
    Schema::create('posts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained();
        $table->string('title');
        $table->text('body');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('posts');
}
\`\`\`

\`\`\`bash
php artisan migrate              # apply pending migrations
php artisan migrate:rollback     # undo the last batch
php artisan migrate:status       # see what's applied
\`\`\`

Laravel tracks which migrations have already run in a \`migrations\` table, so re-running \`migrate\` is always safe — it only applies new files. This is the detail interviewers look for: migrations are additive and idempotent by design, not a script you run once and forget.`,
  },
  {
    title: 'Eloquent ORM Basics',
    content: `Eloquent is Laravel's ActiveRecord-style ORM: each database table has a corresponding Model class, and each row is represented as an instance of that model with attributes mapped to columns. It removes the need to hand-write most SQL for everyday CRUD operations.

\`\`\`php
class Post extends Model
{
    protected $fillable = ['title', 'body', 'user_id'];
}

$post = Post::create(['title' => 'Hello', 'body' => '...', 'user_id' => 1]);

$published = Post::where('published', true)->orderBy('created_at', 'desc')->get();

$post->title = 'Updated title';
$post->save();

$post->delete();
\`\`\`

By convention, Eloquent assumes a model \`Post\` maps to a table named \`posts\` (snake_case, plural) and has an auto-incrementing \`id\` primary key — all of which can be overridden, but the defaults mean a brand-new model needs almost no configuration to work.

\`$fillable\` (or its inverse, \`$guarded\`) controls **mass assignment protection** — without declaring which attributes can be set in bulk via \`create()\` or \`fill()\`, a malicious request could inject unexpected columns (like an \`is_admin\` flag) into a mass-assignment call. This is a question interviewers ask specifically to check security awareness, not just ORM familiarity.`,
  },
  {
    title: 'Eloquent Relationships',
    content: `Eloquent relationships let you express how tables relate to each other as methods on the model, and Laravel handles the underlying joins and foreign key lookups for you. The core relationship types are \`hasOne\`, \`hasMany\`, \`belongsTo\`, \`belongsToMany\`, and the polymorphic variants \`morphTo\`/\`morphMany\`.

\`\`\`php
class User extends Model
{
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}

class Post extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class); // uses a post_tag pivot table
    }
}

$user->posts;             // lazy-loaded collection of Post models
$post->user->name;        // belongsTo, single related model
$post->tags()->attach(3); // pivot table management
\`\`\`

The single most important performance concept tied to relationships is **eager loading**. Accessing \`$post->user\` inside a loop over many posts triggers one query *per post* — the N+1 query problem. Calling \`Post::with('user')->get()\` instead loads all related users in a single additional query, regardless of how many posts there are. Recognizing and fixing N+1 queries is one of the most common Laravel interview and code-review topics.`,
  },
  {
    title: 'Database Seeding and Factories',
    content: `Seeders populate the database with data — useful for default records every environment needs (like an admin user or lookup tables) and for generating realistic fake data during development and testing. Factories define *how* to generate a fake instance of a model; seeders decide *how many* and *when*.

\`\`\`php
// database/factories/PostFactory.php
class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'body'  => fake()->paragraphs(3, true),
            'user_id' => User::factory(),
        ];
    }
}

// database/seeders/DatabaseSeeder.php
public function run(): void
{
    User::factory(10)->has(Post::factory(5))->create();
}
\`\`\`

\`\`\`bash
php artisan db:seed
php artisan migrate:fresh --seed
\`\`\`

Factories are heavily relied on in feature tests too — \`Post::factory()->create()\` gives a test a real, persisted model without manually constructing one field at a time, and \`->make()\` builds an unsaved instance when a test doesn't need a database row at all.

A useful interview distinction: seeders are meant to run in any environment (including production, for things like default roles), while factories are explicitly a **testing/development** tool and should never be relied on to create real production data.`,
  },
  {
    title: 'Middleware',
    content: `Middleware are layers that requests pass through before reaching your route/controller, and that responses pass back through afterward — a filtering and inspection mechanism for cross-cutting concerns like authentication, logging, and CORS, without scattering that logic across every controller.

\`\`\`php
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->isAdmin()) {
            abort(403);
        }

        return $next($request);
    }
}
\`\`\`

\`\`\`php
// app/Http/Kernel.php
protected $middlewareAliases = [
    'admin' => EnsureUserIsAdmin::class,
];

// routes
Route::get('/admin', AdminController::class)->middleware('admin');
\`\`\`

The \`$next($request)\` call is what makes middleware composable — calling it passes control to the next layer in the pipeline (another middleware, or finally the route handler), and code *after* that call runs on the way back out, which is how middleware like response compression or response-time logging works.

Laravel ships with several middleware already wired in globally (like \`TrimStrings\` and \`VerifyCsrfToken\`) and lets you assign others per-route or per-group — knowing the difference between **global**, **route**, and **group** middleware registration is a common practical interview question.`,
  },
  {
    title: 'Authentication and CSRF Protection',
    content: `Laravel's authentication system (often scaffolded via Breeze, Jetstream, or Fortify) handles registering users, hashing passwords, and managing login sessions, built on top of "guards" (how a user is authenticated per request — session or token) and "providers" (how user records are retrieved, typically Eloquent).

\`\`\`php
if (Auth::attempt(['email' => $email, 'password' => $password])) {
    $request->session()->regenerate();
    return redirect()->intended('/dashboard');
}

// In a controller or middleware
$user = Auth::user();
Auth::logout();
\`\`\`

Passwords are never stored or compared in plain text — Laravel uses \`Hash::make()\` (bcrypt/argon2 under the hood) when creating users, and \`Auth::attempt()\` handles the secure comparison internally.

**CSRF (Cross-Site Request Forgery) protection** guards against a malicious site tricking a logged-in user's browser into submitting a request to your app. Laravel generates a per-session token and the \`VerifyCsrfToken\` middleware rejects any state-changing request (POST/PUT/PATCH/DELETE) that doesn't include a matching token.

\`\`\`blade
<form method="POST" action="/posts">
    @csrf
    <!-- ... -->
</form>
\`\`\`

API routes are typically exempt from CSRF checks because they authenticate via tokens (Sanctum/Passport) rather than cookies/sessions — a frequent interview question is explaining *why* that exemption is safe: CSRF specifically exploits cookie-based session auth, which stateless token APIs don't rely on.`,
  },
];

const ADVANCED_LESSONS = [
  {
    title: 'The Service Container',
    content: `The service container is Laravel's mechanism for managing class dependencies and performing dependency injection. Instead of every class manually instantiating the things it depends on, classes declare what they need (usually via constructor type-hints), and the container figures out how to build it — recursively resolving each dependency's own dependencies.

\`\`\`php
class PostController extends Controller
{
    public function __construct(private PostRepository $posts) {}
}
\`\`\`

When Laravel needs a \`PostController\`, it inspects the constructor, sees it needs a \`PostRepository\`, and — if \`PostRepository\` has no further unresolvable dependencies — builds one automatically via reflection. No manual \`new PostRepository()\` call is needed anywhere.

For interfaces, you bind a concrete implementation explicitly:

\`\`\`php
// In a service provider's register() method
$this->app->bind(PaymentGatewayInterface::class, StripeGateway::class);

// Anywhere the interface is type-hinted, Laravel resolves a StripeGateway
public function __construct(private PaymentGatewayInterface $gateway) {}
\`\`\`

This indirection is what makes swapping implementations (e.g. for testing, with a fake gateway) trivial — code depends on the interface, never the concrete class. \`singleton()\` bindings resolve the same instance on every request within that request lifecycle, useful for things like a single shared cache connection, while \`bind()\` resolves a fresh instance every time it's requested.`,
  },
  {
    title: 'Service Providers',
    content: `Service providers are the central place where Laravel applications are bootstrapped — every core feature (routing, queues, the database, validation) is registered through a service provider, and your own application code follows the same pattern for its own bindings.

\`\`\`php
class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentGatewayInterface::class, function ($app) {
            return new StripeGateway(config('services.stripe.key'));
        });
    }

    public function boot(): void
    {
        // Runs after all providers are registered — safe to use other bindings here
        Gate::define('manage-payments', fn ($user) => $user->isAdmin());
    }
}
\`\`\`

\`register()\` should only bind things into the container — it must not depend on other services being available yet, since provider registration order isn't guaranteed. \`boot()\` runs after *every* provider's \`register()\` has executed, so it's the safe place to use bindings that other providers set up, define gates/policies, register view composers, or listen for events.

Providers are listed in \`bootstrap/providers.php\` (Laravel 11+) or \`config/app.php\` in earlier versions. Package authors ship their own service providers so installing a package via Composer can automatically register routes, config, and bindings — that auto-discovery mechanism is *why* \`composer require\` alone is often enough to "install" a Laravel package with zero manual wiring.`,
  },
  {
    title: 'Dependency Injection in Practice',
    content: `Dependency injection (DI) means a class receives its collaborators from the outside rather than constructing them itself — and Laravel's service container makes DI close to free, since you rarely write the resolution code by hand. The practical payoff is testability: a class depending on an interface can be tested with a fake or mock implementation instead of a real database or external API call.

\`\`\`php
interface NotifierInterface
{
    public function send(string $message): void;
}

class OrderService
{
    public function __construct(private NotifierInterface $notifier) {}

    public function complete(Order $order): void
    {
        $order->markComplete();
        $this->notifier->send("Order #{$order->id} completed");
    }
}
\`\`\`

In a test, you bind a fake notifier instead of a real SMS/email service:

\`\`\`php
$this->app->bind(NotifierInterface::class, FakeNotifier::class);

$service = $this->app->make(OrderService::class);
$service->complete($order);
// assert FakeNotifier captured the expected message, with no real network call made
\`\`\`

Method injection works the same way for controller actions and even closures passed to the container — Laravel resolves type-hinted parameters automatically, which is why a controller method can type-hint \`Request $request\` *and* a custom service in the same signature, in any order, and both resolve correctly.`,
  },
  {
    title: 'Advanced Eloquent: Scopes, Events, and Observers',
    content: `Beyond basic queries, Eloquent offers several tools for keeping model-related logic organized and reusable. **Local scopes** encapsulate common query constraints as readable, chainable methods:

\`\`\`php
class Post extends Model
{
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('published', true);
    }
}

Post::published()->latest()->get();
\`\`\`

**Model events** (\`creating\`, \`created\`, \`updating\`, \`deleting\`, etc.) fire automatically at points in a model's lifecycle, and can be hooked into directly in the model or, more cleanly, in a dedicated **Observer** class:

\`\`\`php
class PostObserver
{
    public function created(Post $post): void
    {
        Cache::forget('posts.count');
    }

    public function deleting(Post $post): void
    {
        $post->comments()->delete();
    }
}

// In a service provider's boot()
Post::observe(PostObserver::class);
\`\`\`

Observers are preferred over stuffing event logic directly into the model class because they keep the model focused on data/relationships while side effects (cache invalidation, cleanup, notifications) live separately and can be unit tested independently.

A nuanced interview point: \`deleting\`/\`deleted\` events do **not** fire on bulk operations like \`Post::where(...)->delete()\`, since those run a single SQL statement without instantiating each model — only operations that load and act on individual model instances trigger lifecycle events.`,
  },
  {
    title: 'Queues and Job Processing',
    content: `Queues let slow or non-critical work — sending emails, processing uploaded video, calling a third-party API — run asynchronously in the background instead of blocking the HTTP response the user is waiting on. A **Job** class encapsulates one unit of work and is dispatched onto a queue backed by a driver (database, Redis, SQS, etc.).

\`\`\`php
class SendWelcomeEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(private User $user) {}

    public function handle(): void
    {
        Mail::to($this->user)->send(new WelcomeEmail($this->user));
    }
}

SendWelcomeEmail::dispatch($user);          // runs async, on the default queue
SendWelcomeEmail::dispatch($user)->onQueue('emails')->delay(now()->addMinutes(5));
\`\`\`

\`\`\`bash
php artisan queue:work          # start a worker process that pulls and runs jobs
php artisan queue:failed        # list jobs that exhausted their retries
\`\`\`

Failed jobs are retried automatically (configurable via \`$tries\` and backoff settings) and, after exhausting retries, are recorded in a \`failed_jobs\` table for inspection and manual retry. A job should be designed to be **idempotent** where possible — since a worker crash mid-execution can cause Laravel to re-attempt a job that partially completed, and a non-idempotent job (e.g. one that charges a credit card without checking if it already succeeded) can cause real damage on retry.`,
  },
  {
    title: 'Task Scheduling',
    content: `Laravel's scheduler replaces the need to hand-write and manage individual cron entries for every recurring task. Instead, all scheduled jobs are defined as fluent PHP in one place, and a single cron entry runs the scheduler itself every minute, which then decides what's actually due to run.

\`\`\`php
// routes/console.php (Laravel 11+) or app/Console/Kernel.php
Schedule::command('reports:generate')->dailyAt('01:00');
Schedule::job(new CleanupOldExports)->weekly();
Schedule::call(fn () => Cache::forget('stats'))->everyFiveMinutes();
\`\`\`

\`\`\`bash
# The only crontab entry needed, ever:
* * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
\`\`\`

Because the schedule lives in version-controlled PHP rather than scattered server crontabs, every environment (and every developer's checkout) automatically has an identical schedule with zero manual server configuration beyond that one bootstrap cron line.

\`->withoutOverlapping()\` prevents a long-running scheduled task from starting a second overlapping instance if the previous run hasn't finished, and \`->onOneServer()\` ensures a task only runs on a single machine when an app is deployed across multiple servers — both are common production concerns interviewers probe for, since naive scheduling can cause duplicate work or race conditions at scale.`,
  },
  {
    title: 'Caching Strategies',
    content: `Laravel provides a unified caching API across drivers (Redis, Memcached, the database, or the filesystem), so application code doesn't need to change when the underlying cache store does — only configuration does.

\`\`\`php
Cache::put('settings', $settings, now()->addHours(6));
$settings = Cache::get('settings');

// "remember" is the idiomatic pattern: compute-and-cache in one call
$popularPosts = Cache::remember('posts.popular', 3600, function () {
    return Post::orderByDesc('views')->take(10)->get();
});

Cache::forget('posts.popular'); // manual invalidation
\`\`\`

The hardest part of caching is rarely the API — it's **invalidation**: deciding when cached data becomes stale and must be cleared. A common approach is invalidating in a model observer whenever the underlying data changes (e.g. clearing \`posts.popular\` in a \`Post\` observer's \`saved\`/\`deleted\` hooks), so the cache and database can never drift apart for long.

For data that's expensive to compute but tolerant of slight staleness, **cache tags** (Redis/Memcached only) let you invalidate a whole group of related keys at once rather than tracking every individual key. Interviewers often probe for awareness that caching introduces a consistency tradeoff — the right cache duration depends on how stale the data is allowed to be, not just how expensive it is to compute.`,
  },
  {
    title: 'API Resources and Collections',
    content: `API Resources transform Eloquent models (and collections of them) into a controlled JSON shape, decoupling your API's public response format from your internal database schema — so renaming a column or adding an internal field never accidentally leaks into, or breaks, your API contract.

\`\`\`php
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->user->name,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}

// In a controller
return new PostResource($post);
return PostResource::collection(Post::paginate(20));
\`\`\`

Resource **collections** automatically wrap paginated results with \`data\` and \`meta\`/\`links\` keys, so pagination metadata (current page, total, next/prev links) is included consistently without manual formatting in every endpoint.

\`whenLoaded('comments')\` is a key performance pattern inside a resource — it includes a relationship in the response *only if it was already eager-loaded* by the controller, preventing the resource from silently triggering an extra N+1 query just to decide whether to include a field. This distinction (resources shaping output vs. controllers controlling what's loaded) is a frequent senior-level interview topic.`,
  },
  {
    title: 'Laravel Sanctum for API Authentication',
    content: `Sanctum provides a lightweight authentication system for two common scenarios: SPA authentication (a JavaScript frontend talking to the same Laravel backend, using cookies) and API token authentication (mobile apps or third-party clients, using personal access tokens).

\`\`\`php
// Issuing a token for a mobile/API client
$token = $user->createToken('mobile-app')->plainTextToken;

// Protecting an API route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Client sends it back as a Bearer token
// Authorization: Bearer <token>
\`\`\`

For SPA mode, Sanctum doesn't issue a token at all — it relies on Laravel's normal cookie-based session, with Sanctum's middleware adding CSRF protection so a first-party SPA on the same top-level domain can authenticate exactly like a traditional session-based app, while still being treated as a "stateless" API from the frontend's perspective.

Tokens can be scoped with **abilities** (\`createToken('mobile-app', ['posts:read'])\`) and checked with \`$request->user()->tokenCan('posts:read')\`, giving fine-grained permission control per issued token — useful when a single user might have both a full-access web session and a limited-scope token issued to a third-party integration.

The key interview distinction from Passport: Sanctum is intentionally simple (no OAuth2 flows, no scopes negotiation, no token refresh dance) and is the right default for first-party apps; Passport exists for full OAuth2, including third-party developers authorizing access to your API on a user's behalf.`,
  },
  {
    title: 'Laravel Passport and OAuth2',
    content: `Passport provides a full OAuth2 server implementation for Laravel applications, used when your API needs to support third-party applications requesting access on behalf of a user — the same pattern as "Login with Google" or "Connect your GitHub account," but for your own API.

\`\`\`bash
php artisan passport:install   # generates encryption keys and OAuth client records
\`\`\`

\`\`\`php
// config/auth.php
'api' => ['driver' => 'passport', 'provider' => 'users'],

Route::middleware('auth:api')->get('/user', fn (Request $r) => $r->user());
\`\`\`

Passport supports the standard OAuth2 grant types: **authorization code** (the most common — a third-party app redirects the user to log in and approve access, then exchanges a code for a token), **password grant** (the app collects credentials directly — generally discouraged unless it's your own first-party client), **client credentials** (machine-to-machine, no user involved), and **personal access tokens** (similar in spirit to Sanctum's tokens, for quick API access without a full OAuth flow).

The practical interview signal here is knowing *when not* to reach for Passport: if you only need first-party authentication for your own SPA or mobile app, Sanctum is simpler, has less attack surface, and avoids the operational overhead of managing OAuth clients, scopes, and token refresh flows that Passport requires even when you don't need them.`,
  },
  {
    title: 'Facades Internals',
    content: `Facades are static-looking interfaces to classes that are actually resolved from the service container at runtime — \`Cache::get(...)\` looks like a static call, but under the hood it's calling \`__callStatic\`, which resolves the real \`cache\` binding from the container and calls \`get()\` on that instance.

\`\`\`php
class Cache extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'cache'; // the container binding this facade proxies to
    }
}
\`\`\`

Because the underlying object is still resolved through the container, facades remain swappable and testable — \`Cache::shouldReceive('get')->andReturn('fake-value')\` works in tests because Laravel temporarily replaces the resolved instance with a mock that the facade transparently proxies to, no different from injecting a mock directly.

The honest tradeoff interviewers want you to articulate: facades read cleanly and require no constructor injection boilerplate, but they hide a class's real dependencies — a class littered with \`Cache::\`, \`Auth::\`, and \`Mail::\` calls doesn't declare those dependencies in its constructor, making them invisible until you read the method bodies. Many teams prefer constructor-injected dependencies in core business logic and reserve facades for quick, low-stakes usage (like in a controller or a one-off script) — knowing this distinction signals architectural maturity, not just Laravel trivia.`,
  },
  {
    title: 'Testing: Unit and Feature Tests',
    content: `Laravel ships with PHPUnit (or Pest) integration out of the box, plus a rich set of testing helpers layered on top. The framework draws a clear line between **unit tests** (testing a single class in isolation, no framework boot, no database) and **feature tests** (testing a full HTTP request through routing, middleware, controllers, and the database).

\`\`\`php
// Feature test — hits a real route through the full stack
class PostTest extends TestCase
{
    use RefreshDatabase; // resets the test database between tests

    public function test_a_user_can_create_a_post(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/posts', [
            'title' => 'My Post',
            'body' => 'Some content',
        ]);

        $response->assertRedirect('/posts');
        $this->assertDatabaseHas('posts', ['title' => 'My Post']);
    }
}
\`\`\`

\`RefreshDatabase\` runs migrations once and wraps each test in a transaction that's rolled back afterward, keeping the test database clean without the overhead of a full migrate between every single test.

Laravel's testing helpers extend to mocking facades (\`Mail::fake()\`, \`Queue::fake()\`, \`Event::fake()\`) which let a feature test assert "an email *would have* been sent" without actually sending one — critical for testing side effects without slow or flaky external calls. A common interview question is when to reach for a unit test versus a feature test: unit tests for isolated business logic and edge cases (fast, no I/O), feature tests for confirming the whole request lifecycle — routing, middleware, validation, and persistence — behaves correctly together.`,
  },
];

export function seedLaravelLessons(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['laravel']);
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
