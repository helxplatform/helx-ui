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

    useEffect(() => {
        if (disabled) setExpanded(false)
    }, [disabled])

    return (
        <Fragment>
            <Collapse ghost activeKey={expanded ? [name] : []} onChange={ () => setExpanded(!expanded) }>
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

const RemoveItemButton = ({ onClick }) => (
    <DeleteOutlined
        className="icon-btn"
        style={{ fontSize: 14, marginLeft: 8 }}
        onClick={ onClick }
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
                    <List.Item key={concept.id}>
                        <Space direction="vertical" style={{ maxHeight: 400, gap: 4 }}>
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
            <Divider />
            <CartSection
                name="Studies"
                data={ studies }
                renderItem={(study) => (
                    <List.Item key={study.c_id}>
                        {study.name}
                    </List.Item>
                )}
            />
            <Divider />
            <CartSection
                name="Variables"
                data={ variables }
                renderItem={(variable) => (
                    <List.Item key={variable.id}>
                        {variable.name}
                    </List.Item>
                )}
            />
            <Divider />
        </div>
    )
}