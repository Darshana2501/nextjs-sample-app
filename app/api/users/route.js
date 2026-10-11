import clientPromise from "@/lib/mongodb";

async function getCollection() {
  const client = await clientPromise;
  return client.db("demo").collection("users");
}

// READ - all users
export async function GET() {
  try {
    const users = await (await getCollection())
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ success: true, data: users });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// CREATE - new user
export async function POST(request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return Response.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    const user = { name, email, createdAt: new Date() };
    const result = await (await getCollection()).insertOne(user);

    return Response.json(
      { success: true, data: { _id: result.insertedId, ...user } },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
