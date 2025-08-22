export function lazyImport(importer) {
  // Simple dynamic import helper
  return importer();
}
