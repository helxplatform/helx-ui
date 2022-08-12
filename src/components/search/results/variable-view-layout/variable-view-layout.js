import { Fragment } from 'react'
import { VariableSearchResults } from './'
import { ResultsHeader } from '../'
import { useHelxSearch, SearchForm } from '../../'

export const VariableViewLayout = () => {
    const { error, variableResults } = useHelxSearch()
    
    return (
        <Fragment>
            <SearchForm />
            {variableResults.length > 0 && <ResultsHeader concepts={[]}/>}
            { error && <span>{ error.message }</span> }
            <VariableSearchResults />
        </Fragment>
    )
}