/**
 * Utility formatters for AV-SAFE Web Application
 */

export function formatDate(timestamp) {
  if (!timestamp) return new Date().toLocaleDateString();
  return new Date(timestamp).toLocaleDateString();
}

export function formatUrl(rawUrl) {
  if (!rawUrl) return '';
  return rawUrl.trim();
}
