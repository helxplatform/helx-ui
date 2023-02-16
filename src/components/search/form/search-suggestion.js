import { Typography } from "antd"
import { HistoryOutlined, SearchOutlined } from "@ant-design/icons"
import { useHelxSearch } from ".."

const { Text, Link } = Typography

const RemoveHistorySuggestion = ({ onRemove }) => {
    return (
        <Link role="button" type="secondary" onClick={onRemove} className="search-suggestion-remove-history">
            Remove
        </Link>
    )
}
export const SearchCompletion = ({ historyEntry, children=null }) => {
    const { searchHistory, setSearchHistory } = useHelxSearch()
    return (
        <div className={`search-suggestion ${historyEntry && 'search-history-suggestion'}`}>
            <Text type="secondary" style={{ marginRight: "16px" }}>
                {historyEntry ? (
                    <HistoryOutlined className="search-suggestion-history-icon"/>
                ) : (
                    <SearchOutlined className="search-suggestion-search-icon"/>
                )}
            </Text>
            <div style={{ flexGrow: 1}}>
                { children }
            </div>
            { historyEntry && (
                <RemoveHistorySuggestion onRemove={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSearchHistory(searchHistory.filter((entry) => entry !== historyEntry))
                }} />
            )}
        </div>
    )
}