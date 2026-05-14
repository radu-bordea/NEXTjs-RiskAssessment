import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-zinc-950">


      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col gap-6 justify-center px-10 py-20">
          <div className="flex items-center gap-2 text-[#0F6E56] text-xs font-medium tracking-widest uppercase">
            <span className="w-5 h-px bg-[#1D9E75]" />
            Maritime risk management
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Every voyage.<br />
            Every risk.<br />
            <span className="text-[#1D9E75] font-light italic">Fully assessed.</span>
          </h1>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-sm">
            MarineGuard gives shipping companies a centralised platform to identify,
            track, and mitigate operational risks across their entire fleet — from
            vessel to voyage.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0F6E56] text-[#E1F5EE] rounded-lg text-sm hover:bg-[#085041] transition-colors"
            >
              🔒 Access dashboard
            </Link>
            <button className="px-4 py-2.5 text-sm text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Learn more
            </button>
          </div>
        </div>

        {/* Mock risk card */}
        <div className="hidden md:flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-100 dark:border-zinc-800 p-10">
          <div className="w-full max-w-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-bold">Risk register</span>
              <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 font-medium">2 critical</span>
            </div>
            {[
              { ship: "MV Atlantic Star", detail: "Engine · Route A12", level: "High", cls: "bg-orange-50 text-orange-700" },
              { ship: "MV Nordvik",       detail: "Weather · North Sea",  level: "Medium", cls: "bg-amber-50 text-amber-700" },
              { ship: "MV Cargowave",     detail: "Cargo securing · Oslo", level: "Low", cls: "bg-green-50 text-green-700" },
            ].map((r) => (
              <div key={r.ship} className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-none">
                <div>
                  <p className="text-xs font-medium">{r.ship}</p>
                  <p className="text-xs text-zinc-400">{r.detail}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.cls}`}>{r.level}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 border-b border-zinc-100 dark:border-zinc-800">
        {[
          { num: "360°", label: "Fleet risk visibility" },
          { num: "3",    label: "Role-based access levels" },
          { num: "∞",    label: "Ships & voyages tracked" },
        ].map((s, i) => (
          <div key={i} className="px-10 py-8 border-r border-zinc-100 dark:border-zinc-800 last:border-none">
            <p className="text-3xl font-extrabold">{s.num}</p>
            <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-100 dark:border-zinc-800">
        {[
          { icon: "🚢", title: "Fleet management",   desc: "Track risks across every vessel with a unified register and real-time status updates." },
          { icon: "🔍", title: "Advanced filtering",  desc: "Filter by date, severity, ship, route and more. Find exactly what you need instantly." },
          { icon: "🛡️", title: "Role-based access",  desc: "Admins create, managers edit, members view. Every user sees exactly what they need." },
        ].map((f) => (
          <div key={f.title} className="px-10 py-8 border-r border-zinc-100 dark:border-zinc-800 last:border-none">
            <div className="w-9 h-9 rounded-lg bg-[#E1F5EE] flex items-center justify-center text-lg mb-4">{f.icon}</div>
            <p className="text-sm font-bold mb-1">{f.title}</p>
            <p className="text-xs leading-relaxed text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Roles */}
      <section className="flex items-center justify-between flex-wrap gap-4 px-10 py-5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
        <span className="text-xs text-zinc-400 font-medium">Who uses MarineGuard?</span>
        <div className="flex gap-2 flex-wrap">
          {[
            { color: "#D85A30", label: "Admin — create, edit & manage" },
            { color: "#BA7517", label: "Manager — edit & review" },
            { color: "#1D9E75", label: "Member — view & monitor" },
          ].map((r) => (
            <span key={r.label} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="flex items-center justify-between flex-wrap gap-4 px-10 py-10">
        <div>
          <h2 className="text-lg font-bold">Ready to manage your fleet's risk?</h2>
          <p className="text-sm text-zinc-400 mt-1">Sign in to access your dashboard or contact your administrator for access.</p>
        </div>
        <Link
          href="/sign-in"
          className="px-5 py-2.5 bg-[#0F6E56] text-[#E1F5EE] rounded-lg text-sm hover:bg-[#085041] transition-colors"
        >
          Sign in now →
        </Link>
      </section>

    </div>
  );
}