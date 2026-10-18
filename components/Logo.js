export default function Logo({ size = 44, print = false, showText = false, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="GF Dedetização"
        style={{
          height: `${size}px`,
          width: "auto",
          maxHeight: `${size}px`,
          maxWidth: `${size * 2.5}px`,
          objectFit: "contain",
          borderRadius: print ? "4px" : "6px",
          display: "inline-block",
        }}
      />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-tight text-white">
            GF<span className="text-brand-green">.</span>
          </span>
          <span className="mt-0.5 text-[.6rem] font-bold tracking-[.22em] text-neutral-400">DEDETIZAÇÃO</span>
        </span>
      )}
    </span>
  );
}
