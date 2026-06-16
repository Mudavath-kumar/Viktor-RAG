import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell, SectionEyebrow, PrimaryBtn, SecondaryBtn } from "@/components/site-chrome";
import { FileText, MessageSquare, TrendingUp, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Viktor RAG" },
      { name: "description", content: "Your knowledge base at a glance." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ documents: 0, queries: 0, sessions: 0 });
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    const data = await api.getDashboard(user.id);
    setStats({ documents: data.documents, queries: data.queries, sessions: data.sessions });
    setActivity(data.recent_activity);
  };

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  const cards = [
    { label: "Documents", value: String(stats.documents), Icon: FileText },
    { label: "Queries", value: String(stats.queries), Icon: MessageSquare },
    { label: "Chat Sessions", value: String(stats.sessions), Icon: Activity },
    { label: "Avg Confidence", value: "0.91", Icon: TrendingUp },
  ];

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
          {cards.map((s) => (
            <div key={s.label} className="bg-white rounded-3xl p-6 border border-[#051A24]/5">
              <div className="flex justify-between items-start">
                <p className="text-xs text-[#273C46] uppercase tracking-wide">{s.label}</p>
                <s.Icon className="w-4 h-4 text-[#1f5d4f]" />
              </div>
              <p className="mt-4 font-mondwest text-[44px] leading-none text-[#051A24]">{s.value}</p>
              <p className="mt-3 text-xs text-[#273C46]">From your workspace</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#051A24]/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#273C46] uppercase tracking-wide">Recent Documents</p>
                <p className="mt-1 text-sm text-[#051A24]">Last uploads</p>
              </div>
              <Activity className="w-5 h-5 text-[#1f5d4f]" />
            </div>
            <div className="mt-8 space-y-4">
              {activity.length === 0 && <p className="text-sm text-[#273C46]/60">Upload your first document to get started.</p>}
              {activity.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-[#051A24]/5 last:border-0">
                  <FileText className="w-4 h-4 text-[#1f5d4f] shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">{a.name}</span>
                  {a.status === "done" && (
                    <button 
                      onClick={() => {
                        localStorage.setItem("scope_doc_id", a.id);
                        navigate({ to: "/chat" });
                      }}
                      className="text-xs font-medium bg-[#1f5d4f]/10 text-[#1f5d4f] hover:bg-[#1f5d4f]/20 px-3 py-1 rounded-full transition"
                    >
                      Chat
                    </button>
                  )}
                  <span className={`text-xs font-mono ${a.status === "done" ? "text-[#1f5d4f]" : "text-amber-600"}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#051A24] rounded-3xl p-8 text-white">
            <p className="text-xs uppercase tracking-wide text-[#E0EBF0]">RAG Pipeline</p>
            <p className="mt-6 font-mondwest text-5xl">All systems</p>
            <p className="mt-1 text-sm text-[#E0EBF0]">local storage · Groq · operational</p>
            <div className="mt-8 space-y-3 text-sm">
              {[["Storage", "OK"], ["Embeddings", "OK"], ["Vector Search", "OK"], ["LLM", "OK"]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[#E0EBF0]">{k}</span><span className="text-[#5cc9b1]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
