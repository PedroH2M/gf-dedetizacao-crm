export default function Loading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando">
      <div className="skeleton h-8 w-2/3" />
      <div className="skeleton h-14" />
      <div className="skeleton h-24" />
      <div className="skeleton h-24" />
      <div className="skeleton h-24" />
    </div>
  );
}
