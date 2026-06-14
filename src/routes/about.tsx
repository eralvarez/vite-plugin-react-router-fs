import { Link } from 'react-router';

export default function AboutPage() {
  return (
    <div data-testid="page-about">
      <h1 className="page-heading" style={{ color: '#60a5fa' }}>About</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
        This page lives at <code style={{ color: '#93c5fd' }}>/about</code>. It is a simple flat route file —{' '}
        <code style={{ color: '#93c5fd' }}>src/routes/about.tsx</code>.
      </p>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        The root <code>layout.tsx</code> wraps this page, so the navigation bar above is always visible.
      </p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}
