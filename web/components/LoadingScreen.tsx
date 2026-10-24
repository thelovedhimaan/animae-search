export function LoadingScreen({ label = "Loading the anime index" }: { label?: string }) {
  return <div className="route-loader" role="status" aria-live="polite">
    <div className="loader-heading"><span className="loader-mark">AI</span><div><span className="kicker">ANIME INDEX</span><h1>{label}</h1></div></div>
    <div className="loader-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" style={{ "--delay": `${index * 70}ms` } as React.CSSProperties} key={index}><span /><i /><b /></div>)}</div>
    <span className="sr-only">Please wait.</span>
  </div>;
}
