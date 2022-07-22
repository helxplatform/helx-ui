import { Fragment, useCallback, useMemo, useState } from 'react'
import { Dropdown, Menu, Input, Typography, Space } from 'antd'
import { PlusOutlined, SearchOutlined, ShoppingCartOutlined as ShoppingCartIcon, StarOutlined, StarFilled } from '@ant-design/icons'
import { useShoppingCart } from '../../../contexts'

const { Text } = Typography

const newCartSearchEntryDefaultProps = {
  enabled: true,
  hint: "(Create new)",
  icon: <ShoppingCartIcon />,
  onClick: undefined
}

export const CartSelectDropdownMenu =  ({
  onSelect,
  newCartSearchEntry=newCartSearchEntryDefaultProps,
  disableActiveCart=true,
  disableSearchEntry=false,
  disableNewCartEntry=false,
  disableFavoriteButton=false,
  disableClearSearchEntry=false,
  cartIconRender=undefined,
  showMoreCutoff=6,
  cartEntryProps={},
  menuProps={},
  searchProps={}
}) => {
  const { carts, activeCart, addCart, updateCart, setActiveCart, modals: { createCart } } = useShoppingCart()
  const [cartSearch, setCartSearch] = useState("")
  const [showAll, setShowAll] = useState(false)

  newCartSearchEntry = { ...newCartSearchEntryDefaultProps, ...newCartSearchEntry }

  const showMoreDisabled = useMemo(() => (
    showMoreCutoff <= 0 || showMoreCutoff === null || showMoreCutoff === undefined
  ), [showMoreCutoff])

  const cartSource = useMemo(() => (
    carts
      .filter((cart) => cart.name.toLowerCase().includes(cartSearch.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => (b === activeCart) - (a === activeCart))
  ), [carts, activeCart, cartSearch])
  
  const createShoppingCart = useCallback((name) => {
    addCart(name)
    setActiveCart(name)
  },  [addCart, setActiveCart])

  const CartIcon = ({ cart }) => cartIconRender ? cartIconRender.call(null, cart) : <ShoppingCartIcon />
  
  return (
    <Menu
      className="cart-dropdown-menu"
      {...menuProps}
    >
      {!disableSearchEntry && (
        <Input
          className="cart-dropdown-search"
          prefix={ <SearchOutlined /> }
          placeholder="Search for a cart"
          allowClear
          value={cartSearch}
          onChange={(e) => setCartSearch(e.target.value)}
          {...searchProps}
        />
      )}
      {
        cartSource
          .slice(0, (showAll || showMoreDisabled) ? cartSource.length : showMoreCutoff)
          .map((cart) => {
            const StarIcon = cart.favorited ? StarFilled : StarOutlined
            const cartIcon = <CartIcon cart={ cart } />
            
            return (
              <Menu.Item
                key={cart.name}
                onClick={ ({ key: cartName }) => {
                  onSelect(
                    carts.find((cart)  => cart.name === cartName)
                  )
                }}
                disabled={ disableActiveCart && cart === activeCart }
                { ...cartEntryProps }
              >
                { cartIcon }
                {/* &bull; */}
                <Text
                  ellipsis
                  strong={cart === activeCart}
                  disabled={ disableActiveCart && cart === activeCart }
                  style={{ flex: 1, marginLeft: cartIcon ? 8 : 0 }}
                >
                  { cart.name }
                </Text>
                {!disableFavoriteButton && (
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
                )}
              </Menu.Item>
            )
          })
      }
      {
        newCartSearchEntry.enabled && cartSearch && !carts.find((cart) => cart.name === cartSearch) && (
          <Menu.Item key="menu-create-cart" onClick={
              newCartSearchEntry.onClick ?
                () => {
                  newCartSearchEntry.onClick.call(null, cartSearch)
                  setCartSearch("")
                } :
                () => {
                  createShoppingCart(cartSearch)
                  setCartSearch("")
                }
          }>
            { newCartSearchEntry.icon }
            <Text ellipsis strong style={{ marginLeft: newCartSearchEntry.icon ? 8 : 0 }}>"{ cartSearch }"</Text>
            <Text style={{ whiteSpace: "nowrap" }}>&nbsp;{ newCartSearchEntry.hint }</Text>
          </Menu.Item>
        )
      }
      {
        !showMoreDisabled && (cartSource.length > showMoreCutoff) && (
          <Menu.Item key="menu-show-more" onClick={ () => {} }>
            <a type="button" style={{ color: "#1890ff" }} onClick={ (e) => (
              // Don't want the event to bubble up to Menu.Item, because that will result in the menu closing.
              e.stopPropagation(),
              setShowAll(!showAll)
            )}>
              { showAll ? "Show less" : `Show ${ cartSource.length - showMoreCutoff } more carts` }
            </a>
          </Menu.Item>
        )
      }
      {
        !disableClearSearchEntry && cartSearch && (
          <Menu.Item key="menu-no-results-clear">
            <a type="button" style={{ color: "#1890ff" }} onClick={ (e) => (
              e.stopPropagation(),
              setCartSearch("")
            )}>Clear search</a>
          </Menu.Item>
        )
      }
      <Menu.Divider style={{ margin: 0 }} />
      {!disableNewCartEntry && (
        <Menu.Item key="menu-new-cart" onClick={ createCart }>
          <Space>
            <PlusOutlined />
            New cart
          </Space>
        </Menu.Item>
      )}
      {/* <Menu.Item onClick={ manageCarts }>
        <Space>
          <MenuOutlined />
          Manage carts
        </Space>
      </Menu.Item> */}
    </Menu>
  )
}

export const CartSelectDropdown = ({
  dropdownProps={},
  children,
  ...dropdownMenuProps
}) => {
  return (
    <Dropdown
      arrow={true}
      placement="bottomRight"
      trigger="hover"
      overlay={
        <CartSelectDropdownMenu { ...dropdownMenuProps }/>
      }
      { ...dropdownProps }
    >
      { children }
    </Dropdown>
  )
}