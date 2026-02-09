interface HrHorizontalProps {
  thickness?: number
  color?: string
  spacing?: number
}

export default function HrHorizontal({
  thickness = 1,
  color = "#e1e1e1",
  spacing = 24,
}: HrHorizontalProps) {
  return (
    <div
      style={{
        height: thickness,
        backgroundColor: color,
        margin: `${spacing}px 0`,
        width: "100%",
      }}
    />
  )
}
