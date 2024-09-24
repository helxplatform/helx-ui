import { Fragment } from 'react'
import { Spin, Typography, Empty } from 'antd'
import { VariableSearchResults } from './'
import { ResultsHeader } from '../'
import { useHelxSearch, SearchForm } from '../../'

const { Text } = Typography

export const VariableViewLayout = () => {
    const { query, error, totalVariableResults, isLoadingVariableResults } = useHelxSearch()
    
    return (
        <Fragment>
            <SearchForm />
            { isLoadingVariableResults ? (
                <Spin style={{ display: "block", margin: "32px" }} />
            ) : (
                    query && (
                        <Fragment>
                            { error.message ? (
                                <span className="results-error" style={{ marginTop: -144, padding: "0 6px" }}>{ error.message }</span>
                            ) : !isLoadingVariableResults && totalVariableResults === 0 ? (
                                <Empty style={{ marginTop: -24 }} description={
                                    <Text type="secondary">No results were found for &quot;{ query }&quot;</Text>
                                } />
                                // <span style={{ marginTop: -144, padding: "0 6px" }}>No results found</span>
                            ) : null }
                            {totalVariableResults > 0 && <ResultsHeader variables={ true } />}
                            <VariableSearchResults />
                        </Fragment>
                    )
            ) }
        </Fragment>
    )
}