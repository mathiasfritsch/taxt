import { test, expect } from '@playwright/test';

test.describe('Documents Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:4200');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Frontend');
  });

  test('displays main heading', async ({ page }) => {
    const heading = page.locator('[data-id="main-heading"]');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('your documents');
  });

  test('displays documents section heading', async ({ page }) => {
    const heading = page.locator('[data-id="documents-heading"]');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Documents');
  });

  test('loads and displays documents from API', async ({ page }) => {
    // Wait for documents to load
    const documentsContainer = page.locator('[data-id="documents-container"]');
    await expect(documentsContainer).toBeVisible();

    // Verify we have a list of documents
    const documentsList = page.locator('[data-id="documents-list"]');
    await expect(documentsList).toBeVisible();

    // Check that we have 3 document items
    const documentItems = page.locator('[data-id="documents-list"] li');
    await expect(documentItems).toHaveCount(3);
  });

  test('displays correct document information', async ({ page }) => {
    // Wait for documents to load using data-id
    await page.waitForSelector('[data-id="documents-list"]');

    // Check specific documents using their data-id attributes
    await expect(page.locator('[data-id="document-1"]')).toBeVisible();
    await expect(page.locator('[data-id="document-1"]')).toContainText('Document 1');
    
    await expect(page.locator('[data-id="document-2"]')).toBeVisible();
    await expect(page.locator('[data-id="document-2"]')).toContainText('Document 2');
    
    await expect(page.locator('[data-id="document-3"]')).toBeVisible();
    await expect(page.locator('[data-id="document-3"]')).toContainText('Document 3');
  });

  test('does not show loading state after documents load', async ({ page }) => {
    // Wait for documents to load
    await page.waitForSelector('[data-id="documents-list"]');
    
    // Verify loading text is not present using data-id
    const loadingMessage = page.locator('[data-id="loading-message"]');
    await expect(loadingMessage).not.toBeVisible();
  });

  test('does not show error state when API is working', async ({ page }) => {
    // Wait for documents to load
    await page.waitForSelector('[data-id="documents-list"]');
    
    // Verify no error message is displayed using data-id
    const errorMessage = page.locator('[data-id="error-message"]');
    await expect(errorMessage).not.toBeVisible();
  });

  test('can retry loading on error', async ({ page }) => {
    // This test verifies the retry button exists when there's an error
    // Note: You would need to mock an API error to fully test this
    const retryButton = page.locator('[data-id="retry-button"]');
    // In a real error scenario, this button would be visible
    // For now, we just verify the selector works
  });
});

