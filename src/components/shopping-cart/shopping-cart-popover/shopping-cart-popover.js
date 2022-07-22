import { Fragment, useEffect, useState } from 'react'
import { Badge, Button, Popover, Space, List, Typography, Input, Form, Popconfirm, Modal, Dropdown, Menu, Divider, Tooltip } from 'antd'
import { DownOutlined, ClearOutlined, ShoppingCartOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import Texty from 'rc-texty'
import TweenOne from 'rc-tween-one'
import { useShoppingCart } from '../../../contexts/'
import { CartList } from './cart-list'
import { CartSelectDropdown } from './cart-select-dropdown'
import './shopping-cart-popover.css'

const { Title, Text, Paragraph } = Typography

export const ShoppingCartPopover = ({ visible, onVisibleChange, children }) => {
  const { activeCart, setActiveCart, emptyCart, cartUtilities: { countCart } } = useShoppingCart()
  const [name, setName] = useState("")

  const checkoutDisabled = countCart(activeCart) === 0

  /* Forces   */
  useEffect(() => {
    setName("")
  }, [activeCart.name])

  useEffect(() => {
    if (!name) setName(activeCart.name)
  }, [name])
  
  return (
    <Badge count={0} offset={[-8, 0]}>
      <Popover
        overlayClassName="shopping-cart-popover"
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}>
            <Title
              level={5}
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: "0.5px",
                color: "#434343",
                textTransform: "uppercase",
                overflow: "hidden",
                // border: "1px solid red"
              }}
            >
              <Texty type="alpha" mode="sync" duration={ 300 } component="span">{name}</Texty>
            {/* <> &bull; { countCart(activeCart) } items </> */}
            </Title>
            <CartSelectDropdown onSelect={ (cart) => setActiveCart(cart) }>
              <a type="button" style={{ marginLeft: 8 }}>
                <Space>
                  Change
                  <DownOutlined />
                </Space>
              </a>
            </CartSelectDropdown>
          </div>
        }
        content={
          <Space direction="vertical">
            <CartList />
            <div style={{ display: "flex" }}>
              <Popconfirm
                overlayClassName="clear-cart-confirm"
                title={
                  <Space direction="vertical">
                    <Space>
                      {/* <Text type="warning"><ExclamationCircleOutlined /></Text> */}
                      <Text style={{ fontWeight: 500, fontSize: 15 }}>Are you sure you want to empty your cart?</Text>
                    </Space>
                    <Paragraph>
                      You won't be able to undo this action.
                    </Paragraph>
                    {/* <Divider style={{ margin: "8px 0" }} /> */}
                  </Space>
                }
                icon={ null }
                onConfirm={ () => emptyCart(activeCart) }
                okText="Yes, empty it"
                cancelText="Cancel"
              >
                <Button type="ghost">
                  Empty
                </Button>
              </Popconfirm>
              <Tooltip placement="bottom" title={ checkoutDisabled ? "You need to add items to the cart." : undefined}>
                {/* Button transitions don't currently work properly on Tooltip-wrapped buttons due to a bug in antd.  */}
                <span style={{
                  flexGrow: 1,
                  marginLeft: 8,
                  ...( checkoutDisabled ? { display: "inline-block", cursor: "not-allowed", width: "100%" } : {} )
                }}>
                  <Button
                    type="primary"
                    block
                    icon={ <ShoppingCartOutlined /> }
                    disabled={ checkoutDisabled }
                    style={{
                      pointerEvents: checkoutDisabled ? "none" : undefined
                    }}
                  >
                    Checkout
                  </Button>
                </span>
              </Tooltip>
            </div>
          </Space>
        }
        placement="bottomLeft"
        trigger="click"
        visible={ visible }
        onVisibleChange={ onVisibleChange }
        overlayStyle={{ minWidth: 300 }}
      >
        { children }
      </Popover>
    </Badge>
  )
}