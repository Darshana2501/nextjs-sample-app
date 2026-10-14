import clientPromise from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9][0-9]{9}$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s])\S{8,}$/;

async function getCollection() {
  const client = await clientPromise;
  const accounts = client.db("demo").collection("accounts");
  // Ekach email kiva mobile ne don accounts banu naye (login mobile ne hoto)
  await accounts.createIndex({ email: 1 }, { unique: true });
  await accounts.createIndex({ mobile: 1 }, { unique: true });
  return accounts;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const name = req.body?.name?.trim();
  const mobile = req.body?.mobile?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!name || !mobile || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: "Enter a valid email address." });
  }
  if (!MOBILE_RE.test(mobile)) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid 10-digit Indian mobile number." });
  }
  if (!PASSWORD_RE.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must have at least 8 characters, a letter, a number and a special character.",
    });
  }

  try {
    const accounts = await getCollection();

    await accounts.insertOne({
      name,
      mobile,
      email,
      password: await hashPassword(password),
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, message: "Account created successfully." });
  } catch (error) {
    // 11000 = duplicate key (email kiva mobile adhich registered ahe)
    if (error.code === 11000) {
      const field = error.keyPattern?.mobile ? "mobile number" : "email";
      return res
        .status(409)
        .json({ success: false, message: `An account with this ${field} already exists.` });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}
