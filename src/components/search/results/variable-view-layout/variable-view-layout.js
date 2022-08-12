import { Fragment } from 'react'
import { VariableSearchResults } from './'
import { ResultsHeader } from '../'
import { useHelxSearch, SearchForm } from '../../'

export const VariableViewLayout = () => {
    const { error, concepts } = useHelxSearch()
    
    return (
        <Fragment>
            <SearchForm />
            {concepts.length > 0 && <ResultsHeader concepts={concepts}/>}
            { error && <span>{ error.message }</span> }
            <VariableSearchResults />
        </Fragment>
    )
}