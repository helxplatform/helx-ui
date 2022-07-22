import { Fragment, useEffect, useMemo, useState } from 'react'
import { List, Typography, Collapse, Space, Divider } from 'antd'
import { CloseOutlined, DeleteOutlined  } from '@ant-design/icons'
import { TweenOneGroup } from 'rc-tween-one'
import QueueAnim from 'rc-queue-anim'
import { useShoppingCart } from '../../../contexts'
import './shopping-cart-list.css'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

const CartSection = ({ name, data, renderItem }) => {
    const [expanded, setExpanded] = useState(true)
    const disabled = data.length === 0

    useEffect(() => {
        setExpanded(true)
    }, [data])

    return (
        <Fragment>
            <Collapse ghost activeKey={expanded && !disabled ? [name] : []} onChange={ () => setExpanded(!expanded) }>
                <Panel
                    key={name}
                    disabled={ disabled }
                    header={
                        <div style={{ display: "flex", justifyContent: "space-between", userSelect: "none" }}>
                            <Text style={{ fontWeight: 500 }} disabled={ disabled }>
                                {name} ({data.length})
                            </Text>
                            {/* {!disabled && (
                                <a type="button">Empty</a>
                            )} */}
                        </div>
                    }
                />
            </Collapse>
            <List
                style={{ overflow: "hidden" }}
            >
                <QueueAnim
                    className="ant-list-items"
                    component="ul"
                    duration={ 300 }
                    type={["right", "left"]}
                    leaveReverse
                >
                    { expanded ? data.map((item) => renderItem(item) ) : null }
                </QueueAnim>
            </List>
        </Fragment>
    )
}

const RemoveItemButton = ({ style={}, onClick, ...props }) => (
    <DeleteOutlined
        className="icon-btn"
        style={{ fontSize: 14, marginLeft: 8, ...style }}
        onClick={ onClick }
         {...props }
    />
)

export const CartList = () => {
    const { activeCart, removeConceptFromCart, removeStudyFromCart, removeVariableFromCart } = useShoppingCart()
    const { concepts, studies, variables } = activeCart

    return (
        <div className="shopping-cart-list">
            <CartSection
                name="Concepts"
                data={ concepts }
                renderItem={(concept) => (
                    <List.Item key={ concept.id }>
                        <Space direction="vertical" style={{ gap: 2 }}>
                            <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                                <Text ellipsis style={{ flex: 1, fontWeight: 400, color: "#434343" }}>
                                    { concept.name } ({ concept.type })
                                </Text>
                                <RemoveItemButton onClick={ () => removeConceptFromCart(activeCart, concept) }/>
                            </div>
                            <Paragraph className="cart-concept-description" type="secondary" ellipsis>
                                { concept.description }
                            </Paragraph>
                        </Space>
                    </List.Item>
                )}
            />
            <Divider className="cart-section-divider" />
            <CartSection
                name="Studies"
                data={ studies }
                renderItem={(study) => (
                    <List.Item key={ study.c_id }>
                        <Space direction="vertical" style={{ gap: 2 }}>
                            <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                                <Text style={{  flex: 1, color: "#434343" }} ellipsis>{ study.c_name }</Text>
                                <Text type="secondary" style={{ marginLeft: 8 }}>({ study.elements.length } variables)</Text>
                                <RemoveItemButton
                                    style={{ marginLeft: 12 }}
                                    onClick={ () => removeStudyFromCart(activeCart, study) }
                                />
                            </div>
                            {/* <Text type="secondary" ellipsis>
                                { study.elements.map((variable) => variable.name).join(", ") }
                            </Text> */}
                            {/* <Text type="secondary">{ study.c_id }</Text> */}
                        </Space>
                    </List.Item>
                )}
            />
            <Divider className="cart-section-divider" />
            <CartSection
                name="Variables"
                data={ variables }
                renderItem={(variable) => (
                    <List.Item key={ variable.id }>
                        { variable.name }
                    </List.Item>
                )}
            />
            {/* <Divider style={{ margin: "2px 0" }} /> */}
        </div>
    )
}