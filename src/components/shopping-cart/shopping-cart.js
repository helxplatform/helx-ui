import { Fragment } from 'react'
import { Space, Layout, Typography, Menu, Button, Checkbox, Dropdown } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { CartList, CartListExtra, useShoppingCart } from 'antd-shopping-cart'
import './shopping-cart.css'

const { Title, Text } = Typography
const { Sider, Content } = Layout

export const ShoppingCart = () => {
  const { buckets, carts, activeCart, setActiveCart } = useShoppingCart()

  return (
    <Layout className="cart-layout" style={{ height: 0 }}>
      <Sider>
        <Menu
          mode="inline"
          selectedKeys={[ activeCart.name ]}
          style={{ height: "100%" }}
          items={ carts.sort((a, b) => a.name.localeCompare(b.name)).map((cart) => ({
            key: cart.name,
            name: cart.name,
            label: cart.name,
            icon: <ShoppingCartOutlined />
          }) )}
          onSelect={ ({ key: name }) => setActiveCart(name) }
        />
      </Sider>
      <Content style={{ background: "#fff" }}>
        <div style={{ display: "flex" }}>
          <Space align="end" style={{ flex: 1 }}>
            <Title
              level={ 4 }
              style={{
                marginTop: 0,
                marginBottom: 0,
                textTransform: "uppercase",
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: 0.5
              }}
            >
              { activeCart.name }
            </Title>
            <Text type="secondary" style={{ textTransform: "uppercase", letterSpacing: 0.25, fontWeight: 400, fontSize: 16 }}>
              { activeCart.items.length } item{ activeCart.items.length !== 1 ? "s" : "" }
            </Text>
          </Space>
          <Space style={{ flex: 0 }}>
            <a type="button">Manage</a>
          </Space>
        </div>
        <Space className="cart-layout-content" direction="vertical" style={{ marginTop: 8 }}>
          <CartList
            small={ false }
            checkableItems={ true }
            cartItemProps={{
              showQuantity: false
            }}
            renderExtra={ (props) => (
              <CartListExtra
                renderCheckoutText={ (selectedCount) => (
                  selectedCount > 0 ? `Export ${ selectedCount } selected item${ selectedCount !== 1 ? "s" : "" }` : "Export"
                ) }
                { ...props }
              />
            ) }
          />
        </Space>
      </Content>
    </Layout>
  )
}