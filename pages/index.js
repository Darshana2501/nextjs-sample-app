import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import { useSession,signIn,signOut } from "next-auth/react";

export default function Home() {
  const session = useSession();
  console.log("Session,session");

  if (session.data == null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            👋
          </div>

          <h1 className="mb-3 text-3xl font-bold text-gray-800">
            Welcome
          </h1>

          <p className="mb-7 text-gray-500">
            Please login to continue
          </p>

          <button
            onClick={signIn}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-95"
          >
            Login
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
          👤
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-800">
          hello {session?.data?.user?.name}
        </h1>

        <p className="mb-7 text-gray-500">
          You are successfully logged in.
        </p>

        <button
          onClick={signOut}
          className="w-full rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition duration-200 hover:bg-red-600 hover:shadow-xl active:scale-95"
        >
          logout
        </button>

      </div>
    </div>
  );
}



