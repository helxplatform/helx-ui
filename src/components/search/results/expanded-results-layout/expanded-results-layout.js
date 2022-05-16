import { Space, Divider, Menu, List, Typography } from 'antd'
import { useEffect } from 'react/cjs/react.development'
import { ResultsHeader } from '..'
import { PaginationTray, SearchForm, useHelxSearch } from '../..'
import './expanded-results-layout.css'

const { Text } = Typography

export const ExpandedResultsLayout = () => {
    const { concepts, selectedResult, setSelectedResult, currentPage, perPage, isLoadingConcepts } = useHelxSearch()

    useEffect(() => {
        if (concepts.length > 0) setSelectedResult(concepts[0])
    }, [concepts])
    return (
        <Space className="expanded-results-layout">
            <Space direction="vertical" className="results">
                <SearchForm type="minimal"/>
                <ResultsHeader />
                <List
                    loading={isLoadingConcepts}
                    dataSource={concepts}
                    renderItem={(result) => (
                        <List.Item
                            key={result.id}
                            onClick={() => setSelectedResult(result)}
                            className={"expanded-result-option" + (result.id === selectedResult?.id ? " selected" : "")}
                            style={{ backgroundColor: "", padding: "12px 24px" }}
                        >
                            {result.name}
                        </List.Item>
                    )}
                    style={{ display: concepts.length === 0 ? "none" : undefined }}
                />
                {/* { pageCount > 1 && <PaginationTray /> } */}
            </Space>
            <Divider type="vertical" style={{ height: "100%" }}/>
            <div className="expanded-result-container">
                <Text>
                {JSON.stringify(selectedResult)}
                </Text>
            </div>
        </Space>
    )
}