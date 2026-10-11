import { useEffect, useRef, useState } from "react";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ImageKit URL transformation for a light, cropped thumbnail
function thumb(url) {
  return `${url}${url.includes("?") ? "&" : "?"}tr=w-400,h-300,c-maintain_ratio`;
}

// XHR instead of fetch so we can show upload progress
function uploadToImageKit(file, auth, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("fileName", file.name);
    form.append("publicKey", auth.publicKey);
    form.append("signature", auth.signature);
    form.append("expire", auth.expire);
    form.append("token", auth.token);
    form.append("folder", "/dashboard");
    form.append("useUniqueFileName", "true");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_URL);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body.message || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    xhr.send(form);
  });
}

export default function ImageUploader() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]); // { id, name, progress, error }
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  function flash(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setImages(json.data);
        else flash(json.message, "error");
      })
      .catch(() => flash("Could not load images", "error"))
      .finally(() => setLoading(false));
  }, []);

  function updateUpload(id, patch) {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  async function uploadFile(file) {
    const id = `${file.name}-${Date.now()}-${Math.random()}`;
    setUploads((prev) => [...prev, { id, name: file.name, progress: 0, error: null }]);

    if (!ACCEPTED.includes(file.type)) {
      updateUpload(id, { error: "Only JPG, PNG, WEBP or GIF allowed" });
      return;
    }
    if (file.size > MAX_SIZE) {
      updateUpload(id, { error: "File is larger than 5 MB" });
      return;
    }

    try {
      // 1. Get a one-time signature from our server
      const authRes = await fetch("/api/imagekit/auth");
      const authJson = await authRes.json();
      if (!authJson.success) throw new Error(authJson.message);

      // 2. Upload the file straight to ImageKit
      const result = await uploadToImageKit(file, authJson.data, (progress) =>
        updateUpload(id, { progress })
      );

      // 3. Save the image details in MongoDB
      const saveRes = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: result.fileId,
          name: result.name,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          width: result.width,
          height: result.height,
          size: result.size,
        }),
      });
      const saveJson = await saveRes.json();
      if (!saveJson.success) throw new Error(saveJson.message);

      setImages((prev) => [saveJson.data, ...prev]);
      setUploads((prev) => prev.filter((u) => u.id !== id));
      flash(`${file.name} uploaded`);
    } catch (error) {
      updateUpload(id, { error: error.message });
    }
  }

  function handleFiles(fileList) {
    Array.from(fileList || []).forEach(uploadFile);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(image) {
    if (!window.confirm(`Delete "${image.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/images/${image._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setImages((prev) => prev.filter((img) => img._id !== image._id));
      if (preview?._id === image._id) setPreview(null);
      flash("Image deleted");
    } catch (error) {
      flash(error.message, "error");
    }
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      flash("Image URL copied");
    } catch {
      flash("Could not copy URL", "error");
    }
  }

  return (
    <section
      id="images"
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Image Uploads</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload images to ImageKit and manage them here
          </p>
        </div>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          {images.length} {images.length === 1 ? "image" : "images"}
        </span>
      </div>

      <div className="space-y-6 p-6">
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/40"
          }`}
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
          </div>
          <p className="font-semibold text-slate-800">
            <span className="text-indigo-600">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP or GIF · up to 5 MB each</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Upload progress */}
        {uploads.length > 0 && (
          <ul className="space-y-2">
            {uploads.map((u) => (
              <li key={u.id} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-slate-700">{u.name}</span>
                  {u.error ? (
                    <button
                      onClick={() => setUploads((prev) => prev.filter((x) => x.id !== u.id))}
                      className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-700"
                    >
                      Dismiss
                    </button>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-indigo-600">
                      {u.progress}%
                    </span>
                  )}
                </div>
                {u.error ? (
                  <p className="text-xs text-red-500">{u.error}</p>
                ) : (
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Gallery */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[4/3] animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No images yet. Your uploads will appear here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image._id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => setPreview(image)}
                  className="block w-full"
                >
                  <img
                    src={thumb(image.url)}
                    alt={image.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </button>
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">{image.name}</p>
                    <p className="text-[11px] text-slate-400">{formatSize(image.size)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => copyUrl(image.url)}
                      title="Copy URL"
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="11" height="11" rx="2" />
                        <path d="M5 15V5a2 2 0 012-2h10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(image)}
                      title="Delete"
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full-size preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={preview.url}
              alt={preview.name}
              className="max-h-[80vh] rounded-xl object-contain shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white">
              <span className="truncate">{preview.name}</span>
              <div className="flex shrink-0 gap-2">
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20"
                >
                  Open original
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="rounded-lg bg-white px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-2xl ${
            message.type === "error" ? "bg-red-500" : "bg-slate-900"
          }`}
        >
          {message.text}
        </div>
      )}
    </section>
  );
}
