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

export async function deleteFile(relativePath: string): Promise<void> {
  const filePath = path.join(process.cwd(), "public", relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
