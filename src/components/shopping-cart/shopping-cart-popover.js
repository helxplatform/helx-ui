import { Fragment, useEffect, useState } from 'react'
import { Badge, Button, Popover, Space, List, Typography, Input, Form, Popconfirm, Modal, Dropdown, Menu, Divider } from 'antd'
import { PlusOutlined, MenuOutlined, SearchOutlined, DownOutlined, ShoppingCartOutlined as ShoppingCartIcon } from '@ant-design/icons'
import { useShoppingCart } from '../../contexts/'
import './shopping-cart-popover.css'

const { Title, Text, Paragraph } = Typography

const ManageCarts = ({ close }) => {
  const { carts, activeCart, setActiveCart, removeCart } = useShoppingCart()

  const selectCart = (cart) => {
    setActiveCart(cart.name)
    close()
  }

  const confirmDelete = (cart) => {
    Modal.confirm({
      title: "Confirm delete",
      content: "Are you sure you want to delete this cart?",
      // To make modal appear above popovers, which hasn't been fixed yet.
      maskStyle: { zIndex: 1031 },
      zIndex: 1032,
      onOk: () => removeCart(cart.name)
    })
  }

  return (
    <Fragment>
      <List
        className="manage-cart-list"
        dataSource={ carts }
        renderItem={(cart) => (
          <List.Item key={cart.name} className="manage-cart-item">
            <Text style={{ color: "rgba(0, 0, 0, 0.85)", fontWeight: cart === activeCart ? 600 : 400 }}>
              {cart.name}
            </Text>
            <Space style={{ flex: 0 }}>
              <Button type="primary" size="small" onClick={ () => selectCart(cart) }>Use</Button>
              {/* <Tooltip title="This cart cannot be deleted"> */}
              <Button type="ghost" size="small" disabled={ !cart.canDelete } onClick={ () => confirmDelete(cart) }>Delete</Button>
              {/* </Tooltip> */}
              
            </Space>
          </List.Item>
        )}
      />
    </Fragment>
  )
}

const CartCreator = ({ cartName, setCartName, cartNameError }) => {
  return (
    <Space direction="vertical" size="middle" style={{ marginTop: 8 }}>
      <Space direction="vertical">
        Cart name
        <Form.Item
          validateStatus={ cartNameError && "error" }
          help={ cartNameError ? "Carts cannot have duplicate names." : undefined }
          style={{ margin: 0 }}>
          <Input
            size="small"
            value={ cartName }
            onChange={ (e) => setCartName(e.target.value) }
          />
        </Form.Item>
      </Space>
      <Paragraph>
        Add items to a cart to...
      </Paragraph>
    </Space>
  )
}

const CartList = () => {
  return (
    <List
    />
  )
}

const CartSelectDropdown = ({ createNewCart, children }) => {
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
                <Text ellipsis style={{ fontWeight: 600 }}>"{ cartSearch }"</Text>
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

const CreateCartModal = ({ visible, onVisibleChange }) => {
  const { carts, addCart, setActiveCart } = useShoppingCart()

  const [cartName, setCartName] = useState("")
  const [cartNameError, setCartNameError] = useState(false)
  
  useEffect(() => {
    if (visible) {
      const highestExistingDefault = carts
        .map((cart) => /Shopping Cart (?<num>\d+)/.exec(cart.name)?.groups.num)
        .filter((match) => match !== undefined)
        .sort((a, b) => b - a)[0]
    const defaultName = `Shopping Cart ${highestExistingDefault !== undefined ? parseInt(highestExistingDefault) + 1 : 1}`
    setCartName(defaultName)}
  }, [visible])

  useEffect(() => setCartNameError(false), [cartName])

  const createShoppingCart = () => {
    if (carts.find((cart) => cart.name === cartName)) {
      setCartNameError(true)
    } else {
      addCart(cartName)
      setActiveCart(cartName)
      onVisibleChange(false)
    }
  }


  return (
    <Modal
      title="Create a cart"
      okText="Create"
      cancelText="Cancel"
      width={ 400 }
      visible={ visible }
      onVisibleChange={ onVisibleChange }
      onOk={ createShoppingCart }
      onCancel={ () => onVisibleChange(false) }
      zIndex={1032}
      maskStyle={{ zIndex: 1031 }}
    >
      <Space direction="vertical" size="middle">
        <Space direction="vertical">
          <Text style={{ fontWeight: 500 }}>Name</Text>
          <Form.Item
            validateStatus={ cartNameError && "error" }
            help={ cartNameError ? "Carts cannot have duplicate names." : undefined }
            style={{ margin: 0 }}>
            <Input
              placeholder="Cart name..."
              value={ cartName }
              onChange={ (e) => setCartName(e.target.value) }
              onKeyDown={ (e) => e.key === "Enter" && createShoppingCart() }
            />
          </Form.Item>
        </Space>
        <Paragraph>
          Add items to a cart to...
        </Paragraph>
      </Space>
    </Modal>
  )
}

const ShoppingCartPopoverContent = () => {
  const { carts, activeCart, addCart, setActiveCart } = useShoppingCart()
  const [creatingCart, setCreatingCart] = useState(false)

  return (
    <Space direction="vertical">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text ellipsis type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>{ activeCart.name }</Text>
          <CartSelectDropdown createNewCart={ () => setCreatingCart(true) }>
            <a type="button" style={{ marginLeft: 8 }}>
              <Space>
                Change
                <DownOutlined />
              </Space>
            </a>
          </CartSelectDropdown>
      </div>
      <Divider style={{ marginTop: 8, marginBottom: 8, marginLeft: -16, marginRight: -16, width: "calc(100% + 32px)" }} />
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
              fontWeight: 600,
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