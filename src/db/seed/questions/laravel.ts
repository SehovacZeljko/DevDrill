import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';

const CREATED_AT = 1700000000;

export function seedLaravelQuestions(db: QuickSQLiteConnection): void {
  const result = db.execute('SELECT id FROM category WHERE slug = ?', ['laravel']);
  if (!result.rows || result.rows.length === 0) { return; }
  const categoryId = result.rows._array[0].id as number;

  const questions = [
    {
      title: 'What is the MVC pattern in Laravel?',
      answer: `MVC (Model-View-Controller) separates an application into three layers:

- **Model** — represents data and business logic. In Laravel, Eloquent models map to database tables and define relationships.
- **View** — the presentation layer. Laravel uses Blade templates to render HTML.
- **Controller** — handles HTTP requests, delegates to services/models, and returns responses.

\`\`\`php
// Model
class Post extends Model {
    protected $fillable = ['title', 'body', 'user_id'];
    public function author(): BelongsTo {
        return $this->belongsTo(User::class, 'user_id');
    }
}

// Controller
class PostController extends Controller {
    public function show(Post $post): View { // route model binding
        return view('posts.show', compact('post'));
    }
}

// Route
Route::get('/posts/{post}', [PostController::class, 'show']);

// View (Blade)
<h1>{{ $post->title }}</h1>
<p>By {{ $post->author->name }}</p>
\`\`\`

In practice, fat controllers are a code smell. Push business logic into **service classes** or **action classes** to keep controllers thin.`,
      difficulty: 1,
      tags: 'mvc,architecture,laravel',
    },
    {
      title: 'What are Eloquent relationships and how do you define them?',
      answer: `Eloquent ORM provides expressive methods to define database relationships:

\`\`\`php
class User extends Model {
    // One user has many posts
    public function posts(): HasMany {
        return $this->hasMany(Post::class);
    }

    // One user has one profile
    public function profile(): HasOne {
        return $this->hasOne(Profile::class);
    }
}

class Post extends Model {
    // Post belongs to one user
    public function author(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    // Post belongs to many tags (pivot table)
    public function tags(): BelongsToMany {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    // Post has many comments through users
    public function likers(): BelongsToMany {
        return $this->belongsToMany(User::class, 'likes');
    }
}

// Eager loading to prevent N+1
$posts = Post::with(['author', 'tags'])->latest()->paginate(20);

// Querying relationships
$userPosts = $user->posts()->where('published', true)->get();
\`\`\`

Always eager load relationships (\`with()\`) when you know you'll iterate over them to avoid N+1 query problems.`,
      difficulty: 2,
      tags: 'eloquent,relationships,orm',
    },
    {
      title: 'What is middleware in Laravel and how do you create one?',
      answer: `Middleware in Laravel filters HTTP requests entering the application. It can inspect, modify, or reject requests before they reach the controller.

\`\`\`php
// Artisan: php artisan make:middleware EnsureUserIsAdmin

class EnsureUserIsAdmin {
    public function handle(Request $request, Closure $next): Response {
        if (!$request->user()?->isAdmin()) {
            abort(403, 'Unauthorized');
        }
        return $next($request); // pass to next middleware / controller
    }
}

// After middleware (runs after response)
class LogResponse {
    public function handle(Request $request, Closure $next): Response {
        $response = $next($request);
        Log::info('Response', ['status' => $response->getStatusCode()]);
        return $response;
    }
}

// Register in bootstrap/app.php (Laravel 11) or Kernel.php (Laravel 10)
Route::middleware(['auth', EnsureUserIsAdmin::class])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
});
\`\`\`

Built-in middleware: \`auth\`, \`throttle\`, \`verified\`, \`can\`, \`signed\`. Middleware can accept parameters: \`->middleware('role:admin,editor')\`.`,
      difficulty: 2,
      tags: 'middleware,http,request',
    },
    {
      title: 'What are service providers in Laravel?',
      answer: `Service providers are the central place to register application services into Laravel's IoC container. Every package and core feature registers itself through a service provider.

\`\`\`php
class AppServiceProvider extends ServiceProvider {
    public function register(): void {
        // Bind interface to implementation (dependency injection)
        $this->app->bind(
            PaymentGatewayInterface::class,
            StripePaymentGateway::class,
        );

        // Singleton — same instance throughout the request
        $this->app->singleton(CacheManager::class, function ($app) {
            return new CacheManager($app['config']['cache']);
        });
    }

    public function boot(): void {
        // Register observers, macros, event listeners — after all services are registered
        User::observe(UserObserver::class);

        Validator::extend('phone', function ($attribute, $value) {
            return preg_match('/^\\+?[1-9]\\d{7,14}$/', $value);
        });
    }
}
\`\`\`

\`register()\` is for binding into the container — don't call other services here since they may not be registered yet. \`boot()\` runs after all providers are registered — safe to use any service.`,
      difficulty: 3,
      tags: 'service-providers,ioc,container',
    },
    {
      title: 'What are Laravel migrations and why are they important?',
      answer: `Migrations are version-controlled database schema changes. They allow teams to evolve the database structure incrementally and reproducibly across all environments.

\`\`\`php
// php artisan make:migration create_posts_table
return new class extends Migration {
    public function up(): void {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->boolean('published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps(); // created_at, updated_at
            $table->softDeletes(); // deleted_at

            $table->index(['user_id', 'published']); // composite index
        });
    }

    public function down(): void {
        Schema::dropIfExists('posts');
    }
};
\`\`\`

Run with \`php artisan migrate\`. Rollback with \`php artisan migrate:rollback\`. Each migration is recorded in the \`migrations\` table. In production, always backup before running migrations and use \`--pretend\` to preview SQL first.`,
      difficulty: 1,
      tags: 'migrations,schema,database',
    },
    {
      title: 'What are Laravel queues and jobs?',
      answer: `Queues decouple time-intensive tasks (sending emails, processing images, calling APIs) from the HTTP request cycle. Jobs are classes that encapsulate the deferred work.

\`\`\`php
// php artisan make:job SendWelcomeEmail

class SendWelcomeEmail implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private User $user) {}

    public function handle(Mailer $mailer): void {
        $mailer->to($this->user)->send(new WelcomeEmail($this->user));
    }

    public function failed(Throwable $exception): void {
        Log::error('Welcome email failed', ['user' => $this->user->id]);
    }
}

// Dispatching
SendWelcomeEmail::dispatch($user);
SendWelcomeEmail::dispatch($user)->delay(now()->addMinutes(5));
SendWelcomeEmail::dispatch($user)->onQueue('emails');

// Processing: php artisan queue:work --queue=emails
\`\`\`

Queue drivers: database, Redis (recommended), SQS, Beanstalkd. Use **Laravel Horizon** (Redis) for monitoring. Configure \`tries\` and \`backoff\` for retry behavior. Use \`ShouldBeUnique\` to prevent duplicate jobs.`,
      difficulty: 2,
      tags: 'queues,jobs,async',
    },
    {
      title: 'What are Blade templates and what makes them powerful?',
      answer: `Blade is Laravel's templating engine. Unlike plain PHP, Blade provides clean syntax, template inheritance, components, and directives — and compiles to plain PHP so there's no runtime overhead.

\`\`\`blade
{{-- Layout: layouts/app.blade.php --}}
<!DOCTYPE html>
<html>
<body>
  <nav>@include('partials.nav')</nav>
  <main>@yield('content')</main>
</body>
</html>

{{-- Child view --}}
@extends('layouts.app')

@section('content')
  @foreach($posts as $post)
    <x-post-card :post="$post" />
  @endforeach

  {{ $posts->links() }} {{-- Pagination --}}
@endsection

{{-- Anonymous component: resources/views/components/post-card.blade.php --}}
@props(['post'])
<article>
  <h2>{{ $post->title }}</h2>
  @if($post->published)
    <span class="badge">Published</span>
  @endif
  {{ $slot }}
</article>
\`\`\`

\`{{ }}\` escapes HTML; \`{!! !!}\` outputs raw HTML. Blade components (\`<x-\`) replace includes for reusable UI. Custom directives: \`Blade::directive('money', fn($amount) => ...)\`.`,
      difficulty: 1,
      tags: 'blade,templating,components',
    },
    {
      title: 'What is route model binding in Laravel?',
      answer: `Route model binding automatically resolves Eloquent models from route parameters, eliminating manual \`findOrFail\` calls in controllers.

**Implicit binding** — Laravel matches the route parameter name to the model:
\`\`\`php
// Route
Route::get('/posts/{post}', [PostController::class, 'show']);

// Controller — Laravel automatically finds Post where id = {post}
public function show(Post $post): View {
    return view('posts.show', compact('post'));
}
// Returns 404 automatically if not found
\`\`\`

**Custom key** — bind by a column other than \`id\`:
\`\`\`php
Route::get('/posts/{post:slug}', [PostController::class, 'show']);
// Finds Post where slug = {slug}

// Or override getRouteKeyName() on the model
public function getRouteKeyName(): string { return 'slug'; }
\`\`\`

**Explicit binding** in \`RouteServiceProvider\`:
\`\`\`php
Route::bind('post', function ($value) {
    return Post::published()->where('slug', $value)->firstOrFail();
});
\`\`\`

Route model binding works with soft-deleted models if you add \`->withTrashed()\` in the binding.`,
      difficulty: 2,
      tags: 'routing,model-binding,eloquent',
    },
    {
      title: 'What is Laravel\'s service container and how does it work?',
      answer: `The service container is a powerful IoC (Inversion of Control) container that manages class dependencies and performs dependency injection. When Laravel instantiates a class (controller, job, service), the container automatically resolves and injects its constructor dependencies.

\`\`\`php
// Binding an interface to an implementation
$this->app->bind(
    FileStorageInterface::class,
    S3FileStorage::class,
);

// Now whenever FileStorageInterface is type-hinted, S3FileStorage is injected
class UploadController extends Controller {
    public function __construct(
        private FileStorageInterface $storage,
    ) {}
}

// Contextual binding — use different implementations in different classes
$this->app->when(UploadController::class)
    ->needs(FileStorageInterface::class)
    ->give(S3FileStorage::class);

$this->app->when(TestCommand::class)
    ->needs(FileStorageInterface::class)
    ->give(LocalFileStorage::class);

// Resolving manually
$service = app(PaymentService::class);
$service = resolve(PaymentService::class);
\`\`\`

The container uses PHP's reflection API to inspect constructor type hints and resolve them automatically — no configuration needed for concrete classes.`,
      difficulty: 3,
      tags: 'service-container,ioc,dependency-injection',
    },
    {
      title: 'What is the N+1 problem and how do you prevent it in Eloquent?',
      answer: `The N+1 problem occurs when code executes one query to fetch N records, then N additional queries to fetch related data — totaling N+1 queries.

\`\`\`php
// N+1 problem — runs 1 + N queries
$posts = Post::all(); // 1 query
foreach ($posts as $post) {
    echo $post->author->name; // 1 query per post → N queries
}

// Fix with eager loading — runs 2 queries total
$posts = Post::with('author')->get();
foreach ($posts as $post) {
    echo $post->author->name; // no additional query
}

// Multiple relationships
$posts = Post::with(['author', 'tags', 'comments.author'])->paginate(20);

// Conditional eager loading
$posts = Post::with(['comments' => function ($query) {
    $query->latest()->limit(3);
}])->get();
\`\`\`

**Detect N+1 in development:** Laravel Debugbar or \`DB::listen\` logs all queries. Install \`barryvdh/laravel-debugbar\` or use Laravel Telescope. Set \`Model::preventLazyLoading(true)\` in development to throw an exception when a lazy load occurs.`,
      difficulty: 2,
      tags: 'n+1,eager-loading,performance',
    },
  ];

  questions.forEach((question, index) => {
    db.execute(
      'INSERT INTO question (category_id, title, answer_markdown, difficulty, tags, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [categoryId, question.title, question.answer, question.difficulty, question.tags, index, CREATED_AT],
    );
  });
}
