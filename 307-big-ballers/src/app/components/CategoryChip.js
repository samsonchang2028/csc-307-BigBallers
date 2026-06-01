import { CategoryIcon } from "./icons";

export default function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
      style={
        active
          ? {
              background: "var(--poly-green)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(21, 71, 52, 0.25)",
            }
          : {
              background: "#fff",
              color: "var(--poly-green)",
              border: "1.5px solid var(--border)",
            }
      }
    >
      <CategoryIcon name={label} />
      <span>{label}</span>
    </button>
  );
}
