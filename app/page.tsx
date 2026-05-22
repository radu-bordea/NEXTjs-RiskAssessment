import Link from "next/link";

/**
 * Home — Public landing page
 *
 * Visible to all users including unauthenticated visitors.
 * Shows app description, features, roles and CTA to sign in.
 * No data fetching — fully static.
 */

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#EEF4FA] dark:bg-slate-950">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-[#C5D9ED] dark:border-slate-800">
        <div className="flex flex-col gap-6 justify-center px-10 py-20">

          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-[#1B6CA8] dark:text-[#5BA3D9] text-xs font-medium tracking-widest uppercase">
            <span className="w-5 h-px bg-[#1B6CA8] dark:bg-[#5BA3D9]" />
            Maritime risk management
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-800 dark:text-white">
            Every voyage.<br />
            Every risk.<br />
            <span className="text-[#1B6CA8] dark:text-[#5BA3D9] font-light italic">Fully assessed.</span>
          </h1>

          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
            MarineGuard gives shipping companies a centralised platform to identify,
            track, and mitigate operational risks across their entire fleet — from
            vessel to voyage.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1B6CA8] hover:bg-[#155a8a] text-white rounded-lg text-sm transition-colors shadow-sm shadow-[#1B6CA8]/20"
            >
              🔒 Access Fleet Risk Assessment Portal
            </Link>
            <button className="px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 border border-[#B8D0E8] dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
              Learn more
            </button>
          </div>
        </div>

        {/* Mock risk card */}
        <div className="hidden md:flex items-center justify-center bg-white dark:bg-slate-900 border-l border-[#C5D9ED] dark:border-slate-800 p-10">
          <div className="w-full max-w-xs rounded-xl border border-[#C5D9ED] dark:border-slate-700 bg-[#F5F9FD] dark:bg-slate-950 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#C5D9ED] dark:border-slate-800 bg-[#1B6CA8] dark:bg-[#0f3d5e]">
              <span className="text-sm font-bold text-white">Risk register</span>
              <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 font-medium">2 critical</span>
            </div>
            {[
              { ship: "MV Atlantic Star", detail: "Engine · Route A12",    level: "High",   cls: "bg-orange-50 text-orange-700" },
              { ship: "MV Nordvik",       detail: "Weather · North Sea",    level: "Medium", cls: "bg-amber-50 text-amber-700"  },
              { ship: "MV Cargowave",     detail: "Cargo securing · Oslo",  level: "Low",    cls: "bg-green-50 text-green-700"  },
            ].map((r) => (
              <div key={r.ship} className="flex items-center justify-between px-4 py-3 border-b border-[#E2EDF5] dark:border-slate-800 last:border-none bg-white dark:bg-slate-900">
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{r.ship}</p>
                  <p className="text-xs text-slate-400">{r.detail}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.cls}`}>{r.level}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-3 border-b border-[#C5D9ED] dark:border-slate-800 bg-white dark:bg-slate-900">
        {[
          { num: "360°", label: "Fleet risk visibility"  },
          { num: "3",    label: "Role-based access levels" },
          { num: "∞",    label: "Ships & voyages tracked"  },
        ].map((s, i) => (
          <div key={i} className="px-10 py-8 border-r border-[#C5D9ED] dark:border-slate-800 last:border-none">
            <p className="text-3xl font-extrabold text-[#1B6CA8] dark:text-[#5BA3D9]">{s.num}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-[#C5D9ED] dark:border-slate-800">
        {[
          { icon: "🚢", title: "Fleet management",  desc: "Track risks across every vessel with a unified register and real-time status updates." },
          { icon: "🔍", title: "Advanced filtering", desc: "Filter by date, severity, ship, route and more. Find exactly what you need instantly." },
          { icon: "🛡️", title: "Role-based access", desc: "Admins create, managers edit, members view. Every user sees exactly what they need." },
        ].map((f) => (
          <div key={f.title} className="px-10 py-8 border-r border-[#C5D9ED] dark:border-slate-800 last:border-none bg-white dark:bg-slate-900">
            {/* Feature icon badge */}
            <div className="w-9 h-9 rounded-lg bg-[#EEF4FA] dark:bg-slate-800 border border-[#C5D9ED] dark:border-slate-700 flex items-center justify-center text-lg mb-4">
              {f.icon}
            </div>
            <p className="text-sm font-bold mb-1 text-slate-800 dark:text-white">{f.title}</p>
            <p className="text-xs leading-relaxed text-slate-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── Roles ─────────────────────────────────────────────────────────── */}
      <section className="flex items-center justify-between flex-wrap gap-4 px-10 py-5 bg-[#F5F9FD] dark:bg-slate-900 border-b border-[#C5D9ED] dark:border-slate-800">
        <span className="text-xs text-slate-400 font-medium">Who uses MarineGuard?</span>
        <div className="flex gap-2 flex-wrap">
          {[
            { color: "#D85A30", label: "Admin — create, edit & manage" },
            { color: "#BA7517", label: "Manager — edit & review"       },
            { color: "#1B6CA8", label: "Member — view & monitor"       },
          ].map((r) => (
            <span
              key={r.label}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#C5D9ED] dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="flex items-center justify-between flex-wrap gap-4 px-10 py-10 bg-white dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Ready to manage your fleet's risk?
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to access your dashboard or contact your administrator for access.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="px-5 py-2.5 bg-[#1B6CA8] hover:bg-[#155a8a] text-white rounded-lg text-sm transition-colors shadow-sm shadow-[#1B6CA8]/20"
        >
          Sign in now →
        </Link>
      </section>

    </div>
  );
}