const PLACEHOLDER_COLORS = [
  { bg: "#eef4f1", accent: "#154734" },
  { bg: "#f5f0e8", accent: "#BD8B13" },
  { bg: "#eef2f8", accent: "#2d4a7a" },
  { bg: "#f4eef5", accent: "#6b3a6e" },
  { bg: "#eef8f0", accent: "#1a6b42" },
  { bg: "#f8f4ee", accent: "#8b5a2b" },
];

export default function ProductPlaceholder({ name, index = 0, size = "md" }) {
  const colors = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  const dims = size === "lg" ? "w-[140px] h-[140px] text-4xl" : "w-[88px] h-[88px] text-2xl";

  return (
    <div
      className={`${dims} rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden`}
      style={{ background: colors.bg }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.accent}22, transparent 70%)`,
        }}
      />
      <span className="font-bold relative" style={{ color: colors.accent }}>
        {initial}
      </span>
    </div>
  );
}
