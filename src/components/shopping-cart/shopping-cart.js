import { Fragment } from 'react'
import { Space, Layout, Typography, Menu, Button, Checkbox, Dropdown } from 'antd'
import { ShoppingCartOutlined, DeleteOutlined, FolderAddOutlined, CopyOutlined, CaretDownOutlined } from '@ant-design/icons'
import { CartList, useShoppingCart } from 'antd-shopping-cart'
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
            renderExtra={ ({ selectedItems, setSelectedItems }) => {
              const selected = selectedItems.length > 0
              const allSelected = selectedItems.length === activeCart.items.length
              const indeterminateSelection = selected && !allSelected
              const deselectAll = () => setSelectedItems([])
              const selectAll = () => setSelectedItems(activeCart.items.map((item) => item.id))
              return (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div className="selected-buttons" style={{ flex: 1 }}>
                    <Button.Group>
                      <Button
                        className="selected-item-checkbox-button"
                        type="text"
                        size="large"
                        style={{ padding: "0 4px" }}
                        onClick={ () => {
                          if (selected) deselectAll()
                          else selectAll()
                        } }
                      >
                        <Space>
                          <Checkbox
                            className="selected-item-checkbox"
                            indeterminate={ indeterminateSelection }
                            checked={ allSelected }
                            />
                        </Space>
                      </Button>
                      <Dropdown
                        placement="topRight"
                        trigger="click"
                        overlay={ (
                          <Menu
                            items={[
                              {
                                label: "All",
                                key: 1,
                                onClick: selectAll
                              },
                              {
                                label:  "None",
                                key: 2,
                                onClick: deselectAll
                              },
                              ...buckets.map((bucket) => ({
                                  label: `${ bucket.name }`,
                                  key: `all-${ bucket.id }`,
                                  onClick: () => setSelectedItems(activeCart.items.filter((item) => item.bucketId === bucket.id).map((item) => item.id))
                                }))
                            ]}
                          />
                        ) }
                      >
                        <Button type="text" size="large" style={{ padding: "0 2px" }}>
                          <CaretDownOutlined style={{ fontSize: 10, paddingBottom: 2 }} />
                        </Button>
                      </Dropdown>
                    </Button.Group>
                    { selected && (
                      <Fragment>
                        <Button type="text" size="large" style={{ marginLeft: 8 }} icon={ <DeleteOutlined /> } onClick={ () => null } />
                        <Button type="text" size="large" style={{ marginLeft: 8 }} icon={ <FolderAddOutlined /> } onClick={ () => null } />
                        <Button type="text" size="large" style={{ marginLeft: 8 }} icon={ <CopyOutlined /> } onClick={ () => null } />
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
      </Content>
    </Layout>
  )
}