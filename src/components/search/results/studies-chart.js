import React, { useEffect, useState } from 'react'
import { Column, Line } from '@antv/g2plot';
import { useHelxSearch } from '..';

export const StudiesChartView = () => {
    const { studyResults, totalStudyResults } = useHelxSearch()

    useEffect(() => {
        console.log(studyResults)
        // sort all variables
        const data = studyResults.reduce((acc, curr) => {
            curr.elements.forEach(element => element.c_name = curr.c_name)
            acc.push(...curr.elements)
            return acc
        }, []).sort((a, b) => a.score - b.score)

        console.log(data)

        const column = new Column('studies-chart-container', {
            data,
            xField: 'id',
            yField: 'score',
            xAxis: {
                label: {
                    autoRotate: false,
                },
            },
            slider: {
                start: 0.1,
                end: 1.0,
            }
        });

        column.render()

    }, [studyResults])



    return (
        <div id="studies-chart-container"><div id="container1"></div><div id="container2"></div></div>
    )
}