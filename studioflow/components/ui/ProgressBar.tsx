interface ProgressBarProps {
  value: number
  color?: string
  height?: number
  showLabel?: boolean
}

export default function ProgressBar({ value, color = 'var(--brand)', height = 5, showLabel = false }: ProgressBarProps) {
  const pct = Math.min(Math.max(Math.round(value), 0), 100)
  return (
    <div className="flex items-center gap-2">
      <div style={{ flex: 1, height, background: 'var(--cream-dark)', borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
      {showLabel && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--brand)', minWidth: 32 }}>{pct}%</span>}
    </div>
  )
}
