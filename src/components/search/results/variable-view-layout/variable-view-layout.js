import { Fragment } from 'react'
import { VariableSearchResults } from './'
import { ResultsHeader } from '../'
import { useHelxSearch, SearchForm } from '../../'

export const VariableViewLayout = () => {
    const { error, totalVariableResults } = useHelxSearch()
    
    return (
        <Fragment>
            <SearchForm />
            {totalVariableResults > 0 && <ResultsHeader variables={ true } />}
            { error && <span>{ error.message }</span> }
            <VariableSearchResults />
        </Fragment>
    )
}