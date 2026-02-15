---
inclusion: always
---

# Product Overview

Taxt is a tax filing preparation application that helps users organize and manage their financial data for tax purposes. Users supply bank account transactions and link them to PDF documents (receipts, invoices, statements) stored in external systems like Google Drive or S3 buckets. The application maintains references to these documents rather than storing the files directly. The system is currently in early development with basic skeleton infrastructure in place.

## Core Domain

- Tax filing preparation and organization
- Transaction management from bank accounts
- Document reference management - PDFs stored externally (Google Drive, S3, etc.)
- Linking transactions to external document references
- Financial data categorization for tax purposes

## Architecture

The application follows a layered architecture pattern:

- **Web API Layer** (Taxt): ASP.NET Core REST API with controller endpoints
- **Service Layer** (TaxtService): Business logic for tax-related operations
- **Data Access Layer** (TaxtDB): Entity Framework Core with PostgreSQL
- **Model Layer** (TaxtModel): Shared domain models and DTOs
- **Frontend** (frontend): Angular SPA with Material Design components

## Development Principles

- Separation of concerns across layers - keep business logic in services, not controllers
- Use dependency injection for service registration and resolution
- Interface-based service contracts (e.g., `IDocumentsService`)
- Entity Framework Core for all database operations
- RESTful API design patterns
- OpenAPI/Swagger documentation for API endpoints

## Key Entities

- **Documents**: References to PDF files stored externally (Google Drive, S3 buckets, etc.) - receipts, invoices, statements
- **Transactions**: Bank account transaction records that can be linked to document references

## Current State

The project has basic infrastructure but limited functionality. When implementing new features, consider the tax filing workflow and how transactions and documents relate to tax categories and reporting requirements.
