import React, { useEffect, useState } from 'react'
import { Column, G2 } from '@antv/g2plot';
import { useHelxSearch } from '..';

export const VariableSearchResults = () => {
    const { variableResults } = useHelxSearch()
    const [filteredVariables, setFilteredVariables] = useState([])

    // initial config for the histogram
    const currentConfig = {
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
        const histogram = new Column('histogram-container', currentConfig);

        // event handler for slider, so 'filteredVariables' state will be the variables shown on the histogram
        histogram.on(G2.BRUSH_FILTER_EVENTS.AFTER_FILTER, (e) => {
            // console.log(e.data.view.filteredData)
            setFilteredVariables(e.data.view.filteredData)
        })
        histogram.render()

    }, [variableResults])





    return (
        <div>
            <div id="histogram-container"><div id="container1"></div><div id="container2"></div></div>
            <div>{filteredVariables.length} variables currently on histogram.</div>
        </div>
    )
}