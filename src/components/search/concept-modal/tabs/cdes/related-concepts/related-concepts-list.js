import { Fragment, useMemo, useState } from 'react'
import { Button, Typography } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { RelatedConceptTag } from './related-concept-tag'

const { Text } = Typography

const DEFAULT_SHOW_COUNT = 8
const SHOW_COUNT_INCREMENT = 6

export const RelatedConceptsList = ({ concepts, highlight }) => {
    const [showCount, setShowCount] = useState(DEFAULT_SHOW_COUNT)
    
    const showingAll = showCount === concepts.length
    const shownConcepts = concepts.slice(0, showCount)
    const hiddenConcepts = concepts.slice(showCount)
    const hiddenHighlighted = hiddenConcepts.filter((concept) => (
        highlight.some((token) => concept.name.includes(token))
    ))

    return (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            {
                shownConcepts.map((concept) => (
                    <RelatedConceptTag
                        key={concept.id}
                        concept={concept}
                        highlight={highlight}
                    />
                ))
            }
            {hiddenHighlighted.length > 0 && (
                <Fragment>
                    <Text type="secondary" style={{ fontSize: "16px" }}>...</Text>
                    {
                        hiddenHighlighted.map((concept) => (
                            <RelatedConceptTag
                                key={concept.id}
                                concept={concept}
                                highlight={highlight}
                            />
                        ))
                    }
                </Fragment>
            )}
            <Button
                size="small"
                type="link"
                style={{ fontSize: "12px" }}
                onClick={ () => !showingAll ?
                    setShowCount(concepts.length) :
                    setShowCount(DEFAULT_SHOW_COUNT)
                }
            >
                { !showingAll ? "Show all" : "Show less" }
            </Button>
        </div>
    )
}