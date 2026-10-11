import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUploadAuthParams } from "@/lib/imagekit";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, message: "Please sign in first" });
  }

  try {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ success: true, data: getUploadAuthParams() });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
