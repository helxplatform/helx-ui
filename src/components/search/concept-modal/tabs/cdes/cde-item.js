import { useState } from 'react'
import { List, Collapse, Typography, Space, Tag } from 'antd'


const { Text } = Typography
const { Panel } = Collapse

export const CdeItem = ({ cde, cdeRelatedConcepts }) => {
    const [collapsed, setCollapsed] = useState(false)
    return (
        <List.Item
            key={ `${cde.id}` }
        >
            <Collapse ghost activeKey={collapsed ? null : `panel-key0`} onChange={ () => setCollapsed(!collapsed) }>
                <Panel
                key={`panel-key0`}
                    header={
                        <Text style={{ fontWeight: "500", fontSize: "14px" }}>{cde.name}</Text>
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
                            description={ cde.description }
                        />
                        <div style={{ display: "flex", alignItems: "center" }}>
                            {/* <div style={{ width: "32px", marginRight: "8px", borderTop: "1px solid #f0f0f0" }} /> */}
                            <Text type="" style={{ fontSize: "12px", marginRight: "8px" }}>Related concepts</Text>
                            <div style={{ flexGrow: 1, borderTop: "1px solid #f0f0f0" }} />
                        </div>
                        {cdeRelatedConcepts && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {cdeRelatedConcepts[cde.id].slice(0, 6).map((concept) => (
                                <Tag style={{ margin: 0 }}>
                                <a type="button" key={concept.name}>{concept.name}</a>
                                </Tag>
                            ))}
                            </div>
                        )}
                        </Space>
                    </div>
                </Panel>
            </Collapse>
        </List.Item>
    )
}