export default function TalentLoading() {
  return (
    <div className="pt-2" aria-busy="true" aria-label="Loading">
      <div className="shimmer mt-2 h-9 w-72 rounded-lg" />

      <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border/60 py-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="shimmer h-3 w-24 rounded-full" />
            <div className="shimmer mt-3 h-6 w-20 rounded-md" />
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-12 gap-10">
        <div className="col-span-12 space-y-4 lg:col-span-7">
          <div className="shimmer h-56 w-full rounded-2xl" />
          <div className="shimmer h-14 w-full rounded-xl" />
          <div className="shimmer h-14 w-full rounded-xl" />
        </div>
        <div className="col-span-12 space-y-4 lg:col-span-5">
          <div className="shimmer h-32 w-full rounded-xl" />
          <div className="shimmer h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
