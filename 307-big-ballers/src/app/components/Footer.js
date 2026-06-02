export default function Footer() {
  return (
    <footer className="border-t" style={{ background: '#faf9f6', borderColor: 'var(--border-light)' }}>
      <div className="max-w-6xl mx-auto px-6 py-3">
        <p className="text-xs text-center" style={{ color: 'var(--text-muted-accessible)' }}>
          &copy; {new Date().getFullYear()} OptiCart &mdash; CSC 307 Big Ballers
        </p>
      </div>
    </footer>
  );
}
