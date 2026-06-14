/**
 * _components/StatCard.tsx — excluded from routing by the _ prefix on the folder.
 *
 * The entire _components/ directory is invisible to the plugin scanner.
 * Components here can be imported normally by route files — they just
 * won't accidentally become routes themselves.
 */
interface StatCardProps {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
