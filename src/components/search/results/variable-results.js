import React, { useEffect, useState, useRef } from 'react'
import { Column } from '@ant-design/plots';
import { useHelxSearch } from '..';
import { Button } from 'antd';
import './variable-results.css';

export const VariableSearchResults = () => {
    const { variableResults } = useHelxSearch()
    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    const histogram = useRef()

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

    return (
        <div>
            <Button className="histogram-startover-btn" onClick={startOverHandler}>Start Over</Button>
            <Column
                {...variableHistogramConfig}
                ref={histogram}
            />
            <div>Filtered Variables Count: {filteredVariables.length}</div>
        </div>
    )
}