import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";
import { deleteImageKitFile } from "@/lib/imagekit";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ success: false, message: "Please sign in first" });
  }

  const { id } = req.query;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid id" });
  }

  try {
    const client = await clientPromise;
    const images = client.db("demo").collection("images");

    // Owner check so users can only delete their own images
    const image = await images.findOne({
      _id: new ObjectId(id),
      owner: session.user.email,
    });
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    await deleteImageKitFile(image.fileId);
    await images.deleteOne({ _id: image._id });

    return res.status(200).json({ success: true, message: "Image deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
