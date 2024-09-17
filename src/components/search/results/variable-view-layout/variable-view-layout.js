import { Fragment } from 'react'
import { Spin, Typography, Empty } from 'antd'
import { VariableSearchResults } from './variable-results-new'
import { ResultsHeader } from '../'
import { useHelxSearch, SearchForm } from '../../'

const { Text } = Typography

export const VariableViewLayout = () => {
    const { query, error, variableResults, isLoadingVariableResults, totalVariableResults } = useHelxSearch()
    
    return (
        <Fragment>
            <SearchForm />
            { isLoadingVariableResults ? (
                <Spin style={{ display: "block", margin: "32px" }} />
            ) : query && (
                <Fragment>
                    { error.message ? (
                        <span style={{ marginTop: -144, padding: "0 6px" }}>{ error.message }</span>
                    ) : !isLoadingVariableResults && totalVariableResults === 0 ? (
                        <Empty style={{ marginTop: -24 }} description={
                            <Text type="secondary">No results were found for &quot;{ query }&quot;</Text>
                        } />
                        // <span style={{ marginTop: -144, padding: "0 6px" }}>No results found</span>
                    ) : null }
                    { variableResults.length > 0 && <ResultsHeader variables={ true } />}
                    <VariableSearchResults />
                </Fragment>
            ) }
        </Fragment>
    )
}