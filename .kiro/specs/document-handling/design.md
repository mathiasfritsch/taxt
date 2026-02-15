# Design Document: Document Handling

## Overview

The document handling feature provides comprehensive CRUD operations for managing document references in the Taxt tax preparation application. Documents are references to PDF files stored externally in S3 buckets (receipts, invoices, statements) with associated metadata for tax purposes. The feature includes S3 synchronization capabilities to automatically import document references from external storage.

This design follows the established layered architecture:
- **API Layer**: REST endpoints in DocumentsController
- **Service Layer**: Business logic in DocumentsService and S3SyncService
- **Data Access Layer**: Entity Framework Core with PostgreSQL
- **Model Layer**: DTOs and entities for document representation

The system supports both manual document entry and automated synchronization from S3, with filtering capabilities by tax period (year/month) to align with tax filing workflows.

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Taxt)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         DocumentsController                          │   │
│  │  - GET /api/documents?year=X&month=Y                 │   │
│  │  - GET /api/documents/{id}                           │   │
│  │  - POST /api/documents                               │   │
│  │  - PUT /api/documents/{id}                           │   │
│  │  - DELETE /api/documents/{id}                        │   │
│  │  - POST /api/documents/sync                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Service Layer (TaxtService)                  │
│  ┌────────────────────┐      ┌─────────────────────────┐   │
│  │ IDocumentsService  │      │  IS3SyncService         │   │
│  │ DocumentsService   │      │  S3SyncService          │   │
│  │                    │      │                         │   │
│  │ - List/Filter      │      │ - SyncDocumentsAsync    │   │
│  │ - Create           │◄─────┤ - ListS3Objects         │   │
│  │ - Read             │      │ - CreateFromS3          │   │
│  │ - Update           │      └─────────────────────────┘   │
│  │ - Delete           │                 │                  │
│  └────────────────────┘                 │                  │
└─────────────────────────────────────────┼──────────────────┘
                            │              │
                            ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Access Layer (TaxtDB)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              TaxtDbContext                           │   │
│  │  DbSet<Document> Documents                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Document Entity                              │   │
│  │  - Id, Name, ExternalReference                       │   │
│  │  - Created, TaxRate, TaxAmount, etc.                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    └───────────────┘

                            ┌─────────────────┐
                            │   AWS S3 /      │
                            │   LocalStack    │
                            └─────────────────┘
```

### Layer Responsibilities

**API Layer (DocumentsController)**:
- HTTP request/response handling
- Input validation and model binding
- Status code mapping
- Delegates all business logic to services

**Service Layer**:
- **DocumentsService**: Core CRUD operations, filtering, validation
- **S3SyncService**: S3 integration, synchronization logic, duplicate detection

**Data Access Layer**:
- Entity Framework Core DbContext
- Document entity mapping
- Database queries and persistence

**Model Layer**:
- **DocumentDto**: API data transfer object
- **CreateDocumentRequest**: Document creation payload
- **UpdateDocumentRequest**: Document update payload
- **SyncRequest**: S3 synchronization parameters
- **SyncResult**: Synchronization summary

## Components and Interfaces

### 1. Data Models

#### Document Entity (TaxtDB.Entities.Document)

```csharp
public class Document
{
    public int Id { get; set; }
    public DateTime Created { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ExternalReference { get; set; } = string.Empty;
    
    // Tax metadata (optional)
    public decimal? TaxRate { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? GrossAmount { get; set; }
    public decimal? NetAmount { get; set; }
    
    // Invoice metadata (optional)
    public string? InvoiceNumber { get; set; }
    public string? SenderName { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public decimal? Skonto { get; set; }
}
```

**Entity Configuration**:
- Primary key: `Id` (auto-generated)
- Required fields: `Name`, `ExternalReference`, `Created`
- Index on `ExternalReference` for efficient duplicate detection during sync
- Index on `Created` for efficient date-based filtering

#### DocumentDto (TaxtModel.Dto.DocumentDto)

```csharp
public class DocumentDto
{
    public int Id { get; set; }
    public DateTime Created { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ExternalReference { get; set; } = string.Empty;
    public decimal? TaxRate { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? GrossAmount { get; set; }
    public decimal? NetAmount { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? SenderName { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public decimal? Skonto { get; set; }
}
```

#### CreateDocumentRequest (TaxtModel.Dto.CreateDocumentRequest)

```csharp
public class CreateDocumentRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string ExternalReference { get; set; } = string.Empty;
    
    public decimal? TaxRate { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? GrossAmount { get; set; }
    public decimal? NetAmount { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? SenderName { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public decimal? Skonto { get; set; }
}
```

#### UpdateDocumentRequest (TaxtModel.Dto.UpdateDocumentRequest)

```csharp
public class UpdateDocumentRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public decimal? TaxRate { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? GrossAmount { get; set; }
    public decimal? NetAmount { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? SenderName { get; set; }
    public DateTime? InvoiceDate { get; set; }
    public decimal? Skonto { get; set; }
}
```

**Note**: `ExternalReference` and `Created` are immutable and not included in update requests.

#### SyncRequest (TaxtModel.Dto.SyncRequest)

```csharp
public class SyncRequest
{
    [Required]
    [Range(2000, 2100)]
    public int Year { get; set; }
    
    [Required]
    [Range(1, 12)]
    public int Month { get; set; }
}
```

#### SyncResult (TaxtModel.Dto.SyncResult)

```csharp
public class SyncResult
{
    public int DocumentsAdded { get; set; }
    public int DocumentsSkipped { get; set; }
    public int TotalS3Objects { get; set; }
}
```

### 2. Service Interfaces

#### IDocumentsService

```csharp
public interface IDocumentsService
{
    Task<IReadOnlyList<DocumentDto>> GetDocumentsAsync(
        int? year = null, 
        int? month = null, 
        CancellationToken cancellationToken = default);
    
    Task<DocumentDto?> GetDocumentByIdAsync(
        int id, 
        CancellationToken cancellationToken = default);
    
    Task<DocumentDto> CreateDocumentAsync(
        CreateDocumentRequest request, 
        CancellationToken cancellationToken = default);
    
    Task<DocumentDto?> UpdateDocumentAsync(
        int id, 
        UpdateDocumentRequest request, 
        CancellationToken cancellationToken = default);
    
    Task<bool> DeleteDocumentAsync(
        int id, 
        CancellationToken cancellationToken = default);
}
```

**Method Behaviors**:
- `GetDocumentsAsync`: Returns all documents, optionally filtered by year/month, ordered by Created descending
- `GetDocumentByIdAsync`: Returns document or null if not found
- `CreateDocumentAsync`: Creates document with current timestamp, throws ArgumentException for invalid input
- `UpdateDocumentAsync`: Updates mutable fields, returns null if document not found
- `DeleteDocumentAsync`: Deletes document, returns false if not found

#### IS3SyncService

```csharp
public interface IS3SyncService
{
    Task<SyncResult> SyncDocumentsAsync(
        int year, 
        int month, 
        CancellationToken cancellationToken = default);
}
```

**Method Behavior**:
- Lists S3 objects for the specified period
- Creates documents for new S3 objects (not already in repository)
- Skips existing documents (idempotent operation)
- Returns summary of sync operation

### 3. API Endpoints

#### DocumentsController

**GET /api/documents**
- Query parameters: `year` (optional), `month` (optional)
- Response: `200 OK` with `IEnumerable<DocumentDto>`
- Filters documents by year/month if provided

**GET /api/documents/{id}**
- Path parameter: `id` (integer)
- Response: `200 OK` with `DocumentDto` or `404 Not Found`

**POST /api/documents**
- Request body: `CreateDocumentRequest`
- Response: `201 Created` with `DocumentDto` and Location header
- Response: `400 Bad Request` for validation errors

**PUT /api/documents/{id}**
- Path parameter: `id` (integer)
- Request body: `UpdateDocumentRequest`
- Response: `200 OK` with `DocumentDto`
- Response: `404 Not Found` if document doesn't exist
- Response: `400 Bad Request` for validation errors

**DELETE /api/documents/{id}**
- Path parameter: `id` (integer)
- Response: `204 No Content` on success
- Response: `404 Not Found` if document doesn't exist

**POST /api/documents/sync**
- Request body: `SyncRequest`
- Response: `200 OK` with `SyncResult`
- Response: `400 Bad Request` for validation errors
- Response: `500 Internal Server Error` for S3 connection issues

### 4. S3 Integration

#### S3 Client Configuration

```csharp
public class S3Options
{
    public string ServiceUrl { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public bool UseLocalStack { get; set; }
}
```

**Configuration Sources**:
- `appsettings.json` for production (AWS S3)
- `appsettings.Development.json` for LocalStack
- Environment variables for deployment-specific overrides

**LocalStack Configuration**:
```json
{
  "S3": {
    "ServiceUrl": "http://localhost:4566",
    "BucketName": "taxt-documents",
    "AccessKey": "test",
    "SecretKey": "test",
    "UseLocalStack": true
  }
}
```

#### S3SyncService Implementation Strategy

**Synchronization Algorithm**:
1. List all S3 objects with prefix matching year/month pattern (e.g., `2024/03/`)
2. Extract external references from S3 object keys
3. Query database for existing documents with matching external references (single batch query)
4. Identify new objects (not in database)
5. Create document entities for new objects in batch
6. Return summary with counts

**S3 Object Key Format**: `{year}/{month:00}/{filename}.pdf`
- Example: `2024/03/receipt-001.pdf`

**Document Name Derivation**: Extract filename from S3 key
- S3 key: `2024/03/receipt-001.pdf` → Name: `receipt-001.pdf`

**Duplicate Detection**: Query by `ExternalReference` field (indexed for performance)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Date Filtering Correctness
*For any* set of documents and any year/month filter, all returned documents should have `Created` dates within the specified year and month.
**Validates: Requirements 2.1**

### Property 2: Descending Date Order
*For any* set of documents returned by the service, the list should be ordered by `Created` date in descending order (newest first).
**Validates: Requirements 2.3**

### Property 3: Required Field Validation
*For any* document creation request with null or empty `Name` or `ExternalReference`, the service should reject the request with an appropriate validation error.
**Validates: Requirements 3.1, 3.2**

### Property 4: Created Timestamp Assignment
*For any* document creation (manual or via sync), the `Created` field should be set to the current timestamp (within a reasonable tolerance of ±5 seconds).
**Validates: Requirements 3.3, 7.6**

### Property 5: Metadata Round-Trip Preservation
*For any* document with optional metadata fields (tax metadata, invoice metadata), creating the document and then retrieving it should return equivalent metadata values.
**Validates: Requirements 3.4**

### Property 6: Create-Read Round-Trip
*For any* valid document creation request, creating the document and then retrieving it by the returned ID should yield a document with equivalent field values.
**Validates: Requirements 3.5, 4.1**

### Property 7: Non-Existent Document Error Handling
*For any* operation (read, update, delete) on a non-existent document ID, the service should return an appropriate error indication (null return or false for delete).
**Validates: Requirements 4.2, 5.6, 6.2**

### Property 8: Update Mutability
*For any* existing document and any valid update request, updating the document should result in all mutable fields (`Name`, tax metadata, invoice metadata) being changed to the new values.
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 9: Update Immutability Invariant
*For any* document update operation, the `Created` timestamp and `ExternalReference` fields should remain unchanged after the update.
**Validates: Requirements 5.4, 5.5**

### Property 10: Delete Removes Document
*For any* existing document, deleting it by ID should result in subsequent read attempts returning null/not found.
**Validates: Requirements 6.1**

### Property 11: S3 Sync Creates New Documents
*For any* S3 objects not already in the repository (by `ExternalReference`), synchronization should create new document records with `ExternalReference` matching the S3 object key.
**Validates: Requirements 7.3**

### Property 12: S3 Sync Idempotence
*For any* set of S3 objects, running synchronization multiple times should produce the same final state (no duplicate documents created).
**Validates: Requirements 7.4**

### Property 13: S3 Name Derivation
*For any* S3 object key, the document name created during sync should be derived from the filename portion of the S3 key.
**Validates: Requirements 7.5**

### Property 14: Sync Summary Accuracy
*For any* sync operation, the returned `SyncResult` counts (`DocumentsAdded`, `DocumentsSkipped`) should accurately reflect the number of documents created and skipped.
**Validates: Requirements 7.7**

### Property 15: API Success Status Codes
*For any* successful API operation, the HTTP response status code should be in the 2xx range (200, 201, 204).
**Validates: Requirements 9.7**

### Property 16: API Error Status Codes
*For any* failed API operation, the HTTP response status code should be in the 4xx or 5xx range with error details in the response body.
**Validates: Requirements 9.8**

## Error Handling

### Service Layer Error Handling

**Validation Errors**:
- Throw `ArgumentException` for null/empty required fields
- Throw `ArgumentException` for invalid year/month ranges
- Include descriptive error messages indicating which field failed validation

**Not Found Scenarios**:
- Return `null` for read operations on non-existent documents
- Return `null` for update operations on non-existent documents
- Return `false` for delete operations on non-existent documents

**S3 Integration Errors**:
- Catch `AmazonS3Exception` and wrap in custom `S3SyncException`
- Include original error message and S3 error code
- Log errors for debugging

### API Layer Error Handling

**Status Code Mapping**:
- `200 OK`: Successful GET, PUT, sync operations
- `201 Created`: Successful POST with Location header
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors, malformed requests
- `404 Not Found`: Document not found for GET, PUT, DELETE
- `500 Internal Server Error`: Unexpected errors, S3 connection failures

**Error Response Format**:
```csharp
public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public Dictionary<string, string[]>? ValidationErrors { get; set; }
}
```

**Controller Error Handling Pattern**:
```csharp
try
{
    var result = await _service.OperationAsync(...);
    if (result == null)
        return NotFound(new ErrorResponse { Message = "Document not found" });
    return Ok(result);
}
catch (ArgumentException ex)
{
    return BadRequest(new ErrorResponse { Message = ex.Message });
}
catch (S3SyncException ex)
{
    return StatusCode(500, new ErrorResponse 
    { 
        Message = "S3 synchronization failed", 
        Details = ex.Message 
    });
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests as complementary approaches:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific document creation scenarios
- Edge cases (empty lists, boundary dates)
- Error conditions (null inputs, non-existent IDs)
- Controller integration with services
- S3 client integration with mocked AWS SDK

**Property-Based Tests**: Verify universal properties across randomized inputs
- Use **xUnit** with **FsCheck** library for property-based testing in C#
- Each property test runs minimum **100 iterations** with randomized inputs
- Tests validate correctness properties defined in this design document
- Each test tagged with: **Feature: document-handling, Property {N}: {property text}**

### Property-Based Testing Configuration

**Library**: FsCheck for .NET (https://fscheck.github.io/FsCheck/)

**Test Structure**:
```csharp
[Property(MaxTest = 100)]
[Trait("Feature", "document-handling")]
[Trait("Property", "1: Date Filtering Correctness")]
public Property DateFilteringReturnsOnlyMatchingDocuments()
{
    // Property test implementation
}
```

**Generator Strategy**:
- Custom generators for `Document` entities with realistic data
- Custom generators for date ranges (year 2000-2100, month 1-12)
- Custom generators for optional metadata fields
- Generators for S3 object keys following expected format

### Test Coverage Requirements

**Service Layer Tests**:
- DocumentsService: All CRUD operations, filtering logic
- S3SyncService: Synchronization logic, duplicate detection, name derivation

**API Layer Tests**:
- DocumentsController: All endpoints, status code mapping, error handling
- Integration tests with in-memory database

**Property Tests** (one test per property):
1. Date filtering correctness
2. Descending date order
3. Required field validation
4. Created timestamp assignment
5. Metadata round-trip preservation
6. Create-read round-trip
7. Non-existent document error handling
8. Update mutability
9. Update immutability invariant
10. Delete removes document
11. S3 sync creates new documents
12. S3 sync idempotence
13. S3 name derivation
14. Sync summary accuracy
15. API success status codes
16. API error status codes

**Unit Tests** (examples and edge cases):
- Empty document list scenarios
- Boundary date filtering (month edges, year boundaries)
- Invalid input combinations
- S3 connection failures
- Concurrent access scenarios

### Testing Infrastructure

**Database**: Use in-memory SQLite for fast test execution
**S3 Mocking**: Use mock S3 client or LocalStack for integration tests
**Test Data**: Factory pattern for creating test documents with varied metadata
**Assertions**: FluentAssertions for readable test assertions

## Implementation Notes

### Database Migration

Create Entity Framework migration for Document entity:
```bash
dotnet ef migrations add AddDocumentEntity --project TaxtDB
```

**Migration includes**:
- Document table creation
- Index on `ExternalReference` for sync performance
- Index on `Created` for filtering performance

### Dependency Injection Registration

**Program.cs configuration**:
```csharp
// Services
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<IS3SyncService, S3SyncService>();

// S3 Configuration
builder.Services.Configure<S3Options>(
    builder.Configuration.GetSection("S3"));

// AWS S3 Client
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var options = sp.GetRequiredService<IOptions<S3Options>>().Value;
    var config = new AmazonS3Config
    {
        ServiceURL = options.ServiceUrl,
        ForcePathStyle = options.UseLocalStack
    };
    return new AmazonS3Client(
        options.AccessKey, 
        options.SecretKey, 
        config);
});
```

### Performance Considerations

**Filtering Performance**:
- Index on `Created` field enables efficient date-range queries
- Use `IQueryable` composition for optimal SQL generation

**Sync Performance**:
- Batch query for existing documents (single database round-trip)
- Batch insert for new documents using `AddRange`
- Index on `ExternalReference` for O(log n) duplicate detection

**API Performance**:
- Use async/await throughout for non-blocking I/O
- Enable response compression for large document lists
- Consider pagination for very large result sets (future enhancement)

### Security Considerations

**Input Validation**:
- Data annotations on request models
- Additional validation in service layer
- Sanitize S3 object keys to prevent path traversal

**S3 Access**:
- Use IAM roles in production (not hardcoded credentials)
- Restrict S3 bucket access to read-only for sync service
- Validate S3 object keys match expected format

**API Security**:
- Add authentication/authorization in future iterations
- Rate limiting for sync endpoint to prevent abuse
- CORS configuration for frontend access

### Future Enhancements

**Pagination**: Add skip/take parameters for large document lists
**Search**: Full-text search on document names and metadata
**Bulk Operations**: Batch create/update/delete endpoints
**Document Parsing**: OCR integration to extract metadata from PDFs
**Transaction Linking**: Link documents to bank transactions
**Audit Trail**: Track document modifications with timestamps and user info
