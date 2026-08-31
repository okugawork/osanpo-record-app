const storageKey = "osanpo-record-app-data";
const dataVersion = 1;

export function loadAppData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(storageKey));
    return savedData?.version === dataVersion ? savedData : { version: dataVersion, visits: [] };
  } catch {
    return { version: dataVersion, visits: [] };
  }
}

export function saveAppData(appData) {
  localStorage.setItem(storageKey, JSON.stringify(appData));
}

export function exportAppData(appData) {
  return JSON.stringify(appData, null, 2);
}

export function importAppData(jsonText) {
  const importedData = JSON.parse(jsonText);
  if (importedData?.version !== dataVersion || !Array.isArray(importedData.visits)) {
    throw new Error("このファイルは読み込めません。");
  }
  return importedData;
}