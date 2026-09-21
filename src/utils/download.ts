// src/utils/download.ts

/** Save a Blob (e.g. a CSV from the API) as a file in the browser. */
export const downloadBlob = (data: Blob, filename: string): void => {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
