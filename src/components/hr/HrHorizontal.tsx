interface HrHorizontalProps {
  thickness?: number
  color?: string
  spacingH?: number
  spacingV?: number
}

export default function HrHorizontal({
  thickness = 1,
  color = "#e1e1e1",
  spacingH = 24,
  spacingV = 0,
}: HrHorizontalProps) {
  return (
    <div
      style={{
        height: thickness,
        backgroundColor: color,
        margin: `${spacingV}px ${spacingH}px`,
        width: `calc(100% - ${2 * spacingH}px)`,
      }}
    />
  )
}
