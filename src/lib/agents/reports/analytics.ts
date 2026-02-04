export function track(event: string, properties?: Record<string, unknown>) {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
}

