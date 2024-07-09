import { Fragment, useCallback, useMemo, useState } from 'react'
import { List, Collapse, Typography, Space, Button } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import _Highlighter from 'react-highlight-words'
import { RelatedConceptsList } from './related-concepts'
import Highlighter from 'react-highlight-words'
import { SideCollapse } from '../../../..'
import { useAnalytics } from '../../../../../contexts'

const { Text, Link } = Typography
const { Panel } = Collapse

const SHOW_MORE_CUTOFF = 4

const Section = ({ title, children }) => (
    <Space size="small" direction="vertical" className="cde-section">
        <div style={{ display: "flex", alignItems: "center" }}>
            {title && <Text type="" style={{ fontSize: "12px", marginRight: "8px", fontWeight: "normal" }}>{title}</Text>}
            <div style={{ flexGrow: 1, borderTop: "1px solid #eee" }} />
        </div>
        {children}
    </Space>
)

const RelatedStudiesList = ({relatedStudySource}) => {
    const { analyticsEvents } = useAnalytics()
    // const studyLinkClicked = () => {
    //   analyticsEvents.studyLinkClicked(study.c_id)
    // }
    const [showMore, setShowMore] = useState(false)

    return (
        <div>
            <List
                size="small"
                dataSource={showMore ? relatedStudySource : relatedStudySource.slice(0, SHOW_MORE_CUTOFF-1)}
                renderItem={(study) => (
                    <List.Item key={study.c_id}>
                    <List.Item.Meta
                        size="small"
                        description={
                            <>
                            <font size="-1"><a href={study.c_link} target="_blank" rel="noopener noreferrer">{study.c_id}</a></font>: {study.c_name}
                            </>
                        }
                    />
                    </List.Item>
                )}
            />
            { relatedStudySource.length > SHOW_MORE_CUTOFF && (
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

export const CdeItem = ({ cde, cdeRelatedConcepts, cdeRelatedStudies, highlight }) => {
    const [collapsed, setCollapsed] = useState(false)
    
    const { analyticsEvents } = useAnalytics()

    const relatedConceptsSource = useMemo(() => (
        cdeRelatedConcepts[cde.id]
    ), [cdeRelatedConcepts, cde])

    const relatedStudySource = useMemo(() => (
        cdeRelatedStudies[cde.id]
    ), [cdeRelatedStudies, cde])

    const Highlighter = useCallback(({ ...props }) => (
        <_Highlighter autoEscape={ true } searchWords={highlight} {...props}/>
    ), [highlight])

    return (
        <List.Item
            key={ `${cde.id}` }
            className="cde-item"
        >
            <SideCollapse
                collapsed={ collapsed }
                onCollapse={ (collapsed) => {
                    analyticsEvents.cdeToggled(cde.id, !collapsed)
                    setCollapsed(collapsed)
                } }
                header={
                    <Fragment>
                        <Text style={{ fontWeight: "500", fontSize: "14px" }}>
                            <Highlighter textToHighlight={ cde.name } />
                        </Text>
                        {/* Only show the "Open study" button if the CDE has a link attached to it. */}
                        {cde.e_link && (
                            <Button
                                type="text"
                                size="small"
                                icon={
                                    <ExportOutlined onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        window.open(cde.e_link, "_blank")
                                    }} />
                                }
                                style={{ marginLeft: "4px" }}
                            />
                        )}
                    </Fragment>
                }
            >
                <Space direction="vertical" size="middle" className="cde-content">
                    <List.Item.Meta
                        // title={ cde.name }
                        description={
                            <Section title="Description">
                                <Text type="secondary">
                                    <Highlighter textToHighlight={ cde.description } />
                                </Text>
                            </Section>
                        }
                    />
                    <Section title="Related concepts">
                        <RelatedConceptsList
                            concepts={relatedConceptsSource}
                            highlight={highlight}
                            onShowMore={ (expanded) => {
                                analyticsEvents.cdeRelatedConceptsToggled(cde.id, expanded)
                            } }
                        />
                    </Section>
                    <Section title="Studies using this measure">
                        <RelatedStudiesList
                            relatedStudySource={relatedStudySource}
                        />
                    </Section>
                    {false && <Section>
                        {/* Bottom button container */}
                        <Button type="primary" size="small" style={{ marginTop: "8px" }}>Go</Button>
                    </Section>}
                </Space>
            </SideCollapse>
        </List.Item>
    )
}