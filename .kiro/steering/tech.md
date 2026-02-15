---
inclusion: auto
---

# Technology Stack

## Backend (.NET)

- Framework: ASP.NET Core Web API
- Runtime: .NET 10.0
- Database: PostgreSQL with Npgsql provider
- ORM: Entity Framework Core 10.0.3
- Testing: NUnit 4.4.0
- Features: OpenAPI/Swagger support, nullable reference types enabled, implicit usings enabled

## Frontend (Angular)

- Framework: Angular 21.1.0
- UI Library: Angular Material 21.1.4
- Testing: Vitest 4.0.8 (unit tests), Playwright 1.58.2 (e2e tests)
- Package Manager: npm 11.6.2
- Build Tool: Angular CLI 21.1.1

## Build System

The project uses Central Package Management (CPM) for .NET dependencies:
- `Directory.Build.props`: Defines common project properties (target framework, nullable settings)
- `Directory.Packages.props`: Centrally manages NuGet package versions
- `global.json`: Specifies .NET SDK version (10.0.0)

## Common Commands

### Backend

```bash
# Build the solution
dotnet build

# Run the API (from Taxt directory)
dotnet run --project Taxt

# Run tests
dotnet test

# Create EF Core migration
dotnet ef migrations add <MigrationName> --project TaxtDB

# Update database
dotnet ef database update --project Taxt
```

### Frontend

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4200)
ng serve

# Build for production
ng build

# Run unit tests
ng test

# Run e2e tests
ng e2e
```

## Code Style

### .NET
- Nullable reference types are enabled project-wide
- Implicit usings are enabled
- Follow standard C# naming conventions

### Angular/TypeScript
- Prettier configuration: 100 character line width, single quotes
- Angular-specific HTML parser for templates
