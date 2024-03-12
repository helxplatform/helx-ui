import { Fragment, ReactNode, useMemo, useState } from 'react'
import { Button, Card, Collapse, Divider, Space, Statistic, Tag, Tooltip, Typography } from 'antd'
import { ExportOutlined as ExternalLinkIcon } from '@ant-design/icons'
import { SliderBaseProps } from 'antd/lib/slider'
import { Column } from '@ant-design/plots'
import { Column as G2Column, ColumnOptions as G2ColumnConfig } from '@antv/g2plot'
import { HistogramLegend, DebouncedRangeSlider } from './variable-results'
import { useHelxSearch } from '../../context'
import { useAnalytics } from '../../../../contexts'
import { InfoButton, InfoPopover, InfoTooltip } from '../../../info-helpers'
import { ISearchContext, StudyResult, VariableResult, VariableViewProvider, useVariableView } from './variable-view-context'

const { Text, Link, Title } = Typography
const { Panel } = Collapse
const { CheckableTag } = Tag

interface GetChart {
    (): G2Column
}
interface ChartRef {
    getChart: GetChart
}

interface StudyInfoTooltipProps {
    study: StudyResult
}

const VariableViewHistogram = () => {
    const { analyticsEvents } = useAnalytics()
    const { query, variableResults, totalVariableResults } = useHelxSearch() as ISearchContext
    const {
        filteredVariables, variableHistogramConfig, absScoreRange,
        scoreLegendItems, filteredPercentile, onScoreSliderChange,
        variablesHistogram
    } = useVariableView()!
    const [collapse, setCollapse] = useState<boolean>(false)
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
                { filteredVariables.length < totalVariableResults && (
                    <div style={{ marginTop: -8, marginBottom: 16 }}>
                        <Text type="secondary">
                            Viewing {filteredVariables.length} variables within the {Math.floor(filteredPercentile[0])}-{Math.floor(filteredPercentile[1])} percentiles
                        </Text>
                    </div>
                ) }
                <Space direction="vertical" size="middle">
                    <div style={{ display: "flex" }}>
                        <div style={{ flexGrow: 1, width: 0 }}>
                            <Column
                                { ...variableHistogramConfig }
                                ref={ variablesHistogram }
                                style={{ padding: 0 }}
                            />
                            <DebouncedRangeSlider
                                value={ absScoreRange }
                                onChange={ (change?: [number, number]) => change !== undefined && onScoreSliderChange(change) }
                                min={ Math.min(...variableResults.map((result) => result.score)) }
                                max={ Math.max(...variableResults.map((result) => result.score)) }
                                step={ null }
                                marks={ variableResults.reduce<SliderBaseProps["marks"]>((acc, cur) => ({
                                    ...acc,
                                    [cur.score]: {
                                        label: cur.score,
                                        style: {
                                            display: "none"
                                        }
                                    }
                                }), {}) }
                                // Margin to align with the histogram
                                style={{ marginRight: 0, marginBottom: 4, marginTop: 16, flexGrow: 1 }}
                                className="histogram-slider"
                            />
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

export const VariableListDataSources = () => {
    const { dataSources, hiddenDataSources, setHiddenDataSources } = useVariableView()!
    return (
        <Space direction="horizontal" size={ 0 } style={{ marginTop: 8, marginBottom: 4 }}>
            {
                Object.values(dataSources).map((dataSource) => (
                        <CheckableTag
                            key={ `variable-view-data-source-tag-${ dataSource.name }` }
                            className={ `variable-view-data-source-tag ${ hiddenDataSources.includes(dataSource.name) ? "inactive" : "active" }` }
                            style={{
                                fontSize: 13,
                                background: !hiddenDataSources.includes(dataSource.name) ? dataSource.color : undefined,
                                border: hiddenDataSources.includes(dataSource.name) ? "1px solid rgba(0, 0, 0, 0.15)" : undefined,
                                ["--hover-color" as any]: dataSource.color 
                            }}
                            checked={ !hiddenDataSources.includes(dataSource.name) }
                            onChange={ () => setHiddenDataSources((oldSources) => {
                                if (oldSources.includes(dataSource.name)) {
                                    return oldSources.filter((source) => source !== dataSource.name)
                                } else return [...oldSources, dataSource.name]
                            }) }
                            // style={ {
                            //     fontSize: 13,
                            //     ...(hiddenDataSources.includes(dataSource) ? { border: "1px solid #d9d9d9", background: "#fafafa" } : {})
                            // } }
                            // checked={ !hiddenDataSources.includes(dataSource) }
                            // onChange={ (checked) => onDataSourceChange(dataSource, !checked) }
                        >
                            { `${ dataSource.name } (${ dataSource.variables.length })` }
                        </CheckableTag>
                ))
            }
        </Space>
    )
}

const StudyInfoTooltipStatistic = ({ name, value }: { name: ReactNode, value: ReactNode }) => {
    return (
        <div
            className="study-info-tooltip-statistic"
            style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8
            }}>
            <span style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.5px",
                color: "#434343",
                textTransform: "uppercase",
                overflow: "hidden"
            }}>{ name }</span>
            <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{ value }</span>
        </div>
    )
}

const StudyInfoTooltip = ({ study }: StudyInfoTooltipProps) => {
    const { variablesSource } = useVariableView()!
    return (
        <InfoPopover
            overlayClassName="study-info-tooltip"
            trigger="click"
            title={
                <div style={{ display: "flex", alignItems: "center", margin: "8px 0" }}>
                    <Title level={ 5 } style={{
                        margin: 0,
                        fontSize: 12.5,
                        letterSpacing: "0.5px",
                        color: "#434343",
                        textTransform: "uppercase",
                        overflow: "hidden"
                    }}>{ study.c_name }</Title>
                    { study.c_link && (
                        <Link href={ study.c_link } target="_blank" style={{ marginLeft: 8 }}>
                            <ExternalLinkIcon />
                        </Link>
                    ) }
                </div>
            }
            content={
                <div>
                    <StudyInfoTooltipStatistic name="Identifier" value={ study.c_id } />
                    <StudyInfoTooltipStatistic name="Variables" value={ study.elements.length } />
                    {/* <StudyInfoTooltipStatistic name="Data source" value={ study.data_source } /> */}
                </div>
            }
            color="white"
            style={{ width: "auto", height: "auto", minWidth: 0, minHeight: 0 }}
            iconProps={{ filled: false, style: { fontSize: 12, marginLeft: 1 } }}
            placement="right"
        />
    )
}

export const VariableList = () => {
    const { filteredVariables, variablesSource, dataSources } = useVariableView()!
    return (
        <div className="variable-list">
            <Divider orientation="left" orientationMargin={ 0 } style={{ fontSize: 15, marginTop: 24, marginBottom: 0 }}>Variables</Divider>
            <VariableListDataSources />
            { filteredVariables.length < variablesSource.length && (
                <div style={{ marginTop: 6, marginBottom: -4 }}>
                    <Text type="secondary" style={{ fontSize: 14, fontStyle: "italic" }}>
                        Showing { filteredVariables.length } of { variablesSource.length } variables
                    </Text>
                </div>
            ) }
            { filteredVariables.map((variable, i) => (
                <div
                    key={ variable.id }
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        flexWrap: "nowrap",
                        paddingRight: 16,
                        paddingBottom: 16,
                        paddingTop: i === 0 ? 16 : 0
                    }}
                >
                    <span
                        className="study-panel-header"
                        style={{
                            flex: "auto",
                            display: "inline-flex",
                            alignItems: "center"
                        }}
                    >
                        <Tooltip title={ variable.data_source } placement="right" >
                            <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: dataSources[variable.data_source].color,
                                marginRight: 8
                            }} />
                        </Tooltip>
                        <Text>{variable.name}&nbsp;</Text>
                        ({ variable.e_link ? (
                            <a
                                href={variable.e_link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={ (e) => {
                                    e.stopPropagation()
                                } }
                            >
                                {variable.id}
                            </a>
                        ) : variable.id })
                    </span>
                    <Text italic style={{ fontSize: 13 }}>
                        { variable.description }
                    </Text>
                    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12, color: "rgba(0, 0, 0, 0.45)" }}>
                        Source:&nbsp;<i>{ variable.study.c_name }</i>&nbsp;
                        <StudyInfoTooltip study={ variable.study } />
                    </span>
                </div>
            )) }
        </div>
    )
}

export const VariableSearchResults2 = () => {
    const { totalVariableResults } = useHelxSearch() as any
    const noResults = useMemo(() => totalVariableResults === 0, [totalVariableResults])
    return (
        <VariableViewProvider>
            <div style={{ flexGrow: 1, display: noResults ? "none" : undefined }}>
                <VariableViewHistogram />
                <VariableList />
            </div>
        </VariableViewProvider>
    )
}