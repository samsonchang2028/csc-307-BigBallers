import { GradCapIcon } from "./icons";
import CalPolyBadge from "./CalPolyBadge";

export default function Footer() {
  return (
    <footer className="border-t" style={{ background: '#faf9f6', borderColor: 'var(--border-light)' }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <GradCapIcon style={{ color: 'var(--poly-green)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--poly-green)' }}>Built for Cal Poly.</strong>{' '}
            Save more. Stress less. We compare prices at local stores so you don&apos;t have to.
          </p>
        </div>
        <CalPolyBadge size={44} />
      </div>
    </footer>
  );
}
