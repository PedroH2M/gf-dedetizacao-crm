export default function Logo({ size = 40, print = false, showText = true }) {
  const stroke = print ? "#1a9e0f" : "#39ff14";
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
        <path d="M256 60 100 120v122c0 100 65 172 156 202 91-30 156-102 156-202V120z" fill="none" stroke={stroke} strokeWidth="30" strokeLinejoin="round" />
        <path d="m184 262 54 54 94-108" fill="none" stroke={stroke} strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-tight">
            GF<span style={{ color: stroke }}>.</span>
          </span>
          <span className="mt-0.5 text-[.6rem] font-bold tracking-[.22em] opacity-80">DEDETIZAÇÃO</span>
        </span>
      )}
    </span>
  );
}
