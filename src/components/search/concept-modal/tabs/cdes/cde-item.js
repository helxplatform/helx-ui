import { Fragment, useCallback, useMemo, useState } from 'react'
import { List, Collapse, Typography, Space, Button } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import _Highlighter from 'react-highlight-words'
import { RelatedConceptsList } from './related-concepts'
import { SideCollapse } from '../../../..'
import { useAnalytics } from '../../../../../contexts'

const { Text, Link } = Typography
const { Panel } = Collapse

const Section = ({ title, children }) => (
    <Space size="small" direction="vertical" className="cde-section">
        <div style={{ display: "flex", alignItems: "center" }}>
            {title && <Text type="" style={{ fontSize: "12px", marginRight: "8px", fontWeight: "normal" }}>{title}</Text>}
            <div style={{ flexGrow: 1, borderTop: "1px solid #eee" }} />
        </div>
        {children}
    </Space>
)

export const CdeItem = ({ cde, cdeRelatedConcepts, highlight }) => {
    const [collapsed, setCollapsed] = useState(false)
    
    const { analyticsEvents } = useAnalytics()

    const relatedConceptsSource = useMemo(() => (
        cdeRelatedConcepts[cde.id]
    ), [cdeRelatedConcepts, cde])

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
                    <Section title="Studies using this measure">
                        <ul>
                            <li>Discovery of Biomarker Signatures Prognostic for Neuropathic Pain after Acute Spinal Cord Injury (<a href="https://healdata.org/portal/discovery/HDP00337">HEALDATAPLATFORM:HDP00337</a>)
                            </li>
                            <ul>
                                <li>tapsprescriptionmedusescl</li>
                                <Text><em>5. in the past 12 months, how often have you used any prescription medications just for the feeling, more than prescribed or that were not prescribed for you? prescription medications that may be used this way include: opiate pain relievers (for example, oxycontin, vicodin, percocet, methadone) medications for anxiety or sleeping (for example, xanax, ativan, klonopin) medications for adhd (forexample, adderall or ritalin)</em></Text>

                            </ul>
                        </ul>
                    </Section>
                    <Section title="Related concepts">
                        <RelatedConceptsList
                            concepts={relatedConceptsSource}
                            highlight={highlight}
                            onShowMore={ (expanded) => {
                                analyticsEvents.cdeRelatedConceptsToggled(cde.id, expanded)
                            } }
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