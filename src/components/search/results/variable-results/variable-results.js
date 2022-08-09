import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Typography, Button, Space, Divider } from 'antd'
import { Column } from '@ant-design/plots';

import { useHelxSearch } from '../../';
import {
    VariablesTableByStudy, variableHistogramConfigStatic,
    updateStudyResults, resetFilterPropertyToNone
} from '.'
import './variable-results.css';

const { Text } = Typography

/** Component that handles display of Variable Results */
export const VariableSearchResults = () => {
    const { variableResults, variableStudyResults } = useHelxSearch()

    /** studyResultsForDisplay holds variables grouped by study for the studies table */
    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(variableStudyResults)

    /** filteredVariables holds the variables displayed in the histogram */
    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    
    /** useEffect added to address bug whereby displayed results were not updating when a new
     * search term was entered */
    useEffect(() => {
        setStudyResultsForDisplay(variableStudyResults);
        setFilteredVariables(variableResults);
    }, [variableResults, variableStudyResults]);

    /** studyNamesForDisplay holds names of user selected studies to highlight in histogram */
    const [studyNamesForDisplay, setStudyNamesForDisplay] = useState([])

    const variablesHistogram = useRef()
    const variableHistogramConfig = useMemo(() => (
        Object.assign(variableHistogramConfigStatic, { data: filteredVariables})
    ), [filteredVariables])

    /**
     * Triggered by the Start Over button.
     */
    const startOverHandler = () => {
        /** Restores the variables shown in the histogram back to the original inputs */
        setFilteredVariables(variableResults)

        /** Restores the variables and studies in the Studies Table to original inputs */
        const studyResultsWithVariablesUpdated = resetFilterPropertyToNone(variableStudyResults)
        setStudyResultsForDisplay(studyResultsWithVariablesUpdated)


        /** Resets selected study names to none selected */
        setStudyNamesForDisplay([])

        let histogramObj = variablesHistogram.current.getChart()
        /** Removes 'active' state property, which allows bar highlighting when a study is selected */
        histogramObj.setState('active', () => true, false);
        /** Restores histogram data to refreshed value of filteredVariables, which is based on no filtering */
        histogramObj.update({ ...variableHistogramConfig, data: filteredVariables })
    }

    /**
     * Whenever the brush filter is used, the value of filtered Variables &
     * studyResults gets updated based on the filteredData in the histogram
     */
    useEffect(() => {
        let histogramObj = variablesHistogram.current.getChart()

        histogramObj.on('mouseup', (e) => {
            let filteredVariables = e.view.filteredData

            let updatedStudyResults = updateStudyResults(filteredVariables, studyResultsForDisplay);
            setStudyResultsForDisplay(updatedStudyResults)
            setFilteredVariables(filteredVariables)
        })
    })

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
        <div>
            <Space direction="vertical" size="middle">
                <div>Variables according to DUG Score</div>
                <Column
                    {...variableHistogramConfig}
                    ref={variablesHistogram}
                />
                <div>Filtered Variables Count: {filteredVariables.length}</div>
                <Button onClick={startOverHandler}>Start Over</Button>
            </Space>
            <Divider style={{ margin: "12px 0" }} />
            <Space direction="vertical">
                <Text level={5}>Studies holding Variables shown above in Histogram</Text>
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