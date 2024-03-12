import { useCallback, useEffect, useMemo, createContext, useContext, useState, useRef, ReactNode } from 'react'
import { Column as G2Column, ColumnOptions as G2ColumnConfig } from '@antv/g2plot'
import { gold, orange, volcano, red } from '@ant-design/colors'
import { variableHistogramConfigStatic } from './variables-histogram'
import { useHelxSearch } from '../../context'
import { useAnalytics } from '../../../../contexts'
import { Palette } from '../../../../utils'
const chroma = require('chroma-js')

// Between 0-9
const COLOR_INTENSITY = 4
const GRADIENT_CONSTITUENTS = [
    gold[COLOR_INTENSITY], orange[COLOR_INTENSITY], volcano[COLOR_INTENSITY], red[COLOR_INTENSITY]
]
// const GRADIENT_CONSTITUENTS = [
//     cyan[COLOR_INTENSITY], blue[COLOR_INTENSITY], geekblue[COLOR_INTENSITY]
// ]
const COLOR_GRADIENT = chroma.scale(GRADIENT_CONSTITUENTS).mode("lrgb")

interface DataSource {
    name: string
    color: string
    studies: string[]
    variables: string[]
}

export interface StudyResult {
    c_id: string
    c_link: string
    c_name: string
    data_source: string
    elements: VariableResult[]
}

export interface VariableResult {
    id: string
    name: string
    description: string
    score: number
    study: StudyResult
    e_link: string
    data_source: string // e.g. "HEAL Studies" vs "Non-HEAL Studies"
}

interface GetChart {
    (): G2Column
}
interface ChartRef {
    getChart: GetChart
}

export interface ISearchContext {
    query: string
    variableResults: VariableResult[]
    variableStudyResults: StudyResult[]
    totalVariableResults: number
}

interface OnScoreSliderChange {
    (score: [number, number]): void
}

export interface IVariableViewContext {
    variablesSource: VariableResult[]
    filteredVariables: VariableResult[]
    absScoreRange: [number, number]
    variablesHistogram: React.MutableRefObject<ChartRef | undefined>
    variableHistogramConfig: G2ColumnConfig
    dataSources: { [dataSource: string]: DataSource }
    hiddenDataSources: string[]
    setHiddenDataSources: React.Dispatch<React.SetStateAction<string[]>>
    scoreLegendItems: any[]
    filteredPercentile: [number, number]
    onScoreSliderChange: OnScoreSliderChange
}

interface VariableViewProviderProps {
    children: ReactNode
}

export const VariableViewContext = createContext<IVariableViewContext|undefined>(undefined)

export const VariableViewProvider = ({ children }: VariableViewProviderProps) => {
    const { query, variableResults, variableStudyResults, totalVariableResults } = useHelxSearch() as ISearchContext
    const { analyticsEvents } = useAnalytics()

    const [collapseHistogram, setCollapseHistogram] = useState<boolean>(false)
    const [historyPage, setHistoryPage] = useState<number>(0)
    const [filteredVariables, setFilteredVariables] = useState<VariableResult[]>([])
    const [hiddenDataSources, setHiddenDataSources] = useState<string[]>([])

    const variablesSource = useMemo<VariableResult[]>(() => {
        return variableResults.sort((a, b) => a.score - b.score )
    }, [variableResults])

    const absScoreRange = useMemo<[number, number]>(() => {
        // if (variableResults.length < 2) return undefined
        return [
            Math.min(...variableResults.map((result) => result.score)),
            Math.max(...variableResults.map((result) => result.score))   
        ]
    }, [variableResults])

    const variablesHistogram = useRef<ChartRef>()
    const variableHistogramConfig = useMemo<G2ColumnConfig>(() => {
        const [minScore, maxScore] = absScoreRange
        return {
            ...(variableHistogramConfigStatic as any),
            data: [...variablesSource].sort((a, b) => a.score - b.score),
            color: ({ id }) => {
                const { score } = variablesSource.find((result) => result.id === id)!
                const absRatio = (score - minScore) / (maxScore - minScore)
                // const continuousRatio = ([...variableResults].sort((a, b) => a.score - b.score).findIndex((result) => result.id === id) + 1) / variableResults.length
                /**
                 * `continuousRatio` will create a continuous gradient across the histogram. This doesn't really indicate anything though, just looks pretty.
                 * `absRatio` is the norm of score between [minScore, maxScore] and will color the histogram against a gradient according to individual scores.
                 */
                return COLOR_GRADIENT(absRatio).toString()
            },
        } as const
    }, [variableResults, absScoreRange])

    const scoreLegendItems = useMemo(() => GRADIENT_CONSTITUENTS.map((color, i) => {
        const [minScore, maxScore] = absScoreRange
        const startRatio = Math.round(i / GRADIENT_CONSTITUENTS.length * 100) / 100
        const endRatio = Math.round((i + 1) / GRADIENT_CONSTITUENTS.length * 100) / 100
        const startScore = (startRatio * maxScore) - (startRatio * minScore) + minScore
        const endScore = (endRatio * maxScore) - (endRatio * minScore) + minScore
        const count = variableResults.filter((result) => result.score >= startScore && result.score <= endScore).length
        const filteredCount = filteredVariables.filter((result) => result.score >= startScore && result.score <= endScore).length
        return {
            id: color,
            name: {
                name: `${ startRatio === 0 ? Math.floor(startScore) : Math.ceil(startScore) } - ${ endRatio === 1 ? Math.ceil(endScore) : Math.floor(endScore) }`,
                style: filteredCount === 0 ? { color: "rgba(0, 0, 0, 0.25)" } : undefined
            },
            description: {
                description: filteredCount < count ? `(${ filteredCount } / ${ count } variables)` : `(${ count } variables)`,
                style: filteredCount === 0 ? { color: "rgba(0, 0, 0, 0.25)" } : undefined
            },
            marker: {
                path: (w: number, h: number) => {
                    const x = 0
                    const y = 0
                    return `M ${ x },${ y } L ${ x + w }, ${ y } L ${ x + w }, ${ y + h } L ${ x }, ${ y + h } L ${ x },${ y } Z`
                },
                // path: [["M", x - x_r, y - y_r], ["L", x + x_r, y - y_r], ["L", x + x_r, y + y_r], ["L", x - x_r, y + y_r], ["Z"]],
                style: {
                    fill: filteredCount > 0 ? color : "rgba(0, 0, 0, 0.15)"
                }
            }
        }
    }), [absScoreRange, variableResults, filteredVariables])

    const filteredPercentile = useMemo<[number, number]>(() => {
        const relativeMin = Math.min(...filteredVariables.map((result) => result.score))
        const relativeMax = Math.max(...filteredVariables.map((result) => result.score))
        return [
            (variableResults.filter((result) => result.score <= relativeMin).length / variableResults.length) * 100,
            (variableResults.filter((result) => result.score <= relativeMax).length / variableResults.length) * 100
        ]
    }, [variableResults, filteredVariables])

    const dataSources = useMemo<{[dataSource: string]: DataSource}>(() => {
        const palette = new Palette(chroma.rgb(255 * .75, 255 * .25, 255 * .25), {mode: 'hex'})
        return variablesSource.reduce<{[dataSource: string]: DataSource}>((acc, cur) => {
            const dataSource = cur.data_source
            if (acc.hasOwnProperty(dataSource)) {
                const { studies, variables } = acc[dataSource]
                if (!variables.includes(cur.id)) variables.push(cur.id) 
                if (!studies.includes(cur.study.c_id)) studies.push(cur.study.c_id) 
            } else {
                acc[dataSource] = {
                    name: dataSource,
                    color: palette.getNextColor(),
                    studies: [cur.study.c_id],
                    variables: [cur.id]
                }
            }
            return acc
        }, {})
    }, [variablesSource])

    const onScoreSliderChange = useCallback(([minScore, maxScore]: [number, number]) => {
        setFilteredVariables(variablesSource.filter((variable) => (
            variable.score >= minScore && variable.score <= maxScore
        )))
    }, [variablesSource])

    /** Reset filter whenever the underlying search results change */
    useEffect(() => {
        setFilteredVariables(variablesSource)
    }, [variablesSource])

    useEffect(() => {
    }, [hiddenDataSources])

    /** Drag-filtering on histogram */
    useEffect(() => {
        if (!variablesHistogram.current) return
        const histogramObj = variablesHistogram.current.getChart()
        const handle = (e: any) => {
            const { filteredData } = e.view
            setFilteredVariables(filteredData)
        }
        histogramObj.on('mouseup', handle)
        return () => {
            // Remove the click handler when the effect demounts.
            histogramObj.off('mouseup', handle)
        }
    }, [])

    /** Update histogram whenever config changes */
    useEffect(() => {
        if (!variablesHistogram.current) return
        const histogramObj = variablesHistogram.current.getChart()
        histogramObj.update({ ...variableHistogramConfig, data: filteredVariables })
    }, [variableHistogramConfig, variablesSource, filteredVariables])

    return (
        <VariableViewContext.Provider value={{
            variablesSource,
            filteredVariables,
            absScoreRange,
            variablesHistogram,
            variableHistogramConfig,
            dataSources, hiddenDataSources, setHiddenDataSources,
            scoreLegendItems,
            filteredPercentile,
            onScoreSliderChange
        }}>
            { children }
        </VariableViewContext.Provider>
    )
}
export const useVariableView = () => useContext(VariableViewContext)