import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionEyebrow, PrimaryBtn, SecondaryBtn } from "@/components/site-chrome";
import { FileText, MessageSquare, ShieldCheck, TrendingUp, ArrowUpRight, Activity, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Viktor RAG" },
      { name: "description", content: "Monitor document ingestion, query volume, and verification accuracy across your knowledge base." },
      { property: "og:title", content: "Dashboard — Viktor RAG" },
      { property: "og:description", content: "Your knowledge base at a glance — documents, queries, and verification accuracy." },
    ],
  }),
  component: DashboardPage,
});

const stats = [
  { label: "Documents", value: "2,418", delta: "+128 this week", Icon: FileText },
  { label: "Queries today", value: "9,304", delta: "+12.4%", Icon: MessageSquare },
  { label: "Verified rate", value: "97.2%", delta: "+0.6 pts", Icon: ShieldCheck },
  { label: "Avg confidence", value: "0.91", delta: "stable", Icon: TrendingUp },
];

const activity = [
  { time: "2 min ago", doc: "Q4-earnings.pdf", action: "Indexed · 142 chunks", status: "ok" },
  { time: "14 min ago", doc: "contracts/", action: "Re-embedded · 38 files", status: "ok" },
  { time: "1 hr ago", doc: "research-notes.docx", action: "Verification failed · 1 claim", status: "warn" },
  { time: "3 hr ago", doc: "diagrams.zip", action: "OCR complete · 24 images", status: "ok" },
  { time: "Yesterday", doc: "compliance-2026.pdf", action: "Indexed · 894 chunks", status: "ok" },
];

function DashboardPage() {
  return (
    <PageShell>
      <section className="px-6 max-w-[1200px] mx-auto pb-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionEyebrow>Dashboard</SectionEyebrow>
            <h1 className="mt-3 text-[40px] md:text-[56px] leading-[1] tracking-tight">
              Your <span className="font-mondwest text-[#1f5d4f]">knowledge base</span><br />at a glance.
            </h1>
          </div>
          <div className="flex gap-3">
            <Link to="/upload"><PrimaryBtn>Upload</PrimaryBtn></Link>
            <Link to="/chat"><SecondaryBtn>Ask a question</SecondaryBtn></Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-3xl p-6 border border-[#051A24]/5">
              <div className="flex justify-between items-start">
                <p className="text-xs text-[#273C46] uppercase tracking-wide">{s.label}</p>
                <s.Icon className="w-4 h-4 text-[#1f5d4f]" />
              </div>
              <p className="mt-4 font-mondwest text-[44px] leading-none text-[#051A24]">{s.value}</p>
              <p className="mt-3 text-xs text-[#273C46]">{s.delta}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#051A24]/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#273C46] uppercase tracking-wide">Query volume</p>
                <p className="mt-1 text-sm text-[#051A24]">Last 14 days</p>
              </div>
              <Activity className="w-5 h-5 text-[#1f5d4f]" />
            </div>
            <div className="mt-8 h-48 flex items-end gap-2">
              {[32, 45, 38, 62, 48, 71, 58, 65, 80, 55, 73, 88, 76, 92].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#1f5d4f] to-[#5cc9b1]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="bg-[#051A24] rounded-3xl p-8 text-white">
            <p className="text-xs uppercase tracking-wide text-[#E0EBF0]">Health</p>
            <p className="mt-6 font-mondwest text-5xl">All systems</p>
            <p className="mt-1 text-sm text-[#E0EBF0]">Indexing pipeline · operational</p>
            <div className="mt-8 space-y-3 text-sm">
              {[["Embeddings", "OK"], ["Retrieval", "OK"], ["Verification", "OK"], ["Vector store", "OK"]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[#E0EBF0]">{k}</span><span className="text-[#5cc9b1]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-3xl p-8 border border-[#051A24]/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Recent activity</h2>
            <a href="#" className="text-sm text-[#1f5d4f] inline-flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></a>
          </div>
          <ul className="divide-y divide-[#051A24]/5">
            {activity.map((a, i) => (
              <li key={i} className="py-4 flex items-center gap-4">
                <Clock className="w-4 h-4 text-[#273C46] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.doc}</p>
                  <p className="text-xs text-[#273C46]">{a.action}</p>
                </div>
                <span className={`text-xs font-mono ${a.status === "warn" ? "text-amber-600" : "text-[#1f5d4f]"}`}>{a.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
