import { List } from 'antd'
import { CdeItem } from './cde-item'

export const CdeList = ({ cdes, cdeRelatedConcepts, highlight, loading }) => {
    return (
        <List
            loading={loading}
            dataSource={cdes}
            renderItem={(cde) => (
                <CdeItem cde={ cde } cdeRelatedConcepts={ cdeRelatedConcepts } highlight={highlight} />
            )}
        />
    )
}