import fs from "fs";
import path from "path";
import { UPLOAD_ROOT } from "./upload-path.js";

/**
 * Deletes a file from the filesystem given its stored URL path.
 * Silently ignores errors if the file does not exist.
 * @param {string} filePath - The stored path, e.g. "/uploads/blogs/blog-xyz.jpg"
 */
export const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    // Strip leading slash and resolve against the project root (Backend/)
    const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const absolutePath = path.resolve(relativePath.startsWith("uploads/") ? path.join(UPLOAD_ROOT, relativePath.slice("uploads/".length)) : relativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch {
    // Non-critical: log but do not throw
    console.warn(`[file-util] Could not delete file: ${filePath}`);
  }
};
