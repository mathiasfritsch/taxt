---
inclusion: auto
---

# Project Structure

## Root Level

```
/
├── Taxt/              # Main ASP.NET Core Web API project
├── TaxtDB/            # Data access layer (EF Core, entities, migrations)
├── TaxtModel/         # Domain models and DTOs
├── TaxtService/       # Business logic and service layer
├── Taxt.Tests/        # Backend unit tests
├── frontend/          # Angular frontend application
├── DbSetup/           # Database setup scripts
├── MigrateTool/       # Database migration utilities
└── build/             # Build artifacts
```

## Backend Architecture

The backend follows a layered architecture pattern:

1. **Taxt** (Web API Layer)
   - Controllers: API endpoints (`DocumentsController`, `TransactionsController`)
   - Program.cs: Application startup and DI configuration
   - Handles HTTP requests/responses

2. **TaxtService** (Business Logic Layer)
   - Services: Business logic implementation
   - Interfaces: Service contracts (e.g., `IDocumentsService`)
   - Orchestrates operations between controllers and data layer

3. **TaxtDB** (Data Access Layer)
   - Data/: DbContext configuration
   - Entities/: EF Core entity models (e.g., `Document`)
   - Migrations/: EF Core database migrations
   - Handles database operations

4. **TaxtModel** (Shared Models)
   - DTOs and domain models shared across layers

5. **Taxt.Tests**
   - NUnit test projects for backend logic

## Frontend Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.ts              # Root component
│   │   ├── app.config.ts       # Application configuration
│   │   ├── app.routes.ts       # Route definitions
│   │   ├── documents.ts        # Documents component
│   │   └── *.html/*.css        # Component templates and styles
│   ├── main.ts                 # Application entry point
│   └── styles.css              # Global styles
├── e2e/                        # Playwright e2e tests
└── public/                     # Static assets
```

## Configuration Files

- `Directory.Build.props`: Shared MSBuild properties for all .NET projects
- `Directory.Packages.props`: Centralized NuGet package version management
- `global.json`: .NET SDK version specification
- `Taxt.slnx`: Solution file
- `frontend/angular.json`: Angular workspace configuration
- `frontend/proxy.conf.json`: Development proxy configuration for API calls

## Conventions

- Backend projects use project references to maintain dependencies
- Frontend uses Angular standalone components (no NgModules)
- Database connection strings configured via appsettings.json and user secrets
- API uses dependency injection for service registration
