import { Fragment, useEffect } from 'react'
import { Space, Layout, Typography, Menu, Tabs, List, Button, Checkbox, Dropdown } from 'antd'
import { ShoppingCartOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons'
import QueueAnim from 'rc-queue-anim'
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
              renderExtra={ ({ selectedItems, setSelectedItems }) => {
                const selected = selectedItems.length > 0
                return (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="selected-buttons" style={{ flex: 1 }}>
                      { selected && (
                        <Fragment>
                          <Dropdown
                            trigger="click"
                            overlay={ <div>foobar</div> }
                          >
                            <Button.Group>
                              <Button size="small" type="text">
                                <Space>
                                  <Checkbox indeterminate />
                                  {/* <DownOutlined style={{ fontSize: 10 }} /> */}
                                </Space>
                              </Button>
                              <Button size="small" type="text">
                                <DownOutlined style={{ fontSize: 10 }} />
                              </Button>
                            </Button.Group>
                          </Dropdown>
                          <Button size="small" style={{ marginLeft:  8 }} icon={ <DeleteOutlined /> } onClick={ () => null }>
                            Remove selected
                          </Button>
                          <Button size="small" style={{ marginLeft: 8 }} onClick={ () => null }>
                            Move items
                          </Button>
                          <Button size="small" style={{ marginLeft: 8 }} onClick={ () => null }>
                            Copy items
                          </Button>
                        </Fragment>
                      ) }
                      </div>
                    {/* { selected && (
                      <Button style={{ marginRight: 12 }} onClick={ () => setSelectedItems([]) }>
                        Deselect all
                      </Button>
                    ) } */}
                    <Button type="primary">
                      { selected ? `Export ${ selectedItems.length } selected item${ selectedItems.length !== 1 ? "s" : "" }` : "Export" }
                    </Button>
                  </div>
                )
              } }
            />
          </Space>
          {/* <div className="cart-content-footer" style={{ paddingTop: 24, marginBottom: -8, borderTop: "1px solid #f0f0f0" }}>footer</div> */}
        </Content>
      </Layout>
    </Fragment>
  )
}