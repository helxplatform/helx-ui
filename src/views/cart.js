import { Fragment, useEffect } from 'react'
import { Space, Layout, Typography, Menu, Tabs, List } from 'antd'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { CartList, useShoppingCart } from 'antd-shopping-cart'
import { useEnvironment } from '../contexts'
import { Breadcrumbs } from '../components/layout'

const { Title, Text } = Typography
const { Sider, Content } = Layout
const { TabPane } = Tabs

export const ShoppingCartView = () => {
  const { context } = useEnvironment()
  const { buckets, carts, activeCart, setActiveCart } = useShoppingCart()

  const breadcrumbs = [
    { text: 'Home', path: '/helx' },
    // { text: 'Search', path: '/helx/search' },
    { text: 'Cart', path: '/cart' },
  ]

  useEffect(() => {
    document.title = `Shopping Cart · HeLx UI`
  }, [])

  return (
    <Fragment>
      { context.workspaces_enabled === 'true' && <Breadcrumbs crumbs={breadcrumbs} /> }
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
                { activeCart.items.length } items
              </Text>
            </Space>
            <Space style={{ flex: 0 }}>
              <a type="button">Manage</a>
            </Space>
          </div>
          <Space className="cart-layout-content" direction="vertical" style={{ marginTop: 8 }}>
            <CartList small={ false } />
          </Space>
          <div className="cart-content-footer" style={{ paddingTop: 24, marginBottom: -8, borderTop: "1px solid #f0f0f0" }}>footer</div>
        </Content>
      </Layout>
    </Fragment>
  )
}