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
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
