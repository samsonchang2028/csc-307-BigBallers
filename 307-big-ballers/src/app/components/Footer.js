import { GradCapIcon } from "./icons";

function CalPolyLogo() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-label="Cal Poly">
      <rect width="48" height="48" rx="8" fill="#154734" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fill="#F8E08E"
        fontSize="18"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        CP
      </text>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{ background: "#faf9f6", borderColor: "var(--border-light)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div style={{ color: "var(--poly-green)" }}>
            <GradCapIcon />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <strong style={{ color: "var(--poly-green)" }}>Built for Cal Poly.</strong>{" "}
            Save more. Stress less. We compare prices at local stores so you don&apos;t have to.
          </p>
        </div>
        <CalPolyLogo />
      </div>
    </footer>
  );
}
