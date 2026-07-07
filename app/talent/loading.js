export default function TalentLoading() {
  return (
    <div className="pt-2" aria-busy="true" aria-label="Loading">
      <div className="shimmer h-3 w-40 rounded-full" />
      <div className="shimmer mt-4 h-10 w-72 rounded-md" />
      <div className="shimmer mt-3 h-3 w-96 max-w-full rounded-full" />

      <div className="mt-10 grid grid-cols-2 gap-8 border-y border-border/60 py-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="shimmer h-2.5 w-20 rounded-full" />
            <div className="shimmer mt-3 h-8 w-24 rounded-md" />
            <div className="shimmer mt-2 h-2.5 w-28 rounded-full" />
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
