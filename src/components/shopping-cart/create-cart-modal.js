import { useEffect, useState } from 'react'
import { Modal, Space, Form, Input, Typography } from 'antd'
import { StarOutlined, StarFilled, StarTwoTone } from '@ant-design/icons'
import { useShoppingCart } from '../../contexts'

const { Text, Paragraph } = Typography

export const CreateCartModal = ({ visible, onVisibleChange }) => {
    const { carts, addCart, setActiveCart } = useShoppingCart()
  
    /** Form state */
    const [cartName, setCartName] = useState("")
    const [cartNameError, setCartNameError] = useState(false)
    const [favorited, setFavorited] = useState(false)
    
    useEffect(() => {
      setCartName("")
      setFavorited(false)
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
        addCart(cartName, {
          favorited
        })
        setActiveCart(cartName)
        onVisibleChange(false)
      }
    }

    const StarIcon = favorited ? StarFilled : StarOutlined
  
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <Input
                  placeholder="Cart name..."
                  value={ cartName }
                  onChange={ (e) => setCartName(e.target.value) }
                  onKeyDown={ (e) => e.key === "Enter" && createShoppingCart() }
                />
                <StarIcon
                  className="icon-btn"
                  onClick={ () => setFavorited(!favorited) }
                  style={{
                    fontSize: 16,
                    marginLeft: 16,
                    color: favorited ? "#1890ff" : undefined
                  }}
                />
              </div>
            </Form.Item>
          </Space>
          <Paragraph>
            Add items to a cart to...
          </Paragraph>
        </Space>
      </Modal>
    )
  }