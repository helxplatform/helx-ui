import { useEffect, useState } from 'react'
import { Modal, Space, Form, Input, Typography } from 'antd'
import { useShoppingCart } from '../../contexts'

const { Text, Paragraph } = Typography

export const CreateCartModal = ({ visible, onVisibleChange }) => {
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