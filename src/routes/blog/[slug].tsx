import { useParams, Link } from 'react-router';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div data-testid="page-blog-post">
      <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
        Dynamic route: <code style={{ color: '#93c5fd' }}>src/routes/blog/[slug].tsx</code>
      </p>
      <h1 className="page-heading" style={{ color: '#c084fc' }}>
        Post: <span data-testid="blog-slug">{slug}</span>
      </h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        The URL param <code style={{ color: '#93c5fd' }}>:slug</code> resolved to{' '}
        <strong style={{ color: '#fff' }}>{slug}</strong>.
      </p>
      <Link to="/blog">Back to Blog</Link>
    </div>
  );
}
