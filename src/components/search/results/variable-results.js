import React, { useEffect, useState, useRef } from 'react'
import { Column } from '@ant-design/plots';
import { useHelxSearch } from '..';
import { Collapse, List, Typography, Button } from 'antd'
import { Link } from '../../link'

import './variable-results.css';

const { Text } = Typography
const { Panel } = Collapse

export const VariableSearchResults = () => {
    const { variableResults, studyResults } = useHelxSearch()
    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    const histogram = useRef()

    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(studyResults)

    // initial config for the variables histogram
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
            fields: ['name', 'description', 'study_name', 'score','index_pos'],
        }
    }

    const startOverHandler = () => {
        setFilteredVariables(variableResults)
    }

    useEffect(() => {
        let histogramObj = histogram.current.getChart()

        histogramObj.on('mouseup', (e) => {
            console.log(e.view.filteredData)
            setFilteredVariables(e.view.filteredData)
        })
    }, [])

    useEffect(() => {
        let histogramObj = histogram.current.getChart()
        histogramObj.update({ ...variableHistogramConfig, data: filteredVariables })
    }, [filteredVariables])

    const StudyListWithVariables = () => {
        return (
            <Collapse ghost className="variables-collapse">
                {
                    studyResults.map((study, i) => {
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
        )
    }

    return (
        <div>
            <Button className="histogram-startover-btn" onClick={startOverHandler}>Start Over</Button>
            <Column
                {...variableHistogramConfig}
                ref={histogram}
            />
            <div>Filtered Variables Count: {filteredVariables.length}</div>
            <div className='list'><StudyListWithVariables /></div>
        </div>
    )
}