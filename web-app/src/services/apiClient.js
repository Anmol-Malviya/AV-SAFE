/**
 * Unified client service for calling internal Next.js API endpoints
 */

export async function analyzeUrlActive(url) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return response.json();
}

export async function fetchScanHistory() {
  const response = await fetch('/api/history', { cache: 'no-store' });
  return response.json();
}

export async function submitComplaint(complaintData) {
  const response = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaintData)
  });
  return response.json();
}
