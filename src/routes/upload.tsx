import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell, SectionEyebrow } from "@/components/site-chrome";
import { Upload as UploadIcon, FileText, Image as ImageIcon, Code, Table, Check, Loader2, Trash2, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload — Viktor RAG" },
      { name: "description", content: "Upload documents to your knowledge base." },
    ],
  }),
  component: UploadPage,
});

type Item = { id: string; name: string; size: string; type: string; status: "queued" | "uploading" | "done" | "error" };

const formats = [
  { Icon: FileText, label: "PDF · DOCX · TXT · MD" },
  { Icon: ImageIcon, label: "PNG · JPG · SVG" },
  { Icon: Code, label: "ZIP repos · .py · .ts" },
  { Icon: Table, label: "CSV · XLSX" },
];

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    const { documents } = await api.getDocuments(user.id);
    setItems(documents.map((d: any) => ({
      id: d.id, name: d.name, size: d.size, type: d.type, status: d.status,
    })));
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const tempId = "tmp-" + Date.now();
      setItems((p) => [{ id: tempId, name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, type: file.name.split(".").pop()?.toUpperCase() || "FILE", status: "uploading" }, ...p]);
      try {
        const { document } = await api.upload(user.id, file);
        setItems((p) => p.map((it) => it.id === tempId ? { ...it, id: document.id, status: "done" } : it));
        toast.success(`${file.name} uploaded & indexed`);
      } catch (e: any) {
        setItems((p) => p.map((it) => it.id === tempId ? { ...it, status: "error" } : it));
        toast.error(e.message || `Failed: ${file.name}`);
      }
    }
    setUploading(false);
  };

  const handleDelete = async (it: Item) => {
    if (!user) return;
    setDeletingId(it.id);
    try {
      await api.deleteDocument(user.id, it.id);
      setItems((p) => p.filter((x) => x.id !== it.id));
      toast.success(`${it.name} deleted`);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete document");
    }
    setDeletingId(null);
  };

  const handleChat = (it: Item) => {
    localStorage.setItem("scope_doc_id", it.id);
    navigate({ to: "/chat" });
  };

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <PageShell>
      <section className="px-6 max-w-[1200px] mx-auto pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <SectionEyebrow>Upload</SectionEyebrow>
            <h1 className="mt-3 text-[40px] md:text-[60px] leading-[1] tracking-tight">
              Drop it in. <span className="font-mondwest text-[#1f5d4f]">We'll read</span> the rest.
            </h1>
            <p className="mt-6 text-[#273C46] max-w-xl">
              Documents are parsed, chunked, embedded locally with sentence-transformers, and indexed for semantic retrieval.
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`mt-10 cursor-pointer rounded-[28px] border-2 border-dashed p-12 text-center transition-all ${drag ? "border-[#1f5d4f] bg-[#1f5d4f]/5" : "border-[#051A24]/15 bg-white hover:border-[#1f5d4f]/40"} ${uploading ? "pointer-events-none opacity-60" : ""}`}
            >
              {uploading ? <Loader2 className="w-10 h-10 text-[#1f5d4f] mx-auto animate-spin" /> : <UploadIcon className="w-10 h-10 text-[#1f5d4f] mx-auto" />}
              <p className="mt-4 text-lg font-medium">{uploading ? "Uploading & indexing..." : "Drop files or click to browse"}</p>
              <p className="mt-2 text-sm text-[#273C46]">PDF, DOCX, TXT, MD supported</p>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} accept=".pdf,.docx,.txt,.md,.csv" disabled={uploading} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {formats.map((f) => (
                <div key={f.label} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#051A24]/5">
                  <f.Icon className="w-4 h-4 text-[#1f5d4f]" />
                  <span className="text-xs text-[#273C46]">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#051A24]/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-wide text-[#273C46] font-semibold">Documents</p>
                {doneCount > 0 && (
                  <span className="text-xs text-[#1f5d4f] bg-[#1f5d4f]/10 px-2 py-0.5 rounded-full">{doneCount} indexed</span>
                )}
              </div>
              <ul className="space-y-3">
                {items.length === 0 && <p className="text-xs text-[#273C46]/60">No documents yet</p>}
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#f0f0ee]/60 transition">
                    <div className="w-10 h-10 rounded-xl bg-[#f0f0ee] flex items-center justify-center text-[10px] font-mono text-[#1f5d4f] shrink-0">{it.type}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{it.name}</p>
                      <p className="text-xs text-[#273C46]">{it.size}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {it.status === "done" && (
                        <>
                          <button
                            onClick={() => handleChat(it)}
                            title="Chat with this document"
                            className="p-1.5 rounded-lg text-[#1f5d4f] hover:bg-[#1f5d4f]/10 transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(it)}
                            disabled={deletingId === it.id}
                            title="Delete document"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition disabled:opacity-40"
                          >
                            {deletingId === it.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                          <Check className="w-4 h-4 text-[#1f5d4f]" />
                        </>
                      )}
                      {it.status === "uploading" && <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />}
                      {it.status === "error" && (
                        <>
                          <button
                            onClick={() => handleDelete(it)}
                            title="Remove failed document"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono text-red-500">ERROR</span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
