const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function CategoryIcon({ name, ...props }) {
  switch (name) {
    case "Dairy":
      return (
        <svg {...iconProps} {...props}>
          <path d="M8 3h8v4H8z" />
          <path d="M7 7h10v14H7z" />
          <path d="M10 11h4" />
        </svg>
      );
    case "Produce":
      return (
        <svg {...iconProps} {...props}>
          <path d="M12 20c4 0 7-3 7-7 0-3-2-5-4-6-1 2-3 3-5 3s-4-1-5-3c-2 1-4 3-4 6 0 4 3 7 7 7z" />
          <path d="M12 3v4" />
        </svg>
      );
    case "Meat":
      return (
        <svg {...iconProps} {...props}>
          <path d="M4 14c0-3 2-6 6-7 2 3 5 4 8 4 1 2 1 4-1 5-3 2-7 1-10-1-2-2-3-3-3z" />
          <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "Bakery":
      return (
        <svg {...iconProps} {...props}>
          <path d="M4 14c0-4 3-7 8-7s8 3 8 7" />
          <path d="M6 14h12v4H6z" />
          <path d="M8 10c1-2 3-3 4-3s3 1 4 3" />
        </svg>
      );
    case "Pantry":
      return (
        <svg {...iconProps} {...props}>
          <rect x="7" y="4" width="10" height="16" rx="1" />
          <path d="M9 8h6M9 12h6" />
        </svg>
      );
    case "Snacks":
      return (
        <svg {...iconProps} {...props}>
          <path d="M5 8h14l-2 12H7L5 8z" />
          <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
        </svg>
      );
    default:
      return null;
  }
}

export function SearchIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

export function HeartIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export function TagIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.6 12.4L12 21 3 12V3h9l8.6 9.4z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GradCapIcon(props) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 0 3 3 6 3s6-3 6-3v-5" />
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function UserIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function HomeIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

export function InfoIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function SlidersIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...props}>
      <path d="M4 6h16M4 12h10M4 18h6" />
      <circle cx="18" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ChevronUpIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function TrendUpIcon(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M3 17l6-6 4 4 8-10" />
      <path d="M17 5h4v4" />
    </svg>
  );
}

export function LeafIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" {...props}>
      <path d="M12 22C12 22 3 16 3 9a9 9 0 0 1 18 0c0 7-9 13-9 13z" />
      <path d="M12 22V10" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
