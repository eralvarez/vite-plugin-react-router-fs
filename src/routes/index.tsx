import { Link } from 'react-router';

export default function HomePage() {
  return (
    <div data-testid="page-home">
      <h1 className="page-heading-xl" style={{ color: '#60a5fa' }}>Welcome Home</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        This is the home page, served at <code style={{ color: '#93c5fd' }}>/</code>.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/about" className="btn btn-blue">About Us</Link>
        <Link to="/blog" className="btn btn-ghost">Read Blog</Link>
        <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
      </div>
    </div>
  );
}
