import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal, Space, Form, Input, Typography } from 'antd'
import { StarOutlined, StarFilled, StarTwoTone } from '@ant-design/icons'

const { Text, Paragraph } = Typography

const CreateCardModalContent = ({ createShoppingCart, cartName, setCartName, cartNameError, favorited, setFavorited }) => {
  const inputRef = useRef()

  const StarIcon = favorited ? StarFilled : StarOutlined

  useEffect(() => {
    // Autofocus input
    inputRef.current.focus({
      cursor: "end"
    })
  }, [])

  // Workaround for antd bug where Tooltip-based elements will close when interacting with a modal.
  // Only occurs when the modal is not a child of the active Tooltip-based component.
  useEffect(() => {
    // This component is a child of the modal, so the modal wrapper is guarenteed to exist on mount.
    const modalWrapper = document.querySelector(".cart-creation-modal-wrapper")
    const modalMask = modalWrapper.parentNode
    const modalRoot = modalMask.parentNode
    const modalDOMRoot = modalRoot.parentNode

    const stopPropagation = (e) => {
      e.stopPropagation()
    }
    modalDOMRoot.addEventListener("mousedown", stopPropagation)
    
    return () => {
      modalDOMRoot.removeEventListener("mousedown", stopPropagation)
    }
  }, [])

  return (
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
              ref={inputRef}
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
  )
}

export const CreateCartModal = ({ carts, visible, onVisibleChange, onConfirm }) => {
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
  
    const createShoppingCart = useCallback(() => {
      if (carts.find((cart) => cart.name === cartName)) {
        setCartNameError(true)
      } else {
        onConfirm(cartName, favorited)
      }
    }, [carts, cartName, onConfirm])
  
    return (
      <Modal
        title="Create a cart"
        okText="Create"
        cancelText="Cancel"
        destroyOnClose={ true }
        width={ 400 }
        visible={ visible }
        onVisibleChange={ onVisibleChange }
        onOk={ createShoppingCart }
        onCancel={ () => onVisibleChange(false) }
        zIndex={1032}
        maskStyle={{ zIndex: 1031 }}
        wrapClassName="cart-creation-modal-wrapper"
      >
        <CreateCardModalContent
          cartName={cartName}
          setCartName={setCartName}
          cartNameError={cartNameError}
          favorited={favorited}
          setFavorited={setFavorited}
          createShoppingCart={createShoppingCart}
        />
      </Modal>
    )
  }