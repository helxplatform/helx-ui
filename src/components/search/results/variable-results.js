import React, { useEffect, useState } from 'react'
import { Collapse, List, Typography } from 'antd'
import { Column, G2 } from '@antv/g2plot';

import { Link } from '../../link'
import { useHelxSearch } from '..';

const { Text } = Typography
const { Panel } = Collapse

export const VariableSearchResults = () => {
    const { variableResults, studyResults } = useHelxSearch()
    const [filteredVariables, setFilteredVariables] = useState([])

    const [studyResultsForDisplay, setStudyResultsForDisplay] = useState(studyResults)
    if (studyResultsForDisplay.length === 0 ) {
        setStudyResultsForDisplay(studyResults)
    }

    // initial config for the histogram
    const histogramConfig = {
        data: variableResults,
        xField: 'index_pos',
        yField: 'score',
        xAxis: {
            label: ""
        },
        brush: {
            enabled: true,
            type: "x-rect"
        },
        tooltip: {
            showTitle: false,
            fields: ['name', 'description', 'study_name', 'score','index_pos'],
        },
        interactions: [{ type: 'active-region', enable: false }],
    }

    useEffect(() => {
        setFilteredVariables(variableResults)
        const histogram = new Column('histogram-container', histogramConfig);

        // event handler for slider, so 'filteredVariables' state will be the variables shown on the histogram
        histogram.on(G2.BRUSH_FILTER_EVENTS.AFTER_FILTER, (e) => {
            // console.log(e.data.view.filteredData)
            setFilteredVariables(e.data.view.filteredData)
        })
        histogram.render()

    }, [variableResults])

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
            <div id="histogram-container"><div id="container1"></div><div id="container2"></div></div>
            <div>{filteredVariables.length} variables currently on histogram.</div>
            <div className='list'><StudyListWithVariables /></div>
        </div>
    )
}