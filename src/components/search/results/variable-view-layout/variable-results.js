import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Typography, Button, Space, Divider, Slider } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { Column } from '@ant-design/plots';
import { useHelxSearch } from '../../';
import {
    VariablesTableByStudy, variableHistogramConfigStatic,
    updateStudyResults, resetFilterPropertyToNone
} from './'
import { useDebounce, useDebouncedCallback } from 'use-debounce'
import './variable-results.css';

const { Text, Title } = Typography

const DebouncedRangeSlider = ({ value, onChange, debounce=500, ...props }) => {
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

    return (
        <Slider
            range
            value={ _internalValue }
            onChange={ internalOnChange }
            { ...props }
        />
    )
}

/** Component that handles display of Variable Results */
export const VariableSearchResults = () => {
    const { variableResults, variableStudyResults, totalVariableResults } = useHelxSearch()

    /** studyResultsForDisplay holds variables grouped by study for the studies table */
    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(variableStudyResults)

    const [page, setPage] = useState(0)
    /** filteredVariables holds the variables displayed in the histogram */
    const [_filteredVariables, _setFilteredVariables] = useState([variableResults])
    const filteredVariables = useMemo(() => _filteredVariables[page], [_filteredVariables, page])
    const setFilteredVariables = useCallback((value) => {
        const latestPage = _filteredVariables[_filteredVariables.length - 1]
        const latestPageVariableIds = latestPage.map((variable) => variable.id)
        if (
            value.length === latestPage.length &&
            value.every((variable) => latestPageVariableIds.includes(variable.id))
        ) return
        _filteredVariables.push(value)
        _setFilteredVariables(_filteredVariables)
        setPage(_filteredVariables.length - 1)
    }, [_filteredVariables])
    const overrideFilterHistory = useCallback((value) => {
        _setFilteredVariables([value])
        setPage(0)
    }, [])
    /** noResults indicates that the search yielded no variables. The layout should be hidden. */
    const noResults = useMemo(() => totalVariableResults === 0, [totalVariableResults])

    const scoreRange = useMemo(() => {
        const sorted = filteredVariables.sort((a, b) => a.score - b.score)
        if (sorted.length < 2) return undefined
        const minScore = sorted[0].score
        const maxScore = sorted[sorted.length - 1].score
        return [
            minScore,
            maxScore
        ]
    }, [filteredVariables])

    const avgValue = useMemo(() => {
        const avgValue = variableResults.reduce((acc, cur) => acc + cur.score, 0) / variableResults.length
        return avgValue
    }, [variableResults])
    
    /** useEffect added to address bug whereby displayed results were not updating when a new
     * search term was entered */
    useEffect(() => {
        setStudyResultsForDisplay(variableStudyResults);
        overrideFilterHistory(variableResults);
    }, [variableResults, variableStudyResults]);

    /** studyNamesForDisplay holds names of user selected studies to highlight in histogram */
    const [studyNamesForDisplay, setStudyNamesForDisplay] = useState([])

    const variablesHistogram = useRef()
    const variableHistogramConfig = useMemo(() => ({
        ...variableHistogramConfigStatic,
        data: filteredVariables
    }), [filteredVariables])

    const [filteredPercentileLower, filteredPercentileUpper] = useMemo(() => {
        const relativeMin = Math.min(...filteredVariables.map((result) => result.score))
        const relativeMax = Math.max(...filteredVariables.map((result) => result.score))
        return [
            (variableResults.filter((result) => result.score <= relativeMin).length / variableResults.length) * 100,
            (variableResults.filter((result) => result.score <= relativeMax).length / variableResults.length) * 100
        ]
    }, [variableResults, filteredVariables])

    /**
     * Triggered by the Start Over button.
     */
    const startOverHandler = () => {
        /** Restores the variables shown in the histogram back to the original inputs */
        overrideFilterHistory(variableResults)

        /** Restores the variables and studies in the Studies Table to original inputs */
        const studyResultsWithVariablesUpdated = resetFilterPropertyToNone(variableStudyResults)
        setStudyResultsForDisplay(studyResultsWithVariablesUpdated)


        /** Resets selected study names to none selected */
        setStudyNamesForDisplay([])

        let histogramObj = variablesHistogram.current.getChart()
        /** Removes 'active' state property, which allows bar highlighting when a study is selected */
        histogramObj.setState('active', () => true, false);
    }

    useEffect(() => {
        let histogramObj = variablesHistogram.current.getChart()
        /** Restores histogram data to refreshed value of filteredVariables, which is based on no filtering */
        histogramObj.update({ ...variableHistogramConfig, data: filteredVariables })
    }, [variableHistogramConfig, filteredVariables])

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
                setStudyResultsForDisplay(updatedStudyResults)
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
        const newFilteredVariables = variableResults.filter((variable) => (
            variable.score >= minScore && variable.score <= maxScore
        ))
        let updatedStudyResults = updateStudyResults(newFilteredVariables, studyResultsForDisplay);
        if (filteredVariables.length !== newFilteredVariables.length) {
            setStudyResultsForDisplay(updatedStudyResults)
            setFilteredVariables(newFilteredVariables)
        }
    }, [variableResults, filteredVariables, studyResultsForDisplay, scoreRange])

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

        /** If newStudyNamesForDisplay isn't empty:
        *       - Filter the variables by study,
        *       - Otherwise, collect all IDs to one Array */
        const variableIdsFilteredByStudy = newStudyNamesForDisplay.length > 0 ?
            variableResults.filter(_var => newStudyNamesForDisplay.includes(_var.study_name)).map(el => el.id) :
            []
            

        /** Use `variableIdsFilteredByStudy` to determine which variables need to have their
         * state set to 'active' */
        let histogramObj = variablesHistogram.current.getChart()
        if (variableIdsFilteredByStudy.length === 0) {
            /** If there are no filtered variables,
             *      Remove "active" from all places where it has been set */
            histogramObj.setState('active', () => true, false);
        } else {
            /** If a variable is in the filtered variables array, it should be tagged as 'active' in
             * the histogram object. */
            histogramObj.setState("active", (d) => variableIdsFilteredByStudy.includes(d.id));
            histogramObj.setState("active", (d) => !variableIdsFilteredByStudy.includes(d.id), false);
        }

        setStudyNamesForDisplay(newStudyNamesForDisplay);
    }

    return (
        <div style={{ flexGrow: 1, display: noResults ? "none" : undefined }}>
            {/* The results header has a bottom margin of 16, so the divider shouldn't have a top margin. */}
            <Divider orientation="left" orientationMargin={ 0 } style={{
                marginTop: 0,
                marginBottom: 16,
                fontSize: 18,
                fontWeight: 500
            }}>
                Variables according to DUG score
            </Divider>
            { filteredVariables.length < totalVariableResults && (
                <div style={{ marginTop: -8, marginBottom: 16 }}>
                    <Text type="secondary">
                        Viewing {filteredVariables.length} variables within the {Math.floor(filteredPercentileLower)}-{Math.floor(filteredPercentileUpper)} percentiles
                    </Text>
                </div>
            ) }
            <Space direction="vertical" size="middle">
                <Column
                    {...variableHistogramConfig}
                    style={{ padding: "0px 0" }}
                    ref={variablesHistogram}
                />
                <div style={{ display: "flex" }}>
                    <Button onClick={ startOverHandler }>
                        Start Over
                    </Button>
                    <Button onClick={ () => setPage(page - 1) } disabled={ page === 0 } style={{ marginLeft: 4 }}>
                        <ArrowLeftOutlined />
                    </Button>
                    <Button onClick={ () => setPage(page + 1) } disabled={ page === _filteredVariables.length - 1 } style={{ marginLeft: 4 }}>
                        <ArrowRightOutlined />
                    </Button>
                    <DebouncedRangeSlider
                        value={ scoreRange }
                        onChange={ onScoreSliderChange }
                        min={ Math.min(...variableResults.map((result) => result.score)) }
                        max={ Math.max(...variableResults.map((result) => result.score)) }
                        step={ null }
                        marks={ variableResults.reduce((acc, cur) => {
                            acc[cur.score] = {
                                label: cur.score,
                                style: { display: "none" }
                            }
                            return acc
                        }, {}) }
                        style={{ marginLeft: 24, flexGrow: 1 }}
                    />
                </div>
            </Space>
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
                    <VariablesTableByStudy
                        studyResultsForDisplay={studyResultsForDisplay}
                        studyNamesForDisplay={studyNamesForDisplay}
                        toggleStudyHighlightingInHistogram={toggleStudyHighlightingInHistogram}/>
                </div>
            </Space>
        </div>
    )
}