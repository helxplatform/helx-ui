import { Fragment, useMemo, useState } from 'react'
import { Button, Typography } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import { RelatedConceptTag } from './related-concept-tag'

const { Text } = Typography

const SHOW_COUNT = 8

export const RelatedConceptsList = ({ concepts, highlight }) => {
    const [showingAll, setShowingAll] = useState(false)

    const failed = useMemo(() => concepts === null, [concepts])
    if (failed) concepts = []

    const showCount = useMemo(() => showingAll ? concepts.length : SHOW_COUNT, [showingAll, concepts])
    const hideShowAll = useMemo(() => concepts.length <= SHOW_COUNT, [concepts])

    const shownConcepts = concepts.slice(0, showCount)
    const hiddenConcepts = concepts.slice(showCount)
    const hiddenHighlighted = hiddenConcepts.filter((concept) => (
        highlight.some((token) => concept.name.includes(token))
    ))

    if (failed) return (
        <Text style={{ fontSize: 13, color: "rgba(0, 0, 0, 0.45)" }}>We couldn't load any related concepts.</Text>
    )

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
            {!hideShowAll && (
                <Button
                    size="small"
                    type="link"
                    style={{ fontSize: "12px" }}
                    onClick={ () => setShowingAll(!showingAll)
                    }
                >
                    { !showingAll ? `Show ${hiddenConcepts.length - hiddenHighlighted.length} more results` : "Show less" }
                </Button>
            )}
        </div>
    )
}