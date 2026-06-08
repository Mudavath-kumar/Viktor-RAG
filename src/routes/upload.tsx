import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { PageShell, SectionEyebrow, PrimaryBtn } from "@/components/site-chrome";
import { Upload as UploadIcon, FileText, Image as ImageIcon, Code, Table, Check, X } from "lucide-react";
import uploadImg from "@/assets/upload-flatlay.jpg";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload — Viktor RAG" },
      { name: "description", content: "Upload PDFs, images, code repositories, and spreadsheets. Viktor extracts, chunks, and embeds with full citation tracking." },
      { property: "og:title", content: "Upload — Viktor RAG" },
      { property: "og:description", content: "Drop in documents. Get cited answers." },
    ],
  }),
  component: UploadPage,
});

type Item = { name: string; size: string; type: string; status: "queued" | "embedding" | "done" };

const formats = [
  { Icon: FileText, label: "PDF · DOCX · TXT · MD" },
  { Icon: ImageIcon, label: "PNG · JPG · SVG · scans (OCR)" },
  { Icon: Code, label: "ZIP repos · .py · .ts · .go" },
  { Icon: Table, label: "CSV · XLSX · Parquet" },
];

function UploadPage() {
  const [items, setItems] = useState<Item[]>([
    { name: "annual-report-2025.pdf", size: "4.2 MB", type: "PDF", status: "done" },
    { name: "architecture-diagrams.zip", size: "12.8 MB", type: "ZIP", status: "embedding" },
    { name: "customer-survey.xlsx", size: "880 KB", type: "XLSX", status: "queued" },
  ]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next: Item[] = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      type: f.name.split(".").pop()?.toUpperCase() || "FILE",
      status: "queued",
    }));
    setItems((p) => [...next, ...p]);
  };

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
              Every file is extracted with layout awareness, chunked semantically, embedded into Qdrant, and indexed for hybrid retrieval. Citations are pinned to source coordinates from the first byte.
            </p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
              onClick={() => inputRef.current?.click()}
              className={`mt-10 cursor-pointer rounded-[28px] border-2 border-dashed p-12 text-center transition-all ${drag ? "border-[#1f5d4f] bg-[#1f5d4f]/5" : "border-[#051A24]/15 bg-white hover:border-[#1f5d4f]/40"}`}
            >
              <UploadIcon className="w-10 h-10 text-[#1f5d4f] mx-auto" />
              <p className="mt-4 text-lg font-medium">Drop files or click to browse</p>
              <p className="mt-2 text-sm text-[#273C46]">Up to 200 MB per file · batch unlimited</p>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
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

          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
            <img src={uploadImg} alt="Stacked documents and notebooks on a linen surface" loading="lazy" className="w-full rounded-[28px] shadow-lg aspect-[5/6] object-cover" />
            <div className="bg-white rounded-3xl p-6 border border-[#051A24]/5">
              <p className="text-xs uppercase tracking-wide text-[#273C46]">Queue</p>
              <ul className="mt-4 space-y-3">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f0f0ee] flex items-center justify-center text-[10px] font-mono text-[#1f5d4f]">{it.type}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{it.name}</p>
                      <p className="text-xs text-[#273C46]">{it.size}</p>
                    </div>
                    {it.status === "done" && <Check className="w-4 h-4 text-[#1f5d4f]" />}
                    {it.status === "embedding" && <span className="text-[10px] font-mono text-amber-600">EMBEDDING</span>}
                    {it.status === "queued" && <span className="text-[10px] font-mono text-[#273C46]">QUEUED</span>}
                    <button onClick={() => setItems((p) => p.filter((_, j) => j !== i))} className="text-[#273C46] hover:text-[#051A24]" aria-label="Remove"><X className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                <Link to="/chat" className="flex-1"><PrimaryBtn className="!w-full">Start chatting</PrimaryBtn></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
