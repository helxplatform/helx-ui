import React, { useEffect, memo, useState, useRef } from 'react'
import { Column } from '@ant-design/plots';
import { useHelxSearch } from '..';
import { Button } from 'antd';
import './variable-results.css';

const paletteSemanticRed = '#F4664A';
const brandColor = '#5B8FF9';

export const VariableSearchResults = () => {
    const { variableResults } = useHelxSearch()
    const [filteredVariables, setFilteredVariables] = useState(variableResults)
    const [highlightStudies, setHighlightStudies] = useState('')
    const [highlightVariables, setHighLightVariables] = useState(variableResults)
    const histogram = useRef()

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
        brush: {
            enabled: true,
            type: 'x-rect',
        }
    }

    const startOverHandler = () => {
        setHighLightVariables(variableResults)
        setHighlightStudies('')
    }

    useEffect(() => {
        let histogramObj = histogram.current.getChart()

        histogramObj.on('mouseup', (e) => {
            console.log(e.view.filteredData)
            setFilteredVariables(e.view.filteredData)
        })

        // The below functionality isn't needed now (3/1/22), but is still useful to have worked out
        histogramObj.on('plot:click', (e) => {
            if (e?.data?.data) {
                const newHighLightVariables = variableResults.filter(variable => variable.study_name === e.data.data.study_name)
                const newHighLightStudy = e.data.data.study_name
                setHighLightVariables(newHighLightVariables)
                setHighlightStudies(newHighLightStudy)
            }
        })
    }, [])

    useEffect(() => {
        let histogramObj = histogram.current.getChart()
        histogramObj.update({ ...initialConfig, data: highlightVariables })
    }, [highlightStudies])

    return (
        <div>
            <Button className="histogram-startover-btn" onClick={startOverHandler}>Start Over</Button>
            <Column
                {...initialConfig}
                ref={histogram}
            />
            <div>{filteredVariables.length}</div>
            <div>Highlighted Study: {highlightStudies ? highlightStudies : 'Not Selected'} </div>
            <div>{highlightVariables.length} highlighted variables</div>
        </div>
    )
}