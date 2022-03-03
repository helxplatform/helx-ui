import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Column } from '@ant-design/plots';
import { useHelxSearch } from '..';
import { Collapse, List, Typography, Button } from 'antd'
import { Link } from '../../link'

import './variable-results.css';

const { Text } = Typography
const { Panel } = Collapse

export const VariableSearchResults = () => {
    const { variableResults, variableStudyResults } = useHelxSearch()
    console.log("first variable in study")
    console.log(variableStudyResults[0]["elements"][0])
    
    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    const histogram = useRef()

    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(variableStudyResults)

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
            fields: ['name', 'description', 'study_name', 'score','index_pos', 'index_by_study'],
        }
    }

    const startOverHandler = () => {
        setFilteredVariables(variableResults)
        setStudyResultsForDisplay(variableStudyResults)
    }

    function updateStudyResults(filtered_variables) {
        const studiesInFilter = [...new Set(filtered_variables.map(obj => obj.study_name))]

        const studyResultsFiltered = studyResultsForDisplay.filter(obj => {
            return studiesInFilter.includes(obj.c_name)
        })

        const indicesForFilteredVariables = [filtered_variables.map(obj => obj.indexWithinStudy)]
        console.log(indicesForFilteredVariables)


        const studyResultsWithVariablesUpdated = []
        const filteredVarsInStudies = []
        studyResultsFiltered.forEach(study => {
            const updatedStudy = Object.assign({}, study);
            const updatedVariables = []
            study.elements.forEach(variable => {
                const indexForVariableInStudy = variable.indexWithinStudy;
                const studyVarInFilteredVars = indicesForFilteredVariables.includes(indexForVariableInStudy)

                // console.log(`${studyVarInFilteredVars} for ${indexForVariableInStudy}`)
                
                if (studyVarInFilteredVars) {
                    filteredVarsInStudies.push(indexForVariableInStudy)
                    variable["withinFilter"] = true
                }
                updatedVariables.push(variable)
            })
            console.log(indicesForFilteredVariables)
            updatedStudy["elements"] = updatedVariables
            studyResultsWithVariablesUpdated.push(updatedStudy)
        })

        console.log(filteredVarsInStudies)
        setStudyResultsForDisplay(studyResultsWithVariablesUpdated)
    }

    useEffect(() => {
        let histogramObj = histogram.current.getChart()

        histogramObj.on('mouseup', (e) => {
            let filteredVariables = e.view.filteredData

            updateStudyResults(filteredVariables)
            setFilteredVariables(filteredVariables)
        })
    }, [])

    useEffect(() => {
        let histogramObj = histogram.current.getChart()
        histogramObj.update({ ...variableHistogramConfig, data: filteredVariables })
    }, [filteredVariables])

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
                            extra={<Text>{study.elements.length} variable{study.elements.length === 1 ? '' : 's'}</Text>}
                        >
                        <List
                            className="study-variables-list"
                            dataSource={study.elements}
                            renderItem={variable => (
                                <div className="study-variables-list-item">
                                    <Text className={`"variable-name within-filter-${variable.withinFilter}"`}>
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
                ref={histogram}
            />
            <div>Filtered Variables Count: {filteredVariables.length}</div>
            <div className='list'>{ VariablesTableByStudy }</div>
        </div>
    )
}