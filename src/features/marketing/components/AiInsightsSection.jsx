import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Users,
  ChefHat,
  Bell,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Terminal,
} from "lucide-react";

/**
 * AiInsightsSection — a "wow moment" section for the landing page.
 *
 * It's a live-feeling AI copilot mock:
 *   - Left column: a terminal that streams AI insights, one line at a time.
 *   - Right column: capability cards + a signal chart with pulsing dots.
 *
 * Nothing here fetches — the streaming is a scripted timeline. Pure eye-candy
 * that showcases what the real AI copilot will do once wired up.
 */

const INSIGHTS = [
  {
    id: 1,
    accent: "text-emerald-300",
    ring: "border-emerald-500/40 bg-emerald-500/10",
    icon: TrendingUp,
    tag: "Demand forecast",
    text: "Margherita orders spike **34%** every Friday 7–9pm. Pre-prep 40 dough balls at 6:30pm to keep ticket time under 8 minutes.",
    kpi: { label: "Projected uplift", value: "+₹18k / week", tone: "up" },
  },
  {
    id: 2,
    accent: "text-fuchsia-300",
    ring: "border-fuchsia-500/40 bg-fuchsia-500/10",
    icon: Users,
    tag: "Customer segment",
    text: "**42 regulars** haven't ordered in 30+ days — average ticket ₹640. A WhatsApp win-back with 15% off recovers **~₹9,600** on average.",
    kpi: { label: "Expected wins", value: "9 orders", tone: "up" },
  },
  {
    id: 3,
    accent: "text-amber-300",
    ring: "border-amber-500/40 bg-amber-500/10",
    icon: ChefHat,
    tag: "Menu optimizer",
    text: "**Cold Brew** margin is 78% but sold to only 12% of visitors. Bundle with pizza for +₹49 — customers save ₹30, you make ₹19 more per order.",
    kpi: { label: "Attach lift", value: "+22%", tone: "up" },
  },
  {
    id: 4,
    accent: "text-red-300",
    ring: "border-red-500/40 bg-red-500/10",
    icon: Bell,
    tag: "Anomaly alert",
    text: "Booking cancellations up **2.4×** on Wednesdays after 5pm at Bandra branch — likely a staff conflict window. Suggested: block that slot or add a 2nd stylist.",
    kpi: { label: "Preventable loss", value: "-₹4.8k", tone: "down" },
  },
];

const CAPABILITY_CARDS = [
  { icon: TrendingUp, title: "Predict tomorrow's rush",     body: "Hourly footfall forecasts so you prep, not panic." },
  { icon: Users,      title: "Know every regular",          body: "Auto-segmented cohorts + auto-drafted win-back messages." },
  { icon: ChefHat,    title: "Menu that sells itself",      body: "Bundles, price nudges, and slow-mover callouts, weekly." },
  { icon: Bell,       title: "Alerts before they hurt",     body: "Anomalies flagged in real time — before your reviews do." },
];

export default function AiInsightsSection() {
  const [visible, setVisible] = useState([0]);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(0);
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: false, amount: 0.3 });

  // Stream in insights one by one when the section is in view
  useEffect(() => {
    if (!inView || paused) return;
    if (visible.length >= INSIGHTS.length) {
      // once full, cycle the focused one every 3s
      const t = setInterval(() => setFocused((f) => (f + 1) % INSIGHTS.length), 3200);
      return () => clearInterval(t);
    }
    const t = setTimeout(() => {
      setVisible((v) => [...v, v.length]);
      setFocused(visible.length);
    }, 1400);
    return () => clearTimeout(t);
  }, [inView, paused, visible.length]);

  const active = INSIGHTS[focused];

  return (
    <section
      id="ai-insights"
      ref={containerRef}
      className="relative border-t border-line py-24 sm:py-32 overflow-hidden"
      data-testid="ai-insights-section"
    >
      {/* Backdrop glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-brand/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-widest text-brand border border-brand/30 bg-brand-soft">
            <Sparkles className="h-3 w-3" /> AI Copilot · Beta
          </span>
          <h2
            className="mt-5 text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-tighter"
            data-testid="ai-insights-title"
          >
            Your data{" "}
            <span className="bg-gradient-to-r from-brand via-fuchsia-400 to-emerald-300 bg-clip-text text-transparent">
              whispers.
            </span>
            <br />
            AI answers.
          </h2>
          <p className="mt-5 text-ink-secondary text-lg leading-relaxed">
            Every order, every booking, every peek at your store — we turn it into a plain-English playbook.
            No dashboards to decode. Just what to do next.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-5 gap-6 items-start">
          {/* LEFT — Live insights terminal */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-line bg-bg-surface/80 backdrop-blur grain overflow-hidden shadow-2xl">
              {/* Chrome */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-bg-elevated/50">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="text-[11px] font-mono text-ink-muted flex items-center gap-1.5">
                  <Terminal className="h-3 w-3" /> vyapar360-ai · live insights
                </div>
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="text-[11px] text-ink-muted hover:text-ink-primary inline-flex items-center gap-1.5"
                  data-testid="ai-insights-pause"
                  aria-label={paused ? "Play" : "Pause"}
                >
                  {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  {paused ? "Play" : "Pause"}
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-3 min-h-[420px]">
                {INSIGHTS.map((ins, i) => (
                  visible.includes(i) ? (
                    <InsightRow
                      key={ins.id}
                      insight={ins}
                      focused={focused === i}
                      onClick={() => setFocused(i)}
                      testid={`ai-insight-row-${i}`}
                    />
                  ) : null
                ))}
                {visible.length < INSIGHTS.length && (
                  <div className="flex items-center gap-2 text-[11px] text-ink-muted font-mono pt-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Analyzing latest {visible.length + 1} of {INSIGHTS.length} signals…
                  </div>
                )}
              </div>

              {/* Footer strip */}
              <div className="px-5 py-3 border-t border-line bg-bg-elevated/50 flex items-center justify-between text-[11px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-brand" /> Refreshed every 15 minutes
                </span>
                <span className="font-mono">latency 320ms</span>
              </div>
            </div>
          </div>

          {/* RIGHT — active card + capabilities */}
          <div className="lg:col-span-2 space-y-4">
            <ActiveInsightCard insight={active} />
            <div className="grid grid-cols-2 gap-3">
              {CAPABILITY_CARDS.map((c, i) => (
                <CapabilityCard key={c.title} {...c} index={i} testid={`ai-capability-${i}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- sub-components ------------------------- */

function InsightRow({ insight, focused, onClick, testid }) {
  const Icon = insight.icon;
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full text-left rounded-xl border p-4 flex gap-3 transition-all ${
        focused
          ? "border-brand/50 bg-brand-soft/40 shadow-glow"
          : "border-line bg-bg-elevated/40 hover:border-white/10"
      }`}
      data-testid={testid}
    >
      <span className={`h-9 w-9 rounded-lg border grid place-items-center flex-shrink-0 ${insight.ring}`}>
        <Icon className={`h-4 w-4 ${insight.accent}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`text-[10px] uppercase tracking-widest font-medium ${insight.accent}`}>
          {insight.tag}
        </div>
        <div className="mt-1 text-sm text-ink-primary leading-relaxed">
          <StyledText text={insight.text} />
        </div>
      </div>
      {focused && (
        <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-brand self-start pt-1">
          <span className="h-1 w-1 rounded-full bg-brand animate-pulse" />
          LIVE
        </span>
      )}
    </motion.button>
  );
}

function ActiveInsightCard({ insight }) {
  const Icon = insight.icon;
  const isUp = insight.kpi?.tone === "up";
  const KpiArrow = isUp ? ArrowUpRight : ArrowDownRight;
  const kpiColor = isUp ? "text-emerald-300" : "text-red-300";
  return (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl border border-line bg-bg-surface/80 backdrop-blur grain p-5 relative overflow-hidden"
      data-testid="ai-insights-active-card"
    >
      <div className={`absolute -top-14 -right-14 h-40 w-40 rounded-full blur-2xl opacity-40 ${insight.ring.split(" ")[1]}`} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl border grid place-items-center ${insight.ring}`}>
            <Icon className={`h-5 w-5 ${insight.accent}`} />
          </div>
          <div>
            <div className={`text-[11px] uppercase tracking-widest font-medium ${insight.accent}`}>
              {insight.tag}
            </div>
            <div className="mt-0.5 text-sm text-ink-secondary">AI recommendation</div>
          </div>
        </div>

        <p className="mt-5 text-base leading-relaxed">
          <StyledText text={insight.text} />
        </p>

        {insight.kpi && (
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 rounded-xl border border-line bg-bg-elevated/60 px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                {insight.kpi.label}
              </div>
              <div className={`mt-1 font-display text-2xl font-semibold tracking-tight inline-flex items-center gap-1 ${kpiColor}`}>
                <KpiArrow className="h-4 w-4" strokeWidth={2.5} />
                {insight.kpi.value}
              </div>
            </div>
            <button className="btn-primary inline-flex items-center gap-1.5 text-sm" data-testid="ai-insights-act">
              Act on it <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CapabilityCard({ icon: Icon, title, body, index, testid }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      className="rounded-xl border border-line bg-bg-elevated/40 backdrop-blur p-4 hover:border-brand/30 transition-colors"
      data-testid={testid}
    >
      <span className="h-8 w-8 rounded-lg border border-brand/30 bg-brand-soft grid place-items-center">
        <Icon className="h-4 w-4 text-brand" />
      </span>
      <div className="mt-3 text-sm font-medium tracking-tight">{title}</div>
      <div className="mt-1 text-[11px] text-ink-muted leading-relaxed">{body}</div>
    </motion.div>
  );
}

/** Renders **bold** segments as <strong> to keep the copy readable. */
function StyledText({ text }) {
  const parts = useMemo(() => {
    const out = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ b: false, t: text.slice(last, m.index) });
      out.push({ b: true, t: m[1] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ b: false, t: text.slice(last) });
    return out;
  }, [text]);
  return parts.map((p, i) => (p.b ? <strong key={i} className="font-semibold text-ink-primary">{p.t}</strong> : <React.Fragment key={i}>{p.t}</React.Fragment>));
}
