export default function StatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <div className={`mt-3 h-2 bg-${color}-500 rounded`} />
    </div>
  );
}
