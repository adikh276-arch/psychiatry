export async function getLocalizedData(langCode: string) {
  // Currently, we only have English resources for psychiatry.
  // In the future, we can add dynamic imports for other languages here.
  const rawData = (await import('./data/sample_data.json')).default;
  
  // Transform the data to match what the UI components expect
  // UI expects: { type: [ { concern, type, id, title, ... } ] }
  const formattedData: Record<string, any[]> = {};
  
  for (const [concern, typesObj] of Object.entries(rawData)) {
    for (const [type, items] of Object.entries(typesObj as Record<string, any[]>)) {
      if (!formattedData[type]) {
        formattedData[type] = [];
      }
      
      items.forEach((item, index) => {
        // Generate an ID if it doesn't exist
        const nameOrTitle = item.title || item.name || item.myth || `${type}-${index}`;
        const id = item.id || nameOrTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        formattedData[type].push({
          ...item,
          concern,
          type,
          id
        });
      });
    }
  }
  
  return formattedData;
}
