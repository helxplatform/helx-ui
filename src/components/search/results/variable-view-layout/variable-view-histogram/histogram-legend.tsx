import { CSSProperties } from 'react'
import { HistogramLegendItem, HistogramLegendItemProps } from './histogram-legend-item'

interface HistogramLegendProps {
    title: string | { title: string, style?: CSSProperties }
    items: HistogramLegendItemProps[]
    style?: CSSProperties
}

export const HistogramLegend = ({ title: _title, items, style, ...props }: HistogramLegendProps) =>  {
    if (typeof _title === "string") _title = { title: _title, style: {} }
    const { title, style: titleStyle={} } = _title

    return (
        <div style={{ ...style }} { ...props }>
            { title && (
                <div style={{
                    marginBottom: 6,
                    textAlign: "start",
                    fontSize: 12,
                    textTransform: "uppercase",
                    // textDecoration: "underline",
                    letterSpacing: 0.25,
                    fontWeight: 600,
                    color: "rgba(0, 0, 0, 0.65)",
                    ...titleStyle
                }}>
                    { title }
                </div>
            ) }
            <div style={{ display: "flex", flexDirection: "column" }}>
                { items.map((item) => <HistogramLegendItem key={ item.id } { ...item } />) }
            </div>
        </div>
    )
}