import { Link } from 'react-router';

const posts = [
  {
    slug: 'getting-started',
    title: 'Getting Started with File-Based Routing',
    date: '2026-01-01',
  },
  {
    slug: 'advanced-routing',
    title: 'Advanced Routing Patterns',
    date: '2026-01-15',
  },
  {
    slug: 'guards-and-layouts',
    title: 'Guards & Layouts Deep Dive',
    date: '2026-02-01',
  },
];

export default function BlogIndex() {
  return (
    <div data-testid="page-blog-index">
      <h1 className="mb-6 text-3xl font-bold text-purple-400">Blog Posts</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="rounded-lg border border-slate-700 bg-slate-800 p-4"
          >
            <Link
              to={`/blog/${post.slug}`}
              className="text-lg font-medium text-blue-400 hover:underline"
            >
              {post.title}
            </Link>
            <p className="mt-1 text-sm text-slate-400">{post.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
