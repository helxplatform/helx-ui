import React, { useEffect, useState, useRef, useMemo, useCallback, Fragment } from 'react'
import { Typography, Button, Space, Divider, Slider, Tooltip, Collapse, Tag } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined, InfoCircleFilled } from '@ant-design/icons'
import { generate, presetPalettes, red, volcano, orange, gold, yellow, green, cyan, blue, geekblue, purple, magenta } from '@ant-design/colors'
import { Column } from '@ant-design/plots';
import chroma from 'chroma-js'
import { useDebounce, useDebouncedCallback } from 'use-debounce'
import { useHelxSearch } from '../../';
import {
    VariablesTableByStudy, variableHistogramConfigStatic,
    updateStudyResults, resetFilterPropertyToNone
} from './'
import { InfoTooltip } from '../../../';
import { Palette, PastelPalette } from '../../../../utils'
import './variable-results.css';
import { useAnalytics } from '../../../../contexts';
import { P } from '@antv/g2plot';

const { Text, Title } = Typography
const { Panel } = Collapse
const { CheckableTag } = Tag

// Between 0-9
const COLOR_INTENSITY = 4
const GRADIENT_CONSTITUENTS = [
    gold[COLOR_INTENSITY], orange[COLOR_INTENSITY], volcano[COLOR_INTENSITY], red[COLOR_INTENSITY]
]
// const GRADIENT_CONSTITUENTS = [
//     cyan[COLOR_INTENSITY], blue[COLOR_INTENSITY], geekblue[COLOR_INTENSITY]
// ]
const COLOR_GRADIENT = chroma.scale(GRADIENT_CONSTITUENTS).mode("lrgb")

// Determines the order in which data sources appear in the tag list.
const DATA_SOURCES_ORDER = [
    "HEAL Studies",
    "HEAL Research Programs",
    "CDE",
    "Non-HEAL Studies",
    "dbGaP",
    "AnVIL",
    "Cancer Data Commons",
    "Kids First"
].map((x) => x.toLowerCase())

export const DebouncedRangeSlider = ({ value, onChange, onInternalChange=() => {}, debounce=500, ...props }) => {
    const [_internalValue, setInternalValue] = useState(undefined)
    const [internalValue] = useDebounce(_internalValue, debounce)

    const internalOnChange = (range) => {
        setInternalValue(range)
    }

    useEffect(() => {
        setInternalValue(value)
    }, [value])

    useEffect(() => {
        onChange(internalValue)
    }, [internalValue])

    useEffect(() => {
        onInternalChange(_internalValue)
    }, [_internalValue])

    return (
        <Slider
            range
            value={ _internalValue }
            onChange={ internalOnChange }
            { ...props }
        />
    )
}

const HistogramLegendItem = ({ id, name: _name, description: _description, marker: _marker }) => {
    if (typeof _marker === "string") _marker = { path: _marker }
    const { path, style: markerStyle={} } = _marker
    if (typeof _name === "string") _name = { name: _name }
    const { name, style: nameStyle } = _name
    if (typeof _description === "string") _description = { description: _description }
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
export const HistogramLegend = ({ title: _title, items, style, ...props }) =>  {
    if (typeof _title === "string") _title = { title: _title }
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

/** Component that handles display of Variable Results */
export const VariableSearchResults = () => {
    const { query, variableResults, variableStudyResults, totalVariableResults } = useHelxSearch()

    const normalizedResults = useMemo(() => {
        const values = variableResults.map(result => result['score']);
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (min === max) {
            // If all values are the same, avoid division by zero and set them all to 1 (or 0)
            return variableResults.map(result => ({ ...result, ['score']: 100 }));
         }
         return variableResults.map(result => ({
            ...result,
            ['score']: ((result['score'] - min) / (max - min))*100
        }));
    }, [variableResults])

    const { analyticsEvents } = useAnalytics()

    const [collapseHistogram, setCollapseHistogram] = useState(false)
    const [page, setPage] = useState(0)
    /** filteredVariables holds the variables displayed in the histogram */
    const [_filteredVariables, _setFilteredVariables] = useState([normalizedResults])
    const filteredVariables = useMemo(() => _filteredVariables[page], [_filteredVariables, page])
    const setFilteredVariables = useCallback((value) => {
        const currentPage = _filteredVariables[page]
        const currentPageVariableIds = currentPage.map((variable) => variable.id)
        // If it's a duplicate of the current value, don't add it again.
        if (
            value.length === currentPage.length &&
            value.every((variable) => currentPageVariableIds.includes(variable.id))
        ) return
        // _filteredVariables.push(value)
        const newValue = [..._filteredVariables.slice(0, page + 1), value]
        _setFilteredVariables(newValue)
        setPage(newValue.length - 1)
    }, [_filteredVariables, page])
    const overrideFilterHistory = useCallback((value) => {
        _setFilteredVariables([value])
        setPage(0)
    }, [])

    /** noResults indicates that the search yielded no variables. The layout should be hidden. */
    const noResults = useMemo(() => totalVariableResults === 0, [totalVariableResults])

    const studySources = useMemo(() => {
        const palette = new Palette(chroma.rgb(255 * .75, 255 * .25, 255 * .25), {mode: 'hex'})
        return variableStudyResults
            .reduce((acc, cur) => {
                const dataSource = cur.data_source
                if (!acc.hasOwnProperty(dataSource)) acc[dataSource] = {
                    count: 1,
                    color: palette.getNextColor()
                }
                else acc[dataSource].count += 1
                return acc
            }, {})
    }, [variableStudyResults])

    const hiddenDataSources = useMemo(() => {
        const allDataSources = Object.keys(studySources)
        const activeDataSources = filteredVariables.reduce((acc, cur) => {
            if (!acc.includes(cur.data_source)) acc.push(cur.data_source)
            return acc
        }, [])
        return allDataSources.filter((dataSource) => !activeDataSources.includes(dataSource))
    }, [filteredVariables, studySources])

    const absScoreRange = useMemo(() => {
        // if (variableResults.length < 2) return undefined
        return [
            Math.min(...normalizedResults.map((result) => result.score)),
            Math.max(...normalizedResults.map((result) => result.score))   
        ]
    }, [normalizedResults])
    const scoreRange = useMemo(() => {
        // if (filteredVariables.length < 2) return undefined
        return [
            Math.min(...filteredVariables.map((result) => result.score)),
            Math.max(...filteredVariables.map((result) => result.score))
        ]
    }, [filteredVariables])
    
    const studyResultsForDisplay = useMemo(() => {
        const filteredIds = filteredVariables.map((result) => result.id)
        return variableStudyResults.filter((study) => study.elements.some((variable) => filteredIds.includes(variable.id)))
    }, [filteredVariables, variableStudyResults])
    
    /** useEffect added to address bug whereby displayed results were not updating when a new
     * search term was entered */
    useEffect(() => {
        // Basically, just reset the filteredVariables history back to new.
        overrideFilterHistory(normalizedResults);
    }, [normalizedResults, variableStudyResults]);

    /** studyNamesForDisplay holds names of user selected studies to highlight in histogram */
    const [studyNamesForDisplay, setStudyNamesForDisplay] = useState([])

    const variablesHistogram = useRef()
    const variableHistogramConfig = useMemo(() => {
        const [minScore, maxScore] = absScoreRange
        return {
            ...variableHistogramConfigStatic,
            data: [...filteredVariables].sort((a, b) => a.score - b.score),
            color: ({ id }) => {
                const { score } = filteredVariables.find((result) => result.id === id)
                const absRatio = (score - minScore) / (maxScore - minScore)
                // const continuousRatio = ([...variableResults].sort((a, b) => a.score - b.score).findIndex((result) => result.id === id) + 1) / variableResults.length
                /**
                 * `continuousRatio` will create a continuous gradient across the histogram. This doesn't really indicate anything though, just looks pretty.
                 * `absRatio` is the norm of score between [minScore, maxScore] and will color the histogram against a gradient according to individual scores.
                 */
                return COLOR_GRADIENT(absRatio).toString()
            },
        }
    }, [filteredVariables, normalizedResults, absScoreRange])

    const [filteredPercentileLower, filteredPercentileUpper] = useMemo(() => {
        const relativeMin = Math.min(...filteredVariables.map((result) => result.score))
        const relativeMax = Math.max(...filteredVariables.map((result) => result.score))
        return [
            (normalizedResults.filter((result) => result.score <= relativeMin).length / normalizedResults.length) * 100,
            (normalizedResults.filter((result) => result.score <= relativeMax).length / normalizedResults.length) * 100
        ]
    }, [normalizedResults, filteredVariables])

    /**
     * Triggered by the Start Over button.
     */
    const startOverHandler = () => {
        analyticsEvents.variableViewStartOverPressed(query)
        /** Restores the variables shown in the histogram back to the original inputs */
        overrideFilterHistory(normalizedResults)

        /** Resets selected study names to none selected */
        setStudyNamesForDisplay([])

        let histogramObj = variablesHistogram.current.getChart()
        /** Removes 'active' state property, which allows bar highlighting when a study is selected */
        histogramObj.setState('active', () => true, false);
    }

    useEffect(() => {
        let histogramObj = variablesHistogram.current.getChart()
        /** Restores histogram data to refreshed value of filteredVariables, which is based on no filtering */
        histogramObj.update({ ...variableHistogramConfig, data: [...filteredVariables].sort((a, b) => a.score - b.score) })
    }, [variableHistogramConfig, filteredVariables])

    /** Update the highlighted variables whenever highlighted studies change or filtered variables change */
    useEffect(() => {
        const histogramObj = variablesHistogram.current.getChart()
        const variableIdsFilteredByStudy = studyNamesForDisplay.length > 0 ? (
            filteredVariables.filter(_var => studyNamesForDisplay.includes(_var.study_name)).map(el => el.id)
        ) : []
        histogramObj.setState("active", (d) => variableIdsFilteredByStudy.includes(d.id))
        histogramObj.setState("active", (d) => !variableIdsFilteredByStudy.includes(d.id), false)
    }, [studyNamesForDisplay, filteredVariables])

    /**
     * Whenever the brush filter is used, the value of filtered Variables &
     * studyResults gets updated based on the filteredData in the histogram
     */
    useEffect(() => {
        let histogramObj = variablesHistogram.current.getChart()
        const handle = (e) => {
            let newFilteredVariables = e.view.filteredData
            let updatedStudyResults = updateStudyResults(newFilteredVariables, studyResultsForDisplay);
            if (newFilteredVariables.length !== filteredVariables.length) {
                setFilteredVariables(newFilteredVariables)
            }
        }
        histogramObj.on('mouseup', handle)
        return () => {
            // Remove the click handler when the effect demounts.
            histogramObj.off('mouseup', handle)
        }
    }, [studyResultsForDisplay, filteredVariables])

    const onScoreSliderChange = useCallback((score) => {
        if (score === undefined || (score[0] === scoreRange[0] && score[1] === scoreRange[1])) return
        const [minScore, maxScore] = score
        const histogramObj = variablesHistogram.current.getChart()
        const newFilteredVariables = normalizedResults.filter((variable) => (
            variable.score >= minScore && variable.score <= maxScore
        ))
        let updatedStudyResults = updateStudyResults(newFilteredVariables, studyResultsForDisplay);
        if (filteredVariables.length !== newFilteredVariables.length) {
            setFilteredVariables(newFilteredVariables)
        }
    }, [normalizedResults, filteredVariables, studyResultsForDisplay, scoreRange])

    const onDataSourceChange = useCallback((dataSource, hidden) => {
        const histogramObj = variablesHistogram.current.getChart()
        const newHiddenDataSources = hidden
            ? [...hiddenDataSources, dataSource]
            : hiddenDataSources.filter((source) => source !== dataSource)
        const newFilteredVariables = normalizedResults.filter((variable) => (
            !newHiddenDataSources.includes(variable.data_source)
        ))
        let updatedStudyResults = updateStudyResults(newFilteredVariables, studyResultsForDisplay);
        if (filteredVariables.length !== newFilteredVariables.length) {
            setFilteredVariables(newFilteredVariables)
        }
    }, [hiddenDataSources, normalizedResults, filteredVariables, studyResultsForDisplay])

    /**
     * Takes a studyName, selected by the user in the studies table & updates data going to
     * the histogram, to toggle highlighting of variables from the selected study.
     * 
     * Outcome:
     *  - Updates variable highlighting in histogram based on selected studies
     *  - Updates the contents of studyNamesForDisplay
     */
    function toggleStudyHighlightingInHistogram(studyName) {
        /** Check in studyName is in the array of studyNamesForDisplay, then either add or
         * remove the study.
        */
        let idx = studyNamesForDisplay.indexOf(studyName)
        let newStudyNamesForDisplay = [...studyNamesForDisplay]
        if (idx > -1) {
            newStudyNamesForDisplay.splice(idx, 1)
        } else {
            newStudyNamesForDisplay = [...newStudyNamesForDisplay, studyName]
        }
        setStudyNamesForDisplay(newStudyNamesForDisplay);
    }

    return (
        <div style={{ flexGrow: 1, display: noResults ? "none" : undefined }}>
            <Collapse
                ghost
                activeKey={!collapseHistogram ? ["variableViewHistogramPanel"] : []}
                onChange={ () => {
                    const isCollapsed = !collapseHistogram
                    analyticsEvents.variableViewHistogramToggled(query, !isCollapsed)
                    setCollapseHistogram(isCollapsed)
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
                            Viewing {filteredVariables.length} variables within the {Math.floor(filteredPercentileLower)}-{Math.floor(filteredPercentileUpper)} percentiles
                        </Text>
                    </div>
                ) }
                <Space direction="vertical" size="middle">
                    <div style={{ display: "flex" }}>
                        <div style={{ flexGrow: 1, width: 0 }}>
                            <Column
                                {...variableHistogramConfig}
                                style={{ padding: 0 }}
                                ref={variablesHistogram}
                            />
                            <DebouncedRangeSlider
                                value={ scoreRange }
                                onChange={ onScoreSliderChange }
                                min={ Math.min(...normalizedResults.map((result) => result.score)) }
                                max={ Math.max(...normalizedResults.map((result) => result.score)) }
                                step={ null }
                                marks={ normalizedResults.reduce((acc, cur) => {
                                    acc[cur.score] = {
                                        label: cur.score,
                                        style: {
                                            display: "none"
                                        }
                                    }
                                    return acc
                                }, {}) }
                                // Margin to align with the histogram
                                style={{ marginRight: 0, marginBottom: 4, marginTop: 16, flexGrow: 1 }}
                                className="histogram-slider"
                            />
                        </div>
                        <HistogramLegend
                            title="Score Legend"
                            items={ GRADIENT_CONSTITUENTS.map((color, i) => {
                                const [minScore, maxScore] = absScoreRange
                                const startRatio = Math.round(i / GRADIENT_CONSTITUENTS.length * 100) / 100
                                const endRatio = Math.round((i + 1) / GRADIENT_CONSTITUENTS.length * 100) / 100
                                const startScore = (startRatio * maxScore) - (startRatio * minScore) + minScore
                                const endScore = (endRatio * maxScore) - (endRatio   * minScore) + minScore
                                const count = normalizedResults.filter((result) => result.score >= startScore && result.score <= endScore).length
                                const filteredCount = filteredVariables.filter((result) => result.score >= startScore && result.score <= endScore).length
                                return {
                                    id: color,
                                    name: {
                                        //name: `${ startRatio === 0 ? Math.floor(startScore) : Math.ceil(startScore) } - ${ endRatio === 1 ? Math.ceil(endScore) : Math.floor(endScore) }`,
                                        name: `${startRatio*100} - ${endRatio*100}`,
                                        style: filteredCount === 0 ? { color: "rgba(0, 0, 0, 0.25)" } : undefined
                                    },
                                    description: {
                                        description: filteredCount < count ? `(${ filteredCount } / ${ count } variables)` : `(${ count } variables)`,
                                        style: filteredCount === 0 ? { color: "rgba(0, 0, 0, 0.25)" } : undefined
                                    },
                                    marker: {
                                        path: (w, h) => {
                                            const x = 0
                                            const y = 0
                                            return `M ${ x },${ y } L ${ x + w }, ${ y } L ${ x + w }, ${ y + h } L ${ x }, ${ y + h } L ${ x },${ y } Z`
                                        },
                                        // path: [["M", x - x_r, y - y_r], ["L", x + x_r, y - y_r], ["L", x + x_r, y + y_r], ["L", x - x_r, y + y_r], ["Z"]],
                                        style: {
                                            fill: filteredCount > 0 ? color : "rgba(0, 0, 0, 0.15)"
                                        }
                                    }
                                }
                            }) }
                            style={{ marginLeft: 24, marginRight: 8, flexShrink: 0 }}
                        />
                    </div>
                    <div style={{ display: "flex" }}>
                        <Tooltip title="Reset zoom/push-pins">
                            <Button onClick={ startOverHandler }>
                                Start Over
                            </Button>
                        </Tooltip>
                        <Tooltip title="Undo zoom">
                        <Button onClick={ () => {
                            setPage(page - 1)
                            analyticsEvents.variableViewHistoryBackwardsPressed(query)
                        } } disabled={ page === 0 } style={{ marginLeft: 4 }}>
                            <ArrowLeftOutlined />
                        </Button>
                        </Tooltip>
                        <Tooltip title="Redo zoom">
                            <Button onClick={ () => {
                                setPage(page + 1)
                                analyticsEvents.variableViewHistoryForwardsPressed(query)
                            } } disabled={ page === _filteredVariables.length - 1 } style={{ marginLeft: 4 }}>
                                <ArrowRightOutlined />
                            </Button>
                        </Tooltip>
                    </div>
                </Space>
            </Panel>
            </Collapse>
            <Divider orientation="left" orientationMargin={ 0 } style={{ fontSize: 15, marginTop: 24, marginBottom: 0 }}>Studies</Divider>
            { studyResultsForDisplay.length < variableStudyResults.length && (
                <div style={{ marginTop: 6, marginBottom: -4 }}>
                    <Text type="secondary" style={{ fontSize: 14, fontStyle: "italic" }}>
                        Showing { studyResultsForDisplay.length } of { variableStudyResults.length } studies
                    </Text>
                </div>
            ) }
            <Space direction="vertical" style={{ marginTop: 8 }}>
                <div className='list'>
                    <Space direction="horizontal" size={ 0 } style={{ marginTop: 8, marginBottom: 4 }}>
                        {
                            Object.keys(studySources)
                                .sort((a, b) => {
                                    let aIndex = DATA_SOURCES_ORDER.indexOf(a.toLowerCase())
                                    let bIndex = DATA_SOURCES_ORDER.indexOf(b.toLowerCase())
                                    // Sort unrecognized data sources alphabetically.
                                    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
                                    // Put unrecognized data sources at the end of the array.
                                    if (aIndex === -1) return 1
                                    if (bIndex === -1) return -1
                                    return aIndex - bIndex
                                }).map((dataSource) => (
                                    <Tag
                                        key={ `variable-view-data-source-tag-${ dataSource }` }
                                        style={{ fontSize: 13 }}
                                        color={ studySources[dataSource].color }
                                        // style={ {
                                        //     fontSize: 13,
                                        //     ...(hiddenDataSources.includes(dataSource) ? { border: "1px solid #d9d9d9", background: "#fafafa" } : {})
                                        // } }
                                        // checked={ !hiddenDataSources.includes(dataSource) }
                                        // onChange={ (checked) => onDataSourceChange(dataSource, !checked) }
                                    >
                                        { `${ dataSource } (${ studySources[dataSource].count })` }
                                    </Tag>
                            ))
                        }
                    </Space>
                    <VariablesTableByStudy
                        studyResultsForDisplay={studyResultsForDisplay}
                        studyNamesForDisplay={studyNamesForDisplay}
                        filteredVariables={filteredVariables}
                        studyDataSources={ studySources }
                        toggleStudyHighlightingInHistogram={toggleStudyHighlightingInHistogram}/>
                </div>
            </Space>
        </div>
    )
}