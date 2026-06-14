import { Link } from 'react-router';

const posts = [
  { slug: 'getting-started', title: 'Getting Started with File-Based Routing', date: '2026-01-01' },
  { slug: 'advanced-routing', title: 'Advanced Routing Patterns', date: '2026-01-15' },
  { slug: 'guards-and-layouts', title: 'Guards & Layouts Deep Dive', date: '2026-02-01' },
];

export default function BlogIndex() {
  return (
    <div data-testid="page-blog-index">
      <h1 className="page-heading" style={{ color: '#c084fc' }}>Blog Posts</h1>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
        {posts.map((post) => (
          <li key={post.slug} className="card">
            <Link to={`/blog/${post.slug}`} style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              {post.title}
            </Link>
            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#94a3b8' }}>{post.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
