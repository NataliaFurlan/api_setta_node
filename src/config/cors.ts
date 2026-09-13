const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function isAllowedCorsOrigin(
  origin: string | undefined,
  configuredOrigins: ReadonlySet<string>,
) {
  if (!origin || configuredOrigins.has(origin)) return true;

  try {
    const url = new URL(origin);
    return (
      url.origin === origin &&
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      loopbackHosts.has(url.hostname)
    );
  } catch {
    return false;
  }
}
