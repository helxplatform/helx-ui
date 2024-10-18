import { useCallback, useMemo } from 'react'
import { Tag } from 'antd'
import { DataSource, useVariableView } from '../variable-view-context'

const { CheckableTag } = Tag

interface StudyDataSourceTagProps {
    dataSource: DataSource
}

export const StudyDataSourceTag = ({ dataSource }: StudyDataSourceTagProps) => {
    const { hiddenDataSources, setHiddenDataSources } = useVariableView()!
    
    const displayedCount = useMemo(() => {
        if (dataSource.variables.length === dataSource.filteredVariables.length) return dataSource.variables.length
        return `${ dataSource.filteredVariables.length }/${ dataSource.variables.length }`
    }, [dataSource])

    const active = useMemo(() => !hiddenDataSources.includes(dataSource.name), [hiddenDataSources, dataSource])
    const setActive = useCallback((active: boolean) => setHiddenDataSources((prevDataSources) => {
        if (active) return prevDataSources.filter((s) => s !== dataSource.name)
        else return [...prevDataSources, dataSource.name]
    }), [dataSource])

    return (
        <CheckableTag
            className={ `variable-view-data-source-tag ${ hiddenDataSources.includes(dataSource.name) ? "inactive" : "active" }` }
            style={{
                fontSize: 13,
                background: !hiddenDataSources.includes(dataSource.name) ? dataSource.color : undefined,
                border: hiddenDataSources.includes(dataSource.name) ? "1px solid rgba(0, 0, 0, 0.15)" : undefined,
                margin: 0,
                ["--hover-color" as any]: dataSource.color 
            }}
            checked={ active }
            onChange={ () => setActive(!active) }
        >
            { `${ dataSource.name } (${ displayedCount })` }
        </CheckableTag>
    )
}