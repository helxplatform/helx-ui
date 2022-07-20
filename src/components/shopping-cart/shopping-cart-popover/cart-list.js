import { Fragment, useEffect, useState } from 'react'
import { List, Typography, Collapse, Space, Divider } from 'antd'
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
                header={`${name} (${data.length})`}
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

export const CartList = () => {
    const { activeCart } = useShoppingCart()
    const { concepts, studies, variables } = activeCart

    return (
        <div className="shopping-cart-list">
            <CartSection
                name="Concepts"
                data={ concepts }
                renderItem={(concept) => (
                    <List.Item key={concept.id}>
                        <div style={{ display: "flex", width: "100%" }}>
                            <Text ellipsis>
                                {concept.name} ({concept.type})
                            </Text>
                        </div>
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