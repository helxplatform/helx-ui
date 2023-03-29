import { Empty, List, Typography } from 'antd'
import { CdeItem } from './cde-item'

const { Text } = Typography

export const CdeList = ({ cdes, cdeRelatedConcepts, highlight, loading, failed }) => {
    if (failed) return (
        <Empty
            image={ Empty.PRESENTED_IMAGE_SIMPLE }
            description="Sorry! We weren't able to find any CDEs linked to this concept."
        />
    )
    return (
        <List
            loading={{
                spinning: loading,
                tip: (
                    <div style={{ marginTop: 8 }}>We're digging into data for you. Hang tight!</div>
                ),
                style: { color: "rgba(0,0,0, 0.45)" }
            }}
            dataSource={cdes}
            renderItem={(cde) => (
                <CdeItem cde={ cde } cdeRelatedConcepts={ cdeRelatedConcepts } highlight={highlight} />
            )}
        />
    )
}