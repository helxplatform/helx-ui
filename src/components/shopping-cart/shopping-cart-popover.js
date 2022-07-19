import { Fragment, useEffect, useState } from 'react'
import { Badge, Button, Popover, Space, List, Typography, Input, Form, Popconfirm, Modal } from 'antd'
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

const ShoppingCartPopoverContent = () => {
  const { carts, activeCart, addCart, setActiveCart } = useShoppingCart()
  const [manageCarts, setManageCarts] = useState(false)
  const [creatingCart, setCreatingCart] = useState(false)

  const [cartName, setCartName] = useState("")
  const [cartNameError, setCartNameError] = useState(false)

  useEffect(() => {
    if (creatingCart) {
      const highestExistingDefault = carts
        .map((cart) => /Shopping Cart (?<num>\d+)/.exec(cart.name)?.groups.num)
        .filter((match) => match !== undefined)
        .sort((a, b) => b - a)[0]
    const defaultName = `Shopping Cart ${highestExistingDefault !== undefined ? parseInt(highestExistingDefault) + 1 : 1}`
    setCartName(defaultName)}
  }, [creatingCart])

  useEffect(() => setCartNameError(false), [cartName])

  const createShoppingCart = () => {
    if (carts.find((cart) => cart.name === cartName)) {
      setCartNameError(true)
    } else {
      addCart(cartName)
      setCreatingCart(false)
      setManageCarts(false)
      setActiveCart(cartName)
    }
  }

  return (
    <Space direction="vertical">
      { creatingCart ? (
        <div>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Create a new cart</Text>
        </div>
      ) : manageCarts ? (
        <div>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Manage carts</Text>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>{ activeCart.name }</Text>
          <a type="button" onClick={ () => setManageCarts(true) }>View carts</a>
        </div>
      )}
      { creatingCart ? (
        <CartCreator
          cartName={ cartName }
          setCartName={ setCartName }
          cartNameError={ cartNameError }
        />
        ) : manageCarts ? (
        <ManageCarts close={ () => setManageCarts(false) } />
      ) : (
        <CartList />
      )}
      { creatingCart ? (
        <Space className="shopping-cart-popover-buttons" style={{ justifyContent: "flex-end" }}>
          <Button size="small" onClick={ () => setCreatingCart(false) }>Cancel</Button>
          <Button size="small" type="primary" onClick={ createShoppingCart }>Create cart</Button>
        </Space>
      ) : (
      <Space className="shopping-cart-popover-buttons">
        <Button onClick={ () => setCreatingCart(true) }>Create a cart</Button>
        <Button type="primary">
          Checkout
        </Button>
      </Space>
      )}
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