import { Fragment, useEffect, useState } from 'react'
import { Badge, Button, Popover, Space, List, Typography, Input, Form, Popconfirm, Modal, Dropdown, Menu, Divider } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts/'
import { CartList } from './cart-list'
import { CartSelectDropdown } from './cart-select-dropdown'
import { CreateCartModal } from '../create-cart-modal'
import './shopping-cart-popover.css'

const { Title, Text, Paragraph } = Typography

const ShoppingCartPopoverContent = () => {
  const { carts, activeCart, addCart, setActiveCart } = useShoppingCart()
  const [creatingCart, setCreatingCart] = useState(false)

  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text ellipsis type="" style={{ fontSize: 15, fontWeight: 500 }}>{ activeCart.name }</Text>
          <CartSelectDropdown createNewCart={ () => setCreatingCart(true) }>
            <a type="button" style={{ marginLeft: 8 }}>
              <Space>
                Change
                <DownOutlined />
              </Space>
            </a>
          </CartSelectDropdown>
      </div>
      <Divider style={{ marginTop: 4, marginBottom: 8, marginLeft: -16, marginRight: -16, width: "calc(100% + 32px)" }} />
      <CartList />
      <Button type="primary" block>
        Checkout
      </Button>

      <CreateCartModal visible={ creatingCart } onVisibleChange={ setCreatingCart } />
    </Space>
  )
}

export const ShoppingCartPopover = ({ visible, onVisibleChange, children }) => {
  // useEffect(() => {
  //   if (!visible) 
  // }, [visible])
  return (
    <Badge count={0} offset={[-8, 0]}>
      <Popover
        overlayClassName="shopping-cart-popover"
        title={
          <Title
            level={5}
            style={{
              marginTop: 8,
              marginBottom: 8,
              fontSize: 12,
              letterSpacing: "0.5px",
              color: "#434343",
              textTransform: "uppercase"
            }}
          >
            Shopping Cart
          </Title>
        }
        content={
          <ShoppingCartPopoverContent />
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