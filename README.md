# TaskFlow - Todo Application

A modern task management application built with Angular 19, featuring user authentication, role-based permissions with CASL, and a clean architecture design pattern.

> **Note**: This project was developed as a full-stack technical challenge.

## Installation

### Prerequisites

- Node.js >= 24.x
- Yarn >= 1.22.x or npm
- Angular CLI >= 19.x

### Setup

1. Clone the repository:
```bash
git clone https://github.com/marcotorres/todo-app.git
cd todo-app
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Configure environment variables (see [Configuration](#configuration) section)

4. Start the development server:
```bash
yarn start
```

5. Open your browser at `http://localhost:4200`

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `ng serve` | Start development server with HMR |
| `build` | `ng build` | Build for production |
| `watch` | `ng build --watch --configuration development` | Build in watch mode |
| `test` | `ng test` | Run unit tests with Karma/Jasmine |
| `lint` | `ng lint` | Run ESLint |

## Technologies

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Angular | 19.x |
| **UI Components** | Angular Material | 19.x |
| **Styling** | TailwindCSS | 4.x |
| **Authorization** | CASL | 6.8.x |
| **State Management** | Angular Signals | - |
| **HTTP Client** | RxJS | 7.8.x |
| **Language** | TypeScript | 5.6.x |
| **Testing** | Karma + Jasmine | - |

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core module (singleton services)
│   │   ├── guards/              # Route guards (auth, ability)
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/              # TypeScript interfaces and types
│   │   └── services/            # Application services
│   │       ├── auth.service.ts      # Authentication logic
│   │       ├── task.service.ts      # Task CRUD operations
│   │       ├── ability.service.ts   # CASL permissions
│   │       ├── notification.service.ts
│   │       └── storage.service.ts   # LocalStorage wrapper
│   │
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication feature
│   │   │   └── components/
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       └── unauthorized/
│   │   │
│   │   └── tasks/               # Tasks feature
│   │       └── components/
│   │           ├── task-list/
│   │           ├── task-form/
│   │           ├── task-edit-dialog/
│   │           └── profile-dialog/
│   │
│   ├── shared/                  # Shared module
│   │   ├── components/          # Reusable components
│   │   ├── directives/          # Custom directives
│   │   └── pipes/               # Custom pipes
│   │
│   ├── app.config.ts            # App configuration
│   ├── app.routes.ts            # Route definitions
│   └── app.ts                   # Root component
│
├── environments/                # Environment configurations
│   ├── environment.ts           # Development
│   └── environment.prod.ts      # Production
│
└── styles.scss                  # Global styles
```

## Configuration

### Environment Variables

Environment files are located in `src/environments/`:

**Development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:5001/todo-aa181/us-central1/api',
  recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
};
```

**Production** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://us-central1-todo-aa181.cloudfunctions.net/api',
  recaptchaSiteKey: 'YOUR_PRODUCTION_RECAPTCHA_KEY'
};
```

| Variable | Description |
|----------|-------------|
| `production` | Enable/disable production mode |
| `apiUrl` | Backend API base URL |
| `recaptchaSiteKey` | Google reCAPTCHA v2 site key |

### Contributing

1. Create a feature branch from `main`:
```bash
git checkout -b feature/your-feature-name
```

2. Follow the existing code style and architecture patterns

3. Write tests for new functionality

4. Submit a pull request with a clear description

#### Code Style Guidelines

- Use Angular standalone components
- Follow the feature-based folder structure
- Use Angular Signals for reactive state
- Implement CASL abilities for permission checks
- Use Angular Material for UI components

## Testing

### Available Test Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `test` | `ng test` | Run unit tests with Karma + Jasmine in watch mode |
| `test:ci` | `ng test --no-watch --code-coverage` | Run tests once with coverage (CI/CD) |

### Running Test

```bash
# Run tests in watch mode (development)
yarn test

# Run tests once with coverage report
yarn test:ci
```

### Test Configuration

- **Test Runner**: Karma 6.4.x
- **Test Framework**: Jasmine 5.4.x
- **Browser**: Chrome (headless for CI)
- **Coverage**: karma-coverage

Test files follow the naming convention `*.spec.ts` and are co-located with their source files.

## Deployment

### Firebase Hosting

This project is configured to deploy to Firebase Hosting.

#### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created and configured

#### Steps

1. **Login to Firebase**:
```bash
firebase login
```

2. **Initialize Firebase Hosting** (only first time):
```bash
firebase init hosting
```
   - Select your Firebase project
   - Public directory: `dist/todo-app/browser`
   - Single-page app: **Yes**
   - Automatic builds with GitHub: **No**

3. **Build for production**:
```bash
yarn build
```

4. **Deploy**:
```bash
firebase deploy --only hosting
```

#### Environment Configuration

Before deploying, ensure `src/environments/environment.prod.ts` has the correct values:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://us-central1-todo-aa181.cloudfunctions.net/api',
  recaptchaSiteKey: 'YOUR_PRODUCTION_RECAPTCHA_KEY'
};
```

## License

This project is proprietary software owned by [marcotorres.pe](https://marcotorres.pe). All rights reserved.
