import crypto from "crypto";
import { getEnv } from "@/lib/env";

export function getImageKitConfig() {
  const publicKey = getEnv("IMAGEKIT_PUBLIC_KEY");
  const privateKey = getEnv("IMAGEKIT_PRIVATE_KEY");
  const urlEndpoint = getEnv("IMAGEKIT_URL_ENDPOINT");

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "ImageKit keys are missing. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT in .env.local"
    );
  }

  return { publicKey, privateKey, urlEndpoint };
}

// Signed params that let the browser upload directly to ImageKit
// without ever seeing the private key. Valid for 30 minutes.
export function getUploadAuthParams() {
  const { publicKey, privateKey, urlEndpoint } = getImageKitConfig();
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return { token, expire, signature, publicKey, urlEndpoint };
}

export async function deleteImageKitFile(fileId) {
  const { privateKey } = getImageKitConfig();
  const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
    },
  });

  // 404 means it is already gone from ImageKit, which is fine
  if (!res.ok && res.status !== 404) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Could not delete file from ImageKit");
  }
}
