export default function Dashboard() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center bg-white px-6 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-stash-silver">
        Coming soon
      </p>
      <h1
        className="text-4xl text-stash-black"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Your dashboard
      </h1>
      <p className="mt-4 text-sm text-stash-black/50">
        All your wishlists and votes, in one place.
      </p>
    </div>
  )
}
