import { Space, Divider, Menu, List, Typography } from 'antd'
import { ResultsHeader } from '..'
import { PaginationTray, SearchForm, useHelxSearch } from '../..'
import './expanded-results-layout.css'

const { Text } = Typography

export const ExpandedResultsLayout = () => {
    const { concepts, selectedResult, setSelectedResult, currentPage, perPage, isLoadingConcepts } = useHelxSearch()
    return (
        <Space className="expanded-results-layout">
            <Space direction="vertical" className="results">
                <SearchForm type="minimal"/>
                <ResultsHeader />
                <List
                    loading={isLoadingConcepts}
                    bordered
                    dataSource={concepts}
                    renderItem={(result) => (
                        <List.Item
                            key={result.id}
                            onClick={() => setSelectedResult(result)}
                            className={"expanded-result-option" + (result.id === selectedResult?.id ? " selected" : "")}
                            style={{ backgroundColor: "white" }}
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