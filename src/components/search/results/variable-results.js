import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Column } from '@ant-design/plots';
import { useHelxSearch } from '..';
import { Collapse, List, Typography, Button, Switch } from 'antd'
import { Link } from '../../link'

import './variable-results.css';

const { Text } = Typography
const { Panel } = Collapse

export const VariableSearchResults = () => {
    const { variableResults, variableStudyResults } = useHelxSearch()

    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(variableStudyResults)

    const variablesHistogram = useRef()
    const studiesHistogram = useRef()

    const studyDataForHistogram = variableStudyResults.map(study => {
        let studyDetails = {
            "studyName": study.c_name,
            "variableCount": study.elements.length
        }
        return studyDetails;
    })

    // Initial config for the variables histogram
    const variableHistogramConfig = {
        data: filteredVariables,
        xField: 'id',
        yField: 'score',
        xAxis: {
            label: ""
        },
        brush: {
            enabled: true,
            type: 'x-rect',
        },
        tooltip: {
            showTitle: false,
            fields: ['name', 'id', 'description', 'study_name', 'score'],
        },
        // The following is NOT actually altering the styles as desired
        // Examples that inspired the code below for styles came from https://antv-g2plot-v1.gitee.io/en/examples/general/state
        active: {
            color: "pink",
            fillStyle: "pink",
            fillOpacity: 0.8,
            stroke: 'pink',
            lineWidth: 4
        }
    }

    const studiesHistogramConfig = {
        data: studyDataForHistogram,
        xField: 'studyName',
        yField: 'variableCount',
        yAxis: {
            title: {text: "Variable Count"}
        },
        xAxis: {
            label: ""
        },
        tooltip: {
            showTitle: false,
            fields: ['studyName', 'variableCount']
        },
        height: 100
    }

    function removeWithinFilterClass() {
        const variableStudyResultsUpdated = []
        variableStudyResults.forEach(study => {
            const updatedStudy = Object.assign({}, study);
            const updatedVariables = []
            study.elements.forEach(variable => {
                variable.withinFilter = "none"
                updatedVariables.push(variable)
            })
            updatedStudy["elements"] = updatedVariables
            variableStudyResultsUpdated.push(updatedStudy)
        })

        return variableStudyResultsUpdated;
    }

    const startOverHandler = () => {
        setFilteredVariables(variableResults)

        const variableStudyResultsUpdated = removeWithinFilterClass()
        setStudyResultsForDisplay(variableStudyResultsUpdated)
    }

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

    useEffect(() => {
        let histogramObj = variablesHistogram.current.getChart()

        histogramObj.on('mouseup', (e) => {
            let filteredVariables = e.view.filteredData

            updateStudyResults(filteredVariables)
            setFilteredVariables(filteredVariables)
        })
    })

    useEffect(() => {
        let histogramObj = variablesHistogram.current.getChart()
        histogramObj.update({ ...variableHistogramConfig, data: filteredVariables })
    }, [filteredVariables])

    useEffect(() => {
        let studiesHistogramObj = studiesHistogram.current.getChart()

        studiesHistogramObj.on('plot:click', (e) => {
            const studyName = e.data.data.studyName

            const variablesFilteredByStudy = variableResults.filter(variable => variable.study_name === studyName).map(el => el.id);

            // Examples that suggested how to setState to 'active' came from https://g2plot.antv.vision/en/examples/dynamic-plots/brush#advanced-brush2
            // Style parameters below do nothing. Examples that inspired the code for styles came from https://antv-g2plot-v1.gitee.io/en/examples/general/state
            let histogramObj = variablesHistogram.current.getChart()
            histogramObj.setState("active", (datum) => variablesFilteredByStudy.includes(datum.id), { stroke: 'pink', lineWidth: 2 });
            histogramObj.setState("active", (datum) => !variablesFilteredByStudy.includes(datum.id), false);
        })
    })

    function selectVariablesByStudy(studyName) {
        return function(bool, e) {
            e.stopPropagation()
            console.log(e)
            console.log(bool)
            console.log(studyName)

            const variablesFilteredByStudy = variableResults.filter(variable => variable.study_name === studyName)
            setFilteredVariables(variablesFilteredByStudy)
        } 
    }

    const VariablesTableByStudy = useMemo(() => (
        <Collapse ghost className="variables-collapse">
            {
                studyResultsForDisplay.map((study, i) => {
                    return (
                        <Panel
                            key={`panel_${study.c_name}`}
                            header={
                            <Text>
                                {study.c_name}{` `}
                                (<Link to={study.c_link}>{study.c_id}</Link>)
                            </Text>
                            }
                            extra={
                                [<Switch size="small" onChange={selectVariablesByStudy(study.c_name)}>Select Variables From This Study</Switch>,
                                <Text>{study.elements.length} variable{study.elements.length === 1 ? '' : 's'}</Text>]
                            }
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
    ), [studyResultsForDisplay] )

    return (
        <div>
            <Button className="histogram-startover-btn" onClick={startOverHandler}>Start Over</Button>
            <Column
                {...variableHistogramConfig}
                ref={variablesHistogram}
            />
            <Column
                {...studiesHistogramConfig}
                ref={studiesHistogram}
            />
            <div>Filtered Variables Count: {filteredVariables.length}</div>
            <div className='list'>{ VariablesTableByStudy }</div>
        </div>
    )
}