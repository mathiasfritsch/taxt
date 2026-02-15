# Implementation Plan: Document Handling

## Overview

This implementation plan covers the document handling feature for the Taxt tax preparation application. The feature provides CRUD operations for managing document references (PDFs stored in S3), S3 synchronization capabilities, and a frontend interface for document management organized by tax periods (year/month).

The implementation follows the established layered architecture:
- **Data Layer**: Entity Framework Core entities and DbContext configuration
- **Service Layer**: Business logic for document operations and S3 synchronization
- **API Layer**: REST endpoints with proper error handling
- **Testing**: Property-based tests using FsCheck and unit tests
- **Frontend**: Angular components with Material Design

## Tasks

- [ ] 1. Set up data layer and database schema
  - [ ] 1.1 Create Document entity in TaxtDB project
    - Create `TaxtDB/Entities/Document.cs` with all required fields (Id, Created, Name, ExternalReference, tax metadata, invoice metadata)
    - Add data annotations for required fields
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12_
  
  - [ ] 1.2 Configure Document entity in DbContext
    - Add `DbSet<Document> Documents` to `TaxtDbContext`
    - Configure entity with Fluent API (indexes on ExternalReference and Created)
    - Set up required field constraints and column types
    - _Requirements: 1.1-1.12_
  
  - [ ] 1.3 Create and apply database migration
    - Generate migration: `dotnet ef migrations add AddDocumentEntity --project TaxtDB`
    - Review migration for correct indexes and constraints
    - Apply migration to development database
    - _Requirements: 1.1-1.12_

- [ ] 2. Create model layer DTOs
  - [ ] 2.1 Create DocumentDto in TaxtModel project
    - Create `TaxtModel/Dto/DocumentDto.cs` with all document fields
    - Ensure field types match entity (decimal?, DateTime?, etc.)
    - _Requirements: 1.1-1.12_
  
  - [ ] 2.2 Create request/response DTOs
    - Create `CreateDocumentRequest.cs` with Required attributes on Name and ExternalReference
    - Create `UpdateDocumentRequest.cs` with Required attribute on Name (excludes ExternalReference and Created)
    - Create `SyncRequest.cs` with Year and Month validation (Range attributes)
    - Create `SyncResult.cs` with DocumentsAdded, DocumentsSkipped, TotalS3Objects
    - Create `ErrorResponse.cs` for API error handling
    - _Requirements: 3.1, 3.2, 5.1-5.5, 7.7, 9.8_

- [ ] 3. Implement DocumentsService
  - [ ] 3.1 Create IDocumentsService interface
    - Create `TaxtService/Interfaces/IDocumentsService.cs`
    - Define methods: GetDocumentsAsync, GetDocumentByIdAsync, CreateDocumentAsync, UpdateDocumentAsync, DeleteDocumentAsync
    - Include CancellationToken parameters
    - _Requirements: 2.1-2.4, 3.1-3.5, 4.1-4.2, 5.1-5.6, 6.1-6.2_
  
  - [ ] 3.2 Implement DocumentsService class
    - Create `TaxtService/Services/DocumentsService.cs`
    - Inject TaxtDbContext via constructor
    - Implement GetDocumentsAsync with optional year/month filtering and descending date ordering
    - Implement GetDocumentByIdAsync returning null if not found
    - Implement CreateDocumentAsync with validation, timestamp assignment, and entity mapping
    - Implement UpdateDocumentAsync preserving Created and ExternalReference
    - Implement DeleteDocumentAsync returning false if not found
    - _Requirements: 2.1-2.4, 3.1-3.5, 4.1-4.2, 5.1-5.6, 6.1-6.2_
  
  - [ ]* 3.3 Write property test for date filtering correctness
    - **Property 1: Date Filtering Correctness**
    - **Validates: Requirements 2.1**
  
  - [ ]* 3.4 Write property test for descending date order
    - **Property 2: Descending Date Order**
    - **Validates: Requirements 2.3**
  
  - [ ]* 3.5 Write property test for required field validation
    - **Property 3: Required Field Validation**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 3.6 Write property test for created timestamp assignment
    - **Property 4: Created Timestamp Assignment**
    - **Validates: Requirements 3.3, 7.6**
  
  - [ ]* 3.7 Write property test for metadata round-trip preservation
    - **Property 5: Metadata Round-Trip Preservation**
    - **Validates: Requirements 3.4**
  
  - [ ]* 3.8 Write property test for create-read round-trip
    - **Property 6: Create-Read Round-Trip**
    - **Validates: Requirements 3.5, 4.1**
  
  - [ ]* 3.9 Write property test for non-existent document error handling
    - **Property 7: Non-Existent Document Error Handling**
    - **Validates: Requirements 4.2, 5.6, 6.2**
  
  - [ ]* 3.10 Write property test for update mutability
    - **Property 8: Update Mutability**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ]* 3.11 Write property test for update immutability invariant
    - **Property 9: Update Immutability Invariant**
    - **Validates: Requirements 5.4, 5.5**
  
  - [ ]* 3.12 Write property test for delete removes document
    - **Property 10: Delete Removes Document**
    - **Validates: Requirements 6.1**
  
  - [ ]* 3.13 Write unit tests for DocumentsService edge cases
    - Test empty document list scenarios
    - Test boundary date filtering (month edges, year boundaries)
    - Test null/empty input validation
    - _Requirements: 2.1-2.4, 3.1-3.5, 4.1-4.2, 5.1-5.6, 6.1-6.2_

- [ ] 4. Checkpoint - Ensure DocumentsService tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement S3 integration
  - [ ] 5.1 Create S3Options configuration class
    - Create `TaxtService/Configuration/S3Options.cs`
    - Add properties: ServiceUrl, BucketName, AccessKey, SecretKey, UseLocalStack
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 5.2 Add S3 configuration to appsettings
    - Add S3 section to `appsettings.json` (production AWS S3 settings)
    - Add S3 section to `appsettings.Development.json` (LocalStack settings)
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 5.3 Create IS3SyncService interface
    - Create `TaxtService/Interfaces/IS3SyncService.cs`
    - Define SyncDocumentsAsync method with year, month, and CancellationToken parameters
    - _Requirements: 7.1-7.7_
  
  - [ ] 5.4 Implement S3SyncService class
    - Create `TaxtService/Services/S3SyncService.cs`
    - Inject IAmazonS3 and IDocumentsService via constructor
    - Implement SyncDocumentsAsync:
      - List S3 objects with year/month prefix pattern
      - Query existing documents by ExternalReference (batch query)
      - Identify new objects not in database
      - Create documents for new objects with derived names
      - Return SyncResult with accurate counts
    - Add error handling for S3 exceptions
    - _Requirements: 7.1-7.7_
  
  - [ ]* 5.5 Write property test for S3 sync creates new documents
    - **Property 11: S3 Sync Creates New Documents**
    - **Validates: Requirements 7.3**
  
  - [ ]* 5.6 Write property test for S3 sync idempotence
    - **Property 12: S3 Sync Idempotence**
    - **Validates: Requirements 7.4**
  
  - [ ]* 5.7 Write property test for S3 name derivation
    - **Property 13: S3 Name Derivation**
    - **Validates: Requirements 7.5**
  
  - [ ]* 5.8 Write property test for sync summary accuracy
    - **Property 14: Sync Summary Accuracy**
    - **Validates: Requirements 7.7**
  
  - [ ]* 5.9 Write unit tests for S3SyncService
    - Test S3 connection failures
    - Test empty S3 bucket scenarios
    - Test S3 object key parsing edge cases
    - Mock IAmazonS3 for isolated testing
    - _Requirements: 7.1-7.7, 8.1-8.3_

- [ ] 6. Checkpoint - Ensure S3SyncService tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement API layer
  - [ ] 7.1 Create DocumentsController
    - Create `Taxt/Controllers/DocumentsController.cs`
    - Inject IDocumentsService and IS3SyncService via constructor
    - Add [ApiController] and [Route("api/documents")] attributes
    - _Requirements: 9.1-9.8_
  
  - [ ] 7.2 Implement GET /api/documents endpoint
    - Add GetDocuments action with optional year and month query parameters
    - Call service.GetDocumentsAsync with filters
    - Return 200 OK with document list
    - _Requirements: 9.1, 9.7_
  
  - [ ] 7.3 Implement GET /api/documents/{id} endpoint
    - Add GetDocumentById action with id path parameter
    - Call service.GetDocumentByIdAsync
    - Return 200 OK if found, 404 Not Found if null
    - _Requirements: 9.2, 9.7, 9.8_
  
  - [ ] 7.4 Implement POST /api/documents endpoint
    - Add CreateDocument action with CreateDocumentRequest body
    - Validate model state, return 400 Bad Request if invalid
    - Call service.CreateDocumentAsync
    - Return 201 Created with Location header and document
    - Add try-catch for ArgumentException returning 400 Bad Request
    - _Requirements: 9.3, 9.7, 9.8_
  
  - [ ] 7.5 Implement PUT /api/documents/{id} endpoint
    - Add UpdateDocument action with id path parameter and UpdateDocumentRequest body
    - Validate model state, return 400 Bad Request if invalid
    - Call service.UpdateDocumentAsync
    - Return 200 OK if found, 404 Not Found if null
    - Add try-catch for ArgumentException returning 400 Bad Request
    - _Requirements: 9.4, 9.7, 9.8_
  
  - [ ] 7.6 Implement DELETE /api/documents/{id} endpoint
    - Add DeleteDocument action with id path parameter
    - Call service.DeleteDocumentAsync
    - Return 204 No Content if successful, 404 Not Found if false
    - _Requirements: 9.5, 9.7, 9.8_
  
  - [ ] 7.7 Implement POST /api/documents/sync endpoint
    - Add SyncDocuments action with SyncRequest body
    - Validate model state, return 400 Bad Request if invalid
    - Call s3SyncService.SyncDocumentsAsync
    - Return 200 OK with SyncResult
    - Add try-catch for S3 exceptions returning 500 Internal Server Error
    - _Requirements: 9.6, 9.7, 9.8_
  
  - [ ]* 7.8 Write property test for API success status codes
    - **Property 15: API Success Status Codes**
    - **Validates: Requirements 9.7**
  
  - [ ]* 7.9 Write property test for API error status codes
    - **Property 16: API Error Status Codes**
    - **Validates: Requirements 9.8**
  
  - [ ]* 7.10 Write integration tests for DocumentsController
    - Test all endpoints with in-memory database
    - Test error response format consistency
    - Test Location header on POST
    - _Requirements: 9.1-9.8_

- [ ] 8. Configure dependency injection and services
  - [ ] 8.1 Register services in Program.cs
    - Register IDocumentsService and DocumentsService as scoped
    - Register IS3SyncService and S3SyncService as scoped
    - Configure S3Options from configuration
    - Register IAmazonS3 as singleton with S3Options configuration
    - _Requirements: 8.1-8.3_
  
  - [ ] 8.2 Add CORS configuration for frontend
    - Configure CORS policy to allow frontend origin
    - Add CORS middleware to request pipeline
    - _Requirements: 9.1-9.8_

- [ ] 9. Checkpoint - Ensure API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement frontend routing and navigation
  - [ ] 10.1 Create documents routing module
    - Create `frontend/src/app/documents/documents-routing.module.ts`
    - Define routes: `/documents` (period selection), `/documents/:year/:month` (document list)
    - _Requirements: 10.4, 10.8_
  
  - [ ] 10.2 Create period selection component
    - Create `frontend/src/app/documents/period-selection/period-selection.component.ts`
    - Add year dropdown (2000-2100) and month dropdown (1-12)
    - Navigate to `/documents/:year/:month` on selection
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7_
  
  - [ ] 10.3 Create document list component with route parameters
    - Create `frontend/src/app/documents/document-list/document-list.component.ts`
    - Extract year and month from route parameters
    - Display selected year and month prominently
    - Support browser back/forward navigation
    - _Requirements: 10.4, 10.5, 10.6, 10.8_

- [ ] 11. Implement frontend document service
  - [ ] 11.1 Create DocumentsService in Angular
    - Create `frontend/src/app/documents/services/documents.service.ts`
    - Inject HttpClient
    - Implement methods for all API endpoints: getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, syncDocuments
    - Add proper error handling with observables
    - _Requirements: 9.1-9.6_
  
  - [ ] 11.2 Create TypeScript models for DTOs
    - Create `frontend/src/app/documents/models/document.model.ts`
    - Define interfaces: Document, CreateDocumentRequest, UpdateDocumentRequest, SyncRequest, SyncResult
    - _Requirements: 9.1-9.6_

- [ ] 12. Implement document list UI
  - [ ] 12.1 Implement document list display
    - Use Angular Material table to display documents
    - Show columns: Name, Invoice Date, Sender Name, Gross Amount, Net Amount, Tax Amount
    - Load documents on component init using year/month from route
    - Display empty state message when no documents exist
    - _Requirements: 11.1, 11.6, 11.9_
  
  - [ ] 12.2 Add S3 sync button and feedback
    - Add "Sync from S3" button with Material Design styling
    - Show loading spinner during sync operation
    - Display sync result summary (documents added/skipped) using Material snackbar
    - Refresh document list after successful sync
    - _Requirements: 11.2, 11.7, 11.8_
  
  - [ ] 12.3 Implement create document form
    - Create dialog component with form for CreateDocumentRequest
    - Add fields: Name (required), External Reference (required), optional metadata fields
    - Use Material form controls with validation
    - Call service.createDocument on submit
    - Refresh list after successful creation
    - _Requirements: 11.3_
  
  - [ ] 12.4 Implement edit document form
    - Create dialog component with form for UpdateDocumentRequest
    - Pre-populate form with existing document data
    - Add fields: Name (required), optional metadata fields (exclude ExternalReference and Created)
    - Use Material form controls with validation
    - Call service.updateDocument on submit
    - Refresh list after successful update
    - _Requirements: 11.4_
  
  - [ ] 12.5 Implement delete document action
    - Add delete button/icon for each document row
    - Show Material confirmation dialog before deletion
    - Call service.deleteDocument on confirmation
    - Refresh list after successful deletion
    - _Requirements: 11.5_

- [ ] 13. Final integration and testing
  - [ ] 13.1 Test end-to-end workflow
    - Test period selection navigation
    - Test document list loading for different periods
    - Test S3 sync with LocalStack
    - Test create, update, delete operations
    - Test error handling and validation messages
    - _Requirements: 10.1-10.8, 11.1-11.9_
  
  - [ ]* 13.2 Write frontend unit tests
    - Test period selection component navigation
    - Test document list component with mocked service
    - Test form validation in create/edit dialogs
    - Test error handling in service calls
    - _Requirements: 10.1-10.8, 11.1-11.9_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use FsCheck with minimum 100 iterations per test
- Property tests are tagged with: **Feature: document-handling, Property {N}: {property text}**
- Unit tests focus on edge cases and integration points
- LocalStack should be running for S3 integration testing
- Frontend uses Angular Material Design components throughout
- All API calls use async/await pattern with proper error handling
