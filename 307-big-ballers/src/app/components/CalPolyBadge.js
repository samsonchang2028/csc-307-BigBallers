export default function CalPolyBadge({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Cal Poly">
      <rect width="48" height="48" rx="4" fill="#154734" />
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
