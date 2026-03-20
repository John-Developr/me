'use client'

import { useApp } from "@/lib/.context/AppContext"

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
  const { isDark } = useApp();

  return (
    <div
      style={{
        height: thickness,
        backgroundColor: isDark ? "var(--divider-bottom)" : color,
        margin: `${spacingV}px ${spacingH}px`,
        width: `calc(100% - ${2 * spacingH}px)`,
      }}
    />
  )
}
