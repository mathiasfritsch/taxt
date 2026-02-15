# GitHub Copilot Instructions for Taxt Project

## Project Overview
This is a full-stack application with an Angular 21 frontend and .NET 10 backend API.

## Frontend Structure (Angular)

### Technology Stack
- **Angular Version**: 21.1.0
- **Component Style**: Standalone components (no NgModules)
- **State Management**: Angular signals
- **Styling**: Component-scoped CSS
- **Build Tool**: @angular/build (esbuild-based)
- **HTTP Client**: Angular HttpClient with proxy configuration

### Coding Standards

#### Component Architecture
- **Always use standalone components** with `imports` array
- **Use signals** for reactive state instead of observables where appropriate
- **Inject dependencies** using `inject()` function, not constructor injection
- **Template syntax**: Use modern control flow (`@if`, `@for`, `@else`) instead of *ngIf/*ngFor

Example component structure:
```typescript
import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  imports: [CommonModule],
  templateUrl: './example.html',
  styleUrl: './example.css'
})
export class ExampleComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly data = signal<DataType[]>([]);
  
  ngOnInit() {
    // Component initialization
  }
}
```

#### Template Patterns
- Use `@if` for conditionals: `@if (condition) { <div>Content</div> }`
- Use `@for` for loops: `@for (item of items(); track item.id) { <li>{{ item.name }}</li> }`
- Use `@else` for alternative rendering: `@if (loading()) { <p>Loading...</p> } @else { <p>Content</p> }`

#### API Integration
- All API calls should use the proxy configuration (calls to `/api/*` are proxied to `http://localhost:5062`)
- Use HttpClient for all API requests
- Always handle both success and error cases in subscriptions
- Use signals to store API response data

Example API call:
```typescript
this.http.get<Document[]>('/api/transactions')
  .subscribe({
    next: (data) => {
      this.documents.set(data);
      this.loading.set(false);
    },
    error: (err) => {
      this.error.set('Failed to load: ' + err.message);
      this.loading.set(false);
    }
  });
```

#### File Organization
- Component files: `component-name.ts`
- Template files: `component-name.html`
- Style files: `component-name.css`
- Place all components in `frontend/src/app/` directory
- Keep related files together (component, template, styles)

#### Naming Conventions
- **Components**: PascalCase class names (e.g., `DocumentsComponent`)
- **Selectors**: kebab-case with `app-` prefix (e.g., `app-documents`)
- **Files**: kebab-case (e.g., `documents.ts`, `documents.html`)
- **Signals**: camelCase (e.g., `documents`, `loading`, `error`)
- **Methods**: camelCase (e.g., `loadDocuments()`)

#### State Management
- Use signals for component state
- Mark signals as `readonly` when they shouldn't be reassigned
- Use `protected` visibility for template-accessible properties
- Use `private` for internal implementation details

#### TypeScript Interfaces
- Define interfaces for API response types
- Place interfaces at the top of component files or in separate model files
- Use descriptive property names matching API responses

## Backend Structure (.NET)

### API Conventions
- API controllers use the `/api/[controller]` route pattern
- Backend runs on `http://localhost:5062` during development
- Controllers are in `Taxt/Controllers/` directory

### Integration Points
- Frontend proxies all `/api/*` requests to the backend
- Use consistent DTO naming between frontend interfaces and backend models

## Development Workflow

### Running the Application
1. Start .NET API: `cd Taxt && dotnet run` (runs on port 5062)
2. Start Angular: `cd frontend && npm start` (runs on port 4200)
3. Access app at `http://localhost:4200`

### Proxy Configuration
- Defined in `frontend/proxy.conf.json`
- Routes `/api/*` to backend at `http://localhost:5062`
- Avoids CORS issues during development

## Project-Specific Guidelines

### When Creating New Components
1. Use standalone component pattern
2. Import only what's needed in the `imports` array
3. Use signals for reactive state
4. Use `inject()` for dependency injection
5. Follow the naming conventions above
6. Create separate `.ts`, `.html`, and `.css` files

### When Working with Forms
- Use Angular Forms module (ReactiveFormsModule or FormsModule)
- Add to component's `imports` array
- Use signals to manage form state

### When Adding New Features
- Keep components focused and single-purpose
- Extract reusable logic into separate components or services
- Use the HttpClient proxy for all API calls
- Handle loading and error states appropriately

## Code Quality
- Keep components small and focused
- Prefer composition over inheritance
- Use TypeScript strict mode features
- Write self-documenting code with clear naming
- Handle errors gracefully with user-friendly messages
