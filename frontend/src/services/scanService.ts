import { apiClient } from '@/lib/apiClient';
import type { ScanResult, ScanListItem } from '@/types/api.types';

// ─── Save Scan Result ──────────────────────────────────────────────────────
export async function saveScan(_scan: ScanResult): Promise<void> {
  // No-op: Backend automatically saves scan results upon analysis completion.
}

// ─── Get Single Scan Result ────────────────────────────────────────────────
export async function getScan(id: string, signal?: AbortSignal): Promise<ScanResult> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const response = await apiClient.get<ScanResult>(`/api/v1/scans/${id}`, { signal });
  return response.data;
}

// ─── List All Scans for User ───────────────────────────────────────────────
export async function listScans(signal?: AbortSignal): Promise<ScanListItem[]> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const response = await apiClient.get<ScanListItem[]>('/api/v1/scans', { signal });
  return response.data;
}

// ─── Delete Scan Result ────────────────────────────────────────────────────
export async function deleteScan(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/scans/${id}`);
}

