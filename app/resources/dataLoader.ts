export async function getLocalizedData(langCode: string) {
  // Currently, we only have English resources for psychiatry.
  // In the future, we can add dynamic imports for other languages here.
  return (await import('./data/sample_data.json')).default;
}
