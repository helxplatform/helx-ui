import { useMemo, useState, Fragment } from 'react'
import { Collapse, Divider, Space, Typography } from 'antd'
import { SliderBaseProps } from 'antd/lib/slider'
import { Column } from '@ant-design/plots'
import { HistogramLegend } from './histogram-legend'
import { useHelxSearch } from '../../../context'
import { DebouncedRangeSlider, InfoTooltip } from '../../../../'
import { useAnalytics } from '../../../../../contexts'
import { ISearchContext, useVariableView } from '../variable-view-context'

const { Panel } = Collapse
const { Text } = Typography

export const VariableViewHistogram = () => {
    const { analyticsEvents } = useAnalytics()
    const { query, variableResults } = useHelxSearch() as ISearchContext
    const {
        normalizedVariableResults, filteredVariables, variableHistogramConfig,
        scoreFilter, setScoreFilter,
        scoreLegendItems, filteredPercentile, variablesHistogram
    } = useVariableView()!
    
    const [collapse, setCollapse] = useState<boolean>(false)

    const histogram = useMemo(() => (
        <Column
            { ...variableHistogramConfig }
            ref={ variablesHistogram }
            style={{ padding: 0 }}
        />
    ), [variableHistogramConfig])

    const sliderMarks = useMemo(() => {
        return normalizedVariableResults.reduce<SliderBaseProps["marks"]>((acc, cur) => {
            acc![cur.score] = {
                label: cur.score,
                style: {
                    display: "none"
                }
            }
            return acc
        }, {})
    }, [normalizedVariableResults])

    const slider = useMemo(() => (
        <DebouncedRangeSlider
            value={ scoreFilter }
            onChange={ setScoreFilter }
            min={ 0 }
            max={ 100 }
            step={ null }
            marks={ sliderMarks }
            // Margin to align with the histogram
            style={{ marginRight: 0, marginBottom: 4, marginTop: 16, flexGrow: 1 }}
            className="histogram-slider"
        />
    ), [scoreFilter, setScoreFilter, sliderMarks])

    return (
        <Collapse
            ghost
            activeKey={!collapse ? ["variableViewHistogramPanel"] : []}
            onChange={ () => {
                const isCollapsed = !collapse
                analyticsEvents.variableViewHistogramToggled(query, !isCollapsed)
                setCollapse(isCollapsed)
            } }
        >
            <Panel key="variableViewHistogramPanel" className="variable-histogram-collapse-panel" header={
                <Fragment>
                    {/* The results header has a bottom margin of 16, so the divider shouldn't have a top margin. */}
                    <Divider orientation="left" orientationMargin={ 0 } style={{
                        marginTop: 0,
                        marginBottom: 0,
                        fontSize: 18,
                        fontWeight: 500
                    }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            Variables according to Dug score
                            <InfoTooltip
                                title={
                                    <div style={{ padding: "4px 2px" }}>
                                        <div style={{ fontWeight: 500, textDecoration: "underline" }}>
                                            Dug score
                                        </div>
                                        <ul style={{ marginTop: 2, marginBottom: 2, paddingLeft: 16 }}>
                                        <li>
                                            This is the metric used by Dug to describe how relevant a result is
                                        </li>
                                        <li>
                                            The score is calculated from how closely the search query matches information known about a result
                                        </li></ul>
                                    </div>
                                }
                                iconProps={{ style: { marginLeft: 8 } }}
                                trigger="hover"
                            />
                        </div>
                    </Divider>
                </Fragment>
            }>
                { filteredVariables.length < variableResults.length && (
                    <div style={{ marginTop: -8, marginBottom: 16 }}>
                        <Text type="secondary">
                            Viewing {filteredVariables.length} variables within the {Math.floor(filteredPercentile[0])}-{Math.floor(filteredPercentile[1])} percentiles
                        </Text>
                    </div>
                ) }
                <Space direction="vertical" size="middle">
                    <div style={{ display: "flex" }}>
                        <div style={{ flexGrow: 1, width: 0 }}>
                            { histogram }
                            { slider }
                        </div>
                        <HistogramLegend
                            title="Score Legend"
                            items={ scoreLegendItems }
                            style={{ marginLeft: 24, marginRight: 8, flexShrink: 0 }}
                        />
                    </div>
                </Space>
            </Panel>
        </Collapse>
    )
}