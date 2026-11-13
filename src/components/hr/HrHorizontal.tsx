interface HrHorizontalProps {
  thickness?: number
  /** Line color; defaults to the theme divider token (correct in light and dark from the first paint). */
  color?: string
  spacingH?: number
  spacingV?: number
}

export default function HrHorizontal({
  thickness = 1,
  color = "var(--divider-bottom)",
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
