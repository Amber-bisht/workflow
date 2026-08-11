import ImageKit from "imagekit";
import sharp from "sharp";
import { env } from "../config/env";

export class ImageKitService {
  private static imagekit = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  });

  /**
   * Process and crop image using Sharp, then upload to ImageKit CDN
   */
  static async cropAndUploadImage(
    inputImage: string,
    xPct: number,
    yPct: number,
    wPct: number,
    hPct: number,
    filename: string
  ): Promise<string> {
    try {
      let imageBuffer: Buffer;

      // 1. Resolve image input (Base64 vs HTTP URL)
      if (inputImage.startsWith("data:image")) {
        const base64Data = inputImage.split(",")[1];
        if (!base64Data) throw new Error("Invalid base64 image data");
        imageBuffer = Buffer.from(base64Data, "base64");
      } else if (inputImage.startsWith("http")) {
        const response = await fetch(inputImage);
        if (!response.ok) {
          throw new Error(`Failed to fetch input image from URL: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } else {
        throw new Error("Unsupported image source: must be base64 or HTTP URL");
      }

      // 2. Extract image metadata with Sharp to perform percentage crop
      const metadata = await sharp(imageBuffer).metadata();
      const imageWidth = metadata.width || 800;
      const imageHeight = metadata.height || 600;

      const left = Math.max(0, Math.round((xPct / 100) * imageWidth));
      const top = Math.max(0, Math.round((yPct / 100) * imageHeight));
      const width = Math.min(imageWidth - left, Math.round((wPct / 100) * imageWidth));
      const height = Math.min(imageHeight - top, Math.round((hPct / 100) * imageHeight));

      // 3. Crop image instantly in memory using Sharp
      const croppedBuffer = await sharp(imageBuffer)
        .extract({ left, top, width: Math.max(1, width), height: Math.max(1, height) })
        .toBuffer();

      // 4. Upload cropped buffer to ImageKit
      if (env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_PRIVATE_KEY !== "private_dummy") {
        const uploadResult = await this.imagekit.upload({
          file: croppedBuffer,
          fileName: filename,
          folder: "/nextflow-crops",
        });
        return uploadResult.url;
      }

      // Fallback if ImageKit keys are not configured yet: return web-ready Base64 Data URI
      const base64 = croppedBuffer.toString("base64");
      return `data:image/png;base64,${base64}`;
    } catch (error: any) {
      console.error("[ImageKitService] Error processing image:", error);
      throw new Error(`Image cropping failed: ${error.message}`);
    }
  }
}
