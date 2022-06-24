import { Fragment, useMemo, useState } from 'react'
import { List, Collapse, Typography, Space, Tag, Button } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import { useHelxSearch } from '../../../'

const { Text, Link } = Typography
const { Panel } = Collapse

const Section = ({ title, children }) => (
    <Space size="small" direction="vertical">
        <div style={{ display: "flex", alignItems: "center" }}>
            <Text type="" style={{ fontSize: "12px", marginRight: "8px", fontWeight: 500 }}>{title}</Text>
            <div style={{ flexGrow: 1, borderTop: "1px solid #eee" }} />
        </div>
        {children}
    </Space>
)

const SHOW_COUNT_INCREMENT = 6

export const CdeItem = ({ cde, cdeRelatedConcepts }) => {
    const [collapsed, setCollapsed] = useState(false)
    const [showCount, setShowCount] = useState(8)
    const { doSearch, setSelectedResult } = useHelxSearch()

    const relatedConceptsSource = useMemo(() => (
        cdeRelatedConcepts[cde.id].slice(0, showCount)
    ), [cdeRelatedConcepts, showCount])
    return (
        <List.Item
            key={ `${cde.id}` }
        >
            <Collapse ghost activeKey={collapsed ? null : `${cde.id}-panel`} onChange={ () => setCollapsed(!collapsed) }>
                <Panel
                key={`${cde.id}-panel`}
                    header={
                        <Fragment>
                            <Text style={{ fontWeight: "500", fontSize: "14px" }}>{cde.name}</Text>
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
                    className="cde-collapse"
                >
                    <div style={{ display: "flex" }}>
                        <div className="collapse-handle-container" onClick={ () => setCollapsed(true) }>
                            <div className="collapse-handle" />
                        </div>
                        <Space direction="vertical" size="middle">
                        <List.Item.Meta
                            // title={ cde.name }
                            description={
                                <Section title="Description">
                                    <Text>{cde.description}</Text>
                                </Section>
                            }
                        />
                        <Section title="Related concepts">
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                {relatedConceptsSource.map((concept) => (
                                    <Tag style={{ margin: 0 }} onClick={() => {
                                        doSearch(concept.name)
                                    }}>
                                        <a type="button" key={concept.name}>{concept.name}</a>
                                    </Tag>
                                ))}
                                {showCount < cdeRelatedConcepts[cde.id].length && (
                                    <Button
                                        size="small"
                                        type="link"
                                        style={{ fontSize: "12px" }}
                                        onClick={ () => setShowCount(cdeRelatedConcepts[cde.id].length) }
                                    >
                                        Show all
                                    </Button>
                                )}
                            </div>
                        </Section>
                        </Space>
                    </div>
                </Panel>
            </Collapse>
        </List.Item>
    )
}