import { Fragment } from 'react'
import { ConceptSearchResults } from './concept-search-results'
import { useHelxSearch, SearchForm } from '../../'

export const ConceptsGridLayout = () => {
    const { error } = useHelxSearch()
    return (
        <Fragment>
            <SearchForm />
            { error && <span>{ error.message }</span> }
            <ConceptSearchResults />
        </Fragment>
    )
}