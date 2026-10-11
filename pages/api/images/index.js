import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { getImageKitConfig } from "@/lib/imagekit";

async function getCollection() {
  const client = await clientPromise;
  return client.db("demo").collection("images");
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ success: false, message: "Please sign in first" });
  }
  const owner = session.user.email;

  try {
    // READ - images uploaded by the signed-in user
    if (req.method === "GET") {
      const images = await (await getCollection())
        .find({ owner })
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json({ success: true, data: images });
    }

    // CREATE - save metadata after the browser uploaded to ImageKit
    if (req.method === "POST") {
      const { fileId, name, url, thumbnailUrl, width, height, size } = req.body || {};

      if (!fileId || !url) {
        return res
          .status(400)
          .json({ success: false, message: "fileId and url are required" });
      }

      // Only accept URLs from our own ImageKit account
      const { urlEndpoint } = getImageKitConfig();
      if (!url.startsWith(urlEndpoint)) {
        return res.status(400).json({ success: false, message: "Invalid image url" });
      }

      const image = {
        owner,
        fileId,
        name,
        url,
        thumbnailUrl,
        width,
        height,
        size,
        createdAt: new Date(),
      };
      const result = await (await getCollection()).insertOne(image);

      return res
        .status(201)
        .json({ success: true, data: { _id: result.insertedId, ...image } });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
