// Thin wrappers over window.location, so components can use them and tests can
// mock them.
export function goTo(url: string, options: { replace?: boolean } = {}): void {
  if (options.replace) window.location.replace(url);
  else window.location.assign(url);
}

export function reloadPage(): void {
  window.location.reload();
}
