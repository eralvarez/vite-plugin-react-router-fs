import { useParams, Link } from 'react-router';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div data-testid="page-blog-post">
      <p className="mb-2 text-sm text-slate-400">
        Dynamic route: <code className="text-blue-300">src/routes/blog/[slug].tsx</code>
      </p>
      <h1 className="mb-4 text-3xl font-bold text-purple-400">
        Post: <span data-testid="blog-slug">{slug}</span>
      </h1>
      <p className="mb-6 text-slate-300">
        The URL param <code className="text-blue-300">:slug</code> resolved to{' '}
        <strong className="text-white">{slug}</strong>.
      </p>
      <Link to="/blog" className="text-blue-400 underline">
        Back to Blog
      </Link>
    </div>
  );
}
