import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-white">
      <div className="mx-auto max-w-2xl px-6">

        {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-[11px] font-medium" style={{ color: '#C0C0C0', letterSpacing: '0.12em' }}>
            Your finds, their opinions
          </p>
          <h1 className="mb-5 text-[32px] font-medium leading-tight text-shoppi-ink">
            Shopping is better with friends
          </h1>
          <p className="mb-10 text-[14px] leading-relaxed" style={{ color: '#888' }}>
            Drop a link. Get votes. Buy with confidence. Shoppi turns every purchase into a moment with the people whose taste you trust.
          </p>
          <Link
            to="/create"
            className="rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#E8651A' }}
          >
            Start a Shoppi
          </Link>
        </section>

        {/* ── Section 2: Accent bar ────────────────────────────────────────── */}
        <div className="flex h-[3px] w-full overflow-hidden rounded-full">
          <div className="flex-[3]" style={{ background: '#C0C0C0' }} />
          <div className="flex-[2]" style={{ background: '#E8651A' }} />
          <div className="flex-[2]" style={{ background: '#E8608A' }} />
          <div className="flex-[1]" style={{ background: '#C5D93A' }} />
        </div>

        {/* ── Section 3: Collage grid ──────────────────────────────────────── */}
        <section className="py-10">
          <div className="grid grid-cols-3 gap-[6px]">

            {/* Row 1 col 1: silver swatch */}
            <div
              className="flex items-end rounded-[6px] p-3"
              style={{ background: 'linear-gradient(135deg, #d4d4d4 0%, #a8a8a8 100%)', minHeight: 110 }}
            >
              <span className="text-[11px] font-medium text-white">Friends</span>
            </div>

            {/* Row 1 col 2–3: dark swatch */}
            <div
              className="col-span-2 flex flex-col justify-end rounded-[6px] p-4"
              style={{ background: '#1A1A1A', minHeight: 110 }}
            >
              <p className="text-[22px] font-medium leading-tight text-white">The Edit</p>
              <p className="mt-1 text-[10px]" style={{ color: '#888' }}>Curated by your circle</p>
            </div>

            {/* Row 2: orange, pink, chartreuse */}
            <div className="flex items-end rounded-[6px] p-3" style={{ background: '#E8651A', minHeight: 90 }}>
              <span className="text-[11px] font-medium text-white">Drop</span>
            </div>
            <div className="flex items-end rounded-[6px] p-3" style={{ background: '#E8608A', minHeight: 90 }}>
              <span className="text-[11px] font-medium text-white">Vote</span>
            </div>
            <div className="flex items-end rounded-[6px] p-3" style={{ background: '#C5D93A', minHeight: 90 }}>
              <span className="text-[11px] font-medium" style={{ color: '#1A1A1A' }}>Decide</span>
            </div>

            {/* Row 3 col 1–2: quote card */}
            <div
              className="col-span-2 flex flex-col justify-center rounded-[6px] border p-4"
              style={{ borderColor: '#C0C0C0', background: '#fff', minHeight: 100 }}
            >
              <p className="text-[15px] font-medium leading-snug text-shoppi-ink">
                "Is this worth it or am I delusional"
              </p>
              <p className="mt-2 text-[11px]" style={{ color: '#C0C0C0' }}>— every group chat, ever</p>
            </div>

            {/* Row 3 col 3: gradient heart */}
            <div
              className="flex items-center justify-center rounded-[6px]"
              style={{ background: 'linear-gradient(135deg, #E8608A 0%, #E8651A 100%)', minHeight: 100 }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </section>

        {/* ── Section 4: How it works ──────────────────────────────────────── */}
        <section className="pb-10">
          <p className="mb-5 text-[11px] font-medium" style={{ color: '#C0C0C0', letterSpacing: '0.12em' }}>
            How it works
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '1', title: 'Drop a link', body: 'Paste any product URL' },
              { n: '2', title: 'Friends vote', body: 'Share the link. They tap yes or no.' },
              { n: '3', title: 'Buy confident', body: 'See the verdict. Post a try-on.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="rounded-[6px] border p-4" style={{ borderColor: '#C0C0C0' }}>
                <p className="mb-2 text-[20px] font-medium" style={{ color: '#E8651A' }}>{n}</p>
                <p className="mb-1 text-[13px] font-medium text-shoppi-ink">{title}</p>
                <p className="text-[11px] leading-snug" style={{ color: '#888' }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 5: Bottom CTA ────────────────────────────────────────── */}
        <section className="border-t py-16 text-center" style={{ borderColor: '#C0C0C0' }}>
          <h2 className="mb-3 text-[18px] font-medium text-shoppi-ink">
            Your next purchase deserves a second opinion
          </h2>
          <p className="mb-8 text-[12px] leading-relaxed" style={{ color: '#888' }}>
            No app download. No account needed for friends. Just send the link.
          </p>
          <Link
            to="/create"
            className="rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#E8651A' }}
          >
            Create your first Shoppi
          </Link>
        </section>

      </div>
    </div>
  )
}
