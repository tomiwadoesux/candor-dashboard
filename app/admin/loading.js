export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="flex items-baseline justify-between pb-2">
        <div className="shimmer h-3 w-40 rounded-sm" />
        <div className="shimmer h-3 w-28 rounded-sm" />
      </div>
      <div className="shimmer mt-2 h-10 w-72 rounded-sm" />
      <div className="shimmer mt-3 h-3.5 w-[32rem] max-w-full rounded-sm" />

      <div className="mt-8 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="shimmer h-2.5 w-20 rounded-sm" />
            <div className="shimmer mt-3 h-8 w-16 rounded-sm" />
            <div className="shimmer mt-2 h-2.5 w-24 rounded-sm" />
          </div>
        ))}
      </div>

      <ul className="mt-10 divide-y divide-border/60 border-y border-border/60">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 py-5">
            <div className="shimmer h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="shimmer h-4 w-48 rounded-sm" />
              <div className="shimmer mt-2 h-3 w-72 max-w-full rounded-sm" />
            </div>
            <div className="shimmer h-4 w-20 rounded-sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
