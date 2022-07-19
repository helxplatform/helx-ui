import { Badge, Button, Popover, Space, List, Typography } from 'antd'

const { Title, Text } = Typography

export const ShoppingCartPopover = ({ visible, onVisibleChange, children }) => {
  return (
    <Badge count={0} offset={[-8, 0]}>
      <Popover
        title={
          <Title level={5} type="secondary" style={{ marginTop: 8, marginBottom: 8 }}>Shopping Cart</Title>
        }
        content={
          <Space direction="vertical">
            <List
            />
            <Space style={{ justifyContent: "flex-end" }}>
              <Button type="primary">
                Checkout
              </Button>
            </Space>
          </Space>
        }
        placement="bottomLeft"
        trigger="click"
        visible={ visible }
        onVisibleChange={ onVisibleChange }
      >
        { children }
      </Popover>
    </Badge>
  )
}