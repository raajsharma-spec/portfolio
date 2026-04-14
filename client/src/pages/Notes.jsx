import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { api, getToken } from "../api/client";

async function downloadWithAuth(noteId, fileName) {
  const res = await fetch(`/api/notes/${noteId}/download`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "note";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    const [n, s] = await Promise.all([api("/api/notes"), api("/api/subjects")]);
    setNotes(n);
    setSubjects(s);
    if (!subject && s[0]?._id) setSubject(s[0]._id);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    if (subject) fd.append("subject", subject);
    if (file) fd.append("file", file);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setTitle("");
    setDescription("");
    setFile(null);
    await load();
  }

  async function remove(id) {
    await api(`/api/notes/${id}`, { method: "DELETE" });
    await load();
  }

  function exportPdf(note) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(note.title, 14, 20);
    doc.setFontSize(11);
    const body = note.description || "(No text body)";
    const lines = doc.splitTextToSize(body, 180);
    doc.text(lines, 14, 30);
    doc.save(`${note.title.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink">Resource manager</h1>
        <p className="text-ink-muted mt-1">Organize notes by subject; upload files or export text to PDF.</p>
      </header>

      {err && (
        <div className="text-sm text-rose-600 bg-rose-500/10 px-4 py-2 rounded-lg">{err}</div>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
        <h2 className="font-semibold text-ink mb-4">New note</h2>
        <form
          onSubmit={(e) => onSubmit(e).catch((e2) => setErr(e2.message))}
          className="space-y-3 max-w-xl"
        >
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm min-h-[100px]"
            placeholder="Description / study notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <label className="text-sm text-ink-muted cursor-pointer">
              <span className="mr-2">File (optional)</span>
              <input type="file" className="text-xs" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium"
          >
            Save note
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 bg-surface">
        <div className="px-6 py-4 font-semibold text-ink">Your notes</div>
        {notes.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink-muted">No notes yet.</p>
        ) : (
          notes.map((n) => (
            <div key={n._id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{n.title}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {n.subject?.name || "General"} · {new Date(n.updatedAt).toLocaleDateString()}
                </p>
                {n.description && (
                  <p className="text-sm text-ink-muted mt-2 line-clamp-2">{n.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {n.filePath && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadWithAuth(n._id, n.fileName).catch((e) => setErr(e.message))
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-accent"
                  >
                    Download
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => exportPdf(n)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-accent"
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => remove(n._id).catch((e) => setErr(e.message))}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
