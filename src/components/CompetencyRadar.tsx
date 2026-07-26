import { useId } from 'react'
import { clampCompetencyScore } from '../data/archive'

export interface RadarAxisScore {
  key: string
  label: string
  value: number
}

interface CompetencyRadarProps {
  axes: RadarAxisScore[]
}

const chartSize = 187
const chartCenter = chartSize / 2
const outerRadius = 88
const labelRadius = 106

function pointFor(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: chartCenter + Math.cos(radians) * radius,
    y: chartCenter + Math.sin(radians) * radius,
  }
}

export function CompetencyRadar({ axes }: CompetencyRadarProps) {
  const safeAxes = axes.length >= 3 ? axes : [
    ...axes,
    ...Array.from({ length: 3 - axes.length }, (_, index) => ({
      key: `empty-${index}`,
      label: '미정',
      value: 0,
    })),
  ]
  const angleStep = 360 / safeAxes.length
  const chartId = useId().replace(/:/g, '')
  const surfaceGradientId = `radar-surface-${chartId}`
  const innerGradientId = `radar-inner-${chartId}`
  const gridPatternId = `radar-grid-${chartId}`
  const polygonPoints = (radiusForAxis: (axisIndex: number) => number) =>
    safeAxes
      .map((_, axisIndex) => {
        const point = pointFor(axisIndex * angleStep, radiusForAxis(axisIndex))
        return `${point.x.toFixed(2)},${point.y.toFixed(2)}`
      })
      .join(' ')
  const scorePoints = safeAxes.map((axis, axisIndex) =>
    pointFor(axisIndex * angleStep, (outerRadius * clampCompetencyScore(axis.value)) / 100),
  )
  const polygon = scorePoints.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')
  const scoreSummary = axes.map((axis) => `${axis.label} ${clampCompetencyScore(axis.value)}%`).join(', ')
  const labelTextAnchor = (axisIndex: number) => {
    const horizontalPosition = Math.cos(((axisIndex * angleStep - 90) * Math.PI) / 180)
    if (horizontalPosition > 0.35) return 'start'
    if (horizontalPosition < -0.35) return 'end'
    return 'middle'
  }

  return (
    <svg
      aria-label={`${axes.length}개 역량으로 구성된 다각형: ${scoreSummary}`}
      className="size-full overflow-visible"
      role="img"
      viewBox={`0 0 ${chartSize} ${chartSize}`}
    >
      <title>캐릭터 역량 다각형</title>
      <defs>
        <linearGradient id={surfaceGradientId} x1="25%" x2="75%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#d9f9f7" />
          <stop offset="100%" stopColor="#72d6d1" />
        </linearGradient>
        <linearGradient id={innerGradientId} x1="20%" x2="80%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#effdfc" stopOpacity="0.64" />
          <stop offset="100%" stopColor="#7dcecb" stopOpacity="0.34" />
        </linearGradient>
        <pattern height="4" id={gridPatternId} patternUnits="userSpaceOnUse" width="4">
          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="0.65" />
        </pattern>
      </defs>
      <polygon fill={`url(#${surfaceGradientId})`} points={polygonPoints(() => outerRadius)} />
      {[75, 50, 25].map((level) => (
        <polygon
          fill={`url(#${innerGradientId})`}
          fillOpacity={level === 75 ? 0.38 : level === 50 ? 0.3 : 0.24}
          key={level}
          points={polygonPoints(() => (outerRadius * level) / 100)}
          stroke="#69cfca"
          strokeOpacity="0.46"
          strokeWidth="1"
        />
      ))}
      {safeAxes.map((axis, axisIndex) => {
        const endpoint = pointFor(axisIndex * angleStep, outerRadius)
        return (
          <line
            key={axis.key}
            stroke="#5fcac5"
            strokeOpacity="0.5"
            strokeWidth="1"
            x1={chartCenter}
            x2={endpoint.x}
            y1={chartCenter}
            y2={endpoint.y}
          />
        )
      })}
      <polygon fill="white" fillOpacity="0.18" points={polygon} stroke="white" strokeOpacity="0.9" strokeWidth="1.5" />
      <polygon fill={`url(#${gridPatternId})`} fillOpacity="0.9" points={polygon} />
      {scorePoints.map((point, index) => (
        <circle
          cx={point.x}
          cy={point.y}
          fill="white"
          key={safeAxes[index].key}
          r="3.5"
          stroke="white"
          strokeWidth="1.75"
        />
      ))}
      {safeAxes.map((axis, axisIndex) => {
        const labelPoint = pointFor(axisIndex * angleStep, labelRadius)
        return (
          <text
            dominantBaseline="middle"
            fill="#7dcecb"
            fontSize="10"
            fontWeight="600"
            key={`label-${axis.key}`}
            textAnchor={labelTextAnchor(axisIndex)}
            x={labelPoint.x}
            y={labelPoint.y}
          >
            {axis.label}
          </text>
        )
      })}
    </svg>
  )
}
