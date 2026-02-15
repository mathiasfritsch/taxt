# Requirements Document

## Introduction

This document specifies the requirements for the document handling feature in Taxt, a tax filing preparation application. The feature enables users to manage references to PDF documents (receipts, invoices, statements) stored externally in S3, synchronize documents from S3, and maintain document metadata for tax preparation purposes.

## Glossary

- **Document**: A reference to a PDF file stored externally in S3, containing metadata for tax purposes
- **Document Service**: The service layer component responsible for document business logic
- **Document Repository**: The data access layer component for document persistence
- **S3 Sync Service**: The service responsible for synchronizing document references from S3
- **External Reference**: The unique S3 identifier for a document stored in the external storage system
- **Tax Metadata**: Document properties related to tax calculations (tax rate, tax amount, gross amount, net amount)
- **Invoice Metadata**: Document properties related to invoice information (invoice number, sender name, invoice date)
- **LocalStack**: A local AWS cloud stack emulator used for development and testing

## Requirements

### Requirement 1: Document Data Model

**User Story:** As a developer, I want a comprehensive document data model, so that I can store all necessary document metadata for tax preparation.

#### Acceptance Criteria

1.1 THE Document Repository SHALL store documents with an integer identifier
1.2 THE Document Repository SHALL store the document creation timestamp
1.3 THE Document Repository SHALL store the document name
1.4 THE Document Repository SHALL store the external reference identifier for S3
1.5 THE Document Repository SHALL store optional tax rate as a decimal value
1.6 THE Document Repository SHALL store optional tax amount as a decimal value
1.7 THE Document Repository SHALL store optional gross amount as a decimal value
1.8 THE Document Repository SHALL store optional net amount as a decimal value
1.9 THE Document Repository SHALL store optional invoice number as a string
1.10 THE Document Repository SHALL store optional sender name as a string
1.11 THE Document Repository SHALL store optional invoice date as a date value
1.12 THE Document Repository SHALL store optional skonto as a decimal value

### Requirement 2: List Documents with Filtering

**User Story:** As a user, I want to list documents filtered by year and month, so that I can view documents relevant to a specific tax period.

#### Acceptance Criteria

2.1 WHEN a user requests documents for a specific year and month, THE Document Service SHALL return all documents matching that period
2.2 WHEN filtering by year and month, THE Document Service SHALL use the created date field for filtering
2.3 THE Document Service SHALL return documents ordered by created date descending
2.4 THE Document Service SHALL return an empty list when no documents match the filter criteria

### Requirement 3: Create Document

**User Story:** As a user, I want to create document references manually, so that I can add documents that need manual entry.

#### Acceptance Criteria

3.1 WHEN a user creates a document, THE Document Service SHALL require a document name
3.2 WHEN a user creates a document, THE Document Service SHALL require an external reference identifier
3.3 WHEN a user creates a document, THE Document Service SHALL set the created date to the current timestamp
3.4 WHEN a user creates a document with optional metadata, THE Document Service SHALL store all provided metadata fields
3.5 WHEN a user creates a document, THE Document Service SHALL return the created document with its assigned identifier

### Requirement 4: Read Document

**User Story:** As a user, I want to retrieve a specific document by its identifier, so that I can view its details.

#### Acceptance Criteria

4.1 WHEN a user requests a document by identifier, THE Document Service SHALL return the document if it exists
4.2 WHEN a user requests a document by identifier that does not exist, THE Document Service SHALL return an error indicating the document was not found

### Requirement 5: Update Document

**User Story:** As a user, I want to update document metadata, so that I can correct or add information manually or through parsing.

#### Acceptance Criteria

5.1 WHEN a user updates a document, THE Document Service SHALL allow modification of the document name
5.2 WHEN a user updates a document, THE Document Service SHALL allow modification of all tax metadata fields
5.3 WHEN a user updates a document, THE Document Service SHALL allow modification of all invoice metadata fields
5.4 WHEN a user updates a document, THE Document Service SHALL preserve the created date
5.5 WHEN a user updates a document, THE Document Service SHALL preserve the external reference identifier
5.6 WHEN a user updates a document that does not exist, THE Document Service SHALL return an error indicating the document was not found

### Requirement 6: Delete Document

**User Story:** As a user, I want to delete document references, so that I can remove documents that are no longer needed.

#### Acceptance Criteria

6.1 WHEN a user deletes a document by identifier, THE Document Service SHALL remove the document from the repository
6.2 WHEN a user deletes a document that does not exist, THE Document Service SHALL return an error indicating the document was not found

### Requirement 7: S3 Document Synchronization

**User Story:** As a user, I want to synchronize documents from S3 for a specific month, so that I can automatically import document references without manual entry.

#### Acceptance Criteria

1. WHEN a user initiates synchronization for a year and month, THE S3_Sync_Service SHALL list all objects in the S3 bucket for that period
2. WHEN the S3_Sync_Service finds objects in S3, THE S3_Sync_Service SHALL check if each object already exists in the repository by external reference
3. WHEN an S3 object does not exist in the repository, THE S3_Sync_Service SHALL create a new document reference with the S3 object key as the external reference
4. WHEN an S3 object already exists in the repository, THE S3_Sync_Service SHALL skip creating a duplicate document reference
5. WHEN creating documents from S3 synchronization, THE S3_Sync_Service SHALL derive the document name from the S3 object key
6. WHEN creating documents from S3 synchronization, THE S3_Sync_Service SHALL set the created date to the current timestamp
7. WHEN S3 synchronization completes, THE S3_Sync_Service SHALL return a summary of documents added and documents skipped

### Requirement 8: LocalStack Development Environment

**User Story:** As a developer, I want to use LocalStack for S3 during development, so that I can test S3 integration without using AWS resources.

#### Acceptance Criteria

1. WHEN running in development mode, THE S3_Sync_Service SHALL connect to LocalStack S3 endpoint
2. WHEN running in development mode, THE S3_Sync_Service SHALL use LocalStack-compatible authentication
3. THE S3_Sync_Service SHALL support configuration of the S3 endpoint URL for environment-specific deployment

### Requirement 9: REST API Endpoints

**User Story:** As a frontend developer, I want REST API endpoints for document operations, so that I can integrate document management into the UI.

#### Acceptance Criteria

1. THE API SHALL provide a GET endpoint to list documents with optional year and month query parameters
2. THE API SHALL provide a GET endpoint to retrieve a single document by identifier
3. THE API SHALL provide a POST endpoint to create a new document
4. THE API SHALL provide a PUT endpoint to update an existing document
5. THE API SHALL provide a DELETE endpoint to remove a document
6. THE API SHALL provide a POST endpoint to trigger S3 synchronization for a specified year and month
7. WHEN API operations succeed, THE API SHALL return appropriate HTTP success status codes
8. WHEN API operations fail, THE API SHALL return appropriate HTTP error status codes with error details

### Requirement 10: Frontend Navigation Pattern

**User Story:** As a user, I want to navigate documents by first selecting a year and month, so that I can focus on documents relevant to a specific tax period.

#### Acceptance Criteria

10.1 WHEN a user accesses the document management interface, THE Frontend SHALL display year and month selection controls as the primary navigation
10.2 THE Frontend SHALL require the user to select both a year and month before displaying documents
10.3 WHEN a user selects a year, THE Frontend SHALL display month options for that year
10.4 WHEN a user selects a month, THE Frontend SHALL navigate to a route with the year and month in the URL path (e.g., /documents/2024/03)
10.5 THE Frontend SHALL load and display documents for the period specified in the URL path
10.6 THE Frontend SHALL display the currently selected year and month prominently in the interface
10.7 WHEN a user accesses the base documents route without year and month, THE Frontend SHALL display a prompt to select a period
10.8 THE Frontend SHALL support browser back/forward navigation between different year/month periods

### Requirement 11: Frontend Document Management UI

**User Story:** As a user, I want a user interface to manage documents for the selected period, so that I can perform document operations through a visual interface.

#### Acceptance Criteria

11.1 THE Frontend SHALL provide a document list view displaying documents for the selected year and month
11.2 THE Frontend SHALL provide a button to trigger S3 synchronization for the selected month
11.3 THE Frontend SHALL provide a form to create new documents manually for the selected period
11.4 THE Frontend SHALL provide a form to edit existing document metadata
11.5 THE Frontend SHALL provide a delete action for documents with confirmation
11.6 WHEN displaying documents, THE Frontend SHALL show document name, invoice date, sender name, and amounts
11.7 WHEN S3 synchronization is triggered, THE Frontend SHALL display progress feedback
11.8 WHEN S3 synchronization completes, THE Frontend SHALL refresh the document list and display a summary message
11.9 WHEN the document list is empty for the selected period, THE Frontend SHALL display a message indicating no documents exist
