import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordPattern =
    /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s])\S{8,}$/;

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!passwordPattern.test(password)) {
      setError(
        "Password must contain at least 8 characters, one alphabet, one number, and one special character."
      );
      return;
    }

    setLoading(true);
    // Signup varun banavlelya account ne login (MongoDB madhe check hoto)
    const result = await signIn("credentials", {
      mobile,
      password,
      redirect: false,
    });
    setLoading(false);

    if (!result?.ok) {
      setError("Invalid mobile number or password.");
      return;
    }

    router.push("/dashboard");
  }

  // Original login logic
  if (session.data == null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4 py-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">

          {/* Header */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            👋
          </div>

          <h1 className="mb-3 text-3xl font-bold text-gray-800">
            Welcome
          </h1>

          <p className="mb-7 text-gray-500">
            Please login to continue
          </p>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-left text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 text-left">

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Mobile Number
              </label>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                placeholder="Enter 10-digit mobile number"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s])\S{8,}"
                title="Password must contain at least 8 characters, one alphabet, one number, and one special character."
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Password requirements:
                <br />
                ✓ Minimum 8 characters
                <br />
                ✓ At least one alphabet (A–Z)
                <br />
                ✓ At least one number (0–9)
                <br />
                ✓ At least one special character (@, #, $, etc.)
              </p>
            </div>
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">Or login with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="rounded-xl border border-gray-300 px-3 py-3 font-medium transition hover:bg-gray-50"
            >
              Google
            </button>

            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="rounded-xl border border-gray-300 px-3 py-3 font-medium transition hover:bg-gray-50"
            >
              GitHub
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    );
  }

  // Original logged-in UI
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

        {/* Original Logout Logic */}
        <button
          onClick={() => signOut()}
          className="w-full rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition duration-200 hover:bg-red-600 hover:shadow-xl active:scale-95"
        >
          Logout
        </button>

      </div>
    </div>
  );
}



