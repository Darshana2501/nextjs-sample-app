
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function postJSON(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }

  async function sendOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      const data = await postJSON("/api/auth/send-otp", {
        mobile,
      });

      setMessage(data.message || "OTP sent successfully.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const data = await postJSON("/api/auth/verify-otp", {
        mobile,
        otp,
      });

      if (!data.resetToken) {
        throw new Error("The server did not return a reset token.");
      }

      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9\s]/.test(password) ||
      /\s/.test(password)
    ) {
      setError(
        "Use a letter, a number, a special character, and no spaces."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await postJSON("/api/auth/reset-password", {
        mobile,
        resetToken,
        password,
      });

      setMessage(
        data.message || "Password reset successfully."
      );
      setStep(4);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-xl">
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Reset your password
            </h1>

            <p className="mt-3 text-lg leading-8 text-gray-500">
              Enter your registered mobile number and we will
              send you a verification code (OTP).
            </p>

            <form onSubmit={sendOTP} className="mt-10">
              <label
                htmlFor="mobile"
                className="mb-2 block font-medium text-gray-800"
              >
                Mobile number
              </label>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  setMobile(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  );
                  setError("");
                }}
                placeholder="Enter your 10-digit mobile number"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-2xl bg-teal-700 px-6 py-5 font-semibold text-white shadow-md hover:bg-teal-800 disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-gray-950">
              Verify OTP
            </h1>

            <p className="mt-3 text-gray-500">
              Enter the 6-digit code sent to your registered mobile.
            </p>

            <form onSubmit={verifyOTP} className="mt-8">
              <label
                htmlFor="otp"
                className="mb-2 block font-medium text-gray-800"
              >
                Verification code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="Enter 6-digit OTP"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-4 text-lg tracking-widest outline-none focus:border-teal-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-teal-700 px-6 py-4 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="mt-4 w-full text-sm font-medium text-teal-700 hover:underline"
              >
                Change mobile number
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold text-gray-950">
              Create new password
            </h1>

            <p className="mt-3 text-gray-500">
              Choose a strong password for your account.
            </p>

            <form onSubmit={resetPassword} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block font-medium text-gray-800"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-medium text-gray-800"
                >
                  Confirm new password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:border-teal-600"
                />
              </div>

              <p className="text-xs leading-5 text-gray-500">
                Use at least 8 characters, including a letter,
                a number, and a special character. No spaces.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-teal-700 px-6 py-4 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="mb-5 text-5xl" aria-hidden="true">
              ✓
            </div>

            <h1 className="text-3xl font-bold text-gray-950">
              Password reset complete
            </h1>

            <p className="mt-3 text-gray-500">
              Your password has been changed. You can now sign in
              with your new password.
            </p>

            <Link
              href="/"
              className="mt-8 inline-block w-full rounded-2xl bg-teal-700 px-6 py-4 font-semibold text-white hover:bg-teal-800"
            >
              Back to Login
            </Link>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {message && step !== 4 && (
          <p
            role="status"
            className="mt-5 rounded-lg bg-teal-50 p-3 text-sm text-teal-800"
          >
            {message}
          </p>
        )}

        {step !== 4 && (
          <div className="mt-10 border-t border-slate-100 pt-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 font-medium text-teal-700 hover:text-teal-900"
            >
              <span className="text-2xl" aria-hidden="true">←</span>
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
