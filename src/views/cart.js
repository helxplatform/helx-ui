import { Fragment } from 'react'
import { Typography } from 'antd'
import { useShoppingCart } from '../contexts'

const { Title } = Typography

export const ShoppingCartView = () => {
  const { cart } = useShoppingCart()

  return (
    <Fragment>
      <Title level={ 1 }>Shopping Cart</Title>
      <pre style={{ fontSize: '80%', backgroundColor: '#333', color: '#eee', padding: '1rem' }}>
        { JSON.stringify(cart, null, 2) }
      </pre>
    </Fragment>
  )
}