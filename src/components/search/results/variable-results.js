import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Column } from '@ant-design/plots';
import { Collapse, List, Typography, Button, Space } from 'antd'
import {
    PushpinOutlined as UnselectedIcon,
    PushpinFilled as SelectedIcon,
} from '@ant-design/icons'
import { useHelxSearch } from '..';
import { Link } from '../../link'

import './variable-results.css';

const { Text } = Typography
const { Panel } = Collapse

export const VariableSearchResults = () => {
    const { variableResults, variableStudyResults } = useHelxSearch()

    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(variableStudyResults)
    const [studyNamesForDisplay, setStudyNamesForDisplay] = useState([])

    const variablesHistogram = useRef()

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
        state: {
            active: {
                style: {
                    lineWidth: 0,
                    fill: 'aquamarine',
                    strokeStyle: "aquamarine"
                },
            },
            inactive: {
                style: {
                    lineWidth: 0,
                    fill: '#476eb2',
                    strokeStyle: "#476eb2",
                    fillOpacity: 1,
                },
            },
        }
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
        const variableIds = variableResults.map(el => el.id);
        histogramObj.setState("inactive", (datum) => variableIds.includes(datum.id));
    }, [filteredVariables])

    function selectVariablesByStudy(studyName) {
        return function (e) {
            e.stopPropagation()

            let idx = studyNamesForDisplay.indexOf(studyName)
            let newStudyNamesForDisplay = [...studyNamesForDisplay]
            if (idx > -1) {
                newStudyNamesForDisplay.splice(idx, 1)
            } else {
                newStudyNamesForDisplay = [...newStudyNamesForDisplay, studyName]
            }

            // filter variables by study if needed.
            const variableIdsFilteredByStudy = newStudyNamesForDisplay.length > 0 ?
                variableResults.filter(variable => newStudyNamesForDisplay.includes(variable.study_name)).map(el => el.id) :
                variableResults.map(el => el.id);

            // Examples that suggested how to setState to 'active' came from https://g2plot.antv.vision/en/examples/dynamic-plots/brush#advanced-brush2
            // Style parameters below do nothing. Examples that inspired the code for styles came from https://antv-g2plot-v1.gitee.io/en/examples/general/state
            // We found documentation for how to style state properties under Geometry Style > State at https://charts.ant.design/en/examples/column/basic#color
            let histogramObj = variablesHistogram.current.getChart()
            histogramObj.setState("active", (datum) => variableIdsFilteredByStudy.includes(datum.id));
            histogramObj.setState("active", (datum) => !variableIdsFilteredByStudy.includes(datum.id), false);

            setStudyNamesForDisplay(newStudyNamesForDisplay)
        }
    }

    const VariablesTableByStudy = useMemo(() => (
        <Collapse ghost className="variables-collapse">
            {
                studyResultsForDisplay.map((study, i) => {
                    return (
                        <Panel
                            key={`panel_${study.c_name}`}
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
                                      onClick={ selectVariablesByStudy(study.c_name) }
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
                                <Text>{study.elements.length} variable{study.elements.length === 1 ? '' : 's'}</Text>,
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