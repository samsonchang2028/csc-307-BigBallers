import { CategoryIcon } from "./icons";

export default function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer border"
      style={
        active
          ? {
              background: "var(--poly-green)",
              color: "#fff",
              borderColor: "var(--poly-green)",
            }
          : {
              background: "#fff",
              color: "var(--poly-green)",
              borderColor: "var(--border)",
            }
      }
    >
      <CategoryIcon name={label} />
      <span>{label}</span>
    </button>
  );
}
