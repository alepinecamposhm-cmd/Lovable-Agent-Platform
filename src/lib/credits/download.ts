export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // Revoke later to allow the browser to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

