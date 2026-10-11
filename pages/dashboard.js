import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userName = session.user?.name || "User";
  const userEmail = session.user?.email || "Not available";
  const avatar = session.user?.image;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-950 text-white md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold shadow-lg shadow-indigo-500/30">
            D
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Dashboard</h1>
            <p className="text-xs text-slate-400">WORKSPACE</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-7">
  <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
    Main Menu
  </p>

  <Link
    href="/dashboard"
    className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-white shadow-lg  transition-all duration-300 hover:bg-indigo-400 hover:shadow-indigo-500/30"
  >
    <span>▦</span>
    Overview
  </Link>

  <a
    href="#analytics"
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-950/30"
  >
    <span>▥</span>
    Analytics
  </a>

  <a
    href="#activity"
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-950/30"
  >
    <span>◷</span>
    Activity
  </a>

  <a
    href="#images"
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-950/30"
  >
    <span>▣</span>
    Images
  </a>

  <Link
    href="/users"
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-950/30"
  >
    <span>☷</span>
    Users
  </Link>

  <a
    href="#profile"
    className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-950/30"
  >
    <span>♙</span>
    My Profile
  </a>
</nav>

        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-xs text-slate-400">Signed in</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
          >
            ↗ &nbsp; Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen md:ml-64">

        {/* Top Navigation */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div>
            <p className="text-sm text-slate-500">Workspace / Overview</p>
            <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {userName}
              </p>
              <p className="text-xs text-slate-500">Account overview</p>
            </div>

            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="h-11 w-11 rounded-full border-2 border-indigo-100 object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8 lg:p-10">

          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-200 sm:p-10">
            <div className="relative z-10 max-w-2xl">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
                ✨ PERSONAL WORKSPACE
              </span>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {userName.split(" ")[0]}!
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-indigo-100 sm:text-base">
                Great to see you again. Your workspace is ready.
                Manage your account and keep everything organized
                from one place.
              </p>

              <button
                onClick={() => router.push("/")}
                className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                Go to Home →
              </button>
            </div>

            <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[35px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-28 right-28 h-64 w-64 rounded-full bg-violet-400/20 blur-2xl" />
            <div className="pointer-events-none absolute right-10 top-10 hidden text-8xl opacity-20 lg:block">
              ◈
            </div>
          </section>

          {/* Statistics */}
          <section id="analytics">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your account at a glance
                </p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
                Account summary
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Account Status
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                      Active
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl text-emerald-600">
                    ✓
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Authenticated successfully
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Authentication
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                      Secure
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl text-indigo-600">
                    ♙
                  </div>
                </div>
                <p className="mt-5 text-sm text-slate-500">
                  Signed in with NextAuth
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:col-span-2 xl:col-span-1">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      Profile
                    </p>
                    <h3 className="mt-3 truncate text-xl font-bold text-slate-900">
                      {userName}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-2xl text-violet-600">
                    ◎
                  </div>
                </div>
                <p className="mt-5 truncate text-sm text-slate-500">
                  {userEmail}
                </p>
              </div>
            </div>
          </section>

          {/* Profile and Quick Actions */}
          <section className="grid gap-6 lg:grid-cols-5">

            {/* Profile Details */}
            <div
              id="profile"
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-3"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Profile Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your current account details
                </p>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="User avatar"
                    className="h-20 w-20 rounded-2xl object-cover ring-4 ring-indigo-50"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-3xl font-bold text-indigo-700 ring-4 ring-indigo-50">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {userName}
                  </h3>
                  <p className="mt-1 break-all text-sm text-slate-500">
                    {userEmail}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Verified session
                  </span>
                </div>
              </div>

              <div className="mt-7 border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account Access
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You are signed in and can access your dashboard.
                  Sign out whenever you finish your session.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your workspace
              </p>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-700">
                    ⌂
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      Home Page
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Visit your login page
                    </span>
                  </span>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl text-violet-700">
                    ▦
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      Dashboard
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      View account overview
                    </span>
                  </span>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  onClick={() => router.push("/users")}
                  className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/60"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-700">
                    ☷
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      Manage Users
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Add, edit and delete users
                    </span>
                  </span>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-4 rounded-xl border border-red-100 p-4 text-left transition hover:bg-red-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-xl text-red-600">
                    ↗
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      Sign Out
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      End your current session
                    </span>
                  </span>
                  <span className="text-slate-400">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* Image Uploads (ImageKit) */}
          <ImageUploader />

          {/* Recent Activity */}
          <section
            id="activity"
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current session information
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Activity</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-5 font-medium text-slate-800">
                      User Authentication
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      Session established
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Success
                      </span>
                    </td>
                  </tr>
                  <tr className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-5 font-medium text-slate-800">
                      Profile Loaded
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      {userEmail}
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Complete
                      </span>
                    </td>
                  </tr>
                  <tr className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-5 font-medium text-slate-800">
                      Dashboard Access
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      Protected page accessed
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Dashboard Workspace</p>
            <p>Built with Next.js, NextAuth & Tailwind CSS</p>
          </footer>

        </div>
      </main>
    </div>
  );
}