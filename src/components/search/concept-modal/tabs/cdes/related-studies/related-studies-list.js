import { useState } from 'react'
import { List, Typography, Button } from 'antd'
import { useAnalytics } from '../../../../../../contexts'

const { Text } = Typography


/** Only display these many related studies initially. */
const SHOW_MORE_CUTOFF = 3

export const RelatedStudiesList = ({relatedStudySource}) => {
    const { analyticsEvents } = useAnalytics()
    // const studyLinkClicked = () => {
    //   analyticsEvents.studyLinkClicked(study.c_id)
    // }
    const [showMore, setShowMore] = useState(false)

    if (!relatedStudySource) return (
        <Text style={{ fontSize: 13, color: "rgba(0, 0, 0, 0.45)" }}>We couldn&apos;t load any related studies.</Text>
    )

    // Sort the related studies.
    const relatedStudies = relatedStudySource.sort((a, b) => { return b.c_id < a.c_id});

    if (relatedStudies.length === 0) return (
        <Text style={{ fontSize: 13, color: "rgba(0, 0, 0, 0.45)" }}>We don&apos;t know of any related studies.</Text>
    )

    return (
        <div>
            <List
                size="small"
                dataSource={showMore ? relatedStudies : relatedStudies.slice(0, SHOW_MORE_CUTOFF)}
                renderItem={(study) => (
                    <List.Item key={study.c_id}>
                    <List.Item.Meta
                        size="small"
                        description={
                            <>
                            {study.c_name} (<a href={study.c_link} target="_blank" rel="noopener noreferrer">{study.c_id}</a>)
                            </>
                        }
                    />
                    </List.Item>
                )}
            />
            { relatedStudies.length > SHOW_MORE_CUTOFF && (
                <Button
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={ () => setShowMore(!showMore) }
                >
                    { showMore ? "Show less" : "Show more" }
                </Button>
            ) }
        </div>
    )
}