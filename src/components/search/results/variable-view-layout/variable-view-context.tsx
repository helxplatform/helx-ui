import React, { useCallback, useEffect, useMemo, createContext, useContext, useState, useRef, ReactNode } from 'react'
import { Column as G2Column, ColumnOptions as G2ColumnConfig } from '@antv/g2plot'
import { gold, orange, volcano, red } from '@ant-design/colors'
import { variableHistogramConfigStatic } from './variables-histogram'
import { useHelxSearch } from '../../context'
import { useAnalytics } from '../../../../contexts'
import { Palette } from '../../../../utils'
import { useLunrSearch } from '../../../../hooks'
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

// Determines the order in which data sources appear in the tag list.
const seededPalette = new Palette(chroma.rgb(255 * .75, 255 * .25, 255 * .25), {mode: 'hex'});
const FIXED_DATA_SOURCES: { [string: string]: string } = {
    "HEAL Studies": "#40bf65",
    "HEAL Research Programs": "#bfaf40",
    "Non-HEAL Studies": "#bf4040",
    "cde": "#8a40bf",
    "dbGaP": "#40aabf",
    "AnVIL": "#bf4085",
    "Cancer Data Commons": "#60bf40",
    "Kids First": "#4540bf"
}

export interface DataSource {
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
    e_link: string
    study_id: string
    study_name: string
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

export interface IVariableViewContext {
    normalizedVariableResults: VariableResult[]
    variablesSource: VariableResult[]
    filteredVariables: VariableResult[]
    studiesSource: StudyResult[]
    filteredStudies: StudyResult[]
    absScoreRange: [number, number]
    getVariableById: (id: string) => VariableResult | undefined
    getStudyById: (id: string) => StudyResult | undefined

    // Filters
    scoreFilter: [number, number] | undefined
    setScoreFilter: React.Dispatch<React.SetStateAction<[number, number] | undefined>>
    subsearch: string
    setSubsearch: React.Dispatch<React.SetStateAction<string>>
    sortOption: string
    setSortOption: React.Dispatch<React.SetStateAction<string>>
    sortOrderOption: string
    setSortOrderOption: React.Dispatch<React.SetStateAction<string>>
    hiddenDataSources: string[]
    setHiddenDataSources: React.Dispatch<React.SetStateAction<string[]>>
    collapseIntoVariables: boolean
    setCollapseIntoVariables: React.Dispatch<React.SetStateAction<boolean>>
    isFiltered: boolean
    resetFilters: () => void

    variablesHistogram: React.MutableRefObject<ChartRef | undefined>
    variableHistogramConfig: G2ColumnConfig
    dataSources: { [dataSource: string]: DataSource }
    orderedDataSources: DataSource[]
    scoreLegendItems: any[]
    filteredPercentile: [number, number]
    highlightTokens: string[]
}

interface VariableViewProviderProps {
    children: ReactNode
}

export const VariableViewContext = createContext<IVariableViewContext|undefined>(undefined)

export const VariableViewProvider = ({ children }: VariableViewProviderProps) => {
    const { query, variableResults, variableStudyResults } = useHelxSearch() as ISearchContext
    const { analyticsEvents } = useAnalytics()

    const [collapseHistogram, setCollapseHistogram] = useState<boolean>(false)
    const [historyPage, setHistoryPage] = useState<number>(0)

    /**
     * Filters
     */
    const [hiddenDataSources, setHiddenDataSources] = useState<string[]>([])
    const [scoreFilter, setScoreFilter] = useState<[number, number] | undefined>()
    const [subsearch, setSubsearch] = useState<string>("")
    const [sortOption, setSortOption] = useState<string>("score")
    const [sortOrderOption, setSortOrderOption] = useState<string>("descending")
    const [collapseIntoVariables, setCollapseIntoVariables] = useState<boolean>(true)

    const [variableIdMap, studyIdMap] = useMemo<[Map<string, VariableResult>, Map<string, StudyResult>]>(() => {
        const variableMap = new Map()
        const studyMap = new Map()
        variableStudyResults.forEach((study) => {
            studyMap.set(study.c_id, study)
            study.elements.forEach((variable) => variableMap.set(variable.id, variable))
        })
        return [variableMap, studyMap]
    }, [variableStudyResults])

    const normalizedVariableResults = useMemo(() => {
        const values = variableResults.map(result => result.score);
        const min = Math.min(...values)
        const max = Math.max(...values)
        if (min === max) {
            // If all values are the same, avoid division by zero and set them all to 1 (or 0)
            return variableResults.map(result => ({ ...result, score: 100 }));
         }
         return variableResults.map(result => ({
            ...result,
            score: ((result.score - min) / (max - min)) * 100
        }));
    }, [variableResults])

    const variablesSource = useMemo<VariableResult[]>(() => {
        const dataSources = normalizedVariableResults.reduce<{ [source: string]: number }>((acc, cur) => {
            if (acc.hasOwnProperty(cur.data_source)) acc[cur.data_source]++
            else acc[cur.data_source] = 1
            return acc
        }, {})
        return [...normalizedVariableResults].sort((a, b) => {
            if (sortOrderOption === "descending") [a, b] = [b, a]

            if (sortOption === "score") return a.score - b.score
            else if (sortOption === "data_source") {
                return dataSources[a.data_source] - dataSources[b.data_source]
            }
            else {
                throw new Error(`Unimplemented sort option "${ sortOption }"`)
            }
        })
    }, [normalizedVariableResults, sortOption, sortOrderOption])

    // We want to maintain the ordering of the variables, so compute using the ordered variables source.
    const studiesSource = useMemo<StudyResult[]>(() => {
        return variablesSource.reduce<StudyResult[]>((acc, variable) => {
            const study = studyIdMap.get(variable.study_id)!
            const existingStudy = acc.find((s) => s.c_id === study.c_id)
            if (existingStudy) existingStudy.elements.push(variable)
            else acc.push({
                ...study,
                elements: [variable]
            })
            return acc
        }, [])
    }, [variablesSource, studyIdMap])

    const variableDocs = useMemo(() => variablesSource.map((variable) => ({
        id: variable.id,
        name: variable.name,
        description: variable.description,
        study_id: variable.study_id,
        study_name: variable.study_name
    })), [variablesSource])

    const lunrConfig = useMemo(() => ({
        docs: variableDocs,
        index: {
            ref: "id",
            fields: ["id", "name", "description"]
        }
    }), [variableDocs])

    const { index, lexicalSearch } = useLunrSearch(lunrConfig)

    const [filteredVariables, highlightTokens] = useMemo<[VariableResult[], string[]]>(() => {
        const { hits, tokens } = lexicalSearch(subsearch)
        const matchedVariables = hits.reduce((acc, { ref: id }) => (acc.add(id), acc), new Set())
        const highlightTokens = subsearch.length > 3 ? tokens.map((token) => token.toString()) : []
        
        const filtered = variablesSource.filter((variable) => {
            if (subsearch.length > 3 && !matchedVariables.has(variable.id)) return false
            if (scoreFilter) {
                const [minScore, maxScore] = scoreFilter
                if (variable.score < minScore || variable.score > maxScore) return false
            }
            if (hiddenDataSources.includes(variable.data_source)) return false
            return true
        })
        return [filtered, highlightTokens]
    }, [variablesSource, scoreFilter, subsearch, lexicalSearch, hiddenDataSources])

    const filteredStudies = useMemo<StudyResult[]>(() => {
        return studiesSource.reduce<StudyResult[]>((acc, study) => {
            const newStudy = {
                ...study,
                elements: study.elements.filter((variable) => filteredVariables.includes(variable))
            }
            if (newStudy.elements.length > 0) acc.push(newStudy)
            return acc
        }, [])
    }, [studiesSource, filteredVariables])

    const absScoreRange = useMemo<[number, number]>(() => {
        if (normalizedVariableResults.length < 2) return [normalizedVariableResults[0]?.score, normalizedVariableResults[0]?.score]
        return [
            Math.min(...normalizedVariableResults.map((result) => result.score)),
            Math.max(...normalizedVariableResults.map((result) => result.score))   
        ]
    }, [normalizedVariableResults])

    const filteredScoreRange = useMemo<[number, number] | undefined>(() => {
        if (filteredVariables.length === 0) return undefined
        if (filteredVariables.length === 1) return [filteredVariables[0].score, filteredVariables[0].score]
        return [
            Math.min(...filteredVariables.map((result) => result.score)),
            Math.max(...filteredVariables.map((result) => result.score))   
        ]
    }, [filteredVariables])

    const variablesHistogram = useRef<ChartRef>()
    const variableHistogramConfig = useMemo<G2ColumnConfig>(() => {
        const [minScore, maxScore] = absScoreRange
        return {
            ...(variableHistogramConfigStatic as any),
            data: [...filteredVariables].sort((a, b) => a.score - b.score),
            color: ({ id }) => {
                const { score } = variableIdMap.get(id)!
                const absRatio = (score - minScore) / (maxScore - minScore)
                // const continuousRatio = ([...variableResults].sort((a, b) => a.score - b.score).findIndex((result) => result.id === id) + 1) / variableResults.length
                /**
                 * `continuousRatio` will create a continuous gradient across the histogram. This doesn't really indicate anything though, just looks pretty.
                 * `absRatio` is the norm of score between [minScore, maxScore] and will color the histogram against a gradient according to individual scores.
                 */
                return COLOR_GRADIENT(absRatio).toString()
            },
        } as const
    }, [filteredVariables, normalizedVariableResults, variableIdMap, absScoreRange])

    const scoreLegendItems = useMemo(() => GRADIENT_CONSTITUENTS.map((color, i) => {
        const [minScore, maxScore] = absScoreRange
        const startRatio = Math.round(i / GRADIENT_CONSTITUENTS.length * 100) / 100
        const endRatio = Math.round((i + 1) / GRADIENT_CONSTITUENTS.length * 100) / 100
        const startScore = (startRatio * maxScore) - (startRatio * minScore) + minScore
        const endScore = (endRatio * maxScore) - (endRatio * minScore) + minScore
        const count = normalizedVariableResults.filter((result) => result.score >= startScore && result.score <= endScore).length
        const filteredCount = filteredVariables.filter((result) => result.score >= startScore && result.score <= endScore).length
        return {
            id: color,
            name: {
                // name: `${ startRatio === 0 ? Math.floor(startScore) : Math.ceil(startScore) } - ${ endRatio === 1 ? Math.ceil(endScore) : Math.floor(endScore) }`,
                name: `${startRatio * 100} - ${endRatio * 100}`,
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
    }), [absScoreRange, normalizedVariableResults, filteredVariables])

    const filteredPercentile = useMemo<[number, number]>(() => {
        const relativeMin = Math.min(...filteredVariables.map((result) => result.score))
        const relativeMax = Math.max(...filteredVariables.map((result) => result.score))
        return [
            (normalizedVariableResults.filter((result) => result.score <= relativeMin).length / normalizedVariableResults.length) * 100,
            (normalizedVariableResults.filter((result) => result.score <= relativeMax).length / normalizedVariableResults.length) * 100
        ]
    }, [normalizedVariableResults, filteredVariables])

    const dataSources = useMemo<{[dataSource: string]: DataSource}>(() => {
        return variablesSource.reduce<{[dataSource: string]: DataSource}>((acc, cur) => {
            const dataSource = cur.data_source
            if (acc.hasOwnProperty(dataSource)) {
                const { studies, variables } = acc[dataSource]
                if (!variables.includes(cur.id)) variables.push(cur.id) 
                if (!studies.includes(cur.study_id)) studies.push(cur.study_id) 
            } else {
                acc[dataSource] = {
                    name: dataSource,
                    color: FIXED_DATA_SOURCES[dataSource] ?? seededPalette.getNextColor(),
                    studies: [cur.study_id],
                    variables: [cur.id]
                }
            }
            return acc
        }, {})
    }, [variablesSource])
    
    const orderedDataSources = useMemo<DataSource[]>(() => {
        const dataSourceKeyOrder = Object.keys(FIXED_DATA_SOURCES)
        return Object.entries(dataSources)
            .sort((a, b) => {
                const [aName, aDataSource] = a
                const [bName, bDataSource] = b
                const aIndex = dataSourceKeyOrder.indexOf(aName)
                const bIndex = dataSourceKeyOrder.indexOf(bName)
                // Sort unrecognized data sources alphabetically.
                if (aIndex === -1 && bIndex === -1) return aName.localeCompare(bName)
                // Put unrecognized data sources at the end of the array.
                if (aIndex === -1) return 1
                if (bIndex === -1) return -1
                return aIndex - bIndex
            })
            .map(([name, dataSource]) => dataSource)
    }, [dataSources])

    const isFiltered = useMemo(() => (
        collapseIntoVariables
            ? filteredVariables.length < variablesSource.length
            : filteredStudies.length < studiesSource.length
    ), [filteredVariables, variablesSource, filteredStudies, studiesSource, collapseIntoVariables])

    const resetFilters = useCallback(() => {
        setHiddenDataSources([])
        setScoreFilter([
            Math.min(...normalizedVariableResults.map((result) => result.score)),
            Math.max(...normalizedVariableResults.map((result) => result.score))
        ])
        setSubsearch("")
        setSortOption("score")
        setSortOrderOption("descending")
    }, [normalizedVariableResults])

    const getStudyById = useCallback((id: string) => studyIdMap.get(id), [studyIdMap])
    const getVariableById = useCallback((id: string) => variableIdMap.get(id), [variableIdMap])

    useEffect(() => {
        resetFilters()
    }, [normalizedVariableResults, resetFilters])

    /** Drag-filtering on histogram */
    useEffect(() => {
        if (!variablesHistogram.current) return
        const histogramObj = variablesHistogram.current.getChart()
        const handle = (e: any) => {
            const { filteredData } = e.view
            setScoreFilter([
                Math.min(...filteredData.map((result: VariableResult) => result.score)),
                Math.max(...filteredData.map((result: VariableResult) => result.score))   
            ])
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
        histogramObj.update({ ...variableHistogramConfig, data: [...filteredVariables].sort((a, b) => a.score - b.score) })
    }, [variableHistogramConfig, filteredVariables])

    return (
        <VariableViewContext.Provider value={{
            /**
             * Variables
             */
            normalizedVariableResults,
            variablesSource,
            studiesSource,
            filteredVariables,
            filteredStudies,
            getStudyById, getVariableById,
            /**
             * Filters
             */
            scoreFilter, setScoreFilter,
            subsearch, setSubsearch,
            sortOption, setSortOption,
            sortOrderOption, setSortOrderOption,
            collapseIntoVariables, setCollapseIntoVariables,
            isFiltered, resetFilters,
            /**
             * Misc
             */
            absScoreRange,
            variablesHistogram,
            variableHistogramConfig,
            dataSources, orderedDataSources, hiddenDataSources, setHiddenDataSources,
            scoreLegendItems,
            filteredPercentile,
            highlightTokens
        }}>
            { children }
        </VariableViewContext.Provider>
    )
}
export const useVariableView = () => useContext(VariableViewContext)