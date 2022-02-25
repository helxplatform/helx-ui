import React, { useEffect, memo, useState } from 'react'
import { Column } from '@antv/g2plot';
import { useHelxSearch } from '..';

const paletteSemanticRed = '#F4664A';
const brandColor = '#5B8FF9';

export const VariableSearchResults = () => {
    const { variableResults } = useHelxSearch()
    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    const [highlightStudies, setHighlightStudies] = useState('')
    const [highlightVariables, setHighLightVariables] = useState([])

    // initial config for the histogram
    const initialConfig = {
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
            const column = new Column('histogram-container', initialConfig);
            console.log(column)
            column.render()
            // event handler for slider, so 'filteredVariables' state will be the variables shown on the histogram
            column.on('slider:mouseup', (e) => {
                setFilteredVariables(e.view.filteredData)
            })

            column.on('plot:click', (e) => {
                if (e?.data?.data) {
                    const variablesPerStudy = variableResults.filter(variable => variable.study_name === e.data.data.study_name)
                    setHighlightStudies(e.data.data.study_name)
                    setHighLightVariables(variablesPerStudy)
                    column.update({ ...initialConfig, data: variablesPerStudy })
                }
            })
    }, [])

    return (
        <div>
            <button>Start Over</button>
            <div id="histogram-container"></div>
            <div>Study: {highlightStudies ? highlightStudies : 'Not Selected'} </div>
            <div>{highlightVariables.length} variables</div>
        </div>
    )
}