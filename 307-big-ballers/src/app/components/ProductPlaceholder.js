export default function ProductPlaceholder({ name, index = 0, size = "md" }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  const dims = size === "lg" ? "w-[120px] h-[120px] text-3xl" : "w-[88px] h-[88px] text-xl";

  return (
    <div
      className={`${dims} shrink-0 flex items-center justify-center bg-gray-100 font-semibold`}
      style={{ borderRadius: 'var(--radius)', color: 'var(--poly-green)' }}
    >
      {initial}
    </div>
  );
}
