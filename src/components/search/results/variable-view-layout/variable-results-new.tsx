import { useMemo } from 'react'
import { VariableViewProvider } from './variable-view-context'
import { VariableViewHistogram } from './variable-view-histogram'
import { VariableList } from './variable-list'
import { useHelxSearch } from '../../context'
import './variable-results.css'

export const VariableSearchResults = () => {
    const { variableResults } = useHelxSearch() as any
    const noResults = useMemo(() => variableResults.length === 0, [variableResults])
    return (
        <VariableViewProvider>
            <div style={{ flexGrow: 1, display: noResults ? "none" : undefined }}>
                <VariableViewHistogram />
                <VariableList />
            </div>
        </VariableViewProvider>
    )
}