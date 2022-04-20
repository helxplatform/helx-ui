import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Column } from '@ant-design/plots';
import { Collapse, List, Typography, Button, Space } from 'antd'
import {
    PushpinOutlined as UnselectedIcon,
    PushpinFilled as SelectedIcon,
} from '@ant-design/icons'
import { useHelxSearch } from '..';
import './variable-results.css';

const { Text } = Typography
const { Panel } = Collapse

/** Component that handles display of Variable Results */
export const VariableSearchResults = () => {
    const { variableResults, variableStudyResults } = useHelxSearch()
    // console.log(variableStudyResults.length)

    /** studyResultsForDisplay holds variables grouped by study for the studies table */
    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(variableStudyResults)
    // console.log(studyResultsForDisplay.length)

    /** filteredVariables holds the variables displayed in the histogram */
    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    
    /** useEffect added to address bug whereby displayed results were not updating when a new
     * search term was entered */
    useEffect(() => {
        setStudyResultsForDisplay(variableStudyResults);
        setFilteredVariables(variableResults);
    }, [variableResults, variableStudyResults]);
    // console.log(studyResultsForDisplay.length)

    /** studyNamesForDisplay holds names of user selected studies to highlight in histogram */
    const [studyNamesForDisplay, setStudyNamesForDisplay] = useState([])

    const variablesHistogram = useRef()
    const variableHistogramConfig = useMemo(() => ({
        data: filteredVariables,
        xField: 'id',
        yField: 'score',
        xAxis: {
            label: ""
        },
        animation: {
            appear: {
                duration: 800,
                delay: 100
            }
        },
        brush: {
            enabled: true,
            type: 'x-rect',
        },
        tooltip: {
            showTitle: false,
            fields: ['name', 'id', 'description', 'study_name', 'score'],
        },
        state: {
            active: {
                style: {
                    lineWidth: 0,
                    fill: '#3CCEA0',
                    strokeStyle: "#3CCEA0",
                    fillOpacity: 1,
                },
            },
        }
    }), [filteredVariables])

    /**
     * Helper function called from startOverHandler().
     *
     * The withinFilter property on each variable determines how the variable row is
     * displayed within the Studies table when the histogram brush filter/zoom function
     * is active.
     *
     * This function resets the  the withinFilter property back to none so styles are
     * dropped.
     */
    function resetFilterPropertyToNone() {
        return variableStudyResults.map(study => {
            const updatedStudy = Object.assign({}, study);
            const updatedVariables = []
            study.elements.forEach(variable => {
                variable.withinFilter = "none"
                updatedVariables.push(variable)
            })
            updatedStudy["elements"] = updatedVariables

            return updatedStudy;
        })
    }


    /**
     * Triggered by the Start Over button.
     */
    const startOverHandler = () => {
        /** Restores the variables shown in the histogram back to the original inputs */
        setFilteredVariables(variableResults)

        /** Restores the variables and studies in the Studies Table to original inputs */
        const studyResultsWithVariablesUpdated = resetFilterPropertyToNone()
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
     * Called whenever the brush effect is used to zoom in on histogram
     */
    function updateStudyResults(filtered_variables) {
        // Determine the studies that should be displayed in table
        const studiesInFilter = [...new Set(filtered_variables.map(obj => obj.study_name))]
        const studyResultsFiltered = studyResultsForDisplay.filter(obj => {
            return studiesInFilter.includes(obj.c_name)
        })

        // Update how variables are displayed under studies depending on whether they were filtered within the histogram
        const indicesForFilteredVariables = filtered_variables.map(obj => obj.indexPos)
        const studyResultsWithVariablesUpdated = []
        const filteredVarsInStudies = []
        studyResultsFiltered.forEach(study => {
            const updatedStudy = Object.assign({}, study);
            const updatedVariables = []
            study.elements.forEach(variable => {
                const indexForVariableInStudy = variable.indexPos;
                const studyVarInFilteredVars = indicesForFilteredVariables.includes(indexForVariableInStudy)

                if (studyVarInFilteredVars) {
                    filteredVarsInStudies.push(indexForVariableInStudy)
                    variable.withinFilter = true
                } else {
                    variable.withinFilter = false
                }
                updatedVariables.push(variable)
            })
            updatedStudy["elements"] = updatedVariables
            studyResultsWithVariablesUpdated.push(updatedStudy)
        })

        setStudyResultsForDisplay(studyResultsWithVariablesUpdated)
    }

    /**
     * Whenever the brush filter is used, the value of filtered Variables &
     * studyResults gets updated based on the filteredData in the histogram
     */
    useEffect(() => {
        let histogramObj = variablesHistogram.current.getChart()

        histogramObj.on('mouseup', (e) => {
            let filteredVariables = e.view.filteredData

            updateStudyResults(filteredVariables)
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
        return function(e) {
            e.stopPropagation()

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
    }

    const VariablesTableByStudy = useMemo(() => (
        <Collapse ghost className="variables-collapse">
            {
                studyResultsForDisplay.map((study, i) => {
                    return (
                        <Panel
                            key={`panel_${study.c_name}_${i}`}
                            className={ [
                                'study-panel ',
                                studyNamesForDisplay.includes(study.c_name) ? 'selected' : 'unselected',
                            ] }
                            header={
                                <span className="study-panel-header">
                                    <Text>{study.c_name}{` `}</Text>
                                    <Button
                                      type="link"
                                      className="study-selection-button"
                                      onClick={ toggleStudyHighlightingInHistogram(study.c_name) }
                                    >
                                      {
                                        studyNamesForDisplay.includes(study.c_name)
                                            ? <SelectedIcon />
                                            : <UnselectedIcon />
                                      }
                                    </Button> 
                                </span>
                            }
                            extra={ [
                                <Text key={`text_${study.c_name}_${i}`}
                                >{study.elements.length} variable{study.elements.length === 1 ? '' : 's'}</Text>,
                            ] }
                        >
                            <List
                                className="study-variables-list"
                                dataSource={study.elements}
                                renderItem={variable => (
                                    <div className={`study-variables-list-item within-filter-${variable.withinFilter}`}>
                                        <Text className="variable-name">
                                            {variable.name} &nbsp;
                                            ({variable.e_link ? <a href={variable.e_link}>{variable.id}</a> : variable.id})
                                        </Text><br />
                                        <Text className="variable-description"> {variable.description}</Text>
                                    </div>
                                )}
                            />
                        </Panel>
                    )
                })
            }
        </Collapse>
    ), [studyNamesForDisplay, studyResultsForDisplay])

    return (
        <div>
            <Button className="histogram-startover-btn" onClick={startOverHandler}>Start Over</Button>
            <Space direction="vertical">
                <div>Variables according to DUG Score</div>
                <Column
                    {...variableHistogramConfig}
                    ref={variablesHistogram}
                />
                <div>Filtered Variables Count: {filteredVariables.length}</div>
            </Space>
            <div className='list'>{VariablesTableByStudy}</div>
        </div>
    )
}