import { test, expect } from '@playwright/test';

test.describe('AUVRA Skin Analysis End-to-End Workflow', () => {
  test('User can upload an image, consent, analyze, and see results', async ({ page }) => {
    // 1. Visit the home page and navigate to Analyze page
    await page.goto('/');
    await expect(page).toHaveTitle(/AUVRA/i);

    const getStartedButton = page.getByRole('link', { name: 'Mulai Analisis', exact: true }).first();
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();

    // 2. Upload an image
    // Ensure we are on the analyze page
    await expect(page).toHaveURL(/.*\/analyze/);
    await expect(page.getByText('Analisis Kulit', { exact: true })).toBeVisible();

    // Create a dummy 1x1 image buffer or use a path
    // For this skeleton, we assume there is a file input.
    // UploadZone component uses react-dropzone which has a hidden input
    const fileInput = page.locator('input[type="file"]');
    
    // We upload a mock buffer directly to the input file
    const mockImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await fileInput.setInputFiles({
      name: 'test-skin.png',
      mimeType: 'image/png',
      buffer: mockImageBuffer
    });

    // Click "Analisis Sekarang" in the preview overlay
    const analyzeNowButton = page.getByRole('button', { name: /Analisis Sekarang/i });
    await expect(analyzeNowButton).toBeVisible();
    await analyzeNowButton.click();

    // 3. Consent Modal Should Appear
    const consentModalTitle = page.getByText('Persetujuan Analisis AI');
    await expect(consentModalTitle).toBeVisible();
    
    // Check the checkbox first
    const checkboxLabel = page.locator('label').filter({ hasText: /Saya memahami bahwa ini bukan pengganti diagnosis medis/i });
    await checkboxLabel.click();

    // Click "Setuju & Mulai"
    const agreeButton = page.getByRole('button', { name: /Setuju & Mulai/i });
    await agreeButton.click();

    // 4. Analysis Phase (Loading)
    // Check if the progress or cancel button appears
    await expect(page.getByText('Batalkan')).toBeVisible();

    // Wait for the analysis to finish (the dummy worker takes around 2.5 seconds)
    // ResultsDashboard will appear and "Batalkan" will disappear
    await expect(page.getByText('Batalkan')).toBeHidden({ timeout: 10000 });

    // 5. Results Phase
    await expect(page.getByText('Skor Kesehatan Kulit')).toBeVisible({ timeout: 10000 });
    
    // Expect to see some features or recommendations
    await expect(page.getByText('Pigmentasi')).toBeVisible();
    await expect(page.getByText('Tekstur')).toBeVisible();
    await expect(page.getByText('Kemerahan', { exact: true })).toBeVisible();
    
    // Verify local persistence by going to history
    const historyLink = page.getByRole('link', { name: /Riwayat/i });
    await historyLink.click();
    await expect(page).toHaveURL(/.*\/history/);
    
    // Check if the recent scan appears in the list
    await expect(page.getByText('Semua hasil analisis kulit Anda tersimpan')).toBeVisible();
    // A scan card should exist showing status 'Selesai'
    await expect(page.locator('span').filter({ hasText: 'Selesai' }).first()).toBeVisible();
  });
});
