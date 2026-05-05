import os from "os";
import path from "path";

const isVercel = !!process.env.VERCEL;

export const UPLOAD_ROOT = isVercel
  ? path.join(os.tmpdir(), "uploads")
  : path.join(process.cwd(), "uploads");

export const BLOG_UPLOAD_DIR = path.join(UPLOAD_ROOT, "blogs");
