import { Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Checkbox, Collapse, Divider, Empty, Form, Input, Popover, Select, Space, Statistic, Tag, Tooltip, Typography } from 'antd'
import { ExportOutlined as ExternalLinkIcon, CaretDownFilled, CloseOutlined } from '@ant-design/icons'
import { SliderBaseProps } from 'antd/lib/slider'
import { Column } from '@ant-design/plots'
import { Column as G2Column, ColumnOptions as G2ColumnConfig } from '@antv/g2plot'
import _InfiniteScroll from 'react-infinite-scroll-component'
import _Highlighter from 'react-highlight-words'
import Texty from 'rc-texty'
import classNames from 'classnames'
import { HistogramLegend, DebouncedRangeSlider } from './variable-results'
import { DataSource, ISearchContext, StudyResult, VariableResult, VariableViewProvider, useVariableView } from './variable-view-context'
import { useHelxSearch } from '../../context'
import { BackTop } from '../../../layout'
import { useAnalytics } from '../../../../contexts'
import { InfoButton, InfoPopover, InfoTooltip } from '../../../info-helpers'
import { DebouncedInput } from '../../../debounced-input'
import { SideCollapse } from '../../../side-collapse'
import { useLunrSearch } from '../../../../hooks'

const InfiniteScroll = _InfiniteScroll as any
const { Text, Link, Title } = Typography
const { Panel } = Collapse
const { CheckableTag } = Tag

const VARIABLE_DESCRIPTION_CUTOFF = 500
// Loads this many more variables when reaching the bottom of infinite scroll
const ITEMS_PER_PAGE = 20

interface GetChart {
    (): G2Column
}
interface ChartRef {
    getChart: GetChart
}

interface VariableDataSourceProps {
    dataSource: DataSource
}

interface StudyInfoTooltipProps {
    study: StudyResult
}

interface StudyListItemProps {
    study: StudyResult    
}
interface VariableListItemProps extends React.HTMLProps<HTMLDivElement> {
    variable: VariableResult
    showStudySource?: boolean
    showDataSource?: boolean
}

const VariableViewHistogram = () => {
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

const VariableDataSource = ({ dataSource }: VariableDataSourceProps) => {
    const { hiddenDataSources, setHiddenDataSources } = useVariableView()!
    const active = useMemo(() => !hiddenDataSources.includes(dataSource.name), [hiddenDataSources, dataSource])
    const setActive = useCallback((active: boolean) => setHiddenDataSources((prevDataSources) => {
        if (active) return prevDataSources.filter((s) => s !== dataSource.name)
        else return [...prevDataSources, dataSource.name]
    }), [dataSource])
    return (
        <CheckableTag
            className={ `variable-view-data-source-tag ${ hiddenDataSources.includes(dataSource.name) ? "inactive" : "active" }` }
            style={{
                fontSize: 13,
                background: !hiddenDataSources.includes(dataSource.name) ? dataSource.color : undefined,
                border: hiddenDataSources.includes(dataSource.name) ? "1px solid rgba(0, 0, 0, 0.15)" : undefined,
                margin: 0,
                ["--hover-color" as any]: dataSource.color 
            }}
            checked={ active }
            onChange={ () => setActive(!active) }
        >
            { `${ dataSource.name } (${ dataSource.variables.length })` }
        </CheckableTag>
    )
}

const VariableListDataSources = () => {
    const { orderedDataSources } = useVariableView()!
    return (
        <Space direction="horizontal" size={ 8 } wrap style={{ flexGrow: 1 }}>
            {
                orderedDataSources.map((dataSource) => (
                    <VariableDataSource key={ `variable-view-data-source-tag-${ dataSource.name }` } dataSource={ dataSource } />
                ))
            }
        </Space>
    )
}

const VariableFilterMenuContent = () => {
    const {
        subsearch, setSubsearch,
        sortOption, setSortOption,
        sortOrderOption, setSortOrderOption,
        collapseIntoVariables, setCollapseIntoVariables,
        resetFilters, isFiltered
    } = useVariableView()!
    
    const sortOptions = useMemo(() => ([
        {
            value: "score",
            label: "Score"
        },
        {
            value: "data_source",
            label: "Data source"
        }
    ]), [])
    
    const sortOrderOptions = useMemo(() => ([
        {
            value: "descending",
            label: "Descending"
        },
        {
            value: "ascending",
            label: "Ascending"
        }
    ]), [])

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    color: "#434343",
                    textTransform: "uppercase",
                    overflow: "hidden"
                }}>Filters</span>
                { isFiltered && <Button type="link" style={{ 
                    height: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    overflow: "hidden"
                }} onClick={ resetFilters }>Clear</Button> }
            </div>
            <Divider style={{ margin: "8px 0" }} />
            <div className="filter-menu-form-item filter-menu-form-item-vertical">
                <span className="filter-menu-form-label">Subsearch:</span>
                <DebouncedInput
                    setValue={ setSubsearch }
                    inputProps={{ placeholder: "Find specific terms...", style: { width: "100%" } }}
                />
            </div>
            <div className="filter-menu-form-item">
                <span className="filter-menu-form-label">Group by study:</span>
                <Checkbox checked={ !collapseIntoVariables } onChange={ (e) => setCollapseIntoVariables(!e.target.checked) } />
            </div>
            <Divider style={{ margin: "4px 0" }} />
            <div className="filter-menu-form-item filter-menu-form-item-vertical">
                <span className="filter-menu-form-label">Sort by:</span>
                <div style={{ display: "flex", gap: 8 }}>
                    <Select
                        options={ sortOptions }
                        value={ sortOption }
                        onChange={ setSortOption }
                        style={{ flexGrow: 1, minWidth: 125 }}
                    />
                    <Select
                        options={ sortOrderOptions }
                        value={ sortOrderOption }
                        onChange={ setSortOrderOption }
                        style={{ flexGrow: 1, minWidth: 125 }}
                    />
                </div>
            </div>
        </div>
    )
}

const VariableFilterMenuButton = () => {
    return (
        <Popover trigger="click" placement="bottomRight" content={
            <VariableFilterMenuContent />
        }>
            <Button type="primary" style={{
                display: "inline-flex",
                alignItems: "center",
                height: 28,
                padding: "4px 8px",
            }}>
                Filters
                <CaretDownFilled style={{ fontSize: 12 }} />
            </Button>
        </Popover>
    )
}

const StudyInfoTooltipStatistic = ({ name, value }: { name: ReactNode, value: ReactNode }) => {
    return (
        <div
            className="study-info-tooltip-statistic"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                gap: 16
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
            trigger="hover"
            title={
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    margin: "8px 0",
                    gap: 8,
                    maxWidth: 500,
                }}>
                    <Title level={ 5 } ellipsis title={ study.c_name } style={{
                        margin: 0,
                        fontSize: 12.5,
                        letterSpacing: "0.5px",
                        color: "#434343",
                        textTransform: "uppercase",
                        overflow: "hidden"
                    }}>{ study.c_name }</Title>
                    { study.c_link && (
                        <Link href={ study.c_link } target="_blank">
                            <ExternalLinkIcon />
                        </Link>
                    ) }
                </div>
            }
            content={
                <div>
                    <StudyInfoTooltipStatistic name="Identifier" value={ study.c_id } />
                    <Divider style={{ margin: "8px 0" }} />
                    <StudyInfoTooltipStatistic name="Variables" value={ study.elements.length } />
                    <Divider style={{ margin: "8px 0" }} />
                    <StudyInfoTooltipStatistic name="Source" value={ study.data_source } />
                </div>
            }
            color="white"
            style={{ width: "auto", height: "auto", minWidth: 0, minHeight: 0 }}
            iconProps={{ filled: false, style: { fontSize: 12, marginLeft: 1 } }}
            placement="right"
        />
    )
}

const StudyListItem = ({ study }: StudyListItemProps) => {
    const { analyticsEvents } = useAnalytics()
    const { dataSources, highlightTokens } = useVariableView()!

    const [collapsed, setCollapsed] = useState<boolean>(true)

    const Highlighter = useCallback(({ ...props }) => (
        <_Highlighter autoEscape={ true } searchWords={ highlightTokens } {...props} />
    ), [highlightTokens])

    return (
        <SideCollapse
            collapsed={ collapsed }
            onCollapse={ (collapsed) => {
                analyticsEvents.variableViewStudyToggled(study.c_name, !collapsed)
                setCollapsed(collapsed)
            } }
            header={
                <span className="study-panel-header" style={{
                    display: "inline",
                    wordBreak: "break-word"
                }}>
                    <Tooltip title={ study.data_source } placement="right" >
                        <div style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: dataSources[study.data_source].color,
                            marginRight: 8
                        }} />
                    </Tooltip>
                    <Text>
                        <Highlighter textToHighlight={ study.c_name } />
                        &nbsp;
                    </Text>
                    ({ study.c_link ? (
                        <a
                            href={ study.c_link }
                            target="_blank"
                            rel="noreferrer"
                            onClick={ (e) => {
                                e.stopPropagation()
                            } }
                        >
                            { study.c_id }
                        </a>
                    ) : study.c_id })
                </span>
            }
            panelProps={{
                className: "study-panel",
                extra: [
                    <Text key={`text_${study.c_name}`} style={{
                        overflow: "none",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        marginLeft: 8
                    }}>
                        {study.elements.length} variable{study.elements.length === 1 ? '' : 's'}
                    </Text>,
                ]
            }}
        >
            <Space direction="vertical">
                { study.elements.map((variable, i) => (
                    <Fragment key={ variable.id }>
                        <VariableListItem
                            variable={ variable }
                            showStudySource={ false }
                            showDataSource={ false }
                        />
                        { i !== study.elements.length - 1 && <Divider style={{ margin: "2px 0" }} /> }
                    </Fragment>
                )) }
            </Space>
        </SideCollapse>
    )
}

const VariableListItem = ({ variable, showStudySource=true, showDataSource=true, style={}, ...props }: VariableListItemProps) => {
    const { dataSources, highlightTokens, getStudyById } = useVariableView()!
    
    const [showMore, setShowMore] = useState<boolean>(false)
    
    const descriptionRef = useRef<HTMLSpanElement>(null)
    
    const displayShowMore = useMemo(() => variable.description.length > VARIABLE_DESCRIPTION_CUTOFF, [variable])

    const Highlighter = useCallback(({ ...props }) => (
        <_Highlighter autoEscape={ true } searchWords={ highlightTokens } {...props} />
    ), [highlightTokens])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                flexWrap: "nowrap",
                paddingRight: 16,
                ...style
            }}
            { ...props }
        >
            <span
                className="study-panel-header"
                style={{
                    flex: "auto",
                    display: "inline-flex",
                    alignItems: "center"
                }}
            >
                { showDataSource && (
                    <Tooltip title={ variable.data_source } placement="right" >
                        <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: dataSources[variable.data_source].color,
                            marginRight: 8
                        }} />
                    </Tooltip>
                ) }
                <Text>
                    <Highlighter textToHighlight={ variable.name } />
                    &nbsp;
                </Text>
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
            <span className={ classNames("variable-list-item-description" ) } ref={ descriptionRef }>
                <Highlighter textToHighlight={ displayShowMore && !showMore 
                    ? variable.description.slice(0, VARIABLE_DESCRIPTION_CUTOFF) + "..."
                    : variable.description
                } />
                { displayShowMore && (
                    <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, fontSize: 13, marginLeft: 8 }}
                        onClick={ () => setShowMore(!showMore) }
                    >
                        { showMore ? "Show less" : "Show more" }
                    </Button>
                ) }
            </span>
            { showStudySource && (
                <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12, color: "rgba(0, 0, 0, 0.45)" }}>
                    Source:&nbsp;<i>
                        <Highlighter textToHighlight={ variable.study_name } />
                    </i>&nbsp;
                    <StudyInfoTooltip study={ getStudyById(variable.study_id)! } />
                </span>
            ) }
        </div>
    )
}

export const VariableList = () => {
    const { query } = useHelxSearch() as ISearchContext
    const { filteredVariables, variablesSource, filteredStudies, studiesSource, collapseIntoVariables, isFiltered } = useVariableView()!
    
    const [currentPage, setCurrentPage] = useState<number>(1)

    const totalPages = useMemo(() => {
        const items = collapseIntoVariables ? filteredVariables : filteredStudies
        return Math.ceil(items.length / ITEMS_PER_PAGE)
    }, [filteredVariables, filteredStudies, collapseIntoVariables])

    const hasMore = useMemo(() => currentPage < totalPages, [currentPage, totalPages])

    const renderedVariables = useMemo(() => {
        return filteredVariables.slice(0, currentPage * ITEMS_PER_PAGE)
    }, [filteredVariables, currentPage])

    const renderedStudies = useMemo(() => {
        return filteredStudies.slice(0, currentPage * ITEMS_PER_PAGE)
    }, [filteredStudies, currentPage])

    const getNextPage = useCallback(() => {
        setCurrentPage((page) => page + 1)
    }, [])

    useEffect(() => {
        if (collapseIntoVariables) setCurrentPage(1)
    }, [filteredVariables, collapseIntoVariables])

    useEffect(() => {
        if (!collapseIntoVariables) setCurrentPage(1)
    }, [filteredStudies, collapseIntoVariables])
    

    return (
        <div className="variable-list">
            <Divider orientation="left" orientationMargin={ 0 } style={{
                fontSize: 15,
                marginTop: 24,
                marginBottom: 0
            }}>
                { collapseIntoVariables ? "Variables" : "Studies" }
            </Divider>
            { isFiltered && (
                <div style={{ marginTop: 6, marginBottom: -4 }}>
                    <Text type="secondary" style={{ fontSize: 14, fontStyle: "italic" }}>
                        {
                            collapseIntoVariables
                                ? `Showing ${ filteredVariables.length } of ${ variablesSource.length } variables`
                                : `Showing ${ filteredStudies.length } of ${ studiesSource.length } studies`
                        }
                    </Text>
                </div>
            ) }
            <div style={{ display: "flex", marginTop: 8, gap: 8 }}>
                <VariableListDataSources />
                <VariableFilterMenuButton />
            </div>
            <InfiniteScroll
                dataLength={ renderedVariables.length }
                next={ getNextPage }
                hasMore={ hasMore }
            >
                <Space direction="vertical" className="variables-collapse" style={{ marginTop: 8 }}>
                    { collapseIntoVariables ? renderedVariables.map((variable, i) => (
                        <VariableListItem key={ variable.id } variable={ variable } style={ i === 0 ? { marginTop: 4 } : {} } />
                    )) : renderedStudies.map((study) => (
                        <StudyListItem key={ study.c_id } study={ study } />
                    )) }
                    { (collapseIntoVariables ? renderedVariables.length === 0 : renderedStudies.length === 0) && (
                        <Empty description={
                            <Text type="secondary">No results were found matching your filters.</Text>
                        } />
                    ) }
                </Space>
            </InfiniteScroll>
            <BackTop />
        </div>
    )
}

export const VariableSearchResults = () => {
    const { variableResults } = useHelxSearch() as any
    const noResults = useMemo(() => variableResults.length === 0, [variableResults])
    return (
        <VariableViewProvider>
            <div style={{ flexGrow: 1, display: noResults ? "none" : undefined }}>
                <VariableViewHistogram />
                <VariableList />
            </div>
        </VariableViewProvider>
    )
}