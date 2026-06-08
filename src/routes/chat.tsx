import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell, SectionEyebrow, PrimaryBtn } from "@/components/site-chrome";
import { Send, ShieldCheck, Quote, Sparkles, FileText } from "lucide-react";
import chatImg from "@/assets/chat-cards.jpg";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Viktor RAG" },
      { name: "description", content: "Ask questions across your documents. Every answer is verified, scored, and pinned to the exact source." },
      { property: "og:title", content: "Chat — Viktor RAG" },
      { property: "og:description", content: "Cited, verified answers from your own knowledge base." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; text: string; confidence?: number; citations?: { doc: string; page: string }[] };

const seed: Msg[] = [
  { role: "user", text: "What's the renewal clause in the 2025 Acme contract?" },
  {
    role: "assistant",
    text: "The contract auto-renews for successive 12-month terms unless either party gives written notice at least 60 days before expiry. Pricing is locked unless the indexed inflation rate exceeds 4%.",
    confidence: 0.96,
    citations: [
      { doc: "acme-msa-2025.pdf", page: "p. 14, §7.2" },
      { doc: "acme-msa-2025.pdf", page: "p. 15, §7.4" },
    ],
  },
];

const suggestions = [
  "Summarize the Q4 earnings narrative",
  "Find contradictions across the policy docs",
  "What dependencies does the auth service use?",
  "Compare pricing tiers in the latest proposals",
];

function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((p) => [...p, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => {
      setMsgs((p) => [...p, {
        role: "assistant",
        text: "Based on the indexed sources, here's a verified answer with citations pinned to exact pages. Confidence reflects retrieval similarity and verification agreement.",
        confidence: 0.88 + Math.random() * 0.1,
        citations: [{ doc: "indexed-source.pdf", page: `p. ${Math.floor(Math.random() * 40) + 1}` }],
      }]);
    }, 700);
  };

  return (
    <PageShell>
      <section className="px-6 max-w-[1200px] mx-auto pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
            <SectionEyebrow>Chat</SectionEyebrow>
            <h1 className="text-[36px] md:text-[48px] leading-[1] tracking-tight">
              Ask your <span className="font-mondwest text-[#1f5d4f]">archive</span>.<br />Trust the answer.
            </h1>
            <img src={chatImg} alt="Layered translucent index cards with handwritten notes" loading="lazy" className="w-full rounded-3xl shadow-lg aspect-[4/3] object-cover" />
            <div className="bg-white rounded-3xl p-6 border border-[#051A24]/5">
              <p className="text-xs uppercase tracking-wide text-[#273C46] mb-3">Try asking</p>
              <ul className="space-y-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button onClick={() => ask(s)} className="text-left text-sm text-[#051A24] hover:text-[#1f5d4f] transition-colors w-full">{s}</button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[28px] border border-[#051A24]/5 flex flex-col h-[70vh] min-h-[560px]">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-3xl px-5 py-4 ${m.role === "user" ? "bg-[#051A24] text-white" : "bg-[#f0f0ee] text-[#051A24]"}`}>
                      <p className="text-[15px] leading-relaxed">{m.text}</p>
                      {m.role === "assistant" && m.confidence !== undefined && (
                        <div className="mt-4 pt-4 border-t border-[#051A24]/10">
                          <div className="flex items-center gap-3 text-xs font-mono text-[#1f5d4f]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            VERIFIED · {m.confidence.toFixed(2)}
                            <div className="flex-1 h-1 rounded-full bg-[#051A24]/10 overflow-hidden">
                              <div className="h-full bg-[#1f5d4f]" style={{ width: `${m.confidence * 100}%` }} />
                            </div>
                          </div>
                          <ul className="mt-3 space-y-1">
                            {m.citations?.map((c, j) => (
                              <li key={j} className="flex items-center gap-2 text-xs text-[#273C46]">
                                <Quote className="w-3 h-3" />
                                <span className="font-medium text-[#051A24]">{c.doc}</span>
                                <span>·</span>
                                <span>{c.page}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); ask(input); }}
                className="border-t border-[#051A24]/10 p-4 flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4 text-[#1f5d4f]" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything across your indexed documents…"
                  className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[#273C46]/60"
                />
                <button type="submit" className="bg-[#051A24] text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#0D212C] transition-all" aria-label="Send">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#273C46]">
              <FileText className="w-3 h-3" /> Answers grounded in 2,418 indexed sources.
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
