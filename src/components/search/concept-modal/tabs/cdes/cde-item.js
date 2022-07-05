import { Fragment, useCallback, useMemo, useState } from 'react'
import { List, Collapse, Typography, Space, Tag, Button } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import _Highlighter from 'react-highlight-words'
import { useHelxSearch } from '../../../'
import { RelatedConceptsList } from './related-concepts'

const { Text, Link } = Typography
const { Panel } = Collapse

const Section = ({ title, children }) => (
    <Space size="small" direction="vertical">
        <div style={{ display: "flex", alignItems: "center" }}>
            <Text type="" style={{ fontSize: "12px", marginRight: "8px", fontWeight: "normal" }}>{title}</Text>
            <div style={{ flexGrow: 1, borderTop: "1px solid #eee" }} />
        </div>
        {children}
    </Space>
)

export const CdeItem = ({ cde, cdeRelatedConcepts, highlight }) => {
    const [collapsed, setCollapsed] = useState(false)

    const relatedConceptsSource = useMemo(() => (
        cdeRelatedConcepts[cde.id]
    ), [cdeRelatedConcepts, cde])

    const Highlighter = useCallback(({ ...props }) => (
        <_Highlighter searchWords={highlight} {...props}/>
    ), [highlight])

    return (
        <List.Item
            key={ `${cde.id}` }
        >
            <Collapse ghost activeKey={collapsed ? null : `${cde.id}-panel`} onChange={ () => setCollapsed(!collapsed) }>
                <Panel
                key={`${cde.id}-panel`}
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
                            />
                        </Section>
                        </Space>
                    </div>
                </Panel>
            </Collapse>
        </List.Item>
    )
}