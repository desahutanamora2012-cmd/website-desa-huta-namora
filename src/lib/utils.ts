import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts any Google Drive sharing URL into a direct embeddable image URL.
 * Works for both /file/d/{id}/view and ?id= formats.
 * Uses lh3.googleusercontent.com which is the most reliable format for embedding.
 */
export function parseGoogleDriveUrl(url: string): string {
  if (!url) return url;
  try {
    // Match /file/d/{fileId}/ format
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
    // Match ?id={fileId} or &id={fileId} format
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('drive.google.com') && urlObj.searchParams.has('id')) {
      return `https://lh3.googleusercontent.com/d/${urlObj.searchParams.get('id')}`;
    }
    // Already a direct lh3 URL or uc?export link — normalise if possible
    if (url.includes('uc?export=view') || url.includes('uc?id=')) {
      const idParam = new URL(url).searchParams.get('id');
      if (idParam) return `https://lh3.googleusercontent.com/d/${idParam}`;
    }
  } catch (e) {
    // If URL parsing fails, return original
  }
  return url;
}

import * as XLSX from "xlsx";

/**
 * Downloads one or more datasets as an Excel (XLSX) file.
 * `data` can be a single array of objects, or an object where keys are sheet names and values are arrays of objects.
 * `title` is added as the first row in each sheet.
 */
export function downloadExcel(
  data: any[] | Record<string, any[]>,
  filename: string,
  title?: string
) {
  if (!data || (Array.isArray(data) && data.length === 0)) return;

  const workbook = XLSX.utils.book_new();

  const addSheet = (sheetData: any[], sheetName: string, sheetTitle?: string) => {
    if (!sheetData || sheetData.length === 0) return;
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sheetData, { origin: sheetTitle ? "A2" : "A1" });
    
    if (sheetTitle) {
      // Add Title at A1
      XLSX.utils.sheet_add_aoa(worksheet, [[sheetTitle]], { origin: "A1" });
      // Optional: merge cells for the title
      const numCols = Object.keys(sheetData[0] || {}).length;
      if (!worksheet["!merges"]) worksheet["!merges"] = [];
      worksheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } });
    }
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  };

  if (Array.isArray(data)) {
    addSheet(data, "Data", title);
  } else {
    Object.keys(data).forEach((sheetName) => {
      addSheet(data[sheetName], sheetName, title ? `${title} - ${sheetName}` : undefined);
    });
  }

  const finalFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}
