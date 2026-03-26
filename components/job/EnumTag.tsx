import { cn } from '@/lib/utils'

type EnumTagProps = {
  color: string
  label: string
  className?: string
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '')
  if (cleaned.length !== 6) return null
  const r = parseInt(cleaned.substring(0, 2), 16)
  const g = parseInt(cleaned.substring(2, 4), 16)
  const b = parseInt(cleaned.substring(4, 6), 16)
  return { r, g, b }
}

export default function EnumTag({ color, label, className }: EnumTagProps) {
  const rgb = hexToRgb(color)
  const bgColor = rgb
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
    : 'rgba(107, 114, 128, 0.15)'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        className
      )}
      style={{
        backgroundColor: bgColor,
        color: color,
      }}
    >
      {label}
    </span>
  )
}
