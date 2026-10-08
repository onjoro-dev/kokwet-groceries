import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { asyncHandler } from "../middleware/asyncHandler";

const IMAGE_TYPES: Record<string, { extension: string; signature: (data: Buffer) => boolean }> = {
  "image/jpeg": { extension: "jpg", signature: (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  "image/png": { extension: "png", signature: (data) => data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/webp": { extension: "webp", signature: (data) => data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" },
  "image/gif": { extension: "gif", signature: (data) => data.length >= 6 && ["GIF87a", "GIF89a"].includes(data.toString("ascii", 0, 6)) },
};

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  const imageType = IMAGE_TYPES[req.headers["content-type"] || ""];
  const file = req.body as Buffer;
  if (!imageType || !Buffer.isBuffer(file) || file.length === 0) {
    return res.status(400).json({ message: "Choose a JPEG, PNG, WebP or GIF image." });
  }
  if (file.length > 5 * 1024 * 1024) {
    return res.status(413).json({ message: "Product images must be 5 MB or smaller." });
  }
  if (!imageType.signature(file)) {
    return res.status(400).json({ message: "The selected file does not match its image type." });
  }

  const filename = `${randomUUID()}.${imageType.extension}`;
  const uploadsDirectory = path.resolve(process.cwd(), "uploads");
  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(path.join(uploadsDirectory, filename), file, { flag: "wx" });
  res.status(201).json({ imageUrl: `${req.protocol}://${req.get("host")}/uploads/${filename}` });
});
