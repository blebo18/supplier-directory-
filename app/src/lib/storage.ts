import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveFile(
  subdir: string,
  supplierId: number,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subdir, supplierId.toString());
  fs.mkdirSync(dir, { recursive: true });

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${safeName}`;
  const filePath = path.join(dir, uniqueName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${subdir}/${supplierId}/${uniqueName}`;
}

export async function saveAdFile(
  adId: number,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, "ads", adId.toString());
  fs.mkdirSync(dir, { recursive: true });

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${safeName}`;
  const filePath = path.join(dir, uniqueName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/ads/${adId}/${uniqueName}`;
}

export async function saveSiteFile(
  filename: string,
  buffer: Buffer
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, "site");
  fs.mkdirSync(dir, { recursive: true });

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}-${safeName}`;
  const filePath = path.join(dir, uniqueName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/site/${uniqueName}`;
}

export function deleteDirectory(relativePath: string): void {
  const dirPath = path.join(process.cwd(), "public", relativePath);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true });
  }
}

export async function deleteFile(relativePath: string): Promise<void> {
  const filePath = path.join(process.cwd(), "public", relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
