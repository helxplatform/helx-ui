import { CSSProperties, useState } from 'react'
import { Typography } from 'antd'

const { Text } = Typography

export interface HistogramLegendItemProps {
    id: string
    name: string | { name: string, style?: CSSProperties }
    description: string | { description: string, style?: CSSProperties }
    marker: any
}

export const HistogramLegendItem = ({ id, name: _name, description: _description, marker: _marker }: HistogramLegendItemProps) => {
    if (typeof _marker === "string") _marker = { path: _marker }
    const { path, style: markerStyle={} } = _marker
    if (typeof _name === "string") _name = { name: _name, style: {} }
    const { name, style: nameStyle } = _name
    if (typeof _description === "string") _description = { description: _description, style: {} }
    const { description, style: descriptionStyle } = _description
    
    const width = 48
    const height = 12

    const [hover, setHover] = useState(false)

    return (
        <div
            className="histogram-legend-item"
            onMouseOver={ () => setHover(true) }
            onMouseOut={ () => setHover(false) }
            style={{ display: "flex", flexDirection: "column", marginTop: 4 }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <svg style={{ width, height }}>
                    <path d={ path(width, height) } { ...markerStyle } />
                </svg>
                <Text style={{
                    marginLeft: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(0, 0, 0, 0.85)",
                    ...nameStyle
                }}>
                    { name }
                </Text>
            </div>
            { description && (
                <Text style={{
                    fontSize: 12,
                    color: "rgba(0, 0, 0, 0.45)",
                    ...descriptionStyle
                }}>
                    { description }
                </Text>
            ) }
        </div>
    )
}