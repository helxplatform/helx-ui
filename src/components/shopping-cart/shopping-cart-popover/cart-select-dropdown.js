import { useState } from 'react'
import { Dropdown, Menu, Input, Typography, Space } from 'antd'
import { PlusOutlined, SearchOutlined, ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'

const { Text } = Typography

export const CartSelectDropdown = ({ createNewCart, children }) => {
  const { carts, activeCart, addCart, setActiveCart } = useShoppingCart()
  const [cartSearch, setCartSearch] = useState("")

  const createShoppingCart = (name) => {
    addCart(name)
    setActiveCart(name)
  }

  return (
    <Dropdown
      arrow={true}
      placement="bottomRight"
      trigger="hover"
      overlay={
        <Menu
          className="cart-dropdown-menu"
        >
          <Input
            className="cart-dropdown-search"
            prefix={ <SearchOutlined /> }
            placeholder="Search for a cart"
            allowClear
            value={cartSearch}
            onChange={(e) => setCartSearch(e.target.value)}
          />
          {
            carts
              // .filter((cart) => cart !== activeCart)
              .filter((cart) => cart.name.toLowerCase().includes(cartSearch.toLowerCase()))
              .sort((a, b) => (b === activeCart) - (a === activeCart))
              .map((cart) => (
                <Menu.Item key={cart.name} onClick={ (cart) => setActiveCart(cart.key) } disabled={cart === activeCart}>
                  <ShoppingCartIcon style={{ marginRight: 8 }} />
                  {/* &bull; */}
                  <Text ellipsis disabled={cart === activeCart}>{ cart.name }</Text>
                </Menu.Item>
              ))
          }
          {
            cartSearch && !carts.find((cart) => cart.name.toLowerCase() === cartSearch.toLowerCase()) && (
              <Menu.Item onClick={ () => {
                createShoppingCart(cartSearch)
                setCartSearch("")
              }}>
                <ShoppingCartIcon style={{ marginRight: 8 }} />
                <Text ellipsis strong>"{ cartSearch }"</Text>
                &nbsp;
                <Text style={{ whiteSpace: "nowrap" }}>(Create new)</Text>
              </Menu.Item>
            )
          }
          <Menu.Divider style={{ margin: 0 }} />
          <Menu.Item onClick={ createNewCart }>
            <Space>
              <PlusOutlined />
              New cart
            </Space>
          </Menu.Item>
          {/* <Menu.Item onClick={ manageCarts }>
            <Space>
              <MenuOutlined />
              Manage carts
            </Space>
          </Menu.Item> */}
        </Menu>
      }
    >
      { children }
    </Dropdown>
  )
}