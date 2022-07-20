import { useState } from 'react'
import { Dropdown, Menu, Input, Typography, Space } from 'antd'
import { PlusOutlined, SearchOutlined, ShoppingCartOutlined as ShoppingCartIcon, StarOutlined, StarFilled } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'

const { Text } = Typography

export const CartSelectDropdown = ({ createNewCart, children }) => {
  const { carts, activeCart, addCart, updateCart, setActiveCart } = useShoppingCart()
  const [cartSearch, setCartSearch] = useState("")
  const [showAll, setShowAll] = useState(false)

  const createShoppingCart = (name) => {
    addCart(name)
    setActiveCart(name)
  }

  const cartSource = carts
    // .filter((cart) => cart !== activeCart)
    .filter((cart) => cart.name.toLowerCase().includes(cartSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
    // .sort((a, b) => b.modifiedTime - a.modifiedTime)
    // .sort((a, b) => (b.favorited) - (a.favorited))
    .sort((a, b) => (b === activeCart) - (a === activeCart))

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
            cartSource
              .slice(0, showAll ? cartSource.length : 6)
              .map((cart) => {
                const StarIcon = cart.favorited ? StarFilled : StarOutlined
                return (
                  <Menu.Item key={cart.name} onClick={ (cart) => setActiveCart(cart.key) } disabled={cart === activeCart}>
                    <ShoppingCartIcon style={{ marginRight: 8 }} />
                    {/* &bull; */}
                    <Text strong={cart === activeCart} ellipsis disabled={cart === activeCart} style={{ flex: 1 }}>{ cart.name }</Text>
                    <StarIcon
                      className="icon-btn"
                      style={{
                        marginLeft: 4,
                        fontSize: 14,
                        color: cart.favorited ? "#1890ff" : "rgba(0, 0, 0, 0.85)"
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        updateCart(cart.name, {
                          favorited: !cart.favorited
                        })
                      }}
                    />
                  </Menu.Item>
                )
              })
          }
          {
            cartSearch && !carts.find((cart) => cart.name === cartSearch) && (
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
          {
            (showAll || cartSource.length > 6) && (
              <Menu.Item onClick={ (e) => e.preventDefault() }>
                <a type="button" style={{ color: "#1890ff" }} onClick={ () => setShowAll(!showAll) }>
                  { showAll ? "Show less" : `Show ${ cartSource.length - 6 } more carts` }
                </a>
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