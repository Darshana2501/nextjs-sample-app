import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

async function getCollection() {
  const client = await clientPromise;
  return client.db("demo").collection("users");
}

function invalidId() {
  return Response.json(
    { success: false, message: "Invalid id" },
    { status: 400 }
  );
}

// READ - single user
export async function GET(request, { params }) {
  if (!ObjectId.isValid(params.id)) return invalidId();

  try {
    const user = await (await getCollection()).findOne({
      _id: new ObjectId(params.id),
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: user });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(request, { params }) {
  if (!ObjectId.isValid(params.id)) return invalidId();

  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return Response.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    const result = await (await getCollection()).updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { name, email, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: "User updated" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(request, { params }) {
  if (!ObjectId.isValid(params.id)) return invalidId();

  try {
    const result = await (await getCollection()).deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: "User deleted" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
