export default function BarChart({ data, height = 160, barColor = 'var(--color-dusty-aqua)' }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center text-white/30 text-sm" style={{ height }}>
        אין נתונים
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${data.length * 48} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 28)
          const x = i * 48 + 8
          const barW = 32
          const y = height - barH - 20
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={barColor}
                opacity={0.8}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
              >
                {d.value}
              </text>
              <text
                x={x + barW / 2}
                y={height - 4}
                textAnchor="middle"
                fill="rgba(255,255,255,0.35)"
                fontSize="9"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
