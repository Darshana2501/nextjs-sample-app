import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";
import { getEnv } from "@/lib/env";
import { verifyPassword } from "@/lib/password";

export const authOptions = {
    secret: getEnv("NEXTAUTH_SECRET"),
    providers:[
        // Signup page varun banavlelya account ne mobile + password login
        CredentialsProvider({
            name: "Mobile",
            credentials: {
                mobile: { label: "Mobile Number", type: "tel" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const mobile = credentials?.mobile?.trim();
                const password = credentials?.password;
                if (!mobile || !password) return null;

                const client = await clientPromise;
                const account = await client
                    .db("demo")
                    .collection("accounts")
                    .findOne({ mobile });

                if (!account || !(await verifyPassword(password, account.password))) {
                    return null;
                }

                return {
                    id: account._id.toString(),
                    name: account.name,
                    email: account.email,
                };
            },
        }),
        GithubProvider({
            clientId: getEnv("GITHUB_ID"),

            clientSecret: getEnv("GITHUB_SECRET"),
        }),
          GoogleProvider({
            clientId: getEnv("GOOGLE_CLIENT_ID"),
            clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
        }),

    ],
};
export default NextAuth(authOptions);
