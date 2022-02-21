import React, { useEffect, useState } from 'react'
import { Column, Line } from '@antv/g2plot';
import { useHelxSearch } from '..';

export const VariableSearchResults = () => {
    const { variableResults } = useHelxSearch()
    const [filteredVariables, setFilteredVariables] = useState([])

    // initial config for the histogram
    const currentConfig = {
        data: variableResults,
        xField: 'id',
        yField: 'score',
        xAxis: {
            label: {
                autoRotate: false,
            },
        },
        slider: {
            start: 0,
            end: 1.0,
        }
    }

    useEffect(() => {
        setFilteredVariables(variableResults)
        const column = new Column('histogram-container', currentConfig);

        // event handler for slider, so 'filteredVariables' state will be the variables shown on the histogram
        column.on('slider:mouseup', (e) => {
            setFilteredVariables(e.view.filteredData)
        })
        column.render()

    }, [variableResults])





    return (
        <div>
            <div id="histogram-container"><div id="container1"></div><div id="container2"></div></div>
            <div>{filteredVariables.length} variables currently on histogram.</div>
        </div>
    )
}