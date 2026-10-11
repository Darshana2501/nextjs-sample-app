import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const EMPTY_FORM = { name: "", email: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE_SIZE = 8;

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-cyan-500 to-blue-500",
];

const COLUMNS = [
  { key: "name", label: "User", sortable: true },
  { key: "email", label: "Email", sortable: true, className: "hidden md:table-cell" },
  { key: "createdAt", label: "Joined", sortable: true, className: "hidden w-40 sm:table-cell" },
];

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function avatarColor(name) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isNew(value) {
  if (!value) return false;
  return Date.now() - new Date(value).getTime() < 24 * 60 * 60 * 1000;
}

function SortIcon({ active, dir }) {
  return (
    <span className={`ml-1 inline-flex flex-col text-[8px] leading-[8px] ${active ? "text-indigo-600" : "text-gray-300"}`}>
      <span className={active && dir === "asc" ? "" : "opacity-40"}>▲</span>
      <span className={active && dir === "desc" ? "" : "opacity-40"}>▼</span>
    </span>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113 3L8.5 18.85 4 20l1.15-4.5L16.862 4.487z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7" />
    </svg>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const nameInputRef = useRef(null);
  const toastTimer = useRef(null);

  function showToast(message, type = "success") {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) setUsers(json.data);
      else showToast(json.message, "error");
    } catch {
      showToast("Could not connect to the server", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    return () => clearTimeout(toastTimer.current);
  }, []);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/users/${editingId}` : "/api/users",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
          }),
        }
      );
      const json = await res.json();

      if (!json.success) {
        showToast(json.message, "error");
        return;
      }

      showToast(editingId ? "User updated successfully" : "User added successfully");
      resetForm();
      loadUsers();
    } catch {
      showToast("Something went wrong, please try again", "error");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingId(null);
  }

  function handleEdit(user) {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    nameInputRef.current?.focus();
  }

  async function confirmDelete() {
    const user = deleteTarget;
    setDeleteTarget(null);

    try {
      const res = await fetch(`/api/users/${user._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        showToast(json.message, "error");
        return;
      }
      if (editingId === user._id) resetForm();
      showToast(`${user.name} was deleted`);
      loadUsers();
    } catch {
      showToast("Could not delete the user", "error");
    }
  }

  function toggleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  const query = search.trim().toLowerCase();

  const sortedUsers = useMemo(() => {
    const filtered = query
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        )
      : users;

    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      if (sort.key === "createdAt") {
        return (new Date(av).getTime() - new Date(bv).getTime()) * factor;
      }
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [users, query, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = sortedUsers.slice(pageStart, pageStart + PAGE_SIZE);
  const newToday = users.filter((u) => isNew(u.createdAt)).length;

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-gray-800 placeholder-gray-400 transition focus:outline-none focus:ring-4 ${
      errors[field]
        ? "border-red-400 focus:ring-red-100"
        : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
    }`;

  return (
    <>
      <Head>
        <title>Users | CRUD</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
              >
                ← Back to dashboard
              </Link>
              <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-indigo-500">
                Management
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Users
              </h1>
              <p className="mt-1 text-gray-500">
                Add, edit and manage all your users in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Total users
                </p>
                <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  New today
                </p>
                <p className="text-2xl font-bold text-emerald-600">{newToday}</p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`mb-6 rounded-2xl border bg-white p-6 shadow-lg transition ${
              editingId ? "border-amber-300 ring-4 ring-amber-100" : "border-gray-100"
            }`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Edit user" : "Add a new user"}
                </h2>
                <p className="text-sm text-gray-400">
                  {editingId
                    ? "Update the details and save your changes."
                    : "Fill in the details below to create a user."}
                </p>
              </div>
              {editingId && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Editing
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Full name
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. Darshana Bachhav"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {saving ? "Saving..." : editingId ? "Update user" : "Add user"}
              </button>
            </div>
          </form>

          {/* Table card */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">All users</h2>
                <p className="text-sm text-gray-400">
                  {query
                    ? `${sortedUsers.length} of ${users.length} users match`
                    : `${users.length} users in total`}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th scope="col" className="w-14 px-5 py-3 font-semibold">#</th>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        scope="col"
                        className={`px-5 py-3 font-semibold ${col.className ?? ""}`}
                        aria-sort={
                          sort.key === col.key
                            ? sort.dir === "asc" ? "ascending" : "descending"
                            : "none"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className="inline-flex items-center uppercase tracking-wider transition hover:text-gray-800"
                        >
                          {col.label}
                          <SortIcon active={sort.key === col.key} dir={sort.dir} />
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="w-32 px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    [1, 2, 3, 4].map((n) => (
                      <tr key={n} className="animate-pulse">
                        <td className="px-5 py-4"><div className="h-3 w-4 rounded bg-gray-200" /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200" />
                            <div className="h-4 w-32 rounded bg-gray-200" />
                          </div>
                        </td>
                        <td className="hidden px-5 py-4 md:table-cell"><div className="h-3 w-40 rounded bg-gray-100" /></td>
                        <td className="hidden px-5 py-4 sm:table-cell"><div className="h-3 w-20 rounded bg-gray-100" /></td>
                        <td className="px-5 py-4"><div className="ml-auto h-8 w-16 rounded bg-gray-100" /></td>
                      </tr>
                    ))
                  ) : pageUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                          {query ? "🔎" : "📭"}
                        </div>
                        <p className="font-semibold text-gray-700">
                          {query ? "No matching users" : "No users yet"}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          {query
                            ? `No user matches "${search}"`
                            : "Use the form above to add your first user."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pageUsers.map((user, i) => (
                      <tr
                        key={user._id}
                        className={`transition ${
                          editingId === user._id
                            ? "bg-amber-50"
                            : "hover:bg-indigo-50/40"
                        }`}
                      >
                        <td className="px-5 py-4 font-medium text-gray-400">
                          {pageStart + i + 1}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ${avatarColor(
                                user.name
                              )}`}
                            >
                              {initials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 truncate font-semibold text-gray-900">
                                <span className="truncate">{user.name}</span>
                                {isNew(user.createdAt) && (
                                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                    New
                                  </span>
                                )}
                              </p>
                              {/* Email shown under the name on small screens */}
                              <p className="truncate text-xs text-gray-500 md:hidden">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden truncate px-5 py-4 text-gray-600 md:table-cell">
                          <a href={`mailto:${user.email}`} className="hover:text-indigo-600">
                            {user.email}
                          </a>
                        </td>
                        <td className="hidden whitespace-nowrap px-5 py-4 text-gray-500 sm:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              title="Edit"
                              aria-label={`Edit ${user.name}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              title="Delete"
                              aria-label={`Delete ${user.name}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && sortedUsers.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-3 text-sm text-gray-500 sm:flex-row">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-gray-700">{pageStart + 1}</span>–
                  <span className="font-semibold text-gray-700">
                    {pageStart + pageUsers.length}
                  </span>{" "}
                  of <span className="font-semibold text-gray-700">{sortedUsers.length}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`h-8 min-w-8 rounded-lg px-2 font-medium transition ${
                        n === currentPage
                          ? "bg-indigo-600 text-white shadow"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <TrashIcon />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Delete user?</h3>
            <p className="mb-6 text-gray-500">
              <span className="font-semibold text-gray-700">{deleteTarget.name}</span>{" "}
              will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white shadow-lg transition hover:bg-red-600 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-5 py-3 font-medium text-white shadow-2xl ${
            toast.type === "error" ? "bg-red-500" : "bg-gray-900"
          }`}
        >
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.message}
        </div>
      )}
    </>
  );
}
