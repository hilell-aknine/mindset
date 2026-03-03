export default function MiniStat({ label, value, icon, trend, sub }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-1 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold font-display text-frost-white mt-1">
        {typeof value === 'number' ? value.toLocaleString('he-IL') : value}
      </p>
      <p className="text-xs text-white/40">{label}</p>
      {sub && <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>}
    </div>
  )
}
