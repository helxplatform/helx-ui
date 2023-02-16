import { Fragment } from 'react'
import { Spin } from 'antd'
import { VariableSearchResults } from './'
import { ResultsHeader } from '../'
import { useHelxSearch, SearchForm } from '../../'

export const VariableViewLayout = () => {
    const { error, totalVariableResults, isLoadingVariableResults } = useHelxSearch()
    
    return (
        <Fragment>
            <SearchForm />
            { error && <span>{ error.message }</span> }
            { isLoadingVariableResults ? (
                <Spin style={{ display: "block", margin: "32px" }} />
            ) : (
                <Fragment>
                    {totalVariableResults > 0 && <ResultsHeader variables={ true } />}
                    <VariableSearchResults />
                </Fragment>
            ) }
        </Fragment>
    )
}