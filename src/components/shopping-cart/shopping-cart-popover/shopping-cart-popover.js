import { Fragment, useEffect, useState } from 'react'
import { Badge, Button, Popover, Space, List, Typography, Input, Form, Popconfirm, Modal, Dropdown, Menu, Divider, Tooltip } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts/'
import { CartList } from './cart-list'
import { CartSelectDropdown } from './cart-select-dropdown'
import { CreateCartModal } from '../create-cart-modal'
import './shopping-cart-popover.css'

const { Title, Text, Paragraph } = Typography

export const ShoppingCartPopover = ({ visible, onVisibleChange, children }) => {
  const { activeCart, cartUtilities: { countCart } } = useShoppingCart()
  const [creatingCart, setCreatingCart] = useState(false)

  const checkoutDisabled = countCart(activeCart) === 0
  
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
                textTransform: "uppercase"
              }}
            >
              {activeCart.name}
            </Title>
            <CartSelectDropdown createNewCart={ () => setCreatingCart(true) }>
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
            <Tooltip placement="bottom" title={ checkoutDisabled ? "You need to add items to the cart." : undefined}>
              <Button type="primary" block disabled={ checkoutDisabled }>
                Checkout
              </Button>
            </Tooltip>
            <CreateCartModal visible={ creatingCart } onVisibleChange={ setCreatingCart } />
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