import { Fragment, useEffect, useState } from 'react'
import { List, Typography, Collapse, Space, Divider } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'
import './shopping-cart-list.css'

const { Text } = Typography
const { Panel } = Collapse

const CartSection = ({ name, data, renderItem }) => {
    const [expanded, setExpanded] = useState(true)
    const disabled = data.length === 0

    useEffect(() => {
        if (disabled) setExpanded(false)
    }, [disabled])

    return (
        <Collapse ghost activeKey={expanded ? [name] : []} onChange={ () => setExpanded(!expanded) }>
            <Panel
                key={name}
                disabled={ disabled }
                header={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text disabled={ disabled }>
                            {name} ({data.length})
                        </Text>
                        {/* {!disabled && (
                            <a type="button">Empty</a>
                        )} */}
                    </div>
                }
            >
                <div style={{ display: "flex" }}>
                    <List
                        dataSource={data}
                        renderItem={renderItem}
                        style={{ width: "100%" }}
                    />
                </div>
            </Panel>
        </Collapse>
    )
}

const RemoveItemButton = ({ onClick }) => (
    <CloseOutlined
        className="icon-btn"
        style={{ fontSize: 16, marginLeft: 8 }}
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
                        <Space direction="vertical">
                            <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                                <Text ellipsis style={{ flex: 1 }}>
                                    { concept.name } ({ concept.type })
                                </Text>
                                <RemoveItemButton onClick={ () => removeConceptFromCart(activeCart, concept) }/>
                            </div>
                            {/* <Space>
                                <Text type="secondary" italic>{ concept.id }</Text>
                            </Space> */}
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